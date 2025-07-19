import React, { useEffect, useState } from "react";
import { Printer, CheckCircle } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { apiGet } from "../../api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../stylings/Preview.css";

const Preview = ({ formData, handlePrescriptionAction }) => {
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [isSaving, setIsSaving] = useState(false); 

  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const generatePDF = async () => {
    try {
      const input = document.getElementById("prescription-container");
      if (!input) {
        throw new Error("Could not find the prescription container element");
      }

      // Apply print-specific styles before capturing
      const originalStyles = {
        boxShadow: input.style.boxShadow,
        padding: input.style.padding,
        margin: input.style.margin,
      };

      input.style.boxShadow = "none";
      input.style.padding = "0";
      input.style.margin = "0";

      const canvas = await html2canvas(input, {
        scale: 2,
        useCORS: true,
        logging: true,
        backgroundColor: "#ffffff",
        scrollX: 0,
        scrollY: 0,
        windowWidth: input.scrollWidth,
        windowHeight: input.scrollHeight,
      });

      // Restore original styles
      input.style.boxShadow = originalStyles.boxShadow;
      input.style.padding = originalStyles.padding;
      input.style.margin = originalStyles.margin;

      // Convert canvas to PDF
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight, null, "FAST");
      // const pdfBlob = pdf.output("blob");
      console.log("formData===",formData)
      const appointmentId = formData?.patientInfo?.appointmentId || "unknown";
      const pdfBlob = pdf.output("blob", { filename: `${appointmentId}.pdf` });

      console.log("Generated PDF Blob:", {
        type: pdfBlob.type,
        size: pdfBlob.size,
        filename: `${appointmentId}.pdf`,
      });

      console.log("Generated PDF Blob:", {
        type: pdfBlob.type,
        size: pdfBlob.size,
      });

      return pdfBlob;
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate prescription PDF");
      throw error;
    }
  };

  const handleWhatsAppClick = async () => {
    try {
      const pdfBlob = await generatePDF();
      if (!pdfBlob) {
        throw new Error("PDF Blob generation failed");
      }
      await handlePrescriptionAction("whatsapp", pdfBlob);
    } catch (error) {
      console.error("Failed to generate PDF for WhatsApp:", error);
      toast.error("Failed to generate prescription for WhatsApp");
    }
  };

  const handlePrintClick2 = async () => {
    try {
      const pdfBlob = await generatePDF();
      const pdfUrl = URL.createObjectURL(pdfBlob);
      const printWindow = window.open(pdfUrl);
      printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
      };
      printWindow.onbeforeunload = () => URL.revokeObjectURL(pdfUrl);
    } catch (error) {
      console.error("Error printing prescription:", error);
      toast.error("Failed to print prescription");
    }
  };

//   const handlePrintClick = () => {
//   try {
//     // Temporarily hide the print, WhatsApp, and save buttons for printing
//     const buttons = document.querySelectorAll(".print-button-container");
//     buttons.forEach((button) => (button.style.display = "none"));

//     // Trigger the browser's print dialog
//     window.print();

//     // Restore the buttons after printing
//     buttons.forEach((button) => (button.style.display = "flex"));
//   } catch (error) {
//     console.error("Error printing prescription:", error);
//     toast.error("Failed to print prescription");
//   }
// };

