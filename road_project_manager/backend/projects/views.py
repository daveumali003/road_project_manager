from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django_filters.rest_framework import DjangoFilterBackend
from .models import RoadProject, RoadSegment, ProjectPhoto, ProjectUpdate
from .serializers import (
    RoadProjectSerializer, RoadSegmentSerializer,
    ProjectPhotoSerializer, ProjectUpdateSerializer
)


class RoadProjectViewSet(viewsets.ModelViewSet):
    queryset = RoadProject.objects.all()
    serializer_class = RoadProjectSerializer
    permission_classes = [permissions.AllowAny]  # Allow unauthenticated access for POC
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status', 'priority', 'created_by']

    def perform_create(self, serializer):
        # For POC: handle anonymous users by creating/using a default user
        if self.request.user.is_authenticated:
            serializer.save(created_by=self.request.user)
        else:
            from django.contrib.auth.models import User
            # Get or create a default user for POC testing
            default_user, created = User.objects.get_or_create(
                username='poc_user',
                defaults={'email': 'poc@example.com', 'first_name': 'POC', 'last_name': 'User'}
            )
            serializer.save(created_by=default_user)

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
            # Simple distance calculation (not precise, but works for testing)
            lat_float = float(lat)
            lng_float = float(lng)
            radius_float = float(radius)

            # Simple bounding box calculation (approximately 1 degree = 111km)
            lat_delta = radius_float / 111.0
            lng_delta = radius_float / 111.0

            projects = RoadProject.objects.filter(
                latitude__isnull=False,
                longitude__isnull=False,
                latitude__range=[lat_float - lat_delta, lat_float + lat_delta],
                longitude__range=[lng_float - lng_delta, lng_float + lng_delta]
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
        serializer.save(uploaded_by=self.request.user)


class ProjectUpdateViewSet(viewsets.ModelViewSet):
    queryset = ProjectUpdate.objects.all()
    serializer_class = ProjectUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['project']

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


# Authentication Views
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_view(request):
    """
    Login endpoint that returns an authentication token
    """
    username = request.data.get('username')
    password = request.data.get('password')
    
    if not username or not password:
        return Response(
            {'error': 'Username and password are required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    user = authenticate(username=username, password=password)
    
    if user is not None:
        if user.is_active:
            token, created = Token.objects.get_or_create(user=user)
            return Response({
                'token': token.key,
                'user_id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
            })
        else:
            return Response(
                {'error': 'Account is disabled'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
    else:
        return Response(
            {'error': 'Invalid username or password'}, 
            status=status.HTTP_401_UNAUTHORIZED
        )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def logout_view(request):
    """
    Logout endpoint that deletes the authentication token
    """
    try:
        request.user.auth_token.delete()
        return Response({'message': 'Successfully logged out'})
    except:
        return Response({'message': 'Already logged out'})


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_profile_view(request):
    """
    Get current user profile information
    """
    user = request.user
    return Response({
        'user_id': user.id,
        'username': user.username,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'is_staff': user.is_staff,
        'is_superuser': user.is_superuser,
        'date_joined': user.date_joined,
    })