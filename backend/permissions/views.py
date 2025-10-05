from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import PagePermission
from .serializers import PagePermissionSerializer, UpdatePermissionsSerializer
from accounts.models import CustomUser

class PermissionListCreateView(generics.ListCreateAPIView):
    queryset = PagePermission.objects.all()
    serializer_class = PagePermissionSerializer
    permission_classes = [permissions.IsAdminUser]

class PermissionDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = PagePermission.objects.all()
    serializer_class = PagePermissionSerializer
    permission_classes = [permissions.IsAdminUser]

@api_view(['POST'])
@permission_classes([permissions.IsAdminUser])
def update_user_permissions(request):
    serializer = UpdatePermissionsSerializer(data=request.data)
    if serializer.is_valid():
        user_id = serializer.validated_data['user_id']
        permissions_data = serializer.validated_data['permissions']
        
        user = get_object_or_404(CustomUser, id=user_id)
        
        # Update or create permissions for each page
        for page, perms in permissions_data.items():
            permission, created = PagePermission.objects.get_or_create(
                user=user,
                page=page,
                defaults={
                    'can_view': perms.get('view', False),
                    'can_edit': perms.get('edit', False),
                    'can_create': perms.get('create', False),
                    'can_delete': perms.get('delete', False)
                }
            )
            
            if not created:
                permission.can_view = perms.get('view', False)
                permission.can_edit = perms.get('edit', False)
                permission.can_create = perms.get('create', False)
                permission.can_delete = perms.get('delete', False)
                permission.save()
        
        return Response({
            "message": "Permissions updated successfully",
            "user_id": str(user_id),  # Convert UUID to string for JSON serialization
            "permissions": permissions_data
        })
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_my_permissions(request):
    user = request.user
    
    if user.role == 'superadmin' or user.is_superuser:
        permissions_dict = {}
        for page_id, page_name in PagePermission.PAGE_CHOICES:
            permissions_dict[page_id] = {
                'view': True,
                'edit': True,
                'create': True,
                'delete': True
            }
        return Response(permissions_dict)
    
    user_permissions = PagePermission.objects.filter(user=user)
    permissions_dict = {}
    
    for perm in user_permissions:
        permissions_dict[perm.page] = {
            'view': perm.can_view,
            'edit': perm.can_edit,
            'create': perm.can_create,
            'delete': perm.can_delete
        }
    
    return Response(permissions_dict)