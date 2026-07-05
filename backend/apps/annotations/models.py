"""
annotations/models.py

Two models:
  - AnnotationImage  — a user-uploaded image file + display metadata
  - Polygon          — a drawn polygon on an image (list of {x, y} points)

Design notes
------------
* Images are stored on disk (MEDIA_ROOT/annotations/<user_id>/<filename>).
  A custom upload_to callable keeps files separated per user.
* Polygons store their point list as JSONField so the frontend can
  push/pull the raw coordinate array without any impedance mismatch.
* Both models carry a `user` FK so the IsOwner permission can gate access
  at the object level, and get_queryset() can filter at the list level.
"""
import os
from django.db import models
from django.conf import settings
from apps.common.models import TimeStampedModel


def image_upload_path(instance, filename):
    """Store uploads under  media/annotations/<user_id>/<original_name>"""
    return os.path.join('annotations', str(instance.user_id), filename)


class AnnotationImage(TimeStampedModel):
    """
    A single uploaded image belonging to a user.

    `order` is a client-managed integer that lets the frontend preserve
    the slide-show sequence the user arranged.
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='annotation_images',
    )
    image = models.ImageField(upload_to=image_upload_path)
    name = models.CharField(
        max_length=255,
        blank=True,
        help_text='Human-readable label; defaults to the original filename.',
    )
    order = models.PositiveIntegerField(
        default=0,
        help_text='Client-controlled display order in the image strip.',
    )

    class Meta:
        ordering = ['order', 'created_at']
        verbose_name = 'Annotation Image'
        verbose_name_plural = 'Annotation Images'
        indexes = [
            models.Index(fields=['user', 'order']),
        ]

    def save(self, *args, **kwargs):
        # Auto-populate `name` from the filename on first save
        if not self.name and self.image:
            self.name = os.path.basename(self.image.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"[{self.pk}] {self.name} — {self.user.email}"


class Polygon(TimeStampedModel):
    """
    A single drawn polygon on an AnnotationImage.

    `points` is a list of {x, y} dicts — e.g.
      [{"x": 0.1, "y": 0.2}, {"x": 0.5, "y": 0.6}, ...]

    Coordinates are stored as **relative** values (0.0–1.0) so that
    the frontend can scale them to any canvas size without needing to
    know the original image dimensions.

    `label` is an optional text tag (e.g. "car", "person") that lets
    annotation workflows categorise shapes.

    `color` stores the hex colour string chosen in the UI so the same
    colour is restored when the annotation is reloaded.
    """
    image = models.ForeignKey(
        AnnotationImage,
        on_delete=models.CASCADE,
        related_name='polygons',
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='polygons',
    )
    points = models.JSONField(
        help_text='List of {x, y} dicts with relative coordinates (0.0–1.0).',
    )
    label = models.CharField(max_length=100, blank=True, default='')
    color = models.CharField(max_length=20, blank=True, default='#6366f1')

    class Meta:
        ordering = ['created_at']
        verbose_name = 'Polygon'
        verbose_name_plural = 'Polygons'
        indexes = [
            models.Index(fields=['image']),
        ]

    def __str__(self):
        return f"Polygon {self.pk} on Image {self.image_id} [{self.label or 'unlabelled'}]"
