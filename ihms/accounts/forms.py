from django import forms
from .models import IHMSUser, Patient, Doctor

class IHMSUserForm(forms.ModelForm):
    class Meta:
        model = IHMSUser
        fields = ['username', 'password']
        widgets = {
            'password': forms.PasswordInput(),
        }

class PatientForm(forms.ModelForm):
    class Meta:
        model = Patient
        exclude = ['user']

class DoctorForm(forms.ModelForm):
    class Meta:
        model = Doctor
        exclude = ['user']
