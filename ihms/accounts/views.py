from django.contrib.auth import authenticate, login
from django.views.decorators.csrf import csrf_exempt
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .serializers import DoctorSerializer, GuardianSerializer


@api_view(['POST'])
def create_doctor(request):
    if request.method == 'POST':
        serializer = DoctorSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def create_guardian(request):
    if request.method == 'POST':
        serializer = GuardianSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def login_view(request):
    national_id = request.data.get('national_id')
    password = request.data.get('password')
    if not national_id or not password:
        return Response({'error': 'Please provide both national_id and password.'}, status=400)

    user = authenticate(request, username=national_id, password=password)
    if user is not None:
        login(request, user)
        return Response({'message': 'Login successful.', 'is_doctor': bool(hasattr(user, "doctor")), 'is_guardian': bool(hasattr(user, "guardian"))}, status=200)
    else:
        return Response({'error': 'Invalid credentials.'}, status=401)