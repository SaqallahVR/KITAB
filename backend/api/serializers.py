import base64

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


class BinaryImageMixin:
    image_data = serializers.SerializerMethodField(read_only=True)
    image_file = serializers.ImageField(write_only=True, required=False)

    def get_image_data(self, obj):
        if not obj.image_blob:
            return ""
        mime = obj.image_mime or "application/octet-stream"
        encoded = base64.b64encode(obj.image_blob).decode("ascii")
        return f"data:{mime};base64,{encoded}"

    def _apply_image(self, instance, image_file):
        if not image_file:
            return False
        instance.image_blob = image_file.read()
        instance.image_mime = getattr(image_file, "content_type", "") or "application/octet-stream"
        return True

    def create(self, validated_data):
        image_file = validated_data.pop("image_file", None)
        instance = super().create(validated_data)
        if self._apply_image(instance, image_file):
            instance.save(update_fields=["image_blob", "image_mime"])
        return instance

    def update(self, instance, validated_data):
        image_file = validated_data.pop("image_file", None)
        instance = super().update(instance, validated_data)
        if self._apply_image(instance, image_file):
            instance.save(update_fields=["image_blob", "image_mime"])
        return instance


class CourseSerializer(BinaryImageMixin, serializers.ModelSerializer):

    class Meta:
        model = Course
        fields = [
            "id",
            "title",
            "description",
            "image_url",
            "image_data",
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


class WriterSerializer(BinaryImageMixin, serializers.ModelSerializer):
    user_id = serializers.PrimaryKeyRelatedField(source="user", read_only=True)
    class Meta:
        model = Writer
        fields = [
            "id",
            "user_id",
            "name",
            "bio",
            "image_url",
            "image_data",
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
    package_id = serializers.PrimaryKeyRelatedField(
        source="package", queryset=MentorshipPackage.objects.all(), required=False, allow_null=True
    )
    booking_id = serializers.PrimaryKeyRelatedField(
        source="booking", queryset=Booking.objects.all(), required=False, allow_null=True
    )

    class Meta:
        model = AvailableSlot
        fields = [
            "id",
            "writer_id",
            "package_id",
            "date",
            "time",
            "is_available",
            "booking_id",
        ]
