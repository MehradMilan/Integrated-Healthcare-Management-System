from django.db import models
from django.contrib.auth.models import AbstractUser
from enum import Enum
from datetime import date
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _


def validate_iranian_national_id(value):
    if not value.isdigit():
        raise ValidationError(_('National ID must be numerical.'), code='invalid')

    if len(value) != 10 or value == value[0] * 10:
        raise ValidationError(_('Invalid National ID length or invalid ID format.'), code='invalid_length_or_format')

    checksum = int(value[-1])
    sum_products = sum(int(value[x]) * (10 - x) for x in range(9))
    remainder = sum_products % 11

    if remainder < 2 and checksum != remainder:
        raise ValidationError(_('Invalid National ID checksum.'), code='invalid_checksum')
    elif remainder >= 2 and checksum != (11 - remainder):
        raise ValidationError(_('Invalid National ID checksum.'), code='invalid_checksum')


GENDER_CHOICES = [
    ('M', 'MALE'),
    ('F', 'FEMALE'),
]


class IHMSUser(AbstractUser):
    national_id = models.CharField(max_length=10, validators=[validate_iranian_national_id], unique=True)
    birthdate = models.DateField()
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES)

    USERNAME_FIELD = 'national_id'
    REQUIRED_FIELDS = []  # No additional fields required at creation time besides the password

    def __str__(self):
            return self.username


class City(Enum):
    TEHRAN = 'THR'
    SHIRAZ = 'SHZ'
    URMIA = 'URM'
    TABRIZ = 'TBZ'
    KARAJ = 'KRJ'


class Patient(models.Model):
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    national_id = models.CharField(max_length=10, validators=[validate_iranian_national_id], unique=True)
    birth_date = models.DateField()
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES)
    phone_number = models.CharField(max_length=15, unique=True, blank=True, null=True)
    address = models.CharField(max_length=255)
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    city = models.CharField(max_length=50, choices=[(tag.value, tag.value) for tag in City])


class Guardian(models.Model):
    user = models.OneToOneField(IHMSUser, on_delete=models.CASCADE, primary_key=True)
    city = models.CharField(max_length=50, choices=[(tag.value, tag.value) for tag in City])
    charity_org_name = models.CharField(max_length=100)
    national_id_card_image = models.ImageField(upload_to='guardians_national_id/')


class Doctor(models.Model):
    SPECIALTY = [
        ('DE', 'Dentist'),
    ]

    user = models.OneToOneField(IHMSUser, on_delete=models.CASCADE, primary_key=True)
    phone_number = models.CharField(max_length=15, unique=True, blank=True, null=True)
    address = models.CharField(max_length=255)
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    specialty = models.CharField(max_length=2, choices=SPECIALTY)
    city = models.CharField(max_length=50, choices=[(tag.value, tag.value) for tag in City])
    medical_system_code = models.CharField(max_length=10, unique=True)
    practice_licence_image = models.ImageField(upload_to="practice_licence/")
