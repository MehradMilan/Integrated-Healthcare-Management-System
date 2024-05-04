from django.contrib import admin
from .models import IHMSUser, Patient, Doctor

admin.site.register(IHMSUser)
admin.site.register(Patient)
admin.site.register(Doctor)