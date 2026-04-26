# from django.apps import AppConfig


# class CoreConfig(AppConfig):
#     name = "apps.core"

# apps/core/apps.py
from django.apps import AppConfig
class CoreConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.core'

# apps/users/apps.py
from django.apps import AppConfig
class UsersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.users'

# apps/documents/apps.py
from django.apps import AppConfig
class DocumentsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.documents'

# apps/questions/apps.py
from django.apps import AppConfig
class QuestionsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.questions'

# apps/evaluation/apps.py
from django.apps import AppConfig
class EvaluationConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.evaluation'