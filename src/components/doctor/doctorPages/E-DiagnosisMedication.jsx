import React, { useState, useEffect } from "react";
import { Plus, X, AlertTriangle } from "lucide-react";
import { AutoComplete, InputNumber, Select, Button } from "antd";
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
  const [testInputValue, setTestInputValue] = useState("");

  const [localData2, setLocalData2] = useState({
    diagnosisList: "",
    selectedTests: [],
    medications: [
      // {
      //   id: Date.now(),
      //   medName: "",
      //   quantity: null,
      //    medicineType: null,
      //   dosage: "",
      //   duration: null,
      //   timings: [],
      //   frequency: null,
      //   notes: "",
      // },
    ],
  });

   const [localData, setLocalData] = useState({
    diagnosisList: formData?.diagnosisList || "",
    selectedTests: formData?.selectedTests || [],
    medications: formData?.medications && formData.medications.length > 0
      ? formData.medications
      : [],
    testNotes: formData?.testNotes || "",
    medicationNotes: formData?.medicationNotes || "",
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

  const frequencyOptions = [
    "1-0-0", // Once a day (Morning)
    "1-0-1", // Twice a day (Morning and Night)
    "1-1-1", // Three times a day (Morning, Afternoon, Night)
    "0-0-1", // Once at night
    "0-1-0", // Once at lunch
    "1-1-0", // Morning and lunch
    "0-1-1", // Lunch and night
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
  const capitalizedValue = e.target.value.toUpperCase(); 
    const updatedData = {
      ...localData,
    diagnosisList: capitalizedValue,
    };
    setLocalData(updatedData);
    updateFormData(updatedData);
  };

  const addTest2 = (testName) => {
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
    setTestInputValue("");
    toast.success("Test added successfully");
  };

  const addTest = () => {
    if (!testInputValue.trim()) {
      toast.error("Please enter a valid test name");
      return;
    }

    if (localData.selectedTests.some((test) => test.testName === testInputValue)) {
      toast.error("This test is already added");
      return;
    }

    const selectedTest = testList.find((test) => test.testName === testInputValue);
    const newTest = {
      testName: testInputValue,
      testInventoryId: selectedTest ? selectedTest.id : null,
    };

    const updatedData = {
      ...localData,
      selectedTests: [...localData.selectedTests, newTest],
    };
    setLocalData(updatedData);
    updateFormData(updatedData);
    setTestInputValue("");
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

  const validateDosage = (dosage) => {
    const dosageRegex = /^\d+\s*(mg|ml|g|tablet|tab|capsule|cap|spoon|drop)s?$/i;
    return dosageRegex.test(dosage);
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
     if (!medication.medicineType) {
      toast.error("Please select a medicine type");
      return false;
    }
    if (!medication.dosage.trim() || !validateDosage(medication.dosage)) {
      toast.error("Please enter a valid dosage (e.g., 100mg, 5ml)");
      return false;
    }
    if (medication.duration === null || medication.duration <= 0) {
      toast.error("Please enter a valid duration greater than 0 days");
      return false;
    }
    if (!medication.frequency) {
      toast.error("Please select a frequency");
      return false;
    }
    if (medication.frequency !== "SOS" && 
        medication.timings.length !== medication.frequency.split('-').filter(x => x === '1').length) {
      toast.error(
        `Please select exactly ${medication.frequency.split('-').filter(x => x === '1').length} timing${
          medication.frequency.split('-').filter(x => x === '1').length > 1 ? "s" : ""
        } to match the frequency`
      );
      return false;
    }
    return true;
  };

  const addMedication = () => {
    console.log("first")
    const lastMedication =
      localData.medications[localData.medications.length - 1];
      console.log("localData==",localData)
    if (
      localData.medications.length > 0 &&
      !validateMedication(lastMedication)
    ) {
      console.log("222")
      return;
    }
console.log("999")
    const newMedication = {
      id: Date.now(),
      medName: "",
      quantity: null,
        medicineType: null,
      dosage: "",
      duration: null,
      timings: [],
      frequency: null,
      medInventoryId: null,
      price: null,
      notes: "",
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
              medInventoryId: selectedMed ? selectedMed._id : null,
              // id: selectedMed._id,
              price: selectedMed.price,
            };
          } else {
            updatedMed.medInventoryId = null;
            // updatedMed.id = null;
            updatedMed.price = null;
          }
        }

          // Update quantity based on duration and timings
        if (field === "duration" || field === "timings") {
          const newDuration = field === "duration" ? value : med.duration;
          const newTimings = field === "timings" ? value : med.timings;
          updatedMed.quantity = newDuration && newTimings.length ? newDuration * newTimings.length : null;
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

  const updateMedicationFrequency = (id, value) => {
    const updatedMedications = localData.medications.map((med) => {
      if (med.id === id) {
        // For SOS frequency, clear timings
        if (value === "SOS") {
          return {
            ...med,
            frequency: value,
            timings: []
          };
        }

        // Calculate how many timings we need based on frequency
        const requiredTimingsCount = value.split('-').filter(x => x === '1').length;
        
        // Filter existing timings to keep only the first X that match the new frequency count
        const filteredTimings = med.timings.slice(0, requiredTimingsCount);
        
        return {
          ...med,
          frequency: value,
          timings: filteredTimings
        };
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

 const medicineTypeOptions = ["Tablet", "Capsule", "Syrup", "Injection", "Cream", "Drops"];
  

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
            style={{ width: "80%", marginRight:'10px' }}
            // onSelect={(value) => {
            //   addTest(value);
            //   setTestInputValue("");
            // }}
            onChange={(value) => setTestInputValue(value)}
            value={testInputValue}
            placeholder="Enter or search test name"
            filterOption={(input, option) =>
              option.label.toLowerCase().includes(input.toLowerCase())
            }
            allowClear
          />
          <Button type="primary" onClick={addTest}>
            Add
          </Button>
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
          <div className="note-header">Notes:</div>
          <textarea
            className="note-textarea"
            placeholder="Enter notes..."
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
            placeholder="Enter Here..."
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

<div style={{ flex: 1 }}>
              <label
                style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: "500",
                  color: "#6b7280",
                  marginBottom: "4px",
                }}
              >
                Medicine Type
              </label>
              <Select
                value={medication.medicineType || undefined}
                onChange={(value) =>
                  updateMedication(medication.id, "medicineType", value)
                }
                style={{ width: "100%" }}
                placeholder="Select type"
                allowClear
              >
                {medicineTypeOptions.map((option) => (
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
                    Quantity
                  </label>
                  <InputNumber
                    // value={medication.quantity}
                     value={medication.duration && medication.timings ? medication.duration * medication.timings.length : 0}
 
                    // onChange={(value) =>
                    //   updateMedication(medication.id, "quantity", value)
                    // }
                    style={{ width: "100%" }}
                    // min={1}
                     disabled
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
                    placeholder="e.g., 100mg, 5ml"
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
                    disabled={medication.frequency === "SOS"}
                    maxTagCount={medication.frequency ? medication.frequency.split('-').filter(x => x === '1').length : 3}
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
                  <Select
                    value={medication.frequency}
                    onChange={(value) => updateMedicationFrequency(medication.id, value)}
                    style={{ width: "100%" }}
                    placeholder="Select frequency"
                  >
                    {frequencyOptions.map((option) => (
                      <Option key={option} value={option}>
                        {option}
                      </Option>
                    ))}
                  </Select>
                </div>
              </div>

              {/* Individual Medication Notes */}
              <div className="note-box" style={{ marginTop: "12px" }}>
                <div className="note-header">Notes for this medication:</div>
                <textarea
                  className="note-textarea"
                  placeholder="Enter specific notes for this medication..."
                  value={medication.notes || ""}
                  onChange={(e) => {
                    const updatedMedications = localData.medications.map(med => {
                      if (med.id === medication.id) {
                        return { ...med, notes: e.target.value };
                      }
                      return med;
                    });
                    const updatedData = {
                      ...localData,
                      medications: updatedMedications,
                    };
                    setLocalData(updatedData);
                    updateFormData(updatedData);
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* General Notes Box for Medications */}
        <div className="note-box">
          <div className="note-header">General Notes:</div>
          <textarea
            className="note-textarea"
            placeholder="Enter general notes for all medications..."
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