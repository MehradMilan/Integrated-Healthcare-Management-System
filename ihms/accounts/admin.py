from django.contrib import admin
from django.contrib.admin import ModelAdmin
from django.contrib.auth.admin import UserAdmin

from .models import IHMSUser, Doctor, Guardian, Patient


class IHMSUserAdmin(UserAdmin):
    list_display = ('national_id', 'first_name', 'last_name', 'is_staff', "role")
    search_fields = ('national_id', 'first_name', 'last_name')
    fieldsets = UserAdmin.fieldsets + (
        (None, {'fields': ('national_id', 'birthdate', 'gender')}),
    )


class DoctorAdmin(ModelAdmin):
    list_display = ('user', 'medical_system_code', 'city', 'is_active')
    search_fields = ('user', 'medical_system_code', 'city', 'is_active')


class GuardianAdmin(ModelAdmin):
    list_display = ('user', 'charity_org_name', 'city', 'is_active')
    search_fields = ('user', 'charity_org_name', 'city', 'is_active')


admin.site.register(IHMSUser, IHMSUserAdmin)
admin.site.register(Doctor, DoctorAdmin)
admin.site.register(Guardian, GuardianAdmin)
admin.site.register(Patient)
