from django.urls import re_path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import RegisterView, UserDetailView

urlpatterns = [
    re_path(r'^login/?$', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    re_path(r'^login/refresh/?$', TokenRefreshView.as_view(), name='token_refresh'),
    re_path(r'^register/?$', RegisterView.as_view(), name='register'),
    re_path(r'^me/?$', UserDetailView.as_view(), name='user_detail'),
]