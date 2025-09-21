import React from 'react';

const LayerControl = ({ layers, onLayerToggle, onShowTable, onCreateNew }) => {
  return (
    <div className="layer-control">
      <h4>Layers</h4>
      <div className="layer-list">
        {layers.map((layer) => (
          <div key={layer.id} className="layer-item">
            <div className="layer-header">
              <label className="layer-checkbox">
                <input
                  type="checkbox"
                  checked={layer.visible}
                  onChange={() => onLayerToggle(layer.id)}
                />
                <span className="layer-name">{layer.name}</span>
              </label>
              <div className="layer-actions">
                <button
                  className="create-btn"
                  onClick={() => onCreateNew && onCreateNew(layer)}
                  title="Create new"
                >
                  ➕
                </button>
                <button
                  className="table-btn"
                  onClick={() => onShowTable(layer)}
                  title="View table"
                >
                  📊
                </button>
              </div>
            </div>
            <div className="layer-info">
              <span className="layer-count">{layer.data?.length || 0} items</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LayerControl;