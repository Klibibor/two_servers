from rest_framework import serializers
from django.contrib.auth.models import User

# input class for serializing and rows that will be used
class UserSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(required=False, allow_blank=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'is_staff'] # fields that will be used
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def validate_email(self, value):
        """Custom email validation"""
        if value and User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def create(self, validated_data): # method for creating a user
        user = User(
            username=validated_data['username'],
            email=validated_data.get('email', ''),  # Default to empty string if email not provided
            is_staff=validated_data.get('is_staff', False),
        )
        user.set_password(validated_data['password'])  # password hashing
        user.save()
        return user
# output serialized user model with created password that is hashed
