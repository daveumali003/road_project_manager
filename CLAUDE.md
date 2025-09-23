# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a comprehensive road project management application with a multi-platform architecture designed for managing road infrastructure projects with geospatial mapping capabilities:

- **Backend**: Django REST API with PostgreSQL database (Docker-based)
- **Frontend**: React web application with Leaflet mapping and multi-layer GIS interface
- **Android**: Kotlin mobile application with Google Maps
- **Infrastructure**: AWS deployment with Docker containers

## Development Commands

### Backend (Django - Currently Running on PostgreSQL)
```bash
# Activate virtual environment
.venv\Scripts\activate  # Windows
source .venv/bin/activate  # Unix/MacOS

# Install dependencies
pip install -r road_project_manager/requirements.txt

# Start PostgreSQL database (Docker required)
docker-compose up -d db

# Current PostgreSQL setup
cd road_project_manager/backend
python manage.py migrate
python manage.py runserver  # Runs on http://localhost:8000

# Create superuser
python manage.py createsuperuser

# Run tests
python manage.py test

# Legacy SQLite setup (if needed)
python manage.py migrate --settings=road_project_manager.settings_test
python manage.py runserver --settings=road_project_manager.settings_test
```

### Frontend (React)
```bash
cd road_project_manager/frontend
npm install
npm start  # Development server on http://localhost:3000
npm run build  # Production build
npm test  # Run tests

# Note: Package.json includes proxy to localhost:8000 for backend API
```

### Full Stack Development
```bash
# Start PostgreSQL database only (recommended for development)
docker-compose up -d db

# Start backend and frontend separately (in different terminals)
# Terminal 1: Backend
cd road_project_manager/backend && python manage.py runserver

# Terminal 2: Frontend
cd road_project_manager/frontend && npm start

# Access points:
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000/api/
# Django Admin: http://localhost:8000/admin (admin/admin)

# Alternative: Start all services with Docker (optional)
docker-compose up --build
```

### Android Development
- Open `road_project_manager/android` in Android Studio
- Update `strings.xml` with your Google Maps API key
- Update `api_base_url` in `strings.xml` with your backend URL

## Project Architecture

### Backend (Django REST API)
- **Database**: PostgreSQL running in Docker container (postgis/postgis:15-3.3)
- **Models**: RoadProject, RoadSegment, ProjectPhoto, ProjectUpdate
- **Current Setup**: Regular PostgreSQL with JSON coordinates (PostGIS capabilities commented out)
- **Model Features**:
  - JSON polyline coordinates: `[[lat, lng], [lat, lng], ...]`
  - Custom polyline colors with hex codes
  - Standard lat/lng fields for compatibility
  - Future PostGIS fields available but commented out
- **Settings**:
  - `settings.py` for PostgreSQL production (current)
  - `settings_test.py` for SQLite development (legacy)
- **API**: RESTful endpoints with geographic data support and custom actions (nearby, segments, photos)
- **Authentication**: Token-based authentication with login endpoint (`/api/auth/login/`) and full login page
- **Admin**: Standard Django admin interface (PostGIS widgets commented out)
- **Permissions**: Currently `AllowAny` for POC testing

### Frontend (React + Leaflet)
- **Mapping**: Interactive maps with project visualization using Leaflet
- **Multi-Layer Architecture**: Extensible layer system with road projects as the primary layer
- **Components**:
  - `MapView`: Main map component with drawing, editing, and visualization modes
  - `ProjectForm`: Modal for creating new projects after drawing polylines
  - `EditProjectForm`: Modal for editing existing projects with "Edit Shape" button
  - `ProjectPreview`: Click-to-preview popup component for polyline interactions
  - `LayerControl`: Layer management panel with visibility toggles, create new (➕), and table view (📊) buttons
  - `DataTable`: Bottom-positioned sortable table for layer data with row actions
- **User Interface**: Multi-layer GIS-like interface with layer controls on left, drawing controls on right when active
- **API Integration**: Axios client with authentication interceptors and comprehensive service modules (projectService, segmentService, photoService, authService)
- **Dependencies**: React 18, Leaflet 4.2.1, React Router 6, Axios (no Material-UI to avoid conflicts)
- **Authentication**: Full login page with token-based auth stored in localStorage and automatic header injection
- **Map Center**: Default location set to Mindanao, Philippines [8.2280, 124.2452]

