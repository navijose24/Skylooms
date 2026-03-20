from rest_framework import serializers
from .models import Cab

class CabSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cab
        fields = '__all__'
