from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import (
    AvailableSlot,
    Booking,
    Course,
    Lesson,
    MentorshipPackage,
    Subscription,
    User,
    Writer,
)

class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (("Role", {"fields": ("role",)}),)
    add_fieldsets = UserAdmin.add_fieldsets + (("Role", {"fields": ("role",)}),)
    list_display = ("username", "email", "role", "is_staff", "is_superuser")

admin.site.register(User, CustomUserAdmin)
admin.site.register(Course)
admin.site.register(Lesson)
admin.site.register(Subscription)
admin.site.register(Writer)
admin.site.register(MentorshipPackage)
admin.site.register(Booking)
admin.site.register(AvailableSlot)

# Register your models here.
