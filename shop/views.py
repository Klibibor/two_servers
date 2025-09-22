# --- AUTH VIEWS ---
import logging
from rest_framework.permissions import IsAuthenticated, IsAdminUser, BasePermission
from api.views.permissions import (
    ReadOnlyPermission, 
    JWTUserPermission, 
    SuperuserPermission
)



# --- SERIALIZERS AND PARSERS FOR VIEWS ---
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser, JSONParser
from rest_framework.viewsets import ModelViewSet # import library for crud
from shop.models import Product, ProductGroup
from api.serializers.products import ProductSerializer
from api.serializers.groups import ProductGroupSerializer # import serialized model
from django.contrib.auth.models import User
from api.serializers.users import UserSerializer

# Initialize logger for this module
logger = logging.getLogger(__name__)


# input model, serialized model, class handling permissions
class ProductGroupViewSet(ModelViewSet): 
    queryset = ProductGroup.objects.all() # model
    serializer_class = ProductGroupSerializer # serialized model
    permission_classes = [ReadOnlyPermission | JWTUserPermission | SuperuserPermission] # Read for all, Write for JWT/Superuser
    
    def dispatch(self, request, *args, **kwargs):
        logger.debug(
            "ProductGroupViewSet: %s %s by %s (auth=%s)",
            request.method, request.path, request.user, request.user.is_authenticated
        )
        return super().dispatch(request, *args, **kwargs)
# output get request for all and post request for JWT users

# input model, serialized model, class handling permissions, class handling uploads
class ProductViewSet(ModelViewSet):
    queryset = Product.objects.all() # model
    serializer_class = ProductSerializer # serialized model
    parser_classes = [MultiPartParser, FormParser, JSONParser] # handling uploads and JSON to database from front-end
    permission_classes = [ReadOnlyPermission | JWTUserPermission | SuperuserPermission] # Read for all, Write for JWT/Superuser
    
    def dispatch(self, request, *args, **kwargs):
        logger.debug(
            "ProductViewSet: %s %s by %s (auth=%s) auth_header=%s",
            request.method, request.path, request.user, request.user.is_authenticated,
            bool(request.META.get('HTTP_AUTHORIZATION'))
        )
        return super().dispatch(request, *args, **kwargs)
# output get request for all and post request for JWT users

# --- KORISNICI VIEWS ---

# input User model from django.contrib.auth.models, UserSerializer we made, class handling permissions
class KorisnikViewSet(ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    
    def dispatch(self, request, *args, **kwargs):
        logger.debug(
            "KorisnikViewSet: %s %s by %s (auth=%s)",
            request.method, request.path, request.user, request.user.is_authenticated
        )
        return super().dispatch(request, *args, **kwargs)
    
    # Different permission levels for different operations
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            # Write operations require JWT or Superuser permissions
            permission_classes = [JWTUserPermission | SuperuserPermission]  
        elif self.action in ['list', 'retrieve']:
            # Read operations use scalable permission hierarchy  
            permission_classes = [ReadOnlyPermission | JWTUserPermission | SuperuserPermission]  
        else:
            permission_classes = [IsAuthenticated]  # Fallback
        return [perm() for perm in permission_classes]
# output: view access for JWT+superusers, CUD operations for superusers only
