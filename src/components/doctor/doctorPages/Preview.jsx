import React, { useEffect, useState } from "react";
import { Printer, CheckCircle } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import logo from "../../../assets/logooo.png";
import '../../stylings/EPrescription.css';
import { apiGet } from "../../api";

const Preview = ({ formData, handlePrescriptionAction }) => {

  const [selectedClinic, setSelectedClinic] = useState(null)
  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  console.log("selectedClinic===",selectedClinic)
  const generatePDF = async () => {
    try {
      const input = document.getElementById('prescription-container');
      if (!input) {
        throw new Error("Could not find the prescription container element");
      }

      const canvas = await html2canvas(input, {
        scale: 2,
        useCORS: true,
        logging: true,
        backgroundColor: '#ffffff',
        scrollX: 0,
        scrollY: 0,
        windowWidth: input.scrollWidth,
        windowHeight: input.scrollHeight,
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgProps = pdf.getImageProperties(imgData);
      const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      const pdfBlob = pdf.output('blob');
      return pdfBlob;
    } catch (error) {
      console.error("Error generating PDF:", error);
      throw error;
    }
  };

  const handleWhatsAppClick = async () => {
    try {
      const pdfBlob = await generatePDF();
      handlePrescriptionAction('whatsapp', pdfBlob);
    } catch (error) {
      console.error("Failed to generate PDF for WhatsApp:", error);
    }
  };


  console.log("formdataaaa:",formData)

  
    const getCurrentUserData = async () => {
      try {
        const response = await apiGet("/users/getUser");
        const userData = response.data?.data;
        console.log("userData",userData)
         const selectedClinic2 = userData?.addresses?.find(
    (address) => address.addressId === formData.doctorInfo?.selectedClinicId
  ) || {};
      setSelectedClinic(selectedClinic2)
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    useEffect(() => {
      if(formData?.doctorInfo?.doctorId){
        getCurrentUserData()
      }
    },[formData?.doctorInfo?.doctorId])
  


  return (
    <div>
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
          onClick={handleWhatsAppClick}
        >
          <FaWhatsapp className="whatsapp-icon" /> Share via WhatsApp
        </button>
      </div>

      <div id="prescription-container" className="prescription-container">
        <div className="prescription-header">
          <div className="clinic-info">
            {/* <div className="clinic-logo">
              <img
                src={logo}
                alt="Clinic Logo"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                }}
              />
            </div> */}
            <div>

              <div className="clinic-name">
  {selectedClinic?.clinicName
    ? selectedClinic.clinicName.charAt(0).toUpperCase() + selectedClinic.clinicName.slice(1)
    : 'VYDHYO MULTISPECIALTY CLINIC'}
</div>

              {/* <div className="clinic-tagline">Connect. Care. Cure.</div> */}

            </div>
          </div>
          <div className="contact-info">
            <div>📍{selectedClinic?.address || 'Not specified'}</div>
            <div>📞  {selectedClinic?.mobile || 'Not specified'}</div>
            <div>
              <div>✉️ info@vydhyo.com</div>
              <div>🌐 www.vydhyo.com</div>
            </div>
          </div>
        </div>

        <div className="doctor-info">
          <div className="doctor-name">DR. {formData.doctorInfo?.doctorName || 'Name'}</div>
          <div className="doctor-title" style={{ marginBottom: '6px', padding: '6px 0' }}>
            {formData.doctorInfo?.qualifications || 'MBBS, MD'} | {formData.doctorInfo?.specialization || 'Specialist'}
          </div>
           <div className="doctor-title" style={{ color: '#6c757d', fontSize: '13px' }}>
            Medical Registration No : {formData.doctorInfo?.medicalRegistrationNumber || ''}
          </div>
        </div>

        <div className="prescription-content">
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

          <div className="prescription-section">
            <div className="section-header">
              🩺 VITALS
            </div>
            <div className="vitals-grid">
              <div className="vital-item">
                <div className="detail-label">BP</div>
                <div className="detail-value">
                  {formData.vitals?.bp
                    ? formData.vitals.bp
                    : formData.vitals?.bpSystolic && formData.vitals?.bpDiastolic
                      ? `${formData.vitals.bpSystolic}/${formData.vitals.bpDiastolic}`
                      : 'N/A'
                  } mmHg
                </div>
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
              {formData.vitals?.other && Object.entries(formData.vitals.other).map(([key, value]) => (
                <div className="vital-item" key={key}>
                  <div className="detail-label">{key}</div>
                  <div className="detail-value">{value}</div>
                </div>
              ))}
            </div>
          </div>

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
              {formData.diagnosis?.testNotes && (
                <div className="notes-display">
                  <div className="notes-label">Test Instructions:</div>
                  <div className="notes-content">{formData.diagnosis.testNotes}</div>
                </div>
              )}
            </div>
          )}

          {formData.diagnosis?.diagnosisList && (
            <div className="prescription-section">
              <div className="section concierto">
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
              {formData.diagnosis?.medicationNotes && (
                <div className="notes-display">
                  <div className="notes-label">Medication Instructions:</div>
                  <div className="notes-content">{formData.diagnosis.medicationNotes}</div>
                </div>
              )}
            </div>
          )}

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

          <div className="signature">
            <div style={{ height: "48px" }}></div>
            <div style={{ fontWeight: "bold" }}>DR. {formData.doctorInfo?.doctorName || 'Name'}</div>
            <div style={{ fontSize: '12px', marginTop: '4px' }}>
              <CheckCircle size={14} style={{ marginRight: '4px' }} />
              Digitally Signed
            </div>
          </div>
        </div>

        <div className="prescription-footer">
          This prescription is computer generated and does not require physical signature
        </div>
      </div>
    </div>
  );
};

export default Preview;