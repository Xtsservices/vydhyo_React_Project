import React, { useEffect, useRef, useState } from "react";
import {
  Table,
  Card,
  Typography,
  Row,
  Col,
  InputNumber,
  Button,
  Collapse,
  Popconfirm,
  Tag,
  Radio,
  Modal
} from "antd";
import { CheckOutlined, CreditCardOutlined, PrinterOutlined } from "@ant-design/icons";
import { apiGet, apiPost } from "../../api";
import { useSelector } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { set } from "date-fns";

const { Title, Text } = Typography;
const { Panel } = Collapse;

const LabPatientManagement = ({ status, updateCount, searchValue }) => {
  const hasfetchRevenueCount = useRef(false);
  
  const user = useSelector((state) => state.currentUserData);
  const doctorId = user?.role === "doctor" ? user?.userId : user?.createdBy;
  const [patients, setPatients] = useState([]);
  const [saving, setSaving] = useState({});
  const [editablePrices, setEditablePrices] = useState([]);
  const [expandedKeys, setExpandedKeys] = useState([]);
  const [paying, setPaying] = useState({});
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [isPaymentDone, setIsPaymentDone] = useState({});
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0,
  });

   const [paymentMethod, setPaymentMethod] = useState("");
  const [isUPIModalVisible, setIsUPIModalVisible] = useState(false);
  const [upiPatientId, setUpiPatientId] = useState(null);

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

  // Fetch data
  async function getAllTestsPatientsByDoctorID(page = 1, pageSize = 5) {
    try {
      setLoadingPatients(true);
      const response = await apiGet(
        `/lab/getAllTestsPatientsByDoctorID/${doctorId}?searchValue=${searchValue}&status=${status}&page=${page}&limit=${pageSize}`
      );

      console.log("getAllTestsPatientsByDoctorID", response);
      if (response.status === 200 && response?.data?.data) {
        let filteredData = response.data.data.patients;

        // Client-side filtering to ensure only the specified status is shown
        filteredData = filteredData.filter((patient) => {
          if (status === "completed") {
            return patient.tests.every((test) => test.status === "completed");
          } else if (status === "pending") {
            return patient.tests.some((test) => test.status === "pending");
          }
          return true;
        });

        setPatients(filteredData);
        setPagination({
          current: response.data.data.pagination.page,
          pageSize: response.data.data.pagination.limit,
          total: response.data.data.pagination.totalPatients,
        });

        // Initialize isPaymentDone for each patient
        const paymentDoneState = {};
        filteredData.forEach((patient) => {
          paymentDoneState[patient.patientId] = !patient.tests.some(
            (test) => test.status === "pending"
          );
        });
        setIsPaymentDone(paymentDoneState);
      }
    } catch (error) {
      console.error("Error fetching patient tests:", error);
      toast.error(
        error.response?.data?.message || "Failed to load patient data",
        {
          position: "top-right",
          autoClose: 5000,
        }
      );
    } finally {
      setLoadingPatients(false);
    }
  }

  const handlePriceChange = (patientId, testId, value) => {
    setPatients((prev) =>
      prev.map((patient) =>
        patient.patientId === patientId
          ? {
              ...patient,
              tests: patient.tests.map((test) =>
                test._id === testId ? { ...test, price: value } : test
              ),
            }
          : patient
      )
    );
  };

  const enableEdit = (testId) => {
    setEditablePrices((prev) =>
      prev.includes(testId) ? prev : [...prev, testId]
    );
  };

  const handlePriceSave = async (patientId, testId, testName) => {
    try {
      setSaving((prev) => ({ ...prev, [testId]: true }));

      const patient = patients.find((p) => p.patientId === patientId);
      if (!patient) {
        toast.error("Patient not found", {
          position: "top-right",
          autoClose: 5000,
        });
        return;
      }

      const test = patient.tests.find((t) => t._id === testId);
      if (!test) {
        toast.error("Test not found", {
          position: "top-right",
          autoClose: 5000,
        });
        return;
      }

      const trimmedTestName = testName?.trim();
      const price = test.price;

      if (price === null || price === undefined || isNaN(price) || price < 0) {
        toast.error("Please enter a valid price", {
          position: "top-right",
          autoClose: 5000,
        });
        return;
      }

      const response = await apiPost(`/lab/updatePatientTestPrice`, {
        testId,
        patientId,
        price,
        doctorId,
        testName: trimmedTestName,
      });

      if (response?.success || response?.status === 200) {
        console.log(response, "test price update");
        toast.success("Price updated successfully", {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        throw new Error(response?.message || "Unknown server error");
      }

      setEditablePrices((prev) => prev.filter((id) => id !== testId));
    } catch (error) {
      console.error("Error updating test price:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update price";
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setSaving((prev) => ({ ...prev, [testId]: false }));
    }
  };

  const handlePayment = async (patientId) => {
    try {
      setPaying((prev) => ({ ...prev, [patientId]: true }));
      const patient = patients.find((p) => p.patientId === patientId);
      const totalAmount = patient.tests.reduce(
        (sum, test) => sum + (test.price || 0),
        0
      );

       const validTests = patient.tests.filter(
      (test) => test.price !== null && test.price !== undefined
    );
      if (totalAmount <= 0) {
        toast.error("No valid prices set for payment", {
          position: "top-right",
          autoClose: 5000,
        });
        return;
      }

      // Check if all test prices are confirmed (not in editable state)
      const hasUnconfirmedPrices = patient.tests.some(test => 
        editablePrices.includes(test._id) && 
        (test.price !== null && test.price !== undefined)
      );



      if (hasUnconfirmedPrices) {
        toast.error("Please confirm all test prices before payment", {
          position: "top-right",
          autoClose: 5000,
        });
        return;
      }

      const response = await apiPost(`/lab/processPayment`, {
        patientId,
        doctorId,
        amount: totalAmount,
        paymentMethod: paymentMethod,
        tests: validTests.map((test) => ({
          testId: test._id,
          price: test.price,
          labTestID: test.labTestID,
        })),
      });

      if (response.status === 200) {
        setIsPaymentDone((prev) => ({ ...prev, [patientId]: true }));
        updateCount();
        toast.success("Payment processed successfully", {
          position: "top-right",
          autoClose: 3000,
        });
        await getAllTestsPatientsByDoctorID(pagination.current, pagination.pageSize);
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      toast.error(
        error.response?.data?.message || "Failed to process payment",
        {
          position: "top-right",
          autoClose: 5000,
        }
      );
    } finally {
      setPaying((prev) => ({ ...prev, [patientId]: false }));
    }
  };

const printInvoice = (patient) => {
  const { patientName, patientId, tests, labData, DOB, gender, mobile } = patient;
  const completedTests = tests.filter((t) => ["completed", "complete", "paid"].includes(t.status.toLowerCase()));
  
  if (!completedTests.length) {
    toast.error("No completed tests to print.", {
      position: "top-right",
      autoClose: 5000,
    });
    return;
  }

  const isLabDetailsEmptyOrNull =
    !labData ||
    Object.keys(labData).length === 0 ||
    Object.values(labData).every((value) => value === null || value === undefined);

  if (isLabDetailsEmptyOrNull) {
    toast.error("Please fill the lab details to generate a bill.", {
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

  const total = completedTests.reduce((sum, test) => sum + (Number(test.price) || 0), 0);
  const patientNumber = String(patientId || "").replace(/\D/g, "");
  const invoiceNumber = `INV-${patientNumber.padStart(3, "0")}`;
  const now = new Date();
  const billingDate = now.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const itemDate = completedTests.length === 1
    ? (completedTests[0].updatedAt
        ? new Date(completedTests[0].updatedAt).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          })
        : new Date(completedTests[0].createdAt).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          }))
    : new Date(completedTests[0].createdAt).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });

  const [firstName, ...lastNameParts] = patientName.split(" ");
  const lastName = lastNameParts.join(" ") || "";
  const headerUrl = labData?.labHeaderUrl || "";
  const providerName = labData?.labName || "Diagnostic Lab";
  const contactInfoHTML = `
    <div class="provider-name">${providerName}</div>
    <p>${labData?.labAddress || "N/A"}</p>
    <p>GST: ${labData?.labGst || "N/A"}</p>
    <p>PAN: ${labData?.labPan || "N/A"}</p>
    <p>Registration No: ${labData?.labRegistrationNo || "N/A"}</p>
  `;
  const sectionHTML = `
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
              <td>${test.testName || ""}</td>
              <td class="price-column">${Number(test.price || 0).toFixed(2)}</td>
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
                  <p><strong>Patient ID:</strong> ${patientId}</p>
                  <p><strong>First Name:</strong> ${firstName}</p>
                  <p><strong>Last Name:</strong> ${lastName}</p>
                  <p><strong>Mobile:</strong> ${mobile || "Not Provided"}</p>
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

  const handleTableChange = (pagination) => {
    getAllTestsPatientsByDoctorID(pagination.current, pagination.pageSize);
  };

  useEffect(() => {
    if (doctorId && user && !hasfetchRevenueCount.current) {
      hasfetchRevenueCount.current = true;
      getAllTestsPatientsByDoctorID();
    }
  }, [user, doctorId, status, searchValue]);

  const toggleCollapse = (patientId) => {
    setExpandedKeys((prev) =>
      prev.includes(patientId)
        ? prev.filter((id) => id !== patientId)
        : [...prev, patientId]
    );
  };

  // Main table columns
  const columns = [
    {
      title: "Patient ID",
      dataIndex: "patientId",
      key: "patientId",
    },
    {
      title: "Patient Name",
      dataIndex: "patientName",
      key: "patientName",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (_, record) => {
        const allCompleted = record.tests.every((test) => test.status === "completed");
        const anyPending = record.tests.some((test) => test.status === "pending");

        let statusText = "Partial";
        let color = "orange";

        if (allCompleted) {
          statusText = "Completed";
          color = "green";
        } else if (anyPending && !record.tests.some((test) => test.status === "completed")) {
          statusText = "Pending";
          color = "gold";
        }

        return <Tag color={color}>{statusText}</Tag>;
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Button type="link" onClick={() => toggleCollapse(record.patientId)}>
          {expandedKeys.includes(record.patientId) ? "Hide Tests" : "View Tests"}
        </Button>
      ),
    },
  ];

  // Test table columns with status
  const testColumns = [
    {
      title: "Test Name",
      dataIndex: "testName",
      key: "testName",
    },
    {
      title: "Price",
      key: "price",
      render: (_, test, index, patientId) => {
        const isEditable = editablePrices.includes(test._id);
        const isPriceInitiallyNull =
          test.price === null || test.price === undefined;
        return (
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <InputNumber
              min={0}
              style={{ width: "120px" }}
              placeholder="Enter price"
              value={test.price}
              disabled={
                test.status !== "pending" ||
                (!isEditable && !isPriceInitiallyNull)
              }
              onFocus={() => {
                if (!isEditable) enableEdit(test._id);
              }}
              onChange={(value) =>
                handlePriceChange(patientId, test._id, value)
              }
            />
            <Button
              type="primary"
              icon={<CheckOutlined />}
              onClick={() =>
                handlePriceSave(patientId, test._id, test.testName)
              }
              disabled={
                test.price === null ||
                test.price === undefined ||
                saving[test._id] ||
                (!isEditable && !isPriceInitiallyNull)
              }
              loading={saving[test._id]}
            />
          </div>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color, text;
        switch (status) {
          case "completed":
            color = "green";
            text = "Completed";
            break;
          case "pending":
            color = "gold";
            text = "Pending";
            break;
          case "cancelled":
            color = "red";
            text = "Cancelled";
            break;
          case "in_progress":
            color = "blue";
            text = "In Progress";
            break;
          default:
            color = "gray";
            text = "Unknown";
        }

        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: "Created Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (createdAt) => {
        const date = new Date(createdAt);
        return (
          <Typography.Text>
            {date.toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </Typography.Text>
        );
      },
    },
  ];

 const selectedUPIPatient = patients.find((p) => p.patientId === upiPatientId);
 const selectedUPITotal = selectedUPIPatient
   ? selectedUPIPatient.tests.reduce((sum, t) => sum + (t.price || 0), 0)
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

         const url = res?.data?.data?.labQrCode || null;
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
      <Card
        style={{
          borderRadius: "8px",
          marginBottom: "24px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <Row
          justify="space-between"
          align="middle"
          style={{ marginBottom: "16px" }}
        >
          <Col>
            <Title level={4} style={{ margin: 0, color: "#1A3C6A" }}>
              Patients {status === "pending" ? "Pending" : "Completed"} Tests
            </Title>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={patients}
          rowKey="patientId"
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            pageSizeOptions: ['5', '10', '20'],
            onChange: (page, pageSize) => handleTableChange({ current: page, pageSize }),
            onShowSizeChange: (current, size) => handleTableChange({ current, pageSize: size }),
          }}
          loading={loadingPatients}
          expandable={{
            expandedRowKeys: expandedKeys,
            onExpand: (_, record) => toggleCollapse(record.patientId),
            expandedRowRender: (record) => {
              const totalAmount = record.tests.reduce(
                (sum, test) => sum + (test.price || 0),
                0
              );
              const hasPendingTests = record.tests.some(
                (test) => test.status === "pending"
              );

              return (
                <Collapse
                  defaultActiveKey={["1"]}
                  style={{
                    background: "#f9fafb",
                    borderRadius: "6px",
                    border: "1px solid #e5e7eb",
                  }}
                >
                  <Panel
                    header="Test Details"
                    key="1"
                    style={{
                      background: "#ffffff",
                      borderRadius: "6px",
                      border: "none",
                    }}
                  >
                    <Table
                      columns={testColumns.map((col) => ({
                        ...col,
                        render: (text, test, index) =>
                          col.render
                            ? col.render(text, test, index, record.patientId)
                            : text,
                      }))}
                      dataSource={record.tests}
                      rowKey="_id"
                      pagination={false}
                      style={{ marginBottom: "16px" }}
                    />
 <Row
   justify="space-between"
   align="middle"
   style={{
     padding: "12px",
     background: "#f1f5f9",
     borderRadius: "6px",
     gap: 12,
    flexWrap: "wrap",
   }}
 >
   <Col>
     <Typography.Text strong style={{ marginRight: 16 }}>
       Total Amount: ₹ {totalAmount.toFixed(2)}
     </Typography.Text>
     {status !== "completed" && (
       <Radio.Group
         value={paymentMethod || "cash"}
         onChange={(e) => {
           const method = e.target.value;
           setPaymentMethod(method);
           if (method === "upi") {
             setUpiPatientId(record.patientId);
             getQrCodeUrl(record);
            //  setIsUPIModalVisible(true);
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
         onClick={() => printInvoice(record)}
         style={{
           background: "#1A3C6A",
           borderColor: "#1A3C6A",
           color: "white",
           marginTop: 8,
         }}
       >
         Print Invoice
       </Button>
     ) : (paymentMethod || "cash") === "cash" ? (
       <Popconfirm
         title="Confirm Payment"
         description={
           <div style={{ textAlign: "center" }}>
             <Typography.Text>
               Cash ₹{totalAmount.toFixed(2)}
             </Typography.Text>
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
             !hasPendingTests ||
             isPaymentDone[record.patientId]
           }
           style={{
             background: "#1A3C6A",
             borderColor: "#1A3C6A",
             color: "white",
             marginTop: 8,
           }}
         >
           {hasPendingTests && !isPaymentDone[record.patientId]
             ? "Process Payment"
             : "Paid"}
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
            },
          }}
          style={{ background: "#ffffff", borderRadius: "6px" }}
        />
      </Card>

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
        <img
          src={qrCodeUrl}
          alt="UPI QR"
          style={{ maxWidth: 260, width: "100%", borderRadius: 8 }}
        />
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

export default LabPatientManagement;