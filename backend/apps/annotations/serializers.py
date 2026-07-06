"""
annotations/serializers.py

Three serializers:
  - PolygonSerializer            — full CRUD for a single polygon
  - AnnotationImageSerializer    — read (list / detail) with nested polygons
  - AnnotationImageUploadSerializer — write-only; accepts the image file
"""
from rest_framework import serializers
from .models import AnnotationImage, Polygon, AnnotationLabel


# ---------------------------------------------------------------------------
# Polygon
# ---------------------------------------------------------------------------

class PolygonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Polygon
        fields = ['id', 'image', 'points', 'label', 'color', 'label_position', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_points(self, value):
        """
        Ensure points is a non-empty list of {x, y} dicts with
        numeric values in the [0.0, 1.0] range.
        """
        if not isinstance(value, list) or len(value) < 3:
            raise serializers.ValidationError(
                'A polygon must have at least 3 points.'
            )
        for idx, pt in enumerate(value):
            if not isinstance(pt, dict) or 'x' not in pt or 'y' not in pt:
                raise serializers.ValidationError(
                    f'Point {idx} must be an object with "x" and "y" keys.'
                )
            x, y = pt['x'], pt['y']
            if not (isinstance(x, (int, float)) and isinstance(y, (int, float))):
                raise serializers.ValidationError(
                    f'Point {idx}: x and y must be numbers.'
                )
            if not (0.0 <= x <= 1.0 and 0.0 <= y <= 1.0):
                raise serializers.ValidationError(
                    f'Point {idx}: x and y must be relative coordinates in [0, 1].'
                )
        return value

    def validate_image(self, image):
        """Ensure the image belongs to the requesting user."""
        request = self.context.get('request')
        if request and image.user != request.user:
            raise serializers.ValidationError(
                'You can only annotate your own images.'
            )
        return image

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


# ---------------------------------------------------------------------------
# AnnotationLabel
# ---------------------------------------------------------------------------

class AnnotationLabelSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnnotationLabel
        fields = ['id', 'name', 'color', 'created_at']
        read_only_fields = ['id', 'created_at']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


# ---------------------------------------------------------------------------
# AnnotationImage — read (with nested polygons)
# ---------------------------------------------------------------------------

class AnnotationImageSerializer(serializers.ModelSerializer):
    """
    Full representation: includes the URL to the image file and all
    polygons nested inline.  Used for GET /images/ and GET /images/<id>/.
    """
    image_url = serializers.SerializerMethodField()
    polygons = PolygonSerializer(many=True, read_only=True)
    polygon_count = serializers.IntegerField(source='polygons.count', read_only=True)

    class Meta:
        model = AnnotationImage
        fields = [
            'id', 'name', 'image_url', 'order',
            'polygon_count', 'polygons',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None


# ---------------------------------------------------------------------------
# AnnotationImage — write (upload)
# ---------------------------------------------------------------------------

class AnnotationImageUploadSerializer(serializers.ModelSerializer):
    """
    Accepts multipart/form-data with an `image` field.
    Returned response uses AnnotationImageSerializer so the client
    immediately gets the full representation after upload.
    """
    class Meta:
        model = AnnotationImage
        fields = ['id', 'image', 'name', 'order']
        read_only_fields = ['id']

    def validate_image(self, value):
        max_size_mb = 10
        if value.size > max_size_mb * 1024 * 1024:
            raise serializers.ValidationError(
                f'Image size must be under {max_size_mb} MB.'
            )
        allowed_types = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
        if value.content_type not in allowed_types:
            raise serializers.ValidationError(
                'Only JPEG, PNG, WebP, and GIF images are accepted.'
            )
        return value

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


# ---------------------------------------------------------------------------
# Bulk reorder
# ---------------------------------------------------------------------------

class ImageReorderSerializer(serializers.Serializer):
    """Used by the /images/reorder/ action."""
    id = serializers.IntegerField()
    order = serializers.IntegerField(min_value=0)
