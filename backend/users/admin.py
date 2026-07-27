from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Ward

admin.site.register(Ward)
admin.site.register(User, UserAdmin)