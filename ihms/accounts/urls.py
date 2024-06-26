from django.urls import path
from django.contrib.auth import views as auth_views
from . import views

app_name = 'accounts'

urlpatterns = [
    # path('login/', auth_views.LoginView.as_view(template_name='login.html'), name='login'),
    path('login/', views.login, name='login'),
    path('signup/', views.signup, name='signup'),
    path('logout/', auth_views.LogoutView.as_view(next_page='/'), name='logout'),
    path('', views.base, name='base')
]
