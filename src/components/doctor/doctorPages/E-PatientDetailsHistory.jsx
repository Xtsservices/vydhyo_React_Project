import React, { useState, useEffect } from 'react';
import { User, FileText, Heart, Users, Stethoscope } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import '../../stylings/EPrescription.css';

const PatientDetailsHistory = ({ formData, updateFormData }) => {
  const location = useLocation();
  const [localData, setLocalData] = useState({
    patientId: location.state?.patientData?.patientId || '',
    chiefComplaint: '',
    pastMedicalHistory: '',
    familyMedicalHistory: '',
    physicalExamination: ''
  });

  useEffect(() => {
    if (location.state?.patientData) {
      const patientData = location.state.patientData;
      const updatedData = {
        patientId: patientData.patientId || '',
        chiefComplaint: formData?.chiefComplaint || '',
        pastMedicalHistory: formData?.pastMedicalHistory || '',
        familyMedicalHistory: formData?.familyMedicalHistory || '',
        physicalExamination: formData?.physicalExamination || ''
      };
      setLocalData(updatedData);
      if (updateFormData) {
        updateFormData(updatedData);
      }
    }
  }, [location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedData = {
      ...localData,
      [name]: value
    };
    setLocalData(updatedData);
    if (updateFormData) {
      updateFormData(updatedData);
    }
  };

  const patientData = location.state?.patientData || {};

  return (
    <div className="patient-details-container">
      {/* Header */}
      <div className="patient-details-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User style={{ width: '16px', height: '16px', color: '#10b981' }} />
          </div>
          <h2 className="patient-details-title">Patient Details</h2>
        </div>
      </div>
      
      {/* Patient Details Form */}
      <div className="patient-details-form">
        <div className="patient-details-grid">
          <div>
            <label className="patient-details-label">Patient Name</label>
            <input
              type="text"
              value={patientData.patientName || ''}
              className="patient-details-input"
              readOnly
            />
          </div>
          
          <div>
            <label className="patient-details-label">Gender</label>
            <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#374151' }}>
                <input
                  type="radio"
                  checked={patientData.gender?.toLowerCase() === 'male'}
                  style={{ margin: '0' }}
                  disabled
                />
                Male
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#374151' }}>
                <input
                  type="radio"
                  checked={patientData.gender?.toLowerCase() === 'female'}
                  style={{ margin: '0' }}
                  disabled
                />
                Female
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#374151' }}>
                <input
                  type="radio"
                  checked={patientData.gender?.toLowerCase() === 'other'}
                  style={{ margin: '0' }}
                  disabled
                />
                Other
              </label>
            </div>
          </div>
          
          <div>
            <label className="patient-details-label">Age</label>
            <input
              type="number"
              value={patientData.age || ''}
              className="patient-details-input"
              readOnly
            />
          </div>
          
          <div>
            <label className="patient-details-label">Mobile Number</label>
            <input
              type="tel"
              value={patientData.mobileNumber || ''}
              className="patient-details-input"
              readOnly
            />
          </div>
        </div>

        {/* Patient History Section */}
        <div className="patient-history-section">
          <h3 className="patient-history-title">Patient History</h3>
          <p className="patient-history-subtitle">Complete medical history documentation</p>
          
          {/* Chief Complaint */}
          <div className="history-section">
            <div className="history-section-header">
              <div style={{ width: '32px', height: '32px', backgroundColor: '#dbeafe', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileText style={{ width: '16px', height: '16px', color: '#2563eb' }} />
              </div>
              <div>
                <h4 className="history-section-title">Chief Complaint</h4>
                <p className="history-section-subtitle">Primary reason for the visit</p>
              </div>
            </div>
            <textarea
              name="chiefComplaint"
              value={localData.chiefComplaint}
              onChange={handleChange}
              className="history-textarea"
              placeholder="Describe the primary reason for the visit..."
              rows={4}
            />
          </div>

          {/* Past Medical History */}
          <div className="history-section">
            <div className="history-section-header">
              <div style={{ width: '32px', height: '32px', backgroundColor: '#fef3c7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Heart style={{ width: '16px', height: '16px', color: '#f59e0b' }} />
              </div>
              <div>
                <h4 className="history-section-title">Past Medical History</h4>
                <p className="history-section-subtitle">Previous medical conditions and treatments</p>
              </div>
            </div>
            <textarea
              name="pastMedicalHistory"
              value={localData.pastMedicalHistory}
              onChange={handleChange}
              className="history-textarea"
              placeholder="Enter previous illnesses, surgeries, or chronic conditions..."
              rows={4}
            />
          </div>

          {/* Family Medical History */}
          <div className="history-section">
            <div className="history-section-header">
              <div style={{ width: '32px', height: '32px', backgroundColor: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users style={{ width: '16px', height: '16px', color: '#16a34a' }} />
              </div>
              <div>
                <h4 className="history-section-title">Family Medical History</h4>
                <p className="history-section-subtitle">Hereditary conditions and family medical</p>
              </div>
            </div>
            <textarea
              name="familyMedicalHistory"
              value={localData.familyMedicalHistory}
              onChange={handleChange}
              className="history-textarea"
              placeholder="Mention any hereditary conditions in the family..."
              rows={4}
            />
          </div>

          {/* Physical Examination */}
          <div className="history-section">
            <div className="history-section-header">
              <div style={{ width: '32px', height: '32px', backgroundColor: '#fed7aa', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Stethoscope style={{ width: '16px', height: '16px', color: '#ea580c' }} />
              </div>
              <div>
                <h4 className="history-section-title">Physical Examination</h4>
                <p className="history-section-subtitle">Clinical examination findings and observations</p>
              </div>
            </div>
            <textarea
              name="physicalExamination"
              value={localData.physicalExamination}
              onChange={handleChange}
              className="history-textarea"
              placeholder="Enter findings from clinical examination..."
              rows={4}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDetailsHistory;