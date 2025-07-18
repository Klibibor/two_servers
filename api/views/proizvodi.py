from rest_framework.viewsets import ModelViewSet
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from shop.models import Proizvod
from api.serializers.proizvodi import ProizvodSerializer
from api.permissions import IsInJWTGroup
from rest_framework.permissions import AllowAny, IsAuthenticated, SAFE_METHODS, BasePermission



class ReadOnlyOrJWT(BasePermission):            #settings.py odredjuje rest_framework.permissions.IsAuthenticated' da svemu pristum mogu da imaju samo autentifikovani
    def has_permission(self, request, view):    #ReadOnlyOrJWT overwrituje i kaze „Ako je GET → svi mogu da vide“, 
        if request.method in SAFE_METHODS:  # GET, HEAD, OPTIONS
            return True
        return (
            request.user and request.user.is_authenticated and (    #„Ako je POST/PATCH/DELETE → samo JWT grupa ili admin“
                request.user.is_superuser or
                request.user.groups.filter(name='JWT').exists()
            )
        )


class ProizvodViewSet(ModelViewSet):
    queryset = Proizvod.objects.all()
    serializer_class = ProizvodSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    permission_classes = [ReadOnlyOrJWT]