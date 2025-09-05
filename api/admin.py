from django.contrib import admin
from django.contrib.auth.models import User, Group
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin
from django.utils.translation import gettext_lazy as _
from django.contrib.admin import SimpleListFilter

# input outstanding tokens
def _blacklist_outstanding_tokens_for_user(user):
	try:
		from rest_framework_simplejwt.token_blacklist.models import OutstandingToken, BlacklistedToken
	except Exception:
		return 0

	count = 0
	outstanding_tokens = OutstandingToken.objects.filter(user=user)
	for token in outstanding_tokens:
		BlacklistedToken.objects.get_or_create(token=token)
		count += 1
	return count
# output can blacklist tokens and count

# input filter users that you want to blacklist tokens for
@admin.action(description=_('Blacklist tokens for selected users'))
def blacklist_tokens_for_selected_users(modeladmin, request, queryset):
	total = 0
	for user in queryset:
		total += _blacklist_outstanding_tokens_for_user(user)
	modeladmin.message_user(request, f'Blacklisted {total} token(s) for {queryset.count()} user(s)')
# output blacklist token for <users> and count

# input filter users that are no longer in JWT group
@admin.action(description=_('Blacklist tokens for users no longer in JWT group'))
def blacklist_tokens_for_non_jwt_users(modeladmin, request, queryset):
	# Find users who have outstanding tokens but are not in the JWT group and are not superusers
	try:
		from rest_framework_simplejwt.token_blacklist.models import OutstandingToken
	except Exception:
		modeladmin.message_user(request, 'Token blacklist app not installed', level='error')
		return

	jwt_user_ids = User.objects.filter(groups__name='JWT').values_list('id', flat=True)
	users_with_tokens = User.objects.filter(outstandingtoken__isnull=False).distinct()
	users_to_blacklist = users_with_tokens.exclude(id__in=jwt_user_ids).exclude(is_superuser=True)

	total = 0
	for user in users_to_blacklist:
		total += _blacklist_outstanding_tokens_for_user(user)

	modeladmin.message_user(request, f'Blacklisted {total} token(s) for {users_to_blacklist.count()} user(s)')
# output blacklist token for users that are no longer in jwt group and superusers

# input filters for users
class UserAdmin(DjangoUserAdmin):
	# DjangoUserAdmin.actions is a tuple; extend with a tuple to avoid TypeError
	actions = DjangoUserAdmin.actions + (blacklist_tokens_for_selected_users, blacklist_tokens_for_non_jwt_users)
	# Add a filter to show users who are (or are not) in the JWT group
	class JWTGroupFilter(SimpleListFilter):
		title = _('JWT group membership')
		parameter_name = 'jwt_group'

		def lookups(self, request, model_admin):
			return (
				('in', _('In JWT group')),
				('not', _('Not in JWT group')),
			)

		def queryset(self, request, queryset):
			if self.value() == 'in':
				return queryset.filter(groups__name='JWT')
			if self.value() == 'not':
				return queryset.exclude(groups__name='JWT')
			return queryset

	# Extend default list filters with JWTGroupFilter
	list_filter = DjangoUserAdmin.list_filter + (JWTGroupFilter,)


admin.site.unregister(User)
admin.site.register(User, UserAdmin)

try:
	# Ensure JWT group exists in admin - optional convenience
	Group._meta.verbose_name = _('Group')
except Exception:
	pass
