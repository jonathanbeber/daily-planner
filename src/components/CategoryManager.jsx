import React, { useState } from 'react';
import '../styles/CategoryManager.css';

// Default time blocks for one category; every new day is seeded with them.
function TemplateEditor({ category, onUpdateCategory }) {
  const [start, setStart] = useState('09:00');
  const [end, setEnd] = useState('10:00');
  const templates = category.templates || [];

  const addTemplate = (e) => {
    e.preventDefault();
    if (!start || !end || end <= start) return;
    onUpdateCategory(category.id, {
      templates: [...templates, { id: Date.now(), startTime: start, endTime: end }],
    });
  };

  const removeTemplate = (id) => {
    onUpdateCategory(category.id, { templates: templates.filter(t => t.id !== id) });
  };

  return (
    <div className="template-editor">
      <span className="template-label">Default times</span>
      <div className="template-list">
        {templates.map(t => (
          <span key={t.id} className="template-chip" style={{ borderColor: category.color }}>
            {t.startTime}–{t.endTime}
            <button
              type="button"
              className="template-remove"
              onClick={() => removeTemplate(t.id)}
              title="Remove default time"
            >
              ×
            </button>
          </span>
        ))}
        <form className="template-form" onSubmit={addTemplate}>
          <input type="time" step="60" value={start} onChange={(e) => setStart(e.target.value)} />
          <span>–</span>
          <input type="time" step="60" value={end} onChange={(e) => setEnd(e.target.value)} />
          <button type="submit" className="btn btn-small btn-edit" disabled={!start || !end || end <= start}>
            + Add
          </button>
        </form>
      </div>
    </div>
  );
}

export default function CategoryManager({ categories, onAddCategory, onUpdateCategory, onDeleteCategory }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', color: '#5b6b7a', goal: 1 });
  const [editingId, setEditingId] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name.trim()) {
      if (editingId) {
        onUpdateCategory(editingId, formData);
        setEditingId(null);
      } else {
        onAddCategory(formData);
      }
      setFormData({ name: '', color: '#5b6b7a', goal: 1 });
      setShowForm(false);
    }
  };

  const handleEdit = (category) => {
    setFormData({ name: category.name, color: category.color, goal: category.goal });
    setEditingId(category.id);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ name: '', color: '#5b6b7a', goal: 1 });
  };

  return (
    <div className="category-manager">
      <div className="manager-header">
        <h2>Manage Categories</h2>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '✕ Cancel' : '+ Add Category'}
        </button>
      </div>

      {showForm && (
        <form className="category-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Category Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Work, Study, Gym"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Color</label>
              <div className="color-picker">
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                />
                <span className="color-value">{formData.color}</span>
              </div>
            </div>

            <div className="form-group">
              <label>Daily Goal (hours)</label>
              <input
                type="number"
                min="0.5"
                step="0.5"
                value={formData.goal}
                onChange={(e) => setFormData({ ...formData, goal: parseFloat(e.target.value) })}
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-success">
              {editingId ? 'Update' : 'Add'} Category
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="categories-list">
        {categories.length === 0 ? (
          <p className="empty-message">No categories yet. Add one to get started!</p>
        ) : (
          categories.map(category => (
            <div key={category.id} className="category-card">
              <div className="category-main">
                <div className="category-info">
                  <div className="category-color" style={{ backgroundColor: category.color }}></div>
                  <div className="category-details">
                    <h3>{category.name}</h3>
                    <p className="goal-info">Goal: {category.goal} hours/day</p>
                  </div>
                </div>
                <div className="category-actions">
                  <button
                    className="btn btn-small btn-edit"
                    onClick={() => handleEdit(category)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-small btn-delete"
                    onClick={() => {
                      if (window.confirm(`Delete "${category.name}" and all its time entries?`)) onDeleteCategory(category.id);
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
              <TemplateEditor category={category} onUpdateCategory={onUpdateCategory} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
