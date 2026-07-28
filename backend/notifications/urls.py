from django.urls import path
from .views import NotificationListView, NotificationMarkReadView, NotificationMarkAllReadView

urlpatterns = [
    path('', NotificationListView.as_view()),
    path('<int:pk>/mark-read/', NotificationMarkReadView.as_view()),
    path('mark-all-read/', NotificationMarkAllReadView.as_view()),
]