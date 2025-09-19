import React, { useEffect, useState } from "react";
import {
  Table,
  Typography,
  Spin,
  Card,
  Row,
  Col,
  Tag,
  InputNumber,
  Button,
  Collapse,
  Popconfirm,
  Empty,
  Pagination,
  Modal,
  Descriptions,
  Radio
} from "antd";
import { CheckOutlined, CreditCardOutlined, PrinterOutlined, EyeOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import { apiGet, apiPost } from "../../api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const { Title, Text } = Typography;
const { Panel } = Collapse;

const PatientsTab = ({ status, updateCount, searchQuery, onTabChange, refreshTrigger }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [loading, setLoading] = useState(false);
  const [patientData, setPatientData] = useState([]);
  const [totalPatients, setTotalPatients] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedKeys, setExpandedKeys] = useState([]);
  const [editablePrices, setEditablePrices] = useState([]);
  const [saving, setSaving] = useState({});
  const [paying, setPaying] = useState({});
  const [isPaymentDone, setIsPaymentDone] = useState({});
  const [pharmacyDetails, setPharmacyDetails] = useState(null);
  const [isPharmacyModalVisible, setIsPharmacyModalVisible] = useState(false);
  const [loadingPharmacyDetails, setLoadingPharmacyDetails] = useState(false);

   const [paymentMethod, setPaymentMethod] = useState('cash'); 
  const [isUPIModalVisible, setIsUPIModalVisible] = useState(false);
  const [upiPatientId, setUpiPatientId] = useState(null);

  const user = useSelector((state) => state.currentUserData);
  const doctorId = user?.role === "doctor" ? user?.userId : user?.createdBy;



  async function filterPatientsData(data) {
    const isPending = status === "pending";
    return data
      .map((patient) => {
        const filteredMeds = patient.medicines.filter(
          (med) => med.status === status
        );
        return filteredMeds.length > 0 ? { ...patient, medicines: filteredMeds } : null;
      })
      .filter(Boolean);
  }

  const fetchPharmacyDetails = async (addressId) => {
    try {
      setLoadingPharmacyDetails(true);
      const response = await apiGet(
        `/users/getPharmacyByClinicId/${addressId}`
      );

      if (response?.status === 200 && response?.data?.data) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error("Error fetching pharmacy details:", error);
      toast.error(
        error.response?.data?.message || "Error fetching pharmacy details",
        { position: "top-right", autoClose: 5000 }
      );
      return null;
    } finally {
      setLoadingPharmacyDetails(false);
    }
  };

  const showPharmacyDetails = async (addressId) => {
    const details = await fetchPharmacyDetails(addressId);
    if (details) {
      setPharmacyDetails(details);
      setIsPharmacyModalVisible(true);
    }
  };

  const fetchPharmacyPatients = async (page = 1, limit = pageSize) => {
    try {
      setLoading(true);
      const response = await apiGet(
        "/pharmacy/getAllPharmacyPatientsByDoctorID",
        {
          params: { 
            doctorId: doctorId, 
            status, 
            searchText: searchQuery,
            page,
            limit,
          },
        }
      );

      let dataArray = [];
      if (response?.status === 200 && response?.data?.data) {
        dataArray = await filterPatientsData(response.data.data.patients);

        dataArray.sort((a, b) => {
          const getIdNumber = (id) => parseInt(id.replace(/\D/g, "")) || 0;
          return getIdNumber(b.patientId) - getIdNumber(a.patientId);
        });

        if (searchQuery?.trim()) {
          const lowerSearch = searchQuery.toLowerCase();
          dataArray = dataArray.filter((patient) =>
            patient.patientId?.toLowerCase().includes(lowerSearch)
          );
        }
      }

      if (dataArray.length > 0) {
        const formattedData = dataArray.map((patient, index) => {
          const totalAmount = patient.medicines.reduce(
            (sum, med) => sum + (med.price || 0) * (med.quantity || 1),
            0
          );

          return {
            key: patient.patientId || `patient-${index}`,
            patientId: patient.patientId || `PAT-${index}`,
            doctorId: patient.doctorId || "N/A",
            name: patient.patientName || "Unknown Patient",
            medicines: patient.medicines.map(med => ({
              ...med,
              patientId: patient.patientId
            })) || [],
            totalMedicines: patient.medicines?.length || 0,
            totalAmount: totalAmount,
            status: status,
            originalData: patient,
            pharmacyData: patient.pharmacyData || null,
            addressId: patient.addressId || null,
          };
        });

        setPatientData(formattedData);
        setTotalPatients(response.data.data.pagination.totalPatients);
        setTotalPages(response.data.data.pagination.totalPages);
        setCurrentPage(response.data.data.pagination.page);
        setPageSize(response.data.data.pagination.limit);
      } else {
        setPatientData([]);
        setTotalPatients(0);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Error fetching pharmacy patients:", error);
      toast.error(
        error.response?.data?.message || "Error fetching pharmacy patients",
        { position: "top-right", autoClose: 5000 }
      );
      setPatientData([]);
      setTotalPatients(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const toggleCollapse = (patientId) => {
    setExpandedKeys((prev) =>
      prev.includes(patientId)
        ? prev.filter((id) => id !== patientId)
        : [...prev, patientId]
    );
  };

  const handlePriceChange = (patientId, medicineId, value) => {
    setPatientData((prev) =>
      prev.map((patient) =>
        patient.patientId === patientId
          ? {
              ...patient,
              medicines: patient.medicines.map((med) =>
                med._id === medicineId ? { ...med, price: value } : med
              ),
            }
          : patient
      )
    );
  };

  const enableEdit = (medicineId) => {
    setEditablePrices((prev) => [...prev, medicineId]);
  };

  const handlePriceSave = async (patientId, medicineId) => {
    try {
      setSaving((prev) => ({ ...prev, [medicineId]: true }));
      const patient = patientData.find((p) => p.patientId === patientId);
      const medicine = patient.medicines.find((m) => m._id === medicineId);
      const price = medicine.price;

      if (price === null || price === undefined) {
        toast.error("Please enter a valid price", {
          position: "top-right",
          autoClose: 5000,
        });
        return;
      }

      await apiPost(`/pharmacy/updatePatientMedicinePrice`, {
        medicineId,
        patientId,
        price,
        doctorId,
      });

      toast.success("Price updated successfully", {
        position: "top-right",
        autoClose: 3000,
      });
      setEditablePrices((prev) => prev.filter((id) => id !== medicineId));
    } catch (error) {
      console.error("Error updating medicine price:", error);
      toast.error(
        error.response?.data?.message || "Failed to update price",
        { position: "top-right", autoClose: 5000 }
      );
    } finally {
      setSaving((prev) => ({ ...prev, [medicineId]: false }));
    }
  };

  const handlePayment = async (patientId) => {
    try {
      setPaying((prev) => ({ ...prev, [patientId]: true }));
      const patient = patientData.find((p) => p.patientId === patientId);
      const totalAmount = patient.medicines.reduce(
        (sum, med) => sum + (med.price || 0) * (med.quantity || 1),
        0
      );

      if (totalAmount <= 0) {
        toast.error("No valid prices set for payment", {
          position: "top-right",
          autoClose: 5000,
        });
        return;
      }

      const hasUnconfirmedPrices = patient.medicines.some(med => 
        editablePrices.includes(med._id) && 
        (med.price !== null && med.price !== undefined)
      );

      if (hasUnconfirmedPrices) {
        toast.error("Please confirm all medicine prices before payment", {
          position: "top-right",
          autoClose: 5000,
        });
        return;
      }

      const response = await apiPost(`/pharmacy/pharmacyPayment`, {
        patientId,
        doctorId,
        amount: totalAmount,
        paymentMethod,
        medicines: patient.medicines.map((med) => ({
          medicineId: med._id,
          price: med.price,
          quantity: med.quantity,
          pharmacyMedID: med.pharmacyMedID || null,
        })),
      });

      if (response.status === 200) {
        setIsPaymentDone((prev) => ({ ...prev, [patientId]: true }));
        updateCount();
        toast.success("Payment processed successfully", {
          position: "top-right",
          autoClose: 3000,
        });
        if (onTabChange) onTabChange("2");
        await fetchPharmacyPatients(currentPage, pageSize);
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      setIsPaymentDone((prev) => ({ ...prev, [patientId]: false }));
      toast.error(
        error.response?.data?.message || "Failed to process payment",
        { position: "top-right", autoClose: 5000 }
      );
    } finally {
      setPaying((prev) => ({ ...prev, [patientId]: false }));
    }
  };

const handlePrint = (patient) => {
  const { originalData, pharmacyData, medicines } = patient;
  const completedMedicines = medicines.filter((med) => ["completed", "complete", "paid"].includes(med.status.toLowerCase()));

  if (!completedMedicines.length) {
    toast.error("No completed medicines to print.", {
      position: "top-right",
      autoClose: 5000,
    });
    return;
  }

  const isPharmacyDetailsEmptyOrNull =
    !pharmacyData ||
    Object.keys(pharmacyData).length === 0 ||
    Object.values(pharmacyData).every((value) => value === null || value === undefined);

  if (isPharmacyDetailsEmptyOrNull) {
    toast.error("Please fill the pharmacy details to generate a bill.", {
      position: "top-right",
      autoClose: 5000,
    });
    return;
  }

  // Create a hidden iframe
  const iframe = document.createElement("iframe");
  iframe.style.display = "none";
  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentWindow.document;

  const total = completedMedicines.reduce(
    (sum, med) => sum + (Number(med.price) || 0) * (Number(med.quantity) || 1),
    0
  );
  const patientNumber = String(originalData.patientId || "").replace(/\D/g, "");
  const invoiceNumber = `INV-${patientNumber.padStart(3, "0")}`;
  const billingDate = new Date().toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const itemDate = completedMedicines.length === 1
    ? (completedMedicines[0].updatedAt
        ? new Date(completedMedicines[0].updatedAt).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          })
        : new Date(completedMedicines[0].createdAt).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          }))
    : new Date(completedMedicines[0].createdAt).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });

  const [firstName, ...lastNameParts] = originalData.patientName.split(" ");
  const lastName = lastNameParts.join(" ") || "";
  const headerUrl = pharmacyData?.pharmacyHeaderUrl || "";
  const providerName = pharmacyData?.pharmacyName || "Pharmacy";
  const contactInfoHTML = `
    <div class="provider-name">${providerName}</div>
    <p>${pharmacyData?.pharmacyAddress || "N/A"}</p>
    <p>GST: ${pharmacyData?.pharmacyGst || "N/A"}</p>
    <p>PAN: ${pharmacyData?.pharmacyPan || "N/A"}</p>
    <p>Registration No: ${pharmacyData?.pharmacyRegistrationNo || "N/A"}</p>
  `;
  const sectionHTML = `
    <div class="section compact-spacing">
      <h3 class="section-title">Medicines</h3>
      <table class="data-table">
        <thead>
          <tr>
            <th>SL No.</th>
            <th>Name</th>
            <th>Price (₹)</th>
            <th>Quantity</th>
            <th>SGST (%)</th>
            <th>CGST (%)</th>
            <th>Subtotal (₹)</th>
          </tr>
        </thead>
        <tbody>
          ${completedMedicines
            .map(
              (med, idx) => {
                const subtotal = (Number(med.price) || 0) * (Number(med.quantity) || 1);
                return `
                <tr>
                  <td>${idx + 1}.</td>
                  <td>${med.medName || ""}</td>
                  <td class="price-column">${Number(med.price || 0).toFixed(2)}</td>
                  <td>${Number(med.quantity || 1)}</td>
                  <td>${Number(med.gst || 0)}</td>
                  <td>${Number(med.cgst || 0)}</td>
                  <td class="price-column">${subtotal.toFixed(2)}</td>
                </tr>
              `;
              }
            )
            .join("")}
        </tbody>
      </table>
      <div class="section-total">
        <p class="gst-text" style="margin: 0; font-size: 13px; color: #000000ff;">GST included</p>
        <p class="total-text">Medicines Total: ₹${total.toFixed(2)}</p>
      </div>
    </div>
  `;
  const headerSectionHTML = headerUrl
    ? `
      <div class="invoice-header-image-only">
        <img src="${headerUrl}" alt="Header" />
      </div>
    `
    : "";

  const printContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Invoice</title>
        <meta charset="utf-8" />
        <style>
          html, body { margin: 0; padding: 0; font-family: Arial, sans-serif; background: #fff; font-size: 14px; }
          @page { margin: 0; size: A4; }
          @media print {
            @page { margin: 0; size: A4; }
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
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
          .invoice-header-image-only { width: 100%; margin-bottom: 12px; page-break-inside: avoid; }
          .invoice-header-image-only img { display: block; width: 100%; height: auto; max-height: 220px; object-fit: contain; background: #fff; }
          .invoice-header-section { display: flex; justify-content: space-between; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px solid #eee; }
          .provider-info { text-align: left; }
          .provider-name { font-size: 20px; font-weight: bold; color: #333; margin-bottom: 6px; }
          .contact-info p { margin: 3px 0; color: #444; }
          .invoice-details { text-align: right; }
          .invoice-detail-item { font-size: 14px; }
          .section { margin-bottom: 20px; }
          .section-title { font-size: 16px; font-weight: bold; color: #333; margin-bottom: 10px; padding-bottom: 5px; border-bottom: 1px solid #ddd; }
          .patient-info { display: flex; justify-content: space-between; background-color: #f8f9fa; padding: 12px; border-radius: 5px; }
          .patient-info p { margin: 3px 0; }
          .data-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
          .data-table th, .data-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          .data-table th { background-color: #f8f9fa; font-weight: bold; }
          .price-column { text-align: right; }
          .section-total { text-align: right; margin-top: 8px; }
          .total-text { font-weight: bold; font-size: 14px; color: #333; }
          .grand-total-section { margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 5px; }
          .grand-total-row { display: flex; justify-content: space-between; font-size: 16px; font-weight: bold; color: #333; border-top: 2px solid #333; padding-top: 8px; margin-top: 10px; }
          .footer { text-align: center; padding: 15px 0; border-top: 1px solid #ddd; color: #666; background: #fff; }
          .powered-by { display: flex; align-items: center; justify-content: center; margin-top: 8px; gap: 6px; color: #666; font-size: 12px; }
          .footer-logo { width: 18px; height: 18px; object-fit: contain; }
          .compact-spacing { margin-bottom: 15px; }
          .compact-spacing:last-child { margin-bottom: 0; }
          @media print {
            .footer { position: relative; margin-top: auto; }
            .invoice-container { min-height: auto; height: auto; }
            .footer { page-break-before: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <div class="invoice-content">
            ${headerSectionHTML}
            ${
              headerSectionHTML
                ? ""
                : `
            <div class="provider-details">
              ${contactInfoHTML}
            </div>
            `
            }
            <div class="section compact-spacing">
              <h3 class="section-title">Patient Information</h3>
              <div class="patient-info">
                <div>
                  <p><strong>Patient ID:</strong> ${originalData.patientId}</p>
                  <p><strong>First Name:</strong> ${firstName}</p>
                  <p><strong>Last Name:</strong> ${lastName}</p>
                  <p><strong>Mobile:</strong> ${originalData.mobile || "Not Provided"}</p>
                </div>
                <div>
                
                  <p><strong>Referred by Dr.</strong> ${user?.firstname || "N/A"} ${user?.lastname || "N/A"}</p>
                  <p><strong>Appointment Date&Time:</strong> ${itemDate}</p>
                  <div class="invoice-detail-item"><strong>Invoice No:</strong> #${invoiceNumber}</div>
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
              <img src="../assets/logo.png" alt="Vydhyo Logo" class="footer-logo">
              <span>Powered by Vydhyo</span>
            </div>
          </div>
        </div>
        <script>
          (function() {
            function triggerPrint() {
              try { window.focus(); } catch (e) {}
              try { window.print(); } catch (e) {}
              // Remove iframe after printing
              setTimeout(() => {
                document.body.removeChild(document.querySelector('iframe'));
              }, 1000);
            }
            function waitForImagesAndPrint() {
              var imgs = Array.from(document.images || []);
              if (imgs.length === 0) { return triggerPrint(); }
              var loaded = 0;
              var done = false;
              function check() {
                if (done) return;
                loaded++;
                if (loaded >= imgs.length) {
                  done = true;
                  triggerPrint();
                }
              }
              imgs.forEach(function(img) {
                if (img.complete) {
                  check();
                } else {
                  img.addEventListener('load', check, { once: true });
                  img.addEventListener('error', check, { once: true });
                }
              });
            }
            if (document.readyState === 'complete') {
              waitForImagesAndPrint();
            } else {
              window.addEventListener('load', waitForImagesAndPrint, { once: true });
            }
          })();
        </script>
      </body>
    </html>
  `;

  iframeDoc.open();
  iframeDoc.write(printContent);
  iframeDoc.close();
};

  // Utility function to calculate age from DOB
  const calculateAge = (dob) => {
    if (!dob) return "N/A";
    try {
      const [day, month, year] = dob.split("-").map(Number);
      const dobDate = new Date(year, month - 1, day);
      const today = new Date();
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

  const medicineColumns = [
    {
    title: "Medicine Name",
    dataIndex: "medName",
    key: "medName",
    render: (name, medicine) => (
      <div>
        <Text strong>{name} {medicine.dosage}</Text>
       
      </div>
    ),
  },
    {
      title: "Price",
      key: "price",
      render: (_, medicine) => {
        const isEditable = editablePrices.includes(medicine._id);
        const isPriceInitiallyNull = medicine.price === null || medicine.price === undefined;
        return (
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <InputNumber
              min={0}
              style={{ width: "120px" }}
              placeholder="Enter price"
              value={medicine.price}
              disabled={
                medicine.status !== "pending" ||
                (!isEditable && !isPriceInitiallyNull)
              }
              onFocus={() => !isEditable && enableEdit(medicine._id)}
              onChange={(value) => handlePriceChange(medicine.patientId, medicine._id, value)}
            />
            <Button
              type="primary"
              icon={<CheckOutlined />}
              onClick={() => handlePriceSave(medicine.patientId, medicine._id)}
              disabled={
                medicine.price === null ||
                medicine.price === undefined ||
                saving[medicine._id] ||
                (!isEditable && !isPriceInitiallyNull)
              }
              loading={saving[medicine._id]}
            />
          </div>
        );
      },
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      render: (quantity) => `${quantity} units`,
    },
    {
      title: "SGST (%)",
      dataIndex: "gst",
      key: "gst",
      render: (gst) => `${gst}%`,
    },
    {
      title: "CGST (%)",
      dataIndex: "cgst",
      key: "cgst",
      render: (cgst) => `${cgst}%`,
    },
    {
      title: "Total",
      key: "total",
      render: (_, record) => {
        const price = parseFloat(record.price) || 0;
        const quantity = parseInt(record.quantity) || 0;
        return price > 0 ? `₹${(price * quantity).toFixed(2)}` : "N/A";
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "pending" ? "orange" : "green"}>
          {status?.charAt(0).toUpperCase() + status?.slice(1)}
        </Tag>
      ),
    },
  ];

  const columns = [
    {
      title: "Patient ID",
      dataIndex: "patientId",
      key: "patientId",
      width: 120,
    },
    {
      title: "Patient",
      key: "patient",
      width: 200,
      render: (_, record) => (
        <div style={{ display: "flex", alignItems: "center" }}>
          <span>{record.name}</span>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: () => (
        <Tag color={status === "pending" ? "orange" : "green"}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      width: 120,
      render: (_, record) => (
        <div style={{ display: "flex", gap: "8px" }}>
          <Button 
            type="link" 
            onClick={() => toggleCollapse(record.patientId)}
          >
            {expandedKeys.includes(record.patientId)
              ? "Hide Medicines"
              : "View Medicines"}
          </Button>
          
        </div>
      ),
    },
  ];

  useEffect(() => {
    if (doctorId) fetchPharmacyPatients(currentPage, pageSize);
  }, [doctorId, status, searchQuery, refreshTrigger]);

  const handlePageChange = (page, newPageSize) => {
    setCurrentPage(page);
    if (newPageSize !== pageSize) {
      setPageSize(newPageSize);
    }
    fetchPharmacyPatients(page, newPageSize);
  };

  const startIndex = totalPatients > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endIndex = Math.min(currentPage * pageSize, totalPatients);

   const selectedUPIPatient = patientData.find((p) => p.patientId === upiPatientId);
 const selectedUPITotal = selectedUPIPatient
   ? selectedUPIPatient.medicines.reduce(
       (sum, med) => sum + (Number(med.price) || 0) * (Number(med.quantity) || 1),
       0
     )
   : 0;

   const [qrCodeUrl, setQrCodeUrl] = useState(null);
      const getQrCodeUrl = async (record) => {
       console.log(record, "record for qr");
         try {
           const res = await apiGet(
             `/users/getClinicsQRCode/${record?.addressId}?userId=${doctorId}`
           );
           console.log(res, "clinic qr res");
      
           if (res.status === 200 && res.data?.status === "success" ) {
   
            const url = res?.data?.data?.pharmacyQrCode || null;
            setQrCodeUrl(url);
            console.log(url, "clinic qr url");
           } else {
             toast.error("No clinic QR found for this clinic.");
           }
         } catch (err) {
           toast.error(err?.response?.data?.message || "Failed to load clinic QR.");
         }
       };

  return (
    <div>
      <ToastContainer />
      <Card style={{ borderRadius: "8px", marginBottom: "24px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
        <Row justify="space-between" align="middle" style={{ marginBottom: "16px" }}>
          <Col>
            <Title level={4} style={{ margin: 0, color: "#1A3C6A" }}>
              {status === "pending" ? "Pending" : "Completed"} Patients
            </Title>
          </Col>
        </Row>

        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={patientData}
            pagination={false}
            size="middle"
            showHeader={true}
            scroll={{ x: "max-content" }}
            locale={{
              emptyText: <Empty description={loading ? "Loading..." : "No patients found"} />
            }}
            expandable={{
              expandedRowKeys: expandedKeys,
              onExpand: (_, record) => toggleCollapse(record.patientId),
              expandedRowRender: (record) => {
                const totalAmount = record.medicines.reduce(
                  (sum, med) => sum + (med.price || 0) * (med.quantity || 1),
                  0
                );
                const hasPending = record.medicines.some(
                  (med) => med.status === "pending"
                );

                return (
                  <Collapse defaultActiveKey={["1"]} style={{ background: "#f9fafb", borderRadius: "6px", border: "1px solid #e5e7eb" }}>
                    <Panel header="Medicine Details" key="1" style={{ background: "#ffffff", borderRadius: "6px", border: "none" }}>
                      <Table
                        columns={medicineColumns}
                        dataSource={record.medicines.map(med => ({
                          ...med,
                          key: med._id
                        }))}
                        rowKey="_id"
                        pagination={false}
                        style={{ marginBottom: "16px" }}
                      />
                      <Row
   justify="space-between"
   align="middle"
   style={{ padding: "12px", background: "#f1f5f9", borderRadius: "6px", gap: 12, flexWrap: "wrap" }}
 >
   <Col>
     <Text strong style={{ marginRight: 16 }}>
       Total Amount: ₹ {totalAmount.toFixed(2)}
     </Text>
     {status !== "completed" && (
       <Radio.Group
         value={paymentMethod || "cash"}
         onChange={(e) => {
           const method = e.target.value;
           setPaymentMethod ( method )
          if (method === "upi") {
             setUpiPatientId(record?.patientId);
             getQrCodeUrl(record)
             // setIsUPIModalVisible(true); // (optional) auto-open
           }
         }}
       >
         <Radio value="cash">Cash</Radio>
         <Radio value="upi">UPI</Radio>
       </Radio.Group>
     )}
   </Col>

   <Col>
     {status === "completed" ? (
       <Button
         type="primary"
         icon={<PrinterOutlined />}
         onClick={() => handlePrint(record)}
         style={{ background: "#1A3C6A", borderColor: "#1A3C6A", color: "white", marginTop: 8 }}
       >
         Print Invoice
       </Button>
     ) : (paymentMethod|| "cash") === "cash" ? (
      <Popconfirm
         title="Confirm Payment"
         description={
           <div style={{ textAlign: "center" }}>
             <Typography.Text>Cash ₹{totalAmount.toFixed(2)}</Typography.Text>
           </div>
         }
         onConfirm={() => handlePayment(record.patientId)}
         okText="Payment Done"
         cancelText="Cancel"
         disabled={isPaymentDone[record.patientId]}
       >
         <Button
           type="primary"
           icon={<CreditCardOutlined />}
           loading={paying[record.patientId]}
           disabled={
             totalAmount <= 0 ||
             paying[record.patientId] ||
             !hasPending ||
             isPaymentDone[record.patientId]
           }
           style={{ background: "#1A3C6A", borderColor: "#1A3C6A", color: "white", marginTop: 8 }}
         >
           {hasPending && !isPaymentDone[record.patientId] ? "Process Payment" : "Paid"}
         </Button>
       </Popconfirm>
     ) : (
       <>
         <Button
           type="primary"
           icon={<CreditCardOutlined />}
           disabled
           style={{
             background: "#1A3C6A",
             borderColor: "#1A3C6A",
             color: "white",
             marginTop: 8,
             marginRight: 8,
           }}
         >
           UPI Selected
         </Button>
         <Button
           onClick={() => {
             setUpiPatientId(record.patientId);
             setIsUPIModalVisible(true);
           }}
           style={{ marginTop: 8 }}
           disabled={!qrCodeUrl}
         >
           Show QR
         </Button>
       </>
     )}
   </Col>
 </Row>
                    </Panel>
                  </Collapse>
                );
              }
            }}
          />

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
            <span style={{ lineHeight: "32px" }}>
              {totalPatients > 0
                ? `Showing ${startIndex} to ${endIndex} of ${totalPatients} results`
                : "No results found"}
            </span>
            {totalPatients > 0 && (
              <Pagination
                current={currentPage}
                total={totalPatients}
                pageSize={pageSize}
                showQuickJumper={false}
                onChange={handlePageChange}
                onShowSizeChange={handlePageChange}
              />
            )}
          </div>
        </Spin>
      </Card>

      {/* Pharmacy Details Modal */}
      <Modal
        title="Pharmacy Details"
        visible={isPharmacyModalVisible}
        onCancel={() => setIsPharmacyModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsPharmacyModalVisible(false)}>
            Close
          </Button>,
        ]}
        width={800}
      >
        <Spin spinning={loadingPharmacyDetails}>
          {pharmacyDetails ? (
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Pharmacy Name" span={2}>
                {pharmacyDetails.pharmacyName}
              </Descriptions.Item>
              <Descriptions.Item label="Registration Number">
                {pharmacyDetails.pharmacyRegistrationNo || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="GST Number">
                {pharmacyDetails.pharmacyGst || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="PAN Number">
                {pharmacyDetails.pharmacyPan || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Address" span={2}>
                {pharmacyDetails.pharmacyAddress || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Contact Number">
                {pharmacyDetails.pharmacyContactNo || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {pharmacyDetails.pharmacyEmail || "N/A"}
              </Descriptions.Item>
              {pharmacyDetails.pharmacyHeaderUrl && (
                <Descriptions.Item label="Header Image" span={2}>
                  <img
                    src={pharmacyDetails.pharmacyHeaderUrl}
                    alt="Pharmacy Header"
                    style={{ maxWidth: "100%", maxHeight: "200px" }}
                  />
                </Descriptions.Item>
              )}
            </Descriptions>
          ) : (
            <Empty description="No pharmacy details found" />
          )}
        </Spin>
      </Modal>

   <Modal
      open={isUPIModalVisible}
      title="Pay via UPI"
     footer={[
    <Button
      key="confirm"
      type="primary"
      loading={!!paying[upiPatientId]}
     disabled={!upiPatientId || !!paying[upiPatientId]}
      onClick={async () => {
        await handlePayment(upiPatientId);
        setIsUPIModalVisible(false);
      }}
    >
      Confirm
    </Button>,
    <Button
      key="close"
      onClick={() => setIsUPIModalVisible(false)}
    >
      Close
    </Button>,
  ]}
      onCancel={() => setIsUPIModalVisible(false)}
    >
       
    <div style={{ textAlign: "center" }}>
      <img src={qrCodeUrl} alt="UPI QR" style={{ maxWidth: 260, width: "100%", borderRadius: 8 }} />
      <div style={{ marginTop: 12 }}>
      <Text type="secondary">
            {selectedUPITotal > 0
            ? `Scan the QR to pay ₹${selectedUPITotal.toFixed(2)}`
            : "Scan the QR to pay"}
        </Text>
      </div>
    </div>
  </Modal>
    </div>
  );
};

export default PatientsTab;