import React, { useState, useEffect } from "react";
import { Plus, X, AlertTriangle } from "lucide-react";
import { AutoComplete, InputNumber, Select } from "antd";
import { useSelector } from "react-redux";
import { apiGet } from "../../api";
import { toast } from "react-toastify";
import "../../stylings/EPrescription.css";

const { Option } = Select;

const DiagnosisMedication = ({ formData, updateFormData }) => {
  const user = useSelector((state) => state.currentUserData);
  const doctorId = user?.role === "doctor" ? user?.userId : user?.createdBy;

  const [medInventory, setMedInventory] = useState([]);
  const [testList, setTestList] = useState([]);
  const [medicineOptions, setMedicineOptions] = useState([]);
  const [testOptions, setTestOptions] = useState([]);

  const [localData, setLocalData] = useState({
    diagnosisList: "",
    selectedTests: [],
    medications: [
      {
        id: Date.now(),
        medName: "",
        quantity: null,
        dosage: "",
        duration: null,
        timings: [],
        frequency: null,
      },
    ],
  });

  const timingOptions = [
    "Before Breakfast",
    "After Breakfast",
    "Before Lunch",
    "After Lunch",
    "Before Dinner",
    "After Dinner",
    "Bedtime",
  ];

  useEffect(() => {
    if (formData && Object.keys(formData).length > 0) {
      setLocalData(formData);
    }
  }, [formData]);

  const fetchInventory = async () => {
    try {
      const response = await apiGet("/pharmacy/getAllMedicinesByDoctorID");
      setMedInventory(response.data.data || []);
      setMedicineOptions(
        response.data.data?.map((med) => ({
          value: med.medName,
          label: med.medName,
        })) || []
      );
    } catch (error) {
      console.error("Error fetching inventory:", error);
    }
  };

  const fetchTests = async () => {
    if (!doctorId) {
      toast.error("Doctor ID not available");
      return;
    }
    try {
      const response = await apiGet(`/lab/getTestsByDoctorId/${doctorId}`);
      setTestList(response.data.data || []);
      setTestOptions(
        response.data.data?.map((test) => ({
          value: test.testName,
          label: test.testName,
        })) || []
      );
    } catch (error) {
      console.error("Error fetching tests:", error);
    }
  };

  useEffect(() => {
    if (user && doctorId) {
      fetchInventory();
      fetchTests();
    }
  }, [user, doctorId]);

  const handleDiagnosisChange = (e) => {
    const updatedData = {
      ...localData,
      diagnosisList: e.target.value,
    };
    setLocalData(updatedData);
    updateFormData(updatedData);
  };

  const addTest = (testName) => {
    if (!testName.trim()) {
      toast.error("Please enter a valid test name");
      return;
    }

    if (localData.selectedTests.some((test) => test.testName === testName)) {
      toast.error("This test is already added");
      return;
    }

    const selectedTest = testList.find((test) => test.testName === testName);
    const newTest = {
      testName: testName,
      testInventoryId: selectedTest ? selectedTest.id : null,
    };

    const updatedData = {
      ...localData,
      selectedTests: [...localData.selectedTests, newTest],
    };
    setLocalData(updatedData);
    updateFormData(updatedData);
    toast.success("Test added successfully");
  };

  const removeTest = (testName) => {
    const updatedData = {
      ...localData,
      selectedTests: localData.selectedTests.filter(
        (test) => test.testName !== testName
      ),
    };
    setLocalData(updatedData);
    updateFormData(updatedData);
  };

  const validateMedication = (medication) => {
    if (!medication.medName.trim()) {
      toast.error("Please enter a valid medicine name");
      return false;
    }
    if (medication.quantity === null || medication.quantity <= 0) {
      toast.error("Please enter a valid quantity greater than 0");
      return false;
    }
    if (!medication.dosage.trim()) {
      toast.error("Please enter a valid dosage (e.g., 1-0-1)");
      return false;
    }
    if (medication.duration === null || medication.duration <= 0) {
      toast.error("Please enter a valid duration greater than 0 days");
      return false;
    }
    if (!medication.frequency || medication.frequency <= 0) {
      toast.error("Please enter a valid frequency greater than 0");
      return false;
    }
    if (medication.timings.length !== medication.frequency) {
      toast.error(
        `Please select exactly ${medication.frequency} timing${
          medication.frequency > 1 ? "s" : ""
        } to match the frequency`
      );
      return false;
    }
    return true;
  };

  const addMedication = () => {
    const lastMedication =
      localData.medications[localData.medications.length - 1];
    if (
      localData.medications.length > 0 &&
      !validateMedication(lastMedication)
    ) {
      return;
    }

    const newMedication = {
      id: null, // ✅ Will be set when medName is chosen
      medName: "",
      quantity: null,
      dosage: "",
      duration: null,
      timings: [],
      frequency: null,
      medInventoryId: null,
      price: null,
    };

    const updatedData = {
      ...localData,
      medications: [...localData.medications, newMedication],
    };
    setLocalData(updatedData);
    updateFormData(updatedData);
  };

  const removeMedication = (id) => {
    const updatedData = {
      ...localData,
      medications: localData.medications.filter((med) => med.id !== id),
    };
    setLocalData(updatedData);
    updateFormData(updatedData);
    toast.success("Medicine removed successfully");
  };

  const updateMedication = (id, field, value) => {
    const updatedMedications = localData.medications.map((med) => {
      if (med.id === id) {
        let updatedMed = { ...med, [field]: value };

        if (field === "medName") {
          const selectedMed = medInventory.find((m) => m.medName === value);
          if (selectedMed) {
            updatedMed = {
              ...updatedMed,
              medInventoryId: selectedMed._id,
              id: selectedMed._id, // ✅ SET id FROM BACKEND _id
              price: selectedMed.price,
            };
          } else {
            updatedMed.medInventoryId = null;
            updatedMed.id = null;
            updatedMed.price = null;
          }
        }

        if (field === "frequency" && updatedMed.timings.length > value) {
          updatedMed.timings = updatedMed.timings.slice(0, value);
        }

        return updatedMed;
      }
      return med;
    });

    const updatedData = {
      ...localData,
      medications: updatedMedications,
    };
    setLocalData(updatedData);
    updateFormData(updatedData);
  };

  return (
    <div className="common-container">
      {/* Diagnostic Tests Section */}
      <div className="diagnostic-tests-section">
        <div className="diagnostic-tests-header">
          <div style={{ display: "flex", alignItems: "center" }}>
            <AlertTriangle
              style={{
                width: "20px",
                height: "20px",
                color: "#f59e0b",
                marginRight: "8px",
              }}
            />
            <h3 className="diagnostic-tests-title">DIAGNOSTIC TESTS</h3>
          </div>
        </div>

        {/* Add Test Input */}
        <div style={{ marginBottom: "16px" }}>
          <AutoComplete
            options={testOptions}
            style={{ width: "100%" }}
            onSelect={(value) => addTest(value)}
            placeholder="Enter or search test name"
            filterOption={(input, option) =>
              option.label.toLowerCase().includes(input.toLowerCase())
            }
            allowClear
          />
        </div>

        {/* Tests List */}
        <div className="tests-list">
          {localData.selectedTests.map((test, index) => (
            <div key={index} className="test-item">
              <label className="test-label">{test.testName}</label>
              <button
                onClick={() => removeTest(test.testName)}
                className="remove-test-button"
              >
                <X style={{ width: "12px", height: "12px" }} />
              </button>
            </div>
          ))}
        </div>

        {/* Note Box for Diagnostic Tests */}
        <div className="note-box">
          <div className="note-header">Note:</div>
          <textarea
            className="note-textarea"
            placeholder="Add any specific instructions for the tests..."
            value={localData.testNotes || ""}
            onChange={(e) => {
              const updatedData = {
                ...localData,
                testNotes: e.target.value,
              };
              setLocalData(updatedData);
              updateFormData(updatedData);
            }}
          />
        </div>
      </div>

      {/* Diagnosis Section */}
      <div className="diagnosis-section">
        <div className="diagnosis-header">
          <div
            style={{
              width: "20px",
              height: "20px",
              backgroundColor: "#ef4444",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginRight: "8px",
            }}
          >
            <span
              style={{
                color: "white",
                fontSize: "12px",
                fontWeight: "bold",
              }}
            >
              ♥
            </span>
          </div>
          <h3 className="diagnosis-title">DIAGNOSIS</h3>
        </div>

        <div style={{ marginBottom: "12px" }}>
          <textarea
            value={localData.diagnosisList}
            onChange={handleDiagnosisChange}
            placeholder="e.g., Systemic Hypertension, Dyslipidemia, Pre Diabetic, Autoimmune Disease"
            className="diagnosis-textarea"
          />
        </div>
      </div>

      {/* Prescribed Medications Section */}
      <div className="medications-section">
        <div className="medications-header">
          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                width: "20px",
                height: "20px",
                backgroundColor: "#8b5cf6",
                borderRadius: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginRight: "8px",
              }}
            >
              <span
                style={{
                  color: "white",
                  fontSize: "12px",
                  fontWeight: "bold",
                }}
              >
                ℞
              </span>
            </div>
            <h3 className="medications-title">PRESCRIBED MEDICATIONS</h3>
          </div>

          <button onClick={addMedication} className="add-medication-button">
            <Plus
              style={{ width: "16px", height: "16px", marginRight: "4px" }}
            />
            Add Medicine
          </button>
        </div>

        {/* Medications List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {localData.medications.map((medication) => (
            <div key={medication.id} className="medication-item">
              {/* First Row - Medicine Name, Quantity */}
              <div className="medication-row">
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: "500",
                      color: "#6b7280",
                      marginBottom: "4px",
                    }}
                  >
                    Medicine Name
                  </label>
                  <AutoComplete
                    options={medicineOptions}
                    style={{ width: "100%" }}
                    onSelect={(value) =>
                      updateMedication(medication.id, "medName", value)
                    }
                    onChange={(value) =>
                      updateMedication(medication.id, "medName", value)
                    }
                    value={medication.medName}
                    placeholder="Enter medicine name"
                    filterOption={(input, option) =>
                      option.label.toLowerCase().includes(input.toLowerCase())
                    }
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: "500",
                      color: "#6b7280",
                      marginBottom: "4px",
                    }}
                  >
                    Quantity
                  </label>
                  <InputNumber
                    value={medication.quantity}
                    onChange={(value) =>
                      updateMedication(medication.id, "quantity", value)
                    }
                    style={{ width: "100%" }}
                    min={1}
                  />
                </div>

                {localData.medications.length > 1 && (
                  <button
                    onClick={() => removeMedication(medication.id)}
                    className="remove-medication-button"
                  >
                    <X style={{ width: "16px", height: "16px" }} />
                  </button>
                )}
              </div>

              {/* Second Row - Dosage, Duration */}
              <div className="medication-dosage-row">
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: "500",
                      color: "#6b7280",
                      marginBottom: "4px",
                    }}
                  >
                    Dosage
                  </label>
                  <input
                    type="text"
                    value={medication.dosage}
                    onChange={(e) =>
                      updateMedication(medication.id, "dosage", e.target.value)
                    }
                    placeholder="e.g., 1-0-1"
                    className="medication-field"
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: "500",
                      color: "#6b7280",
                      marginBottom: "4px",
                    }}
                  >
                    Duration (days)
                  </label>
                  <InputNumber
                    value={medication.duration}
                    onChange={(value) =>
                      updateMedication(medication.id, "duration", value)
                    }
                    style={{ width: "100%" }}
                    min={1}
                  />
                </div>
              </div>

              {/* Third Row - Timings, Frequency */}
              <div className="medication-timing-row">
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: "500",
                      color: "#6b7280",
                      marginBottom: "4px",
                    }}
                  >
                    Timings
                  </label>
                  <Select
                    mode="multiple"
                    placeholder="Select timings"
                    value={medication.timings}
                    onChange={(value) =>
                      updateMedication(medication.id, "timings", value)
                    }
                    style={{ width: "100%" }}
                    allowClear
                    maxTagCount={medication.frequency || 3}
                  >
                    {timingOptions.map((option) => (
                      <Option key={option} value={option}>
                        {option}
                      </Option>
                    ))}
                  </Select>
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: "500",
                      color: "#6b7280",
                      marginBottom: "4px",
                    }}
                  >
                    Frequency
                  </label>
                  <InputNumber
                    value={medication.frequency}
                    onChange={(value) => {
                      updateMedication(medication.id, "frequency", value);
                      if (value && medication.timings.length > value) {
                        updateMedication(
                          id,
                          "timings",
                          medication.timings.slice(0, value)
                        );
                      }
                    }}
                    style={{ width: "100%" }}
                    min={1}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Note Box for Medications */}
        <div className="note-box">
          <div className="note-header">Note:</div>
          <textarea
            className="note-textarea"
            placeholder="Add any specific instructions for the medications..."
            value={localData.medicationNotes || ""}
            onChange={(e) => {
              const updatedData = {
                ...localData,
                medicationNotes: e.target.value,
              };
              setLocalData(updatedData);
              updateFormData(updatedData);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default DiagnosisMedication;
