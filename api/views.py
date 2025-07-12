from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from .serializers import UserSerializer
from rest_framework import viewsets, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import jwt

class LoginAPIView(APIView):
    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        
        user = authenticate(request, username=username, password=password)


        if user is not None:
            # umesto pravog JWT, koristi fiktivni token
            token = jwt.encode({"username": user.username}, "tajna_lozinka", algorithm="HS256")
            return Response({"token": token})
        else:
            return Response({"error": "Neuspešna prijava."}, status=401)

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]  # samo prijavljeni korisnici
