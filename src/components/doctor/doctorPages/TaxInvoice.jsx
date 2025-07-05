import React from "react";
import "../../stylings/TaxInvoice.css";
import logo from "../../../assets/logooo.png";

const TaxInvoice = () => {
  const handlePrint = () => {
    // Get the invoice content
    const invoiceContent = document.querySelector('.invoice-container');
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    
    // Write the HTML content to the new window
    printWindow.document.write(`
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
            .vydhyo-logo img {
              max-width: 150px;
              height: auto;
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
          ${invoiceContent.innerHTML}
        </body>
      </html>
    `);
    
    // Close the document and print
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  return (
    <div className="invoice-container">
      {/* Print Button - Only visible on screen */}
      <div className="print-button-container no-print">
        <button onClick={handlePrint} className="print-button">
          🖨️ Print Invoice
        </button>
      </div>

      {/* Main Invoice Heading */}
      <div className="invoice-title-section">
        <h1 className="main-invoice-title">TAX INVOICE</h1>
      </div>

      {/* Header with Logo and Clinic Info */}
      <div className="invoice-header-section">
        {/* Vydhyo Logo */}
        <div className="vydhyo-logo">
          <img src={logo} alt="Vydhyo Logo" />
        </div>

        {/* Clinic Info */}
        <div className="clinic-info">
          <div className="clinic-name">Vydhyo</div>
          <div className="contact-info">
            <p>123 Medical Center Drive</p>
            <p>New York, NY 10001</p>
            <p>Phone: (555) 123-4567</p>
            <p>Email: contact@healthcare.com</p>
          </div>
        </div>
      </div>

      <div className="invoice-details-top">
        <div className="invoice-detail-item">
          <strong>Invoice No:</strong> #INV-001
        </div>
        <div className="invoice-detail-item">
          <strong>Date:</strong> 01/07/2025
        </div>
        <div className="invoice-detail-item">
          <strong>Time:</strong> 11:43 AM
        </div>
      </div>

      {/* Rest of the invoice content remains the same */}
      <div className="section">
        <h3 className="section-title">Patient Information</h3>
        <div className="patient-info">
          <div>
            <p>
              <strong>Name:</strong> John Smith
            </p>
            <p>
              <strong>Gender:</strong> Male
            </p>
          </div>
          <div>
            <p>
              <strong>Age:</strong> 35
            </p>
            <p>
              <strong>Mobile No:</strong> +1 (555) 987-6543
            </p>
          </div>
        </div>
      </div>

      {/* Medicines Prescribed */}
      <div className="section">
        <h3 className="section-title">Medicines Prescribed</h3>
        <table className="data-table">
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
            <tr>
              <td>M001</td>
              <td>Paracetamol</td>
              <td>2</td>
              <td>25.00</td>
              <td>50.00</td>
            </tr>
            <tr>
              <td>M002</td>
              <td>Amoxicillin</td>
              <td>1</td>
              <td>80.00</td>
              <td>80.00</td>
            </tr>
          </tbody>
        </table>
        <div className="section-total">
          <p className="total-text">Medicine Total: ₹130.00</p>
        </div>
      </div>

      {/* Tests Conducted */}
      <div className="section">
        <h3 className="section-title">Tests Conducted</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Test ID</th>
              <th>Test Name</th>
              <th className="price-column">Price (₹)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>T101</td>
              <td>Blood Test</td>
              <td className="price-column">150.00</td>
            </tr>
            <tr>
              <td>T102</td>
              <td>X-Ray Chest</td>
              <td className="price-column">200.00</td>
            </tr>
          </tbody>
        </table>
        <div className="section-total">
          <p className="total-text">Test Total: ₹350.00</p>
        </div>
      </div>

      {/* Totals */}
      <div className="grand-total-section">
        <div className="total-row">
          <span>Medicine Total:</span>
          <span>₹130.00</span>
        </div>
        <div className="total-row">
          <span>Test Total:</span>
          <span>₹350.00</span>
        </div>
        <div className="grand-total-row">
          <span>Grand Total:</span>
          <span>₹480.00</span>
        </div>
      </div>

      {/* Footer */}
      <div className="footer">
        <p>Thank you for choosing Vydhyo</p>
      </div>
    </div>
  );
};

export default TaxInvoice;