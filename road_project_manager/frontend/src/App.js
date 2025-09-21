import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import MapView from './components/MapView';
import ProjectList from './components/ProjectList';
import EditProjectForm from './components/EditProjectForm';
import ProjectPreview from './components/ProjectPreview';
import { projectService } from './services/api';

function App() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingProject, setEditingProject] = useState(null);
  const [editingPolyline, setEditingPolyline] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      console.log('Loading projects...');
      const data = await projectService.getAll();
      // API returns paginated results in data.results
      const projectsData = data.results || data.features || data;
      console.log('Loaded projects:', projectsData);
      setProjects(projectsData);
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

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={
            <div className="app-container">
              <MapView
                projects={projects}
                selectedProject={selectedProject}
                onProjectSelect={handleProjectSelect}
                onProjectCreate={handleProjectCreate}
                editingPolyline={editingPolyline}
                onPolylineEdit={handlePolylineEdit}
              />
              {/* Sidebar toggle button */}
              <button
                className="sidebar-toggle"
                onClick={() => setShowSidebar(!showSidebar)}
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: showSidebar ? '320px' : '10px',
                  zIndex: 1001,
                  background: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '8px 12px',
                  cursor: 'pointer',
                  transition: 'right 0.3s ease'
                }}
              >
                {showSidebar ? '×' : '☰'}
              </button>

              {/* Conditional sidebar */}
              {showSidebar && (
                <div className="sidebar">
                  <h2>Road Projects</h2>
                  {loading ? (
                    <p>Loading projects...</p>
                  ) : (
                    <ProjectList
                      projects={projects}
                      selectedProject={selectedProject}
                      onProjectSelect={handleProjectSelect}
                      onProjectDelete={handleProjectDelete}
                      onProjectEdit={handleProjectEdit}
                    />
                  )}
                </div>
              )}
            </div>
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
      </div>
    </Router>
  );
}

export default App;