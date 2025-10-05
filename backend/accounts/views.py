from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import update_session_auth_hash
from django.core.mail import send_mail
from django.conf import settings
import random
import string
from datetime import timedelta
from django.utils import timezone

from .models import CustomUser
from .serializers import (
    UserSerializer, RegisterSerializer, UserUpdateSerializer,
    PasswordResetRequestSerializer, PasswordResetVerifySerializer,
    ChangePasswordSerializer, UserDeleteSerializer
)
from django.shortcuts import get_object_or_404

from django.core.exceptions import ValidationError

class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        # Extract role from request data if provided
        expected_role = request.data.get('role')
        print(f"Expected role: {expected_role}")
        response = super().post(request, *args, **kwargs)
        
        if response.status_code == 200:
            try:
                user = CustomUser.objects.get(email=request.data['email'])
                
                if expected_role:
                    if user.role != expected_role:
                        return Response(
                            {
                                'detail': f'Invalid login portal. Please login through your appropriate login portal. Expected role: {user.role}'
                            },
                            status=status.HTTP_403_FORBIDDEN
                        )
                
                # Add user data to response
                response.data['user'] = UserSerializer(user).data
                
            except CustomUser.DoesNotExist:
                pass
                
        return response

class RegisterView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.IsAdminUser]

class UserListView(generics.ListAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]

class UserDetailView(generics.RetrieveUpdateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user
    
class UserDeleteView(generics.DestroyAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserDeleteSerializer
    permission_classes = [permissions.IsAdminUser]
    
    def get_object(self):
        user_id = self.request.data.get('user_id')
        return get_object_or_404(CustomUser, id=user_id)
    
    def delete(self, request, *args, **kwargs):
        # Check if the requesting user is a superadmin
        if request.user.role != 'superadmin':
            return Response(
                {'error': 'Only super admins can delete users.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = UserDeleteSerializer(data=request.data, context={'request': request})
        
        if serializer.is_valid():
            user_id = serializer.validated_data['user_id']
            user = get_object_or_404(CustomUser, id=user_id)
            
            # Store user info for response
            user_email = user.email
            
            # Delete the user
            user.delete()
            
            return Response(
                {'message': f'User {user_email} has been deleted successfully.'},
                status=status.HTTP_200_OK
            )
        
        return Response(
            {'error': 'Invalid data', 'details': serializer.errors},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def change_password(request):
    serializer = ChangePasswordSerializer(data=request.data)
    if serializer.is_valid():
        user = request.user
        if not user.check_password(serializer.validated_data['old_password']):
            return Response(
                {'error': 'Current password is incorrect'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        update_session_auth_hash(request, user)
        return Response(
            {'message': 'Password updated successfully'}, 
            status=status.HTTP_200_OK
        )
    return Response(
        {'error': 'Use a strong password', 'details': serializer.errors}, 
        status=status.HTTP_400_BAD_REQUEST
    )

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def password_reset_request(request):
    serializer = PasswordResetRequestSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data['email']
        try:
            user = CustomUser.objects.get(email=email)
            
            # Check if user can reset password 
            if not user.is_active:
                return Response(
                    {'error': 'This account is deactivated. Please contact administrator.'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Generate 6-digit OTP
            otp = ''.join(random.choices(string.digits, k=6))
            user.otp = otp
            user.otp_created_at = timezone.now()
            user.save()
            
            # Send email
            try:
                send_mail(
                    'Password Reset OTP',
                    f'Your OTP for password reset is: {otp}. This OTP will expire in 10 minutes.',
                    settings.DEFAULT_FROM_EMAIL,
                    [email],
                    fail_silently=False,
                )
                
                return Response(
                    {'message': 'OTP has been sent to your email address'}, 
                    status=status.HTTP_200_OK
                )
                
            except Exception as e:
                # Clear OTP if email sending fails
                user.otp = None
                user.otp_created_at = None
                user.save()
                return Response(
                    {'error': 'Failed to send OTP. Please try again later.'}, 
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
        except CustomUser.DoesNotExist:
            return Response(
                {'message': 'If the email exists in our system, an OTP has been sent'}, 
                status=status.HTTP_200_OK
            )
    
    return Response(
        {'error': 'Invalid email address', 'details': serializer.errors}, 
        status=status.HTTP_400_BAD_REQUEST
    )

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def password_reset_verify(request):
    serializer = PasswordResetVerifySerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data['email']
        otp = serializer.validated_data['otp']
        new_password = serializer.validated_data['new_password']
        
        try:
            user = CustomUser.objects.get(email=email)
            
            # Check if user account is active
            if not user.is_active:
                return Response(
                    {'error': 'This account is deactivated. Please contact administrator.'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Check if OTP exists
            if not user.otp:
                return Response(
                    {'error': 'No OTP requested for this email. Please request a new OTP.'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Check if OTP is valid
            if user.otp != otp:
                return Response(
                    {'error': 'Invalid OTP. Please check the code and try again.'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Check if OTP is expired (10 minutes)
            if not user.otp_created_at:
                return Response(
                    {'error': 'OTP has expired. Please request a new OTP.'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
                
            if timezone.now() - user.otp_created_at > timedelta(minutes=10):
                # Clear expired OTP
                user.otp = None
                user.otp_created_at = None
                user.save()
                return Response(
                    {'error': 'OTP has expired. Please request a new OTP.'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Reset password
            user.set_password(new_password)
            user.otp = None
            user.otp_created_at = None
            user.save()
            
            return Response(
                {'message': 'Password has been reset successfully. You can now login with your new password.'}, 
                status=status.HTTP_200_OK
            )
            
        except CustomUser.DoesNotExist:
            return Response(
                {'error': 'User account not found.'}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
    return Response(
        {'error': 'Please use a strong password', 'details': serializer.errors}, 
        status=status.HTTP_400_BAD_REQUEST
    )