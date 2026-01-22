from django.db.models.signals import m2m_changed
from django.dispatch import receiver
from django.contrib.auth.models import User, Group


@receiver(m2m_changed, sender=User.groups.through)
def handle_user_group_change(sender, instance, action, pk_set, **kwargs):
    """
    Automatically blacklist tokens when user is removed from JWT group.
    """
    if action == 'post_remove':
        try:
            jwt_group = Group.objects.get(name='JWT')
            if jwt_group.id in pk_set:
                # User was removed from JWT group - blacklist their tokens
                blacklist_user_tokens_signal(instance)
        except Group.DoesNotExist:
            pass


def blacklist_user_tokens_signal(user):
    """Helper: blacklist outstanding tokens for a user (no-op if blacklist app missing)."""
    if user.is_superuser:
        return  # Don't blacklist superuser tokens

    try:
        from rest_framework_simplejwt.token_blacklist.models import OutstandingToken, BlacklistedToken
    except Exception:
        return

    outstanding_tokens = OutstandingToken.objects.filter(user=user)
    for token in outstanding_tokens:
        BlacklistedToken.objects.get_or_create(token=token)
