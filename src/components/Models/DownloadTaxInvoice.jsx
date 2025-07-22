import React from "react";

const logo = "../assets/logo.png"; // Path to your logo image

const DownloadTaxInvoice = ({ patient, user }) => {
  const calculateTotals = (patient) => {
    const completedMedicines =
      patient.medicines?.filter(
        (med) => med.status === "Completed" && med.price
      ) || [];
    const completedTests =
      patient.tests?.filter(
        (test) => test.status === "Completed" && test.price
      ) || [];

    const medicineTotal = completedMedicines.reduce(
      (sum, med) => sum + med.price * med.quantity,
      0
    );
    const testTotal = completedTests.reduce((sum, test) => sum + test.price, 0);
    const grandTotal = medicineTotal + testTotal;

    return {
      medicineTotal,
      testTotal,
      grandTotal,
    };
  };

  const handleDownload = () => {
    const invoiceNumber = `INV-${String(patient.id).padStart(3, "0")}`;
    const billingDate = new Date().toLocaleDateString();
    const billingTime = new Date().toLocaleTimeString();

    const completedMedicines =
      patient.medicines?.filter(
        (med) => med.status === "Completed" && med.price
      ) || [];
    const completedTests =
      patient.tests?.filter(
        (test) => test.status === "Completed" && test.price
      ) || [];

    const totals = calculateTotals(patient);

    // Find the clinic details by matching the appointment's addressId with user addresses
    const appointment = patient.appointmentDetails?.[0];
    const clinic =
      user?.addresses?.find(
        (addr) => addr.addressId === appointment?.addressId
      ) || {};

    const invoiceData = {
      ...patient,
      invoiceNumber,
      billingDate,
      billingTime,
      totals,
    };

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
              margin: 15mm;
              size: A4;
            }

            @media print {
              @page {
                margin: 15mm;
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
              justify-content: flex-start;
              align-items: flex-start;
              margin-bottom: 20px;
              padding-bottom: 15px;
              border-bottom: 2px solid #eee;
            }

            .clinic-info {
              text-align: left;
            }

            .clinic-name {
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
              <div class="invoice-title-section compact-spacing">
                <h1 class="main-invoice-title">TAX INVOICE</h1>
              </div>

              <div class="invoice-header-section compact-spacing">
                <div class="clinic-info">
                  <div class="clinic-name">${clinic.clinicName || "NA"}</div>
                  <div class="contact-info">
                    <p>${clinic.address || "NA"}</p>
                    <p>${clinic.city || "NA"}, ${clinic.state || "NA"} ${
      clinic.pincode || "NA"
    }</p>
                    <p>Phone: ${clinic.mobile || "NA"}</p>
                  </div>
                </div>
              </div>

              <div class="invoice-details-top compact-spacing">
                <div class="invoice-detail-item"><strong>Invoice No:</strong> #${
                  invoiceData.invoiceNumber
                }</div>
                <div class="invoice-detail-item"><strong>Date:</strong> ${
                  invoiceData.billingDate
                }</div>
                <div class="invoice-detail-item"><strong>Time:</strong> ${
                  invoiceData.billingTime
                }</div>
              </div>

              <div class="section compact-spacing">
                <h3 class="section-title">Patient Information</h3>
                <div class="patient-info">
                  <div>
                    <p><strong>Patient ID:</strong> ${invoiceData.patientId}</p>
                    <p><strong>First Name:</strong> ${invoiceData.firstname}</p>
                    <p><strong>Last Name:</strong> ${invoiceData.lastname}</p>
                  </div>
                  <div>
                    <p><strong>Age:</strong> ${invoiceData.age}</p>
                    <p><strong>Gender:</strong> ${invoiceData.gender}</p>
                  </div>
                </div>
              </div>

              ${
                completedMedicines.length > 0
                  ? `
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
                      </tr>`
                      )
                      .join("")}
                  </tbody>
                </table>
                <div class="section-total">
                  <p class="total-text">Medicine Total: ₹${invoiceData.totals.medicineTotal.toFixed(
                    2
                  )}</p>
                </div>
              </div>`
                  : ""
              }

              ${
                completedTests.length > 0
                  ? `
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
                      </tr>`
                      )
                      .join("")}
                  </tbody>
                </table>
                <div class="section-total">
                  <p class="total-text">Test Total: ₹${invoiceData.totals.testTotal.toFixed(
                    2
                  )}</p>
                </div>
              </div>`
                  : ""
              }

              <div class="grand-total-section">
                <div class="total-row"><span>Appointment Fee:</span><span>₹${patient.totalAppointmentFees.toFixed(
                  2
                )}</span></div>
                ${
                  completedMedicines.length > 0
                    ? `<div class="total-row"><span>Medicine Total:</span><span>₹${invoiceData.totals.medicineTotal.toFixed(
                        2
                      )}</span></div>`
                    : ""
                }
                ${
                  completedTests.length > 0
                    ? `<div class="total-row"><span>Test Total:</span><span>₹${invoiceData.totals.testTotal.toFixed(
                        2
                      )}</span></div>`
                    : ""
                }
                <div class="grand-total-row">
                  <span>Grand Total:</span>
                  <span>₹${patient.grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div class="footer">
              <p>Thank you for choosing Vydhyo</p>
              <div class="powered-by">
                <img src="/logooo.png" alt="Vydhyo Logo" class="footer-logo">
                <img src={logo} alt="Vydhyo Logo" class="footer-logo">
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
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  return (
    <button
      onClick={handleDownload}
      disabled={patient.disabled}
      style={{
        background: patient.disabled ? "#6c757d" : "#28a745",
        color: "white",
        border: "none",
        borderRadius: "4px",
        padding: "8px 16px",
        cursor: patient.disabled ? "not-allowed" : "pointer",
        fontSize: "14px",
        opacity: patient.disabled ? 0.6 : 1,
      }}
    >
      Print Invoice
    </button>
  );
};

export default DownloadTaxInvoice;
