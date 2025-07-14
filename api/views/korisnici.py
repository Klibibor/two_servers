from rest_framework.viewsets import ModelViewSet
from django.contrib.auth.models import User
from api.serializers.korisnici import UserSerializer
from rest_framework.permissions import IsAuthenticated

class KorisnikViewSet(ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
