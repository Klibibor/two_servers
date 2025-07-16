from rest_framework.viewsets import ModelViewSet
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from shop.models import Proizvod
from api.serializers.proizvodi import ProizvodSerializer
from api.permissions import IsInJWTGroup
from rest_framework.permissions import AllowAny, IsAuthenticated, SAFE_METHODS, BasePermission



class ReadOnlyOrJWT(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:  # GET, HEAD, OPTIONS
            return True
        return (
            request.user and request.user.is_authenticated and (
                request.user.is_superuser or
                request.user.groups.filter(name='JWT').exists()
            )
        )


class ProizvodViewSet(ModelViewSet):
    queryset = Proizvod.objects.all()
    serializer_class = ProizvodSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    permission_classes = [ReadOnlyOrJWT]