import React, { useState, useEffect } from 'react';
import { Activity, Stethoscope, Plus, X } from 'lucide-react';
import '../../stylings/EPrescription.css';

const VitalsInvestigation = ({ formData, updateFormData }) => {
  const [localData, setLocalData] = useState({
    bpSystolic: '',
    bpDiastolic: '',
    pulseRate: '',
    respiratoryRate: '',
    temperature: '',
    spo2: '',
    height: '',
    weight: '',
    bmi: '',
    investigationFindings: '',
    other: {}
  });

  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [errors, setErrors] = useState({});

  const validationRules = {
    bpSystolic: { min: 60, max: 200, message: 'Systolic BP must be between 60 and 200 mmHg' },
    bpDiastolic: { min: 40, max: 120, message: 'Diastolic BP must be between 40 and 120 mmHg' },
    pulseRate: { min: 40, max: 180, message: 'Pulse rate must be between 40 and 180 bpm' },
    respiratoryRate: { min: 8, max: 40, message: 'Respiratory rate must be between 8 and 40 breaths/min' },
    temperature: { min: 95, max: 108, message: 'Temperature must be between 95 and 108 °F' },
    spo2: { min: 70, max: 100, message: 'SpO2 must be between 70 and 100%' },
    height: { min: 50, max: 250, message: 'Height must be between 50 and 250 cm' },
    weight: { min: 2, max: 300, message: 'Weight must be between 2 and 300 kg' }
  };

  useEffect(() => {
    if (formData && Object.keys(formData).length > 0) {
      const [bpSystolic, bpDiastolic] = formData.bp && formData.bp !== 'undefined/undefined'
      ? formData.bp.split('/')
      : ['', ''];
    
const updatedData = {
      bpSystolic: formData.bpSystolic || bpSystolic || '',
      bpDiastolic: formData.bpDiastolic || bpDiastolic || '',
      pulseRate: formData.pulseRate || '',
      respiratoryRate: formData.respiratoryRate || '',
      temperature: formData.temperature || '',
      spo2: formData.spo2 || '',
      height: formData.height || '',
      weight: formData.weight || '',
      bmi: formData.bmi || '',
      investigationFindings: formData.investigationFindings || '',
      other: formData.other || {}
    };

    setLocalData(updatedData);
      // setLocalData(formData);
      // validateAllFields(formData);
    }
  }, [formData]);

  const validateField = (field, value) => {
    const rules = validationRules[field];
    if (!rules || value === '' || value === null || value === undefined) return true;

    const numVal = Number(value);
    return !isNaN(numVal) && numVal >= rules.min && numVal <= rules.max;
  };

  const validateAllFields = (data) => {
    const newErrors = {};
    Object.keys(validationRules).forEach((field) => {
      if (data[field] && !validateField(field, data[field])) {
        newErrors[field] = validationRules[field].message;
      }
    });
    setErrors(newErrors);
  };

  const handleVitalChange = (field, value) => {
    const normalizedValue = value === '' ? '' : Number(value) < 0 ? '' : String(value).trim();
    const updatedData = { ...localData, [field]: normalizedValue };

    // Combine bpSystolic and bpDiastolic into bp
  if (field === 'bpSystolic' || field === 'bpDiastolic') {
    const systolic = field === 'bpSystolic' ? normalizedValue : localData.bpSystolic;
    const diastolic = field === 'bpDiastolic' ? normalizedValue : localData.bpDiastolic;
    updatedData.bp = (systolic && diastolic) ? `${systolic}/${diastolic}` : '';
  }
    if (field === 'weight' || field === 'height') {
      updatedData.bmi = calculateBMI(
        field === 'weight' ? normalizedValue : updatedData.weight,
        field === 'height' ? normalizedValue : updatedData.height
      );
    }

    setLocalData(updatedData);
    updateFormData(updatedData);
  };

const handleBlur = (field) => {
  const value = localData[field];

  if (!validateField(field, value)) {
    const updatedData = { ...localData, [field]: '' };

    // Recalculate BMI if height or weight was invalid and got cleared
    if (field === 'height' || field === 'weight') {
      updatedData.bmi = calculateBMI(
        field === 'weight' ? '' : updatedData.weight,
        field === 'height' ? '' : updatedData.height
      );
    }

    setLocalData(updatedData);
    updateFormData(updatedData);

    setErrors((prev) => ({
      ...prev,
      [field]: validationRules[field].message
    }));
  } else {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }
};


  const calculateBMI = (weight, height) => {
    if (weight && height && !isNaN(Number(weight)) && !isNaN(Number(height))) {
      const heightInMeters = Number(height) / 100;
      const bmi = Number(weight) / (heightInMeters * heightInMeters);
      return bmi.toFixed(1);
    }
    return '';
  };

  const handleAddOther = () => {
    if (!newKey.trim() || !newValue.trim()) {
      setErrors((prev) => ({ ...prev, newOther: 'Both key and value are required' }));
      return;
    }

    const updatedData = {
      ...localData,
      other: {
        ...localData.other,
        [newKey.trim()]: newValue.trim()
      }
    };

    setLocalData(updatedData);
    updateFormData(updatedData);
    setNewKey('');
    setNewValue('');
    setErrors((prev) => ({ ...prev, newOther: '' }));
  };

  const handleRemoveOther = (key) => {
    const newOther = { ...localData.other };
    delete newOther[key];
    const updatedData = { ...localData, other: newOther };
    setLocalData(updatedData);
    updateFormData(updatedData);
  };

  const handleCancel = () => {
    const resetData = {
      bpSystolic: '',
      bpDiastolic: '',
      pulseRate: '',
      respiratoryRate: '',
      temperature: '',
      spo2: '',
      height: '',
      weight: '',
      bmi: '',
      investigationFindings: '',
      other: {}
    };
    setLocalData(resetData);
    updateFormData(resetData);
    setErrors({});
  };

  return (
    <div className="vitals-container">
      <div className="vitals-section">
        <div className="vitals-section-header">
          <div className="vitals-icon-container blue-icon">
            <Activity size={16} />
          </div>
          <h2 className="vitals-section-title">Vitals</h2>
        </div>

        <div className="vitals-grid">
          <div className="vitals-input-group bp-group-container">
            <label className="vitals-label">Blood Pressure (mmHg)</label>
            <div className="bp-inputs">
              <input
                type="number"
                placeholder="Systolic"
                value={localData.bpSystolic}
                onChange={(e) => handleVitalChange('bpSystolic', e.target.value)}
                // onBlur={() => handleBlur('bpSystolic')}
                className={`vitals-input bp-input ${errors.bpSystolic ? 'error' : ''}`}
              />
              <span className="bp-slash">/</span>
              <input
                type="number"
                placeholder="Diastolic"
                value={localData.bpDiastolic}
                onChange={(e) => handleVitalChange('bpDiastolic', e.target.value)}
                // onBlur={() => handleBlur('bpDiastolic')}
                className={`vitals-input bp-input ${errors.bpDiastolic ? 'error' : ''}`}
              />
            </div>
            {(errors.bpSystolic || errors.bpDiastolic) && (
              <div className="error-message">
                {errors.bpSystolic || errors.bpDiastolic}
              </div>
            )}
          </div>

          {["pulseRate", "respiratoryRate", "temperature", "spo2", "height", "weight"].map(field => (
            <div className="vitals-input-group" key={field}>
              <label className="vitals-label">
                {field.replace(/([A-Z])/g, ' $1').trim()} 
                ({field === "temperature" ? "°F" : field === "spo2" ? "%" : field === "height" ? "cm" : field === "weight" ? "kg" : "bpm"})
              </label>
              <input
                type="number"
                value={localData[field]}
                onChange={(e) => handleVitalChange(field, e.target.value)}
                // onBlur={() => handleBlur(field)}
                className={`vitals-input ${errors[field] ? 'error' : ''}`}
              />
              {errors[field] && <div className="error-message">{errors[field]}</div>}
            </div>
          ))}

          <div className="vitals-input-group">
            <label className="vitals-label">BMI (kg/m²)</label>
            <input
              type="text"
              value={localData.bmi}
              readOnly
              className="vitals-input vitals-input-readonly"
            />
          </div>
        </div>

<div className="other-vitals-grid">
  {Object.entries(localData.other || {}).map(([key, value]) => (
    <div key={key} className="other-vital-item">
      <div className="other-vital-key">{key}</div>
      <div className="other-vital-value">
        <input
          type="text"
          value={value}
          onChange={(e) => {
            const updatedData = {
              ...localData,
              other: {
                ...localData.other,
                [key]: e.target.value
              }
            };
            setLocalData(updatedData);
            updateFormData(updatedData);
          }}
          className="vitals-input"
        />
      </div>
      <button
        className="remove-other-vital"
        onClick={() => handleRemoveOther(key)}
        aria-label={`Remove ${key}`}
      >
        <X size={14} />
      </button>
    </div>
  ))}
</div>

<div className="add-other-vital">
  <input
    type="text"
    placeholder="Additional Vital"
    value={newKey}
    onChange={(e) => setNewKey(e.target.value)}
    className="vitals-input"
  />:
  <input
    type="text"
    placeholder="Enter.."
    value={newValue}
    onChange={(e) => setNewValue(e.target.value)}
    className="vitals-input"
  />
  <button className="add-other-button" onClick={handleAddOther}>
    <Plus size={16} /> Add
  </button>
</div>
      </div>

      {/* <div className="vitals-section">
        <div className="vitals-section-header">
          <div className="vitals-icon-container green-icon">
            <Stethoscope size={16} />
          </div>
          <div>
            <h2 className="vitals-section-title">Investigation</h2>
            <p className="vitals-section-subtitle">Clinical examination findings and observations</p>
          </div>
        </div>

        <div className="investigation-container">
          <div className="investigation-header">
            <h3 className="investigation-title">Examination Findings</h3>
            <p className="investigation-subtitle">Record all relevant physical examination findings</p>
          </div>
          <textarea
            placeholder="Enter findings from clinical examination..."
            value={localData.investigationFindings}
            onChange={(e) => handleVitalChange('investigationFindings', e.target.value)}
            className="investigation-textarea"
          />
        </div>
      </div> */}

      <div className="vitals-actions">
        <button className="cancel-button" onClick={handleCancel}>
          Clear All
        </button>
      </div>
    </div>
  );
};

export default VitalsInvestigation;
