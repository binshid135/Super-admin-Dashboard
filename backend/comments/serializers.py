from rest_framework import serializers
from .models import Comment, CommentHistory

class CommentSerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source='user.email', read_only=True)
    user_name = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'page', 'user', 'user_email', 'user_name', 'content', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']
        extra_kwargs = {
            'page': {'required': False}  
        }

    def validate(self, attrs):
        
        if 'content' in attrs:
            if not attrs['content'] or not attrs['content'].strip():
                raise serializers.ValidationError({"content": "Comment content cannot be empty."})
            attrs['content'] = attrs['content'].strip()
        
        return attrs

    def update(self, instance, validated_data):
       
        if 'content' in validated_data:
            instance.content = validated_data['content']
            instance.save()
        
        return instance

class CommentHistorySerializer(serializers.ModelSerializer):
    modified_by_email = serializers.CharField(source='modified_by.email', read_only=True)
    modified_by_name = serializers.CharField(source='modified_by.username', read_only=True)

    class Meta:
        model = CommentHistory
        fields = ['id', 'comment', 'modified_by', 'modified_by_email', 'modified_by_name', 
                 'old_content', 'new_content', 'modified_at']
        read_only_fields = ['id', 'modified_at']