from django.urls import path

from . import views

app_name = 'accounts'

urlpatterns = [
    path('doctors_calendar/', views.get_doctors_calendar, name='doctors_calendar'),
    path('api/add_doctor_time/', views.add_doctor_time, name='add_doctor_time'),
    path('api/delete_doctor_time/', views.delete_doctor_time, name='delete_doctor_time'),
    path('api/doctors/', views.create_doctor, name='create_doctor'),
    path('api/update_doctor/', views.update_doctor, name='update_doctor'),
    path('api/update_guardian/', views.update_guardian, name='update_guardian'),
    path('api/guardians/', views.create_guardian, name='create_guardian'),
    path('api/patients/', views.create_patient, name='create_patient'),
    path('api/get_user_info/', views.get_user_info, name='get_user_info'),
    path('api/get_guardians_patients/', views.get_guardians_patients, name='get_guardians_patients'),
    path('api/get_doctors_coordinates/', views.get_doctors_coordinates, name='get_doctors_coordinates'),
    path('api/get_guardians_coordinates/', views.get_guardians_coordinates, name='get_guardians_coordinates'),
    path('api/get_doctors_count/', views.get_doctors_count, name='get_doctors_count'),
    path('api/get_guardians_count/', views.get_guardians_count, name='get_guardians_count'),
    path('api/get_patients_registration_time/', views.get_patients_registration_time,
         name='get_patients_registration_time'),
    path('api/get_doctors_schedule/', views.get_doctors_schedule, name="get_doctors_schedule"),
    path('api/login/', views.login_view, name='login'),
    path('api/autologin/', views.autologin, name='autologin'),
    path('api/logout/', views.logout_view, name='logout'),
]
