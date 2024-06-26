import re
from enum import Enum

from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError
from django.db import models
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


def validate_iranian_phone(value):
    pattern = re.compile(r'^(?:0|\+?98)9\d{9}$')

    if not pattern.match(value):
        raise ValidationError(
            _('Invalid Iranian phone number. Please enter a valid phone number with or without the country code.'),
            params={'value': value},
        )


def validate_iranian_landline(value):
    pattern = re.compile(
        r'^0(21|26|25|31|41|44|51|61|66|71|74|77|81|86|87|111|115|123|132|142|144|152|162|172|182|192)\d{7,8}$')

    if not pattern.match(value):
        raise ValidationError(
            _('Invalid Iranian landline phone number. Please enter a valid phone number including the area code.'),
            params={'value': value},
        )


GENDER_CHOICES = [
    ('M', 'MALE'),
    ('F', 'FEMALE'),
]


class IHMSUser(AbstractUser):
    username = models.CharField(
        _("username"),
        max_length=150,
    )

    national_id = models.CharField(max_length=10, validators=[validate_iranian_national_id], unique=True)
    birthdate = models.DateField()
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES)

    USERNAME_FIELD = 'national_id'
    REQUIRED_FIELDS = []

    def role(self):
        if bool(hasattr(self, "doctor")):
            return "doctor"
        elif bool(hasattr(self, "guardian")):
            return "guardian"
        else:
            return "user"


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
    city = models.CharField(max_length=50)


class Guardian(models.Model):
    user = models.OneToOneField(IHMSUser, on_delete=models.CASCADE, primary_key=True)
    city = models.CharField(max_length=50)
    phone_number = models.CharField(max_length=15, validators=[validate_iranian_phone], blank=True, null=True)
    charity_org_name = models.CharField(max_length=100)
    national_id_card_image = models.URLField()
    is_active = models.BooleanField(default=False)


class Doctor(models.Model):
    SPECIALTY = [
        ("ارتودنسی", "ارتودنسی"),
        ("پریودنتولوژی", "پریودنتولوژی"),
        ("دندانپزشکی کودکان", "دندانپزشکی کودکان"),
        ("اندودنتیکس", "اندودنتیکس"),
        ("پروتزهای دندانی", "پروتزهای دندانی"),
        ("جراحی دهان، فک و صورت", "جراحی دهان، فک و صورت"),
        ("پروتزهای دندانی ثابت و متحرک", "پروتزهای دندانی ثابت و متحرک"),
        ("رادیولوژی دهان و دندان", "رادیولوژی دهان و دندان"),
        ("دندانپزشکی ترمیمی", "دندانپزشکی ترمیمی"),
        ("دندانپزشکی زیبایی", "دندانپزشکی زیبایی")
    ]

    user = models.OneToOneField(IHMSUser, on_delete=models.CASCADE, primary_key=True)
    landline = models.CharField(max_length=15, validators=[validate_iranian_landline], blank=True, null=True)
    phone_number = models.CharField(max_length=15, validators=[validate_iranian_phone], blank=True, null=True)
    address = models.CharField(max_length=255, null=True, blank=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True)
    specialty = models.CharField(max_length=30, choices=SPECIALTY)
    city = models.CharField(max_length=50)
    medical_system_code = models.CharField(max_length=10, unique=True)
    practice_licence_image = models.URLField()
    is_active = models.BooleanField(default=False)