const handlePrintClick = async () => {
    try {
      // Create a clone of the prescription container
      const originalElement = document.getElementById("prescription-container");
      const clone = originalElement.cloneNode(true);

      // Remove the print button container from the clone
      const printButtonContainer = clone.querySelector(
        ".print-button-container"
      );
      if (printButtonContainer) {
        printButtonContainer.remove();
      }

      // Hide the original element temporarily
      originalElement.style.visibility = "hidden";

      // Add the clone to the body with print-specific styles
      clone.style.position = "absolute";
      clone.style.left = "0";
      clone.style.top = "0";
      clone.style.width = "100%";
      clone.style.maxWidth = "100%";
      clone.style.boxShadow = "none";
      clone.style.padding = "0";
      clone.style.margin = "0";
      clone.id = "print-clone";
      document.body.appendChild(clone);

      // Trigger the print dialog
      window.print();

      // Clean up after printing
      setTimeout(() => {
        document.body.removeChild(clone);
        originalElement.style.visibility = "visible";
      }, 500);
    } catch (error) {
      console.error("Error printing prescription:", error);
    }
  };



  const handleWhatsAppClick2 = async () => {
    try {
      const message = `Here's my medical prescription from ${selectedClinic?.clinicName || "Clinic"}\n` +
        `Patient: ${formData.patientInfo?.patientName || "N/A"}\n` +
        `Doctor: ${formData.doctorInfo?.doctorName || "N/A"}\n` +
        `Date: ${formatDate(formData.doctorInfo?.appointmentDate) || "N/A"}`;
      
      window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
    } catch (error) {
      console.error("Failed to open WhatsApp:", error);
      toast.error("Failed to open WhatsApp");
    }
  };

  const getCurrentUserData = async () => {
    try {
      const response = await apiGet("/users/getUser");
      const userData = response.data?.data;
      const selectedClinic2 =
        userData?.addresses?.find(
          (address) =>
            address.addressId === formData.doctorInfo?.selectedClinicId
        ) || {};
      setSelectedClinic(selectedClinic2);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    if (formData?.doctorInfo?.doctorId) {
      getCurrentUserData();
    }
  }, [formData?.doctorInfo?.doctorId]);

    const handleSaveClick = async () => {
      console.log("Saving prescription...", isSaving);
    // prevent double click
if (isSaving === false){
setIsSaving(true); // disable the button
    await handlePrescriptionAction("save"); // call the parent function
}
     if (isSaving) return;
    // If needed, you can re-enable it later:
    // setIsSaving(false);
  };

