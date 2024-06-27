from django.contrib.auth import authenticate, login
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import BasePermission
from rest_framework.response import Response

from .models import Doctor, Guardian, Patient
from .serializers import DoctorSerializer, GuardianSerializer, PatientSerializer, IHMSUserSerializer


class CustomAuthorization(BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        if hasattr(request.user, 'guardian'):
            return True
        return False


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
            return Response({'message': 'Login successful.', 'is_doctor': bool(hasattr(user, "doctor")),
                             'is_guardian': bool(hasattr(user, "guardian"))}, status=200)
        else:
            return Response({'error': 'User is inactive.'}, status=403)
    else:
        return Response({'error': 'Invalid credentials.'}, status=401)


@api_view(['GET'])
def get_doctors_coordinates(request):
    return Response(list(Doctor.objects.all().values("latitude", "longitude")))


@api_view(['GET'])
def get_guardians_coordinates(request):
    return Response(list(Guardian.objects.all().values("latitude", "longitude")))


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
