import logging
from rest_framework.permissions import BasePermission

logger = logging.getLogger(__name__)  # ← dodaj ovo

class IsInJWTGroup(BasePermission):
    def has_permission(self, request, view):
        logger.info(f"✅ User: {request.user}")
        logger.info(f"✅ Authenticated: {request.user.is_authenticated}")
        logger.info(f"✅ Groups: {[g.name for g in request.user.groups.all()]}")
        return (
            request.user
            and request.user.is_authenticated
            and (
                request.user.groups.filter(name='JWT').exists()
                or request.user.is_superuser
            )
        )
