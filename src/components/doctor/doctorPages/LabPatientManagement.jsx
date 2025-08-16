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
} from "antd";
import { CheckOutlined, CreditCardOutlined, PrinterOutlined } from "@ant-design/icons";
import { apiGet, apiPost } from "../../api";
import { useSelector } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
        tests: patient.tests.map((test) => ({
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
    const { patientName, patientId, tests, labData } = patient;
    const totalAmount = tests.reduce(
      (sum, test) => sum + (test.price || 0),
      0
    );

    const printWindow = window.open('', '', 'height=600,width=800');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Invoice</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 0; margin: 0; }
              .invoice-container { max-width: 900px; margin: 0 auto; }
              .header { 
                width: 100%; 
                padding: 10px 0; 
                background-color: #f5f5f5; 
                border-bottom: 2px solid #1890ff; 
                box-sizing: border-box;
              }
              .header-logo { 
                width: 100%; 
                height: auto; 
                max-height: 120px; 
                object-fit: contain;
                display: block;
              }
              .title { text-align: center; font-size: 28px; font-weight: bold; color: #1890ff; margin: 20px 0; text-transform: uppercase; }
              .info-section { display: flex; justify-content: space-between; padding: 0 20px 20px 20px; font-size: 14px; }
              .patient-info p, .pharmacy-info p { margin: 4px 0; }
              table { width: 100%; border-collapse: collapse; margin: 20px; }
              th, td { border: 1px solid #e0e0e0; padding: 12px; text-align: left; font-size: 14px; }
              th { background-color: #fafafa; font-weight: bold; }
              .total-section { padding: 20px; text-align: right; background: #f9f9f9; border-top: 2px solid #1890ff; clear: both; }
              .total-section table { width: 300px; float: right; border: none; margin: 0; }
              .total-section td { border: none; padding: 8px; font-weight: bold; }
              .footer { text-align: center; font-size: 12px; color: #666; padding: 20px; border-top: 1px solid #e0e0e0; clear: both; }
            </style>
          </head>
          <body>
            <div class="invoice-container">
              <div class="header">
                ${labData?.labHeaderUrl ? `
                  <img 
                    src="${labData.labHeaderUrl}" 
                    class="header-logo"
                    alt="Lab Header"
                    onload="window.print()"
                    onerror="this.style.display='none'; window.print()"
                  />
                ` : `
                  <div style="font-size: 20px; font-weight: bold; color: #333; text-align: center; padding: 10px;">
                    ${labData?.labName || 'Diagnostic Lab'}
                  </div>
                `}
              </div>

              <div class="title">
                LAB TEST INVOICE
              </div>

              <div class="info-section">
                <div class="patient-info">
                  <p><strong>Patient Name:</strong> ${patientName}</p>
                  <p><strong>Patient ID:</strong> ${patientId}</p>
                  <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                </div>
                <div class="pharmacy-info">
                  ${labData?.labRegistrationNo ? `<p><strong>Reg No:</strong> ${labData.labRegistrationNo}</p>` : ''}
                  ${labData?.labGst ? `<p><strong>GST:</strong> ${labData.labGst}</p>` : ''}
                  ${labData?.labPan ? `<p><strong>PAN:</strong> ${labData.labPan}</p>` : ''}
                  ${labData?.labAddress ? `<p><strong>Address:</strong> ${labData.labAddress}</p>` : ''}
                </div>
              </div>

              <table>
                <thead>
                  <tr>
                    <th>Test Name</th>
                    <th>Price (Incl. GST)</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  ${tests.map(test => `
                    <tr>
                      <td>${test.testName}</td>
                      <td>₹${test.price?.toFixed(2)}</td>
                      <td>${test.status.charAt(0).toUpperCase() + test.status.slice(1)}</td>
                      <td>${new Date(test.createdAt).toLocaleDateString()}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>

              <div class="total-section">
                <table>
                  <tr>
                    <td><strong>Grand Total (Incl. GST):</strong></td>
                    <td>₹${totalAmount.toFixed(2)}</td>
                  </tr>
                </table>
              </div>

              <div class="footer">
                Thank you for choosing our lab services!<br />
                ${labData?.labName || 'Diagnostic Lab'}
              </div>
            </div>
            <script>
              // Auto-print after the image loads or fails to load
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                  window.close();
                }, 500);
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    } else {
      alert('Please allow popups for this site to print the invoice.');
    }
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
          {expandedKeys.includes(record.patientId) ? "Hide Tests" : "Show Tests"}
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
                      justify="end"
                      style={{
                        padding: "12px",
                        background: "#f1f5f9",
                        borderRadius: "6px",
                      }}
                    >
                      <Col>
                        <Typography.Text strong style={{ marginRight: "16px" }}>
                          Total Amount: ₹ {totalAmount.toFixed(2)}
                        </Typography.Text>

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
                        ) : (
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
    </div>
  );
};

export default LabPatientManagement;