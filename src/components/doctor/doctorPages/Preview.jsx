import React, { useEffect, useState } from "react";
import { Printer, CheckCircle, Loader2 } from "lucide-react";
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
  const [isLoading, setIsLoading] = useState(true);

  const formatDate = (dateString) => {
    if (!dateString) return "Date not provided";
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

    // Store original styles
    const originalStyles = {
      boxShadow: input.style.boxShadow,
      padding: input.style.padding,
      margin: input.style.margin,
      overflow: input.style.overflow,
    };

    // Hide print buttons
    const printButtonContainer = input.querySelector(".print-button-container");
    const originalButtonDisplay = printButtonContainer?.style.display;
    if (printButtonContainer) {
      printButtonContainer.style.display = "none";
    }

    // Reset container styles for better capture
    input.style.boxShadow = "none";
    input.style.padding = "20px";
    input.style.margin = "0";
    input.style.overflow = "visible";
    input.style.width = "210mm"; // A4 width
    input.style.minHeight = "297mm"; // A4 height

    // Wait for images to load and convert to base64
    const images = input.querySelectorAll('img');
    for (let img of images) {
      if (img.src && !img.src.startsWith('data:')) {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Wait for image to load
          await new Promise((resolve, reject) => {
            const tempImg = new Image();
            tempImg.crossOrigin = "anonymous";
            tempImg.onload = () => {
              canvas.width = tempImg.naturalWidth;
              canvas.height = tempImg.naturalHeight;
              ctx.drawImage(tempImg, 0, 0);
              
              // Convert to base64 and replace src
              const dataURL = canvas.toDataURL('image/png');
              img.src = dataURL;
              resolve();
            };
            tempImg.onerror = () => resolve(); // Continue even if image fails
            tempImg.src = img.src;
          });
        } catch (error) {
          console.warn("Failed to convert image to base64:", error);
        }
      }
    }

    // Small delay to ensure DOM updates
    await new Promise(resolve => setTimeout(resolve, 500));

    // Capture with html2canvas
    const canvas = await html2canvas(input, {
      scale: 3, // Higher scale for better quality
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      logging: false,
      width: input.scrollWidth,
      height: input.scrollHeight,
      windowWidth: input.scrollWidth,
      windowHeight: input.scrollHeight,
      scrollX: 0,
      scrollY: 0,
      foreignObjectRendering: true,
    });

    // Restore original styles
    Object.assign(input.style, originalStyles);
    if (printButtonContainer) {
      printButtonContainer.style.display = originalButtonDisplay;
    }

    // Generate PDF
    const imgData = canvas.toDataURL("image/png", 1.0);
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    // Add first page
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;

    // Add additional pages if needed
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    const appointmentId = formData?.patientInfo?.appointmentId || "unknown";
    const pdfBlob = pdf.output("blob", { filename: `${appointmentId}.pdf` });

    console.log("Generated PDF Blob:", {
      type: pdfBlob.type,
      size: pdfBlob.size,
      filename: `${appointmentId}.pdf`,
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

  const handlePrintClick = async () => {
    try {
      const originalElement = document.getElementById("prescription-container");
      const clone = originalElement.cloneNode(true);

      const printButtonContainer = clone.querySelector(
        ".print-button-container"
      );
      if (printButtonContainer) {
        printButtonContainer.remove();
      }

      originalElement.style.visibility = "hidden";

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

      window.print();

      setTimeout(() => {
        document.body.removeChild(clone);
        originalElement.style.visibility = "visible";
      }, 500);
    } catch (error) {
      console.error("Error printing prescription:", error);
      toast.error("Failed to print prescription");
    }
  };

  const handleWhatsAppClick2 = async () => {
    try {
      const message =
        `Here's my medical prescription from ${
          selectedClinic?.clinicName || "Clinic"
        }\n` +
        `Patient: ${formData.patientInfo?.patientName || "Unknown Patient"}\n` +
        `Doctor: ${formData.doctorInfo?.doctorName || "Unknown Doctor"}\n` +
        `Date: ${formatDate(formData.doctorInfo?.appointmentDate)}`;

      window.open(
        `https://wa.me/?text=${encodeURIComponent(message)}`,
        "_blank"
      );
    } catch (error) {
      console.error("Failed to open WhatsApp:", error);
      toast.error("Failed to open WhatsApp");
    }
  };

  const getCurrentUserData = async () => {
    try {
      setIsLoading(true);
      const response = await apiGet(
        `/users/getUser?userId=${formData.doctorInfo?.doctorId}`
      );
      const userData = response.data?.data;
      const selectedClinic2 =
        userData?.addresses?.find(
          (address) =>
            address.addressId === formData.doctorInfo?.selectedClinicId
        ) || {};
      setSelectedClinic(selectedClinic2);
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (formData?.doctorInfo?.doctorId) {
      getCurrentUserData();
    } else {
      setIsLoading(false);
    }
  }, [formData?.doctorInfo?.doctorId]);

  const handleSaveClick = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      await handlePrescriptionAction("save");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <ToastContainer />
      <div id="prescription-container" className="prescription-container">
        {isLoading ? (
          <div className="loading-container">
            <Loader2 className="animate-spin" size={24} />
            <span>Loading prescription data...</span>
          </div>
        ) : (
          <>
            <div className="prescription-header">
              {selectedClinic?.headerImage ? (
                <img
                  src={selectedClinic.headerImage}
                  alt="Clinic Header"
                  className="header-image"
                  style={{
                    width: "100%",
                    maxHeight: "120px",
                    objectFit: "contain",
                    display: "block",
                    margin: "0 auto",
                  }}
                />
              ) : (
                selectedClinic && (
                  <>
                    <div className="clinic-info">
                      <div>
                        <div className="clinic-name">
                          {selectedClinic.clinicName
                            ? selectedClinic.clinicName
                                .charAt(0)
                                .toUpperCase() +
                              selectedClinic.clinicName.slice(1)
                            : "Clinic Name"}
                        </div>
                      </div>
                    </div>
                    <div className="contact-info">
                      <div>
                        📍 {selectedClinic.address || "Address not provided"}
                      </div>
                      <div>
                        📞 {selectedClinic.mobile || "Contact not provided"}
                      </div>
                    </div>
                  </>
                )
              )}
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
                  DR. {formData.doctorInfo?.doctorName || "Unknown Doctor"}
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    color: "#6b7280",
                    marginBottom: "6px",
                  }}
                >
                  {formData.doctorInfo?.qualifications ||
                    "Qualifications not provided"}{" "}
                  | {formData.doctorInfo?.specialization || "Specialist"}
                </div>
                <div style={{ fontSize: "13px", color: "#6c757d" }}>
                  Medical Registration No:{" "}
                  {formData.doctorInfo?.medicalRegistrationNumber ||
                    "Not provided"}
                </div>
              </div>

              <div style={{ flex: 1, textAlign: "right" }}>
                Patient Details:
                <div style={{ fontSize: "12px", marginBottom: "4px" }}>
                  {formData.patientInfo?.patientName || "Unknown Patient"}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#6b7280",
                    marginBottom: "6px",
                  }}
                >
                  {formData.patientInfo?.age || "Age not provided"} Years |{" "}
                  {formData.patientInfo?.gender
                    ? formData.patientInfo.gender.charAt(0).toUpperCase() +
                      formData.patientInfo.gender.slice(1)
                    : "Gender not provided"}
                </div>
                <div style={{ fontSize: "12px", color: "#6c757d" }}>
                  {formData.patientInfo?.mobileNumber || "Contact not provided"}
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
                      {formData.patientInfo?.chiefComplaint || "Not provided"}
                    </div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-label">Past History:</div>
                    <div className="detail-value">
                      {formData.patientInfo?.pastMedicalHistory ||
                        "Not provided"}
                    </div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-label">Family History:</div>
                    <div className="detail-value">
                      {formData.patientInfo?.familyMedicalHistory ||
                        "Not provided"}
                    </div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-label">Examination:</div>
                    <div className="detail-value">
                      {formData.patientInfo?.physicalExamination ||
                        "Not provided"}
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
                          : "Not provided"}{" "}
                        mmHg
                      </span>
                    </div>
                    <div className="vital-separator">|</div>
                    <div className="vital-item">
                      <span className="vital-label">Pulse:</span>
                      <span className="vital-value">
                        {formData.vitals?.pulseRate || "Not provided"} BPM
                      </span>
                    </div>
                    <div className="vital-separator">|</div>
                    <div className="vital-item">
                      <span className="vital-label">Temp:</span>
                      <span className="vital-value">
                        {formData.vitals?.temperature || "Not provided"}°F
                      </span>
                    </div>
                    <div className="vital-separator">|</div>
                    <div className="vital-item">
                      <span className="vital-label">SpO2:</span>
                      <span className="vital-value">
                        {formData.vitals?.spo2 || "Not provided"}%
                      </span>
                    </div>
                    <div className="vital-separator">|</div>
                    <div className="vital-item">
                      <span className="vital-label">RR:</span>
                      <span className="vital-value">
                        {formData.vitals?.respiratoryRate || "Not provided"}{" "}
                        breaths/min
                      </span>
                    </div>
                    <div className="vital-separator">|</div>
                    <div className="vital-item">
                      <span className="vital-label">Height:</span>
                      <span className="vital-value">
                        {formData.vitals?.height || "Not provided"} cm
                      </span>
                    </div>
                    <div className="vital-separator">|</div>
                    <div className="vital-item">
                      <span className="vital-label">Weight:</span>
                      <span className="vital-value">
                        {formData.vitals?.weight || "Not provided"} kg
                      </span>
                    </div>
                    <div className="vital-separator">|</div>
                    <div className="vital-item">
                      <span className="vital-label">BMI:</span>
                      <span className="vital-value">
                        {formData.vitals?.bmi || "Not provided"}
                      </span>
                    </div>
                    {formData.vitals?.other &&
                      Object.entries(formData.vitals.other).map(
                        ([key, value]) => (
                          <>
                            <div className="vital-separator">|</div>
                            <div className="vital-item" key={key}>
                              <span className="vital-label">{key}:</span>
                              <span className="vital-value">
                                {value || "Not provided"}
                              </span>
                            </div>
                          </>
                        )
                      )}
                  </div>
                </div>
              </div>

              {formData.diagnosis?.selectedTests?.length > 0 && (
                <div className="prescription-section">
                  <div className="section-header">🔬 TESTS</div>
                  <div className="investigation-row">
                    {formData.diagnosis.selectedTests.map((test, index) => (
                      <div key={index} className="investigation-item">
                        <div className="detail-value">
                          {test.testName || test}
                        </div>
                      </div>
                    ))}
                  </div>
                  {formData.diagnosis?.testNotes && (
                    <div className="notes-display">
                      <div className="notes-label">Test Findings:</div>
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

              {(formData.diagnosis?.medications?.length > 0 ||
                formData.advice?.medicationNotes) && (
                <div className="prescription-section">
                  <div className="section-header">💊 MEDICATION</div>
                  {formData.diagnosis?.medications?.length > 0 && (
                    <>
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
                                {med.medicineType || "Not provided"}
                              </td>
                              <td className="table-cell">
                                {med.medName || med.name || "Not provided"}
                              </td>
                              <td className="table-cell">
                                {med.dosage ||
                                  med.dosagePattern ||
                                  "As directed"}
                              </td>
                              <td className="table-cell">
                                {med.frequency || "Not provided"}
                              </td>
                              <td className="table-cell">
                                {med.timings
                                  ? med.timings.join(", ")
                                  : med.timing || "Not provided"}
                              </td>
                              <td className="table-cell">
                                {med.notes || "Not provided"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </>
                  )}
                  {formData.advice?.medicationNotes && (
                    <div className="notes-display">
                      <div className="notes-label">
                        Medication Instructions:
                      </div>
                      <div className="notes-content">
                        {formData.advice.medicationNotes}
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
                {selectedClinic?.digitalSignature ? (
                  <img
                    src={selectedClinic.digitalSignature}
                    alt="Digital Signature"
                    className="digital-signature"
                  />
                ) : (
                  <>
                    <div style={{ height: "48px" }}></div>
                    <div style={{ fontWeight: "bold" }}>
                      DR. {formData.doctorInfo?.doctorName || "Unknown Doctor"}
                    </div>
                  </>
                )}
                <div style={{ fontSize: "12px", marginTop: "4px" }}>
                  <CheckCircle size={14} style={{ marginRight: "4px" }} />
                  Digitally Signed
                </div>
              </div>
            </div>

            <div className="prescription-footer">
              This prescription is computer generated and does not require
              physical signature
            </div>

            <div className="print-button-container">
              <button className="print-button" onClick={handlePrintClick}>
                <Printer size={16} style={{ marginRight: "8px" }} />
                Print Prescription
              </button>
              <button className="whatsapp-button" onClick={handleWhatsAppClick}>
                <FaWhatsapp
                  className="whatsapp-icon"
                  style={{ marginRight: "8px" }}
                />
                Share via WhatsApp
              </button>
              <button
                className="save-button"
                onClick={handleSaveClick}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={16} />
                    Saving...
                  </>
                ) : (
                  "Save"
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Preview;
