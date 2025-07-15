from rest_framework.viewsets import ModelViewSet
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from shop.models import Proizvod
from api.serializers.proizvodi import ProizvodSerializer
from api.permissions import IsInJWTGroup


class ProizvodViewSet(ModelViewSet):
    queryset = Proizvod.objects.all()
    serializer_class = ProizvodSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    permission_classes = [IsInJWTGroup]
