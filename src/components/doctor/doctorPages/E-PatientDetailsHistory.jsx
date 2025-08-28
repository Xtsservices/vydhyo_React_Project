import React, { useState, useEffect } from "react";
import { User, FileText, Heart, Users, Stethoscope } from "lucide-react";
import { useLocation } from "react-router-dom";
import "../../stylings/EPrescription.css";
import { useSelector } from "react-redux";

const capitalizeFirstLetter = (str) => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const PatientDetailsHistory = ({ formData, updateFormData }) => {
    const doctorData = useSelector((state) => state.doctorData);
    const user = useSelector((state) => state.currentUserData);
    const doctorId = user?.role === "doctor" ? user?.userId : user?.createdBy;
  
    const location = useLocation();
    const patientData = location.state?.patientData || {};

    const [localData, setLocalData] = useState({
        patientId: "",
        patientName: "",
        age: "",
        gender: "",
        mobileNumber: "",
        chiefComplaint: "",
        pastMedicalHistory: "",
        familyMedicalHistory: "",
        physicalExamination: "",
    });

    useEffect(() => {
        const chiefComplaintValue = formData?.chiefComplaint || patientData?.appointmentReason || "";
        const newData = {
            patientId: formData?.patientId || patientData?.patientId || "",
            patientName: formData?.patientName || patientData?.patientName || "",
            age: formData?.age || patientData?.age || "",
            gender: formData?.gender || patientData?.gender || "",
            mobileNumber: formData?.mobileNumber || patientData?.mobileNumber || "",
            chiefComplaint: chiefComplaintValue.toLowerCase() === "not specified" ? "" : chiefComplaintValue,
            pastMedicalHistory: formData?.pastMedicalHistory || "",
            familyMedicalHistory: formData?.familyMedicalHistory || "",
            physicalExamination: formData?.physicalExamination || "",
        };

        setLocalData((prev) => {
            if (JSON.stringify(prev) !== JSON.stringify(newData)) {
                return newData;
            }
            return prev;
        });
    }, [formData, patientData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setLocalData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        if (value && name !== 'patientId' && name !== 'age' && name !== 'mobileNumber') {
            const capitalizedValue = capitalizeFirstLetter(value);
            setLocalData(prev => ({
                ...prev,
                [name]: capitalizedValue
            }));
            if (updateFormData) {
                updateFormData({
                    ...localData,
                    [name]: capitalizedValue
                });
            }
        } else if (updateFormData) {
            updateFormData({
                ...localData,
                [name]: value
            });
        }
    };

    console.log("formData from patient tab", localData.age);

    return (
        <div className="patient-details-container" style={{ padding: "16px" }}>
            <div className="patient-details-header" style={{ marginBottom: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <User style={{ width: "14px", height: "14px", color: "#10b981" }} />
                    <h2 style={{ fontSize: "18px", margin: 0 }}>Patient Details</h2>
                </div>
            </div>

            <div className="patient-details-form">
                <div style={{ display: "flex", gap: "12px", marginBottom: "12px", flexWrap: "wrap" }}>
                    <div style={{ flex: "1 1 200px" }}>
                        <label className="patient-details-label" style={{ fontSize: "12px" }}>
                            Name
                        </label>
                        <input
                            type="text"
                            value={localData.patientName}
                            className="patient-details-input"
                            readOnly
                            style={{ height: "28px", fontSize: "15px", padding: "4px" }}
                        />
                    </div>

                    <div style={{ flex: "0 1 100px" }}>
                        <label className="patient-details-label" style={{ fontSize: "12px" }}>
                            Gender
                        </label>
                        <input
                            type="text"
                            value={localData.gender}
                            className="patient-details-input"
                            readOnly
                            style={{ height: "28px", fontSize: "15px", padding: "4px" }}
                        />
                    </div>

                    <div style={{ flex: "0 1 80px" }}>
                        <label className="patient-details-label" style={{ fontSize: "12px" }}>
                            Age
                        </label>
                        <input
                            type="text"
                            value={localData.age}
                            className="patient-details-input"
                            readOnly
                            style={{ height: "28px", fontSize: "15px", padding: "4px" }}
                        />
                    </div>

                    <div style={{ flex: "1 1 150px" }}>
                        <label className="patient-details-label" style={{ fontSize: "12px" }}>
                            Mobile
                        </label>
                        <input
                            type="tel"
                            value={localData.mobileNumber}
                            className="patient-details-input"
                            readOnly
                            style={{ height: "28px", fontSize: "15px", padding: "4px" }}
                        />
                    </div>
                </div>

                <div className="patient-history-section">
                    <h3 style={{ fontSize: "16px", margin: "0 0 8px" }}>Patient History</h3>

                    <div className="history-section" style={{ marginBottom: "12px" }}>
                        <div
                            className="history-section-header"
                            style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}
                        >
                            <FileText style={{ width: "14px", height: "14px", color: "#2563eb" }} />
                            <h4 style={{ fontSize: "14px", margin: 0 }}>Chief Complaint</h4>
                        </div>
                        <textarea
                            name="chiefComplaint"
                            value={localData.chiefComplaint}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className="history-textarea"
                            placeholder="Enter Here..."
                            rows={2}
                            style={{ fontSize: "16px", padding: "4px", minHeight: "32px", maxHeight: "40px" }}
                        />
                    </div>

                    <div className="history-section" style={{ marginBottom: "12px" }}>
                        <div
                            className="history-section-header"
                            style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}
                        >
                            <Heart style={{ width: "14px", height: "14px", color: "#f59e0b" }} />
                            <h4 style={{ fontSize: "14px", margin: 0 }}>Past Medical History</h4>
                        </div>
                        <textarea
                            name="pastMedicalHistory"
                            value={localData.pastMedicalHistory}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className="history-textarea"
                            placeholder="Enter Here..."
                            rows={3}
                            style={{ fontSize: "16px", padding: "4px", minHeight: "32px", maxHeight: "40px" }}
                        />
                    </div>

                    <div className="history-section" style={{ marginBottom: "12px" }}>
                        <div
                            className="history-section-header"
                            style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}
                        >
                            <Users style={{ width: "14px", height: "14px", color: "#16a34a" }} />
                            <h4 style={{ fontSize: "14px", margin: 0 }}>Family Medical History</h4>
                        </div>
                        <textarea
                            name="familyMedicalHistory"
                            value={localData.familyMedicalHistory}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className="history-textarea"
                            placeholder="Enter Here..."
                            rows={3}
                            style={{ fontSize: "16px", padding: "4px", minHeight: "32px", maxHeight: "40px" }}
                        />
                    </div>

                    <div className="history-section">
                        <div
                            className="history-section-header"
                            style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}
                        >
                            <Stethoscope style={{ width: "14px", height: "14px", color: "#ea580c" }} />
                            <h4 style={{ fontSize: "14px", margin: 0 }}>Clinical Examination</h4>
                        </div>
                        <textarea
                            name="physicalExamination"
                            value={localData.physicalExamination}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className="history-textarea"
                            placeholder="Enter Here..."
                            rows={3}
                            style={{ fontSize: "16px", padding: "4px", minHeight: "32px", maxHeight: "40px" }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientDetailsHistory;