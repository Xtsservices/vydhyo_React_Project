import React, { useState, useEffect } from 'react';
import { User } from 'lucide-react';
import { useSelector } from 'react-redux';
import '../../stylings/EPrescription.css';

const DoctorClinicInfo = ({ formData, updateFormData }) => {
  const user = useSelector((state) => state.currentUserData);
  const doctorId = user?.role === "doctor" ? user?.userId : user?.createdBy;

  console.log("user data==========",user)
  // Get only active clinic addresses
  const allClinics = (user?.addresses?.filter(address => 
    address.type === "Clinic" && address.status === "Active"
  ) || []);
  
  console.log("allClinics====", allClinics)
  const [localData, setLocalData] = useState({
    doctorId: doctorId,
    selectedClinicId: '',
    appointmentDate: '',
    appointmentStartTime: '',
    appointmentEndTime: ''
  });

  useEffect(() => {
    if (formData && Object.keys(formData).length > 0) {
      setLocalData(formData);
    } else if (user) {
      const currentDate = new Date();
      const formattedDate = currentDate.toISOString().split('T')[0];

      const initialData = {
        doctorId: doctorId,
        appointmentDate: formattedDate,
        appointmentStartTime: '',
        appointmentEndTime: ''
      };

      // Set first active clinic as default if available
      if (allClinics.length > 0) {
        initialData.selectedClinicId = allClinics[0].addressId;
        initialData.appointmentStartTime = allClinics[0].startTime || '';
        initialData.appointmentEndTime = allClinics[0].endTime || '';
      }

      setLocalData(initialData);
      updateFormData(initialData);
    }
  }, [user, formData]);

  // In DoctorClinicInfo component
const handleClinicChange = (clinicId) => {
  const selectedClinic = allClinics.find(clinic => clinic.addressId === clinicId);
  const updatedData = {
    ...localData,
    selectedClinicId: clinicId,
    appointmentStartTime: selectedClinic?.startTime || '',
    appointmentEndTime: selectedClinic?.endTime || '',
    // Add these fields to match preview expectations
    doctorName: `${user?.firstname || ''} ${user?.lastname || ''}`,
    qualifications: user?.specialization?.degree || '',
    specialization: user?.specialization?.name?.trim() || '',
    clinicAddress: selectedClinic?.address || '',
    contactNumber: selectedClinic?.mobile || user?.mobile || '',
    city: selectedClinic?.city || '',
    pincode: selectedClinic?.pincode || ''
  };
  setLocalData(updatedData);
  updateFormData(updatedData);
};

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'selectedClinicId') {
      handleClinicChange(value);
    } else {
      const updatedData = {
        ...localData,
        [name]: value
      };
      setLocalData(updatedData);
      updateFormData(updatedData);
    }
  };

  // Get the selected clinic for display purposes
  const selectedClinic = allClinics.find(clinic => clinic.addressId === localData.selectedClinicId);

  console.log("local====", localData)
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
              value={`${user?.firstname || ''} ${user?.lastname || ''}`}
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
              value={user?.specialization?.degree || ''}
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
              value={user?.specialization?.name?.trim() || ''}
              className="doctor-clinic-input"
              readOnly
            />
          </div>
          
          {/* <div>
            <label className="doctor-clinic-label">
              Clinic Name
            </label>
            <select
              name="selectedClinicId"
              value={localData.selectedClinicId}
              // onChange={handleChange}
              className="doctor-clinic-input"
              readOnly
            >
              {allClinics.map(clinic => (
                <option key={clinic.addressId} value={clinic.addressId}>
                  {clinic.clinicName}
                </option>
              ))}
            </select>
          </div> */}

           <div>
            <label className="doctor-clinic-label">Clinic Name</label>
            <input
              type="text"
              value={selectedClinic?.clinicName || ''}
              className="doctor-clinic-input"
              readOnly
            />
          </div>
          
          <div style={{ gridColumn: '1 / -1' }}>
            <label className="doctor-clinic-label">
              Clinic Address
            </label>
            <textarea
              value={selectedClinic?.address || ''}
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
              value={selectedClinic?.city || ''}
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
              value={selectedClinic?.pincode || ''}
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
              value={selectedClinic?.mobile || user?.mobile || ''}
              className="doctor-clinic-input"
              readOnly
            />
          </div>
          
          <div>
            <label className="doctor-clinic-label">
              Appointment Date
            </label>
            <input
              type="date"
              name="appointmentDate"
              value={localData.appointmentDate}
              onChange={handleChange}
              className="doctor-clinic-input"
               readOnly
            />
          </div>
          
          <div>
            <label className="doctor-clinic-label">
              Appointment Start Time
            </label>
            <input
              type="time"
              name="appointmentStartTime"
              value={localData.appointmentStartTime}
              onChange={handleChange}
              className="doctor-clinic-input"
               readOnly
            />
          </div>

          {/* <div>
            <label className="doctor-clinic-label">
              Appointment End Time
            </label>
            <input
              type="time"
              name="appointmentEndTime"
              value={localData.appointmentEndTime}
              onChange={handleChange}
              className="doctor-clinic-input"
            />
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default DoctorClinicInfo;