import datetime

from django.contrib.auth import authenticate, logout, login
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import BasePermission, IsAuthenticated
from rest_framework.response import Response

from .models import Doctor, Guardian, Patient, DoctorTime, IHMSUser
from .serializers import DoctorSerializer, GuardianSerializer, PatientSerializer, IHMSUserSerializer, \
    DoctorTimeSerializer


class CustomAuthorization(BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        if hasattr(request.user, 'guardian'):
            return True
        return False


class IsDoctor(BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated or not request.user.role() == "doctor":
            return False
        return True


def get_doctors_calendar(request):
    return render(request, 'doctors_calendar.html')


def get_doctors_calendar_for_guardian(request):
    return render(request, 'doctors_calendar_for_guardian.html', context={"doctor_id": 1})


def get_guardian_location(request):
    return render(request, 'guardian_location.html')


def get_guardians_patients_view(request):
    return render(request, 'guardians_patients.html')


@api_view(['POST'])
def reserve_time_for_patient(request):
    doctor_time_id = request.data.get("doctor_time_id")
    patient_national_id = request.data.get("patient_national_id")
    if not doctor_time_id or not patient_national_id:
        return Response({"error": f"{doctor_time_id=}, {patient_national_id=}"})
    doctor_time = DoctorTime.objects.get(id=doctor_time_id)
    doctor_time.patient = Patient.objects.get(national_id=patient_national_id)
    doctor_time.save()
    return Response(DoctorTimeSerializer(doctor_time).data, 200)


@api_view(['GET'])
def get_doctors_schedule(request):
    doctor_id = request.GET.get('doctor_id', None)
    print(f"{doctor_id=}")
    if doctor_id:
        if len(doctor_id) < 5:
            return Response(
            list(DoctorTime.objects.filter(doctor__user_id=str(doctor_id)).values("id", "time",
                                                                                  "patient").all()))
        else:
            print(f"{DoctorTime.objects.filter(doctor__user__national_id=str(doctor_id)).count()}")
            return Response(list(DoctorTime.objects.filter(doctor__user__national_id=str(doctor_id)).values("id", "time", "patient").all()))

    if not request.user.is_authenticated:
        return Response("User is not authenticated", 400)
    if not request.user.role() == 'doctor':
        return Response(f"User is not a doctor {request.user.national_id}", 400)
    return Response(list(DoctorTime.objects.filter(doctor=request.user.doctor).values("id", "time", "patient").all()))


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsDoctor])
def delete_doctor_time(request):
    id = request.data.get("id")
    DoctorTime.objects.filter(id=id).delete()
    return Response({"message": f"id {id} deleted"}, status=status.HTTP_204_NO_CONTENT)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsDoctor])
def add_doctor_time(request):
    time = request.data.get("time")
    if not time:
        return Response("Missing time", 400)
    try:
        date_object = datetime.datetime.strptime(time, "%Y-%m-%dT%H:%M:%S")
        instance = DoctorTime.objects.create(doctor=request.user.doctor, time=date_object)
        return Response(DoctorTimeSerializer(instance).data, 200)
    except ValueError:
        return Response("Invalid time. expected format %Y-%m-%dT%H:%M:%S", 400)


@api_view(['POST'])
@permission_classes([CustomAuthorization])
def create_patient(request):
    request.data.update({"guardian": request.user.guardian.pk})
    serializer = PatientSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def create_doctor(request):
    if request.method == 'POST':
        serializer = DoctorSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PATCH'])
def update_doctor(request):
    if request.user.is_authenticated:
        if request.user.role() == 'doctor':
            serializer = DoctorSerializer(request.user.doctor, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        return Response("user is not a doctor", status=status.HTTP_401_UNAUTHORIZED)
    return Response("user is not authenticated", status=status.HTTP_401_UNAUTHORIZED)


@api_view(['PATCH'])
def update_guardian(request):
    if request.user.is_authenticated:
        if request.user.role() == 'guardian':
            serializer = GuardianSerializer(request.user.guardian, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        return Response("user is not a guardian", status=status.HTTP_401_UNAUTHORIZED)
    return Response("user is not authenticated", status=status.HTTP_401_UNAUTHORIZED)


@api_view(['POST'])
def create_guardian(request):
    if request.method == 'POST':
        serializer = GuardianSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def get_user_info(request):
    if request.user.is_authenticated:
        if request.user.role() == 'guardian':
            return Response(GuardianSerializer(request.user.guardian).data, 200)
        elif request.user.role() == 'doctor':
            return Response(DoctorSerializer(request.user.doctor).data, 200)
        return Response(IHMSUserSerializer(request.user).data, 200)
    return Response({"error": "user is not authenticated"}, 400)


@api_view(['GET'])
def get_guardians_patients(request):
    if request.user.is_authenticated:
        if request.user.role() == 'guardian':
            return Response(PatientSerializer(request.user.guardian.patient_set.all(), many=True).data, 200)
        return Response("user is not a guardian", 400)
    return Response({"error": "user is not authenticated"}, 400)


@api_view(['GET'])
def logout_view(request):
    logout(request)
    return Response("logged out", 200)


@csrf_exempt
@api_view(['POST'])
def login_view(request):
    national_id = request.data.get('national_id')
    password = request.data.get('password')
    if not national_id or not password:
        return Response({'error': 'Please provide both national_id and password.'}, status=400)

    user = authenticate(request, username=national_id, password=password)
    if user is not None:
        if user.get_is_active:
            login(request, user)
            return Response({'message': 'Login successful.', 'role': request.user.role()}, status=200)
        else:
            return Response({'error': 'User is inactive.'}, status=403)
    else:
        return Response({'error': 'Invalid credentials.'}, status=401)


@api_view(['GET'])
def get_doctors_coordinates(request):
    return Response(list(Doctor.objects.all().values("user__first_name", "user__last_name", "latitude", "longitude")))


@api_view(['POST'])
def autologin(request):
    if request.user.is_authenticated:
        logout(request)
    nid = request.data["national_id"]
    user = IHMSUser.objects.get(national_id=nid)
    login(request, user)
    return Response(200)


@api_view(['GET'])
def get_guardians_coordinates(request):
    return Response(list(Guardian.objects.all().values("latitude", "longitude")))


@api_view(['GET'])
@permission_classes([IsAuthenticated, CustomAuthorization])
def get_guardian_coordinates(request):
    return Response({"id": request.user.guardian.user.id, "latitude": request.user.guardian.latitude,
                     "longitude": request.user.guardian.longitude})


@api_view(['GET'])
def get_doctors_count(request):
    return Response({"count": Doctor.objects.all().count()})


@api_view(['GET'])
def get_guardians_count(request):
    return Response({"count": Guardian.objects.all().count()})


@api_view(['GET'])
def get_patients_count(request):
    return Response({"count": Patient.objects.all().count()})


@api_view(['GET'])
def get_patients_registration_time(request):
    data = list(Patient.objects.all().values("registration_date"))
    data = sorted(data)
    return Response(data, 200)
