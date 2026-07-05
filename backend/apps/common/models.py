"""
common/models.py

Abstract base model every app's model should inherit from.
Gives every table a UUID primary key (safer for public APIs than
sequential integers), plus created_at / updated_at timestamps.
"""
import uuid
from django.db import models


class TimeStampedModel(models.Model):
    """
    Abstract mixin that adds created_at and updated_at to any model.
    Inherit from this instead of models.Model wherever you need audit fields.
    """
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
        ordering = ['-created_at']
