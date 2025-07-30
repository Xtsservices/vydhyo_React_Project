import React, { useState, useEffect } from 'react';
import { User, FileText, Heart, Users, Stethoscope, Activity, Plus, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import '../../stylings/EPrescription.css';

const capitalizeFirstLetter = (str) => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const PatientVitals = ({ patientData, vitalsData, updateFormData }) => {
  const location = useLocation();
  const [patientLocalData, setPatientLocalData] = useState({
    patientId: location.state?.patientData?.patientId || '',
    patientName: '',
    age: '',
    gender: '',
    mobileNumber: '',
    chiefComplaint: '',
    pastMedicalHistory: '',
    familyMedicalHistory: '',
    physicalExamination: ''
  });

  const [vitalsLocalData, setVitalsLocalData] = useState({
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
    if (patientData && Object.keys(patientData).length > 0) {
      const updatedData = {
        patientId: patientData.patientId || location.state?.patientData?.patientId || '',
        patientName: patientData.patientName || location.state?.patientData?.patientName || '',
        age: patientData.age || location.state?.patientData?.age || '',
        gender: patientData.gender || location.state?.patientData?.gender || '',
        mobileNumber: patientData.mobileNumber || location.state?.patientData?.mobileNumber || '',
        chiefComplaint: capitalizeFirstLetter(patientData.chiefComplaint || location.state?.patientData?.appointmentReason || ''),
        pastMedicalHistory: capitalizeFirstLetter(patientData.pastMedicalHistory || ''),
        familyMedicalHistory: capitalizeFirstLetter(patientData.familyMedicalHistory || ''),
        physicalExamination: capitalizeFirstLetter(patientData.physicalExamination || '')
      };
      console.log('Updated patientLocalData:', updatedData); // Debugging log
      setPatientLocalData(updatedData);
      updateFormData('patientInfo', updatedData);
    }
  }, [patientData, location.state]);

  useEffect(() => {
    if (vitalsData && Object.keys(vitalsData).length > 0) {
      const [bpSystolic, bpDiastolic] = vitalsData.bp && vitalsData.bp !== 'undefined/undefined'
        ? vitalsData.bp.split('/')
        : ['', ''];
      const updatedData = {
        bpSystolic: vitalsData.bpSystolic || bpSystolic || '',
        bpDiastolic: vitalsData.bpDiastolic || bpDiastolic || '',
        pulseRate: vitalsData.pulseRate || '',
        respiratoryRate: vitalsData.respiratoryRate || '',
        temperature: vitalsData.temperature || '',
        spo2: vitalsData.spo2 || '',
        height: vitalsData.height || '',
        weight: vitalsData.weight || '',
        bmi: vitalsData.bmi || '',
        investigationFindings: vitalsData.investigationFindings || '',
        other: vitalsData.other || {}
      };
      console.log('Updated vitalsLocalData:', updatedData); // Debugging log
      setVitalsLocalData(updatedData);
      updateFormData('vitals', updatedData);
    }
  }, [vitalsData]);

  const validateField = (field, value) => {
    const rules = validationRules[field];
    if (!rules || value === '' || value === undefined) return true;

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

  const handlePatientChange = (e) => {
    const { name, value } = e.target;
    console.log(`handlePatientChange - ${name}: ${value}`); // Debugging log
    const capitalizedValue = capitalizeFirstLetter(value);
    const updatedData = {
      ...patientLocalData,
      [name]: capitalizedValue
    };
    setPatientLocalData(updatedData);
    updateFormData('patientInfo', updatedData);
  };

  const handleVitalChange = (field, value) => {
    const normalizedValue = value === '' ? '' : Number(value) < 0 ? '' : String(value).trim();
    const updatedData = { ...vitalsLocalData, [field]: normalizedValue };

    if (field === 'bpSystolic' || field === 'bpDiastolic') {
      const systolic = field === 'bpSystolic' ? normalizedValue : vitalsLocalData.bpSystolic;
      const diastolic = field === 'bpDiastolic' ? normalizedValue : vitalsLocalData.bpDiastolic;
      updatedData.bp = (systolic && diastolic) ? `${systolic}/${diastolic}` : '';
    }

    if (field === 'weight' || field === 'height') {
      updatedData.bmi = calculateBMI(
        field === 'weight' ? normalizedValue : updatedData.weight,
        field === 'height' ? normalizedValue : updatedData.height
      );
    }

    setVitalsLocalData(updatedData);
    updateFormData('vitals', updatedData);
  };

  const handleBlur = (field) => {
    const value = vitalsLocalData[field];

    if (!validateField(field, value)) {
      const updatedData = { ...vitalsLocalData, [field]: '' };

      if (field === 'height' || field === 'weight') {
        updatedData.bmi = calculateBMI(
          field === 'weight' ? '' : updatedData.weight,
          field === 'height' ? '' : updatedData.height
        );
      }

      setVitalsLocalData(updatedData);
      updateFormData('vitals', updatedData);

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
      ...vitalsLocalData,
      other: {
        ...vitalsLocalData.other,
        [newKey.trim()]: newValue.trim()
      }
    };

    setVitalsLocalData(updatedData);
    updateFormData('vitals', updatedData);
    setNewKey('');
    setNewValue('');
    setErrors((prev) => ({ ...prev, newOther: '' }));
  };

  const handleRemoveOther = (key) => {
    const newOther = { ...vitalsLocalData.other };
    delete newOther[key];
    const updatedData = { ...vitalsLocalData, other: newOther };
    setVitalsLocalData(updatedData);
    updateFormData('vitals', updatedData);
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
    setVitalsLocalData(resetData);
    updateFormData('vitals', resetData);
    setErrors({});
  };

  return (
    <div className="patient-vitals-container">
      <div className="patient-details-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User style={{ width: '16px', height: '16px', color: '#10b981' }} />
          </div>
          <h2 className="patient-details-title">Patient Details & Vitals</h2>
        </div>
      </div>

      <div className="patient-details-form" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 200px' }}>
            <label className="patient-details-label">Patient Name</label>
            <input
              type="text"
              value={patientLocalData.patientName ? capitalizeFirstLetter(patientLocalData.patientName) : ''}
              className="patient-details-input"
              readOnly
            />
          </div>
          <div style={{ flex: '1 1 100px' }}>
            <label className="patient-details-label">Age</label>
            <input
              type="number"
              value={patientLocalData.age || ''}
              className="patient-details-input"
              readOnly
            />
          </div>
          <div style={{ flex: '1 1 150px' }}>
            <label className="patient-details-label">Gender</label>
            <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#374151' }}>
                <input
                  type="radio"
                  checked={patientLocalData.gender?.toLowerCase() === 'male'}
                  style={{ margin: '0' }}
                  disabled
                />
                Male
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#374151' }}>
                <input
                  type="radio"
                  checked={patientLocalData.gender?.toLowerCase() === 'female'}
                  style={{ margin: '0' }}
                  disabled
                />
                Female
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#374151' }}>
                <input
                  type="radio"
                  checked={patientLocalData.gender?.toLowerCase() === 'other'}
                  style={{ margin: '0' }}
                  disabled
                />
                Other
              </label>
            </div>
          </div>
          <div style={{ flex: '1 1 150px' }}>
            <label className="patient-details-label">Mobile Number</label>
            <input
              type="tel"
              value={patientLocalData.mobileNumber || ''}
              className="patient-details-input"
              readOnly
            />
          </div>
        </div>
      </div>

      <div className="patient-history-section">
        <h3 className="patient-history-title">Patient History</h3>
        <p className="patient-history-subtitle">Complete medical history documentation</p>

        <div className="history-section">
          <div className="history-section-header">
            <div style={{ width: '32px', height: '32px', backgroundColor: '#dbeafe', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText style={{ width: '16px', height: '16px', color: '#2563eb' }} />
            </div>
            <div>
              <h4 className="history-section-title">Chief Complaint</h4>
            </div>
          </div>
          <textarea
            name="chiefComplaint"
            value={patientLocalData.chiefComplaint}
            onChange={handlePatientChange}
            className="history-textarea"
            placeholder="Enter Here..."
            rows={4}
          />
        </div>

        <div className="history-section">
          <div className="history-section-header">
            <div style={{ width: '32px', height: '32px', backgroundColor: '#fef3c7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Heart style={{ width: '16px', height: '16px', color: '#f59e0b' }} />
            </div>
            <div>
              <h4 className="history-section-title">Past Medical History</h4>
            </div>
          </div>
          <textarea
            name="pastMedicalHistory"
            value={patientLocalData.pastMedicalHistory}
            onChange={handlePatientChange}
            className="history-textarea"
            placeholder="Enter Here..."
            rows={4}
          />
        </div>

        <div className="history-section">
          <div className="history-section-header">
            <div style={{ width: '32px', height: '32px', backgroundColor: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users style={{ width: '16px', height: '16px', color: '#16a34a' }} />
            </div>
            <div>
              <h4 className="history-section-title">Family Medical History</h4>
            </div>
          </div>
          <textarea
            name="familyMedicalHistory"
            value={patientLocalData.familyMedicalHistory}
            onChange={handlePatientChange}
            className="history-textarea"
            placeholder="Enter Here..."
            rows={4}
          />
        </div>

        <div className="history-section">
          <div className="history-section-header">
            <div style={{ width: '32px', height: '32px', backgroundColor: '#fed7aa', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Stethoscope style={{ width: '16px', height: '16px', color: '#ea580c' }} />
            </div>
            <div>
              <h4 className="history-section-title">Clinical examination findings and observations</h4>
            </div>
          </div>
          <textarea
            name="physicalExamination"
            value={patientLocalData.physicalExamination}
            onChange={handlePatientChange}
            className="history-textarea"
            placeholder="Enter Here..."
            rows={4}
          />
        </div>
      </div>

      <div className="vitals-section" style={{ marginTop: '24px' }}>
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
                value={vitalsLocalData.bpSystolic}
                onChange={(e) => handleVitalChange('bpSystolic', e.target.value)}
                className={`vitals-input bp-input ${errors.bpSystolic ? 'error' : ''}`}
              />
              <span className="bp-slash">/</span>
              <input
                type="number"
                placeholder="Diastolic"
                value={vitalsLocalData.bpDiastolic}
                onChange={(e) => handleVitalChange('bpDiastolic', e.target.value)}
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
                value={vitalsLocalData[field]}
                onChange={(e) => handleVitalChange(field, e.target.value)}
                className={`vitals-input ${errors[field] ? 'error' : ''}`}
              />
              {errors[field] && <div className="error-message">{errors[field]}</div>}
            </div>
          ))}

          <div className="vitals-input-group">
            <label className="vitals-label">BMI (kg/m²)</label>
            <input
              type="text"
              value={vitalsLocalData.bmi}
              readOnly
              className="vitals-input vitals-input-readonly"
            />
          </div>
        </div>

        <div className="other-vitals-grid">
          {Object.entries(vitalsLocalData.other || {}).map(([key, value]) => (
            <div key={key} className="other-vital-item">
              <div className="other-vital-key">{key}</div>
              <div className="other-vital-value">
                <input
                  type="text"
                  value={value}
                  onChange={(e) => {
                    const updatedData = {
                      ...vitalsLocalData,
                      other: {
                        ...vitalsLocalData.other,
                        [key]: e.target.value
                      }
                    };
                    setVitalsLocalData(updatedData);
                    updateFormData('vitals', updatedData);
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

      <div className="vitals-actions">
        <button className="cancel-button" onClick={handleCancel}>
          Clear All
        </button>
      </div>
    </div>
  );
};

export default PatientVitals;