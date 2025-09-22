import React, { useState } from 'react';
import './plant.css';

const PlantForm = ({ onPlantAdded }) => {
  const todayStr = new Date().toISOString().slice(0,10); // YYYY-MM-DD
  const [formData, setFormData] = useState({
    plantId: '',
    name: '',
    description: '',
    plantingDivision: 'A',
    wateringFrequency: '3',
    fertilizingFrequency: '14',
    plantedKg: 0,
    // planting date should be current date and disabled
    plantingDate: todayStr,
    // expected harvest calculated statically based on spice type
    expectedHarvest: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [plantFocusedField, setFocusedField] = useState('');
  const [formProgress, setFormProgress] = useState(0);

  // Static expected harvest durations (in days) per spice
  // NOTE: You can adjust these values at any time
  const harvestDaysByType = {
    CINNAMON: 16,      // example as requested
    PEPPER: 90,        // Black pepper
    CHILI: 60,         // Red chili
    CARDAMOM: 120,     // Cardamom
    TURMERIC: 180      // Turmeric
  };

  // Helper to add days to a date string (YYYY-MM-DD)
  const addDays = (dateStr, days) => {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0,10);
  };

  const divisions = ['A', 'B', 'C'];
  const frequencyOptions = [
    { value: '1', label: 'Daily'  },
    { value: '2', label: 'Every 2 days' },
    { value: '3', label: 'Every 3 days' },
    { value: '7', label: 'Weekly' },
    { value: '14', label: 'Every 2 weeks'},
    { value: '30', label: 'Monthly'}
  ];

  const calculateProgress = () => {
    const fields = ['plantId', 'name', 'description', 'plantingDivision', 'wateringFrequency', 'fertilizingFrequency'];
    const filledFields = fields.filter(field => formData[field] !== '').length;
    return Math.round((filledFields / fields.length) * 100);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      let next = { ...prev, [name]: value };
      // When name (spice) changes, compute expected harvest from static days
      if (name === 'name' && value) {
        const days = harvestDaysByType[value];
        next.expectedHarvest = days ? addDays(next.plantingDate, days) : '';
      }
      return next;
    });
    setFormProgress(calculateProgress());
  };

  const handleFocus = (fieldName) => {
    setFocusedField(fieldName);
  };

  const handleBlur = () => {
    setFocusedField('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
      const response = await fetch(`${API_BASE}/plants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Send plantingDate and expectedHarvest as part of payload (backend may ignore expectedHarvest for now)
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        alert('🌱 Plant added successfully!');
        setFormData({
          plantId: '',
          name: '',
          description: '',
          plantingDivision: 'A',
          wateringFrequency: '3',
          fertilizingFrequency: '14',
          plantedKg: 0,
          plantingDate: todayStr,
          expectedHarvest: ''
        });
        setFormProgress(0);
        if (onPlantAdded) onPlantAdded();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to add plant');
      }
    } catch (err) {
      console.error('Error adding plant:', err);
      setError('Failed to connect to the server');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFieldIcon = (fieldName) => {
    const icons = {
      plantId: '🏷️',
      name: '🌿',
      description: '📝',
      plantingDivision: '🗂️',
      wateringFrequency: '💧',
      fertilizingFrequency: '🌱'
    };
    return icons[fieldName] || '📋';
  };

  return (
    <div className="plant-form-container">
      {/* Simplified header */}
      <h2 className="plant-form-title">Add New Plant</h2>
      <p className="plant-form-subtitle">Create a new plant record for your ecosystem</p>

      {error && (
        <div className="plant-error-message">
          <span className="plant-error-icon">⚠️</span>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="plant-form">
        <div className="plant-form-section">
          <h3 className="plant-section-title">
            <span className="plant-section-icon">📋</span>
            Basic Information
          </h3>
          
          <div className="plant-form-row">
            <div className="plant-form-group plant-modern">
              <label htmlFor="plantId" className="plant-form-label">
                <span className="plant-field-icon">{getFieldIcon('plantId')}</span>
                Plant ID
                <span className="plant-required">*</span>
              </label>
              <div className="plant-input-wrapper">
                <input
                  type="text"
                  id="plantId"
                  name="plantId"
                  value={formData.plantId}
                  onChange={handleChange}
                  onFocus={() => handleFocus('plantId')}
                  onBlur={handleBlur}
                  required
                  className={`plant-form-input plant-modern ${plantFocusedField === 'plantId' ? 'plant-focused' : ''}`}
                  placeholder="Enter unique plant ID"
                />
                <div className="plant-input-hint">Unique identifier for your plant</div>
              </div>
            </div>

            <div className="plant-form-group plant-modern">
              <label htmlFor="name" className="plant-form-label">
                <span className="plant-field-icon">{getFieldIcon('name')}</span>
                Plant Name
                <span className="plant-required">*</span>
              </label>
              <div className="plant-input-wrapper">
                {/* Use a dropdown to keep values consistent with backend enum */}
                <select
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={(e) => {
                    // Map labels to enum values by uppercasing and normalizing
                    const label = e.target.value;
                    setFormData(prev => ({ ...prev, name: label }));
                    setFormProgress(calculateProgress());
                  }}
                  onFocus={() => handleFocus('name')}
                  onBlur={handleBlur}
                  required
                  className={`plant-form-input plant-modern ${plantFocusedField === 'name' ? 'plant-focused' : ''}`}
                >
                  {/* Display-friendly labels mapped to enum values */}
                  <option value="">Select spice</option>
                  <option value="CINNAMON">Cinnamon</option>
                  <option value="PEPPER">Black Pepper</option>
                  <option value="CHILI">Red Chili</option>
                  <option value="CARDAMOM">Cardamom</option>
                  <option value="TURMERIC">Turmeric</option>
                </select>
                <div className="plant-input-hint">Choose a spice type</div>
              </div>
            </div>
          </div>

          {/* System dates (auto-set and not editable) */}
          <div className="plant-form-row">
            <div className="plant-form-group plant-modern">
              <label htmlFor="plantingDate" className="plant-form-label">
                <span className="plant-field-icon">📅</span>
                Planting Date
              </label>
              <div className="plant-input-wrapper">
                <input
                  type="date"
                  id="plantingDate"
                  name="plantingDate"
                  value={formData.plantingDate}
                  disabled
                  className="plant-form-input plant-modern"
                />
                <div className="plant-input-hint">Auto-set to today's date</div>
              </div>
            </div>

            <div className="plant-form-group plant-modern">
              <label htmlFor="expectedHarvest" className="plant-form-label">
                <span className="plant-field-icon">📆</span>
                Expected Harvest
              </label>
              <div className="plant-input-wrapper">
                <input
                  type="date"
                  id="expectedHarvest"
                  name="expectedHarvest"
                  value={formData.expectedHarvest}
                  disabled
                  className="plant-form-input plant-modern"
                />
                <div className="plant-input-hint">Calculated from spice type</div>
              </div>
            </div>
          </div>

          <div className="plant-form-group plant-modern plant-full-width">
            <label htmlFor="description" className="plant-form-label">
              <span className="plant-field-icon">{getFieldIcon('description')}</span>
              Description
              <span className="plant-required">*</span>
            </label>
            <div className="plant-input-wrapper">
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                onFocus={() => handleFocus('description')}
                onBlur={handleBlur}
                required
                rows="3"
                className={`plant-form-textarea plant-modern ${plantFocusedField === 'description' ? 'plant-focused' : ''}`}
                placeholder="Describe your plant's characteristics, care requirements, etc."
              />
              <div className="plant-input-hint">Detailed description of the plant</div>
            </div>
          </div>
        </div>

        <div className="plant-form-section">
          <h3 className="plant-section-title">
            <span className="plant-section-icon">⚙️</span>
            Care Settings
          </h3>
          
          <div className="plant-form-row">
            <div className="plant-form-group plant-modern">
              <label htmlFor="plantingDivision" className="plant-form-label">
                <span className="plant-field-icon">{getFieldIcon('plantingDivision')}</span>
                Planting Division
                <span className="plant-required">*</span>
              </label>
              <div className="plant-input-wrapper">
                <select
                  id="plantingDivision"
                  name="plantingDivision"
                  value={formData.plantingDivision}
                  onChange={handleChange}
                  onFocus={() => handleFocus('plantingDivision')}
                  onBlur={handleBlur}
                  required
                  className={`plant-form-input plant-modern ${plantFocusedField === 'plantingDivision' ? 'plant-focused' : ''}`}
                >
                  {divisions.map(division => (
                    <option key={division} value={division}>
                      Division {division}
                    </option>
                  ))}
                </select>
                <div className="plant-input-hint">Select the planting area division</div>
              </div>
            </div>

            {/* Planted quantity (kg) */}
            <div className="plant-form-group plant-modern">
              <label htmlFor="plantedKg" className="plant-form-label">
                <span className="plant-field-icon">⚖️</span>
                Planted Quantity (kg)
                <span className="plant-required">*</span>
              </label>
              <div className="plant-input-wrapper">
                <input
                  type="number"
                  id="plantedKg"
                  name="plantedKg"
                  min="0"
                  step="0.1"
                  value={formData.plantedKg}
                  onChange={handleChange}
                  onFocus={() => handleFocus('plantedKg')}
                  onBlur={handleBlur}
                  required
                  className={`plant-form-input plant-modern ${plantFocusedField === 'plantedKg' ? 'plant-focused' : ''}`}
                  placeholder="e.g., 10"
                />
                <div className="plant-input-hint">Enter how many kilograms are being planted</div>
              </div>
            </div>

            <div className="plant-form-group plant-modern">
              <label htmlFor="wateringFrequency" className="plant-form-label">
                <span className="plant-field-icon">{getFieldIcon('wateringFrequency')}</span>
                Watering Frequency
                <span className="plant-required">*</span>
              </label>
              <div className="plant-input-wrapper">
                <select
                  id="wateringFrequency"
                  name="wateringFrequency"
                  value={formData.wateringFrequency}
                  onChange={handleChange}
                  onFocus={() => handleFocus('wateringFrequency')}
                  onBlur={handleBlur}
                  required
                  className={`plant-form-input plant-modern ${plantFocusedField === 'wateringFrequency' ? 'plant-focused' : ''}`}
                >
                  {frequencyOptions.map(option => (
                    <option key={`water-${option.value}`} value={option.value}>
                      {option.icon} {option.label}
                    </option>
                  ))}
                </select>
                <div className="plant-input-hint">How often to water this plant</div>
              </div>
            </div>
          </div>

          <div className="plant-form-group plant-modern">
            <label htmlFor="fertilizingFrequency" className="plant-form-label">
              <span className="plant-field-icon">{getFieldIcon('fertilizingFrequency')}</span>
              Fertilizing Frequency
              <span className="plant-required">*</span>
            </label>
            <div className="plant-input-wrapper">
              <select
                id="fertilizingFrequency"
                name="fertilizingFrequency"
                value={formData.fertilizingFrequency}
                onChange={handleChange}
                onFocus={() => handleFocus('fertilizingFrequency')}
                onBlur={handleBlur}
                required
                className={`plant-form-input plant-modern ${plantFocusedField === 'fertilizingFrequency' ? 'plant-focused' : ''}`}
              >
                {frequencyOptions.map(option => (
                  <option key={`fert-${option.value}`} value={option.value}>
                    {option.icon} {option.label}
                  </option>
                ))}
              </select>
              <div className="plant-input-hint">How often to fertilize this plant</div>
            </div>
          </div>
        </div>

        <div className="plant-form-actions">
          <button 
            type="submit" 
            className={`plant-submit-btn plant-modern ${isSubmitting ? 'plant-submitting' : ''}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="plant-spinner"></span>
                Adding Plant...
              </>
            ) : (
              <>
                <span className="plant-btn-icon">🌱</span>
                Add Plant
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PlantForm;
