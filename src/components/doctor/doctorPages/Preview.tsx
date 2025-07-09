import React from "react";
import logo from "../../../assets/logooo.png";
import '../../stylings/EPrescription.css';

const MedicalPrescriptionForm = () => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <div className="print-button-container">
        <button className="print-button" onClick={handlePrint}>
          Print Prescription
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
            <div>📍 Ring Road, Nagpur - 440001</div>
            <div>📞 +91 98765 43210</div>
            <div>
              <div>✉️ info@vydhyo.com</div>
              <div>🌐 www.vydhyo.com</div>
            </div>
          </div>
        </div>

        {/* Doctor Info */}
        <div className="doctor-info">
          <div className="doctor-name">DR.Name</div>
          <div className="doctor-title">
            MBBS, MD (Internal Medicine) | Cardiologist
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
                <div className="detail-value">John Doe</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Age</div>
                <div className="detail-value">45 Years</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Gender</div>
                <div className="detail-value">Male</div>
              </div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Mobile</div>
              <div className="detail-value">+91 98765 12345</div>
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
                    Chest pain and shortness of breath since 2 days
                  </div>
                </div>
                <div className="detail-item" style={{ marginTop: "12px" }}>
                  <div className="detail-label">Past History</div>
                  <div className="detail-value">
                    Hypertension for 5 years, Type 2 Diabetes for 3 years
                  </div>
                </div>
              </div>
              <div>
                <div className="detail-item">
                  <div className="detail-label">Family History</div>
                  <div className="detail-value">
                    Father - history of heart attack at age 65
                  </div>
                </div>
                <div className="detail-item" style={{ marginTop: "12px" }}>
                  <div className="detail-label">Examination</div>
                  <div className="detail-value">
                    BP: 140/90 mmHg, HR: 86 BPM, mild pedal edema present
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
                <div className="detail-value">140/90 mmHg</div>
              </div>
              <div className="vital-item">
                <div className="detail-label">Pulse</div>
                <div className="detail-value">86 BPM</div>
              </div>
              <div className="vital-item">
                <div className="detail-label">Temperature</div>
                <div className="detail-value">98.6°F</div>
              </div>
              <div className="vital-item">
                <div className="detail-label">SpO2</div>
                <div className="detail-value">96% on room air</div>
              </div>
              <div className="vital-item">
                <div className="detail-label">RR</div>
                <div className="detail-value">20 breaths/min</div>
              </div>
            </div>
          </div>

          {/* Investigation */}
          <div className="prescription-section">
            <div className="section-header">
              🔬 INVESTIGATION
            </div>
            <div className="investigation-grid">
              <div className="investigation-item">
                <div className="detail-value">ECG</div>
              </div>
              <div className="investigation-item">
                <div className="detail-value">ECHO</div>
              </div>
              <div className="investigation-item">
                <div className="detail-value">CBC</div>
              </div>
              <div className="investigation-item">
                <div className="detail-value">Fasting Blood Sugar</div>
              </div>
            </div>
            <div className="investigation-item" style={{ marginTop: "12px" }}>
              <div className="detail-value">Lipid Profile</div>
            </div>
          </div>

          {/* Diagnosis */}
          <div className="prescription-section">
            <div className="section-header">
              🩺 DIAGNOSIS
            </div>
            <div className="diagnosis-tags">
              <span className="diagnosis-tag">
                ACUTE CORONARY SYNDROME
              </span>
              <span className="diagnosis-tag">
                SYSTEMIC HYPERTENSION
              </span>
              <span className="diagnosis-tag">
                TYPE 2 DIABETES MELLITUS
              </span>
            </div>
          </div>

          {/* Medication */}
          <div className="prescription-section">
            <div className="section-header">
              💊 MEDICATION
            </div>
            <table className="medication-table">
              <thead>
                <tr>
                  <th className="table-header">Medicine Name</th>
                  <th className="table-header">Dosage</th>
                  <th className="table-header">Frequency</th>
                  <th className="table-header">Duration</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="table-cell">Tab. Ecosprin 75</td>
                  <td className="table-cell">75mg</td>
                  <td className="table-cell">Once daily</td>
                  <td className="table-cell">30 days</td>
                </tr>
                <tr>
                  <td className="table-cell">Tab. Metoprolol 25</td>
                  <td className="table-cell">25mg</td>
                  <td className="table-cell">Twice daily</td>
                  <td className="table-cell">30 days</td>
                </tr>
                <tr>
                  <td className="table-cell">Tab. Glycomet GP1</td>
                  <td className="table-cell">1mg</td>
                  <td className="table-cell">Twice daily</td>
                  <td className="table-cell">30 days</td>
                </tr>
                <tr>
                  <td className="table-cell">Tab. Rosuvastatin 10mg</td>
                  <td className="table-cell">10mg</td>
                  <td className="table-cell">Once at night</td>
                  <td className="table-cell">30 days</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Advice */}
          <div className="prescription-section">
            <div className="section-header">
              💡 ADVICE
            </div>
            <ul className="advice-list">
              <li className="advice-item">
                <span className="bullet">•</span>
                <span>Rest and avoid strenuous activities</span>
              </li>
              <li className="advice-item">
                <span className="bullet">•</span>
                <span>Low salt, low fat diet</span>
              </li>
              <li className="advice-item">
                <span className="bullet">•</span>
                <span>Monitor blood pressure daily</span>
              </li>
              <li className="advice-item">
                <span className="bullet">•</span>
                <span>Follow heart-healthy lifestyle</span>
              </li>
              <li className="advice-item">
                <span className="bullet">•</span>
                <span>Maintain blood sugar levels</span>
              </li>
            </ul>
          </div>

          {/* Follow-up */}
          <div className="prescription-section">
            <div className="section-header">
              📅 FOLLOW-UP
            </div>
            <div className="follow-up">
              <div style={{ fontWeight: "bold", marginBottom: "4px" }}>
                Next Visit: 15-July-2024
              </div>
              <div>For Emergencies, Call: +91 98765 43210</div>
            </div>
          </div>

          {/* Signature */}
          <div className="signature">
            <div style={{ height: "48px" }}></div>
            <div style={{ fontWeight: "bold" }}>DR.Name</div>
          </div>
        </div>

        {/* Footer */}
        <div className="prescription-footer">
          This prescription is computer generated and does not require signature
        </div>
      </div>
    </>
  );
};

export default MedicalPrescriptionForm;