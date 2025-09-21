import React, { useState, useEffect } from 'react';

const EditProjectForm = ({ project, onSave, onCancel, onEditShape }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'planned',
    priority: 'medium',
    budget: '',
    color: '#3388ff'
  });

  // Initialize form data when project prop changes
  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || '',
        description: project.description || '',
        status: project.status || 'planned',
        priority: project.priority || 'medium',
        budget: project.budget ? project.budget.toString() : '',
        color: project.polyline_color || project.color || '#3388ff'
      });
    }
  }, [project]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const updatedProjectData = {
      ...formData,
      polyline_color: formData.color,
      budget: formData.budget ? parseFloat(formData.budget) : null
    };

    onSave(project.id, updatedProjectData);
  };

  if (!project) return null;

  return (
    <div className="project-form-overlay">
      <div className="project-form">
        <h3>Edit Road Project</h3>
        <p>Editing: {project.name}</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="edit-name">Project Name:</label>
            <input
              type="text"
              id="edit-name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="edit-description">Description:</label>
            <textarea
              id="edit-description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
            />
          </div>

          <div className="form-group">
            <label htmlFor="edit-status">Status:</label>
            <select
              id="edit-status"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="planned">Planned</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="on_hold">On Hold</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="edit-priority">Priority:</label>
            <select
              id="edit-priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="edit-budget">Budget (USD):</label>
            <input
              type="number"
              id="edit-budget"
              name="budget"
              value={formData.budget}
              onChange={handleChange}
              min="0"
              step="0.01"
            />
          </div>

          <div className="form-group">
            <label htmlFor="edit-color">Polyline Color:</label>
            <input
              type="color"
              id="edit-color"
              name="color"
              value={formData.color}
              onChange={handleChange}
              style={{
                width: '100%',
                height: '40px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={onCancel}>Cancel</button>
            {project && project.polyline_coordinates && (
              <button type="button" onClick={() => onEditShape(project)} className="edit-shape-btn">
                Edit Shape
              </button>
            )}
            <button type="submit">Update Project</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProjectForm;