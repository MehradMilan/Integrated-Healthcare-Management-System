# Generated by Django 4.2.11 on 2024-06-26 14:54

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0003_alter_doctor_practice_licence_image_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='ihmsuser',
            name='username',
            field=models.CharField(max_length=150, verbose_name='username'),
        ),
    ]
