from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from .models import Task
from .serializers import TaskSerializer


class TaskViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing tasks.

    Supports filtering by due_date via query param:
      GET /api/tasks/?due_date=2025-07-04

    Also supports bulk reorder via:
      PATCH /api/tasks/reorder/
    """
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = Task.objects.filter(user=self.request.user)
        due_date = self.request.query_params.get('due_date')
        if due_date:
            qs = qs.filter(due_date=due_date)
        return qs

    @action(detail=False, methods=['patch'], url_path='reorder')
    def reorder(self, request) -> Response:
        """
        Expects a list of {id, order, column} objects and updates them in bulk.
        Body: [{ "id": 1, "column": "todo", "order": 0 }, ...]
        """
        items = request.data
        if not isinstance(items, list):
            return Response({'error': 'Expected a list.'}, status=status.HTTP_400_BAD_REQUEST)

        # Map requested updates by task ID for quick lookup
        updates_by_id = {item.get('id'): item for item in items if item.get('id')}
        if not updates_by_id:
            return Response({'updated': []})

        # Fetch only the tasks that belong to the user and are in the request
        tasks_to_update = list(Task.objects.filter(pk__in=updates_by_id.keys(), user=request.user))
        
        updated_ids = []
        now = timezone.now()

        for task in tasks_to_update:
            item = updates_by_id[task.id]
            task.column = item.get('column', task.column)
            task.order = item.get('order', task.order)
            task.updated_at = now
            updated_ids.append(task.id)

        if tasks_to_update:
            Task.objects.bulk_update(tasks_to_update, ['column', 'order', 'updated_at'])

        return Response({'updated': updated_ids})
