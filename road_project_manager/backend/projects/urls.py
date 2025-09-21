from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'projects', views.RoadProjectViewSet)
router.register(r'segments', views.RoadSegmentViewSet)
router.register(r'photos', views.ProjectPhotoViewSet)
router.register(r'updates', views.ProjectUpdateViewSet)

urlpatterns = [
    path('', include(router.urls)),
]