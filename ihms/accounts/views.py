from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login as auth_login
from .forms import IHMSUserForm, PatientForm, DoctorForm

# Create your views here.
from django.shortcuts import render, redirect
from .forms import IHMSUserForm, PatientForm, DoctorForm
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .serializers import DoctorSerializer


@api_view(['POST'])
def create_doctor(request):
    if request.method == 'POST':
        serializer = DoctorSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


def signup(request):
    if request.method == 'POST':
        user_form = IHMSUserForm(request.POST)
        patient_form = PatientForm(request.POST)
        doctor_form = DoctorForm(request.POST)
        if user_form.is_valid():
            new_user = user_form.save(commit=False)
            new_user.set_password(user_form.cleaned_data['password'])
            new_user.save()

            role = request.POST.get('role', '')
            if role == 'patient' and patient_form.is_valid():
                patient_form.instance.user = new_user
                patient_form.save()
            elif role == 'doctor' and doctor_form.is_valid():
                doctor_form.instance.user = new_user
                doctor_form.save()

            return redirect('login')
    else:
        user_form = IHMSUserForm()
        patient_form = PatientForm()
        doctor_form = DoctorForm()

    return render(request, 'signup.html', {
        'user_form': user_form,
        'patient_form': patient_form,
        'doctor_form': doctor_form
    })


def login(request):
    return render(request, 'login.html')
