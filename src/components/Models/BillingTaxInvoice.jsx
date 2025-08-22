import React from "react";

const BillingTaxInvoice = {
  handlePrintInvoice: (type, patientId, transformedPatients, user, toast) => {
    const patient = transformedPatients.find((p) => p.id === patientId);
    if (!patient) {
      toast?.error?.("Patient not found.");
      return;
    }

    const isCompleted = (s) => {
      const v = String(s || "").toLowerCase();
      return v === "completed" || v === "complete" || v === "paid";
    };

    let itemDate = "N/A";

    if (type === "pharmacy") {
      const completedMedicines = (patient.medicines || []).filter((m) =>
        isCompleted(m.status)
      );
      if (completedMedicines.length > 0) {
        const firstMed = completedMedicines[0];
        itemDate = firstMed.updatedDate
          ? new Date(firstMed.updatedDate).toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            })
          : "N/A";
      }
    } else if (type === "labs") {
      const completedTests = (patient.tests || []).filter((t) =>
        isCompleted(t.status)
      );
      if (completedTests.length > 0) {
        const firstTest = completedTests[0];
        itemDate = firstTest.updatedAt
          ? new Date(firstTest.updatedAt).toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            })
          : "N/A";
      }
    } else if (type === "appointments") {
      const completedAppointments = (patient.appointmentDetails || []).filter(
        (a) => isCompleted(a?.status)
      );
      if (completedAppointments.length > 0) {
        const firstAppt = completedAppointments[0];
        itemDate = firstAppt.updatedAt
          ? new Date(firstAppt.updatedAt).toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            })
          : "N/A";
      }
    }

    const appts = patient.appointmentDetails || patient.appointments || [];
    const completedAppointments = appts.filter((a) => isCompleted(a?.status));
    const firstAppt = completedAppointments[0] || appts[0] || {};

    let headerUrl = "";
    let providerName = "N/A";
    let contactInfoHTML = "";
    let sectionHTML = "";
    let total = 0;

    const patientNumber = String(patient.patientId || "").replace(/\D/g, "");
    const invoiceNumber = `INV-${patientNumber.padStart(3, "0")}`;

    if (type === "pharmacy") {
      const completedMedicines = (patient.medicines || []).filter((m) =>
        isCompleted(m.status)
      );
      const pharmacyDetails =
        completedMedicines[0]?.pharmacyDetails ||
        patient.medicines?.[0]?.pharmacyDetails ||
        {};

      const isPharmacyDetailsEmptyOrNull =
        !pharmacyDetails ||
        Object.keys(pharmacyDetails).length === 0 ||
        Object.values(pharmacyDetails).every(
          (value) => value === null || value === undefined
        );

      if (isPharmacyDetailsEmptyOrNull) {
        toast?.error?.("Please fill the pharmacy details to generate a bill.");
        return;
      }

      headerUrl = pharmacyDetails.pharmacyHeaderUrl || "";
      providerName = pharmacyDetails.pharmacyName || "N/A";
      contactInfoHTML = `
        <div class="provider-name">${providerName}</div>
        <p>${pharmacyDetails.pharmacyAddress || "N/A"}</p>
        <p>GST: ${pharmacyDetails.pharmacyGst || "N/A"}</p>
        <p>PAN: ${pharmacyDetails.pharmacyPan || "N/A"}</p>
        <p>Registration No: ${pharmacyDetails.pharmacyRegistrationNo || "N/A"}</p>
      `;

      total = completedMedicines.reduce(
        (sum, med) =>
          sum + (Number(med.price) || 0) * (Number(med.quantity) || 0),
        0
      );

      if (!completedMedicines.length) {
        toast?.error?.("No completed medicines to print.");
        return;
      }

      sectionHTML = `
        <div class="section compact-spacing">
          <h3 class="section-title">Medicines</h3>
          <table class="data-table">
            <thead>
              <tr>
                <th>SL No.</th>
                <th>Name</th>
                <th>Quantity</th>
                <th>Unit Price (₹)</th>
                <th>Subtotal (₹)</th>
              </tr>
            </thead>
            <tbody>
              ${completedMedicines
                .map(
                  (med, idx) => `
                <tr>
                  <td>${idx + 1}.</td>
                  <td>${med.name || med.medName || ""}</td>
                  <td>${med.quantity}</td>
                  <td>${Number(med.price || 0).toFixed(2)}</td>
                  <td>${(
                    (Number(med.price) || 0) * (Number(med.quantity) || 0)
                  ).toFixed(2)}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
          <div class="section-total" style="display: flex; justify-content: space-between; align-items: center;">
            <p class="gst-text" style="margin: 0; font-size: 13px; color: #000000ff;">GST included</p>
            <p class="total-text" style="margin: 0;">Medicine Total: ₹${total.toFixed(
              2
            )}</p>
          </div>
        </div>
      `;
    } else if (type === "labs") {
      const completedTests = (patient.tests || []).filter((t) =>
        isCompleted(t.status)
      );
      const labDetails =
        completedTests[0]?.labDetails || patient.tests?.[0]?.labDetails || {};

      const isLabDetailsEmptyOrNull =
        !labDetails ||
        Object.keys(labDetails).length === 0 ||
        Object.values(labDetails).every(
          (value) => value === null || value === undefined
        );

      if (isLabDetailsEmptyOrNull) {
        toast?.error?.("Please fill the lab details to generate a bill.");
        return;
      }

      headerUrl = labDetails.labHeaderUrl || "";
      providerName = labDetails.labName || "N/A";
      contactInfoHTML = `
        <div class="provider-name">${providerName}</div>
        <p>${labDetails.labAddress || "N/A"}</p>
        <p>GST: ${labDetails.labGst || "N/A"}</p>
        <p>PAN: ${labDetails.labPan || "N/A"}</p>
        <p>Registration No: ${labDetails.labRegistrationNo || "N/A"}</p>
      `;

      total = completedTests.reduce(
        (sum, test) => sum + (Number(test.price) || 0),
        0
      );

      if (!completedTests.length) {
        toast?.error?.("No completed tests to print.");
        return;
      }

      sectionHTML = `
        <div class="section compact-spacing">
          <h3 class="section-title">Tests</h3>
          <table class="data-table">
            <thead>
              <tr>
                <th>SL No.</th>
                <th>Name</th>
                <th>Price (₹)</th>
              </tr>
            </thead>
            <tbody>
              ${completedTests
                .map(
                  (test, idx) => `
                <tr>
                  <td>${idx + 1}.</td>
                  <td>${test.name || test.testName || ""}</td>
                  <td class="price-column">${Number(test.price || 0).toFixed(
                    2
                  )}</td>
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
    } else if (type === "appointments") {
      const appts = patient.appointmentDetails || patient.appointments || [];
      const completedAppointments = appts.filter((a) => isCompleted(a?.status));
      const firstAppt = completedAppointments[0] || appts[0] || {};
      const addr =
        (user?.addresses || []).find(
          (a) => a.addressId === firstAppt.addressId
        ) || {};

      const isAddressEmptyOrNull =
        !addr ||
        Object.keys(addr).length === 0 ||
        Object.values(addr).every(
          (value) => value === null || value === undefined
        );

      if (isAddressEmptyOrNull) {
        toast?.error?.(
          "Please fill the appointment address details to generate a bill."
        );
        return;
      }

      headerUrl = addr.headerImage || "";
      providerName = firstAppt.clinicName || addr.clinicName || "N/A";
      contactInfoHTML = `
        <div class="provider-name">Name: ${providerName}</div>
        <p>${addr.address || "N/A"}</p>
        <p>${addr.city || "N/A"}, ${addr.state || "N/A"} ${
        addr.pincode || "N/A"
      }</p>
        <p>Phone: ${addr.mobile || "N/A"}</p>
      `;

      total = completedAppointments.reduce(
        (sum, a) => sum + (Number(a.appointmentFees) || 0),
        0
      );

      if (!completedAppointments.length) {
        toast?.error?.("No completed appointments to print.");
        return;
      }

      sectionHTML = `
        <div class="section compact-spacing">
          <h3 class="section-title">Appointments</h3>
          <table class="data-table">
            <thead>
              <tr>
                <th>SL No.</th>
                <th>Service</th>
                <th>Total Amount</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              ${completedAppointments
                .map(
                  (appt, idx) => `
                <tr>
                  <td>${idx + 1}.</td>
                  <td>Consultation Bill</td>
                  <td class="price-column">${Number(
                    appt.appointmentFees || 0
                  ).toFixed(2)}</td>
                  <td>${appt.appointmentType || ""}</td>
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
    } else {
      toast?.error?.("Unknown invoice type.");
      return;
    }

    const headerSectionHTML = headerUrl
      ? `
        <div class="invoice-header-image-only">
          <img src="${headerUrl}" alt="Header" />
        </div>
      `
      : "";

    const printHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice</title>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width,initial-scale=1" />
          <style>
            html, body {
              margin: 0;
              padding: 0;
              font-family: Arial, sans-serif;
              background: #fff;
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
            }
            .invoice-container {
              padding: 15px;
              max-width: 210mm;
              margin: 0 auto;
              min-height: calc(100vh - 30px);
              display: flex;
              flex-direction: column;
            }
            .invoice-content {
              flex: 1;
            }
            .invoice-header-image-only {
              width: 100%;
              margin-bottom: 12px;
              page-break-inside: avoid;
            }
            .invoice-header-image-only img {
              display: block;
              width: 100%;
              height: auto;
              max-height: 220px;
              object-fit: contain;
            }
            .invoice-header {
              display: flex;
              justify-content: space-between;
              margin-bottom: 20px;
              page-break-inside: avoid;
            }
            .provider-info {
              flex: 1;
              text-align: left;
            }
            .provider-name {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 8px;
              color: #000000ff;
            }
            .invoice-details {
              text-align: right;
              font-size: 13px;
            }
            .invoice-details p {
              margin: 4px 0;
            }
            .patient-info {
              margin-bottom: 20px;
              border: 1px solid #e0e0e0;
              padding: 10px;
              border-radius: 4px;
              background: #f9f9f9;
              font-size: 13px;
              page-break-inside: avoid;
            }
            .patient-info p {
              margin: 4px 0;
            }
            .section {
              margin-bottom: 20px;
              page-break-inside: avoid;
            }
            .section-title {
              font-size: 16px;
              font-weight: bold;
              margin-bottom: 10px;
              color: #000000ff;
            }
            .data-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 10px;
              font-size: 13px;
            }
            .data-table th,
            .data-table td {
              border: 1px solid #e0e0e0;
              padding: 8px;
              text-align: left;
            }
            .data-table th {
              background: #f0f0f0;
              font-weight: bold;
              color: #000000ff;
            }
            .data-table .price-column {
              text-align: right;
            }
            .section-total {
              text-align: right;
              font-size: 14px;
              font-weight: bold;
              margin-top: 10px;
            }
            .total-text {
              font-size: 14px;
              font-weight: bold;
              color: #000000ff;
            }
            .gst-text {
              font-size: 13px;
              color: #000000ff;
            }
            .footer {
              margin-top: auto;
              text-align: center;
              font-size: 12px;
              color: #666;
              border-top: 1px solid #e0e0e0;
              padding-top: 10px;
              page-break-inside: avoid;
            }
            p {
              margin: 4px 0;
              color: #000000ff;
            }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            <div class="invoice-content">
              ${headerSectionHTML}
              <div class="invoice-header">
                <div class="provider-info">
                  ${contactInfoHTML}
                </div>
                <div class="invoice-details">
                  <p><strong>Invoice Number:</strong> ${invoiceNumber}</p>
                  <p><strong>Date:</strong> ${itemDate}</p>
                </div>
              </div>
              <div class="patient-info">
                <p><strong>Patient Name:</strong> ${patient.name}</p>
                <p><strong>Patient ID:</strong> ${patient.patientId}</p>
                <p><strong>Age:</strong> ${patient.age}</p>
                <p><strong>Gender:</strong> ${patient.gender}</p>
              </div>
              ${sectionHTML}
            </div>
            <div class="footer">
              <p>Thank you for your visit!</p>
              <p>Generated by Billing System</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(printHTML);
      printWindow.document.close();
      printWindow.print();
    } else {
      toast?.error?.("Unable to open print window. Please allow pop-ups.");
    }
  },
};

export default BillingTaxInvoice;