### Android (Kotlin)
- **Maps**: Google Maps integration for mobile field work
- **Networking**: Retrofit for API communication
- **Architecture**: MVVM with Navigation Components

## Key Features

- **Multi-Layer GIS Interface**: Extensible layer system with toggleable visibility and data management
- **Interactive Data Tables**: Bottom-positioned sortable tables with CRUD operations and real-time updates
- **Geospatial Data**: Store and visualize project boundaries and road geometries
- **Project Management**: Track status, priority, budget, and timeline with custom polyline colors
- **Advanced Polyline Editing**: Interactive vertex manipulation with drag, add, and delete capabilities
- **Photo Documentation**: Geotagged photos with project association
- **Multi-platform**: Web dashboard and mobile field app
- **Real-time Updates**: Project status and progress tracking with immediate UI synchronization

## Database Models

### Current Implementation (PostgreSQL with JSON Coordinates)
- **RoadProject**: Main project entity with:
  - `latitude`/`longitude` fields for project center point
  - `polyline_coordinates` JSON field storing road polylines as arrays of [lat, lng] points
  - `polyline_color` CharField storing hex color codes (e.g., '#3388ff') for custom polyline colors
  - Standard project fields (name, description, status, priority, budget, dates)
  - Future PostGIS fields commented out (project_area PolygonField)
- **RoadSegment**: Individual road sections with standard fields (PostGIS centerline commented out)
- **ProjectPhoto**: Geotagged images with `latitude`/`longitude` fields (PostGIS location commented out)
- **ProjectUpdate**: Progress updates and communications

### Future PostGIS Implementation (Available but commented out)
- **RoadProject**: `PolygonField` for project areas (requires GDAL setup)
- **RoadSegment**: `LineStringField` for road centerlines
- **ProjectPhoto**: `PointField` for precise geotagging
- **Note**: PostGIS features disabled due to Windows GDAL library requirements

## Deployment

### AWS Infrastructure
- **RDS**: PostgreSQL with PostGIS extension
- **ECS**: Containerized application deployment
- **S3**: Static files and media storage
- **ALB**: Load balancer with SSL termination

### Local Development
Current setup uses PostgreSQL with Docker for development. SQLite setup available as legacy fallback.

### Database Setup Guide
```bash
# Current PostgreSQL setup (recommended)
docker-compose up -d db  # Start PostgreSQL container
cd road_project_manager/backend
python manage.py migrate
python manage.py runserver

# Legacy SQLite setup (if needed)
python manage.py migrate --settings=road_project_manager.settings_test
python manage.py runserver --settings=road_project_manager.settings_test

# Switch between databases by changing Django settings file
```

### Docker Data Management
```bash
# Check database status
docker-compose ps

# View database logs
docker-compose logs db

# Connect to PostgreSQL directly
docker-compose exec db psql -U postgres -d road_projects

# Backup database
docker-compose exec db pg_dump -U postgres road_projects > backup.sql

# Restore database
docker-compose exec -T db psql -U postgres road_projects < backup.sql

# Reset database (CAUTION: Deletes all data)
docker-compose down -v  # Removes volumes
docker-compose up -d db
cd road_project_manager/backend && python manage.py migrate
```

### PostGIS Upgrade Path (Future)
To enable full PostGIS features:
1. Install GDAL libraries on the system
2. Uncomment PostGIS fields in models.py
3. Uncomment `django.contrib.gis` and `rest_framework_gis` in settings
4. Update serializers to use GeoFeatureModelSerializer
5. Run new migrations for geometric fields

### CI/CD
GitHub Actions workflow for automated testing and deployment to AWS.

## Environment Configuration

### Backend Environment Variables
- `SECRET_KEY`: Django secret key
- `DEBUG`: Development mode flag
- `DB_*`: Database connection settings
- `AWS_*`: S3 storage configuration
- `CORS_ALLOWED_ORIGINS`: Frontend URL whitelist

### Frontend Environment Variables
- `REACT_APP_API_URL`: Backend API endpoint

### Required External Services
- PostgreSQL with PostGIS extension (for production)
- Google Maps API key (for Android)
- AWS account (for production deployment)

## Multi-Layer GIS Interface (COMPLETE)

### Layer Management & Project Creation
The application features a comprehensive multi-layer GIS-like interface:

