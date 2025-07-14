from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

class MeAPIView(APIView):                       #MeAPIView je dete klase APIView 
    permission_classes = [IsAuthenticated]      #znaci ako je autenitfikovan korisnk

    def get(self, request):                     #moze da vidi podatke o sebi
        user = request.user                     #tako sto u url 
        return Response({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "is_staff": user.is_staff
        })
