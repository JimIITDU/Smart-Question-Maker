from django.contrib import admin
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

User = get_user_model()


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    # 👉 Columns shown in admin list view
    list_display = (
        'id',
        'username',
        'email',
        'total_score',
        'total_sessions',
        'is_staff',
        'is_active',
        'created_at'
    )

    # 👉 Search functionality
    search_fields = ('username', 'email')

    # 👉 Filters on right side
    list_filter = ('is_staff', 'is_active', 'created_at')

    # 👉 Default ordering
    ordering = ('-created_at',)

    # 👉 Fields shown in detail/edit page
    fieldsets = (
        ('User Info', {
            'fields': ('username', 'email', 'password')
        }),
        ('Permissions', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')
        }),
        ('Statistics', {
            'fields': ('total_score', 'total_sessions')
        }),
        ('Important Dates', {
            'fields': ('last_login', 'created_at')
        }),
    )

    # 👉 Fields when creating new user
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'password1', 'password2', 'is_staff', 'is_active'),
        }),
    )