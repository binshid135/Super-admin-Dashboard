from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import CustomUser
from permissions.models import PagePermission
from django.core.mail import send_mail
from django.conf import settings

class UserSerializer(serializers.ModelSerializer):
    permissions = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'role', 'permissions', 'created_at']
        read_only_fields = ['id', 'created_at']

    def get_permissions(self, obj):
        # If user is super admin, return all permissions
        if obj.role == 'superadmin' or obj.is_superuser:
            from permissions.models import PagePermission
            permissions_dict = {}
            for page_id, page_name in PagePermission.PAGE_CHOICES:
                permissions_dict[page_id] = {
                    'view': True,
                    'edit': True,
                    'create': True,
                    'delete': True
                }
            return permissions_dict
        
        # For regular users, return their actual permissions
        from permissions.models import PagePermission
        user_permissions = PagePermission.objects.filter(user=obj)
        permissions_dict = {}
        
        for perm in user_permissions:
            permissions_dict[perm.page] = {
                'view': perm.can_view,
                'edit': perm.can_edit,
                'create': perm.can_create,
                'delete': perm.can_delete
            }
        
        return permissions_dict

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    send_password_email = serializers.BooleanField(write_only=True, required=False, default=True)

    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'password', 'role','send_password_email']

    def create(self, validated_data):
         # Extract the send_password_email flag
        send_password_email = validated_data.pop('send_password_email', True)
        password = validated_data['password']
        
        user = CustomUser.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            role=validated_data.get('role', 'user')
        )
         # Send password email if requested
        if send_password_email:
            self.send_welcome_email(user, password)
            
        return user
    
    def send_welcome_email(self, user, password):
        """Send welcome email with login credentials to the new user"""
        try:
            subject = 'Welcome to Our Platform - Your Account Details'
            message = f"""
Hello {user.username},

Your account has been successfully created on our platform.

Here are your login details:
- Email: {user.email}
- Password: {password}
- Role: {user.role}

Please log in and change your password for security reasons.

If you have any questions, please contact our support team.

Best regards,
The Team
"""
            send_mail(
                subject,
                message.strip(),
                settings.DEFAULT_FROM_EMAIL,
                [user.email],
                fail_silently=False,
            )
        except Exception as e:
            # Log the error but don't fail the user creation
            print(f"Failed to send welcome email: {str(e)}")


class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['username']

class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

class PasswordResetVerifySerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6)
    new_password = serializers.CharField(write_only=True, validators=[validate_password])

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, validators=[validate_password])
    
    
class UserDeleteSerializer(serializers.Serializer):
    user_id = serializers.UUIDField(required=True)
    
    def validate_user_id(self, value):
        try:
            user = CustomUser.objects.get(id=value)
            # Prevent superadmin from deleting themselves
            if user == self.context['request'].user:
                raise serializers.ValidationError("You cannot delete your own account.")
            # Prevent deleting other superadmins
            if user.role == 'superadmin':
                raise serializers.ValidationError("Cannot delete super admin accounts.")
            return value
        except CustomUser.DoesNotExist:
            raise serializers.ValidationError("User not found.")