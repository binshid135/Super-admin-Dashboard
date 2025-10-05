from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    CustomTokenObtainPairView,
    RegisterView,
    UserListView,
    UserDetailView,
    change_password,
    password_reset_request,
    password_reset_verify,
    UserDeleteView
)

urlpatterns = [
    # Auth
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Users
    path('users/', UserListView.as_view(), name='user-list'),
    path('profile/', UserDetailView.as_view(), name='user-profile'),
    path('change-password/', change_password, name='change-password'),
    
    # Password Reset
    path('password-reset/', password_reset_request, name='password-reset-request'),
    path('password-reset/verify/', password_reset_verify, name='password-reset-verify'),
    path('users/delete/', UserDeleteView.as_view(), name='user-delete'),
]