import React, { useState } from 'react';

const DataTable = ({ layer, onClose, onRowClick, onEdit, onDelete }) => {
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  if (!layer || !layer.data) return null;

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedData = [...layer.data].sort((a, b) => {
    if (!sortField) return 0;

    const aVal = a[sortField];
    const bVal = b[sortField];

    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Define columns based on layer type
  const getColumns = () => {
    if (layer.type === 'road_projects') {
      return [
        { key: 'id', label: 'ID', width: '60px' },
        { key: 'name', label: 'Project Name', width: '200px' },
        { key: 'status', label: 'Status', width: '120px' },
        { key: 'priority', label: 'Priority', width: '100px' },
        { key: 'budget', label: 'Budget', width: '120px' },
        { key: 'polyline_color', label: 'Color', width: '80px' },
        { key: 'created_at', label: 'Created', width: '120px' },
      ];
    }
    // Add more layer types here in the future
    return [];
  };

  const columns = getColumns();

  const formatCellValue = (row, column) => {
    const value = row[column.key];

    switch (column.key) {
      case 'budget':
        return value ? `$${Number(value).toLocaleString()}` : '';
      case 'polyline_color':
        return value ? (
          <div
            className="color-cell"
            style={{
              backgroundColor: value,
              width: '20px',
              height: '20px',
              borderRadius: '4px',
              border: '1px solid #ccc'
            }}
            title={value}
          />
        ) : '';
      case 'created_at':
        return value ? new Date(value).toLocaleDateString() : '';
      case 'status':
        return value ? value.replace('_', ' ') : '';
      default:
        return value || '';
    }
  };

  return (
    <div className="data-table-container">
      <div className="data-table-header">
        <div className="table-title">
          <h4>{layer.name} Data</h4>
          <span className="table-count">{sortedData.length} items</span>
        </div>
        <div className="table-actions">
          <button className="close-table-btn" onClick={onClose}>×</button>
        </div>
      </div>

      <div className="data-table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  style={{ width: column.width }}
                  onClick={() => handleSort(column.key)}
                  className={`sortable ${sortField === column.key ? `sorted-${sortDirection}` : ''}`}
                >
                  {column.label}
                  {sortField === column.key && (
                    <span className="sort-indicator">
                      {sortDirection === 'asc' ? ' ↑' : ' ↓'}
                    </span>
                  )}
                </th>
              ))}
              <th width="120px">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row) => (
              <tr
                key={row.id}
                onClick={() => onRowClick && onRowClick(row)}
                className="table-row"
              >
                {columns.map((column) => (
                  <td key={column.key} style={{ width: column.width }}>
                    {formatCellValue(row, column)}
                  </td>
                ))}
                <td className="actions-cell">
                  <button
                    className="table-edit-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit && onEdit(row);
                    }}
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button
                    className="table-delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(`Are you sure you want to delete "${row.name}"? This action cannot be undone.`)) {
                        onDelete && onDelete(row.id);
                      }
                    }}
                    title="Delete"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;