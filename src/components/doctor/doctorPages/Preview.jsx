import React from "react";
import { Printer, CheckCircle } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import logo from "../../../assets/logooo.png";
import '../../stylings/EPrescription.css';

const Preview = ({ formData, handlePrescriptionAction }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  return (
    <>
      <div className="print-button-container">
        <button 
          className="print-button" 
          onClick={() => handlePrescriptionAction('print')}
        >
          <Printer size={16} style={{ marginRight: '8px' }} />
          Print Prescription
        </button>
        <button 
          className="whatsapp-button" 
          onClick={() => handlePrescriptionAction('whatsapp')}
        >
          <FaWhatsapp className="whatsapp-icon" /> Share via WhatsApp
        </button>
      </div>

      <div className="prescription-container">
        {/* Header */}
        <div className="prescription-header">
          <div className="clinic-info">
            <div className="clinic-logo">
              <img
                src={logo}
                alt="Clinic Logo"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                }}
              />
            </div>
            <div>
              <div className="clinic-name">VYDHYO MULTISPECIALTY CLINIC</div>
              <div className="clinic-tagline">Connect. Care. Cure.</div>
            </div>
          </div>
          <div className="contact-info">
            <div>📍 {formData.doctorInfo?.clinicAddress || 'Ring Road, Nagpur - 440001'}</div>
            <div>📞 {formData.doctorInfo?.contactNumber || '+91 98765 43210'}</div>
            <div>
              <div>✉️ info@vydhyo.com</div>
              <div>🌐 www.vydhyo.com</div>
            </div>
          </div>
        </div>

        {/* Doctor Info */}
        <div className="doctor-info">
          <div className="doctor-name">DR. {formData.doctorInfo?.doctorName || 'Name'}</div>
          <div className="doctor-title">
            {formData.doctorInfo?.qualifications || 'MBBS, MD'} | {formData.doctorInfo?.specialization || 'Specialist'}
          </div>
        </div>

        {/* Content */}
        <div className="prescription-content">
          {/* Patient Details */}
          <div className="prescription-section">
            <div className="section-header">
              👤 PATIENT DETAILS
            </div>
            <div className="patient-details-grid">
              <div className="detail-item">
                <div className="detail-label">Patient Name</div>
                <div className="detail-value">{formData.patientInfo?.patientName || 'Not provided'}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Age</div>
                <div className="detail-value">{formData.patientInfo?.age || 'N/A'} Years</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Gender</div>
                <div className="detail-value">
                  {formData.patientInfo?.gender ? 
                    formData.patientInfo.gender.charAt(0).toUpperCase() + formData.patientInfo.gender.slice(1) 
                    : 'Not specified'}
                </div>
              </div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Mobile</div>
              <div className="detail-value">{formData.patientInfo?.mobileNumber || 'Not provided'}</div>
            </div>
          </div>

          {/* Patient History */}
          <div className="prescription-section">
            <div className="section-header">
              📋 PATIENT HISTORY
            </div>
            <div className="history-grid">
              <div>
                <div className="detail-item">
                  <div className="detail-label">Chief Complaint</div>
                  <div className="detail-value">
                    {formData.patientInfo?.chiefComplaint || 'Not specified'}
                  </div>
                </div>
                <div className="detail-item" style={{ marginTop: "12px" }}>
                  <div className="detail-label">Past History</div>
                  <div className="detail-value">
                    {formData.patientInfo?.pastMedicalHistory || 'Not specified'}
                  </div>
                </div>
              </div>
              <div>
                <div className="detail-item">
                  <div className="detail-label">Family History</div>
                  <div className="detail-value">
                    {formData.patientInfo?.familyMedicalHistory || 'Not specified'}
                  </div>
                </div>
                <div className="detail-item" style={{ marginTop: "12px" }}>
                  <div className="detail-label">Examination</div>
                  <div className="detail-value">
                    {formData.patientInfo?.physicalExamination || 'Not specified'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Vitals */}
          <div className="prescription-section">
            <div className="section-header">
              🩺 VITALS
            </div>
            <div className="vitals-grid">
              <div className="vital-item">
                <div className="detail-label">BP</div>
                <div className="detail-value">{formData.vitals?.bp || 'N/A'} mmHg</div>
              </div>
              <div className="vital-item">
                <div className="detail-label">Pulse</div>
                <div className="detail-value">{formData.vitals?.pulseRate || 'N/A'} BPM</div>
              </div>
              <div className="vital-item">
                <div className="detail-label">Temperature</div>
                <div className="detail-value">{formData.vitals?.temperature || 'N/A'}°F</div>
              </div>
              <div className="vital-item">
                <div className="detail-label">SpO2</div>
                <div className="detail-value">{formData.vitals?.spo2 || 'N/A'}%</div>
              </div>
              <div className="vital-item">
                <div className="detail-label">RR</div>
                <div className="detail-value">{formData.vitals?.respiratoryRate || 'N/A'} breaths/min</div>
              </div>
              <div className="vital-item">
                <div className="detail-label">Height</div>
                <div className="detail-value">{formData.vitals?.height || 'N/A'} cm</div>
              </div>
              <div className="vital-item">
                <div className="detail-label">Weight</div>
                <div className="detail-value">{formData.vitals?.weight || 'N/A'} kg</div>
              </div>
              <div className="vital-item">
                <div className="detail-label">BMI</div>
                <div className="detail-value">{formData.vitals?.bmi || 'N/A'}</div>
              </div>
            </div>
          </div>

          {/* Investigation */}
          {formData.diagnosis?.selectedTests?.length > 0 && (
            <div className="prescription-section">
              <div className="section-header">
                🔬 INVESTIGATION
              </div>
              <div className="investigation-grid">
                {formData.diagnosis.selectedTests.map((test, index) => (
                  <div key={index} className="investigation-item">
                    <div className="detail-value">{test.testName || test}</div>
                  </div>
                ))}
              </div>
              {/* Display test notes if they exist */}
              {formData.diagnosis?.testNotes && (
                <div className="notes-display">
                  <div className="notes-label">Test Instructions:</div>
                  <div className="notes-content">{formData.diagnosis.testNotes}</div>
                </div>
              )}
            </div>
          )}

          {/* Diagnosis */}
          {formData.diagnosis?.diagnosisList && (
            <div className="prescription-section">
              <div className="section-header">
                🩺 DIAGNOSIS
              </div>
              <div className="diagnosis-tags">
                {formData.diagnosis.diagnosisList.split(',').map((diagnosis, index) => (
                  <span key={index} className="diagnosis-tag">
                    {diagnosis.trim().toUpperCase()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Medication */}
          {formData.diagnosis?.medications?.length > 0 && (
            <div className="prescription-section">
              <div className="section-header">
                💊 MEDICATION
              </div>
              <table className="medication-table">
                <thead>
                  <tr>
                    <th className="table-header">Medicine Name</th>
                    <th className="table-header">Quantity</th>
                    <th className="table-header">Dosage</th>
                    <th className="table-header">Timings</th>
                    <th className="table-header">Duration</th>
                    <th className="table-header">Frequency</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.diagnosis.medications.map((med, index) => (
                    <tr key={index}>
                      <td className="table-cell">{med.medName || med.name || 'Not specified'}</td>
                      <td className="table-cell">{med.quantity || 'N/A'}</td>
                      <td className="table-cell">{med.dosage || med.dosagePattern || 'As directed'}</td>
                      <td className="table-cell">
                        {med.timings ? med.timings.join(', ') : med.timing}
                      </td>
                      <td className="table-cell">{med.duration || 'Until next visit'}</td>
                      <td className="table-cell">{med.frequency || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Display medication notes if they exist */}
              {formData.diagnosis?.medicationNotes && (
                <div className="notes-display">
                  <div className="notes-label">Medication Instructions:</div>
                  <div className="notes-content">{formData.diagnosis.medicationNotes}</div>
                </div>
              )}
            </div>
          )}

          {/* Advice */}
          {(formData.advice?.advice || formData.advice?.followUpDate) && (
            <div className="prescription-section">
              <div className="section-header">
                💡 ADVICE & FOLLOW-UP
              </div>
              {formData.advice.advice && (
                <ul className="advice-list">
                  {formData.advice.advice.split('\n').map((item, index) => (
                    item.trim() && (
                      <li key={index} className="advice-item">
                        <span className="bullet">•</span>
                        <span>{item}</span>
                      </li>
                    )
                  ))}
                </ul>
              )}
              {formData.advice.followUpDate && (
                <div className="follow-up" style={{ marginTop: '16px' }}>
                  <div style={{ fontWeight: "bold", marginBottom: "4px" }}>
                    Next Visit: {formatDate(formData.advice.followUpDate)}
                  </div>
                  <div>For Emergencies, Call: {formData.doctorInfo?.contactNumber || '+91 98765 43210'}</div>
                </div>
              )}
            </div>
          )}

          {/* Signature */}
          <div className="signature">
            <div style={{ height: "48px" }}></div>
            <div style={{ fontWeight: "bold" }}>DR. {formData.doctorInfo?.doctorName || 'Name'}</div>
            <div style={{ fontSize: '12px', marginTop: '4px' }}>
              <CheckCircle size={14} style={{ marginRight: '4px' }} />
              Digitally Signed
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="prescription-footer">
          This prescription is computer generated and does not require physical signature
        </div>
      </div>
    </>
  );
};

export default Preview;