import React, { useState } from 'react';
import { Plus, X, AlertTriangle } from 'lucide-react';
import '../../stylings/EPrescription.css';

const DiagnosisMedication = () => {
  const [diagnosisList, setDiagnosisList] = useState('');
  const [diagnosticTests, setDiagnosticTests] = useState([
    'ECG (Electrocardiogram)',
    '2D Echo Doppler Study',
    'CT - Cardiac Calcium Scoring'
  ]);
  const [newTestName, setNewTestName] = useState('');
  const [selectedTests, setSelectedTests] = useState([]);
  const [medications, setMedications] = useState([
    {
      id: 1,
      name: '',
      type: 'Tablet',
      timing: 'AF (After Food)',
      dosagePattern: '',
      duration: ''
    }
  ]);

  const addDiagnosticTest = () => {
    if (newTestName.trim() && !diagnosticTests.includes(newTestName.trim())) {
      setDiagnosticTests([...diagnosticTests, newTestName.trim()]);
      setNewTestName('');
    }
  };

  const removeDiagnosticTest = (testToRemove) => {
    setDiagnosticTests(diagnosticTests.filter(test => test !== testToRemove));
    setSelectedTests(selectedTests.filter(test => test !== testToRemove));
  };

  const handleTestSelection = (test, isChecked) => {
    if (isChecked) {
      setSelectedTests([...selectedTests, test]);
    } else {
      setSelectedTests(selectedTests.filter(t => t !== test));
    }
  };

  const addMedication = () => {
    const newMedication = {
      id: Date.now(),
      name: '',
      type: 'Tablet',
      timing: 'AF (After Food)',
      dosagePattern: '',
      duration: ''
    };
    setMedications([...medications, newMedication]);
  };

  const removeMedication = (id) => {
    setMedications(medications.filter(med => med.id !== id));
  };

  const updateMedication = (id, field, value) => {
    setMedications(medications.map(med => 
      med.id === id ? { ...med, [field]: value } : med
    ));
  };

  return (
    <div className="common-container">
      {/* Diagnostic Tests Section */}
      <div className="diagnostic-tests-section">
        <div className="diagnostic-tests-header">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <AlertTriangle style={{ 
              width: '20px', 
              height: '20px', 
              color: '#f59e0b',
              marginRight: '8px'
            }} />
            <h3 className="diagnostic-tests-title">DIAGNOSTIC TESTS</h3>
          </div>
          
          <button
            onClick={addDiagnosticTest}
            className="add-test-button"
          >
            <Plus style={{ width: '16px', height: '16px', marginRight: '4px' }} />
            Add Test
          </button>
        </div>

        {/* Add Test Input */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ 
            display: 'block', 
            fontSize: '14px', 
            fontWeight: '500',
            color: '#92400e',
            marginBottom: '4px'
          }}>
            Add New Test
          </label>
          <input
            type="text"
            value={newTestName}
            onChange={(e) => setNewTestName(e.target.value)}
            placeholder="e.g., Blood Sugar Test"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                addDiagnosticTest();
              }
            }}
            className="test-input"
          />
        </div>
        
        {/* Tests List */}
        <div className="tests-list">
          {diagnosticTests.map((test, index) => (
            <div key={index} className="test-item">
              <label className="test-label">
                <input
                  type="checkbox"
                  checked={selectedTests.includes(test)}
                  onChange={(e) => handleTestSelection(test, e.target.checked)}
                  className="test-checkbox"
                />
                {test}
              </label>
              
              {/* Only show remove button for custom tests (not default ones) */}
              {!['ECG (Electrocardiogram)', '2D Echo Doppler Study', 'CT - Cardiac Calcium Scoring'].includes(test) && (
                <button
                  onClick={() => removeDiagnosticTest(test)}
                  className="remove-test-button"
                >
                  <X style={{ width: '12px', height: '12px' }} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Diagnosis Section */}
      <div className="diagnosis-section">
        <div className="diagnosis-header">
          <div style={{
            width: '20px',
            height: '20px',
            backgroundColor: '#ef4444',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '8px'
          }}>
            <span style={{ 
              color: 'white', 
              fontSize: '12px', 
              fontWeight: 'bold' 
            }}>
              ♥
            </span>
          </div>
          <h3 className="diagnosis-title">DIAGNOSIS</h3>
        </div>
        
        <div style={{ marginBottom: '12px' }}>
          <label style={{ 
            display: 'block', 
            fontSize: '14px', 
            fontWeight: '500',
            color: '#374151',
            marginBottom: '4px'
          }}>
            Diagnosis List
          </label>
          <textarea
            value={diagnosisList}
            onChange={(e) => setDiagnosisList(e.target.value)}
            placeholder="e.g., Systemic Hypertension, Dyslipidemia, Pre Diabetic, Autoimmune Disease"
            className="diagnosis-textarea"
          />
        </div>
      </div>

      {/* Prescribed Medications Section */}
      <div className="medications-section">
        <div className="medications-header">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{
              width: '20px',
              height: '20px',
              backgroundColor: '#8b5cf6',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '8px'
            }}>
              <span style={{ 
                color: 'white', 
                fontSize: '12px', 
                fontWeight: 'bold' 
              }}>
                ℞
              </span>
            </div>
            <h3 className="medications-title">Prescribed Medications</h3>
          </div>
          
          <button
            onClick={addMedication}
            className="add-medication-button"
          >
            <Plus style={{ width: '16px', height: '16px', marginRight: '4px' }} />
            Add Medicine
          </button>
        </div>

        {/* Medications List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {medications.map((medication) => (
            <div key={medication.id} className="medication-item">
              {/* First Row - Medicine Name, Type, Timing */}
              <div className="medication-row">
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '12px', 
                    fontWeight: '500',
                    color: '#6b7280',
                    marginBottom: '4px'
                  }}>
                    Medicine Name
                  </label>
                  <input
                    type="text"
                    value={medication.name}
                    onChange={(e) => updateMedication(medication.id, 'name', e.target.value)}
                    className="medication-field"
                  />
                </div>
                
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '12px', 
                    fontWeight: '500',
                    color: '#6b7280',
                    marginBottom: '4px'
                  }}>
                    Type
                  </label>
                  <select
                    value={medication.type}
                    onChange={(e) => updateMedication(medication.id, 'type', e.target.value)}
                    className="medication-select"
                  >
                    <option value="Tablet">Tablet</option>
                    <option value="Capsule">Capsule</option>
                    <option value="Syrup">Syrup</option>
                    <option value="Injection">Injection</option>
                    <option value="Cream">Cream</option>
                    <option value="Drops">Drops</option>
                  </select>
                </div>
                
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '12px', 
                    fontWeight: '500',
                    color: '#6b7280',
                    marginBottom: '4px'
                  }}>
                    Timing
                  </label>
                  <select
                    value={medication.timing}
                    onChange={(e) => updateMedication(medication.id, 'timing', e.target.value)}
                    className="medication-select"
                  >
                    <option value="AF (After Food)">AF (After Food)</option>
                    <option value="BF (Before Food)">BF (Before Food)</option>
                    <option value="WF (With Food)">WF (With Food)</option>
                    <option value="Empty Stomach">Empty Stomach</option>
                  </select>
                </div>
                
                {medications.length > 1 && (
                  <button
                    onClick={() => removeMedication(medication.id)}
                    className="remove-medication-button"
                  >
                    <X style={{ width: '16px', height: '16px' }} />
                  </button>
                )}
              </div>
              
              {/* Second Row - Dosage Pattern, Duration */}
              <div className="medication-dosage-row">
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '12px', 
                    fontWeight: '500',
                    color: '#6b7280',
                    marginBottom: '4px'
                  }}>
                    Dosage Pattern
                  </label>
                  <input
                    type="text"
                    value={medication.dosagePattern}
                    onChange={(e) => updateMedication(medication.id, 'dosagePattern', e.target.value)}
                    placeholder="e.g., 1-0-0"
                    className="medication-field"
                  />
                </div>
                
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '12px', 
                    fontWeight: '500',
                    color: '#6b7280',
                    marginBottom: '4px'
                  }}>
                    Duration
                  </label>
                  <input
                    type="text"
                    value={medication.duration}
                    onChange={(e) => updateMedication(medication.id, 'duration', e.target.value)}
                    placeholder="e.g., 10 days"
                    className="medication-field"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DiagnosisMedication;