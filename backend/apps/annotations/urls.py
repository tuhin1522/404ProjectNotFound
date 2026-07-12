from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AnnotationImageViewSet, PolygonViewSet, AnnotationLabelViewSet

router = DefaultRouter(trailing_slash='/?')
router.register(r'images', AnnotationImageViewSet, basename='annotation-image')
router.register(r'polygons', PolygonViewSet, basename='polygon')
router.register(r'labels', AnnotationLabelViewSet, basename='annotation-label')

urlpatterns = [
    path('', include(router.urls)),
]
