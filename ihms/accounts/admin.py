from django.contrib import admin
from django.contrib.admin import ModelAdmin
from django.contrib.auth.admin import UserAdmin

from .models import IHMSUser, Doctor, Guardian, Patient, DoctorTime


class IHMSUserAdmin(UserAdmin):
    list_display = ('id', 'national_id', 'first_name', 'last_name', 'is_staff', "role", "get_is_active")
    search_fields = ('national_id', 'first_name', 'last_name')


class DoctorAdmin(ModelAdmin):
    list_display = ('user', 'medical_system_code', 'city', 'is_active')
    search_fields = ('user', 'medical_system_code', 'city', 'is_active')


class DoctorTimeAdmin(ModelAdmin):
    list_display = ('id', 'doctor', 'time', 'patient')
    list_filter = ('doctor', 'time', 'patient')
    search_fields = ('id', 'doctor', 'time', 'patient')


class GuardianAdmin(ModelAdmin):
    list_display = ('pk', 'user', 'charity_org_name', 'city', 'is_active')
    search_fields = ('user', 'charity_org_name', 'city', 'is_active')


admin.site.register(IHMSUser, IHMSUserAdmin)
admin.site.register(Doctor, DoctorAdmin)
admin.site.register(DoctorTime, DoctorTimeAdmin)
admin.site.register(Guardian, GuardianAdmin)
admin.site.register(Patient)
