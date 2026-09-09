from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Ward


@admin.register(Ward)
class WardAdmin(admin.ModelAdmin):
    list_display = ("number", "name")
    ordering = ("number",)


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    # Columns shown in the user list page
    list_display = ("username", "email", "role", "ward", "is_staff", "is_active")
    list_filter = ("role", "ward", "is_staff", "is_active")

    # Fields shown when editing an EXISTING user
    fieldsets = BaseUserAdmin.fieldsets + (
        ("Role Info", {"fields": ("role", "ward")}),
    )

    # Fields shown when creating a NEW user via admin "Add user" button
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ("Role Info", {"fields": ("role", "ward")}),
    )