import datetime
import re

from django.contrib.auth.base_user import BaseUserManager
from django.contrib.auth.models import AbstractUser, PermissionsMixin
from django.core.exceptions import ValidationError
from django.db import models
from django.utils.translation import gettext_lazy as _

from .data import CITIES


def validate_adult_age(value):
    if value - datetime.datetime.now() <= datetime.timedelta(days=18 * 365.25):
        raise ValidationError(_('An adult must be above 18 years of age.'), code='invalid')

    if value - datetime.datetime.now() >= datetime.timedelta(days=120 * 365.25):
        raise ValidationError(_('An adult must be below 120 years of age.'), code='invalid')


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


class IHMSUserManager(BaseUserManager):
    def create_user(self, national_id, password=None, **extra_fields):
        if not national_id:
            raise ValueError('The National ID must be set')
        user = self.model(national_id=national_id, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, national_id, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(national_id, password, **extra_fields)


class IHMSUser(AbstractUser, PermissionsMixin):
    username = models.CharField(
        _("username"),
        max_length=150,
    )

    national_id = models.CharField(max_length=10, validators=[validate_iranian_national_id], unique=True)
    birthdate = models.DateField(validators=[validate_adult_age])
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES)

    objects = IHMSUserManager()

    USERNAME_FIELD = 'national_id'
    REQUIRED_FIELDS = []

    def role(self):
        if bool(hasattr(self, "doctor")):
            return "doctor"
        elif bool(hasattr(self, "guardian")):
            return "guardian"
        else:
            return "admin"

    def get_is_active(self):
        if bool(hasattr(self, "doctor")):
            return self.doctor.is_active
        elif bool(hasattr(self, "guardian")):
            return self.guardian.is_active
        else:
            return True

    def age(self):
        return (datetime.datetime.now().date() - self.birthdate).days / 365.25


class MedicalFile(models.Model):
    pass


class Guardian(models.Model):
    user = models.OneToOneField(IHMSUser, on_delete=models.CASCADE, primary_key=True)
    city = models.CharField(max_length=50)
    phone_number = models.CharField(max_length=15, validators=[validate_iranian_phone], blank=True, null=True)
    charity_org_name = models.CharField(max_length=100)
    national_id_card_image = models.URLField()
    is_active = models.BooleanField(default=False)


class Patient(models.Model):
    medical_file = models.OneToOneField(MedicalFile, on_delete=models.CASCADE, primary_key=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    national_id = models.CharField(max_length=10, validators=[validate_iranian_national_id], unique=True, blank=True,
                                   null=True)
    birth_date = models.DateField()
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES)
    city = models.CharField(max_length=50)
    guardian = models.ForeignKey(Guardian, on_delete=models.CASCADE)
    profile_picture = models.URLField()

    def save(self, *args, **kwargs):
        if not self.medical_file_id:
            self.medical_file = MedicalFile.objects.create()
        super().save(*args, **kwargs)


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
