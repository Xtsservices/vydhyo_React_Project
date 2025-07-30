import React, { useState, useEffect } from 'react';
import { User, FileText, Heart, Users, Stethoscope } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import '../../stylings/EPrescription.css';

const capitalizeFirstLetter = (str) => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const PatientDetailsHistory = ({ formData, updateFormData }) => {
  const location = useLocation();


  console.log("details", location.state?.patientData, formData);
  
  const [localData, setLocalData] = useState({
    patientId: location.state?.patientData?.patientId || '',
    chiefComplaint: formData?.chiefComplaint || '',
    pastMedicalHistory: formData?.pastMedicalHistory || '',
    familyMedicalHistory: formData?.familyMedicalHistory || '',
    physicalExamination: formData?.physicalExamination || ''
  });

  console.log("localData", localData);

  useEffect(() => {
    if (location.state?.patientData) {
      const patientData = location.state.patientData;
      console.log("Patient Data:", patientData);
      console.log("Form Data:", formData);
      const updatedData = {
        patientId: patientData.patientId || '',
        patientName: patientData.patientName || '',
        age: patientData.age || '',
        gender: patientData.gender || '',
        mobileNumber: patientData.mobileNumber || '',
        chiefComplaint: capitalizeFirstLetter(formData?.chiefComplaint) || '',
        pastMedicalHistory: capitalizeFirstLetter(formData?.pastMedicalHistory) || '',
        familyMedicalHistory: capitalizeFirstLetter(formData?.familyMedicalHistory) || '',
        physicalExamination: capitalizeFirstLetter(formData?.physicalExamination) || ''
      };

      console.log("Updated Data:", updatedData);
      setLocalData(updatedData);
      if (updateFormData) {
        updateFormData(updatedData);
      }
    }
  }, [location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const capitalizedValue = capitalizeFirstLetter(value);
    const updatedData = {
      ...localData,
      [name]: capitalizedValue
    };
    setLocalData(updatedData);
    if (updateFormData) {
      updateFormData(updatedData);
    }
  };

  const patientData = location.state?.patientData || {};

  return (
    <div className="patient-details-container" style={{ padding: '16px' }}>
      {/* Header */}
      <div className="patient-details-header" style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <User style={{ width: '14px', height: '14px', color: '#10b981' }} />
          <h2 style={{ fontSize: '18px', margin: 0 }}>Patient Details</h2>
        </div>
      </div>
      
      {/* Patient Details Form */}
      <div className="patient-details-form">
        <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 200px' }}>
            <label className="patient-details-label" style={{ fontSize: '12px' }}>Name</label>
            <input
              type="text"
              value={patientData.patientName ? capitalizeFirstLetter(patientData.patientName) : ''}
              className="patient-details-input"
              readOnly
              style={{ height: '28px', fontSize: '15px', padding: '4px' }}
            />
          </div>
          
          <div style={{ flex: '0 1 100px' }}>
            <label className="patient-details-label" style={{ fontSize: '12px' }}>Gender</label>
            <input
              type="text"
              value={patientData.gender ? capitalizeFirstLetter(patientData.gender) : ''}
              className="patient-details-input"
              readOnly
              style={{ height: '28px', fontSize: '15px', padding: '4px' }}
            />
          </div>
          
          <div style={{ flex: '0 1 80px' }}>
            <label className="patient-details-label" style={{ fontSize: '12px' }}>Age</label>
            <input
              type="number"
              value={patientData.age || ''}
              className="patient-details-input"
              readOnly
              style={{ height: '28px', fontSize: '15px', padding: '4px' }}
            />
          </div>
          
          <div style={{ flex: '1 1 150px' }}>
            <label className="patient-details-label" style={{ fontSize: '12px' }}>Mobile</label>
            <input
              type="tel"
              value={patientData.mobileNumber || ''}
              className="patient-details-input"
              readOnly
              style={{ height: '28px', fontSize: '15px', padding: '4px' }}
            />
          </div>
        </div>

          <div className="patient-history-section">
            <h3 style={{ fontSize: '16px', margin: '0 0 8px' }}>Patient History</h3>
            
            {/* Chief Complaint (Read-only) */}
            <div className="history-section" style={{ marginBottom: '12px' }}>
              <div className="history-section-header" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <FileText style={{ width: '14px', height: '14px', color: '#2563eb' }} />
                <h4 style={{ fontSize: '14px', margin: 0 }}>Chief Complaint</h4>
              </div>
              <textarea
                name="chiefComplaint"
                value={localData.chiefComplaint}
                onChange={handleChange}
                className="history-textarea readonly-textarea"
                placeholder="Enter Here..."
                rows={2}
                style={{ fontSize: '16px', padding: '4px', minHeight: '32px', maxHeight: '40px' }}
              />
            </div>

            {/* Past Medical History (Editable) */}
          <div className="history-section" style={{ marginBottom: '12px' }}>
            <div className="history-section-header" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Heart style={{ width: '14px', height: '14px', color: '#f59e0b' }} />
              <h4 style={{ fontSize: '14px', margin: 0 }}>Past Medical History</h4>
            </div>
            <textarea
              name="pastMedicalHistory"
              value={localData.pastMedicalHistory}
              onChange={handleChange}
              className="history-textarea"
              placeholder="Enter Here..."
              rows={3}
                style={{ fontSize: '16px', padding: '4px', minHeight: '32px', maxHeight: '40px' }}
            />
          </div>

          {/* Family Medical History (Editable) */}
          <div className="history-section" style={{ marginBottom: '12px' }}>
            <div className="history-section-header" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Users style={{ width: '14px', height: '14px', color: '#16a34a' }} />
              <h4 style={{ fontSize: '14px', margin: 0 }}>Family Medical History</h4>
            </div>
            <textarea
              name="familyMedicalHistory"
              value={localData.familyMedicalHistory}
              onChange={handleChange}
              className="history-textarea"
              placeholder="Enter Here..."
              rows={3}
                style={{ fontSize: '16px', padding: '4px', minHeight: '32px', maxHeight: '40px' }}
            />
          </div>

          {/* Physical Examination (Editable) */}
          <div className="history-section">
            <div className="history-section-header" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Stethoscope style={{ width: '14px', height: '14px', color: '#ea580c' }} />
              <h4 style={{ fontSize: '14px', margin: 0 }}>Clinical Examination</h4>
            </div>
            <textarea
              name="physicalExamination"
              value={localData.physicalExamination}
              onChange={handleChange}
              className="history-textarea"
              placeholder="Enter Here..."
              rows={3}
                style={{ fontSize: '16px', padding: '4px', minHeight: '32px', maxHeight: '40px' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDetailsHistory;