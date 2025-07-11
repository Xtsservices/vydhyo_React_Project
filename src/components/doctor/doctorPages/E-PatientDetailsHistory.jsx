import React, { useState, useEffect } from 'react';
import { User, FileText, Heart, Users, Stethoscope } from 'lucide-react';
import { useSelector } from 'react-redux';
import { apiGet } from '../../api';
import '../../stylings/EPrescription.css';

const PatientDetailsHistory = () => {
  const user = useSelector((state) => state.currentUserData);
  const doctorId = user?.role === "doctor" ? user?.userId : user?.createdBy;
  
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState('');

  const [formData, setFormData] = useState({
    patientName: '',
    age: '',
    gender: '',
    mobileNumber: '',
    chiefComplaint: '',
    pastMedicalHistory: '',
    familyMedicalHistory: '',
    physicalExamination: ''
  });

  useEffect(() => {
    const fetchPatients = async () => {
      setLoading(true);
      try {
        const response = await apiGet(
          `/appointment/getAppointmentsByDoctorID/appointment?doctorId=${doctorId}`
        );
        
        if (response.status === 200) {
          // Extract unique patients based on userId
          const uniquePatients = response.data.data.reduce((acc, appointment) => {
            if (!acc.some(p => p.userId === appointment.userId)) {
              acc.push({
                userId: appointment.userId,
                patientId: appointment.userId, // Using userId as patientId since it's unique
                patientName: appointment.patientName,
                ...appointment.patientDetails
              });
            }
            return acc;
          }, []);
          
          setPatients(uniquePatients);
        }
      } catch (error) {
        console.error("Error fetching patients:", error);
      } finally {
        setLoading(false);
      }
    };

    if (doctorId) {
      fetchPatients();
    }
  }, [doctorId]);

  useEffect(() => {
    if (selectedPatientId) {
      const selectedPatient = patients.find(p => p.userId === selectedPatientId);
      if (selectedPatient) {
        // Calculate age from dob if available
        let age = "";
        const dob = selectedPatient.dob;
        if (dob) {
          // Parse the date in DD-MM-YYYY format
          const [day, month, year] = dob.split('-').map(Number);
          const birthDate = new Date(year, month - 1, day);
          if (!isNaN(birthDate.getTime())) {
            const ageDiff = Date.now() - birthDate.getTime();
            const ageDate = new Date(ageDiff);
            age = Math.abs(ageDate.getUTCFullYear() - 1970).toString();
          }
        }

        setFormData({
          patientName: selectedPatient.patientName || '',
          age: age,
          gender: selectedPatient.gender?.toLowerCase() || '',
          mobileNumber: selectedPatient.mobile || '',
          chiefComplaint: '',
          pastMedicalHistory: '',
          familyMedicalHistory: '',
          physicalExamination: ''
        });
      }
    }
  }, [selectedPatientId, patients]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePatientSelect = (e) => {
    setSelectedPatientId(e.target.value);
  };

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
      
      {/* Patient Selection Dropdown */}
      <div className="patient-selection" style={{ marginBottom: '20px' }}>
        <label className="patient-details-label">Select Patient</label>
        <select
          value={selectedPatientId}
          onChange={handlePatientSelect}
          className="patient-details-input"
          disabled={loading}
        >
          <option value="">Select a patient</option>
          {patients.map(patient => (
            <option key={patient.userId} value={patient.userId}>
              {patient.patientName} ({patient.mobile || 'No phone'})
            </option>
          ))}
        </select>
      </div>

      {/* Patient Details Form */}
      <div className="patient-details-form">
        <div className="patient-details-grid">
          <div>
            <label className="patient-details-label">Patient Name</label>
            <input
              type="text"
              name="patientName"
              value={formData.patientName}
              onChange={handleChange}
              className="patient-details-input"
            />
          </div>
          
          <div>
            <label className="patient-details-label">Gender</label>
            <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#374151' }}>
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  checked={formData.gender === 'male'}
                  onChange={handleChange}
                  style={{ margin: '0' }}
                />
                Male
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#374151' }}>
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  checked={formData.gender === 'female'}
                  onChange={handleChange}
                  style={{ margin: '0' }}
                />
                Female
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#374151' }}>
                <input
                  type="radio"
                  name="gender"
                  value="other"
                  checked={formData.gender === 'other'}
                  onChange={handleChange}
                  style={{ margin: '0' }}
                />
                Other
              </label>
            </div>
          </div>
          
          <div>
            <label className="patient-details-label">Age</label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              className="patient-details-input"
            />
          </div>
          
          <div>
            <label className="patient-details-label">Mobile Number</label>
            <input
              type="tel"
              name="mobileNumber"
              value={formData.mobileNumber}
              onChange={handleChange}
              className="patient-details-input"
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
              value={formData.chiefComplaint}
              onChange={handleChange}
              className="history-textarea"
              placeholder="Describe the primary reason for the visit..."
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
              value={formData.pastMedicalHistory}
              onChange={handleChange}
              className="history-textarea"
              placeholder="Enter previous illnesses, surgeries, or chronic conditions..."
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
              value={formData.familyMedicalHistory}
              onChange={handleChange}
              className="history-textarea"
              placeholder="Mention any hereditary conditions in the family..."
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
                <p className="history-section-subtitle">Clinical examination findings and</p>
              </div>
            </div>
            <textarea
              name="physicalExamination"
              value={formData.physicalExamination}
              onChange={handleChange}
              className="history-textarea"
              placeholder="Enter findings from clinical examination..."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDetailsHistory;