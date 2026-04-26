# from django.urls import path, include
# from rest_framework.routers import DefaultRouter
# from .views import QuestionSessionViewSet, QuestionViewSet

# router = DefaultRouter()
# router.register(r'sessions', QuestionSessionViewSet, basename='session')
# router.register(r'', QuestionViewSet, basename='question')

# urlpatterns = [
#     path('', include(router.urls)),
#     path('sessions/<int:pk>/download_pdf/', QuestionSessionViewSet.as_view({'get': 'download_pdf'}), name='session-download-pdf'),
# ]


from django.urls import path
from django.urls import path
from .views import (
    GenerateQuestionsView, SessionDetailView,
    SessionDeleteView, SessionListView,
    DownloadPDFView, SubmitAnswersView
)

urlpatterns = [
    path('generate/', GenerateQuestionsView.as_view(), name='generate-questions'),
    path('sessions/', SessionListView.as_view(), name='session-list'),
    path('sessions/<int:pk>/', SessionDetailView.as_view(), name='session-detail'),
    path('sessions/<int:pk>/delete/', SessionDeleteView.as_view(), name='session-delete'),
    path('sessions/<int:pk>/download_pdf/', DownloadPDFView.as_view(), name='download-pdf'),
    path('sessions/<int:pk>/submit/', SubmitAnswersView.as_view(), name='submit-answers'),  # ✅ নতুন
]