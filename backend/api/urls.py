from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    AvailableSlotViewSet,
    BookingViewSet,
    CourseViewSet,
    CsrfView,
    HealthView,
    LessonViewSet,
    LoginView,
    LogoutView,
    MeView,
    MentorshipPackageViewSet,
    RegisterView,
    SubscriptionViewSet,
    WriterViewSet,
)

router = DefaultRouter()
router.register("courses", CourseViewSet)
router.register("lessons", LessonViewSet)
router.register("subscriptions", SubscriptionViewSet)
router.register("writers", WriterViewSet)
router.register("mentorship-packages", MentorshipPackageViewSet)
router.register("bookings", BookingViewSet)
router.register("available-slots", AvailableSlotViewSet)

urlpatterns = [
    path("", include(router.urls)),
    path('health/', HealthView.as_view(), name='health'),
    path('auth/csrf/', CsrfView.as_view(), name='csrf'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path('auth/me/', MeView.as_view(), name='me'),
]
