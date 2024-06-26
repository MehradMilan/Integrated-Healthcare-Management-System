from django.urls import path
from django.views.decorators.csrf import csrf_exempt

from . import views

app_name = 'accounts'

urlpatterns = [
    path('api/doctors/', views.create_doctor, name='create_doctor'),
    path('api/guardians/', views.create_guardian, name='create_guardian'),
    path('api/login/', views.login_view, name='login'),
]
