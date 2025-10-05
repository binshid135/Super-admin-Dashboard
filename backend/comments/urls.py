from django.urls import path
from .views import (
    CommentListCreateView, 
    CommentDetailView, 
    CommentHistoryView,
    get_comment_history
)

urlpatterns = [
    path("", CommentListCreateView.as_view(), name="comment-list-create"),
    path("<int:pk>/", CommentDetailView.as_view(), name="comment-detail"),
    path("history/", CommentHistoryView.as_view(), name="comment-history"),
    path("history/<int:comment_id>/", get_comment_history, name="comment-history-detail"),
]