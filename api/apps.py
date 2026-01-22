from django.apps import AppConfig


class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api'

    def ready(self):
        # Import signal handlers when app is ready
        # signals.py registers the m2m_changed handler for user-group changes
        try:
            import api.signals  # noqa: F401
        except Exception:
            # avoid breaking app startup if signals can't be imported
            pass
