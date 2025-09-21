from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.contrib.gis.geos import Point
from django.contrib.gis.measure import Distance
from .models import RoadProject, RoadSegment, ProjectPhoto, ProjectUpdate
from .serializers import (
    RoadProjectSerializer, RoadSegmentSerializer,
    ProjectPhotoSerializer, ProjectUpdateSerializer
)


class RoadProjectViewSet(viewsets.ModelViewSet):
    queryset = RoadProject.objects.all()
    serializer_class = RoadProjectSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status', 'priority', 'created_by']

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=False, methods=['get'])
    def nearby(self, request):
        """Get projects near a specific location"""
        lat = request.query_params.get('lat')
        lng = request.query_params.get('lng')
        radius = request.query_params.get('radius', 10)  # Default 10km

        if not lat or not lng:
            return Response(
                {'error': 'lat and lng parameters are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            point = Point(float(lng), float(lat), srid=4326)
            projects = RoadProject.objects.filter(
                project_area__distance_lte=(point, Distance(km=float(radius)))
            )
            serializer = self.get_serializer(projects, many=True)
            return Response(serializer.data)
        except ValueError:
            return Response(
                {'error': 'Invalid coordinates'},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['get'])
    def segments(self, request, pk=None):
        """Get all road segments for a project"""
        project = self.get_object()
        segments = project.road_segments.all()
        serializer = RoadSegmentSerializer(segments, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def photos(self, request, pk=None):
        """Get all photos for a project"""
        project = self.get_object()
        photos = project.photos.all()
        serializer = ProjectPhotoSerializer(photos, many=True)
        return Response(serializer.data)


class RoadSegmentViewSet(viewsets.ModelViewSet):
    queryset = RoadSegment.objects.all()
    serializer_class = RoadSegmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['project', 'road_type', 'surface_type']


class ProjectPhotoViewSet(viewsets.ModelViewSet):
    queryset = ProjectPhoto.objects.all()
    serializer_class = ProjectPhotoSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['project']

    def perform_create(self, serializer):
        # Extract location from EXIF data if available
        # This is a simplified version - in production you'd want more robust EXIF handling
        serializer.save(uploaded_by=self.request.user)


class ProjectUpdateViewSet(viewsets.ModelViewSet):
    queryset = ProjectUpdate.objects.all()
    serializer_class = ProjectUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['project']

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)