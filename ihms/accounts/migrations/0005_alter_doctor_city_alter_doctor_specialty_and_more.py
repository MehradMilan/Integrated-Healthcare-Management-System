# Generated by Django 4.2.11 on 2024-06-26 15:18

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0004_alter_ihmsuser_username'),
    ]

    operations = [
        migrations.AlterField(
            model_name='doctor',
            name='city',
            field=models.CharField(max_length=50),
        ),
        migrations.AlterField(
            model_name='doctor',
            name='specialty',
            field=models.CharField(choices=[('ارتودنسی', 'ارتودنسی'), ('پریودنتولوژی', 'پریودنتولوژی'), ('دندانپزشکی کودکان', 'دندانپزشکی کودکان'), ('اندودنتیکس', 'اندودنتیکس'), ('پروتزهای دندانی', 'پروتزهای دندانی'), ('جراحی دهان، فک و صورت', 'جراحی دهان، فک و صورت'), ('پروتزهای دندانی ثابت و متحرک', 'پروتزهای دندانی ثابت و متحرک'), ('رادیولوژی دهان و دندان', 'رادیولوژی دهان و دندان'), ('دندانپزشکی ترمیمی', 'دندانپزشکی ترمیمی'), ('دندانپزشکی زیبایی', 'دندانپزشکی زیبایی')], max_length=30),
        ),
        migrations.AlterField(
            model_name='guardian',
            name='city',
            field=models.CharField(max_length=50),
        ),
        migrations.AlterField(
            model_name='patient',
            name='city',
            field=models.CharField(max_length=50),
        ),
    ]
