from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers


class APITokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Dodaj dodatne informacije u token payload
        token['username'] = user.username
        token['is_superuser'] = user.is_superuser
        token['groups'] = list(user.groups.values_list('name', flat=True))

        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user

        if not (
            user.groups.filter(name="JWT").exists() or user.is_superuser
        ):
            raise serializers.ValidationError("Nemate pravo na JWT pristup.")

        return data



class APITokenObtainPairView(TokenObtainPairView):
    serializer_class = APITokenObtainPairSerializer


class MeAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "is_staff": user.is_staff,
            "is_superuser": user.is_superuser,  # ← VAŽNO!
            "groups": list(user.groups.values_list("name", flat=True)),
        })
