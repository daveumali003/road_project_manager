# Road Project Manager

A comprehensive multi-layer GIS web application for managing road infrastructure projects with advanced geospatial mapping capabilities.

## Features

- 🗺️ **Multi-Layer GIS Interface** - Professional mapping interface with layer controls, data tables, and toggleable visibility
- ✏️ **Advanced Polyline Editing** - Interactive vertex manipulation with drag, add, and delete capabilities
- 🎨 **Custom Polyline Colors** - Visual project differentiation with user-selectable color schemes
- 📊 **Interactive Data Tables** - Sortable bottom-positioned tables with real-time updates and CRUD operations
- 🖱️ **Click-to-Preview System** - Clean map-first UI with popup project details and actions
- 📱 **Mobile Companion App** - Android app for field data collection
- 🗃️ **PostGIS Integration** - Store and query geospatial road project data with dual model support
- 📈 **Real-time Project Management** - Track status, budgets, timelines, and progress with immediate updates
- 📸 **Geotagged Photos** - Document projects with location-aware imagery
- ☁️ **AWS Ready** - Production deployment on AWS with Docker

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- Docker Desktop (for PostgreSQL database)
- Git (for version control)

### Development Setup (Current - PostgreSQL)

**First-time setup:**

```bash
# Activate virtual environment
.venv\Scripts\activate  # Windows
source .venv/bin/activate  # Unix/MacOS

# Install dependencies
pip install -r road_project_manager/requirements.txt

# Start PostgreSQL database with Docker
docker-compose up -d db

# Backend setup
cd road_project_manager/backend
python manage.py migrate
python manage.py createsuperuser  # Create admin account
python manage.py runserver  # Terminal 1

# Frontend setup (in new terminal)
cd road_project_manager/frontend
npm install
npm start  # Terminal 2

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000/api/
# Django Admin: http://localhost:8000/admin
```

### Quick Start After PC Restart

**Daily startup steps:**

```bash
# 1. Start Docker Desktop (from Windows Start menu)

# 2. Navigate to project and activate virtual environment
cd "path\to\your\project"
.venv\Scripts\activate

# 3. Start PostgreSQL database
docker-compose up -d db

# 4. Start backend server (Terminal 1)
cd road_project_manager\backend
python manage.py runserver

# 5. Start frontend server (Terminal 2)
cd road_project_manager\frontend
npm start

# Your app is now running with all data preserved!
```

### Alternative: One-Command Startup

```bash
# Start everything at once (all services in one terminal)
docker-compose up
```

### Legacy SQLite Setup (If Needed)

```bash
# Fallback option using SQLite instead of PostgreSQL
cd road_project_manager/backend
python manage.py migrate --settings=road_project_manager.settings_test
python manage.py runserver --settings=road_project_manager.settings_test
```


## Project Structure

```
road_project_manager/
├── backend/                 # Django REST API with dual model support
│   ├── projects/           # Main app with geospatial models (SQLite + PostGIS)
│   │   ├── models.py       # Currently active SQLite models
│   │   ├── models_postgis.py # Production PostGIS models
│   │   ├── serializers.py  # REST API serializers
│   │   ├── views.py        # API endpoints with geographic features
│   │   └── admin.py        # Admin interface with map widgets
│   ├── road_project_manager/  # Django settings
│   │   ├── settings.py     # PostGIS production settings
│   │   └── settings_test.py # SQLite development settings
│   └── requirements.txt    # Python dependencies
├── frontend/               # React web application with Leaflet
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── MapView.js  # Main mapping with advanced editing
│   │   │   ├── LayerControl.js # Layer management panel
│   │   │   ├── DataTable.js # Interactive data tables
│   │   │   ├── ProjectForm.js # Project creation forms
│   │   │   ├── EditProjectForm.js # Project editing forms
│   │   │   └── ProjectPreview.js # Click-to-preview popups
│   │   └── services/       # API client with authentication
│   └── package.json
├── android/                # Android mobile app
│   ├── app/
│   └── build.gradle
├── docker-compose.yml      # Local development setup
├── aws-infrastructure.yml  # AWS CloudFormation template
└── .github/workflows/      # CI/CD pipeline
```

