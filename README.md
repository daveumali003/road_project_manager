# Road Project Manager

A comprehensive web mapping application for managing road infrastructure projects with geospatial capabilities.

## Features

- 🗺️ **Interactive Web Maps** - Visualize project areas and road geometries using Leaflet
- 📱 **Mobile Companion App** - Android app for field data collection
- 🗃️ **PostGIS Integration** - Store and query geospatial road project data
- 📊 **Project Management** - Track status, budgets, timelines, and progress
- 📸 **Geotagged Photos** - Document projects with location-aware imagery
- ☁️ **AWS Ready** - Production deployment on AWS with Docker

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- SQLite (included with Python, for development)
- PostgreSQL with PostGIS extension (for production)
- Docker (optional, for PostGIS setup)

### Option 1: Development Setup (Current - SQLite)

```bash
# Activate virtual environment
.venv\Scripts\activate  # Windows
source .venv/bin/activate  # Unix/MacOS

# Install dependencies
pip install -r road_project_manager/requirements.txt

# Backend setup with SQLite
cd road_project_manager/backend
python manage.py migrate --settings=road_project_manager.settings_test
python manage.py createsuperuser --settings=road_project_manager.settings_test
python manage.py runserver --settings=road_project_manager.settings_test

# Frontend setup (in new terminal)
cd road_project_manager/frontend
npm install
npm start

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000/api/
# Django Admin: http://localhost:8000/admin (admin/admin123)
```

### Option 2: Production Setup (PostGIS)

```bash
# Switch to PostGIS models first
cd road_project_manager/backend/projects
cp models.py models_simple.py  # backup
cp models_postgis.py models.py
cp admin_postgis.py admin.py

# Setup environment
cp road_project_manager/backend/.env.example road_project_manager/backend/.env
# Edit .env with your PostgreSQL credentials

# Run migrations and start server
cd road_project_manager/backend
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### Option 3: Docker Compose (For PostGIS Testing)

```bash
docker-compose up --build
```


## Project Structure

```
road_project_manager/
├── backend/                 # Django REST API with PostGIS
│   ├── projects/           # Main app with geospatial models
│   ├── road_project_manager/  # Django settings
│   └── requirements.txt    # Python dependencies
├── frontend/               # React web application
│   ├── src/
│   │   ├── components/     # React components
│   │   └── services/       # API client
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
2. **Frontend**: Create React components in `src/components/`
3. **Android**: Add Kotlin activities and fragments in the Android project

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

# Create a new project
curl -X POST -H "Authorization: Token 67ef279f2525274ec5a6a6470436047824fe1ada" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Project", "status": "planned", "latitude": 40.7, "longitude": -73.9}' \
  "http://localhost:8000/api/projects/"

# Find nearby projects
curl -H "Authorization: Token 67ef279f2525274ec5a6a6470436047824fe1ada" \
  "http://localhost:8000/api/projects/nearby/?lat=40.7&lng=-73.9&radius=50"
```

Current implementation uses simple lat/lng coordinates. Production version supports full GeoJSON format.

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