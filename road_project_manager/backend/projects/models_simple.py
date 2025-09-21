from django.db import models
from django.contrib.auth.models import User


class RoadProject(models.Model):
    STATUS_CHOICES = [
        ('planned', 'Planned'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('on_hold', 'On Hold'),
    ]

    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]

    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='planned')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')
    budget = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_projects')
    assigned_to = models.ManyToManyField(User, blank=True, related_name='assigned_projects')

    # Simple location fields instead of PostGIS
    latitude = models.FloatField(null=True, blank=True, help_text="Project center latitude")
    longitude = models.FloatField(null=True, blank=True, help_text="Project center longitude")

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.name


class RoadSegment(models.Model):
    ROAD_TYPE_CHOICES = [
        ('highway', 'Highway'),
        ('arterial', 'Arterial'),
        ('collector', 'Collector'),
        ('local', 'Local'),
    ]

    SURFACE_TYPE_CHOICES = [
        ('asphalt', 'Asphalt'),
        ('concrete', 'Concrete'),
        ('gravel', 'Gravel'),
        ('dirt', 'Dirt'),
    ]

    project = models.ForeignKey(RoadProject, on_delete=models.CASCADE, related_name='road_segments')
    name = models.CharField(max_length=200)
    road_type = models.CharField(max_length=20, choices=ROAD_TYPE_CHOICES)
    surface_type = models.CharField(max_length=20, choices=SURFACE_TYPE_CHOICES)
    length_km = models.FloatField(help_text="Length in kilometers")
    width_m = models.FloatField(help_text="Width in meters")

    # Simple start/end coordinates instead of PostGIS LineString
    start_latitude = models.FloatField(help_text="Start point latitude")
    start_longitude = models.FloatField(help_text="Start point longitude")
    end_latitude = models.FloatField(help_text="End point latitude")
    end_longitude = models.FloatField(help_text="End point longitude")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.project.name})"


class ProjectPhoto(models.Model):
    project = models.ForeignKey(RoadProject, on_delete=models.CASCADE, related_name='photos')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to='project_photos/')

    # Simple coordinates instead of PostGIS Point
    latitude = models.FloatField(null=True, blank=True, help_text="Photo latitude")
    longitude = models.FloatField(null=True, blank=True, help_text="Photo longitude")

    taken_at = models.DateTimeField(auto_now_add=True)
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE)

    class Meta:
        ordering = ['-taken_at']

    def __str__(self):
        return f"{self.title} - {self.project.name}"


class ProjectUpdate(models.Model):
    project = models.ForeignKey(RoadProject, on_delete=models.CASCADE, related_name='updates')
    title = models.CharField(max_length=200)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.project.name}"