## Development Workflow

### Adding New Features

1. **Backend**: Add models in `projects/models.py`, create serializers, views, and URLs
2. **Frontend**: Create React components in `src/components/`, integrate with layer system and data tables
3. **Multi-Layer Integration**: Update LayerControl.js and App.js for new layer types
4. **Android**: Add Kotlin activities and fragments in the Android project

### Current Interface Overview

The application features a sophisticated multi-layer GIS interface:

- **Layer Control Panel** (Left): Toggle layer visibility, create new projects (➕), view data tables (📊)
- **Interactive Map** (Center): Click-to-preview popups, polyline editing, real-time visualization
- **Drawing Controls** (Right): Appear during drawing/editing to avoid layer control interference
- **Data Tables** (Bottom): Sortable tables with CRUD operations, taking up to 50% screen height

### Working with Projects

1. **Create**: Click ➕ in "Road Projects" layer → draw polyline → fill form with color picker
2. **View**: Click any polyline to open preview popup with project details
3. **Edit**: Use "Edit Project" button in popup or edit button (✏️) in data table
4. **Shape Edit**: Use "Edit Shape" to enter vertex editing mode with drag/add/delete
5. **Delete**: Use delete button with confirmation in popup or table (🗑️)
6. **Table View**: Click 📊 to open sortable data table at bottom of screen

### Database Migrations

```bash
cd road_project_manager/backend
# For development (SQLite)
python manage.py makemigrations --settings=road_project_manager.settings_test
python manage.py migrate --settings=road_project_manager.settings_test

# For production (PostGIS)
python manage.py makemigrations
python manage.py migrate
```

### Running Tests

```bash
# Backend tests
cd road_project_manager/backend
python manage.py test --settings=road_project_manager.settings_test

# Frontend tests
cd road_project_manager/frontend
npm test
```

## Deployment to AWS

### Infrastructure Setup

1. Deploy AWS infrastructure:
```bash
aws cloudformation deploy \
  --template-file aws-infrastructure.yml \
  --stack-name road-project-manager-infrastructure \
  --capabilities CAPABILITY_IAM
```

2. Configure GitHub secrets for CI/CD:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`

3. Push to `main` branch to trigger automatic deployment

### Manual AWS Setup

Required AWS services:
- **RDS**: PostgreSQL with PostGIS
- **ECS**: Container orchestration
- **ECR**: Docker image registry
- **S3**: Static file storage
- **ALB**: Load balancer

## API Documentation

The Django REST API provides endpoints for:

- `/api/projects/` - CRUD operations for road projects
- `/api/segments/` - Road segment management
- `/api/photos/` - Project photo uploads
- `/api/updates/` - Project status updates

### Testing the API

```bash
# Get authentication token (admin/admin123)
# Current token: 67ef279f2525274ec5a6a6470436047824fe1ada

# List all projects
curl -H "Authorization: Token 67ef279f2525274ec5a6a6470436047824fe1ada" \
  "http://localhost:8000/api/projects/"

# Create a new project with polyline and custom color
curl -X POST -H "Authorization: Token 67ef279f2525274ec5a6a6470436047824fe1ada" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Project", "status": "planned", "latitude": 40.7, "longitude": -73.9, "polyline_coordinates": [[40.7128, -74.0060], [40.7130, -74.0065]], "polyline_color": "#ff5733"}' \
  "http://localhost:8000/api/projects/"

# Find nearby projects
curl -H "Authorization: Token 67ef279f2525274ec5a6a6470436047824fe1ada" \
  "http://localhost:8000/api/projects/nearby/?lat=40.7&lng=-73.9&radius=50"
```

Current implementation supports:
- Simple lat/lng coordinates for project centers
- JSON arrays for polyline coordinates: `[[lat, lng], [lat, lng], ...]`
- Custom polyline colors as hex strings: `#ff5733`
- Real-time updates and advanced vertex editing
- Production version supports full GeoJSON format with PostGIS

## Mobile App Setup

1. Open `road_project_manager/android` in Android Studio
2. Add your Google Maps API key to `app/src/main/res/values/strings.xml`
3. Update the API base URL to point to your backend

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

[Your License Here]