from rest_framework.permissions import BasePermission

class IsInJWTGroup(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user 
            and request.user.is_authenticated 
            and request.user.groups.filter(name='JWT').exists()
        )
