from django.db import models
from accounts.models import CustomUser

class PagePermission(models.Model):
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

    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="permissions")
    page = models.CharField(max_length=50, choices=PAGE_CHOICES)
    can_view = models.BooleanField(default=False)
    can_edit = models.BooleanField(default=False)
    can_create = models.BooleanField(default=False)
    can_delete = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("user", "page")

    def __str__(self):
        return f"{self.user.email} - {self.page}"