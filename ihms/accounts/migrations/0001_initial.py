# Generated by Django 4.2.11 on 2024-06-26 12:07

import accounts.models
from django.conf import settings
import django.contrib.auth.models
import django.contrib.auth.validators
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),
    ]

    operations = [
        migrations.CreateModel(
            name='IHMSUser',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('password', models.CharField(max_length=128, verbose_name='password')),
                ('last_login', models.DateTimeField(blank=True, null=True, verbose_name='last login')),
                ('is_superuser', models.BooleanField(default=False, help_text='Designates that this user has all permissions without explicitly assigning them.', verbose_name='superuser status')),
                ('username', models.CharField(error_messages={'unique': 'A user with that username already exists.'}, help_text='Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.', max_length=150, unique=True, validators=[django.contrib.auth.validators.UnicodeUsernameValidator()], verbose_name='username')),
                ('first_name', models.CharField(blank=True, max_length=150, verbose_name='first name')),
                ('last_name', models.CharField(blank=True, max_length=150, verbose_name='last name')),
                ('email', models.EmailField(blank=True, max_length=254, verbose_name='email address')),
                ('is_staff', models.BooleanField(default=False, help_text='Designates whether the user can log into this admin site.', verbose_name='staff status')),
                ('is_active', models.BooleanField(default=True, help_text='Designates whether this user should be treated as active. Unselect this instead of deleting accounts.', verbose_name='active')),
                ('date_joined', models.DateTimeField(default=django.utils.timezone.now, verbose_name='date joined')),
                ('national_id', models.CharField(max_length=10, unique=True, validators=[accounts.models.validate_iranian_national_id])),
                ('birthdate', models.DateField()),
                ('gender', models.CharField(choices=[('M', 'MALE'), ('F', 'FEMALE')], max_length=1)),
                ('groups', models.ManyToManyField(blank=True, help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.', related_name='user_set', related_query_name='user', to='auth.group', verbose_name='groups')),
                ('user_permissions', models.ManyToManyField(blank=True, help_text='Specific permissions for this user.', related_name='user_set', related_query_name='user', to='auth.permission', verbose_name='user permissions')),
            ],
            options={
                'verbose_name': 'user',
                'verbose_name_plural': 'users',
                'abstract': False,
            },
            managers=[
                ('objects', django.contrib.auth.models.UserManager()),
            ],
        ),
        migrations.CreateModel(
            name='Patient',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('first_name', models.CharField(max_length=100)),
                ('last_name', models.CharField(max_length=100)),
                ('national_id', models.CharField(max_length=10, unique=True, validators=[accounts.models.validate_iranian_national_id])),
                ('birth_date', models.DateField()),
                ('gender', models.CharField(choices=[('M', 'MALE'), ('F', 'FEMALE')], max_length=1)),
                ('phone_number', models.CharField(blank=True, max_length=15, null=True, unique=True)),
                ('address', models.CharField(max_length=255)),
                ('latitude', models.DecimalField(decimal_places=6, max_digits=9)),
                ('longitude', models.DecimalField(decimal_places=6, max_digits=9)),
                ('city', models.CharField(choices=[('THR', 'THR'), ('SHZ', 'SHZ'), ('URM', 'URM'), ('TBZ', 'TBZ'), ('KRJ', 'KRJ')], max_length=50)),
            ],
        ),
        migrations.CreateModel(
            name='Doctor',
            fields=[
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, primary_key=True, serialize=False, to=settings.AUTH_USER_MODEL)),
                ('phone_number', models.CharField(blank=True, max_length=15, null=True, unique=True)),
                ('address', models.CharField(max_length=255)),
                ('latitude', models.DecimalField(decimal_places=6, max_digits=9)),
                ('longitude', models.DecimalField(decimal_places=6, max_digits=9)),
                ('specialty', models.CharField(choices=[('DE', 'Dentist')], max_length=2)),
                ('city', models.CharField(choices=[('THR', 'THR'), ('SHZ', 'SHZ'), ('URM', 'URM'), ('TBZ', 'TBZ'), ('KRJ', 'KRJ')], max_length=50)),
                ('medical_system_code', models.CharField(max_length=10, unique=True)),
                ('practice_licence_image', models.ImageField(upload_to='practice_licence/')),
            ],
        ),
        migrations.CreateModel(
            name='Guardian',
            fields=[
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, primary_key=True, serialize=False, to=settings.AUTH_USER_MODEL)),
                ('city', models.CharField(choices=[('THR', 'THR'), ('SHZ', 'SHZ'), ('URM', 'URM'), ('TBZ', 'TBZ'), ('KRJ', 'KRJ')], max_length=50)),
                ('charity_org_name', models.CharField(max_length=100)),
                ('national_id_card_image', models.ImageField(upload_to='guardians_national_id/')),
            ],
        ),
    ]
