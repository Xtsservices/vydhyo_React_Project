import React, { useState, useEffect } from "react";
import { apiGet, apiPost } from "../../api";
import { useSelector } from "react-redux";
import DownloadTaxInvoice from "../../Models/DownloadTaxInvoice";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const BillingSystem = () => {
  const [patients, setPatients] = useState([]);
  const [expandedPatients, setExpandedPatients] = useState({});
  const [billingCompleted, setBillingCompleted] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = useSelector((state) => state.currentUserData);
  const doctorId = user?.role === "doctor" ? user?.userId : user?.createdBy;

  // Fetch patient data from API
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await apiGet(
          `/receptionist/fetchMyDoctorPatients/${doctorId}`
        );
        if (response.status === 200 && response?.data?.data) {
          const result = response.data.data;
          // Transform API data to match component structure
          const transformedData = result.map((patient, index) => ({
            id: index + 1,
            patientId: patient.patientId,
            name: `${patient.firstname} ${patient.lastname}`.trim(),
            firstname: patient.firstname,
            lastname: patient.lastname,
            DOB: patient.DOB,
            gender: patient.gender,
            mobile: patient.mobile || "Not Provided", // Fallback for missing mobile
            bloodgroup: patient.bloodgroup || "Not Specified",
            tests: patient.tests.map((test, idx) => ({
              id: `T${index}${idx}`, // Kept for internal use, not displayed
              testId: test.testId, // MongoDB _id
              labTestID: test.labTestID,
              name: test.testName,
              price: test.price || 0,
              status:
                test.status.charAt(0).toUpperCase() + test.status.slice(1),
              createdDate: new Date(test.createdAt).toLocaleDateString(),
            })),
            medicines: patient.medicines.map((med, idx) => ({
              id: `M${index}${idx}`, // Kept for internal use, not displayed
              medicineId: med.medicineId, // MongoDB _id
              pharmacyMedID: med.pharmacyMedID,
              name: med.medName,
              quantity: med.quantity || 1,
              price: med.price || 0,
              status: med.status.charAt(0).toUpperCase() + med.status.slice(1),
            })),
          }));
          setPatients(transformedData);
          setLoading(false);
        } else {
          throw new Error("API response unsuccessful");
        }
      } catch (err) {
        setError("Failed to fetch patient data");
        setLoading(false);
      }
    };
    if (user && doctorId) {
      fetchPatients();
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
    // const testTotal = patient.tests.reduce(
    //   (sum, test) => sum + (test.status === "Completed" && test.price ? test.price : 0),
    //   0
    // );
    const testTotal = patient.tests.reduce(
      (sum, test) =>
        sum + (test.status === "Pending" && test.price ? test.price : 0),
      0
    );
    const grandTotal = medicineTotal + testTotal;
    return { medicineTotal, testTotal, grandTotal };
  };

  // const handleMarkAsPaid = (patientId) => {
  //   setBillingCompleted((prev) => ({ ...prev, [patientId]: true }));
  // };

  const handleMarkAsPaid = async (patientId) => {
    const patient = patients.find((p) => p.id === patientId);
    if (!patient) return;

    // Check if there are any Pending tests or medicines
    const pendingTests = patient.tests.filter(
      (test) => test.status === "Pending"
    );
    const pendingMedicines = patient.medicines.filter(
      (med) => med.status === "Pending"
    );

    if (pendingTests.length === 0 && pendingMedicines.length === 0) {
      setError("No pending tests or medicines to pay for.");
      return;
    }

    // Construct the payload
    const payload = {
      patientId: patient.patientId,
      doctorId: doctorId,
      tests: pendingTests
        .filter((test) => test.price > 0) // ✅ Only include tests with price > 0
        .map((test) => ({
          testId: test.testId, // MongoDB _id
          labTestID: test.labTestID,
          status: "pending",
          price: test.price,
        })),
      medicines: pendingMedicines
       .filter((test) => test.price > 0)
       .map((med) => ({
        medicineId: med.medicineId, // MongoDB _id
        pharmacyMedID: med.pharmacyMedID,
        quantity: med.quantity,
        status: "pending",
        price: med.price,
      })),
    };
    //validate atleast one test or one medicine
    if (payload?.medicines?.length === 0 && payload?.tests?.length === 0) {
      toast.error("at least one of tests or medicines is provided");
    }

    try {
      // Send POST request to the API
      const response = await apiPost(
        "/receptionist/totalBillPayFromReception",
        payload
      );
      if (response.status === 200) {
        // Update patient data to mark Pending items as Completed
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
        // Mark billing as completed
        setBillingCompleted((prev) => ({ ...prev, [patientId]: true }));
      } else {
        throw new Error("Failed to process payment");
      }
    } catch (err) {
      console.error("Error processing payment:", err);
      setError("Failed to process payment. Please try again.");
    }
  };

  if (loading)
    return (
      <div style={{ textAlign: "center", padding: "20px" }}>Loading...</div>
    );
  if (error)
    return (
      <div style={{ textAlign: "center", padding: "20px", color: "red" }}>
        {error}
      </div>
    );

  console.log("patients====", patients);
  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        padding: "20px",
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
                  borderBottom: "2px solid #ddd",
                  fontWeight: "bold",
                }}
              >
                DOB
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
              <th
                style={{
                  padding: "12px 15px",
                  textAlign: "left",
                  borderBottom: "2px solid #ddd",
                  fontWeight: "bold",
                }}
              >
                Blood Group
              </th>
            </tr>
          </thead>
          <tbody>
            {patients.map((patient) => {
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
                    <td style={{ padding: "12px 15px" }}>{patient.patientId}</td>
                    <td style={{ padding: "12px 15px", fontWeight: "500" }}>
                      {patient.name}
                    </td>
                    <td style={{ padding: "12px 15px" }}>{patient.mobile}</td>
                    <td style={{ padding: "12px 15px" }}>{patient.DOB}</td>
                    <td style={{ padding: "12px 15px" }}>{patient.gender}</td>
                    <td style={{ padding: "12px 15px" }}>{patient.bloodgroup}</td>
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
                                <strong>DOB:</strong> {patient.DOB}
                              </p>
                              <p style={{ margin: "5px 0" }}>
                                <strong>Gender:</strong> {patient.gender}
                              </p>
                              <p style={{ margin: "5px 0" }}>
                                <strong>Mobile:</strong> {patient.mobile}
                              </p>
                              <p style={{ margin: "5px 0" }}>
                                <strong>Blood Group:</strong> {patient.bloodgroup}
                              </p>
                            </div>
                          </div>

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
                              <h4 style={{ margin: "0 0 15px 0", color: "#333" }}>
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
                                style={{ textAlign: "right", marginTop: "10px" }}
                              >
                                <strong>
                                  Medicine Total: ₹
                                  {totals.medicineTotal.toFixed(2)}
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
                                Test Total: ₹
                                {totals.testTotal.toFixed(2)}
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
                              Grand Total: ₹
                              {totals.grandTotal.toFixed(2)}
                            </div>
                            <div>
                              <DownloadTaxInvoice
                                patient={patient}
                                // disabled={!billingCompleted[patient.id]}
                              />
                              <button
                                onClick={() => handleMarkAsPaid(patient.id)}
                                style={{
                                  background: "#28a745",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "4px",
                                  padding: "10px 20px",
                                  cursor: totals.grandTotal > 0 ? "pointer" : "not-allowed",
                                  fontSize: "16px",
                                  fontWeight: "bold",
                                  marginLeft: "10px",
                                  opacity: totals.grandTotal > 0 ? 1 : 0.6,
                                }}
                                disabled={totals.grandTotal <= 0}
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
