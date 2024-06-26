from rest_framework import serializers
from .models import Doctor, IHMSUser, Guardian


class IHMSUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = IHMSUser
        fields = ['national_id', 'birthdate', 'gender']


class DoctorSerializer(serializers.ModelSerializer):
    user = IHMSUserSerializer()

    class Meta:
        model = Doctor
        fields = '__all__'

    def create(self, validated_data):
        user_data = validated_data.pop('user')
        user = IHMSUser.objects.create(**user_data)
        doctor = Doctor.objects.create(user=user, **validated_data)
        return doctor

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


class GuardianSerializer(serializers.ModelSerializer):
    user = IHMSUserSerializer()

    class Meta:
        model = Guardian
        fields = '__all__'

    def create(self, validated_data):
        user_data = validated_data.pop('user')
        user = IHMSUser.objects.create(**user_data)
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
