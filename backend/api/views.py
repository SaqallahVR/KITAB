from django.contrib.auth import authenticate, get_user_model, login, logout
from django.middleware.csrf import get_token
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet

from .models import (
    AvailableSlot,
    Booking,
    Course,
    Lesson,
    MentorshipPackage,
    Subscription,
    Writer,
)
from .serializers import (
    AvailableSlotSerializer,
    BookingSerializer,
    CourseSerializer,
    LessonSerializer,
    MentorshipPackageSerializer,
    SubscriptionSerializer,
    WriterSerializer,
)


class HealthView(APIView):
    permission_classes = []

    def get(self, request):
        return Response({"status": "ok"})


class CsrfView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response({"csrfToken": get_token(request)})


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get("username")
        email = request.data.get("email")
        password = request.data.get("password")
        if not (username or email) or not password:
            return Response({"detail": "Missing credentials."}, status=400)

        identifier = username or email
        resolved_username = identifier
        if email or (identifier and "@" in identifier):
            User = get_user_model()
            matched = User.objects.filter(email__iexact=identifier).only("username").first()
            if matched:
                resolved_username = matched.username

        user = authenticate(request, username=resolved_username, password=password)
        if user is None:
            return Response({"detail": "Invalid credentials."}, status=401)

        login(request, user)
        return Response({"detail": "Logged in."})


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        logout(request)
        return Response({"detail": "Logged out."})


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")
        full_name = request.data.get("full_name", "").strip()
        role = request.data.get("role", "student")
        if not email or not password:
            return Response({"detail": "Missing credentials."}, status=400)

        User = get_user_model()
        valid_roles = {choice[0] for choice in User.ROLE_CHOICES}
        if role not in valid_roles:
            return Response({"detail": "Invalid role."}, status=400)
        if User.objects.filter(email__iexact=email).exists():
            return Response({"detail": "Email already registered."}, status=400)

        base_username = email.split("@")[0].replace(".", "_")
        username = base_username
        counter = 1
        while User.objects.filter(username=username).exists():
            counter += 1
            username = f"{base_username}{counter}"

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=full_name,
            role=role,
        )
        login(request, user)
        return Response({"detail": "Registered.", "username": user.username}, status=201)


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        writer_profile = getattr(user, "writer_profile", None)
        return Response(
            {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "full_name": user.get_full_name() or user.username,
                "role": user.role,
                "writer_id": writer_profile.id if writer_profile else None,
            }
        )


class QueryParamFilterMixin:
    filter_fields = ()

    def get_queryset(self):
        qs = super().get_queryset()
        if not self.filter_fields:
            return qs
        params = self.request.query_params
        filters = {}
        for field in self.filter_fields:
            if field not in params:
                continue
            value = params.get(field)
            if value is None or value == "":
                continue
            lowered = value.lower()
            if lowered in {"true", "false"}:
                value = lowered == "true"
            filters[field] = value
        return qs.filter(**filters)


class CourseViewSet(QueryParamFilterMixin, ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    filter_fields = ("id", "instructor", "type", "published", "level", "category")


class LessonViewSet(QueryParamFilterMixin, ModelViewSet):
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer
    filter_fields = ("id", "course_id", "type", "is_free")


class SubscriptionViewSet(QueryParamFilterMixin, ModelViewSet):
    queryset = Subscription.objects.all()
    serializer_class = SubscriptionSerializer
    filter_fields = ("id", "course_id", "user_email", "payment_status")


class WriterViewSet(QueryParamFilterMixin, ModelViewSet):
    queryset = Writer.objects.all()
    serializer_class = WriterSerializer
    filter_fields = ("id", "active", "email")

    def perform_create(self, serializer):
        user = self.request.user
        if user and user.is_authenticated:
            if getattr(user, "role", None) != "writer":
                raise ValidationError({"detail": "Only writer accounts can create writer profiles."})
            if Writer.objects.filter(user=user).exists():
                raise ValidationError({"detail": "Writer profile already exists."})
            serializer.save(user=user, email=serializer.validated_data.get("email") or user.email)
        else:
            serializer.save()


class MentorshipPackageViewSet(QueryParamFilterMixin, ModelViewSet):
    queryset = MentorshipPackage.objects.all()
    serializer_class = MentorshipPackageSerializer
    filter_fields = ("id", "writer_id")


class BookingViewSet(QueryParamFilterMixin, ModelViewSet):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    filter_fields = ("id", "writer_id", "package_id", "status", "payment_status", "user_email")


class AvailableSlotViewSet(QueryParamFilterMixin, ModelViewSet):
    queryset = AvailableSlot.objects.all()
    serializer_class = AvailableSlotSerializer
    filter_fields = ("id", "writer_id", "package_id", "is_available", "booking_id", "date")
