import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import MapView from './components/MapView';
import EditProjectForm from './components/EditProjectForm';
import ProjectPreview from './components/ProjectPreview';
import LayerControl from './components/LayerControl';
import DataTable from './components/DataTable';
import Login from './components/Login';
import { projectService, authService } from './services/api';

function App() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingProject, setEditingProject] = useState(null);
  const [editingPolyline, setEditingPolyline] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [layers, setLayers] = useState([
    {
      id: 'road_projects',
      name: 'Road Projects',
      type: 'road_projects',
      visible: true,
      data: []
    }
  ]);
  const [activeTable, setActiveTable] = useState(null);
  const [startDrawing, setStartDrawing] = useState(false);

  useEffect(() => {
    checkAuthentication();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadProjects();
    }
  }, [isAuthenticated]);

  const checkAuthentication = () => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsAuthenticated(true);
    }
    setAuthLoading(false);
  };

  const loadProjects = async () => {
    try {
      console.log('Loading projects...');
      const data = await projectService.getAll();
      // API returns paginated results in data.results
      const projectsData = data.results || data.features || data;
      console.log('Loaded projects:', projectsData);
      setProjects(projectsData);

      // Update road projects layer data
      setLayers(prevLayers =>
        prevLayers.map(layer =>
          layer.id === 'road_projects'
            ? { ...layer, data: projectsData }
            : layer
        )
      );

      setLoading(false);
    } catch (error) {
      console.error('Error loading projects:', error);
      setLoading(false);
    }
  };

  const handleProjectSelect = (project) => {
    setSelectedProject(project);
  };

  const handleClosePreview = () => {
    setSelectedProject(null);
  };

  const handleLayerToggle = (layerId) => {
    setLayers(prevLayers =>
      prevLayers.map(layer =>
        layer.id === layerId
          ? { ...layer, visible: !layer.visible }
          : layer
      )
    );
  };

  const handleShowTable = (layer) => {
    setActiveTable(layer);
  };

  const handleCloseTable = () => {
    setActiveTable(null);
  };

  const handleTableRowClick = (row) => {
    // Handle row click based on layer type
    if (activeTable?.type === 'road_projects') {
      setSelectedProject(row);
    }
  };

  const handleCreateNew = (layer) => {
    if (layer.type === 'road_projects') {
      setStartDrawing(true);
      // Reset after triggering
      setTimeout(() => setStartDrawing(false), 100);
    }
  };

  const handleProjectCreate = async (projectData) => {
    try {
      const newProject = await projectService.create(projectData);
      // Reload projects to show the new one
      loadProjects();
      return newProject;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  };

  const handleProjectDelete = async (projectId) => {
    try {
      await projectService.delete(projectId);
      // Clear selection if deleted project was selected
      if (selectedProject && selectedProject.id === projectId) {
        setSelectedProject(null);
      }
      // Reload projects to reflect the deletion
      loadProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Error deleting project. Please try again.');
    }
  };

  const handleProjectEdit = (project) => {
    setEditingProject(project);
  };

  const handleProjectUpdate = async (projectId, updatedData) => {
    try {
      console.log('Updating project with data:', updatedData);
      const updatedProject = await projectService.update(projectId, updatedData);
      console.log('Update response:', updatedProject);

      // Close edit form
      setEditingProject(null);

      // Update the project in the local state immediately
      setProjects(prevProjects =>
        prevProjects.map(project =>
          project.id === projectId
            ? { ...project, ...updatedData, polyline_color: updatedData.polyline_color }
            : project
        )
      );

      // Update selected project if it's the one being edited
      if (selectedProject && selectedProject.id === projectId) {
        setSelectedProject(prev => ({ ...prev, ...updatedData, polyline_color: updatedData.polyline_color }));
      }

      // Also reload projects to ensure consistency
      await loadProjects();
    } catch (error) {
      console.error('Error updating project:', error);
      alert('Error updating project. Please try again.');
    }
  };

  const handleEditCancel = () => {
    setEditingProject(null);
  };

  const handleEditShape = (project) => {
    setEditingPolyline(project);
    setEditingProject(null); // Close the edit form
  };

  const handlePolylineEdit = async (projectId, newVertices) => {
    if (projectId === null) {
      // Cancel editing
      setEditingPolyline(null);
      return;
    }

    try {
      // Update project with new polyline coordinates
      const centerLat = newVertices.reduce((sum, coord) => sum + coord[0], 0) / newVertices.length;
      const centerLng = newVertices.reduce((sum, coord) => sum + coord[1], 0) / newVertices.length;

      // Get current project data first to include required fields
      const currentProject = await projectService.getById(projectId);

      const updateData = {
        name: currentProject.name,
        description: currentProject.description || '',
        status: currentProject.status,
        priority: currentProject.priority,
        budget: currentProject.budget,
        start_date: currentProject.start_date,
        end_date: currentProject.end_date,
        polyline_coordinates: newVertices,
        polyline_color: currentProject.polyline_color,
        latitude: centerLat,
        longitude: centerLng
      };

      console.log('Updating project', projectId, 'with data:', updateData);
      await projectService.update(projectId, updateData);

      // Clear editing state
      setEditingPolyline(null);

      // Reload projects to reflect changes
      await loadProjects();

      // Update selected project if it's the one being edited
      if (selectedProject && selectedProject.id === projectId) {
        const updatedProject = await projectService.getById(projectId);
        setSelectedProject(updatedProject);
      }
    } catch (error) {
      console.error('Error updating polyline:', error);
      alert('Error updating polyline. Please try again.');
    }
  };

  const handleLoginSuccess = (userData) => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setProjects([]);
    setSelectedProject(null);
    setEditingProject(null);
    setEditingPolyline(null);
    setActiveTable(null);
  };

  // Show loading spinner while checking authentication
  if (authLoading) {
    return (
      <div className="app-loading">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={
            !isAuthenticated ? (
              <Login onLoginSuccess={handleLoginSuccess} />
            ) : (
              <Navigate to="/" replace />
            )
          } />
          <Route path="/" element={
            isAuthenticated ? (
              <div className="app-container">
                {/* Navigation Header */}
                <div className="app-header">
                  <h1>Road Project Manager</h1>
                  <button onClick={handleLogout} className="logout-button">
                    Logout
                  </button>
                </div>

                <div className="app-main">
                  <MapView
                    projects={layers.find(l => l.id === 'road_projects')?.visible ? projects : []}
                    selectedProject={selectedProject}
                    onProjectSelect={handleProjectSelect}
                    onProjectCreate={handleProjectCreate}
                    editingPolyline={editingPolyline}
                    onPolylineEdit={handlePolylineEdit}
                    startDrawing={startDrawing}
                  />
                </div>

                {/* Layer Control */}
                <LayerControl
                  layers={layers}
                  onLayerToggle={handleLayerToggle}
                  onShowTable={handleShowTable}
                  onCreateNew={handleCreateNew}
                />
              </div>
            ) : (
              <Navigate to="/login" replace />
            )
          } />
        </Routes>

        {/* Edit project form modal */}
        {editingProject && (
          <EditProjectForm
            project={editingProject}
            onSave={handleProjectUpdate}
            onCancel={handleEditCancel}
            onEditShape={handleEditShape}
          />
        )}

        {/* Project preview popup */}
        {selectedProject && !editingProject && (
          <ProjectPreview
            project={selectedProject}
            onClose={handleClosePreview}
            onEdit={handleProjectEdit}
            onDelete={handleProjectDelete}
          />
        )}

        {/* Data Table */}
        {activeTable && (
          <DataTable
            layer={layers.find(l => l.id === activeTable.id) || activeTable}
            onClose={handleCloseTable}
            onRowClick={handleTableRowClick}
            onEdit={handleProjectEdit}
            onDelete={handleProjectDelete}
          />
        )}
      </div>
    </Router>
  );
}

export default App;