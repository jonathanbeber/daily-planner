import React, { useState } from 'react';
import '../styles/CategoryManager.css';

export default function CategoryManager({ categories, onAddCategory, onUpdateCategory, onDeleteCategory }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', color: '#3498db', goal: 1 });
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
      setFormData({ name: '', color: '#3498db', goal: 1 });
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
    setFormData({ name: '', color: '#3498db', goal: 1 });
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
                  onClick={() => onDeleteCategory(category.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
