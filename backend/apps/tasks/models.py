from django.db import models
from django.conf import settings
from apps.common.models import TimeStampedModel


class Task(TimeStampedModel):
    COLUMN_CHOICES = [
        ('todo', 'To Do'),
        ('in_progress', 'In Progress'),
        ('done', 'Done'),
    ]

    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='tasks',
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    column = models.CharField(max_length=20, choices=COLUMN_CHOICES, default='todo')
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    due_date = models.DateField()
    tags = models.JSONField(default=list, blank=True)
    order = models.PositiveIntegerField(default=0)
    
    # created_at and updated_at are inherited from TimeStampedModel

    class Meta:
        ordering = ['order', '-created_at']
        indexes = [
            models.Index(fields=['user', 'due_date']),
            models.Index(fields=['user', 'order']),
        ]

    def __str__(self) -> str:
        return f"{self.title} [{self.column}] — {self.user.email}"
