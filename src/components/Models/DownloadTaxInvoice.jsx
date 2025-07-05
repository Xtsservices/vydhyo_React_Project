import React from "react";

const DownloadTaxInvoice = ({ patient, calculateTotals, disabled }) => {
  const handleDownload = () => {
    const totals = calculateTotals(patient);
    const invoiceNumber = `INV-${String(patient.id).padStart(3, "0")}`;

    const invoiceData = {
      ...patient,
      invoiceNumber,
      totals,
      billingDate: new Date().toLocaleDateString(),
      billingTime: new Date().toLocaleTimeString(),
    };

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Tax Invoice</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: white; }
            .invoice-container { max-width: 800px; margin: 0 auto; background: white; }
            .invoice-title-section { text-align: center; margin-bottom: 30px; }
            .main-invoice-title { font-size: 32px; font-weight: bold; color: #333; margin: 0; }
            .invoice-header-section { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #eee; }
            .vydhyo-logo { width: 150px; height: 64px; background-color: #dbeafe; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #2563eb; font-weight: bold; font-size: 18px; }
            .clinic-info { text-align: right; }
            .clinic-name { font-size: 24px; font-weight: bold; color: #333; margin-bottom: 10px; }
            .contact-info p { margin: 5px 0; color: #666; }
            .invoice-details-top { display: flex; justify-content: space-between; margin-bottom: 30px; padding: 15px; background-color: #f8f9fa; border-radius: 5px; }
            .invoice-detail-item { font-size: 14px; }
            .section { margin-bottom: 30px; }
            .section-title { font-size: 18px; font-weight: bold; color: #333; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid #ddd; }
            .patient-info { display: flex; justify-content: space-between; background-color: #f8f9fa; padding: 15px; border-radius: 5px; }
            .patient-info p { margin: 5px 0; }
            .data-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
            .data-table th, .data-table td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            .data-table th { background-color: #f8f9fa; font-weight: bold; }
            .price-column { text-align: right; }
            .section-total { text-align: right; margin-top: 10px; }
            .total-text { font-weight: bold; font-size: 16px; color: #333; }
            .grand-total-section { margin-top: 30px; padding: 20px; background-color: #f8f9fa; border-radius: 5px; }
            .total-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 16px; }
            .grand-total-row { display: flex; justify-content: space-between; font-size: 20px; font-weight: bold; color: #333; border-top: 2px solid #333; padding-top: 10px; margin-top: 15px; }
            .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; }
            @media print { body { margin: 0; padding: 20px; } .invoice-container { box-shadow: none; } }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            <div class="invoice-title-section">
              <h1 class="main-invoice-title">TAX INVOICE</h1>
            </div>
            <div class="invoice-header-section">
              <div class="vydhyo-logo">Vydhyo</div>
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
              <div class="invoice-detail-item"><strong>Invoice No:</strong> #${invoiceData.invoiceNumber}</div>
              <div class="invoice-detail-item"><strong>Date:</strong> ${invoiceData.billingDate}</div>
              <div class="invoice-detail-item"><strong>Time:</strong> ${invoiceData.billingTime}</div>
            </div>
            <div class="section">
              <h3 class="section-title">Patient Information</h3>
              <div class="patient-info">
                <div>
                  <p><strong>Patient ID:</strong> ${invoiceData.patientId}</p>
                  <p><strong>First Name:</strong> ${invoiceData.firstname}</p>
                  <p><strong>Last Name:</strong> ${invoiceData.lastname}</p>
                </div>
                <div>
                  <p><strong>DOB:</strong> ${invoiceData.DOB}</p>
                  <p><strong>Gender:</strong> ${invoiceData.gender}</p>
                  <p><strong>Blood Group:</strong> ${invoiceData.bloodgroup}</p>
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
                    <th>Status</th>
                    <th>Subtotal (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  ${invoiceData.medicines
                    .filter((med) => med.status === "Pending" && med.price)
                    .map(
                      (medicine) => `
                    <tr>
                      <td>${medicine.id}</td>
                      <td>${medicine.name}</td>
                      <td>${medicine.quantity}</td>
                      <td>${medicine.price.toFixed(2)}</td>
                      <td>${medicine.status}</td>
                      <td>${(medicine.quantity * medicine.price).toFixed(2)}</td>
                    </tr>
                  `
                    )
                    .join("")}
                </tbody>
              </table>
              <div class="section-total">
                <p class="total-text">Medicine Total: ₹${invoiceData.totals.medicineTotal.toFixed(2)}</p>
              </div>
            </div>
            <div class="section">
              <h3 class="section-title">Tests Conducted</h3>
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Test ID</th>
                    <th>Test Name</th>
                    <th>Price (₹)</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${invoiceData.tests
                    .filter((test) => test.status === "Completed" && test.price)
                    .map(
                      (test) => `
                    <tr>
                      <td>${test.id}</td>
                      <td>${test.name}</td>
                      <td class="price-column">${test.price.toFixed(2)}</td>
                      <td>${test.status}</td>
                    </tr>
                  `
                    )
                    .join("")}
                </tbody>
              </table>
              <div class="section-total">
                <p class="total-text">Test Total: ₹${invoiceData.totals.testTotal.toFixed(2)}</p>
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
      disabled={disabled}
      style={{
        background: disabled ? "#6c757d" : "#28a745",
        color: "white",
        border: "none",
        borderRadius: "4px",
        padding: "8px 16px",
        cursor: disabled ? "not-allowed" : "pointer",
        fontSize: "14px",
        opacity: disabled ? 0.6 : 1,
      }}
    >
      Download Invoice
    </button>
  );
};

export default DownloadTaxInvoice;