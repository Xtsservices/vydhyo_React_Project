import React, { useState, useEffect } from "react";
import { Activity, Stethoscope, Plus, X } from "lucide-react";
import "../../stylings/EPrescription.css";

const VitalsInvestigation = ({ formData, updateFormData }) => {
  const [localData, setLocalData] = useState({
    bpSystolic: "",
    bpDiastolic: "",
    pulseRate: "",
    respiratoryRate: "",
    vitalityRate: "",
    temperature: "",
    spo2: "",
    height: "",
    weight: "",
    bmi: "",
    investigationFindings: "",
    other: {},
  });

  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [errors, setErrors] = useState({});

  const validationRules = {
    bpSystolic: {
      min: 0,
      max: 240,
      message: "Systolic BP must be between 0 and 240 mmHg",
    },
    bpDiastolic: {
      min: 0,
      max: 200,
      message: "Diastolic BP must be between 0 and 200 mmHg",
    },
    pulseRate: {
      min: 0,
      max: 350,
      message: "Pulse rate must be between 0 and 350 bpm",
    },
    respiratoryRate: {
      min: 0,
      max: 60,
      message: "Respiratory rate must be between 0 and 60 breaths/min",
    },
    temperature: {
      min: 95,
      max: 110,
      message: "Temperature must be between 95 and 110 °F",
    },
    spo2: { min: 0, max: 100, message: "SpO2 must be between 0 and 100%" },
    height: {
      min: 50,
      max: 300,
      message: "Height must be between 50 and 300 cm",
    },
    weight: {
      min: 0,
      max: 250,
      message: "Weight must be between 0 and 250 kg",
    },
  };

useEffect(() => {
    if (formData && Object.keys(formData).length > 0) {
      const [bpSystolic, bpDiastolic] =
        formData.bp && formData.bp !== "undefined/undefined"
          ? formData.bp.split("/")
          : ["", ""];
      const updatedData = {
        bpSystolic: formData.bpSystolic || bpSystolic || "",
        bpDiastolic: formData.bpDiastolic || bpDiastolic || "",
        pulseRate: formData.pulseRate || "",
        respiratoryRate: formData.respiratoryRate || "",
        vitalityRate: formData.vitalityRate || "",
        temperature: formData.temperature || "",
        spo2: formData.spo2 || "",
        height: formData.height || "",
        weight: formData.weight || "",
        bmi: formData.bmi || "",
        investigationFindings: formData.investigationFindings || "",
        other: formData.other || {},
      };
      setLocalData(updatedData);
    }
  }, [formData]);

  const validateField = (field, value) => {
    const rules = validationRules[field];
    if (!rules || value === "" || value === null || value === undefined)
      return true;
    const numVal = Number(value);
    return !isNaN(numVal) && numVal >= rules.min && numVal <= rules.max;
  };

  const handleVitalChange = (field, value) => {
    const normalizedValue =
      value === "" ? "" : Number(value) < 0 ? "" : String(value).trim();
    const updatedData = { ...localData, [field]: normalizedValue };

    if (field === "bpSystolic" || field === "bpDiastolic") {
      const systolic =
        field === "bpSystolic" ? normalizedValue : localData.bpSystolic;
      const diastolic =
        field === "bpDiastolic" ? normalizedValue : localData.bpDiastolic;
      updatedData.bp = systolic && diastolic ? `${systolic}/${diastolic}` : "";
    }
    if (field === "weight" || field === "height") {
      updatedData.bmi = calculateBMI(
        field === "weight" ? normalizedValue : updatedData.weight,
        field === "height" ? normalizedValue : updatedData.height
      );
    }

    setLocalData(updatedData);
    updateFormData(updatedData);
  };

  const handleBlur = (field) => {
    const value = localData[field];
    if (!validateField(field, value)) {
      const updatedData = { ...localData, [field]: "" };
      if (field === "height" || field === "weight") {
        updatedData.bmi = calculateBMI(
          field === "weight" ? "" : updatedData.weight,
          field === "height" ? "" : updatedData.height
        );
      }
      setLocalData(updatedData);
      updateFormData(updatedData);
      setErrors((prev) => ({
        ...prev,
        [field]: validationRules[field].message,
      }));
    } else {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const calculateBMI = (weight, height) => {
    if (weight && height && !isNaN(Number(weight)) && !isNaN(Number(height))) {
      const heightInMeters = Number(height) / 100;
      const bmi = Number(weight) / (heightInMeters * heightInMeters);
      return bmi.toFixed(1);
    }
    return "";
  };

  const handleAddOther = () => {
    if (!newKey.trim() || !newValue.trim()) {
      setErrors((prev) => ({
        ...prev,
        newOther: "Both key and value are required",
      }));
      return;
    }

    const updatedData = {
      ...localData,
      other: {
        ...localData.other,
        [newKey.trim()]: newValue.trim(),
      },
    };
    setLocalData(updatedData);
    updateFormData(updatedData);
    setNewKey("");
    setNewValue("");
    setErrors((prev) => ({ ...prev, newOther: "" }));
  };

  const handleRemoveOther = (key) => {
    const newOther = { ...localData.other };
    delete newOther[key];
    const updatedData = { ...localData, other: newOther };
    setLocalData(updatedData);
    updateFormData(updatedData);
  };

  const handleCancel = () => {
    const resetData = {
      bpSystolic: "",
      bpDiastolic: "",
      bp: "",
      pulseRate: "",
      respiratoryRate: "",
      vitalityRate: "",
      temperature: "",
      spo2: "",
      height: "",
      weight: "",
      bmi: "",
      investigationFindings: "",
      other: {},
    };
    setLocalData(resetData);
    updateFormData(resetData);
    setErrors({});
    setNewKey("");
    setNewValue("");
  };

  return (
    <div className="vitals-container">
      <div className="vitals-section">
        <div className="vitals-section-header">
          <div className="vitals-icon-container blue-icon">
            <Activity size={16} />
          </div>
          <h2 className="vitals-section-title">Vitals (Optional)</h2>
        </div>

        <div className="vitals-grid">
          <div className="vitals-input-group bp-group-container">
            <label className="vitals-label">Blood Pressure (mmHg)</label>
            <div className="bp-inputs">
              <input
                type="number"
                placeholder="Systolic"
                value={localData.bpSystolic}
                onChange={(e) =>
                  handleVitalChange("bpSystolic", e.target.value)
                }
                onBlur={() => handleBlur("bpSystolic")}
                className={`vitals-input bp-input ${
                  errors.bpSystolic ? "error" : ""
                }`}
              />
              <span className="bp-slash">/</span>
              <input
                type="number"
                placeholder="Diastolic"
                value={localData.bpDiastolic}
                onChange={(e) =>
                  handleVitalChange("bpDiastolic", e.target.value)
                }
                onBlur={() => handleBlur("bpDiastolic")}
                className={`vitals-input bp-input ${
                  errors.bpDiastolic ? "error" : ""
                }`}
              />
            </div>
            {(errors.bpSystolic || errors.bpDiastolic) && (
              <div className="error-message">
                {errors.bpSystolic || errors.bpDiastolic}
              </div>
            )}
          </div>

          {[
            "pulseRate",
            "respiratoryRate",
            "vitalityRate",
            "temperature",
            "spo2",
            "height",
            "weight",
          ].map((field) => (
            <div className="vitals-input-group" key={field}>
              <label className="vitals-label">
                {field.replace(/([A-Z])/g, " $1").trim()}
                {field === "temperature"
                  ? " °F"
                  : field === "spo2"
                  ? "%"
                  : field === "height"
                  ? " cm"
                  : field === "weight"
                  ? " kg"
                  : field === "vitalityRate"
                  ? " rate"
                  : " bpm"}
              </label>
              <input
                type="number"
                value={localData[field]}
                onChange={(e) => handleVitalChange(field, e.target.value)}
                onBlur={() => handleBlur(field)}
                className={`vitals-input ${errors[field] ? "error" : ""}`}
              />
              {errors[field] && (
                <div className="error-message">{errors[field]}</div>
              )}
            </div>
          ))}

          <div className="vitals-input-group">
            <label className="vitals-label">BMI (kg/m²)</label>
            <input
              type="text"
              value={localData.bmi}
              readOnly
              className="vitals-input vitals-input-readonly"
            />
          </div>
        </div>

        <div className="other-vitals-grid">
          {Object.entries(localData.other || {}).map(([key, value]) => (
            <div key={key} className="other-vital-item">
              <div className="other-vital-key">{key}</div>
              <div className="other-vital-value">
                <input
                  type="text"
                  value={value}
                  onChange={(e) => {
                    const updatedData = {
                      ...localData,
                      other: {
                        ...localData.other,
                        [key]: e.target.value,
                      },
                    };
                    setLocalData(updatedData);
                    updateFormData(updatedData);
                  }}
                  className="vitals-input"
                />
              </div>
              <button
                className="remove-other-vital"
                onClick={() => handleRemoveOther(key)}
                aria-label={`Remove ${key}`}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>

        <div className="add-other-vital">
          <input
            type="text"
            placeholder="Additional Vital"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            className="vitals-input"
          />
          :
          <input
            type="text"
            placeholder="Enter.."
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            className="vitals-input"
          />
          <button className="add-other-button" onClick={handleAddOther}>
            <Plus size={16} /> Add
          </button>
        </div>
      </div>

      <div className="vitals-actions">
        <button className="cancel-button" onClick={handleCancel}>
          Clear All
        </button>
      </div>
    </div>
  );
};

export default VitalsInvestigation;