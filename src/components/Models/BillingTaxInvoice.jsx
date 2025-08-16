import React from "react";
import { useSelector } from "react-redux";

const BillingTaxInvoice = ({ patient, type, onClose }) => {
  const user = useSelector((state) => state.currentUserData);
  const logo = "../assets/logo.png";

  const getTitle = () => {
    switch (type) {
      case "pharmacy":
        return "Pharmacy Tax Invoice";
      case "labs":
        return "Labs Tax Invoice";
      case "appointments":
        return "Appointments Tax Invoice";
      default:
        return "Tax Invoice";
    }
  };

  const handlePrint = () => {
    let provider = {};
    let headerUrl = "";
    let providerName = "N/A";
    let contactInfoHTML = "";
    let sectionHTML = "";
    let total = 0;

    const patientNumber = patient.patientId.replace(/\D/g, "");
    const invoiceNumber = `INV-${patientNumber.padStart(3, "0")}`;
    const billingDate = new Date().toLocaleDateString();
    const billingTime = new Date().toLocaleTimeString();

    if (type === "pharmacy") {
      const completedMedicines = patient.medicines.filter(
        (med) => med.status === "Completed"
      );
      const pharmacy = patient.medicines[0]?.pharmacyDetails || {};
      headerUrl = pharmacy.pharmacyHeaderUrl || "";
      providerName = pharmacy.pharmacyName || "N/A";
      contactInfoHTML = `
        <p>${pharmacy.pharmacyAddress || "N/A"}</p>
        <p>GST: ${pharmacy.pharmacyGst || "N/A"}</p>
        <p>PAN: ${pharmacy.pharmacyPan || "N/A"}</p>
        <p>Registration No: ${pharmacy.pharmacyRegistrationNo || "N/A"}</p>
      `;
      total = completedMedicines.reduce(
        (sum, med) => sum + med.price * med.quantity,
        0
      );
      if (completedMedicines.length > 0) {
        sectionHTML = `
          <div class="section compact-spacing">
            <h3 class="section-title">Medicines</h3>
            <table class="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Quantity</th>
                  <th>Price (₹)</th>
                  <th>Subtotal (₹)</th>
                </tr>
              </thead>
              <tbody>
                ${completedMedicines
                  .map(
                    (med) => `
                  <tr>
                    <td>${med.id}</td>
                    <td>${med.name}</td>
                    <td>${med.quantity}</td>
                    <td>${med.price.toFixed(2)}</td>
                    <td>${(med.price * med.quantity).toFixed(2)}</td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>
            <div class="section-total">
              <p class="total-text">Medicine Total: ₹${total.toFixed(2)}</p>
            </div>
          </div>
        `;
      }
    } else if (type === "labs") {
      const completedTests = patient.tests.filter(
        (test) => test.status === "Completed"
      );
      const lab = patient.tests[0]?.labDetails || {};
      headerUrl = lab.labHeaderUrl || "";
      providerName = lab.labName || "N/A";
      contactInfoHTML = `
        <p>${lab.labAddress || "N/A"}</p>
        <p>GST: ${lab.labGst || "N/A"}</p>
        <p>PAN: ${lab.labPan || "N/A"}</p>
        <p>Registration No: ${lab.labRegistrationNo || "N/A"}</p>
      `;
      total = completedTests.reduce((sum, test) => sum + test.price, 0);
      if (completedTests.length > 0) {
        sectionHTML = `
          <div class="section compact-spacing">
            <h3 class="section-title">Tests</h3>
            <table class="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Price (₹)</th>
                </tr>
              </thead>
              <tbody>
                ${completedTests
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
              <p class="total-text">Test Total: ₹${total.toFixed(2)}</p>
            </div>
          </div>
        `;
      }
    } else if (type === "appointments") {
      const completedAppointments = patient.appointmentDetails.filter(
        (appt) => appt.status === "Completed"
      );
      const appointment = patient.appointmentDetails[0] || {};
      const clinic =
        user?.addresses?.find(
          (addr) => addr.addressId === appointment.addressId
        ) || {};
      headerUrl = "";
      providerName = clinic.clinicName || "N/A";
      contactInfoHTML = `
        <p>${clinic.address || "N/A"}</p>
        <p>${clinic.city || "N/A"}, ${clinic.state || "N/A"} ${
        clinic.pincode || "N/A"
      }</p>
        <p>Phone: ${clinic.mobile || "N/A"}</p>
      `;
      total = completedAppointments.reduce(
        (sum, appt) => sum + appt.appointmentFees,
        0
      );
      if (completedAppointments.length > 0) {
        sectionHTML = `
          <div class="section compact-spacing">
            <h3 class="section-title">Appointments</h3>
            <table class="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Clinic</th>
                  <th>Price (₹)</th>
                </tr>
              </thead>
              <tbody>
                ${completedAppointments
                  .map(
                    (appt) => `
                  <tr>
                    <td>${appt.appointmentId}</td>
                    <td>${appt.appointmentType}</td>
                    <td>${appt.appointmentDate}</td>
                    <td>${appt.appointmentTime}</td>
                    <td>${appt.clinicName}</td>
                    <td class="price-column">${appt.appointmentFees.toFixed(
                      2
                    )}</td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>
            <div class="section-total">
              <p class="total-text">Appointment Total: ₹${total.toFixed(2)}</p>
            </div>
          </div>
        `;
      }
    }

    const headerHTML = headerUrl
      ? `<div class="provider-logo"><img class="header-logo" src="${headerUrl}" alt="Header Logo" /></div>`
      : "";

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice</title>
          <style>
            html, body {


              margin: 0;
              padding: 0;
              font-family: Arial, sans-serif;
              background: white;
              font-size: 14px;
            }

            @page {
              margin: 0;
              size: A4;
            }

            @media print {
              @page {
                margin: 0;
                size: A4;
              }
              
              body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              
              /* Hide browser default headers and footers */
              @page {
                margin-top: 0;
                margin-bottom: 0;
                margin-header: 0;
                margin-footer: 0;
              }
            }

            .invoice-container {
              padding: 15px;
              max-width: 210mm;
              margin: 0 auto;
            }

            .invoice-content {
              flex: 1;
            }

            .invoice-title-section {
              text-align: center;
              margin-top: 30px;
              margin-bottom: 20px;
            }

            .main-invoice-title {
              font-size: 28px;
              font-weight: bold;
              color: #333;
              margin: 0;
            }

            .invoice-header-section {
              display: flex;
              justify-content: space-between;
              margin-bottom: 20px;
              padding-bottom: 15px;
              border-bottom: 2px solid #eee;
            }

            .provider-info {
              text-align: left;
            }

            .provider-name {
              font-size: 20px;
              font-weight: bold;
              color: #333;
              margin-bottom: 8px;
            }

            .contact-info p {
              margin: 3px 0;
              color: #666;
            }

            .invoice-details-top {
              display: flex;
              justify-content: space-between;
              margin-bottom: 20px;
              padding: 12px;
              background-color: #f8f9fa;
              border-radius: 5px;
            }

            .invoice-detail-item {
              font-size: 14px;
            }

            .section {
              margin-bottom: 20px;
            }

            .section-title {
              font-size: 16px;
              font-weight: bold;
              color: #333;
              margin-bottom: 10px;
              padding-bottom: 5px;
              border-bottom: 1px solid #ddd;
            }

            .patient-info {
              display: flex;
              justify-content: space-between;
              background-color: #f8f9fa;
              padding: 12px;
              border-radius: 5px;
            }

            .patient-info p {
              margin: 3px 0;
            }

            .data-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 10px;
            }

            .data-table th, .data-table td {
              border: 1px solid #ddd;
              padding: 8px;
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
              margin-top: 8px;
            }

            .total-text {
              font-weight: bold;
              font-size: 14px;
              color: #333;
            }

            .grand-total-section {
              margin-top: 20px;
              padding: 15px;
              background-color: #f8f9fa;
              border-radius: 5px;
            }

            .total-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 8px;
              font-size: 14px;
            }

            .grand-total-row {
              display: flex;
              justify-content: space-between;
              font-size: 16px;
              font-weight: bold;
              color: #333;
              border-top: 2px solid #333;
              padding-top: 8px;
              margin-top: 10px;
            }

            .footer {
              text-align: center;
              padding: 15px 0;
              border-top: 1px solid #ddd;
              color: #666;
              background: white;
            }

            .powered-by {
              display: flex;
              align-items: center;
              justify-content: center;
              margin-top: 8px;
              gap: 6px;
              color: #666;
              font-size: 12px;
            }

            .footer-logo {
              width: 18px;
              height: 18px;
              object-fit: contain;
            }

            /* Compact spacing for better space utilization */
            .compact-spacing {
              margin-bottom: 15px;
            }

            .compact-spacing:last-child {
              margin-bottom: 0;
            }

            .provider-logo {
              text-align: center;
              margin-bottom: 10px;
              width: 100%;
            }

            .header-logo {
              width: 100%;
              height: 150px;
              object-fit: cover;
              display: block;
              margin: 0;
              padding: 0;
            }

            /* Print specific styles */
            @media print {
              .invoice-container {
                min-height: 100vh;
              }
              
              .footer {
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                margin-top: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            <div class="invoice-content">
              ${headerHTML}

              <div class="invoice-header-section compact-spacing">
                <div class="provider-info">
                  <div class="provider-name">${providerName}</div>
                  <div class="contact-info">
                    <p>Doctor: ${user?.firstname || "N/A"} ${
      user?.lastname || "N/A"
    }</p>
                  </div>
                </div>
                <div class="invoice-details">
                  <div class="invoice-detail-item"><strong>Invoice No:</strong> #${invoiceNumber}</div>
                  <div class="invoice-detail-item"><strong>Date:</strong> ${billingDate}</div>
                  <div class="invoice-detail-item"><strong>Time:</strong> ${billingTime}</div>
                </div>
              </div>

              <div class="provider-details">
                ${contactInfoHTML}
              </div>

              <div class="section compact-spacing">
                <h3 class="section-title">Patient Information</h3>
                <div class="patient-info">
                  <div>
                    <p><strong>Patient ID:</strong> ${patient.patientId}</p>
                    <p><strong>First Name:</strong> ${patient.firstname}</p>
                    <p><strong>Last Name:</strong> ${patient.lastname}</p>
                    <p><strong>Mobile:</strong> ${patient.mobile}</p>
                  </div>
                  <div>
                    <p><strong>Age:</strong> ${patient.age}</p>
                    <p><strong>Gender:</strong> ${patient.gender}</p>
                  </div>
                </div>
              </div>

              ${sectionHTML}

              <div class="grand-total-section">
                <div class="grand-total-row">
                  <span>Grand Total:</span>
                  <span>₹${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div class="footer">
              <p>Thank you for choosing Vydhyo</p>
              <div class="powered-by">
                <img src="${logo}" alt="Vydhyo Logo" class="footer-logo">
                <span>Powered by Vydhyo</span>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    printWindow.document.write(printContent);
    printWindow.document.close();

    // Wait for content to load before printing
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "8px",
          maxWidth: "800px",
          width: "90%",
          maxHeight: "80vh",
          overflowY: "auto",
          position: "relative",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            background: "none",
            border: "none",
            fontSize: "20px",
            cursor: "pointer",
          }}
        >
          ×
        </button>
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <button
            onClick={handlePrint}
            style={{
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              padding: "10px 20px",
              cursor: "pointer",
            }}
          >
            Print Invoice
          </button>
        </div>
      </div>
    </div>
  );
};

export default BillingTaxInvoice;