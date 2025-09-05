# --- AUTH VIEWS ---
from rest_framework.permissions import IsAuthenticated, IsAdminUser, BasePermission
from api.views.permissions import (
    AnonymousReadOnlyPermission, 
    JWTUserPermission, 
    SuperuserPermission
)

class SimpleJWTOrSuperuserPermission(BasePermission):
    """Jednostavan pristup: proveri da li je user u JWT grupi ili superuser putem session auth."""
    def has_permission(self, request, view):
        # GET zahtevi dozvoljena svima
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return True
            
        # Za ostale zahteve proveri da li je user authenticated
        if not request.user.is_authenticated:
            return False
            
        # Proveri da li je superuser ili u JWT grupi
        return (request.user.is_superuser or 
                request.user.groups.filter(name='JWT').exists())

# --- SERIALIZERS AND PARSERS FOR VIEWS ---
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser, JSONParser
from rest_framework.viewsets import ModelViewSet # import library for crud
from shop.models import Product, ProductGroup
from api.serializers.proizvodi import ProductSerializer
from api.serializers.grupe import ProductGroupSerializer # import serialized model
from django.contrib.auth.models import User
from api.serializers.korisnici import UserSerializer



# input model, serialized model, class handling permissions
class ProductGroupViewSet(ModelViewSet): 
    queryset = ProductGroup.objects.all() # model
    serializer_class = ProductGroupSerializer # serialized model
    permission_classes = [JWTUserPermission | SuperuserPermission] # Samo autentifikovani korisnici
# output get request for all and post request for JWT users

# input model, serialized model, class handling permissions, class handling uploads
class ProductViewSet(ModelViewSet):
    queryset = Product.objects.all() # model
    serializer_class = ProductSerializer # serialized model
    parser_classes = [MultiPartParser, FormParser, JSONParser] # handling uploads and JSON to database from front-end
    permission_classes = [JWTUserPermission | SuperuserPermission] # Samo autentifikovani korisnici
    
    def dispatch(self, request, *args, **kwargs):
        print(f"DEBUG ProductViewSet.dispatch: {request.method} {request.path}")
        print(f"DEBUG ProductViewSet.dispatch: Authorization header = {request.META.get('HTTP_AUTHORIZATION', 'None')}")
        print(f"DEBUG ProductViewSet.dispatch: User = {request.user}")
        print(f"DEBUG ProductViewSet.dispatch: Is authenticated = {request.user.is_authenticated}")
        return super().dispatch(request, *args, **kwargs)
    
    def list(self, request, *args, **kwargs):
        print(f"DEBUG ProductViewSet.list: {request.method} {request.path}")
        print(f"DEBUG ProductViewSet.list: User = {request.user}")
        print(f"DEBUG ProductViewSet.list: Is authenticated = {request.user.is_authenticated}")
        return super().list(request, *args, **kwargs)
    
    def create(self, request, *args, **kwargs):
        print(f"DEBUG ProductViewSet.create: {request.method} {request.path}")
        print(f"DEBUG ProductViewSet.create: Data = {request.data}")
        print(f"DEBUG ProductViewSet.create: User = {request.user}")
        print(f"DEBUG ProductViewSet.create: Content-Type = {request.content_type}")
        
        # Test serializer validation
        serializer = self.get_serializer(data=request.data)
        print(f"DEBUG ProductViewSet.create: Serializer valid = {serializer.is_valid()}")
        if not serializer.is_valid():
            print(f"DEBUG ProductViewSet.create: Serializer errors = {serializer.errors}")
        
        return super().create(request, *args, **kwargs)
# output get request for all and post request for JWT users

# --- KORISNICI VIEWS ---

# input User model from django.contrib.auth.models, UserSerializer we made, class handling permissions
class KorisnikViewSet(ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    # Different permission levels for different operations
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            # Temporarily allow JWT users to manage users for testing
            permission_classes = [JWTUserPermission | SuperuserPermission]  
        elif self.action in ['list', 'retrieve']:
            # JWT users can view users
            permission_classes = [JWTUserPermission]  
        else:
            permission_classes = [IsAuthenticated]  # Fallback
        return [perm() for perm in permission_classes]
        
    def create(self, request, *args, **kwargs):
        print(f"DEBUG KorisnikViewSet.create: {request.method} {request.path}")
        print(f"DEBUG KorisnikViewSet.create: Data = {request.data}")
        serializer = self.get_serializer(data=request.data)
        print(f"DEBUG KorisnikViewSet.create: Serializer valid = {serializer.is_valid()}")
        if not serializer.is_valid():
            print(f"DEBUG KorisnikViewSet.create: Serializer errors = {serializer.errors}")
        return super().create(request, *args, **kwargs)
# output: view access for JWT+superusers, CUD operations for superusers only
