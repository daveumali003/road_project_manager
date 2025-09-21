from django.contrib import admin
from django.contrib.gis.admin import OSMGeoAdmin
from .models import RoadProject, RoadSegment, ProjectPhoto, ProjectUpdate


@admin.register(RoadProject)
class RoadProjectAdmin(OSMGeoAdmin):
    list_display = ['name', 'status', 'priority', 'created_by', 'created_at']
    list_filter = ['status', 'priority', 'created_at']
    search_fields = ['name', 'description']
    readonly_fields = ['created_at', 'updated_at']
    filter_horizontal = ['assigned_to']
    modifiable = False  # Makes geometry fields editable


@admin.register(RoadSegment)
class RoadSegmentAdmin(OSMGeoAdmin):
    list_display = ['name', 'project', 'road_type', 'surface_type', 'length_km']
    list_filter = ['road_type', 'surface_type', 'project']
    search_fields = ['name', 'project__name']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(ProjectPhoto)
class ProjectPhotoAdmin(OSMGeoAdmin):
    list_display = ['title', 'project', 'uploaded_by', 'taken_at']
    list_filter = ['project', 'taken_at']
    search_fields = ['title', 'description', 'project__name']
    readonly_fields = ['taken_at']


@admin.register(ProjectUpdate)
class ProjectUpdateAdmin(admin.ModelAdmin):
    list_display = ['title', 'project', 'created_by', 'created_at']
    list_filter = ['project', 'created_at']
    search_fields = ['title', 'content', 'project__name']
    readonly_fields = ['created_at']