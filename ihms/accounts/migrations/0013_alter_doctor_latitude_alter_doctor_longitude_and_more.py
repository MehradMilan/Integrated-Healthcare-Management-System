# Generated by Django 4.2.11 on 2024-06-28 07:41

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0012_patient_id_alter_patient_medical_file'),
    ]

    operations = [
        migrations.AlterField(
            model_name='doctor',
            name='latitude',
            field=models.DecimalField(decimal_places=6, default=0, max_digits=9, null=True),
        ),
        migrations.AlterField(
            model_name='doctor',
            name='longitude',
            field=models.DecimalField(decimal_places=6, default=0, max_digits=9, null=True),
        ),
        migrations.AlterField(
            model_name='guardian',
            name='latitude',
            field=models.DecimalField(decimal_places=6, default=0, max_digits=9, null=True),
        ),
        migrations.AlterField(
            model_name='guardian',
            name='longitude',
            field=models.DecimalField(decimal_places=6, default=0, max_digits=9, null=True),
        ),
    ]