**Layer Control System:**
1. **Layer Panel**: Located on the left side with layer visibility toggles (✓)
2. **Create New Projects**: Click the ➕ button next to "Road Projects" layer to start drawing
3. **Table View**: Click the 📊 button to open sortable data tables at bottom of screen
4. **Layer Visibility**: Toggle individual layers on/off to control map display

**Map-Based Project Creation:**
1. Click the ➕ button in the "Road Projects" layer control
2. Click on the map to add points to the polyline
3. Double-click to finish drawing
4. Fill out the project form that appears with color picker
5. Click "Create Project" to save

**Project Interaction & Management:**
1. **Click-to-Preview**: Click any polyline on the map to open a popup preview with project details
2. **Preview Actions**: From the popup, click "Edit Project" or "Delete Project" (with confirmation)
3. **Edit Project Details**: Edit name, description, status, priority, budget, and polyline color
4. **Shape Editing**: Click "Edit Shape" to enter polyline vertex editing mode
5. **Table Management**: Use data tables for bulk operations, sorting, and detailed view

**Advanced Polyline Vertex Editing:**
- **Drag Vertices**: Purple circle markers allow dragging to move vertices
- **Delete Vertices**: Double-click any vertex to delete it (minimum 2 vertices required)
- **Add Vertices**: Click anywhere on the map to add new vertices at optimal positions
- **Visual Feedback**: Purple polyline with white-filled circle markers during editing
- **Save/Cancel**: Map controls positioned on right side to avoid layer control interference

**Data Table Features:**
- **Bottom-Positioned Interface**: Tables appear at bottom taking up to 50% screen height
- **Sortable Columns**: Click column headers to sort by any field (status, priority, budget, etc.)
- **Row Actions**: Edit (✏️) and Delete (🗑️) buttons in each row with confirmation dialogs
- **Real-time Updates**: Tables automatically refresh when projects are created, edited, or deleted
- **Custom Formatting**: Special formatting for colors (color swatches), dates, and currency
- **Row Selection**: Click rows to select projects on map, full integration with map interactions

**Technical Implementation:**
- **Frontend**: React Leaflet with interactive vertex manipulation using draggable Marker components
- **Backend**: JSON storage of polyline coordinates with full CRUD operations
- **Database**: SQLite with JSON field storing arrays of [lat, lng] coordinates
- **API**: RESTful endpoints with complete project lifecycle management
- **State Management**: Complex state handling for layers, editing modes, and table integration
- **Component Architecture**: Modular design with LayerControl, DataTable, MapView coordination

**Features:**
- **Multi-Layer System**: Extensible architecture supporting future layer types beyond road projects
- **Custom Polyline Colors**: Users can select custom colors for polylines with large, visible color picker
- **GIS-Like Interface**: Professional mapping interface with layer controls and data management
- **Automatic Center Calculation**: Project center point automatically calculated from polyline vertices
- **Real-time Updates**: All changes update immediately without page refresh across map and tables
- **Dual Rendering Support**: Both point-based and polyline projects supported
- **Interactive Polyline Preview**: Live polyline preview during creation and editing
- **Seamless Mode Switching**: Between view, create, edit, vertex editing, and table modes
- **Form Validation**: Error handling with user feedback and confirmation dialogs

## Current Development Status

### Working MVP (Minimum Viable Product)
- **Backend**: Django running on SQLite with simplified models ✅
- **Frontend**: React with Leaflet maps running on localhost:3000 ✅
- **API**: Full CRUD operations with token authentication ✅
- **Multi-Layer Interface**: GIS-like layer control system with toggleable visibility ✅
- **Data Tables**: Bottom-positioned sortable tables with real-time updates ✅
- **Project Creation**: Interactive map-based polyline drawing via layer controls ✅
- **Project Editing**: Complete project data editing with modal forms ✅
- **Project Deletion**: Confirmation-based project removal in both popup and table views ✅
- **Polyline Vertex Editing**: Advanced geometry editing with drag/drop/add/delete ✅
- **Custom Polyline Colors**: Color picker integration with real-time updates ✅
- **Click-to-Preview UI**: Interactive popup system for project details ✅
- **Map Location**: Mindanao-centered for Philippines road projects ✅
- **Real-time Updates**: Live project visualization and state management across all interfaces ✅

### Testing Endpoints and Authentication

