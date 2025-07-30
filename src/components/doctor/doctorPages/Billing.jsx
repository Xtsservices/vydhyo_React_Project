import React, { useState, useEffect, useMemo, useRef } from "react";
import { apiGet, apiPost } from "../../api";
import { useSelector } from "react-redux";
import DownloadTaxInvoice from "../../Models/DownloadTaxInvoice";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Utility function to calculate age from DOB
const calculateAge = (dob) => {
  if (!dob) return "N/A";
  try {
    const [day, month, year] = dob.split("-").map(Number);
    const dobDate = new Date(year, month - 1, day);
    const today = new Date(2025, 6, 17); // July 17, 2025
    let age = today.getFullYear() - dobDate.getFullYear();
    const monthDiff = today.getMonth() - dobDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < dobDate.getDate())
    ) {
      age--;
    }
    return age >= 0 ? age : "N/A";
  } catch (err) {
    console.error("Error calculating age:", err);
    return "N/A";
  }
};

// Utility function to transform patient data
const transformPatientData = (result, user) => {
  if (!user || !result) return [];
  return result.map((patient, index) => {
    const appointments = Array.isArray(patient.appointments)
      ? patient.appointments
      : [];
    const tests = Array.isArray(patient.tests) ? patient.tests : [];
    const medicines = Array.isArray(patient.medicines) ? patient.medicines : [];

    const appointmentDetails = appointments.map((appointment, idx) => ({
      id: `A${index}${idx}`,
      appointmentId: appointment.appointmentId,
      appointmentType: appointment.appointmentType,
      appointmentFees: appointment?.feeDetails?.finalAmount || 0,
      addressId: appointment.addressId,
      clinicName: appointment.addressId
        ? user?.addresses?.find((addr) => addr.addressId === appointment.addressId)
            ?.clinicName || "N/A"
        : "N/A",
    }));

    const totalTestAmount = tests.reduce(
      (sum, test) => sum + (test?.price || 0),
      0
    );
    const totalMedicineAmount = medicines.reduce(
      (sum, med) => sum + (med?.price * med?.quantity || 0),
      0
    );
    const totalAppointmentFees = appointmentDetails.reduce(
      (sum, appt) => sum + (appt?.appointmentFees || 0),
      0
    );

    return {
      id: index + 1,
      patientId: patient.patientId,
      name: `${patient.firstname} ${patient.lastname}`.trim(),
      firstname: patient.firstname,
      lastname: patient.lastname,
      age: calculateAge(patient.DOB),
      gender: patient.gender,
      mobile: patient.mobile || "Not Provided",
      bloodgroup: patient.bloodgroup || "Not Specified",
      appointmentDetails,
      tests: tests.map((test, idx) => ({
        id: `T${index}${idx}`,
        testId: test.testId,
        labTestID: test.labTestID,
        name: test.testName,
        price: test?.price || 0,
        status:
          test.status?.charAt(0).toUpperCase() + test.status?.slice(1) ||
          "Unknown",
        createdDate: test.createdAt
          ? new Date(test.createdAt).toLocaleDateString()
          : "N/A",
      })),
      medicines: medicines.map((med, idx) => ({
        id: `M${index}${idx}`,
        medicineId: med.medicineId,
        pharmacyMedID: med.pharmacyMedID,
        name: med.medName,
        quantity: med.quantity || 1,
        price: med.price || 0,
        status:
          med.status?.charAt(0).toUpperCase() + med.status?.slice(1) ||
          "Unknown",
      })),
      totalTestAmount,
      totalMedicineAmount,
      totalAppointmentFees,
      grandTotal: totalTestAmount + totalMedicineAmount + totalAppointmentFees,
    };
  });
};

