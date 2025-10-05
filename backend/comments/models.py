from django.db import models
from accounts.models import CustomUser

class Comment(models.Model):
    PAGE_CHOICES = [
        ("products", "Products List"),
        ("marketing", "Marketing List"),
        ("orders", "Order List"),
        ("media", "Media Plans"),
        ("offers", "Offer Pricing SKUs"),
        ("clients", "Clients"),
        ("suppliers", "Suppliers"),
        ("support", "Customer Support"),
        ("sales", "Sales Reports"),
        ("finance", "Finance & Accounting"),
    ]
    
    page = models.CharField(max_length=50, choices=PAGE_CHOICES)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.email} - {self.page}"

class CommentHistory(models.Model):
    comment = models.ForeignKey(Comment, on_delete=models.CASCADE, related_name="history")
    modified_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True)
    old_content = models.TextField()
    new_content = models.TextField()
    modified_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"History for comment {self.comment.id}"