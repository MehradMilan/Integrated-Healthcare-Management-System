from django.urls import path

from . import views

app_name = 'accounts'

urlpatterns = [
    path('api/doctors/', views.create_doctor, name='create_doctor'),
    path('api/guardians/', views.create_guardian, name='create_guardian'),
    path('api/patients/', views.create_patient, name='create_patient'),
    path('api/get_user_info/', views.get_user_info, name='get_user_info'),
    path('api/login/', views.login_view, name='login'),
]
