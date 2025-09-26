import React, { useState, useEffect } from "react";
import { Plus, X, AlertTriangle } from "lucide-react";
import { AutoComplete, InputNumber, Select, Button, Input,Modal, List } from "antd";
import { useSelector } from "react-redux";
import { apiGet } from "../../api";
import { toast } from "react-toastify";
import "../../stylings/EPrescription.css";

const { Option } = Select;

const DiagnosisMedication = ({ formData, updateFormData, validationError, patientId }) => {
  console.log(formData, updateFormData,patientId, "formdata in diagnosis medication");
  const user = useSelector((state) => state.currentUserData);
  const doctorId = user?.role === "doctor" ? user?.userId : user?.createdBy;

  const [medInventory, setMedInventory] = useState([]);
  const [testList, setTestList] = useState([]);
  const [medicineOptions, setMedicineOptions] = useState([]);
  const [testOptions, setTestOptions] = useState([]);
  const [testInputValue, setTestInputValue] = useState("");
  const [showTestNotes, setShowTestNotes] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [selectedFromDropdown, setSelectedFromDropdown] = useState({});
const [loadingPrev, setLoadingPrev] = useState(false);

const [prevList, setPrevList] = useState([]);
 const [isPrevModalOpen, setIsPrevModalOpen] = useState(false);


 const [templateItems, setTemplateItems] = useState([]);
 const [templatesLoading, setTemplatesLoading] = useState(false);

  const [localData, setLocalData] = useState({
    diagnosisList: formData?.diagnosisList || "",
    selectedTests: formData?.selectedTests || [],
    medications:
      formData?.medications && formData.medications.length > 0
        ? formData.medications
        : [],
    testNotes: formData?.testNotes || "",
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
    "1-0-0",
    "1-0-1",
    "1-1-1",
    "0-0-1",
    "0-1-0",
    "1-1-0",
    "0-1-1",
    "SOS",
  ];

  useEffect(() => {
    if (formData && Object.keys(formData).length > 0) {
      setLocalData(formData);
      if (formData?.testNotes) {
        setShowTestNotes(true);
      }
    }
  }, [formData]);

 const fetchTemplates = async () => {
   if (!doctorId) return;
   try {
     setTemplatesLoading(true);
     const res = await apiGet(`/template/getTemplatesByDoctorId?doctorId=${doctorId}`);
     const data = res?.data?.data || res?.data || [];
     setTemplateItems(Array.isArray(data) ? data : []);
   } catch (e) {
     console.error(e);
   } finally {
     setTemplatesLoading(false);
   }
 };


  const fetchInventory = async () => {
    try {
      const response = await apiGet("/pharmacy/getAllMedicinesByDoctorID");
      const medicines = response.data.data || [];

      const sortedMedicines = [...medicines].sort((a, b) =>
        a.medName.localeCompare(b.medName)
      );

      setMedInventory(sortedMedicines);
      setMedicineOptions(
        sortedMedicines.map((med) => ({
          value: `${med.medName}|${med.dosage}`,
          label: `${med.medName} ${med.dosage}`,
          medName: med.medName,
          dosage: med.dosage,
          medInventoryId: med._id,
          price: med.price,
        }))
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
      const response = await apiGet(`/lab/getAllTestsByDoctorId/${doctorId}`);
      const tests = response.data.tests || [];

      const sortedTests = [...tests].sort((a, b) =>
        a.testName.localeCompare(b.testName)
      );

      setTestList(sortedTests);
      setTestOptions(
        sortedTests.map((test) => ({
          value: test.testName,
          label: test.testName,
        }))
      );
    } catch (error) {
      console.error("Error fetching tests:", error);
    }
  };

  useEffect(() => {
    if (user && doctorId) {
      fetchInventory();
      fetchTests();
       fetchTemplates();
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

  const addTest = () => {
    if (!testInputValue.trim()) {
      toast.error("Please enter a valid test name");
      return;
    }

    if (
      localData.selectedTests.some((test) => test.testName === testInputValue)
    ) {
      toast.error("This test is already added");
      return;
    }

    const selectedTest = testList.find(
      (test) => test.testName === testInputValue
    );
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

  const fetchPreviousPrescription = async () => {
    
     try {
      setLoadingPrev(true);
     const res = await apiGet(
       `pharmacy/getEPrescriptionByPatientIdAndDoctorId/${patientId}?doctorId=${doctorId}`
     );
     const list = res?.data?.data || [];
     if (!Array.isArray(list) || list.length === 0) {
       toast.info("No previous prescriptions found");
       return;
     }
     setPrevList(list);
     setIsPrevModalOpen(true);
   } catch (e) {
      console.error(e);
      toast.error("Failed to fetch previous prescription");
    } finally {
      setLoadingPrev(false);
    }
  };


 const applyPreviousPrescription = (prescription) => {
   const meds = Array.isArray(prescription?.medications) ? prescription.medications : [];
   if (meds.length === 0) {
     toast.info("No medications found in this prescription");
     return;
   }

   const timeNow = Date.now();
   const mapped = meds.map((m, i) => ({
     id: timeNow + i,
     medName: m?.medName || "",
     quantity: m?.quantity ?? null,
     medicineType: m?.medicineType ?? null,
     dosage: m?.dosage || "",
     duration: m?.duration ?? null,
     timings: Array.isArray(m?.timings) ? m.timings : [],
     frequency: m?.frequency ?? null,
     medInventoryId: m?.medInventoryId ?? null,
     price: null,
     notes: m?.notes || "",
     isFromPrevious: true,
   }));

   const existing = localData.medications || [];
   const merged = [
     ...existing.filter(
       (e) => !mapped.some((m) => m.medName === e.medName && m.dosage === e.dosage)
     ),
     ...mapped,
   ];

   const updatedData = { ...localData, medications: merged };
   setLocalData(updatedData);
   updateFormData(updatedData);

   // lock medName/dosage edits for copied meds
   setSelectedFromDropdown((prev) => {
     const next = { ...prev };
     mapped.forEach((m) => { next[m.id] = true; });
     return next;
   });

   setTouched((prev) => {
     const next = { ...prev };
     mapped.forEach((m) => { next[m.id] = {}; });
     return next;
   });

   setIsPrevModalOpen(false);
   toast.success("Prescription applied");
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
    if (!dosage || !dosage.trim()) {
      return false;
    }
    const dosageRegex =
      /^\d+(\.\d+)?\s*(mg|mcg|g|kg|ml|l|tablet|tab|capsule|cap|tsp|tbsp|tablespoon|teaspoon|spoon|drop|unit|puff|spray|amp|ampoule|vial)s?$/i;
    return dosageRegex.test(dosage);
  };

  const validateSingleMedication = (id, field = null) => {
    const medication = localData.medications.find((med) => med.id === id);
    if (!medication) return;

    let medErrors = errors[id] || {};

    if (!field || field === "medName") {
      if (touched[id]?.medName && !medication.medName.trim()) {
        medErrors.medName = "Please enter a valid medicine name";
      } else {
        delete medErrors.medName;
      }
    }

    if (!field || field === "quantity") {
      if (
        touched[id]?.quantity &&
        (medication.quantity === null || medication.quantity <= 0)
      ) {
        medErrors.quantity = "Please enter a valid quantity greater than 0";
      } else {
        delete medErrors.quantity;
      }
    }

    if (!field || field === "medicineType") {
      if (touched[id]?.medicineType && !medication.medicineType) {
        medErrors.medicineType = "Please select a medicine type";
      } else {
        delete medErrors.medicineType;
      }
    }

    if (!field || field === "dosage") {
      if (
        touched[id]?.dosage &&
        (!medication.dosage || !validateDosage(medication.dosage))
      ) {
        medErrors.dosage =
          "Please enter a valid dosage (e.g., 100mg, 5ml, 1 tablet, 0.5 tsp, 1 tbsp)";
      } else {
        delete medErrors.dosage;
      }
    }

    if (!field || field === "duration") {
      if (
        touched[id]?.duration &&
        (medication.duration === null || medication.duration <= 0)
      ) {
        medErrors.duration =
          "Please enter a valid duration greater than 0 days";
      } else {
        delete medErrors.duration;
      }
    }

    if (!field || field === "frequency") {
      if (touched[id]?.frequency && !medication.frequency) {
        medErrors.frequency = "Please select a frequency";
      } else {
        delete medErrors.frequency;
      }
    }

    if (!field || field === "timings") {
      delete medErrors.timings;
    }

    setErrors((prev) => ({
      ...prev,
      [id]: Object.keys(medErrors).length > 0 ? medErrors : undefined,
    }));
  };

  const validateMedication = (medication) => {
    validateSingleMedication(medication.id);
    return (
      !errors[medication.id] || Object.keys(errors[medication.id]).length === 0
    );
  };

  const validateAllMedications = () => {
    if (localData.medications.length === 0) {
      return true;
    }

    localData.medications.forEach((medication) => {
      validateSingleMedication(medication.id);
    });

    return localData.medications.every(
      (medication) =>
        !errors[medication.id] ||
        Object.keys(errors[medication.id]).length === 0
    );
  };

  const addMedication = () => {
    if (localData.medications.length > 0) {
      const lastMedication =
        localData.medications[localData.medications.length - 1];
      validateSingleMedication(lastMedication.id);
      if (
        errors[lastMedication.id] &&
        Object.keys(errors[lastMedication.id]).length > 0
      ) {
        toast.error(
          "Please fix the errors in the last medication before adding a new one"
        );
        return;
      }
    }

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
    setTouched((prev) => ({
      ...prev,
      [newMedication.id]: {},
    }));
    setSelectedFromDropdown((prev) => ({
      ...prev,
      [newMedication.id]: false,
    }));
  };

 const applyTemplate = (templateId) => {
   const tpl = templateItems.find((t) => t?._id === templateId);
   if (!tpl) return;

   const timeNow = Date.now();
   const meds = Array.isArray(tpl.medications) ? tpl.medications : [];

   const mapped = meds.map((m, i) => {
     const base = {
       id: timeNow + i,
       medName: m?.medName || "",
       medicineType: m?.medicineType ?? null,
       dosage: m?.dosage || "",
       duration: m?.duration ?? null,
       frequency: m?.frequency ?? null,
       timings: Array.isArray(m?.timings) ? m.timings : [],
       medInventoryId: m?.medInventoryId ?? null,
       price: null,
       notes: m?.notes || "",
       isFromTemplate: true,     // <- flag for disabling name + dosage
     };

     // quantity: auto-calc for Tablet/Capsule/Injection; else keep provided
     const typesAuto = ["Tablet", "Capsule", "Injection"];
     const timesPerDay =
       typeof base.frequency === "string"
         ? base.frequency.split("-").filter((x) => x === "1").length
         : 0;
     if (typesAuto.includes(base.medicineType) && base.duration && timesPerDay) {
       base.quantity = base.duration * timesPerDay;
     } else {
       base.quantity = m?.quantity ?? null;
     }
     return base;
   });

   // merge: avoid exact duplicates (name+dosage)
   const existing = localData.medications || [];
   const merged = [
     ...existing.filter(
       (e) => !mapped.some((m) => m.medName === e.medName && m.dosage === e.dosage)
     ),
     ...mapped,
   ];

   const updatedData = { ...localData, medications: merged };
   setLocalData(updatedData);
   updateFormData(updatedData);

   // Reuse existing “selectedFromDropdown” to also lock dosage
   setSelectedFromDropdown((prev) => {
     const next = { ...prev };
     mapped.forEach((m) => {
       next[m.id] = true; // disables dosage via existing logic
     });
     return next;
   });

   // init touched/errors buckets
   setTouched((prev) => {
     const next = { ...prev };
     mapped.forEach((m) => {
       next[m.id] = {};
     });
     return next;
   });
 };


  const removeMedication = (id) => {
    const updatedData = {
      ...localData,
      medications: localData.medications.filter((med) => med.id !== id),
    };
    setLocalData(updatedData);
    updateFormData(updatedData);
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[id];
      return newErrors;
    });
    setTouched((prev) => {
      const newTouched = { ...prev };
      delete newTouched[id];
      return newTouched;
    });
    setSelectedFromDropdown((prev) => {
      const newSelected = { ...prev };
      delete newSelected[id];
      return newSelected;
    });
    toast.success("Medicine removed successfully");
  };

  const updateMedication = (id, field, value) => {
    const updatedMedications = localData.medications.map((med) => {
      if (med.id === id) {
        let updatedMed = { ...med, [field]: value };

        if (field === "medName") {
          const selectedOption = medicineOptions.find((m) => m.value === value);
          if (selectedOption) {
            updatedMed = {
              ...updatedMed,
              medName: selectedOption.medName,
              dosage: selectedOption.dosage,
              medInventoryId: selectedOption.medInventoryId,
              price: selectedOption.price,
            };
            setSelectedFromDropdown((prev) => ({
              ...prev,
              [id]: true,
            }));
          } else {
            updatedMed = {
              ...updatedMed,
              medName: value,
              medInventoryId: null,
              price: null,
              dosage: med.dosage, // Retain existing dosage if manually entered
            };
            setSelectedFromDropdown((prev) => ({
              ...prev,
              [id]: false,
            }));
          }
        }

        if (field === "dosage" && selectedFromDropdown[id]) {
          // Prevent updating dosage if selected from dropdown
          return med;
        }

        if (field === "medicineType") {
          updatedMed.quantity = null;
          if (
            ["Tablet", "Capsule", "Injection"].includes(value) &&
            updatedMed.duration &&
            updatedMed.frequency
          ) {
            const timesPerDay = updatedMed.frequency
              .split("-")
              .filter((x) => x === "1").length;
            updatedMed.quantity = updatedMed.duration * timesPerDay;
          }
        }

        if (field === "duration" || field === "frequency") {
          const newDuration = field === "duration" ? value : med.duration;
          const newFrequency = field === "frequency" ? value : med.frequency;

          if (["Tablet", "Capsule", "Injection"].includes(med.medicineType)) {
            if (newFrequency && newDuration) {
              const timesPerDay = newFrequency
                .split("-")
                .filter((x) => x === "1").length;
              updatedMed.quantity = newDuration * timesPerDay;
            } else {
              updatedMed.quantity = null;
            }
          }
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
    setTouched((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: true },
    }));
    if (field !== "dosage" && field !== "duration") {
      validateSingleMedication(id, field);
    }
  };

  const updateMedicationFrequency = (id, value) => {
    const updatedMedications = localData.medications.map((med) => {
      if (med.id === id) {
        if (value === "SOS") {
          return {
            ...med,
            frequency: value,
            timings: [],
          };
        }

        const requiredTimingsCount = value
          .split("-")
          .filter((x) => x === "1").length;

        const filteredTimings = med.timings.slice(0, requiredTimingsCount);

        let newQuantity = med.quantity;
        if (
          ["Tablet", "Capsule", "Injection"].includes(med.medicineType) &&
          med.duration
        ) {
          const timesPerDay = value.split("-").filter((x) => x === "1").length;
          newQuantity = med.duration * timesPerDay;
        }

        return {
          ...med,
          frequency: value,
          timings: filteredTimings,
          quantity: newQuantity,
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
    setTouched((prev) => ({
      ...prev,
      [id]: { ...prev[id], frequency: true },
    }));
    validateSingleMedication(id, "frequency");
  };

  const handleQuantityChange = (id, value) => {
    const updatedMedications = localData.medications.map((med) => {
      if (med.id === id) {
        return {
          ...med,
          quantity: value,
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
    setTouched((prev) => ({
      ...prev,
      [id]: { ...prev[id], quantity: true },
    }));
    validateSingleMedication(id, "quantity");
  };

  const handleDosageBlur = (id, value) => {
    setTouched((prev) => ({
      ...prev,
      [id]: { ...prev[id], dosage: true },
    }));
    validateSingleMedication(id, "dosage");
  };

  const handleDurationBlur = (id, value) => {
    setTouched((prev) => ({
      ...prev,
      [id]: { ...prev[id], duration: true },
    }));
    validateSingleMedication(id, "duration");
  };

  const medicineTypeOptions = [
    "Tablet",
    "Capsule",
    "Syrup",
    "Injection",
    "Cream",
    "Drops",
  ];

  const isQuantityEditable = (medicineType) => {
    return ["Syrup", "Cream", "Drops"].includes(medicineType);
  };

  const getMaxTimings = (frequency) => {
    if (!frequency || frequency === "SOS") return 0;
    return frequency.split("-").filter((x) => x === "1").length;
  };

  const validateBeforeTabSwitch = () => {
    let isValid = true;

    localData.medications.forEach((medication) => {
      validateSingleMedication(medication.id);
      if (errors[medication.id] && errors[medication.id].timings) {
        toast.error(errors[medication.id].timings);
        isValid = false;
      }
    });

    return isValid;
  };

  return (
    <div className="common-container">
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

        <div style={{ marginBottom: "16px" }}>
          <AutoComplete
            options={testOptions}
            style={{ width: "80%", marginRight: "10px" }}
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

        <div style={{ marginTop: "16px", marginBottom: "16px" }}>
          <Button
            type="primary"
            onClick={() => setShowTestNotes(!showTestNotes)}
            icon={<Plus style={{ width: "16px", height: "16px" }} />}
          >
            {showTestNotes ? "Hide Notes" : "Add Note"}
          </Button>
        </div>

        {showTestNotes && (
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
        )}
      </div>

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

      <div className="medications-section">
        <div className="medications-header">
  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
    <div
      style={{
        width: "20px",
        height: "20px",
        backgroundColor: "#8b5cf6",
        borderRadius: "4px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
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
    <h3 className="medications-title" style={{ margin: 0 }}>
      PRESCRIBED MEDICATIONS
    </h3>
  </div>

  {/* Template dropdown on the right */}
  <div style={{ minWidth: 280, display: "flex", alignItems: "center", gap: 8 }}>
    <label
      style={{
        fontSize: 12,
        fontWeight: 500,
        color: "#6b7280",
        whiteSpace: "nowrap",
      }}
    >
      Apply Template
    </label>
    <Select
      showSearch
      placeholder="Select a template"
      optionFilterProp="label"
      style={{ width: "100%" }}
      loading={templatesLoading}
      onSelect={(val) => applyTemplate(val)}
      allowClear
      options={(templateItems || []).map((t) => ({
        value: t._id,
        label: t.name || "Untitled",
      }))}
    />
  </div>
</div>
        {validationError && (
          <div className="medication-validation-error">{validationError}</div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {localData.medications.map((medication) => (
            <div key={medication.id} className="medication-item">
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
                    placeholder="Enter or search medicine name"
                    filterOption={(input, option) =>
                      option.label.toLowerCase().includes(input.toLowerCase())
                    }
                disabled={!!(medication.isFromPrevious || medication.isFromTemplate)}
                  />
                  {errors[medication.id]?.medName && (
                    <div
                      className="error"
                      style={{ color: "red", fontSize: "12px" }}
                    >
                      {errors[medication.id].medName}
                    </div>
                  )}
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
                  {errors[medication.id]?.medicineType && (
                    <div
                      className="error"
                      style={{ color: "red", fontSize: "12px" }}
                    >
                      {errors[medication.id].medicineType}
                    </div>
                  )}
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
                  {isQuantityEditable(medication.medicineType) ? (
                    <InputNumber
                      value={medication.quantity}
                      onChange={(value) =>
                        handleQuantityChange(medication.id, value)
                      }
                      style={{ width: "100%" }}
                      min={1}
                    />
                  ) : (
                    <InputNumber
                      value={medication.quantity || 0}
                      style={{ width: "100%" }}
                      disabled
                    />
                  )}
                  {errors[medication.id]?.quantity && (
                    <div
                      className="error"
                      style={{ color: "red", fontSize: "12px" }}
                    >
                      {errors[medication.id].quantity}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => removeMedication(medication.id)}
                  className="remove-medication-button"
                >
                  <X style={{ width: "16px", height: "16px" }} />
                </button>
              </div>

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
                  <Input
                    type="text"
                    value={medication.dosage}
                    onChange={(e) =>
                      updateMedication(medication.id, "dosage", e.target.value)
                    }
                    onBlur={() =>
                      handleDosageBlur(medication.id, medication.dosage)
                    }
                    placeholder="Enter dosage"
                    className="medication-field"
                    disabled={selectedFromDropdown[medication.id] || !!medication.isFromTemplate}
                  />
                  {errors[medication.id]?.dosage && (
                    <div
                      className="error"
                      style={{ color: "red", fontSize: "12px" }}
                    >
                      {errors[medication.id].dosage}
                    </div>
                  )}
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
                    onBlur={() =>
                      handleDurationBlur(medication.id, medication.duration)
                    }
                    style={{ width: "100%" }}
                    min={1}
                  />
                  {errors[medication.id]?.duration && (
                    <div
                      className="error"
                      style={{ color: "red", fontSize: "12px" }}
                    >
                      {errors[medication.id].duration}
                    </div>
                  )}
                </div>
              </div>

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
                    Frequency
                  </label>
                  <Select
                    value={medication.frequency}
                    onChange={(value) =>
                      updateMedicationFrequency(medication.id, value)
                    }
                    style={{ width: "100%" }}
                    placeholder="Select frequency"
                  >
                    {frequencyOptions.map((option) => (
                      <Option key={option} value={option}>
                        {option}
                      </Option>
                    ))}
                  </Select>
                  {errors[medication.id]?.frequency && (
                    <div
                      className="error"
                      style={{ color: "red", fontSize: "12px" }}
                    >
                      {errors[medication.id].frequency}
                    </div>
                  )}
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
                    Timings
                  </label>
                  <Select
                    mode="multiple"
                    placeholder="Select timings"
                    value={medication.timings}
                    onChange={(value) => {
                      if (value.length <= getMaxTimings(medication.frequency)) {
                        updateMedication(medication.id, "timings", value);
                      } else {
                        toast.error(
                          `Cannot select more than ${getMaxTimings(
                            medication.frequency
                          )} timing${
                            getMaxTimings(medication.frequency) > 1 ? "s" : ""
                          } for frequency ${medication.frequency}`
                        );
                      }
                    }}
                    style={{ width: "100%" }}
                    allowClear
                    disabled={medication.frequency === "SOS"}
                    maxTagCount={
                      medication.frequency
                        ? medication.frequency
                            .split("-")
                            .filter((x) => x === "1").length
                        : 3
                    }
                  >
                    {timingOptions.map((option) => (
                      <Option key={option} value={option}>
                        {option}
                      </Option>
                    ))}
                  </Select>
                  {errors[medication.id]?.timings && (
                    <div
                      className="error"
                      style={{ color: "red", fontSize: "12px" }}
                    >
                      {errors[medication.id].timings}
                    </div>
                  )}
                </div>
              </div>

              <div className="note-box" style={{ marginTop: "12px" }}>
                <div className="note-header">Notes for this medication:</div>
                <textarea
                  className="note-textarea"
                  placeholder="Enter specific notes for this medication..."
                  value={medication.notes || ""}
                  onChange={(e) => {
                    const updatedMedications = localData.medications.map(
                      (med) => {
                        if (med.id === medication.id) {
                          return { ...med, notes: e.target.value };
                        }
                        return med;
                      }
                    );
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

 <Modal
   title="Previous Prescriptions"
   open={isPrevModalOpen}
   onCancel={() => setIsPrevModalOpen(false)}
   footer={null}
   width={720}
   destroyOnClose
 >
   <List
     itemLayout="vertical"
     dataSource={prevList}
     renderItem={(item, index) => {
       const meds = Array.isArray(item?.medications) ? item.medications : [];
       const createdAt = item?.createdAt ? new Date(item.createdAt) : null;
       const subtitle = createdAt
         ? `${createdAt.toLocaleDateString()} ${createdAt.toLocaleTimeString()}`
         : `Prescription #${prevList.length - index}`;
       return (
         <List.Item
           actions={[
             <Button
               key="use"
               type="primary"
               onClick={() => applyPreviousPrescription(item)}
             >
               Use this prescription
             </Button>,
           ]}
         >
           <List.Item.Meta
             title={subtitle}
             description={`${meds.length} medicine${meds.length === 1 ? "" : "s"}`}
           />
           <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
             {meds.slice(0, 6).map((m, i) => (
               <span
                 key={i}
                 style={{
                   fontSize: 12,
                   background: "#f3f4f6",
                   borderRadius: 6,
                   padding: "2px 8px",
                 }}
               >
                 {m?.medName}{m?.dosage ? ` ${m.dosage}` : ""}
               </span>
             ))}
             {meds.length > 6 && (
               <span style={{ fontSize: 12, color: "#6b7280" }}>
                 +{meds.length - 6} more
               </span>
             )}
           </div>
         </List.Item>
       );
     }}
   />
</Modal>


         <div
          style={{
             marginTop: "16px",
             display: "flex",
             justifyContent: "flex-end",
             gap: "8px",
           }}
         >
           <Button
             onClick={fetchPreviousPrescription}
             loading={loadingPrev}
           >
            Copy Previous Prescription
          </Button>
          <Button
            type="primary"
            onClick={addMedication}
            icon={<Plus style={{ width: "16px", height: "16px" }} />}
          >
            Add Medicine
          </Button>
        </div>

        
      </div>
    </div>
  );
};

export default DiagnosisMedication;
