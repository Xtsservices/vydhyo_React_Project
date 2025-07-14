import React, { useState } from "react";
import {
  Home,
  Calendar,
  Users,
  FileText,
  Activity,
  Pill,
  UserCheck,
  Building,
  CheckCircle,
  BarChart3,
  Star,
  Menu,
  X,
} from "lucide-react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

// Import components
import DoctorClinicInfo from "./E-DoctorClinicInfo";
import PatientDetailsHistory from "./E-PatientDetailsHistory";
import VitalsInvestigation from "./E-VitalsInvestigation";
import DiagnosisMedication from "./E-DiagnosisMedication";
import AdviceFollowUp from "./E-AdviceFollowUp";
import Preview from "./Preview";
import "../../stylings/EPrescription.css";
import { useLocation } from "react-router-dom";
import { apiPost } from "../../api";

const EPrescription = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("doctor-clinic");
  const [showPreview, setShowPreview] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [formData, setFormData] = useState({
  doctorInfo: {
    doctorId: '',
    doctorName: '',
    qualifications: '',
    specialization: '',
    selectedClinicId: '',
    clinicAddress: '',
    contactNumber: '',
    appointmentDate: '',
    appointmentStartTime: '',
    appointmentEndTime: ''
  },
  patientInfo: {
    patientId: '',
    patientName: '',
    age: '',
    gender: '',
    mobileNumber: '',
    chiefComplaint: '',
    pastMedicalHistory: '',
    familyMedicalHistory: '',
    physicalExamination: ''
  },
  vitals: {},
  diagnosis: {},
  advice: {}
});

  const tabs = [
    { id: "doctor-clinic", label: "Doctor & Clinic Info", icon: UserCheck },
    { id: "patient-details", label: "Patient Details & History", icon: Users },
    { id: "vitals", label: "Vitals & Investigation", icon: Activity },
    { id: "diagnosis", label: "Diagnosis & Medication", icon: Pill },
    { id: "advice", label: "Advice & Follow Up", icon: Calendar },
    { id: "preview", label: "Preview", icon: FileText },
  ];

  const updateFormData = (section, data) => {
    setFormData((prev) => ({
      ...prev,
      [section]: data,
    }));
  };

  const handlePrescriptionAction2 = async (type) => {
    const formattedData = transformEprescriptionData(formData);
    const response = await apiPost("/pharmacy/addPrescription", formattedData);
    console.log("response", response);

    if (type === "print") {
      window.print();
    } else if (type === "whatsapp") {
      const message =
        `Here's my medical prescription from VYDHYO MULTISPECIALTY CLINIC\n` +
        `Patient: ${formData.patientInfo?.patientName || "N/A"}\n` +
        `Doctor: ${formData.doctorInfo?.doctorName || "N/A"}\n` +
        `Date: ${formData.doctorInfo?.reportDate || "N/A"}`;
      const url = "https://wa.me/?text=" + encodeURIComponent(message);
      window.open(url, "_blank");
    }
  };

  const handlePrescriptionAction = async (type, pdfBlob) => {
    try {
      // Step 1: Save prescription and get objId
      console.log("start", type);
      const formattedData = transformEprescriptionData(formData);
      console.log("start", 1);

      const response = await apiPost(
        "/pharmacy/addPrescription",
        formattedData
      );
      console.log("Prescription response:", response);
      if (response?.status === 201) {
        const prescriptionId = response?.data?.prescriptionId;
        console.log("Prescription response prescriptionId:", prescriptionId);

        try {
          if (!prescriptionId) {
            throw new Error("Prescription ID is missing");
          }

          // Step 2: Upload PDF with prescriptionId
          const formData = new FormData();
          formData.append("file", pdfBlob, "e-prescription.pdf");
          formData.append("prescriptionId", prescriptionId);

          const uploadResponse = await apiPost(
            "/pharmacy/addattachprescription",
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );
          console.log("Upload response:=============", uploadResponse);
          if (uploadResponse?.status === 200) {
            toast.success("E-prescription Shared Successfully");
          }
        } catch (err) {
          console.log("err", err);
        }
      }

      // const objId = response.data?.objId; // Adjust based on actual response structure
      // if (!objId) {
      //   throw new Error("No objId returned from addPrescription API");
      // }

      //   const fileUrl = uploadResponse.data.fileUrl; // Adjust based on actual response structure
      //   if (!fileUrl) {
      //     throw new Error("No fileUrl returned from uploadFiles API");
      //   }

      // if (type === "print") {
      //   // Trigger browser print
      //   window.print();
      // } else if (type === "whatsapp") {
      //   if (!pdfBlob) {
      //     throw new Error("No PDF Blob provided for WhatsApp sharing");
      //   }

      // // Step 3: Construct WhatsApp message with prescription details and file URL
      // const message =
      //   `Here's my medical prescription from VYDHYO MULTISPECIALTY CLINIC\n` +
      //   `Patient: ${formData.patientInfo?.patientName || "N/A"}\n` +
      //   `Doctor: ${formData.doctorInfo?.doctorName || "N/A"}\n` +
      //   `Date: ${formData.doctorInfo?.reportDate || "N/A"}\n` +
      //   `Prescription: ${fileUrl}`;
      // const phoneNumber = formData.patientInfo?.mobileNumber || ""; // Use patient's mobile number if available
      // const whatsappUrl = phoneNumber
      //   ? `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
      //   : `https://wa.me/?text=${encodeURIComponent(message)}`;
      // window.open(whatsappUrl, "_blank");
      // }
    } catch (error) {
      console.error("Error in handlePrescriptionAction:", error);
      // Optionally, show error to user (e.g., using react-toastify)
      // toast.error("Failed to process prescription. Please try again.");
    }
  };

  function transformEprescriptionData(formData) {
    const { doctorInfo, patientInfo, vitals, diagnosis, advice } = formData;
    const appointmentId = location?.state?.patientData?.appointmentId;

    return {
      appointmentId: appointmentId,
      userId: patientInfo.patientId,
      doctorId: doctorInfo.doctorId,
      addressId: doctorInfo.selectedClinicId,
      patientInfo: {
        patientName: patientInfo.patientName || "Unknown",
        age: patientInfo.age || 0,
        gender: patientInfo.gender || "Other",
        mobileNumber: patientInfo.mobileNumber || "0000000000",
        chiefComplaint: patientInfo.chiefComplaint,
        pastMedicalHistory: patientInfo.pastMedicalHistory || null,
        familyMedicalHistory: patientInfo.familyMedicalHistory || null,
        physicalExamination: patientInfo.physicalExamination || null,
      },
      vitals: {
        bp: `${vitals?.bpSystolic}/${vitals?.bpDiastolic}` || null,
        pulseRate: vitals.pulseRate || null,
        respiratoryRate: vitals.respiratoryRate || null,
        temperature: vitals.temperature || null,
        spo2: vitals.spo2 || null,
        height: vitals.height || null,
        weight: vitals.weight || null,
        bmi: vitals.bmi || null,
        investigationFindings: vitals.investigationFindings || null,
      },
      diagnosis: {
        diagnosisNote: diagnosis.diagnosisList || null,
        testsNote: diagnosis.testNotes || null,
        PrescribeMedNotes: diagnosis.medicationNotes || null,
        selectedTests: Array.isArray(diagnosis.selectedTests)
          ? diagnosis.selectedTests.map((test) => ({
              testName: test.testName,
              testInventoryId: test.testInventoryId,
            }))
          : [],
        medications: Array.isArray(diagnosis.medications)
          ? diagnosis.medications.map((med) => ({
              medInventoryId: med.medInventoryId,
              medName: med.medName,
              quantity: med.quantity,
              dosage: med.dosage,
              duration: med.duration,
              timings: med.timings,
              frequency: med.frequency,
            }))
          : [],
      },
      advice: {
        advice: advice.advice || null,
        followUpDate: advice.followUpDate || null,
      },
      createdBy: doctorInfo.doctorId,
      updatedBy: doctorInfo.doctorId,
    };
  }

  const handleConfirm = async () => {
    try {
      console.log("pdfstart", 90);

      // // Generate PDF first
      // const pdf = await generatePDF();
      // const pdfBlob = pdf.output('blob');
      // console.log("pdf",pdf)
      // console.log("pdfBlob",pdfBlob)

      // Transform form data

      // // Create FormData to send both JSON and PDF
      // const formDataToSend = new FormData();
      // formDataToSend.append('prescriptionData', JSON.stringify(formattedData));
      // formDataToSend.append('prescriptionPdf', pdfBlob, 'prescription.pdf');

      console.log("apistart");
      // Make API call

      setActiveTab("preview");
      setShowPreview(true);
    } catch (error) {
      console.error("erroraddPrescription", error);
    }
  };

  const handleNext = () => {
    const currentIndex = tabs.findIndex((tab) => tab.id === activeTab);
    if (currentIndex < tabs.length - 2) {
      setActiveTab(tabs[currentIndex + 1].id);
    }
  };

  const handleTabChange = (tabId) => {
    if (tabId === "preview") {
      setShowPreview(true);
    } else {
      setShowPreview(false);
    }
    setActiveTab(tabId);
  };

  const renderActiveComponent = () => {
    if (activeTab === "preview") {
      return (
        <Preview
          formData={formData}
          handlePrescriptionAction={handlePrescriptionAction}
        />
      );
    }

    switch (activeTab) {
      case "doctor-clinic":
        return (
          <DoctorClinicInfo
            formData={formData.doctorInfo}
            updateFormData={(data) => updateFormData("doctorInfo", data)}
          />
        );
      case "patient-details":
        return (
          <PatientDetailsHistory
            formData={formData.patientInfo}
            updateFormData={(data) => updateFormData("patientInfo", data)}
          />
        );
      case "vitals":
        return (
          <VitalsInvestigation
            formData={formData.vitals}
            updateFormData={(data) => updateFormData("vitals", data)}
          />
        );
      case "diagnosis":
        return (
          <DiagnosisMedication
            formData={formData.diagnosis}
            updateFormData={(data) => updateFormData("diagnosis", data)}
          />
        );
      case "advice":
        return (
          <AdviceFollowUp
            formData={formData.advice}
            updateFormData={(data) => updateFormData("advice", data)}
          />
        );
      default:
        return (
          <DoctorClinicInfo
            formData={formData.doctorInfo}
            updateFormData={(data) => updateFormData("doctorInfo", data)}
          />
        );
    }
  };

  console.log("formdata=12====",formData)
  return (
    <div id="eprescription-container" className="eprescription-container">
      {/* Main Content */}
      <div className="eprescription-main">
        {/* Tab Navigation */}
        <div className="eprescription-tabs">
          <nav style={{ display: "flex", gap: "8px" }}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`eprescription-tab ${
                  activeTab === tab.id
                    ? "eprescription-tab-active"
                    : "eprescription-tab-inactive"
                }`}
                disabled={
                  tab.id === "preview" && activeTab !== "advice" && !showPreview
                }
              >
                <tab.icon
                  style={{ width: "16px", height: "16px", marginRight: "8px" }}
                />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content Area */}
        <main className="eprescription-content">
          {renderActiveComponent()}

          {/* Action Buttons - Hidden in preview */}
          {activeTab !== "preview" && (
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: "24px",
              }}
            >
              <button className="common-button common-cancel-button">
                Cancel
              </button>

              <button
                onClick={activeTab === "advice" ? handleConfirm : handleNext}
                className="common-button common-confirm-button"
              >
                {activeTab === "advice" ? "Preview" : "Next"}
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default EPrescription;
