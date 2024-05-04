from django.db import models
from django.contrib.auth.models import AbstractUser
from enum import Enum
from datetime import date
from django.core.validators import MinLengthValidator

# Create your models here.

class IHMSUser(AbstractUser):
    is_patient = models.BooleanField(default=False)
    is_doctor = models.BooleanField(default=False)

    def __str__(self):
        return self.username
    
class City(Enum):
    TEHRAN = 'THR'
    SHIRAZ = 'SHZ'
    URMIA = 'URM'
    TABRIZ = 'TBZ'
    KARAJ = 'KRJ'

GENDER_CHOICES = [
    ('M', 'MALE'),
    ('F', 'FEMALE'),
]
    
class Patient(models.Model):
    user = models.OneToOneField(IHMSUser, on_delete=models.CASCADE, primary_key=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    national_id = models.CharField(max_length=10, validators=[MinLengthValidator(10)], unique=True)
    birth_date = models.DateField()
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES)
    phone_number = models.CharField(max_length=15, unique=True, blank=True, null=True)
    address = models.CharField(max_length=255)
    city = models.CharField(max_length=50, choices=[(tag.value, tag.value) for tag in City])

    @property
    def age(self):
        today = date.today()
        return today.year - self.birth_date.year - ((today.month, today.day) < (self.birth_date.month, self.birth_date.day))

    def __str__(self):
        return self.first_name + ' ' + self.last_name
    
class Doctor(models.Model):

    SPECIALTY = [
        ('DE', 'Dentist'),
    ]

    user = models.OneToOneField(IHMSUser, on_delete=models.CASCADE, primary_key=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    national_id = models.CharField(max_length=10, validators=[MinLengthValidator(10)], unique=True)
    birth_date = models.DateField()
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES)
    phone_number = models.CharField(max_length=15, unique=True, blank=True, null=True)
    address = models.CharField(max_length=255)
    specialty = models.CharField(max_length=2, choices=SPECIALTY)
    city = models.CharField(max_length=50, choices=[(tag.value, tag.value) for tag in City])
    medical_code = models.CharField(max_length=10, unique=True)
    service_code = models.CharField(max_length=10, unique=True)

    @property
    def age(self):
        today = date.today()
        return today.year - self.birth_date.year - ((today.month, today.day) < (self.birth_date.month, self.birth_date.day))
    
    def __str__(self):
        return self.first_name + ' ' + self.last_name