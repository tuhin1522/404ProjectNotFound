"""
common/permissions.py

Project-wide DRF permission helpers beyond the default IsAuthenticated.
"""
from rest_framework.permissions import BasePermission


class IsOwner(BasePermission):
    """
    Object-level permission: only the owner of an object may access it.
    The model must expose a `user` FK field.
    """
    message = 'You do not have permission to access this resource.'

    def has_object_permission(self, request, view, obj):
        return obj.user == request.user
