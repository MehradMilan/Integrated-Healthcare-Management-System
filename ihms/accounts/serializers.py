from rest_framework import serializers
from .models import Doctor, IHMSUser, Guardian, Patient, MedicalFile, DoctorTime


class MedicalFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicalFile
        fields = '__all__'


class PatientSerializer(serializers.ModelSerializer):
    medical_file = MedicalFileSerializer()

    class Meta:
        model = Patient
        fields = '__all__'

    def create(self, validated_data):
        medical_file_data = validated_data.pop('medical_file')
        medical_file = MedicalFile.objects.create(**medical_file_data)
        medical_file.save()
        patient = Patient.objects.create(medical_file=medical_file, **validated_data)
        patient.save()
        return patient

    def update(self, instance, validated_data):
        medical_file_data = validated_data.pop('medical_file')

        medical_file = instance.medical_file

        if medical_file_data:
            for attr, value in medical_file_data.items():
                setattr(medical_file, attr, value)
            medical_file.save()

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance


class DoctorTimeSerializer(serializers.ModelSerializer):
    patient = PatientSerializer()
    class Meta:
        model = DoctorTime
        fields = "__all__"


class IHMSUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = IHMSUser
        fields = ['first_name', 'last_name', 'national_id', 'birthdate', 'gender', 'password']

    def create(self, validated_data):
        instance = super().create(**validated_data)
        instance.set_password(validated_data['password'])
        instance.save()
        return instance

    def update(self, instance, validated_data):
        super().update(instance, validated_data)
        password = validated_data.get('password', None)
        if password:
            instance.set_password(password)
        instance.save()
        return instance


class DoctorSerializer(serializers.ModelSerializer):
    user = IHMSUserSerializer()

    class Meta:
        model = Doctor
        exclude = ['is_active']

    def create(self, validated_data):
        user_data = validated_data.pop('user')
        user = IHMSUser.objects.create_user(**user_data)
        user.save()
        doctor = Doctor.objects.create(user=user, **validated_data)
        return doctor

    def update(self, instance, validated_data):
        print(f"{validated_data=}")
        user_data = validated_data.pop('user', None)
        user = instance.user
        if user_data:
            for attr, value in user_data.items():
                setattr(user, attr, value)
            user.save()

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance


class GuardianSerializer(serializers.ModelSerializer):
    user = IHMSUserSerializer()

    class Meta:
        model = Guardian
        fields = '__all__'

    def create(self, validated_data):
        user_data = validated_data.pop('user')
        user = IHMSUser.objects.create_user(**user_data)
        print(f"{user_data=}")
        guardian = Guardian.objects.create(user=user, **validated_data)
        return guardian

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', None)
        user = instance.user

        if user_data:
            for attr, value in user_data.items():
                setattr(user, attr, value)
            user.save()

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance
