import React, { useState } from 'react';
import { User } from 'lucide-react';
import '../../stylings/EPrescription.css';

const DoctorClinicInfo = () => {
  const [formData, setFormData] = useState({
    doctorName: '',
    qualifications: '',
    specialization: '',
    clinicName: '',
    clinicAddress: '',
    city: '',
    pincode: '',
    contactNumber: '',
    reportDate: '',
    reportTime: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="doctor-clinic-container">
      {/* Header */}
      <div className="doctor-clinic-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '32px', height: '32px', backgroundColor: '#dbeafe', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User style={{ width: '16px', height: '16px', color: '#2563eb' }} />
          </div>
          <h2 className="doctor-clinic-title">Consulting Physician</h2>
        </div>
      </div>
      
      {/* Form Content */}
      <div className="doctor-clinic-form">
        <div className="doctor-clinic-grid">
          <div>
            <label className="doctor-clinic-label">
              Doctor Name
            </label>
            <input
              type="text"
              name="doctorName"
              value={formData.doctorName}
              onChange={handleChange}
              className="doctor-clinic-input"
            />
          </div>
          
          <div>
            <label className="doctor-clinic-label">
              Qualifications
            </label>
            <input
              type="text"
              name="qualifications"
              value={formData.qualifications}
              onChange={handleChange}
              className="doctor-clinic-input"
            />
          </div>
          
          <div>
            <label className="doctor-clinic-label">
              Specialization
            </label>
            <select
              name="specialization"
              value={formData.specialization}
              onChange={handleChange}
              className="doctor-clinic-input"
            >
              <option value="">Select Specialization</option>
              <option value="cardiology">Cardiology</option>
              <option value="neurology">Neurology</option>
              <option value="orthopedics">Orthopedics</option>
              <option value="pediatrics">Pediatrics</option>
              <option value="dermatology">Dermatology</option>
              <option value="general-medicine">General Medicine</option>
            </select>
          </div>
          
          <div>
            <label className="doctor-clinic-label">
              Clinic Name
            </label>
            <input
              type="text"
              name="clinicName"
              value={formData.clinicName}
              onChange={handleChange}
              className="doctor-clinic-input"
            />
          </div>
          
          <div style={{ gridColumn: '1 / -1' }}>
            <label className="doctor-clinic-label">
              Clinic Address
            </label>
            <textarea
              name="clinicAddress"
              value={formData.clinicAddress}
              onChange={handleChange}
              rows={3}
              className="doctor-clinic-input"
              style={{ resize: 'none' }}
            />
          </div>
          
          <div>
            <label className="doctor-clinic-label">
              City
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="doctor-clinic-input"
            />
          </div>
          
          <div>
            <label className="doctor-clinic-label">
              Pincode
            </label>
            <input
              type="text"
              name="pincode"
              value={formData.pincode}
              onChange={handleChange}
              className="doctor-clinic-input"
            />
          </div>
          
          <div>
            <label className="doctor-clinic-label">
              Contact Number
            </label>
            <input
              type="tel"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleChange}
              className="doctor-clinic-input"
            />
          </div>
          
          <div>
            <label className="doctor-clinic-label">
              Report Date
            </label>
            <input
              type="date"
              name="reportDate"
              value={formData.reportDate}
              onChange={handleChange}
              className="doctor-clinic-input"
            />
          </div>
          
          <div>
            <label className="doctor-clinic-label">
              Report Time
            </label>
            <input
              type="time"
              name="reportTime"
              value={formData.reportTime}
              onChange={handleChange}
              className="doctor-clinic-input"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorClinicInfo;