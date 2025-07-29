import React, { useEffect, useState } from "react";
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
import { CheckOutlined, CreditCardOutlined } from "@ant-design/icons";
import { apiGet, apiPost } from "../../api";
import { useSelector } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const { Title, Text } = Typography;
const { Panel } = Collapse;

const LabPatientManagement = ({ status, updateCount, searchValue }) => {
  const user = useSelector((state) => state.currentUserData);
  const doctorId = user?.role === "doctor" ? user?.userId : user?.createdBy;
  const [patients, setPatients] = useState([]);
  const [saving, setSaving] = useState({});
  const [editablePrices, setEditablePrices] = useState([]);
  const [expandedKeys, setExpandedKeys] = useState([]);
  const [paying, setPaying] = useState({});
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [isPaymentDone, setIsPaymentDone] = useState({});

  // Fetch data
  async function getAllTestsPatientsByDoctorID() {
    try {
      setLoadingPatients(true);
      const response = await apiGet(
        `/lab/getAllTestsPatientsByDoctorID/${doctorId}?searchValue=${searchValue}&status=${status}`
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
          return true; // Default case (though status should always be "pending" or "completed")
        });

        // Sort by patientId descending
        filteredData.sort((a, b) => {
          const idA = parseInt(a.patientId.replace(/\D/g, "")) || 0;
          const idB = parseInt(b.patientId.replace(/\D/g, "")) || 0;
          return idB - idA; // latest on top
        });

        setPatients(filteredData);

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
        await getAllTestsPatientsByDoctorID();
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

  useEffect(() => {
    if (doctorId && user) {
      getAllTestsPatientsByDoctorID();
    }
  }, [user, doctorId, status, searchValue]); // Trigger API on tab change (status change)

  const toggleCollapse = (patientId) => {
    setExpandedKeys((prev) =>
      prev.includes(patientId)
        ? prev.filter((id) => id !== patientId)
        : [...prev, patientId]
    );
    // Trigger API call on expand
    getAllTestsPatientsByDoctorID();
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

  console.log(patients, "patients");

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
          pagination={false}
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