const BillingSystem = () => {
  const hasfetchPatients = useRef(false)
  
  const [patients, setPatients] = useState([]);
  const [expandedPatients, setExpandedPatients] = useState({});
  const [billingCompleted, setBillingCompleted] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  const user = useSelector((state) => state.currentUserData);
  const doctorId = user?.role === "doctor" ? user?.userId : user?.createdBy;

  // Memoize transformed patient data to avoid redundant calculations
  const transformedPatients = useMemo(() => {
    console.log("Computing transformedPatients", { patients, user });
    return transformPatientData(patients, user);
  }, [patients, user]);

  // Fetch patient data with retry mechanism
  const fetchPatients = async () => {
    if (!user || !doctorId) {
      console.log("User or doctorId not available:", { user, doctorId });
      setError("User or doctor ID not available");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiGet(
        `/receptionist/fetchMyDoctorPatients/${doctorId}`,
         { timeout: 10000 }
      );
      console.log("API Response:", response);

      if (response.status === 200 && response?.data?.data) {
        setPatients(response.data.data.reverse());
        console.log("Patients set:", response.data.data.reverse());
        setLoading(false);
      } else {
        throw new Error("API response unsuccessful");
      }
    } catch (err) {
      console.error("Error fetching patients:", err);
      if (retryCount < maxRetries) {
        setRetryCount(retryCount + 1);
        setTimeout(() => fetchPatients(), 2000); // Retry after 2 seconds
      } else {
        setError(
          `Failed to fetch patient data: ${
            err.message || "Unknown error"
          }. Please try again later.`
        );
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    console.log("useEffect triggered - user:", user, "doctorId:", doctorId);
    if (user && doctorId && !hasfetchPatients.current) {
      hasfetchPatients.current = true
      fetchPatients();
    } else {
      setLoading(false);
      setError("Waiting for user data to load...");
    }
  }, [user, doctorId]);

  const handlePatientExpand = (patientId) => {
    setExpandedPatients((prev) => ({
      ...prev,
      [patientId]: !prev[patientId],
    }));
  };

  const calculateTotals = (patient) => {
    const medicineTotal = patient.medicines.reduce(
      (sum, med) =>
        sum +
        (med.status === "Pending" && med.price ? med.quantity * med.price : 0),
      0
    );
    const testTotal = patient.tests.reduce(
      (sum, test) =>
        sum + (test.status === "Pending" && test.price ? test.price : 0),
      0
    );
    const grandTotal = medicineTotal + testTotal;
    return { medicineTotal, testTotal, grandTotal };
  };

  const handleMarkAsPaid = async (patientId) => {
    const patient = transformedPatients.find((p) => p.id === patientId);
    if (!patient) return;

    const pendingTests = patient.tests.filter(
      (test) => test.status === "Pending"
    );
    const pendingMedicines = patient.medicines.filter(
      (med) => med.status === "Pending"
    );

    if (pendingTests.length === 0 && pendingMedicines.length === 0) {
      toast.error("No pending tests or medicines to pay for.");
      return;
    }

    const payload = {
      patientId: patient.patientId,
      doctorId: doctorId,
      tests: pendingTests
        .filter((test) => test.price > 0)
        .map((test) => ({
          testId: test.testId,
          labTestID: test.labTestID,
          status: "pending",
          price: test.price,
        })),
      medicines: pendingMedicines
        .filter((med) => med.price > 0)
        .map((med) => ({
          medicineId: med.medicineId,
          pharmacyMedID: med.pharmacyMedID,
          quantity: med.quantity,
          status: "pending",
          price: med.price,
        })),
    };

    if (payload.medicines.length === 0 && payload.tests.length === 0) {
      toast.error("At least one test or medicine must be provided.");
      return;
    }

    try {
      const response = await apiPost(
        "/receptionist/totalBillPayFromReception",
        payload
      );
      if (response.status === 200) {
        setPatients((prevPatients) =>
          prevPatients.map((p) =>
            p.id === patientId
              ? {
                  ...p,
                  tests: p.tests.map((test) =>
                    test.status === "Pending"
                      ? { ...test, status: "Completed" }
                      : test
                  ),
                  medicines: p.medicines.map((med) =>
                    med.status === "Pending"
                      ? { ...med, status: "Completed" }
                      : med
                  ),
                }
              : p
          )
        );
        setBillingCompleted((prev) => ({ ...prev, [patientId]: true }));
        toast.success("Payment processed successfully!");
      } else {
        throw new Error("Failed to process payment");
      }
    } catch (err) {
      console.error("Error processing payment:", err);
      toast.error("Failed to process payment. Please try again.");
    }
  };

  if (loading) {
    return (
      <div
        style={{
          fontFamily: "Arial, sans-serif",
          padding: "20px",
          backgroundColor: "#f5f5f5",
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            backgroundColor: "white",
            borderRadius: "8px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            padding: "30px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              border: "4px solid #007bff",
              borderRadius: "50%",
              width: "40px",
              height: "40px",
              borderTopColor: "transparent",
              animation: "spin 1s linear infinite",
              margin: "0 auto 20px",
            }}
          />
          <p style={{ fontSize: "18px", color: "#666" }}>Loading patients...</p>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          fontFamily: "Arial, sans-serif",
          padding: "20px",
          backgroundColor: "#f5f5f5",
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            backgroundColor: "white",
            borderRadius: "8px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            padding: "30px",
            textAlign: "center",
          }}
        >
          <h1
            style={{
              color: "#333",
              marginBottom: "30px",
              fontSize: "28px",
              fontWeight: "bold",
            }}
          >
            Patient Billing System
          </h1>
          <p style={{ fontSize: "18px", color: "#721c24", marginBottom: "20px" }}>
            {error}
          </p>
          <button
            onClick={() => {
              setRetryCount(0);
              fetchPatients();
            }}
            style={{
              background: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              padding: "10px 20px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "bold",
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!user || !doctorId) {
    return (
      <div
        style={{
          fontFamily: "Arial, sans-serif",
          padding: "20px",
          backgroundColor: "#f5f5f5",
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            backgroundColor: "white",
            borderRadius: "8px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            padding: "30px",
            textAlign: "center",
          }}
        >
          <h1
            style={{
              color: "#333",
              marginBottom: "30px",
              fontSize: "28px",
              fontWeight: "bold",
            }}
          >
            Patient Billing System
          </h1>
          <p style={{ fontSize: "18px", color: "#666" }}>
            Waiting for user data to load...
          </p>
        </div>
      </div>
    );
  }

  if (transformedPatients.length === 0) {
    return (
      <div
        style={{
          fontFamily: "Arial, sans-serif",
          padding: "20px",
          backgroundColor: "#f5f5f5",
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            backgroundColor: "white",
            borderRadius: "8px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            padding: "30px",
            textAlign: "center",
          }}
        >
          <h1
            style={{
              color: "#333",
              marginBottom: "30px",
              fontSize: "28px",
              fontWeight: "bold",
            }}
          >
            Patient Billing System
          </h1>
          <p style={{ fontSize: "18px", color: "#666" }}>
            No patients found for this doctor.
          </p>
          <button
            onClick={() => {
              setRetryCount(0);
              fetchPatients();
            }}
            style={{
              background: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              padding: "10px 20px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "bold",
              marginTop: "20px",
            }}
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        padding: "_year",
        backgroundColor: "#f5f5f5",
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          backgroundColor: "white",
          borderRadius: "8px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          padding: "30px",
        }}
      >
        <h1
          style={{
            color: "#333",
            marginBottom: "30px",
            textAlign: "center",
            fontSize: "28px",
            fontWeight: "bold",
          }}
        >
          Patient Billing System
        </h1>

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginBottom: "20px",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#f8f9fa" }}>
              <th
                style={{
                  padding: "12px 15px",
                  textAlign: "left",
                  borderBottom: "2px solid #ddd",
                  fontWeight: "bold",
                }}
              ></th>
              <th
                style={{
                  padding: "12px 15px",
                  textAlign: "left",
                  borderBottom: "2px solid #ddd",
                  fontWeight: "bold",
                }}
              >
                Patient ID
              </th>
              <th
                style={{
                  padding: "12px 15px",
                  textAlign: "left",
                  borderBottom: "2px solid #ddd",
                  fontWeight: "bold",
                }}
              >
                Patient Name
              </th>
              <th
                style={{
                  padding: "12px 15px",
                  textAlign: "left",
                  borderBottom: "2px solid #ddd",
                  fontWeight: "bold",
                }}
              >
                Mobile
              </th>
              <th
                style={{
                  padding: "12px 15px",
                  textAlign: "left",
                  // block,
                  borderBottom: "2px solid #ddd",
                  fontWeight: "bold",
                }}
              >
                Age
              </th>
              <th
                style={{
                  padding: "12px 15px",
                  textAlign: "left",
                  borderBottom: "2px solid #ddd",
                  fontWeight: "bold",
                }}
              >
                Gender
              </th>
            </tr>
          </thead>
          <tbody>
            {transformedPatients.map((patient) => {
              const totals = calculateTotals(patient);
              return (
                <React.Fragment key={patient.id}>
                  <tr
                    style={{
                      borderBottom: "1px solid #eee",
                      backgroundColor: expandedPatients[patient.id]
                        ? "#f0f8ff"
                        : "white",
                    }}
                  >
                    <td style={{ padding: "12px 15px" }}>
                      <button
                        onClick={() => handlePatientExpand(patient.id)}
                        style={{
                          background: "#007bff",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          padding: "8px 12px",
                          cursor: "pointer",
                          fontSize: "14px",
                          fontWeight: "bold",
                        }}
                      >
                        {expandedPatients[patient.id] ? "−" : "+"}
                      </button>
                    </td>
                    <td style={{ padding: "12px 15px" }}>
                      {patient.patientId}
                    </td>
                    <td style={{ padding: "12px 15px", fontWeight: "500" }}>
                      {patient.name}
                    </td>
                    <td style={{ padding: "12px 15px" }}>{patient.mobile}</td>
                    <td style={{ padding: "12px 15px" }}>{patient.age}</td>
                    <td style={{ padding: "12px 15px" }}>{patient.gender}</td>
                  </tr>

                  {expandedPatients[patient.id] && (
                    <tr>
                      <td colSpan="7" style={{ padding: "0" }}>
                        <div
                          style={{
                            backgroundColor: "#f8f9fa",
                            padding: "20px",
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                            margin: "10px",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              marginBottom: "20px",
                            }}
                          >
                            <h3
                              style={{
                                margin: "0",
                                color: "#333",
                                fontSize: "20px",
                              }}
                            >
                              Patient Details
                            </h3>
                            <button
                              onClick={() => handlePatientExpand(patient.id)}
                              style={{
                                background: "none",
                                border: "none",
                                fontSize: "18px",
                                cursor: "pointer",
                                color: "#666",
                              }}
                            >
                              ✕
                            </button>
                          </div>

                          {/* Patient Info */}
                          <div
                            style={{
                              backgroundColor: "white",
                              padding: "15px",
                              borderRadius: "4px",
                              marginBottom: "20px",
                              border: "1px solid #ddd",
                            }}
                          >
                            <h4 style={{ margin: "0 0 10px 0", color: "#333" }}>
                              Patient Information
                            </h4>
                            <div
                              style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr",
                                gap: "10px",
                              }}
                            >
                              <p style={{ margin: "5px 0" }}>
                                <strong>Patient ID:</strong> {patient.patientId}
                              </p>
                              <p style={{ margin: "5px 0" }}>
                                <strong>First Name:</strong> {patient.firstname}
                              </p>
                              <p style={{ margin: "5px 0" }}>
                                <strong>Last Name:</strong> {patient.lastname}
                              </p>
                              <p style={{ margin: "5px 0" }}>
                                <strong>Age:</strong> {patient.age}
                              </p>
                              <p style={{ margin: "5px 0" }}>
                                <strong>Gender:</strong> {patient.gender}
                              </p>
                              <p style={{ margin: "5px 0" }}>
                                <strong>Mobile:</strong> {patient.mobile}
                              </p>
                            </div>
                          </div>

                          {/* Appointment Details Section */}
                          {patient.appointmentDetails.length > 0 && (
                            <div
                              style={{
                                backgroundColor: "white",
                                padding: "15px",
                                borderRadius: "4px",
                                marginBottom: "20px",
                                border: "1px solid #ddd",
                              }}
                            >
                              <h4
                                style={{ margin: "0 0 15px 0", color: "#333" }}
                              >
                                Appointment Details
                              </h4>
                              <table
                                style={{
                                  width: "100%",
                                  borderCollapse: "collapse",
                                }}
                              >
                                <thead>
                                  <tr>
                                    <th
                                      style={{
                                        padding: "12px 15px",
                                        borderBottom: "1px solid #ddd",
                                        textAlign: "left",
                                      }}
                                    >
                                      AppointmentId
                                    </th>
                                    <th
                                      style={{
                                        padding: "12px 15px",
                                        borderBottom: "1px solid #ddd",
                                        textAlign: "left",
                                      }}
                                    >
                                      Appointment Type
                                    </th>
                                    <th
                                      style={{
                                        padding: "12px 15px",
                                        borderBottom: "1px solid #ddd",
                                        textAlign: "left",
                                      }}
                                    >
                                      Clinic Name
                                    </th>
                                    <th
                                      style={{
                                        padding: "12px 15px",
                                        borderBottom: "1px solid #ddd",
                                        textAlign: "left",
                                      }}
                                    >
                                      Price (₹)
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {patient.appointmentDetails.map(
                                    (appointment, index) => (
                                      <tr key={index}>
                                        <td style={{ padding: "12px 15px" }}>
                                          {appointment.appointmentId}
                                        </td>
                                        <td style={{ padding: "12px 15px" }}>
                                          {appointment.appointmentType}
                                        </td>
                                        <td style={{ padding: "12px 15px" }}>
                                          {appointment.clinicName}
                                        </td>
                                        <td style={{ padding: "12px 15px" }}>
                                          {appointment.appointmentFees}
                                        </td>
                                      </tr>
                                    )
                                  )}
                                </tbody>
                              </table>
                            </div>
                          )}
                          {/* Medicines Section */}
                          {patient.medicines.length > 0 && (
                            <div
                              style={{
                                backgroundColor: "white",
                                padding: "15px",
                                borderRadius: "4px",
                                marginBottom: "20px",
                                border: "1px solid #ddd",
                              }}
                            >
                              <h4
                                style={{ margin: "0 0 15px 0", color: "#333" }}
                              >
                                Medicines Prescribed
                              </h4>
                              <table
                                style={{
                                  width: "100%",
                                  borderCollapse: "collapse",
                                }}
                              >
                                <thead>
                                  <tr style={{ backgroundColor: "#f8f9fa" }}>
                                    <th
                                      style={{
                                        padding: "10px",
                                        textAlign: "left",
                                        borderBottom: "1px solid #ddd",
                                      }}
                                    >
                                      Medicine Name
                                    </th>
                                    <th
                                      style={{
                                        padding: "10px",
                                        textAlign: "left",
                                        borderBottom: "1px solid #ddd",
                                      }}
                                    >
                                      Quantity
                                    </th>
                                    <th
                                      style={{
                                        padding: "10px",
                                        textAlign: "right",
                                        borderBottom: "1px solid #ddd",
                                      }}
                                    >
                                      Price (₹)
                                    </th>
                                    <th
                                      style={{
                                        padding: "10px",
                                        textAlign: "center",
                                        borderBottom: "1px solid #ddd",
                                      }}
                                    >
                                      Status
                                    </th>
                                    <th
                                      style={{
                                        padding: "10px",
                                        textAlign: "right",
                                        borderBottom: "1px solid #ddd",
                                      }}
                                    >
                                      Subtotal (₹)
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {patient.medicines.map((medicine) => (
                                    <tr key={medicine.id}>
                                      <td
                                        style={{
                                          padding: "10px",
                                          borderBottom: "1px solid #eee",
                                        }}
                                      >
                                        {medicine.name}
                                      </td>
                                      <td
                                        style={{
                                          padding: "10px",
                                          borderBottom: "1px solid #eee",
                                        }}
                                      >
                                        {medicine.quantity}
                                      </td>
                                      <td
                                        style={{
                                          padding: "10px",
                                          borderBottom: "1px solid #eee",
                                          textAlign: "right",
                                        }}
                                      >
                                        {medicine.price
                                          ? medicine.price.toFixed(2)
                                          : "N/A"}
                                      </td>
                                      <td
                                        style={{
                                          padding: "10px",
                                          borderBottom: "1px solid #eee",
                                          textAlign: "center",
                                        }}
                                      >
                                        <span
                                          style={{
                                            padding: "4px 8px",
                                            borderRadius: "12px",
                                            fontSize: "12px",
                                            fontWeight: "bold",
                                            backgroundColor:
                                              medicine.status === "Pending"
                                                ? "#fff3cd"
                                                : "#d4edda",
                                            color:
                                              medicine.status === "Pending"
                                                ? "#856404"
                                                : "#155724",
                                          }}
                                        >
                                          {medicine.status}
                                        </span>
                                      </td>
                                      <td
                                        style={{
                                          padding: "10px",
                                          borderBottom: "1px solid #eee",
                                          textAlign: "right",
                                        }}
                                      >
                                        {medicine.price
                                          ? (
                                              medicine.quantity * medicine.price
                                            ).toFixed(2)
                                          : "N/A"}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                              <div
                                style={{
                                  textAlign: "right",
                                  marginTop: "10px",
                                }}
                              >
                                <strong>
                                  Medicine Total: ₹
                                  {patient.totalMedicineAmount.toFixed(2)}
                                </strong>
                              </div>
                            </div>
                          )}

                          {/* Tests Section */}
                          <div
                            style={{
                              backgroundColor: "white",
                              padding: "15px",
                              borderRadius: "4px",
                              marginBottom: "20px",
                              border: "1px solid #ddd",
                            }}
                          >
                            <h4 style={{ margin: "0 0 15px 0", color: "#333" }}>
                              Tests Conducted
                            </h4>
                            <table
                              style={{
                                width: "100%",
                                borderCollapse: "collapse",
                              }}
                            >
                              <thead>
                                <tr style={{ backgroundColor: "#f8f9fa" }}>
                                  <th
                                    style={{
                                      padding: "10px",
                                      textAlign: "left",
                                      borderBottom: "1px solid #ddd",
                                    }}
                                  >
                                    Test Name
                                  </th>
                                  <th
                                    style={{
                                      padding: "10px",
                                      textAlign: "right",
                                      borderBottom: "1px solid #ddd",
                                    }}
                                  >
                                    Price (₹)
                                  </th>
                                  <th
                                    style={{
                                      padding: "10px",
                                      textAlign: "center",
                                      borderBottom: "1px solid #ddd",
                                    }}
                                  >
                                    Status
                                  </th>
                                  <th
                                    style={{
                                      padding: "10px",
                                      textAlign: "left",
                                      borderBottom: "1px solid #ddd",
                                    }}
                                  >
                                    Created Date
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {patient.tests.length > 0 ? (
                                  patient.tests.map((test) => (
                                    <tr key={test.id}>
                                      <td
                                        style={{
                                          padding: "10px",
                                          borderBottom: "1px solid #eee",
                                        }}
                                      >
                                        {test.name}
                                      </td>
                                      <td
                                        style={{
                                          padding: "10px",
                                          borderBottom: "1px solid #eee",
                                          textAlign: "right",
                                        }}
                                      >
                                        {test.price
                                          ? test.price.toFixed(2)
                                          : "N/A"}
                                      </td>
                                      <td
                                        style={{
                                          padding: "10px",
                                          borderBottom: "1px solid #eee",
                                          textAlign: "center",
                                        }}
                                      >
                                        <span
                                          style={{
                                            padding: "4px 8px",
                                            borderRadius: "12px",
                                            fontSize: "12px",
                                            fontWeight: "bold",
                                            backgroundColor:
                                              test.status === "Completed"
                                                ? "#d4edda"
                                                : test.status === "Pending"
                                                ? "#fff3cd"
                                                : "#f8d7da",
                                            color:
                                              test.status === "Completed"
                                                ? "#155724"
                                                : test.status === "Pending"
                                                ? "#856404"
                                                : "#721c24",
                                          }}
                                        >
                                          {test.status}
                                        </span>
                                      </td>
                                      <td
                                        style={{
                                          padding: "10px",
                                          borderBottom: "1px solid #eee",
                                        }}
                                      >
                                        {test.createdDate}
                                      </td>
                                    </tr>
                                  ))
                                ) : (
                                  <tr>
                                    <td
                                      colSpan="4"
                                      style={{
                                        padding: "10px",
                                        textAlign: "center",
                                      }}
                                    >
                                      No tests conducted
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                            <div
                              style={{ textAlign: "right", marginTop: "10px" }}
                            >
                              <strong>
                                Test Total: ₹{" "}
                                {patient.totalTestAmount.toFixed(2)}
                              </strong>
                            </div>
                          </div>

                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              backgroundColor: "#e9ecef",
                              padding: "15px",
                              borderRadius: "4px",
                            }}
                          >
                            <div
                              style={{
                                fontSize: "18px",
                                fontWeight: "bold",
                                color: "#333",
                              }}
                            >
                              Grand Total: ₹{patient.grandTotal.toFixed(2)}
                            </div>
                            <div>
                              <DownloadTaxInvoice patient={patient} user={user} />
                              <button
                                onClick={() => handleMarkAsPaid(patient.id)}
                                style={{
                                  background: "#28a745",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "4px",
                                  padding: "10px 20px",
                                  cursor:
                                    totals.grandTotal > 0
                                      ? "pointer"
                                      : "not-allowed",
                                  fontSize: "16px",
                                  fontWeight: "bold",
                                  marginLeft: "10px",
                                  opacity: totals.grandTotal > 0 ? 1 : 0.6,
                                }}
                                disabled={totals.grandTotal <= 0}
                                onMouseOver={(e) => {
                                  if (totals.grandTotal <= 0) {
                                    toast.info(
                                      "No pending payments available for this patient."
                                    );
                                  }
                                }}
                              >
                                Pay
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BillingSystem;