from django.contrib import admin
from .models import AnnotationImage, Polygon


@admin.register(AnnotationImage)
class AnnotationImageAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'user', 'order', 'created_at')
    list_filter = ('user',)
    search_fields = ('name', 'user__email')
    ordering = ('user', 'order', 'created_at')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(Polygon)
class PolygonAdmin(admin.ModelAdmin):
    list_display = ('id', 'image', 'user', 'label', 'color', 'created_at')
    list_filter = ('user', 'label')
    search_fields = ('label', 'user__email', 'image__name')
    ordering = ('image', 'created_at')
    readonly_fields = ('created_at', 'updated_at')
