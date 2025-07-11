import React, { useState, useEffect } from 'react';
import { User } from 'lucide-react';
import '../../stylings/EPrescription.css';
import { useSelector } from 'react-redux';

const DoctorClinicInfo = () => {
  const user = useSelector((state) => state.currentUserData);
  const doctorId = user?.role === "doctor" ? user?.userId : user?.createdBy;

  // Get all clinic addresses
  const allClinics = user?.addresses?.filter(address => address.type === "Clinic") || [];
  
  const [formData, setFormData] = useState({
    doctorName: '',
    qualifications: '',
    specialization: '',
    selectedClinicId: '',
    clinicName: '',
    clinicAddress: '',
    city: '',
    pincode: '',
    contactNumber: '',
    reportDate: '',
    reportTime: ''
  });

  useEffect(() => {
    if (user) {
      const currentDate = new Date();
      const formattedDate = currentDate.toISOString().split('T')[0];
      const formattedTime = currentDate.toTimeString().substring(0, 5);

      setFormData(prev => ({
        ...prev,
        doctorName: `${user.firstname} ${user.lastname}`,
        qualifications: user.specialization?.degree || '',
        specialization: user.specialization?.name?.trim() || '',
        reportDate: formattedDate,
        reportTime: formattedTime
      }));

      // Set first clinic as default if available
      if (allClinics.length > 0) {
        handleClinicChange(allClinics[0].addressId);
      }
    }
  }, [user]);

  const handleClinicChange = (clinicId) => {
    const selectedClinic = allClinics.find(clinic => clinic.addressId === clinicId);
    if (selectedClinic) {
      setFormData(prev => ({
        ...prev,
        selectedClinicId: clinicId,
        clinicName: selectedClinic.clinicName,
        clinicAddress: selectedClinic.address,
        city: selectedClinic.city,
        pincode: selectedClinic.pincode,
        contactNumber: selectedClinic.mobile || user.mobile || ''
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'selectedClinicId') {
      handleClinicChange(value);
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
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
              readOnly
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
              readOnly
            />
          </div>
          
          <div>
            <label className="doctor-clinic-label">
              Specialization
            </label>
            <input
              type="text"
              name="specialization"
              value={formData.specialization}
              onChange={handleChange}
              className="doctor-clinic-input"
              readOnly
            />
          </div>
          
          <div>
            <label className="doctor-clinic-label">
              Clinic Name
            </label>
            <select
              name="selectedClinicId"
              value={formData.selectedClinicId}
              onChange={handleChange}
              className="doctor-clinic-input"
            >
              {allClinics.map(clinic => (
                <option key={clinic.addressId} value={clinic.addressId}>
                  {clinic.clinicName}
                </option>
              ))}
            </select>
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
              readOnly
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
              readOnly
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
              readOnly
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
              readOnly
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