console.log("formdata===",formData)
  return (
    <div>
      <ToastContainer />
      <div id="prescription-container" className="prescription-container">
        <div className="prescription-header">
          <div className="clinic-info">
            <div>
              <div className="clinic-name">
                {selectedClinic?.clinicName
                  ? selectedClinic.clinicName.charAt(0).toUpperCase() +
                    selectedClinic.clinicName.slice(1)
                  : ""}
              </div>
            </div>
          </div>
          <div className="contact-info">
            <div>📍{selectedClinic?.address || "Not specified"}</div>
            <div>📞 {selectedClinic?.mobile || "Not specified"}</div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "16px",
          }}
        >
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: "18px",
                fontWeight: "bold",
                marginBottom: "4px",
              }}
            >
              DR. {formData.doctorInfo?.doctorName || "Name"}
            </div>
            <div
              style={{
                fontSize: "14px",
                color: "#6b7280",
                marginBottom: "6px",
              }}
            >
              {formData.doctorInfo?.qualifications || "MBBS, MD"} |{" "}
              {formData.doctorInfo?.specialization || "Specialist"}
            </div>
            <div style={{ fontSize: "13px", color: "#6c757d" }}>
              Medical Registration No:{" "}
              {formData.doctorInfo?.medicalRegistrationNumber || ""}
            </div>
          </div>

          <div style={{ flex: 1, textAlign: "right" }}>
            <div style={{ fontSize: "12px", marginBottom: "4px" }}>
              {formData.patientInfo?.patientName || "Not provided"}
            </div>
            <div
              style={{
                fontSize: "12px",
                color: "#6b7280",
                marginBottom: "6px",
              }}
            >
              {formData.patientInfo?.age || "N/A"} Years |{" "}
              {formData.patientInfo?.gender
                ? formData.patientInfo.gender.charAt(0).toUpperCase() +
                  formData.patientInfo.gender.slice(1)
                : "Not specified"}
            </div>
            <div style={{ fontSize: "12px", color: "#6c757d" }}>
              {formData.patientInfo?.mobileNumber || "Not provided"}
            </div>
          </div>
        </div>

        <div className="prescription-content">
          <div className="prescription-section">
            <div className="section-header">📋 PATIENT HISTORY</div>
            <div className="history-row">
              <div className="detail-item">
                <div className="detail-label">Chief Complaint:</div>
                <div className="detail-value">
                  {formData.patientInfo?.chiefComplaint || "Not specified"}
                </div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Past History:</div>
                <div className="detail-value">
                  {formData.patientInfo?.pastMedicalHistory || "Not specified"}
                </div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Family History:</div>
                <div className="detail-value">
                  {formData.patientInfo?.familyMedicalHistory || "Not specified"}
                </div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Examination:</div>
                <div className="detail-value">
                  {formData.patientInfo?.physicalExamination || "Not specified"}
                </div>
              </div>
            </div>
          </div>

          <div className="prescription-section">
            <div className="section-header">🩺 VITALS</div>
            <div className="vitals-container">
              <div className="vitals-row">
                <div className="vital-item">
                  <span className="vital-label">BP:</span>
                  <span className="vital-value">
                    {formData.vitals?.bp
                      ? formData.vitals.bp
                      : formData.vitals?.bpSystolic &&
                        formData.vitals?.bpDiastolic
                      ? `${formData.vitals.bpSystolic}/${formData.vitals.bpDiastolic}`
                      : "N/A"}{" "}
                    mmHg
                  </span>
                </div>
                <div className="vital-separator">|</div>
                <div className="vital-item">
                  <span className="vital-label">Pulse:</span>
                  <span className="vital-value">
                    {formData.vitals?.pulseRate || "N/A"} BPM
                  </span>
                </div>
                <div className="vital-separator">|</div>
                <div className="vital-item">
                  <span className="vital-label">Temp:</span>
                  <span className="vital-value">
                    {formData.vitals?.temperature || "N/A"}°F
                  </span>
                </div>
                <div className="vital-separator">|</div>
                <div className="vital-item">
                  <span className="vital-label">SpO2:</span>
                  <span className="vital-value">
                    {formData.vitals?.spo2 || "N/A"}%
                  </span>
                </div>
                <div className="vital-separator">|</div>
                <div className="vital-item">
                  <span className="vital-label">RR:</span>
                  <span className="vital-value">
                    {formData.vitals?.respiratoryRate || "N/A"} breaths/min
                  </span>
                </div>
                <div className="vital-separator">|</div>
                <div className="vital-item">
                  <span className="vital-label">Height:</span>
                  <span className="vital-value">
                    {formData.vitals?.height || "N/A"} cm
                  </span>
                </div>
                <div className="vital-separator">|</div>
                <div className="vital-item">
                  <span className="vital-label">Weight:</span>
                  <span className="vital-value">
                    {formData.vitals?.weight || "N/A"} kg
                  </span>
                </div>
                <div className="vital-separator">|</div>
                <div className="vital-item">
                  <span className="vital-label">BMI:</span>
                  <span className="vital-value">
                    {formData.vitals?.bmi || "N/A"}
                  </span>
                </div>
                {formData.vitals?.other &&
                  Object.entries(formData.vitals.other).map(([key, value]) => (
                    <>
                      <div className="vital-separator">|</div>
                      <div className="vital-item" key={key}>
                        <span className="vital-label">{key}:</span>
                        <span className="vital-value">{value}</span>
                      </div>
                    </>
                  ))}
              </div>
            </div>
          </div>

          {formData.diagnosis?.selectedTests?.length > 0 && (
            <div className="prescription-section">
              <div className="section-header">🔬 TESTS</div>
              <div className="investigation-row">
                {formData.diagnosis.selectedTests.map((test, index) => (
                  <div key={index} className="investigation-item">
                    <div className="detail-value">{test.testName || test}</div>
                  </div>
                ))}
              </div>
              {formData.diagnosis?.testNotes && (
                <div className="notes-display">
                  <div className="notes-label">Test Instructions:</div>
                  <div className="notes-content">
                    {formData.diagnosis.testNotes}
                  </div>
                </div>
              )}
            </div>
          )}

          {formData.diagnosis?.diagnosisList && (
            <div className="prescription-section">
              <div className="section-header">🩺 DIAGNOSIS</div>
              <div className="diagnosis-row">
                {formData.diagnosis.diagnosisList
                  .split(",")
                  .map((diagnosis, index) => (
                    <span key={index} className="diagnosis-tag">
                      {diagnosis.trim().toUpperCase()}
                    </span>
                  ))}
              </div>
            </div>
          )}

          {formData.diagnosis?.medications?.length > 0 && (
            <div className="prescription-section">
              <div className="section-header">💊 MEDICATION</div>
              <table className="medication-table">
                <thead>
                  <tr>
                    <th className="table-header">Type</th>
                    <th className="table-header">Medicine Name</th>
                    <th className="table-header">Dosage</th>
                    <th className="table-header">Frequency</th>
                    <th className="table-header">Timings</th>
                    <th className="table-header">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.diagnosis.medications.map((med, index) => (
                    <tr key={index}>
                      <td className="table-cell">
                        {med.medicineType || "N/A"}
                      </td>
                      <td className="table-cell">
                        {med.medName || med.name || "Not specified"}
                      </td>
                      <td className="table-cell">
                        {med.dosage || med.dosagePattern || "As directed"}
                      </td>
                      <td className="table-cell">{med.frequency || "N/A"}</td>
                      <td className="table-cell">
                        {med.timings
                          ? med.timings.join(", ")
                          : med.timing || "N/A"}
                      </td>
                      <td className="table-cell">{med.notes || "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {formData.diagnosis?.medicationNotes && (
                <div className="notes-display">
                  <div className="notes-label">Medication Instructions:</div>
                  <div className="notes-content">
                    {formData.diagnosis.medicationNotes}
                  </div>
                </div>
              )}
            </div>
          )}

          {formData.advice?.advice && (
            <div className="prescription-section">
              <div className="section-header">💡 ADVICE</div>
              <ul className="advice-list">
                {formData.advice.advice.split("\n").map(
                  (item, index) =>
                    item.trim() && (
                      <li key={index} className="advice-item">
                        <span className="bullet">•</span>
                        <span>{item}</span>
                      </li>
                    )
                )}
              </ul>
            </div>
          )}

          {formData.advice?.followUpDate && (
            <div className="prescription-section">
              <div className="section-header">📅 FOLLOW-UP</div>
              <div className="follow-up-container">
                <div className="follow-up-date">
                  Next Visit: {formatDate(formData.advice.followUpDate)}
                </div>
              </div>
            </div>
          )}

          <div className="signature">
            <div style={{ height: "48px" }}></div>
            <div style={{ fontWeight: "bold" }}>
              DR. {formData.doctorInfo?.doctorName || "Name"}
            </div>
            <div style={{ fontSize: "12px", marginTop: "4px" }}>
              <CheckCircle size={14} style={{ marginRight: "4px" }} />
              Digitally Signed
            </div>
          </div>
        </div>

        <div className="prescription-footer">
          This prescription is computer generated and does not require physical
          signature
        </div>

        <div className="print-button-container">
          <button className="print-button" onClick={handlePrintClick}>
            <Printer size={16} style={{ marginRight: "8px" }} />
            Print Prescription
          </button>
          <button className="whatsapp-button" 
          onClick={handleWhatsAppClick}
          >
            <FaWhatsapp className="whatsapp-icon" style={{ marginRight: "8px" }} />
            Share via WhatsApp
          </button>
          <button className="save-button" onClick={handleSaveClick} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save"}
          </button>
            
        </div>
      </div>
    </div>
  );
};

export default Preview;