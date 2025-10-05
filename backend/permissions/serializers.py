from rest_framework import serializers
from .models import PagePermission

class PagePermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PagePermission
        fields = '__all__'

class UpdatePermissionsSerializer(serializers.Serializer):
    # user_id = serializers.IntegerField()
    user_id = serializers.UUIDField() 
    permissions = serializers.JSONField()
    
    def validate_permissions(self, value):
        valid_pages = ['products', 'marketing', 'orders', 'media', 'offers', 
                      'clients', 'suppliers', 'support', 'sales', 'finance']
        valid_permissions = ['view', 'edit', 'create', 'delete']
        
        for page, perms in value.items():
            if page not in valid_pages:
                raise serializers.ValidationError(f"Invalid page: {page}")
            for perm in perms:
                if perm not in valid_permissions:
                    raise serializers.ValidationError(f"Invalid permission: {perm}")
        
        return value
    
    
    # def validate_user_id(self, value):
    #     # Check if user exists
    #     try:
    #         user = CustomUser.objects.get(id=value)
    #         return value
    #     except CustomUser.DoesNotExist:
    #         raise serializers.ValidationError("User does not exist")