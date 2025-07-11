import React, { useState, useEffect } from 'react';
import { Activity, Stethoscope } from 'lucide-react';
import '../../stylings/EPrescription.css';

const VitalsInvestigation = ({ formData, updateFormData }) => {
  const [localData, setLocalData] = useState({
    bp: '',
    pulseRate: '',
    respiratoryRate: '',
    temperature: '',
    spo2: '',
    height: '',
    weight: '',
    bmi: '',
    investigationFindings: ''
  });

  useEffect(() => {
    if (formData && Object.keys(formData).length > 0) {
      setLocalData(formData);
    }
  }, [formData]);

  const handleVitalChange = (field, value) => {
    const updatedData = {
      ...localData,
      [field]: value
    };
    
    // Calculate BMI if weight or height changes
    if (field === 'weight' || field === 'height') {
      updatedData.bmi = calculateBMI(
        field === 'weight' ? value : updatedData.weight,
        field === 'height' ? value : updatedData.height
      );
    }
    
    setLocalData(updatedData);
    updateFormData(updatedData);
  };

  const calculateBMI = (weight, height) => {
    if (weight && height) {
      const heightInMeters = height / 100;
      const bmi = weight / (heightInMeters * heightInMeters);
      return bmi.toFixed(1);
    }
    return '';
  };

  const handleCancel = () => {
    const resetData = {
      bp: '',
      pulseRate: '',
      respiratoryRate: '',
      temperature: '',
      spo2: '',
      height: '',
      weight: '',
      bmi: '',
      investigationFindings: ''
    };
    setLocalData(resetData);
    updateFormData(resetData);
  };

  return (
    <div className="vitals-container">
      {/* Vitals Section */}
      <div className="vitals-section">
        <div className="vitals-section-header">
          <div className="vitals-icon-container blue-icon">
            <Activity size={16} />
          </div>
          <h2 className="vitals-section-title">Vitals</h2>
        </div>

        <div className="vitals-grid">
          {/* BP */}
          <div className="vitals-input-group">
            <label className="vitals-label">BP (mmHg)</label>
            <input
              type="text"
              placeholder=""
              value={localData.bp}
              onChange={(e) => handleVitalChange('bp', e.target.value)}
              className="vitals-input"
            />
          </div>

          {/* Pulse Rate */}
          <div className="vitals-input-group">
            <label className="vitals-label">Pulse Rate (bpm)</label>
            <input
              type="number"
              placeholder=""
              value={localData.pulseRate}
              onChange={(e) => handleVitalChange('pulseRate', e.target.value)}
              className="vitals-input"
            />
          </div>

          {/* Respiratory Rate */}
          <div className="vitals-input-group">
            <label className="vitals-label">Respiratory Rate (bpm)</label>
            <input
              type="number"
              placeholder=""
              value={localData.respiratoryRate}
              onChange={(e) => handleVitalChange('respiratoryRate', e.target.value)}
              className="vitals-input"
            />
          </div>

          {/* Temperature */}
          <div className="vitals-input-group">
            <label className="vitals-label">Temperature (°F)</label>
            <input
              type="number"
              step="0.1"
              placeholder=""
              value={localData.temperature}
              onChange={(e) => handleVitalChange('temperature', e.target.value)}
              className="vitals-input"
            />
          </div>

          {/* SpO2 */}
          <div className="vitals-input-group">
            <label className="vitals-label">SpO2 (%)</label>
            <input
              type="number"
              placeholder=""
              value={localData.spo2}
              onChange={(e) => handleVitalChange('spo2', e.target.value)}
              className="vitals-input"
            />
          </div>

          {/* Height */}
          <div className="vitals-input-group">
            <label className="vitals-label">Height (cm)</label>
            <input
              type="number"
              placeholder=""
              value={localData.height}
              onChange={(e) => handleVitalChange('height', e.target.value)}
              className="vitals-input"
            />
          </div>

          {/* Weight */}
          <div className="vitals-input-group">
            <label className="vitals-label">Weight (kg)</label>
            <input
              type="number"
              placeholder=""
              value={localData.weight}
              onChange={(e) => handleVitalChange('weight', e.target.value)}
              className="vitals-input"
            />
          </div>

          {/* BMI */}
          <div className="vitals-input-group">
            <label className="vitals-label">BMI (kg/m²)</label>
            <input
              type="text"
              placeholder=""
              value={localData.bmi}
              readOnly
              className="vitals-input vitals-input-readonly"
            />
          </div>
        </div>
      </div>

      {/* Investigation Section */}
      <div className="vitals-section">
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
      </div>

     
    </div>
  );
};

export default VitalsInvestigation;