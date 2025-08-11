import React, { useEffect, useRef, useState } from "react";
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
  const [activeTab, setActiveTab] = useState("patient-details");
  const [showPreview, setShowPreview] = useState(false);
  const user = useSelector((state) => state.currentUserData);
  const doctorData = useSelector((state) => state.doctorData);
  const isfetchPrescription = useRef(false);
  const navigate = useNavigate();
  const doctorId = user?.role === "doctor" ? user?.userId : user?.createdBy;
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
      selectedClinicId: patientData?.addressId || "",
      clinicAddress: "",
      contactNumber: "",
      appointmentDate: patientData?.appointmentDate || "",
      appointmentStartTime: patientData?.appointmentTime || "",
      appointmentEndTime: "",
    },
    patientInfo: {
      patientId: patientData?.patientId || "",
      patientName: patientData?.patientName || "",
      age: patientData?.age || "",
      gender: patientData?.gender || "",
      mobileNumber: patientData?.mobileNumber || "",
      chiefComplaint: patientData?.appointmentReason || "",
      pastMedicalHistory: "",
      familyMedicalHistory: "",
      physicalExamination: "",
      appointmentId: patientData?.appointmentId || "",
    },
    vitals: {},
    diagnosis: {},
    advice: {},
  });

  const fetchPrescription = async () => {
    if (!patientData?.appointmentId) {
      return;
    }

    try {
      isfetchPrescription.current = true;
      const response = await apiGet(
        `/pharmacy/getEPrescriptionByAppointmentId/${patientData.appointmentId}`
      );
      if (response.data.success && response.data.data && response.data.data.length > 0) {
        const prescription = response.data.data[0];
        
        const bpParts = prescription.vitals?.bp?.split('/') || [];
        const bpSystolic = bpParts[0] || "";
        const bpDiastolic = bpParts[1] || "";
        
        setFormData((prev) => ({
          ...prev,
          doctorInfo: {
            ...prev.doctorInfo,
            doctorId: prescription.doctorId || doctorId,
            selectedClinicId: prescription.addressId || prev.doctorInfo.selectedClinicId,
            appointmentDate: patientData.appointmentDate || prev.doctorInfo.appointmentDate,
            appointmentStartTime: patientData.appointmentTime || prev.doctorInfo.appointmentStartTime,
          },
          patientInfo: {
            ...prev.patientInfo,
            patientId: prescription.userId || patientData.patientId || "",
            patientName: prescription.patientInfo?.patientName || patientData.patientName || "",
            age: prescription.patientInfo?.age || patientData.age || "",
            gender: prescription.patientInfo?.gender || patientData.gender || "",
            mobileNumber: prescription.patientInfo?.mobileNumber || patientData.mobileNumber || "",
            chiefComplaint: prescription.patientInfo?.chiefComplaint || patientData.appointmentReason || "",
            pastMedicalHistory: prescription.patientInfo?.pastMedicalHistory || "",
            familyMedicalHistory: prescription.patientInfo?.familyMedicalHistory || "",
            physicalExamination: prescription.patientInfo?.physicalExamination || "",
            appointmentId: prescription.appointmentId || patientData.appointmentId || "",
          },
          vitals: {
            bp: prescription.vitals?.bp || "",
            bpSystolic: bpSystolic,
            bpDiastolic: bpDiastolic,
            pulseRate: prescription.vitals?.pulseRate || "",
            respiratoryRate: prescription.vitals?.respiratoryRate || "",
            temperature: prescription.vitals?.temperature || "",
            spo2: prescription.vitals?.spo2 || "",
            height: prescription.vitals?.height || "",
            weight: prescription.vitals?.weight || "",
            bmi: prescription.vitals?.bmi || "",
            investigationFindings: prescription.vitals?.investigationFindings || "",
            other: prescription.vitals?.other || {},
          },
          diagnosis: {
            diagnosisList: prescription.diagnosis?.diagnosisNote || "",
            selectedTests: prescription.diagnosis?.selectedTests || [],
            medications: prescription.diagnosis?.medications?.map((med) => ({
              ...med,
              id: Date.now() + Math.random(),
              timings: typeof med.timings === "string" ? med.timings.split(", ") : med.timings,
            })) || [],
            testNotes: prescription.diagnosis?.testsNote || "",
          },
          advice: {
            medicationNotes: prescription.advice?.PrescribeMedNotes || "",
            advice: prescription.advice?.advice || "",
            followUpDate: prescription.advice?.followUpDate || "",
          },
        }));
      }
    } catch (error) {
      console.error("Error fetching prescription:", error);
      toast.error("Failed to load existing prescription");
    } finally {
      isfetchPrescription.current = false;
    }
  };

  useEffect(() => {
    if (user && !isfetchPrescription.current) {
      fetchPrescription();
    }
  }, [user]);

  const tabs = [
    { id: "patient-details", label: "Patient Details & Vitals", icon: Users },
    { id: "diagnosis", label: "Diagnosis & Medication", icon: Pill },
    { id: "advice", label: "Advice & Follow Up", icon: Calendar },
    { id: "preview", label: "Preview", icon: FileText },
  ];

  const updateFormData = (section, data) => {
    setFormData((prev) => ({
      ...prev,
      [section]: { ...prev[section], ...data },
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
      if (doctorData) {
        setFormData((prev) => ({
          ...prev,
          doctorInfo: {
            ...prev.doctorInfo,
            doctorId: doctorId,
            doctorName: `${doctorData.firstname || ""} ${doctorData.lastname || ""}`.trim(),
            qualifications: doctorData.specialization?.degree || "",
            specialization: doctorData.specialization?.name?.trim() || "",
            medicalRegistrationNumber: doctorData.medicalRegistrationNumber || "",
            contactNumber: doctorData.mobile || "",
          },
        }));
        const selectedClinic2 =
          doctorData?.addresses?.find(
            (address) => address.addressId === formData.doctorInfo?.selectedClinicId
          ) || {};
        setSelectedClinic(selectedClinic2);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    if (doctorData) {
      getCurrentUserData();
    }
  }, [doctorData, formData?.doctorInfo?.selectedClinicId]);

  function transformEprescriptionData(formData) {
    const { doctorInfo, patientInfo, vitals, diagnosis, advice } = formData;
    const appointmentId = patientData?.appointmentId;

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
        bp: `${vitals?.bpSystolic || ""}/${vitals?.bpDiastolic || ""}`,
        pulseRate: vitals.pulseRate || null,
        respiratoryRate: vitals.respiratoryRate || null,
        temperature: vitals.temperature || null,
        spo2: vitals.spo2 || null,
        height: vitals.height || null,
        weight: vitals.weight || null,
        bmi: vitals.bmi || null,
        investigationFindings: vitals.investigationFindings || null,
        other: vitals.other || null,
      },
      diagnosis: {
        diagnosisNote: diagnosis.diagnosisList || null,
        testsNote: diagnosis.testNotes || null,
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
        PrescribeMedNotes: advice?.medicationNotes || null,
        advice: advice.advice || null,
        followUpDate: advice.followUpDate || null,
      },
      createdBy: user.userId || doctorInfo.doctorId,
      updatedBy: user.userId || doctorInfo.doctorId,
    };
  }

  const handlePrescriptionAction = async (type, pdfBlob) => {
    if (!validateCurrentTab()) return;
    
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

          const uploadFormData = new FormData();
          uploadFormData.append("file", pdfBlob, "e-prescription.pdf");
          uploadFormData.append("prescriptionId", prescriptionId);
          uploadFormData.append("appointmentId", patientData?.appointmentId || "");
          uploadFormData.append("patientId", patientData?.patientId || "");
          uploadFormData.append("mobileNumber", formData.patientInfo?.mobileNumber || "");
          uploadFormData.append("doctorId", formData.doctorInfo?.doctorId || "");

          const uploadResponse = await apiPost(
            "/pharmacy/addattachprescription",
            uploadFormData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );

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

  const validateMedications = () => {
    // Only validate medications if they exist
    if (formData.diagnosis.medications && formData.diagnosis.medications.length > 0) {
      // Check if any medication has empty required fields
      const hasEmptyFields = formData.diagnosis.medications.some(med => {
        if (!med.medName || !med.medName.trim()) {
          toast.error(`Please enter a medicine name for all medications`);
          return true;
        }
        if (!med.dosage || !med.dosage.trim()) {
          toast.error(`Please enter a valid dosage for ${med.medName || "the medication"} (e.g., 100mg, 5ml)`);
          return true;
        }
        if (!med.medicineType) {
          toast.error(`Please select a medicine type for ${med.medName || "the medication"}`);
          return true;
        }
        if (med.quantity === null || med.quantity <= 0) {
          toast.error(`Please enter a valid quantity for ${med.medName || "the medication"}`);
          return true;
        }
        if (!med.duration || med.duration <= 0) {
          toast.error(`Please enter a valid duration for ${med.medName || "the medication"}`);
          return true;
        }
        if (!med.frequency) {
          toast.error(`Please select a frequency for ${med.medName || "the medication"}`);
          return true;
        }
        return false;
      });

      if (hasEmptyFields) {
        return false;
      }

      // Check if timings match frequency
      const hasInvalidTimings = formData.diagnosis.medications.some(med => {
        if (med.frequency && med.frequency !== "SOS") {
          const requiredTimings = med.frequency.split("-").filter(x => x === "1").length;
          if (med.timings.length !== requiredTimings) {
            toast.error(
              `For medicine ${med.medName || 'unnamed'}, please select exactly ${requiredTimings} timing${requiredTimings > 1 ? 's' : ''} to match the frequency ${med.frequency}`
            );
            return true;
          }
        }
        return false;
      });

      return !hasInvalidTimings;
    }
    
    // If no medications, validation passes
    return true;
  };

  const validateCurrentTab = () => {
    if (activeTab === "diagnosis") {
      return validateMedications();
    }
    return true;
  };

  const handleConfirm = async () => {
    if (!validateCurrentTab()) return;
    
    try {
      setActiveTab("preview");
      setShowPreview(true);
    } catch (error) {
      console.error("Error generating preview:", error);
      toast.error("Failed to generate preview");
    }
  };

  const handleNext = () => {
    if (!validateCurrentTab()) return;
    
    const currentIndex = tabs.findIndex((tab) => tab.id === activeTab);
    if (currentIndex < tabs.length - 2) {
      setActiveTab(tabs[currentIndex + 1].id);
    }
  };

  const handleTabChange = (tabId) => {
    if (!validateCurrentTab()) return;
    
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
      case "patient-details":
        return (
          <div className="combined-patient-vitals">
            <PatientDetailsHistory
              formData={formData.patientInfo}
              updateFormData={(data) => updateFormData("patientInfo", data)}
            />
            <VitalsInvestigation
              formData={formData.vitals}
              updateFormData={(data) => updateFormData("vitals", data)}
            />
          </div>
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
          <div className="combined-patient-vitals">
            <PatientDetailsHistory
              formData={formData.patientInfo}
              updateFormData={(data) => updateFormData("patientInfo", data)}
            />
            <VitalsInvestigation
              formData={formData.vitals}
              updateFormData={(data) => updateFormData("vitals", data)}
            />
          </div>
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

        <main className="eprescription-content">{renderActiveComponent()}</main>

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
      </div>
    </div>
  );
};

export default EPrescription;