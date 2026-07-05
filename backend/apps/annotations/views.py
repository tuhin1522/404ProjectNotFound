"""
annotations/views.py

Two ViewSets wired up via a DRF router:

  AnnotationImageViewSet  →  /api/annotations/images/
    GET    /images/              — list user's images (ordered)
    POST   /images/              — upload a new image  (multipart/form-data)
    GET    /images/<id>/         — retrieve image + all its polygons
    PATCH  /images/<id>/         — rename / reorder a single image
    DELETE /images/<id>/         — delete image file + DB record
    PATCH  /images/reorder/      — bulk update order values

  PolygonViewSet  →  /api/annotations/polygons/
    GET    /polygons/            — list polygons (filter by ?image=<id>)
    POST   /polygons/            — create a polygon
    GET    /polygons/<id>/       — retrieve single polygon
    PUT    /polygons/<id>/       — replace polygon (e.g. reshape)
    PATCH  /polygons/<id>/       — partial update (e.g. change label/color)
    DELETE /polygons/<id>/       — remove polygon from the image
"""
from django.db import transaction
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.common.permissions import IsOwner
from apps.common.pagination import StandardPagination

from .models import AnnotationImage, Polygon
from .serializers import (
    AnnotationImageSerializer,
    AnnotationImageUploadSerializer,
    ImageReorderSerializer,
    PolygonSerializer,
)


# ---------------------------------------------------------------------------
# AnnotationImage ViewSet
# ---------------------------------------------------------------------------

class AnnotationImageViewSet(viewsets.ModelViewSet):
    """
    Manage a user's library of annotation images.

    * Upload uses multipart/form-data; all other actions use JSON.
    * Responses always go through AnnotationImageSerializer (includes
      nested polygons) — the upload serializer is only used for validation
      + creation.
    * `IsOwner` is applied at the object level so users can never touch
      another user's images even if they guess the ID.
    """
    permission_classes = [IsAuthenticated, IsOwner]
    pagination_class = StandardPagination
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        return (
            AnnotationImage.objects
            .filter(user=self.request.user)
            .prefetch_related('polygons')
        )

    def get_serializer_class(self):
        if self.action == 'create':
            return AnnotationImageUploadSerializer
        return AnnotationImageSerializer

    def create(self, request, *args, **kwargs):
        upload_serializer = AnnotationImageUploadSerializer(
            data=request.data,
            context={'request': request},
        )
        upload_serializer.is_valid(raise_exception=True)
        instance = upload_serializer.save()

        # Return the full representation (with polygons array, image_url, etc.)
        out_serializer = AnnotationImageSerializer(
            instance,
            context={'request': request},
        )
        return Response(out_serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['patch'], url_path='reorder')
    def reorder(self, request) -> Response:
        """
        Bulk-update the `order` field for multiple images.

        Body:  [{"id": 1, "order": 0}, {"id": 3, "order": 1}, ...]
        """
        items = request.data
        if not isinstance(items, list):
            return Response(
                {'error': 'Expected a list of {id, order} objects.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = ImageReorderSerializer(data=items, many=True)
        serializer.is_valid(raise_exception=True)

        updates_by_id = {item['id']: item for item in serializer.validated_data}
        if not updates_by_id:
            return Response({'updated': []})

        images_to_update = list(AnnotationImage.objects.filter(pk__in=updates_by_id.keys(), user=request.user))
        
        updated_ids = []
        now = timezone.now()

        for image in images_to_update:
            item = updates_by_id[image.id]
            image.order = item['order']
            image.updated_at = now
            updated_ids.append(image.id)

        if images_to_update:
            AnnotationImage.objects.bulk_update(images_to_update, ['order', 'updated_at'])

        return Response({'updated': updated_ids})


# ---------------------------------------------------------------------------
# Polygon ViewSet
# ---------------------------------------------------------------------------

class PolygonViewSet(viewsets.ModelViewSet):
    """
    CRUD for polygons drawn on images.

    Filter by image:  GET /api/annotations/polygons/?image=<image_id>

    All object-level operations are protected by IsOwner so a user
    cannot delete/modify another user's polygon even if they know the ID.
    """
    serializer_class = PolygonSerializer
    permission_classes = [IsAuthenticated, IsOwner]
    parser_classes = [JSONParser]

    def get_queryset(self):
        qs = Polygon.objects.filter(user=self.request.user).select_related('image')

        image_id = self.request.query_params.get('image')
        if image_id:
            qs = qs.filter(image_id=image_id)

        return qs

    @action(detail=False, methods=['delete'], url_path='clear')
    def clear(self, request):
        """
        Delete ALL polygons for a specific image.
        Required query param:  ?image=<image_id>

        Useful for a "clear canvas" button on the frontend.
        """
        image_id = request.query_params.get('image')
        if not image_id:
            return Response(
                {'error': 'Query param `image` is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Only delete polygons the user owns
        deleted_count, _ = Polygon.objects.filter(
            image_id=image_id,
            user=request.user,
        ).delete()

        return Response({'deleted': deleted_count})