#### Login via API
```bash
# Login to get authentication token
curl -X POST -H "Content-Type: application/json" \
  -d '{"username": "dave", "password": "admin123"}' \
  http://localhost:8000/api/auth/login/

# Expected response:
# {"token": "32bc09e58f9a29e022b3bf126e5bf122adbf70cd", "user_id": 1, "username": "dave", ...}
```

#### Test Project Endpoints
```bash
# List all projects (authentication required)
curl -H "Authorization: Token YOUR_TOKEN_HERE" \
  "http://localhost:8000/api/projects/"

# Create new project with polyline and custom color
curl -X POST -H "Content-Type: application/json" \
  -H "Authorization: Token YOUR_TOKEN_HERE" \
  -d '{"name": "Test Road", "status": "planned", "latitude": 40.7, "longitude": -73.9, "polyline_coordinates": [[40.7128, -74.0060], [40.7130, -74.0065]], "polyline_color": "#ff5733"}' \
  "http://localhost:8000/api/projects/"

# Test nearby projects
curl -H "Authorization: Token YOUR_TOKEN_HERE" \
  "http://localhost:8000/api/projects/nearby/?lat=40.7&lng=-73.9&radius=50"

# Get user profile
curl -H "Authorization: Token YOUR_TOKEN_HERE" \
  "http://localhost:8000/api/auth/user/"
```

#### Default Credentials
- **Username**: `dave`
- **Password**: `admin123`
- **Note**: Use the login page at http://localhost:3000/login or create your own user via Django admin

### Access Points
- **Frontend**: http://localhost:3000 (redirects to login if not authenticated)
- **Login Page**: http://localhost:3000/login
- **Backend API**: http://localhost:8000/api/
- **Django Admin**: http://localhost:8000/admin (use dave/admin123)

## Development Workflow

### Common Development Patterns

**Adding New Map Features:**
1. Update `MapView.js` component with new state and handlers
2. Add corresponding API endpoints in `projects/views.py`
3. Update frontend `services/api.js` with new service methods
4. Test with both console debugging and UI interaction

**Map State Management:**
- `editingPolyline`: Controls vertex editing mode
- `selectedProject`: Currently selected project for highlighting
- `drawingMode`: Controls polyline creation mode
- State flows: Normal → Drawing → Form → Save → Normal
- State flows: Normal → Select → Edit → (Optional) Shape Edit → Save → Normal

**API Data Flow:**
- All API calls use `projectService.update()` which requires complete project objects for PUT requests
- Polyline coordinates stored as JSON arrays: `[[lat, lng], [lat, lng], ...]`
- Polyline colors stored as hex strings: `"#ff5733"`
- Center point automatically calculated from polyline vertices
- Authentication handled via axios interceptors with localStorage tokens

**User Interface Workflow:**
- **Multi-Layer GIS Interface**: Default view shows map with layer control panel on left side
- **Layer Management**: Toggle layer visibility, create new projects (➕), and open data tables (📊)
- **Drawing Controls**: When active, drawing/editing controls appear on right side to avoid interference
- **Click Interactions**: Click polylines to open detailed preview popups
- **Table Integration**: Bottom-positioned data tables with full CRUD operations and sorting
- **Form Integration**: Color picker inputs with large, visible color selection areas
- **State Management**: Real-time updates without page refresh using immediate local state updates
- **Confirmation Dialogs**: Delete actions require user confirmation with project name display

**Debugging Map Issues:**
- Check browser console for Leaflet errors and component rendering logs
- Verify coordinate format: [latitude, longitude] not [lng, lat]
- Monitor React key changes for polyline re-rendering (includes color in key)
- Test with `console.log()` statements in event handlers
- Ensure proper state transitions between editing modes

## Troubleshooting

### Common Issues

**Database Connection Errors:**
```bash
# Check if PostgreSQL container is running
docker-compose ps

# Restart database if needed
docker-compose restart db

# Check database logs for errors
docker-compose logs db
```

**Frontend/Backend Communication:**
```bash
# Test API connectivity
curl http://localhost:8000/api/projects/

# Check if backend is running
# Should see Django development server output
```

**PostGIS/GDAL Errors:**
- PostGIS features are currently commented out due to Windows GDAL requirements
- Use standard PostgreSQL setup (current configuration)
- For PostGIS: Install OSGeo4W or conda-forge gdal package

**Port Conflicts:**
- Backend: Change port in `python manage.py runserver 8001`
- Frontend: Set `PORT=3001` environment variable for React
- Database: Modify `docker-compose.yml` port mapping