from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Comment, CommentHistory
from .serializers import CommentSerializer, CommentHistorySerializer
from permissions.models import PagePermission

class CommentListCreateView(generics.ListCreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        page = self.request.query_params.get('page')
        if not page:
            return Comment.objects.none()
        
        # Super admins can see all comments without permission checks
        if self.request.user.role == 'superadmin' or self.request.user.is_superuser:
            return Comment.objects.filter(page=page).order_by('-created_at')
        
        # Check if user has view permission for this page
        try:
            permission = PagePermission.objects.get(user=self.request.user, page=page)
            if not permission.can_view:
                return Comment.objects.none()
        except PagePermission.DoesNotExist:
            return Comment.objects.none()
        
        return Comment.objects.filter(page=page).order_by('-created_at')

    def create(self, request, *args, **kwargs):
        print("=== CREATE COMMENT DEBUG ===")
        print(f"User: {request.user.email}, Super Admin: {request.user.role == 'superadmin'}")
        print(f"Request data: {request.data}")
        
        try:
            return super().create(request, *args, **kwargs)
        except Exception as e:
            print(f"Error creating comment: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    def perform_create(self, serializer):
        page = serializer.validated_data.get('page')
        print(f"Perform create - Page: {page}, User: {self.request.user.email}")
        
        # Super admins can create comments without permission checks
        if self.request.user.role == 'superadmin' or self.request.user.is_superuser:
            print("Super admin - bypassing permission checks")
            serializer.save(user=self.request.user)
            return
        
        print("Regular user - checking permissions")
        if page:
            try:
                permission = PagePermission.objects.get(user=self.request.user, page=page)
                if not permission.can_create:
                    raise permissions.PermissionDenied("You don't have permission to create comments on this page")
            except PagePermission.DoesNotExist:
                raise permissions.PermissionDenied("You don't have permission to create comments on this page")
        
        serializer.save(user=self.request.user)
        print("Comment saved successfully")
        
class CommentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def update(self, request, *args, **kwargs):
        print("=== UPDATE COMMENT DEBUG ===")
        print(f"User: {request.user.email}")
        print(f"Request data: {request.data}")
        print(f"Comment ID: {kwargs.get('pk')}")
        
        try:
            # Get the comment first to check permissions
            comment = self.get_object()
            print(f"Comment found: ID={comment.id}, Page={comment.page}, Content='{comment.content}'")
            
             # Super admins bypass permission checks
            if request.user.role == 'superadmin' or request.user.is_superuser:
                print("Super admin - bypassing permission checks")
                # Proceed with the update
                return super().update(request, *args, **kwargs)
            
            # Check permissions
            try:
                permission = PagePermission.objects.get(user=request.user, page=comment.page)
                print(f"User permissions for {comment.page}: edit={permission.can_edit}")
                if not permission.can_edit:
                    return Response(
                        {'error': 'You do not have permission to edit comments on this page'},
                        status=status.HTTP_403_FORBIDDEN
                    )
            except PagePermission.DoesNotExist:
                print("No permissions found for this page")
                return Response(
                    {'error': 'You do not have permission to edit comments on this page'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            
            return super().update(request, *args, **kwargs)
            
        except Comment.DoesNotExist:
            print("Comment not found")
            return Response(
                {'error': 'Comment not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            print(f"Unexpected error: {str(e)}")
            return Response(
                {'error': 'Internal server error'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def perform_update(self, serializer):
        comment = self.get_object()
        
         # Super admins can edit comments without permission checks
        if self.request.user.role == 'superadmin' or self.request.user.is_superuser:
            # Create history 
            CommentHistory.objects.create(
                comment=comment,
                modified_by=self.request.user,
                old_content=comment.content,
                new_content=serializer.validated_data.get('content', comment.content)
            )
            serializer.save()
            return
        
        try:
            permission = PagePermission.objects.get(user=self.request.user, page=comment.page)
            if not permission.can_edit:
                raise permissions.PermissionDenied("You don't have permission to edit comments on this page")
        except PagePermission.DoesNotExist:
            raise permissions.PermissionDenied("You don't have permission to edit comments on this page")
        
        old_content = comment.content
        new_content = serializer.validated_data.get('content', old_content)
        
        print(f"Updating comment content from '{old_content}' to '{new_content}'")
        
        # Create history record if content changed
        if old_content != new_content:
            CommentHistory.objects.create(
                comment=comment,
                modified_by=self.request.user,
                old_content=old_content,
                new_content=new_content
            )
            print("Comment history created")
        
        serializer.save()
        print("Comment saved successfully")
        
class CommentHistoryView(generics.ListAPIView):
    serializer_class = CommentHistorySerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        comment_id = self.request.query_params.get('comment_id')
        if comment_id:
            return CommentHistory.objects.filter(comment_id=comment_id).order_by('-modified_at')
        return CommentHistory.objects.all().order_by('-modified_at')

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_comment_history(request, comment_id):
    """Get history for a specific comment"""
    if not request.user.is_superuser and request.user.role != 'superadmin':
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    comment = get_object_or_404(Comment, id=comment_id)
    history = CommentHistory.objects.filter(comment=comment).order_by('-modified_at')
    print(f"Found {history.count()} history records for comment ID {comment_id}")
    serializer = CommentHistorySerializer(history, many=True)
    return Response(serializer.data)