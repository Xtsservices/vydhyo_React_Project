import React, { useEffect, useState } from "react";
import { Printer, CheckCircle, Loader2, Calendar, Clock } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { apiGet } from "../../api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../stylings/Preview.css";

const Preview = ({ formData, handlePrescriptionAction }) => {
  console.log("formDatannnnn", formData.doctorInfo);
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const formatDate = (dateString) => {
    if (!dateString) return null; // Return null instead of "Date not provided"
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
        maxHeight: input.style.maxHeight,
        height: input.style.height,
      };

      const printButtonContainer = input.querySelector(".print-button-container");
      const originalButtonDisplay = printButtonContainer?.style.display;
      if (printButtonContainer) {
        printButtonContainer.style.display = "none";
      }

      // Apply minimal styles for rendering
      input.style.boxShadow = "none";
      input.style.overflow = "visible";
      input.style.maxHeight = "none";
      input.style.height = "auto";

      // Wait for images to load
      const images = input.querySelectorAll("img");
      const loadPromises = Array.from(images).map((img) => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
        });
      });
      await Promise.all(loadPromises);

      // Ensure rendering is complete
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Initialize jsPDF
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Capture the entire container
      const canvas = await html2canvas(input, {
        scale: 2,
        useCORS: true,
        logging: true,
        backgroundColor: "#ffffff",
        scrollY: -window.scrollY,
        windowWidth: document.documentElement.scrollWidth,
        windowHeight: input.scrollHeight,
      });

      const imgData = canvas.toDataURL("image/png");
      const imgProps = pdf.getImageProperties(imgData);
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      // Calculate the number of pages
      const pageContentHeight = pageHeight;
      const totalPages = Math.ceil(pdfHeight / pageContentHeight);

      // Render each page with clipping
      for (let page = 0; page < totalPages; page++) {
        const srcY = page * pageContentHeight * (imgProps.height / pdfHeight);
        const srcHeight = Math.min(
          pageContentHeight * (imgProps.height / pdfHeight),
          imgProps.height - srcY
        );

        // Create a temporary canvas to clip the image
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = imgProps.width;
        tempCanvas.height = srcHeight;
        const ctx = tempCanvas.getContext("2d");
        ctx.drawImage(
          canvas,
          0,
          srcY,
          imgProps.width,
          srcHeight,
          0,
          0,
          imgProps.width,
          srcHeight
        );

        const pageImgData = tempCanvas.toDataURL("image/png");

        // Add clipped image to PDF
        pdf.addImage(
          pageImgData,
          "PNG",
          0,
          0,
          pdfWidth,
          (srcHeight * pdfWidth) / imgProps.width,
          null,
          "FAST"
        );

        // Add new page if more content remains
        if (page < totalPages - 1) {
          pdf.addPage();
        }
      }

      // Restore original styles
      Object.assign(input.style, originalStyles);
      if (printButtonContainer) {
        printButtonContainer.style.display = originalButtonDisplay;
      }

      const appointmentId = formData?.patientInfo?.appointmentId || "unknown";
      const pdfBlob = pdf.output("blob", { filename: `${appointmentId}.pdf` });

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
      if (!originalElement) {
        throw new Error("Could not find the prescription container element");
      }

      // Clone the element
      const clone = originalElement.cloneNode(true);

      // Remove print button container from clone
      const printButtonContainer = clone.querySelector(".print-button-container");
      if (printButtonContainer) {
        printButtonContainer.remove();
      }

      // Hide original element
      originalElement.style.visibility = "hidden";

      // Styling for the clone
      clone.style.position = "absolute";
      clone.style.left = "0";
      clone.style.top = "0";
      clone.style.width = "100%";
      clone.style.maxWidth = "100%";
      clone.style.boxShadow = "none";
      clone.style.padding = "0";
      clone.style.margin = "0";
      clone.style.overflow = "visible";
      clone.style.height = "auto";
      clone.id = "print-clone";

      // Append to DOM
      document.body.appendChild(clone);

      // Wait for images to load
      const images = clone.querySelectorAll("img");
      const loadPromises = Array.from(images).map((img) =>
        img.complete
          ? Promise.resolve()
          : new Promise((resolve) => {
              img.onload = resolve;
              img.onerror = resolve;
            })
      );
      await Promise.all(loadPromises);

      await new Promise((resolve) => setTimeout(resolve, 100));

      const pageHeight = 1123;
      const totalHeight = clone.scrollHeight;

      if (totalHeight <= pageHeight + 5) {
        clone.style.height = `${pageHeight}px`;
        clone.style.overflow = "hidden";

        window.print();
        setTimeout(() => {
          document.body.removeChild(clone);
          originalElement.style.visibility = "visible";
        }, 500);
        return;
      }

      // Otherwise, print only second page
      const secondPageClone = clone.cloneNode(true);
      secondPageClone.id = "second-page-only";

      // Style to show only content after first page
      secondPageClone.style.position = "absolute";
      secondPageClone.style.top = "0";
      secondPageClone.style.left = "0";
      secondPageClone.style.width = "100%";
      secondPageClone.style.overflow = "hidden";
      secondPageClone.style.height = `${totalHeight - pageHeight}px`;
      secondPageClone.style.clipPath = `inset(${pageHeight}px 0 0 0)`;

      // Remove old clone and use second page clone
      document.body.removeChild(clone);
      document.body.appendChild(secondPageClone);

      window.print();

      setTimeout(() => {
        document.body.removeChild(secondPageClone);
        originalElement.style.visibility = "visible";
      }, 500);
    } catch (error) {
      console.error("Error printing prescription:", error);
      toast.error("Failed to print prescription");
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
                    {selectedClinic.clinicName &&
                      selectedClinic.clinicName !== "Clinic Name" && (
                        <div className="clinic-info">
                          <div>
                            <div className="clinic-name">
                              {selectedClinic.clinicName.charAt(0).toUpperCase() +
                                selectedClinic.clinicName.slice(1)}
                            </div>
                          </div>
                        </div>
                      )}
                    {(selectedClinic.address ||
                      selectedClinic.mobile) && (
                      <div className="contact-info">
                        {selectedClinic.address &&
                          selectedClinic.address !== "Address not provided" && (
                            <div>📍 {selectedClinic.address}</div>
                          )}
                        {selectedClinic.mobile &&
                          selectedClinic.mobile !== "Contact not provided" && (
                            <div>📞 {selectedClinic.mobile}</div>
                          )}
                      </div>
                    )}
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
                {formData.doctorInfo?.doctorName &&
                  formData.doctorInfo.doctorName !== "Unknown Doctor" && (
                    <div
                      style={{
                        fontSize: "18px",
                        fontWeight: "bold",
                        marginBottom: "4px",
                      }}
                    >
                      DR. {formData.doctorInfo.doctorName}
                    </div>
                  )}
                {(formData.doctorInfo?.qualifications ||
                  formData.doctorInfo?.specialization) && (
                  <div
                    style={{
                      fontSize: "14px",
                      color: "#6b7280",
                      marginBottom: "6px",
                    }}
                  >
                    {formData.doctorInfo?.qualifications &&
                      formData.doctorInfo.qualifications !==
                        "Qualifications not provided" &&
                      formData.doctorInfo.qualifications}
                    {formData.doctorInfo?.qualifications &&
                      formData.doctorInfo.qualifications !==
                        "Qualifications not provided" &&
                      formData.doctorInfo?.specialization &&
                      " | "}
                    {formData.doctorInfo?.specialization &&
                      formData.doctorInfo.specialization !== "Specialist" &&
                      formData.doctorInfo.specialization}
                  </div>
                )}
                {formData.doctorInfo?.medicalRegistrationNumber &&
                  formData.doctorInfo.medicalRegistrationNumber !==
                    "Not provided" && (
                    <div style={{ fontSize: "13px", color: "#6c757d" }}>
                      Medical Registration No:{" "}
                      {formData.doctorInfo.medicalRegistrationNumber}
                    </div>
                  )}
              </div>

              <div style={{ flex: 1, textAlign: "right" }}>
                Patient Details:
                {formData.patientInfo?.patientName &&
                  formData.patientInfo.patientName !== "Unknown Patient" && (
                    <div style={{ fontSize: "12px", marginBottom: "4px" }}>
                      {formData.patientInfo.patientName}
                    </div>
                  )}
                {(formData.patientInfo?.age ||
                  formData.patientInfo?.gender) && (
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#6b7280",
                      marginBottom: "6px",
                    }}
                  >
                    {formData.patientInfo?.age &&
                      formData.patientInfo.age !== "Age not provided" &&
                      `${formData.patientInfo.age} Years`}
                    {formData.patientInfo?.age &&
                      formData.patientInfo.age !== "Age not provided" &&
                      formData.patientInfo?.gender &&
                      " | "}
                    {formData.patientInfo?.gender &&
                      formData.patientInfo.gender !== "Gender not provided" &&
                      formData.patientInfo.gender.charAt(0).toUpperCase() +
                        formData.patientInfo.gender.slice(1)}
                  </div>
                )}
                {formData.patientInfo?.mobileNumber &&
                  formData.patientInfo.mobileNumber !==
                    "Contact not provided" && (
                    <div style={{ fontSize: "12px", color: "#6c757d" }}>
                      {formData.patientInfo.mobileNumber}
                    </div>
                  )}
              </div>
            </div>

            {/* Appointment Date and Time Section */}
            {(formData.doctorInfo?.appointmentDate ||
              formData.doctorInfo?.appointmentStartTime) && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "16px",
                  padding: "8px",
                  backgroundColor: "#f8f9fa",
                  borderRadius: "4px",
                }}
              >
                {formData.doctorInfo?.appointmentDate &&
                  formatDate(formData.doctorInfo.appointmentDate) && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <Calendar size={16} color="#6c757d" />
                      <span style={{ fontSize: "14px", fontWeight: "500" }}>
                        Date: {formatDate(formData.doctorInfo.appointmentDate)}
                      </span>
                    </div>
                  )}
                {formData.doctorInfo?.appointmentStartTime &&
                  formData.doctorInfo.appointmentStartTime !==
                    "Not specified" && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <Clock size={16} color="#6c757d" />
                      <span style={{ fontSize: "14px", fontWeight: "500" }}>
                        Time: {formData.doctorInfo.appointmentStartTime}
                      </span>
                    </div>
                  )}
              </div>
            )}

            <div className="prescription-content">
              {(formData.patientInfo?.chiefComplaint ||
                formData.patientInfo?.pastMedicalHistory ||
                formData.patientInfo?.familyMedicalHistory ||
                formData.patientInfo?.physicalExamination) && (
                <div className="prescription-section">
                  <div className="section-header">📋 PATIENT HISTORY</div>
                  <div className="history-row">
                    {formData.patientInfo?.chiefComplaint &&
                      formData.patientInfo.chiefComplaint !== "Not provided" && (
                        <div className="detail-item">
                          <div className="detail-label">Chief Complaint:</div>
                          <div className="detail-value">
                            {formData.patientInfo.chiefComplaint}
                          </div>
                        </div>
                      )}
                    {formData.patientInfo?.pastMedicalHistory &&
                      formData.patientInfo.pastMedicalHistory !==
                        "Not provided" && (
                        <div className="detail-item">
                          <div className="detail-label">Past History:</div>
                          <div className="detail-value">
                            {formData.patientInfo.pastMedicalHistory}
                          </div>
                        </div>
                      )}
                    {formData.patientInfo?.familyMedicalHistory &&
                      formData.patientInfo.familyMedicalHistory !==
                        "Not provided" && (
                        <div className="detail-item">
                          <div className="detail-label">Family History:</div>
                          <div className="detail-value">
                            {formData.patientInfo.familyMedicalHistory}
                          </div>
                        </div>
                      )}
                    {formData.patientInfo?.physicalExamination &&
                      formData.patientInfo.physicalExamination !==
                        "Not provided" && (
                        <div className="detail-item">
                          <div className="detail-label">Examination:</div>
                          <div className="detail-value">
                            {formData.patientInfo.physicalExamination}
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              )}

              {(formData.vitals?.bp ||
                formData.vitals?.bpSystolic ||
                formData.vitals?.bpDiastolic ||
                formData.vitals?.pulseRate ||
                formData.vitals?.temperature ||
                formData.vitals?.spo2 ||
                formData.vitals?.respiratoryRate ||
                formData.vitals?.height ||
                formData.vitals?.weight ||
                formData.vitals?.bmi ||
                formData.vitals?.other) && (
                <div className="prescription-section">
                  <div className="section-header">🩺 VITALS</div>
                  <div className="vitals-container">
                    <div className="vitals-row">
                      {(formData.vitals?.bp ||
                        (formData.vitals?.bpSystolic &&
                          formData.vitals?.bpDiastolic)) && (
                        <div className="vital-item">
                          <span className="vital-label">BP:</span>
                          <span className="vital-value">
                            {formData.vitals?.bp
                              ? formData.vitals.bp
                              : formData.vitals?.bpSystolic &&
                                formData.vitals?.bpDiastolic
                              ? `${formData.vitals.bpSystolic}/${formData.vitals.bpDiastolic}`
                              : null}{" "}
                            mmHg
                          </span>
                        </div>
                      )}
                      {formData.vitals?.pulseRate &&
                        formData.vitals.pulseRate !== "Not provided" && (
                          <>
                            <div className="vital-separator">|</div>
                            <div className="vital-item">
                              <span className="vital-label">Pulse:</span>
                              <span className="vital-value">
                                {formData.vitals.pulseRate} BPM
                              </span>
                            </div>
                          </>
                        )}
                      {formData.vitals?.temperature &&
                        formData.vitals.temperature !== "Not provided" && (
                          <>
                            <div className="vital-separator">|</div>
                            <div className="vital-item">
                              <span className="vital-label">Temp:</span>
                              <span className="vital-value">
                                {formData.vitals.temperature}°F
                              </span>
                            </div>
                          </>
                        )}
                      {formData.vitals?.spo2 &&
                        formData.vitals.spo2 !== "Not provided" && (
                          <>
                            <div className="vital-separator">|</div>
                            <div className="vital-item">
                              <span className="vital-label">SpO2:</span>
                              <span className="vital-value">
                                {formData.vitals.spo2}%
                              </span>
                            </div>
                          </>
                        )}
                      {formData.vitals?.respiratoryRate &&
                        formData.vitals.respiratoryRate !== "Not provided" && (
                          <>
                            <div className="vital-separator">|</div>
                            <div className="vital-item">
                              <span className="vital-label">RR:</span>
                              <span className="vital-value">
                                {formData.vitals.respiratoryRate} breaths/min
                              </span>
                            </div>
                          </>
                        )}
                      {formData.vitals?.height &&
                        formData.vitals.height !== "Not provided" && (
                          <>
                            <div className="vital-separator">|</div>
                            <div className="vital-item">
                              <span className="vital-label">Height:</span>
                              <span className="vital-value">
                                {formData.vitals.height} cm
                              </span>
                            </div>
                          </>
                        )}
                      {formData.vitals?.weight &&
                        formData.vitals.weight !== "Not provided" && (
                          <>
                            <div className="vital-separator">|</div>
                            <div className="vital-item">
                              <span className="vital-label">Weight:</span>
                              <span className="vital-value">
                                {formData.vitals.weight} kg
                              </span>
                            </div>
                          </>
                        )}
                      {formData.vitals?.bmi &&
                        formData.vitals.bmi !== "Not provided" && (
                          <>
                            <div className="vital-separator">|</div>
                            <div className="vital-item">
                              <span className="vital-label">BMI:</span>
                              <span className="vital-value">
                                {formData.vitals.bmi}
                              </span>
                            </div>
                          </>
                        )}
                      {formData.vitals?.other &&
                        Object.entries(formData.vitals.other).map(
                          ([key, value]) =>
                            value &&
                            value !== "Not provided" && (
                              <>
                                <div className="vital-separator">|</div>
                                <div className="vital-item" key={key}>
                                  <span className="vital-label">{key}:</span>
                                  <span className="vital-value">{value}</span>
                                </div>
                              </>
                            )
                        )}
                    </div>
                  </div>
                </div>
              )}

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
                      .map((diagnosis, index) =>
                        diagnosis.trim() ? (
                          <span key={index} className="diagnosis-tag">
                            {diagnosis.trim().toUpperCase()}
                          </span>
                        ) : null
                      )}
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
                                {med.medicineType || "Not specified"}
                              </td>
                              <td className="table-cell">
                                {med.medName || med.name || "Not specified"}
                              </td>
                              <td className="table-cell">
                                {med.dosage || med.dosagePattern || "As directed"}
                              </td>
                              <td className="table-cell">
                                {med.frequency || "Not specified"}
                              </td>
                              <td className="table-cell">
                                {med.timings
                                  ? med.timings.join(", ")
                                  : med.timing || "Not specified"}
                              </td>
                              <td className="table-cell">
                                {med.notes || "Not specified"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </>
                  )}
                  {formData.advice?.medicationNotes && (
                    <div className="notes-display">
                      <div className="notes-label">General Notes:</div>
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

              {formData.advice?.followUpDate &&
                formatDate(formData.advice.followUpDate) && (
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
                  formData.doctorInfo?.doctorName &&
                  formData.doctorInfo.doctorName !== "Unknown Doctor" && (
                    <>
                      <div style={{ height: "48px" }}></div>
                      <div style={{ fontWeight: "bold" }}>
                        DR. {formData.doctorInfo.doctorName}
                      </div>
                    </>
                  )
                )}
                <div style={{ fontSize: "12px", marginTop: "4px" }}>
                  <CheckCircle size={14} style={{ marginRight: "4px" }} />
                  Digitally Signed
                </div>
              </div>

              <div className="prescription-footer">
                This prescription is computer generated and does not require
                physical signature
              </div>
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