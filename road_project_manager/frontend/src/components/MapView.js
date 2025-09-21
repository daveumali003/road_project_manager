import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, Polyline, useMapEvents, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import ProjectForm from './ProjectForm';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Drawing component that handles map clicks
const DrawingHandler = ({ drawingMode, editMode, onAddPoint, onFinishDrawing, onAddVertex }) => {
  useMapEvents({
    click(e) {
      if (drawingMode) {
        onAddPoint([e.latlng.lat, e.latlng.lng]);
      } else if (editMode) {
        onAddVertex(e.latlng);
      }
    },
    dblclick(e) {
      if (drawingMode) {
        e.originalEvent.preventDefault();
        onFinishDrawing();
      }
    }
  });
  return null;
};

const MapView = ({ projects, selectedProject, onProjectSelect, onProjectCreate, editingPolyline, onPolylineEdit }) => {
  const mapRef = useRef();
  const [drawingMode, setDrawingMode] = useState(false);
  const [currentPolyline, setCurrentPolyline] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingVertices, setEditingVertices] = useState([]);
  const [editMode, setEditMode] = useState(false);

  // Default map center (you can change this to your area of interest)
  const defaultCenter = [8.2280, 124.2452]; // Mindanao, Philippines
  const defaultZoom = 8;

  useEffect(() => {
    if (selectedProject && mapRef.current) {
      // Zoom to selected project if it has geometry
      if (selectedProject.geometry) {
        const map = mapRef.current;
        const geoJsonLayer = L.geoJSON(selectedProject.geometry);
        map.fitBounds(geoJsonLayer.getBounds());
      }
    }
  }, [selectedProject]);

  // Initialize editing vertices when editing polyline changes
  useEffect(() => {
    if (editingPolyline && editingPolyline.polyline_coordinates) {
      setEditingVertices([...editingPolyline.polyline_coordinates]);
      setEditMode(true);
    } else {
      setEditingVertices([]);
      setEditMode(false);
    }
  }, [editingPolyline]);

  const getProjectStyle = (project) => {
    const isSelected = selectedProject && selectedProject.id === project.id;
    let color = '#3388ff';

    // Color by status
    switch (project.properties?.status) {
      case 'planned':
        color = '#ffc107';
        break;
      case 'in_progress':
        color = '#28a745';
        break;
      case 'completed':
        color = '#17a2b8';
        break;
      case 'on_hold':
        color = '#dc3545';
        break;
      default:
        color = '#3388ff';
    }

    return {
      color: color,
      weight: isSelected ? 4 : 2,
      opacity: 1,
      fillOpacity: isSelected ? 0.7 : 0.3,
    };
  };

  // Drawing functions
  const handleAddPoint = (point) => {
    setCurrentPolyline(prev => [...prev, point]);
  };

  const handleFinishDrawing = () => {
    if (currentPolyline.length >= 2) {
      setShowForm(true);
      setDrawingMode(false);
    }
  };

  const handleStartDrawing = () => {
    setCurrentPolyline([]);
    setDrawingMode(true);
  };

  const handleCancelDrawing = () => {
    setCurrentPolyline([]);
    setDrawingMode(false);
    setShowForm(false);
  };

  const handleSaveProject = async (projectData) => {
    try {
      if (onProjectCreate) {
        await onProjectCreate(projectData);
      }
      setCurrentPolyline([]);
      setShowForm(false);
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Error creating project. Please try again.');
    }
  };

  // Polyline editing functions
  const handleVertexDrag = (index, newPosition) => {
    console.log('Vertex drag:', index, newPosition);
    const newVertices = [...editingVertices];
    newVertices[index] = [newPosition.lat, newPosition.lng];
    setEditingVertices(newVertices);
  };

  const handleVertexDelete = (index) => {
    console.log('Vertex delete:', index, 'Current vertices:', editingVertices.length);
    if (editingVertices.length > 2) { // Keep at least 2 vertices
      const newVertices = editingVertices.filter((_, i) => i !== index);
      setEditingVertices(newVertices);
    } else {
      console.log('Cannot delete vertex: minimum 2 vertices required');
    }
  };

  const handleAddVertex = (position) => {
    // Find the best place to insert the new vertex (between closest existing vertices)
    let insertIndex = editingVertices.length;
    let minDistance = Infinity;

    for (let i = 0; i < editingVertices.length - 1; i++) {
      const segmentDistance = getDistanceToSegment(position, editingVertices[i], editingVertices[i + 1]);
      if (segmentDistance < minDistance) {
        minDistance = segmentDistance;
        insertIndex = i + 1;
      }
    }

    const newVertices = [...editingVertices];
    newVertices.splice(insertIndex, 0, [position.lat, position.lng]);
    setEditingVertices(newVertices);
  };

  const getDistanceToSegment = (point, start, end) => {
    // Simple distance calculation for finding closest segment
    const startDist = Math.sqrt(Math.pow(point.lat - start[0], 2) + Math.pow(point.lng - start[1], 2));
    const endDist = Math.sqrt(Math.pow(point.lat - end[0], 2) + Math.pow(point.lng - end[1], 2));
    return (startDist + endDist) / 2;
  };

  const handleSavePolylineEdit = () => {
    console.log('Saving polyline edit for project:', editingPolyline.id);
    console.log('New vertices:', editingVertices);
    if (onPolylineEdit && editingPolyline) {
      onPolylineEdit(editingPolyline.id, editingVertices);
    }
  };

  const handleCancelPolylineEdit = () => {
    if (onPolylineEdit) {
      onPolylineEdit(null, null); // Cancel editing
    }
  };

  const onEachFeature = (feature, layer) => {
    layer.on({
      click: () => {
        onProjectSelect(feature);
      },
    });

    // Add popup with project info
    const popupContent = `
      <div>
        <h3>${feature.properties.name}</h3>
        <p><strong>Status:</strong> ${feature.properties.status}</p>
        <p><strong>Priority:</strong> ${feature.properties.priority}</p>
        ${feature.properties.description ? `<p>${feature.properties.description}</p>` : ''}
      </div>
    `;
    layer.bindPopup(popupContent);
  };

  return (
    <>
      <div className="map-controls">
        {!editMode ? (
          <>
            <button
              onClick={drawingMode ? handleCancelDrawing : handleStartDrawing}
              className={drawingMode ? 'cancel-btn' : 'draw-btn'}
            >
              {drawingMode ? 'Cancel Drawing' : 'Draw New Road Project'}
            </button>
            {drawingMode && (
              <div className="drawing-instructions">
                Click on map to add points. Double-click to finish.
              </div>
            )}
          </>
        ) : (
          <>
            <button
              onClick={handleSavePolylineEdit}
              className="draw-btn"
            >
              Save Changes
            </button>
            <button
              onClick={handleCancelPolylineEdit}
              className="cancel-btn"
            >
              Cancel Edit
            </button>
            <div className="drawing-instructions">
              Drag vertices to move, click to add, double-click vertex to delete.
            </div>
          </>
        )}
      </div>

      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        style={{ height: '100vh', width: '100%' }}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <DrawingHandler
          drawingMode={drawingMode}
          editMode={editMode}
          onAddPoint={handleAddPoint}
          onFinishDrawing={handleFinishDrawing}
          onAddVertex={handleAddVertex}
        />

        {/* Render current drawing polyline */}
        {currentPolyline.length > 0 && (
          <Polyline
            positions={currentPolyline}
            color="red"
            weight={4}
            opacity={0.8}
          />
        )}

        {/* Render existing project polylines */}
        {projects
          .filter(project => project.polyline_coordinates && project.polyline_coordinates.length > 1)
          .filter(project => !editingPolyline || project.id !== editingPolyline.id) // Hide if being edited
          .map((project) => (
            <Polyline
              key={`polyline-${project.id}`}
              positions={project.polyline_coordinates}
              color={project.status === 'completed' ? 'green' :
                     project.status === 'in_progress' ? 'blue' :
                     project.status === 'on_hold' ? 'orange' : 'gray'}
              weight={3}
              opacity={0.7}
              eventHandlers={{
                click: () => onProjectSelect(project),
              }}
            />
          ))
        }

        {/* Render editing polyline with vertices */}
        {editMode && editingVertices.length > 1 && (
          <>
            <Polyline
              positions={editingVertices}
              color="purple"
              weight={4}
              opacity={0.8}
            />
            {editingVertices.map((vertex, index) => (
              <Marker
                key={`vertex-${index}`}
                position={vertex}
                draggable={true}
                icon={L.icon({
                  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
                    <svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="8" cy="8" r="6" fill="purple" stroke="white" stroke-width="2"/>
                    </svg>
                  `),
                  iconSize: [16, 16],
                  iconAnchor: [8, 8]
                })}
                eventHandlers={{
                  dragend: (e) => {
                    console.log('Dragend event fired for vertex', index);
                    handleVertexDrag(index, e.target.getLatLng());
                  },
                  dblclick: (e) => {
                    console.log('Dblclick event fired for vertex', index);
                    e.originalEvent.stopPropagation();
                    handleVertexDelete(index);
                  },
                  click: (e) => {
                    console.log('Click event on vertex', index);
                    e.originalEvent.stopPropagation();
                  }
                }}
              />
            ))}
          </>
        )}

        {/* Render project geometries */}
        {projects.map((project) => {
          if (project.geometry) {
            return (
              <GeoJSON
                key={project.id}
                data={project}
                style={() => getProjectStyle(project)}
                onEachFeature={onEachFeature}
              />
            );
          }
          return null;
        })}

        {/* Add markers for projects with latitude/longitude but no polyline */}
        {projects
          .filter(project => project.latitude && project.longitude && (!project.polyline_coordinates || project.polyline_coordinates.length < 2))
          .map((project) => (
            <Marker
              key={project.id}
              position={[project.latitude, project.longitude]}
              eventHandlers={{
                click: () => onProjectSelect(project),
              }}
            >
              <Popup>
                <div>
                  <h3>{project.name}</h3>
                  <p><strong>Status:</strong> {project.status}</p>
                  <p><strong>Priority:</strong> {project.priority}</p>
                  {project.description && <p>{project.description}</p>}
                  {project.budget && <p><strong>Budget:</strong> ${project.budget}</p>}
                </div>
              </Popup>
            </Marker>
          ))
        }
      </MapContainer>

      {/* Project creation form modal */}
      {showForm && (
        <ProjectForm
          coordinates={currentPolyline}
          onSave={handleSaveProject}
          onCancel={handleCancelDrawing}
        />
      )}
    </>
  );
};

export default MapView;