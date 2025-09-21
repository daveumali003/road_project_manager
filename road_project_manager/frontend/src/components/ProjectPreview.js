import React from 'react';

const ProjectPreview = ({ project, onClose, onEdit, onDelete }) => {
  if (!project) return null;

  const handleDelete = () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${project.name}"?\n\nThis action cannot be undone.`
    );
    if (confirmed) {
      onDelete(project.id);
      onClose(); // Close the preview after deletion
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#28a745';
      case 'in_progress': return '#007bff';
      case 'on_hold': return '#dc3545';
      case 'planned': return '#ffc107';
      default: return '#6c757d';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return '#dc3545';
      case 'high': return '#fd7e14';
      case 'medium': return '#ffc107';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  };

  return (
    <div className="project-preview-overlay" onClick={onClose}>
      <div className="project-preview" onClick={(e) => e.stopPropagation()}>
        <div className="project-preview-header">
          <h3>{project.name}</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="project-preview-content">
          <div className="project-info-row">
            <span className="label">Status:</span>
            <span
              className="status-badge"
              style={{ backgroundColor: getStatusColor(project.status), color: 'white' }}
            >
              {project.status?.replace('_', ' ')}
            </span>
          </div>

          <div className="project-info-row">
            <span className="label">Priority:</span>
            <span
              className="priority-badge"
              style={{ backgroundColor: getPriorityColor(project.priority), color: 'white' }}
            >
              {project.priority}
            </span>
          </div>

          {project.description && (
            <div className="project-info-row">
              <span className="label">Description:</span>
              <span className="value">{project.description}</span>
            </div>
          )}

          {project.budget && (
            <div className="project-info-row">
              <span className="label">Budget:</span>
              <span className="value">${project.budget?.toLocaleString()}</span>
            </div>
          )}

          {project.polyline_color && (
            <div className="project-info-row">
              <span className="label">Polyline Color:</span>
              <div
                className="color-swatch"
                style={{
                  backgroundColor: project.polyline_color,
                  width: '20px',
                  height: '20px',
                  borderRadius: '4px',
                  border: '1px solid #ccc'
                }}
              />
            </div>
          )}

          <div className="project-info-row">
            <span className="label">Created:</span>
            <span className="value">
              {new Date(project.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="project-preview-actions">
          <button className="edit-btn" onClick={() => onEdit(project)}>
            Edit Project
          </button>
          <button className="delete-btn" onClick={handleDelete}>
            Delete Project
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectPreview;