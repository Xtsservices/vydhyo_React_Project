import React, { useState } from 'react';
import { Activity, Stethoscope } from 'lucide-react';
import '../../stylings/EPrescription.css';

const VitalsInvestigation = () => {
  const [vitals, setVitals] = useState({
    bp: '',
    pulseRate: '',
    respiratoryRate: '',
    temperature: '',
    spo2: '',
    height: '',
    weight: '',
    bmi: ''
  });

  const [investigationFindings, setInvestigationFindings] = useState('');

  const handleVitalChange = (field, value) => {
    setVitals(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateBMI = (weight, height) => {
    if (weight && height) {
      const heightInMeters = height / 100;
      const bmi = weight / (heightInMeters * heightInMeters);
      return bmi.toFixed(1);
    }
    return '';
  };

  const handleWeightOrHeightChange = (field, value) => {
    const newVitals = { ...vitals, [field]: value };
    
    if (field === 'weight' || field === 'height') {
      newVitals.bmi = calculateBMI(
        field === 'weight' ? value : vitals.weight,
        field === 'height' ? value : vitals.height
      );
    }
    
    setVitals(newVitals);
  };

  const handleCancel = () => {
    setVitals({
      bp: '',
      pulseRate: '',
      respiratoryRate: '',
      temperature: '',
      spo2: '',
      height: '',
      weight: '',
      bmi: ''
    });
    setInvestigationFindings('');
  };

  const handleNext = () => {
    console.log('Vitals:', vitals);
    console.log('Investigation Findings:', investigationFindings);
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
              value={vitals.bp}
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
              value={vitals.pulseRate}
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
              value={vitals.respiratoryRate}
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
              value={vitals.temperature}
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
              value={vitals.spo2}
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
              value={vitals.height}
              onChange={(e) => handleWeightOrHeightChange('height', e.target.value)}
              className="vitals-input"
            />
          </div>

          {/* Weight */}
          <div className="vitals-input-group">
            <label className="vitals-label">Weight (kg)</label>
            <input
              type="number"
              placeholder=""
              value={vitals.weight}
              onChange={(e) => handleWeightOrHeightChange('weight', e.target.value)}
              className="vitals-input"
            />
          </div>

          {/* BMI */}
          <div className="vitals-input-group">
            <label className="vitals-label">BMI (kg/m²)</label>
            <input
              type="text"
              placeholder=""
              value={vitals.bmi}
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
            value={investigationFindings}
            onChange={(e) => setInvestigationFindings(e.target.value)}
            className="investigation-textarea"
          />
        </div>
      </div>

      <div className="vitals-button-container">
        <button 
          className="vitals-button vitals-cancel-button" 
          onClick={handleCancel}
        >
          Cancel
        </button>
        <button 
          className="vitals-button vitals-next-button" 
          onClick={handleNext}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default VitalsInvestigation;