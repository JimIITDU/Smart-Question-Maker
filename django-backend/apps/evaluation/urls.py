# from django.urls import path, include
# from rest_framework.routers import DefaultRouter
# from .views import AnswerViewSet

# router = DefaultRouter()
# router.register(r'answers', AnswerViewSet, basename='answer')

# urlpatterns = [
#     path('', include(router.urls)),
# ]


from django.urls import path
from .views import SubmitAnswerView, BulkSubmitAnswerView, ResultsView

urlpatterns = [
    path('answers/', SubmitAnswerView.as_view(), name='submit-answer'),
    path('submit/', SubmitAnswerView.as_view(), name='submit-answer-alt'),
    path('submit-all/', BulkSubmitAnswerView.as_view(), name='submit-all'),
    path('results/<int:session_id>/', ResultsView.as_view(), name='results'),
]