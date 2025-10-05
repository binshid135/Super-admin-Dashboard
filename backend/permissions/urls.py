from django.urls import path
from .views import (
    PermissionListCreateView, 
    PermissionDetailView, 
    update_user_permissions,
    get_my_permissions
)

urlpatterns = [
    path("", PermissionListCreateView.as_view(), name="permissions-list-create"),
    path("<int:pk>/", PermissionDetailView.as_view(), name="permissions-detail"),
    path("update/", update_user_permissions, name="update-user-permissions"),
    path("my-permissions/", get_my_permissions, name="my-permissions"),
]