from rest_framework import serializers
from .models import RoadProject, RoadSegment, ProjectPhoto, ProjectUpdate


class RoadProjectSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    assigned_to_names = serializers.StringRelatedField(source='assigned_to', many=True, read_only=True)

    class Meta:
        model = RoadProject
        fields = [
            'id', 'name', 'description', 'status', 'priority', 'budget',
            'start_date', 'end_date', 'latitude', 'longitude',
            'created_at', 'updated_at', 'created_by', 'created_by_name',
            'assigned_to', 'assigned_to_names'
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at']


class RoadSegmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoadSegment
        fields = [
            'id', 'project', 'name', 'road_type', 'surface_type',
            'length_km', 'width_m', 'start_latitude', 'start_longitude',
            'end_latitude', 'end_longitude', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class ProjectPhotoSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.CharField(source='uploaded_by.username', read_only=True)

    class Meta:
        model = ProjectPhoto
        fields = [
            'id', 'project', 'title', 'description', 'image',
            'latitude', 'longitude', 'taken_at', 'uploaded_by', 'uploaded_by_name'
        ]
        read_only_fields = ['uploaded_by', 'taken_at']


class ProjectUpdateSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)

    class Meta:
        model = ProjectUpdate
        fields = [
            'id', 'project', 'title', 'content', 'created_at',
            'created_by', 'created_by_name'
        ]
        read_only_fields = ['created_by', 'created_at']