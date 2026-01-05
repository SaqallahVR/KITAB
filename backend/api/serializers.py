from rest_framework import serializers

from .models import (
    AvailableSlot,
    Booking,
    Course,
    Lesson,
    MentorshipPackage,
    Subscription,
    Writer,
)


class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = [
            "id",
            "title",
            "description",
            "image_url",
            "image_file",
            "instructor",
            "type",
            "price",
            "requirements",
            "category",
            "duration",
            "level",
            "published",
        ]


class LessonSerializer(serializers.ModelSerializer):
    course_id = serializers.PrimaryKeyRelatedField(source="course", queryset=Course.objects.all())

    class Meta:
        model = Lesson
        fields = [
            "id",
            "course_id",
            "title",
            "description",
            "type",
            "video_url",
            "content",
            "is_free",
            "order",
            "duration",
        ]


class SubscriptionSerializer(serializers.ModelSerializer):
    course_id = serializers.PrimaryKeyRelatedField(source="course", queryset=Course.objects.all())

    class Meta:
        model = Subscription
        fields = [
            "id",
            "user_email",
            "course_id",
            "course_title",
            "payment_status",
            "payment_amount",
            "payment_date",
            "expiry_date",
        ]


class WriterSerializer(serializers.ModelSerializer):
    user_id = serializers.PrimaryKeyRelatedField(source="user", read_only=True)

    class Meta:
        model = Writer
        fields = [
            "id",
            "user_id",
            "name",
            "bio",
            "image_url",
            "image_file",
            "specialty",
            "email",
            "experience",
            "achievements",
            "active",
        ]


class MentorshipPackageSerializer(serializers.ModelSerializer):
    writer_id = serializers.PrimaryKeyRelatedField(source="writer", queryset=Writer.objects.all())

    class Meta:
        model = MentorshipPackage
        fields = [
            "id",
            "writer_id",
            "writer_name",
            "name",
            "sessions_count",
            "price",
            "description",
            "session_duration",
            "benefits",
        ]


class BookingSerializer(serializers.ModelSerializer):
    writer_id = serializers.PrimaryKeyRelatedField(source="writer", queryset=Writer.objects.all())
    package_id = serializers.PrimaryKeyRelatedField(
        source="package", queryset=MentorshipPackage.objects.all()
    )

    class Meta:
        model = Booking
        fields = [
            "id",
            "user_email",
            "user_name",
            "writer_id",
            "writer_name",
            "writer_email",
            "package_id",
            "sessions_count",
            "session_date",
            "status",
            "payment_status",
            "notes",
        ]


class AvailableSlotSerializer(serializers.ModelSerializer):
    writer_id = serializers.PrimaryKeyRelatedField(source="writer", queryset=Writer.objects.all())
    booking_id = serializers.PrimaryKeyRelatedField(
        source="booking", queryset=Booking.objects.all(), required=False, allow_null=True
    )

    class Meta:
        model = AvailableSlot
        fields = [
            "id",
            "writer_id",
            "date",
            "time",
            "is_available",
            "booking_id",
        ]
