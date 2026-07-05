from django.contrib import admin
from .models import Task


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'column', 'priority', 'due_date', 'order')
    list_filter = ('column', 'priority', 'due_date')
    search_fields = ('title', 'description', 'user__email')
    ordering = ('order', '-created_at')
