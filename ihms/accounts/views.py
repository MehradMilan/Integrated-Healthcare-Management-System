from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login as auth_login
from .forms import IHMSUserForm, PatientForm, DoctorForm

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

            return redirect('accounts:login')
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
    if request.method == 'POST':
        user_form = IHMSUserForm(data=request.POST)
        if user_form.is_valid():
            username = user_form.cleaned_data['username']
            password = user_form.cleaned_data['password']
            user = authenticate(username=username, password=password)
            if user is not None:
                if user.is_active:
                    auth_login(request, user)
                    return redirect('desired_redirect_url')  # Adjust as needed
                else:
                    # Handle case for disabled account
                    pass
            else:
                # Return an 'invalid login' error message.
                pass
    else:
        user_form = IHMSUserForm()

    return render(request, 'login.html', {'user_form': user_form})

def base(request):
    return render(request, 'base.html')