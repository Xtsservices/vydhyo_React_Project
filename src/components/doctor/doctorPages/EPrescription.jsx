import React, { useEffect, useState } from "react";
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
import DoctorClinicInfo from "./E-DoctorClinicInfo";
import PatientDetailsHistory from "./E-PatientDetailsHistory";
import VitalsInvestigation from "./E-VitalsInvestigation";
import DiagnosisMedication from "./E-DiagnosisMedication";
import AdviceFollowUp from "./E-AdviceFollowUp";
import Preview from "./Preview";
import "../../stylings/EPrescription.css";
import { useLocation, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { apiGet, apiPost } from "../../api";
import { useSelector } from "react-redux";

const EPrescription = () => {
  const location = useLocation();
  const { patientData } = location.state || {};
  const [activeTab, setActiveTab] = useState("doctor-clinic");
  const [showPreview, setShowPreview] = useState(false);
  const user = useSelector((state) => state.currentUserData);
  const navigate = useNavigate();
  const doctorId = user?.role === "doctor" ? user?.userId : user?.createdBy;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [clinicDetails, setClinicDetails] = useState(null);
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [formData, setFormData] = useState({
    doctorInfo: {
      doctorId: doctorId || "",
      doctorName: user
        ? `${user.firstname || ""} ${user.lastname || ""}`.trim()
        : "",
      qualifications: user?.specialization?.degree || "",
      specialization: user?.specialization?.name || "",
      medicalRegistrationNumber: user?.medicalRegistrationNumber || "",
      selectedClinicId: "",
      clinicAddress: "",
      contactNumber: "",
      appointmentDate: "",
      appointmentStartTime: "",
      appointmentEndTime: "",
    },
    patientInfo: {
      patientId: "",
      patientName: "",
      age: "",
      gender: "",
      mobileNumber: "",
      chiefComplaint: "",
      pastMedicalHistory: "",
      familyMedicalHistory: "",
      physicalExamination: "",
    },
    vitals: {},
    diagnosis: {},
    advice: {},
  });

    const fetchPrescription = async () => {
    if (!patientData?.appointmentId) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await apiGet(`/pharmacy/getEPrescriptionByAppointmentId/${patientData.appointmentId}`);
      if (response.data.success && response.data.data) {
        const prescription2 = response.data.data;
        const prescription = response.data.data[0]; // Select the first prescription
        console.log("response====",response)
        console.log("prescription2====",prescription2)
        console.log("prescription====",prescription)
        setFormData({
          doctorInfo: {
            ...formData.doctorInfo,
            doctorId: prescription.doctorId || doctorId,
            selectedClinicId: prescription.addressId || "",
            appointmentDate: patientData.appointmentDate || "",
            appointmentStartTime: patientData.appointmentTime || "",
          },
          patientInfo: {
            patientId: prescription.userId || patientData.patientId || "",
            patientName: prescription.patientInfo?.patientName || patientData.patientName || "",
            age: prescription.patientInfo?.age || patientData.age || "",
            gender: prescription.patientInfo?.gender || patientData.gender || "",
            mobileNumber: prescription.patientInfo?.mobileNumber || patientData.mobileNumber || "",
            chiefComplaint: prescription.patientInfo?.chiefComplaint || patientData.appointmentReason || "",
            pastMedicalHistory: prescription.patientInfo?.pastMedicalHistory || "",
            familyMedicalHistory: prescription.patientInfo?.familyMedicalHistory || "",
            physicalExamination: prescription.patientInfo?.physicalExamination || "",
          },
          vitals: {
            bp: prescription.vitals?.bp || "",
            pulseRate: prescription.vitals?.pulseRate || "",
            respiratoryRate: prescription.vitals?.respiratoryRate || "",
            temperature: prescription.vitals?.temperature || "",
            spo2: prescription.vitals?.spo2 || "",
            height: prescription.vitals?.height || "",
            weight: prescription.vitals?.weight || "",
            bmi: prescription.vitals?.bmi || "",
            investigationFindings: prescription.vitals?.investigationFindings || "",
          },
          diagnosis: {
            diagnosisList: prescription.diagnosis?.diagnosisNote || "",
            selectedTests: prescription.diagnosis?.selectedTests || [],
            medications: prescription.diagnosis?.medications.map(med => ({
              ...med,
              id: Date.now() + Math.random(), // Add unique ID for UI rendering
              timings: typeof med.timings === "string" ? med.timings.split(", ") : med.timings,
            })) || [],
            testNotes: prescription.diagnosis?.testsNote || "",
            medicationNotes: prescription.diagnosis?.PrescribeMedNotes || "",
          },
          advice: {
            advice: prescription.advice?.advice || "",
            followUpDate: prescription.advice?.followUpDate || "",
          },
        });
      }
    } catch (error) {
      console.error("Error fetching prescription:", error);
      toast.error("Failed to load existing prescription");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if(user){

      fetchPrescription()
    }
  },[user])

  useEffect(() => {
    if (patientData) {
      setFormData((prev) => ({
        ...prev,
        doctorInfo: {
          ...prev.doctorInfo,
          appointmentDate: patientData.appointmentDate || "",
          appointmentStartTime: patientData.appointmentTime || "",
          selectedClinicId: patientData.addressId || "",
        },
        patientInfo: {
          ...prev.patientInfo,
          patientId: patientData.patientId || "",
          patientName: patientData.patientName || "",
          age: patientData.age || "",
          gender: patientData.gender || "",
          mobileNumber: patientData.mobileNumber || "",
        },
      }));
    }
  }, [patientData]);

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

  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
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
              medicineType: med.medicineType,
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

  const handlePrescriptionAction = async (type, pdfBlob) => {
    try {
      const formattedData = transformEprescriptionData(formData);
      const response = await apiPost("/pharmacy/addPrescription", formattedData);

      if (response?.status === 201) {
        toast.success("Prescription successfully added");
        console.log("Prescription Response:", response);

        if (type === "print") {
          window.print();
        } else if (type === "whatsapp") {
          if (!(pdfBlob instanceof Blob)) {
            console.error("Invalid pdfBlob: Not a Blob", pdfBlob);
            toast.error("Failed to upload attachment: Invalid file format");
            return;
          }
          if (pdfBlob.type !== "application/pdf") {
            console.error("Invalid pdfBlob: Not a PDF", { type: pdfBlob.type });
            toast.error("Failed to upload attachment: Only PDF files are allowed");
            return;
          }

          console.log("PDF Blob:", {
            type: pdfBlob.type,
            size: pdfBlob.size,
            name: pdfBlob.name || "e-prescription.pdf",
          });

          const prescriptionId = response?.data?.prescriptionId;
          if (!prescriptionId) {
            console.error("Prescription ID is missing");
            toast.error("Failed to upload attachment: Prescription ID missing");
            return;
          }
          console.log("Prescription ID:", prescriptionId);

          const formData = new FormData();
          formData.append("file", pdfBlob, "e-prescription.pdf");
          formData.append("prescriptionId", prescriptionId);

          console.log("Form Data for Upload:");
          for (const [key, value] of formData.entries()) {
            console.log(`${key}:`, value);
          }

          const uploadResponse = await apiPost(
            "/pharmacy/addattachprescription",
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );

          console.log("Upload Response:", uploadResponse);

          if (uploadResponse?.status === 200) {
            toast.success("Attachment uploaded successfully");
            const message = `Here's my medical prescription from ${formData.doctorInfo?.clinicName || "Clinic"}\n` +
              `Patient: ${formData.patientInfo?.patientName || "N/A"}\n` +
              `Doctor: ${formData.doctorInfo?.doctorName || "N/A"}\n` +
              `Date: ${formData.doctorInfo?.appointmentDate || "N/A"}`;
            const url = "https://wa.me/?text=" + encodeURIComponent(message);
            window.open(url, "_blank");
          } else {
            toast.error(uploadResponse?.data?.message || "Failed to upload attachment");
          }
        } else if (type === "save") {
          setTimeout(() => {
            navigate("/doctor/doctorPages/Appointments");
          }, 3000);
        }
      } else {
        toast.error(response?.data?.message || "Failed to add prescription");
      }
    } catch (error) {
      console.error("Error in handlePrescriptionAction:", error);
      toast.error(error.response?.data?.message || "Failed to add prescription");
    }
  };

  const handleConfirm = async () => {
    try {
      setActiveTab("preview");
      setShowPreview(true);
    } catch (error) {
      console.error("Error generating preview:", error);
      toast.error("Failed to generate preview");
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

  return (
    <div id="eprescription-container" className="eprescription-container">
      <ToastContainer />
      <div className="eprescription-main">
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

        <main className="eprescription-content">
          {renderActiveComponent()}

          {activeTab !== "preview" && (
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: "24px",
              }}
            >
              <button
                className="common-button common-cancel-button"
                onClick={() => navigate(-1)}
              >
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