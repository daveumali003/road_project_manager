import React from 'react';

const ProjectList = ({ projects, selectedProject, onProjectSelect, onProjectDelete, onProjectEdit }) => {
  const getStatusBadgeClass = (status) => {
    return `status-badge status-${status}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'Not set';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const handleDeleteClick = (e, projectId) => {
    e.stopPropagation(); // Prevent triggering project selection

    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      onProjectDelete(projectId);
    }
  };

  const handleEditClick = (e, project) => {
    e.stopPropagation(); // Prevent triggering project selection
    onProjectEdit(project);
  };

  return (
    <div className="project-list">
      {projects.length === 0 ? (
        <div className="no-projects">
          <p>No projects found.</p>
          <p>Create your first road project to get started!</p>
        </div>
      ) : (
        projects.map((project) => {
          const props = project.properties || project;
          const isSelected = selectedProject && selectedProject.id === project.id;

          return (
            <div
              key={project.id}
              className={`project-card ${isSelected ? 'selected' : ''}`}
              onClick={() => onProjectSelect(project)}
            >
              <div className="project-header">
                <h3>{props.name}</h3>
                <div className="project-actions">
                  <span className={getStatusBadgeClass(props.status)}>
                    {props.status}
                  </span>
                  <button
                    className="edit-btn"
                    onClick={(e) => handleEditClick(e, project)}
                    title="Edit project"
                  >
                    ✎
                  </button>
                  <button
                    className="delete-btn"
                    onClick={(e) => handleDeleteClick(e, project.id)}
                    title="Delete project"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="project-details">
                <p><strong>Priority:</strong> {props.priority}</p>
                {props.budget && (
                  <p><strong>Budget:</strong> {formatCurrency(props.budget)}</p>
                )}
                <p><strong>Start Date:</strong> {formatDate(props.start_date)}</p>
                <p><strong>End Date:</strong> {formatDate(props.end_date)}</p>
                {props.created_by_name && (
                  <p><strong>Created by:</strong> {props.created_by_name}</p>
                )}
              </div>

              {props.description && (
                <div className="project-description">
                  <p>{props.description.length > 100
                    ? `${props.description.substring(0, 100)}...`
                    : props.description}
                  </p>
                </div>
              )}

              <div className="project-meta">
                <small>
                  Created: {formatDate(props.created_at)}
                </small>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default ProjectList;