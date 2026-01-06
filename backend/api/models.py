from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    ROLE_CHOICES = [
        ("instructor", "Instructor"),
        ("writer", "Writer"),
        ("student", "Student"),
        ("manager", "Manager"),
    ]

    role = models.CharField(max_length=16, choices=ROLE_CHOICES, default="student")

    def __str__(self):
        return self.username


class Course(models.Model):
    TYPE_CHOICES = [
        ("free", "Free"),
        ("paid", "Paid"),
        ("mixed", "Mixed"),
    ]
    LEVEL_CHOICES = [
        ("beginner", "Beginner"),
        ("intermediate", "Intermediate"),
        ("advanced", "Advanced"),
    ]

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    image_url = models.URLField(blank=True)
    image_file = models.ImageField(upload_to="courses/", blank=True, null=True)
    instructor = models.CharField(max_length=255)
    type = models.CharField(max_length=16, choices=TYPE_CHOICES)
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    requirements = models.TextField(blank=True)
    category = models.CharField(max_length=100, blank=True)
    duration = models.CharField(max_length=100, blank=True)
    level = models.CharField(max_length=16, choices=LEVEL_CHOICES, blank=True)
    published = models.BooleanField(default=True)

    def __str__(self):
        return self.title


class Lesson(models.Model):
    TYPE_CHOICES = [
        ("video", "Video"),
        ("exercise", "Exercise"),
        ("live", "Live"),
    ]

    course = models.ForeignKey(Course, related_name="lessons", on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    type = models.CharField(max_length=16, choices=TYPE_CHOICES)
    video_url = models.URLField(blank=True)
    content = models.TextField(blank=True)
    is_free = models.BooleanField(default=False)
    order = models.PositiveIntegerField()
    duration = models.CharField(max_length=100, blank=True)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return f"{self.course.title} - {self.title}"


class Subscription(models.Model):
    PAYMENT_STATUS_CHOICES = [
        ("pending", "Pending"),
        ("completed", "Completed"),
        ("failed", "Failed"),
    ]

    user_email = models.EmailField()
    course = models.ForeignKey(Course, related_name="subscriptions", on_delete=models.CASCADE)
    course_title = models.CharField(max_length=255, blank=True)
    payment_status = models.CharField(
        max_length=16, choices=PAYMENT_STATUS_CHOICES, default="pending"
    )
    payment_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    payment_date = models.DateField(null=True, blank=True)
    expiry_date = models.DateField(null=True, blank=True)

    def __str__(self):
        return f"{self.user_email} - {self.course.title}"


class Writer(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        related_name="writer_profile",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )
    name = models.CharField(max_length=255)
    bio = models.TextField()
    image_url = models.URLField(blank=True)
    image_file = models.ImageField(upload_to="writers/", blank=True, null=True)
    specialty = models.CharField(max_length=255)
    email = models.EmailField(blank=True)
    experience = models.CharField(max_length=255, blank=True)
    achievements = models.TextField(blank=True)
    active = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class MentorshipPackage(models.Model):
    writer = models.ForeignKey(Writer, related_name="packages", on_delete=models.CASCADE)
    writer_name = models.CharField(max_length=255, blank=True)
    name = models.CharField(max_length=255, blank=True)
    sessions_count = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True)
    session_duration = models.CharField(max_length=100, blank=True)
    benefits = models.JSONField(default=list, blank=True)

    def __str__(self):
        return f"{self.writer.name} - {self.name or 'Package'}"


class Booking(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("confirmed", "Confirmed"),
        ("completed", "Completed"),
        ("cancelled", "Cancelled"),
    ]
    PAYMENT_STATUS_CHOICES = [
        ("pending", "Pending"),
        ("completed", "Completed"),
        ("failed", "Failed"),
    ]

    user_email = models.EmailField()
    user_name = models.CharField(max_length=255, blank=True)
    writer = models.ForeignKey(Writer, related_name="bookings", on_delete=models.CASCADE)
    writer_name = models.CharField(max_length=255, blank=True)
    writer_email = models.EmailField(blank=True)
    package = models.ForeignKey(
        MentorshipPackage, related_name="bookings", on_delete=models.CASCADE
    )
    sessions_count = models.PositiveIntegerField(default=0)
    session_date = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=16, choices=STATUS_CHOICES, default="pending")
    payment_status = models.CharField(
        max_length=16, choices=PAYMENT_STATUS_CHOICES, default="pending"
    )
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"{self.user_email} - {self.writer.name}"


class AvailableSlot(models.Model):
    writer = models.ForeignKey(Writer, related_name="available_slots", on_delete=models.CASCADE)
    package = models.ForeignKey(
        MentorshipPackage,
        related_name="available_slots",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )
    date = models.DateField()
    time = models.CharField(max_length=50)
    is_available = models.BooleanField(default=True)
    booking = models.ForeignKey(
        Booking, related_name="slots", on_delete=models.SET_NULL, null=True, blank=True
    )

    def __str__(self):
        return f"{self.writer.name} - {self.date} {self.time}"
