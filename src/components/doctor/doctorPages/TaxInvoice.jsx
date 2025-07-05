import React, { useState } from "react";

const BillingSystem = () => {
  const [expandedPatients, setExpandedPatients] = useState({});
  const [billingCompleted, setBillingCompleted] = useState({});

  // Sample patient data with tests
  const patients = [
    {
      id: 1,
      patientId: "VYDUSER162",
      name: "sriya annam",
      age: 35,
      gender: "Male",
      mobile: "+1 (555) 987-6543",
      appointmentDate: "01/07/2025",
      appointmentTime: "11:43 AM",
      medicines: [
        { id: "M001", name: "Paracetamol", quantity: 2, price: 25.0 },
        { id: "M002", name: "Amoxicillin", quantity: 1, price: 80.0 },
      ],
      tests: [
        {
          id: "T101",
          name: "urine-test",
          price: 400.0,
          status: "Completed",
          createdDate: "Jul 5, 2025",
        },
        {
          id: "T102",
          name: "blood-test",
          price: 300.0,
          status: "Pending",
          createdDate: "Jul 5, 2025",
        },
      ],
    },
    {
      id: 2,
      patientId: "VYDUSER165",
      name: "subba raj",
      age: 28,
      gender: "Female",
      mobile: "+1 (555) 234-5678",
      appointmentDate: "01/07/2025",
      appointmentTime: "10:30 AM",
      medicines: [
        { id: "M003", name: "Ibuprofen", quantity: 1, price: 45.0 },
        { id: "M004", name: "Vitamin D", quantity: 1, price: 120.0 },
      ],
      tests: [
        {
          id: "T103",
          name: "ECG",
          price: 180.0,
          status: "Completed",
          createdDate: "Jul 5, 2025",
        },
      ],
    },
    {
      id: 3,
      patientId: "VYDUSER167",
      name: "Michael Brown",
      age: 42,
      gender: "Male",
      mobile: "+1 (555) 345-6789",
      appointmentDate: "01/07/2025",
      appointmentTime: "09:15 AM",
      medicines: [{ id: "M005", name: "Aspirin", quantity: 3, price: 20.0 }],
      tests: [
        {
          id: "T104",
          name: "Ultrasound",
          price: 250.0,
          status: "Completed",
          createdDate: "Jul 5, 2025",
        },
        {
          id: "T105",
          name: "MRI Scan",
          price: 800.0,
          status: "Pending",
          createdDate: "Jul 5, 2025",
        },
      ],
    },
  ];

  const handlePatientExpand = (patientId) => {
    setExpandedPatients((prev) => ({
      ...prev,
      [patientId]: !prev[patientId],
    }));
  };

  const calculateTotals = (patient) => {
    const medicineTotal = patient.medicines.reduce(
      (sum, med) => sum + med.quantity * med.price,
      0
    );
    const testTotal = patient.tests.reduce((sum, test) => sum + test.price, 0);
    const grandTotal = medicineTotal + testTotal;
    return { medicineTotal, testTotal, grandTotal };
  };

  const handleMarkAsPaid = (patientId) => {
    setBillingCompleted((prev) => ({ ...prev, [patientId]: true }));
  };

  const handlePrintInvoice = (patient) => {
    const totals = calculateTotals(patient);
    const invoiceNumber = `INV-${String(patient.id).padStart(3, "0")}`;

    const invoiceData = {
      ...patient,
      invoiceNumber,
      totals,
      billingDate: new Date().toLocaleDateString(),
      billingTime: new Date().toLocaleTimeString(),
    };

    // Create print content
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Tax Invoice</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
              background: white;
            }
            .invoice-container {
              max-width: 800px;
              margin: 0 auto;
              background: white;
            }
            .invoice-title-section {
              text-align: center;
              margin-bottom: 30px;
            }
            .main-invoice-title {
              font-size: 32px;
              font-weight: bold;
              color: #333;
              margin: 0;
            }
            .invoice-header-section {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              margin-bottom: 30px;
              padding-bottom: 20px;
              border-bottom: 2px solid #eee;
            }
            .vydhyo-logo {
              width: 150px;
              height: 64px;
              background-color: #dbeafe;
              border-radius: 8px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #2563eb;
              font-weight: bold;
              font-size: 18px;
            }
            .clinic-info {
              text-align: right;
            }
            .clinic-name {
              font-size: 24px;
              font-weight: bold;
              color: #333;
              margin-bottom: 10px;
            }
            .contact-info p {
              margin: 5px 0;
              color: #666;
            }
            .invoice-details-top {
              display: flex;
              justify-content: space-between;
              margin-bottom: 30px;
              padding: 15px;
              background-color: #f8f9fa;
              border-radius: 5px;
            }
            .invoice-detail-item {
              font-size: 14px;
            }
            .section {
              margin-bottom: 30px;
            }
            .section-title {
              font-size: 18px;
              font-weight: bold;
              color: #333;
              margin-bottom: 15px;
              padding-bottom: 10px;
              border-bottom: 1px solid #ddd;
            }
            .patient-info {
              display: flex;
              justify-content: space-between;
              background-color: #f8f9fa;
              padding: 15px;
              border-radius: 5px;
            }
            .patient-info p {
              margin: 5px 0;
            }
            .data-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 15px;
            }
            .data-table th,
            .data-table td {
              border: 1px solid #ddd;
              padding: 10px;
              text-align: left;
            }
            .data-table th {
              background-color: #f8f9fa;
              font-weight: bold;
            }
            .price-column {
              text-align: right;
            }
            .section-total {
              text-align: right;
              margin-top: 10px;
            }
            .total-text {
              font-weight: bold;
              font-size: 16px;
              color: #333;
            }
            .grand-total-section {
              margin-top: 30px;
              padding: 20px;
              background-color: #f8f9fa;
              border-radius: 5px;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 10px;
              font-size: 16px;
            }
            .grand-total-row {
              display: flex;
              justify-content: space-between;
              font-size: 20px;
              font-weight: bold;
              color: #333;
              border-top: 2px solid #333;
              padding-top: 10px;
              margin-top: 15px;
            }
            .footer {
              text-align: center;
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              color: #666;
            }
            @media print {
              body { margin: 0; padding: 20px; }
              .invoice-container { box-shadow: none; }
            }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            <div class="invoice-title-section">
              <h1 class="main-invoice-title">TAX INVOICE</h1>
            </div>

            <div class="invoice-header-section">
              <div class="vydhyo-logo">
  <img src="assets/logo.png" alt="VYDHYO Logo">
