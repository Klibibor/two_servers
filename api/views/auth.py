
# Django REST Framework i JWT importi
from rest_framework.views import APIView  # Bazna klasa za API view
from rest_framework.response import Response  # Odgovor za API
from rest_framework.permissions import IsAuthenticated, SAFE_METHODS, BasePermission, AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView  # JWT view za token
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer  # JWT serializer
from rest_framework import serializers, status  # Osnovni DRF serializer
from rest_framework import parsers
from drf_yasg.utils import swagger_auto_schema
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.request import Request as DRFRequest
from django.contrib.auth import authenticate, login as django_login
from rest_framework.permissions import IsAuthenticated
from django.views.decorators.csrf import csrf_protect
from django.utils.decorators import method_decorator


# input TokenObtainPairSerializer class, class for making tokens
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        token['is_superuser'] = user.is_superuser
        token['groups'] = list(user.groups.values_list('name', flat=True))
        return token
# output method for generating tokens overriden

# input TokenObtainPairSerializer with overridden get_token method + given username and password + users
class APITokenObtainPairSerializer(CustomTokenObtainPairSerializer):
    # input users from django database
    def validate(self, attrs):  # method that validates user + gives JWT
        data = super().validate(attrs)  # attrs = 2 key-value username, password
        user = self.user  # get user info and check if its superuser and JWT group
        if not (
            user.groups.filter(name="JWT").exists() or user.is_superuser
        ):
            raise serializers.ValidationError("user cant generate token.")
        return data  # generate token with custom get_token method
    # token for user call

# input generated token
class APITokenObtainPairView(TokenObtainPairView):  # auth/token/
    serializer_class = APITokenObtainPairSerializer  
# output human readable token

# input class for refreshing token with CSRF protection + cookie
@method_decorator(csrf_protect, name='dispatch')
class CookieTokenRefreshView(APIView):
    permission_classes = (AllowAny,)  # CSRF middleware / decorator enforces token check

    def post(self, request):
        # Debug: log cookies and headers to diagnose missing refresh cookie / CSRF issues
        try:
            print("DEBUG CookieTokenRefreshView - request.COOKIES:", request.COOKIES)
            print("DEBUG CookieTokenRefreshView - HTTP_COOKIE:", request.META.get('HTTP_COOKIE'))
            print("DEBUG CookieTokenRefreshView - X-CSRFToken header:", request.META.get('HTTP_X_CSRFTOKEN'))
            print("DEBUG CookieTokenRefreshView - Authorization header:", request.META.get('HTTP_AUTHORIZATION'))
        except Exception as e:
            print("DEBUG CookieTokenRefreshView - error printing request info:", e)

        refresh_token = request.COOKIES.get('refresh')
        if not refresh_token:
            return Response({'detail': 'no refresh cookie'}, status=status.HTTP_401_UNAUTHORIZED)
        try:
            token = RefreshToken(refresh_token)
            access = str(token.access_token)
            # opcionalno: rotirati refresh i postaviti novi cookie ovdje
            return Response({'access': access})
        except Exception:
            return Response(status=status.HTTP_401_UNAUTHORIZED)
# output new access token if refresh token is valid

        
# input get request from a user
class MeAPIView(APIView):  # auth/me/
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        user = request.user
        return Response({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "is_staff": user.is_staff,
            "is_superuser": user.is_superuser,
            "groups": list(user.groups.values_list("name", flat=True)),
        })
# output info of current user

# input authenticated user + refresh token
class LogoutView(APIView):  # auth/logout/
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        refresh_token = request.data.get('refresh')
        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
                return Response(status=status.HTTP_205_RESET_CONTENT)
            except Exception:
                return Response(status=status.HTTP_400_BAD_REQUEST)
        # fallback: for session auth just logout
        from django.contrib.auth import logout
        logout(request)
        return Response(status=status.HTTP_200_OK)
    # output blacklisted refresh token or if no token user logout

# input username and password
class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True)
# output serialized username and password

# input username and password
class LoginView(APIView): # auth/login/
    permission_classes = (AllowAny,)
    parser_classes = [parsers.JSONParser, parsers.FormParser, parsers.MultiPartParser]
    serializer_class = LoginSerializer

    @swagger_auto_schema(request_body=LoginSerializer)
    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        username = serializer.validated_data['username']
        password = serializer.validated_data['password']

        user = authenticate(request, username=username, password=password)
        if user is None:
            return Response({'detail': 'invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

        # log the user in (session-auth)
        django_login(request, user)

        can_get_jwt = user.is_superuser or user.groups.filter(name='JWT').exists()

        payload = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'is_staff': user.is_staff,
            'is_superuser': user.is_superuser,
            'groups': list(user.groups.values_list('name', flat=True)),
            'can_get_jwt': can_get_jwt,
        }

        # If user can get JWT tokens, generate and include them
        if can_get_jwt:
            refresh = RefreshToken.for_user(user)
            # Add custom claims
            refresh['username'] = user.username
            refresh['is_superuser'] = user.is_superuser
            refresh['groups'] = list(user.groups.values_list('name', flat=True))
            
            payload['access'] = str(refresh.access_token)
            # ne uključivati refresh u payload (biće u HttpOnly cookie)

            resp =  Response(payload)
            resp.set_cookie(
            'refresh',
            str(refresh),
            httponly=True,
            secure=False,      # postavi True u produkciji (HTTPS)
            samesite='Lax',   # ili 'Lax' zavisno od zahteva; za cross-site dev često 'None'
            max_age=7*24*3600, # podudara se sa REFRESH_TOKEN_LIFETIME
            path='/' # dostupno na svim endpointima
        )
        return resp
# output user info without tokens