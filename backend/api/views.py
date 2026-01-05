from django.contrib.auth import authenticate, get_user_model, login, logout
from django.middleware.csrf import get_token
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
        if not email or not password:
            return Response({"detail": "Missing credentials."}, status=400)

        User = get_user_model()
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
        )
        login(request, user)
        return Response({"detail": "Registered.", "username": user.username}, status=201)


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response(
            {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "full_name": user.get_full_name() or user.username,
                "role": user.role,
            }
        )


class CourseViewSet(ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer


class LessonViewSet(ModelViewSet):
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer


class SubscriptionViewSet(ModelViewSet):
    queryset = Subscription.objects.all()
    serializer_class = SubscriptionSerializer


class WriterViewSet(ModelViewSet):
    queryset = Writer.objects.all()
    serializer_class = WriterSerializer


class MentorshipPackageViewSet(ModelViewSet):
    queryset = MentorshipPackage.objects.all()
    serializer_class = MentorshipPackageSerializer


class BookingViewSet(ModelViewSet):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer


class AvailableSlotViewSet(ModelViewSet):
    queryset = AvailableSlot.objects.all()
    serializer_class = AvailableSlotSerializer