</div>
              <div class="clinic-info">
                <div class="clinic-name">Vydhyo</div>
                <div class="contact-info">
                  <p>123 Medical Center Drive</p>
                  <p>New York, NY 10001</p>
                  <p>Phone: (555) 123-4567</p>
                  <p>Email: contact@healthcare.com</p>
                </div>
              </div>
            </div>

            <div class="invoice-details-top">
              <div class="invoice-detail-item">
                <strong>Invoice No:</strong> #${invoiceData.invoiceNumber}
              </div>
              <div class="invoice-detail-item">
                <strong>Date:</strong> ${invoiceData.billingDate}
              </div>
              <div class="invoice-detail-item">
                <strong>Time:</strong> ${invoiceData.billingTime}
              </div>
            </div>

            <div class="section">
              <h3 class="section-title">Patient Information</h3>
              <div class="patient-info">
                <div>
                  <p><strong>Name:</strong> ${invoiceData.name}</p>
                  <p><strong>Gender:</strong> ${invoiceData.gender}</p>
                </div>
                <div>
                  <p><strong>Age:</strong> ${invoiceData.age}</p>
                  <p><strong>Mobile No:</strong> ${invoiceData.mobile}</p>
                </div>
              </div>
            </div>

            <div class="section">
              <h3 class="section-title">Medicines Prescribed</h3>
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Medicine ID</th>
                    <th>Medicine Name</th>
                    <th>Quantity</th>
                    <th>Price (₹)</th>
                    <th>Subtotal (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  ${invoiceData.medicines
                    .map(
                      (medicine) => `
                    <tr>
                      <td>${medicine.id}</td>
                      <td>${medicine.name}</td>
                      <td>${medicine.quantity}</td>
                      <td>${medicine.price.toFixed(2)}</td>
                      <td>${(medicine.quantity * medicine.price).toFixed(
                        2
                      )}</td>
                    </tr>
                  `
                    )
                    .join("")}
                </tbody>
              </table>
              <div class="section-total">
                <p class="total-text">Medicine Total: ₹${invoiceData.totals.medicineTotal.toFixed(
                  2
                )}</p>
              </div>
            </div>

            <div class="section">
              <h3 class="section-title">Tests Conducted</h3>
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Test ID</th>
                    <th>Test Name</th>
                    <th class="price-column">Price (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  ${invoiceData.tests
                    .map(
                      (test) => `
                    <tr>
                      <td>${test.id}</td>
                      <td>${test.name}</td>
                      <td class="price-column">${test.price.toFixed(2)}</td>
                    </tr>
                  `
                    )
                    .join("")}
                </tbody>
              </table>
              <div class="section-total">
                <p class="total-text">Test Total: ₹${invoiceData.totals.testTotal.toFixed(
                  2
                )}</p>
              </div>
            </div>

            <div class="grand-total-section">
              <div class="total-row">
                <span>Medicine Total:</span>
                <span>₹${invoiceData.totals.medicineTotal.toFixed(2)}</span>
              </div>
              <div class="total-row">
                <span>Test Total:</span>
                <span>₹${invoiceData.totals.testTotal.toFixed(2)}</span>
              </div>
              <div class="grand-total-row">
                <span>Grand Total:</span>
                <span>₹${invoiceData.totals.grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <div class="footer">
              <p>Thank you for choosing Vydhyo</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Open print window and print directly
    const printWindow = window.open("", "_blank");
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

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
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {patients.map((patient) => (
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
                  <td style={{ padding: "12px 15px" }}>
                    <button
                      onClick={() => handlePrintInvoice(patient)}
                      disabled={!billingCompleted[patient.id]}
                      style={{
                        background: billingCompleted[patient.id]
                          ? "#28a745"
                          : "#6c757d",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        padding: "8px 16px",
                        cursor: billingCompleted[patient.id]
                          ? "pointer"
                          : "not-allowed",
                        fontSize: "14px",
                        opacity: billingCompleted[patient.id] ? 1 : 0.6,
                      }}
                    >
                      Print Invoice
                    </button>
                  </td>
                </tr>

                {expandedPatients[patient.id] && (
                  <tr>
                    <td colSpan="4" style={{ padding: "0" }}>
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
                              <strong>Age:</strong> {patient.age}
                            </p>
                            <p style={{ margin: "5px 0" }}>
                              <strong>Gender:</strong> {patient.gender}
                            </p>
                            <p style={{ margin: "5px 0" }}>
                              <strong>Mobile:</strong> {patient.mobile}
                            </p>
                            <p style={{ margin: "5px 0" }}>
                              <strong>Appointment:</strong>{" "}
                              {patient.appointmentDate} at{" "}
                              {patient.appointmentTime}
                            </p>
                          </div>
                        </div>

                        {/* Medicines Section */}
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
                                  Medicine ID
                                </th>
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
                                    {medicine.id}
                                  </td>
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
                                    {medicine.price.toFixed(2)}
                                  </td>
                                  <td
                                    style={{
                                      padding: "10px",
                                      borderBottom: "1px solid #eee",
                                      textAlign: "right",
                                    }}
                                  >
                                    {(
                                      medicine.quantity * medicine.price
                                    ).toFixed(2)}
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
                              {calculateTotals(patient).medicineTotal.toFixed(
                                2
                              )}
                            </strong>
                          </div>
                        </div>

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
                                  Test ID
                                </th>
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
                              {patient.tests.map((test) => (
                                <tr key={test.id}>
                                  <td
                                    style={{
                                      padding: "10px",
                                      borderBottom: "1px solid #eee",
                                    }}
                                  >
                                    {test.id}
                                  </td>
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
                                    {test.price.toFixed(2)}
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
                                            : "#fff3cd",
                                        color:
                                          test.status === "Completed"
                                            ? "#155724"
                                            : "#856404",
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
                              ))}
                            </tbody>
                          </table>
                          <div
                            style={{ textAlign: "right", marginTop: "10px" }}
                          >
                            <strong>
                              Test Total: ₹
                              {calculateTotals(patient).testTotal.toFixed(2)}
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
                            {calculateTotals(patient).grandTotal.toFixed(2)}
                          </div>
                          <button
                            onClick={() => handleMarkAsPaid(patient.id)}
                            style={{
                              background: "#28a745",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              padding: "10px 20px",
                              cursor: "pointer",
                              fontSize: "16px",
                              fontWeight: "bold",
                            }}
                          >
                            💳 Mark as Paid
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BillingSystem;
