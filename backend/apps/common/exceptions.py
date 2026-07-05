"""
common/exceptions.py

Custom DRF exception handler that returns consistent, structured
error responses across the entire API.

Every error response follows the shape:
  {
    "status": "error",
    "code": 400,
    "message": "...",
    "errors": { ... }   # field-level errors when applicable
  }
"""
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status


def custom_exception_handler(exc, context):
    # Let DRF build the default response first
    response = exception_handler(exc, context)

    import logging
    logger = logging.getLogger('django')

    if response is not None:
        error_detail = response.data

        # Flatten field-level errors vs. non-field errors
        if isinstance(error_detail, dict):
            message = error_detail.pop('detail', None)
            errors = error_detail if error_detail else {}
        elif isinstance(error_detail, list):
            message = ' '.join(str(e) for e in error_detail)
            errors = {}
        else:
            message = str(error_detail)
            errors = {}

        response.data = {
            'status': 'error',
            'code': response.status_code,
            'message': message or 'An error occurred.',
            'errors': errors,
        }
    else:
        # Unhandled Python Exception (HTTP 500)
        logger.exception(exc)
        return Response({
            'status': 'error',
            'code': status.HTTP_500_INTERNAL_SERVER_ERROR,
            'message': 'An unexpected server error occurred.',
            'errors': {},
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return response
