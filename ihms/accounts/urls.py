from django.urls import path

from . import views

app_name = 'accounts'

urlpatterns = [
    path('api/doctors/', views.create_doctor, name='create_doctor'),
    path('api/guardians/', views.create_guardian, name='create_guardian'),
]
