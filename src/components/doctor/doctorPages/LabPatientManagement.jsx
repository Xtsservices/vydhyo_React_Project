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
  message,
  Popconfirm,
  QRCode,
  Tag,
} from "antd";
import { CheckOutlined, CreditCardOutlined } from "@ant-design/icons";
import { apiGet, apiPost } from "../../api";
import { useSelector } from "react-redux";

const { Title } = Typography;
const { Panel } = Collapse;

const LabPatientManagement = ({ status, updateCount }) => {
  const user = useSelector((state) => state.currentUserData);
  const doctorId = user?.role === "doctor" ? user?.userId : user?.createdBy;
  console.log(status, "status");
  const [patients, setPatients] = useState([]);
  const [saving, setSaving] = useState({});
  const [editablePrices, setEditablePrices] = useState([]);
  const [expandedKeys, setExpandedKeys] = useState([]);
  const [paying, setPaying] = useState({});
  const [loadingPatients, setLoadingPatients] = useState(false);

  // Fetch data

  async function filterPatientsDAta(data) {
    if (status === "pending") {
      const filtered = data
        .map((patient) => {
          const pendingTests = patient.tests.filter(
            (test) => test.status === "pending"
          );
          if (pendingTests.length > 0) {
            return {
              ...patient,
              tests: pendingTests,
            };
          }
          return null;
        })
        .filter(Boolean); // remove null entries (patients with no pending tests)

      return filtered;
    } else {
      const filtered = data
        .map((patient) => {
          const pendingTests = patient.tests.filter(
            (test) => test.status !== "pending"
          );
          if (pendingTests.length > 0) {
            return {
              ...patient,
              tests: pendingTests,
            };
          }
          return null;
        })
        .filter(Boolean); // remove null entries (patients with no pending tests)

      return filtered;
    }
  }

  async function getAllTestsPatientsByDoctorID() {
    try {
      setLoadingPatients(true);
      const response = await apiGet(
        `/lab/getAllTestsPatientsByDoctorID/${doctorId}`
      );

      console.log("getAllTestsPatientsByDoctorID", response);
      if (response.status === 200 && response?.data?.data) {
        const pendingData = await filterPatientsDAta(response.data.data);
        setPatients(pendingData);
        message.success("Patients data loaded successfully");
      }
    } catch (error) {
      console.error("Error fetching patient tests:", error);
      message.error("Failed to load patient data");
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
      const test = patient.tests.find((t) => t._id === testId);
      const timmeredtestName = testName.trim();
      const price = test.price;

      if (price === null || price === undefined) {
        message.error("Please enter a valid price");
        return;
      }
    
      await apiPost(`/lab/updatePatientTestPrice`, {
        testId,
        patientId,
        price,
        doctorId,
        testName:timmeredtestName,
      });

      message.success("Price updated successfully");
      setEditablePrices((prev) => prev.filter((id) => id !== testId));
    } catch (error) {
      console.error("Error updating test price:", error);
      message.error("Failed to update price");
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
        message.error("No valid prices set for payment");
        return;
      }
      console.log("totalAmount", totalAmount);
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
        updateCount();
        message.success("Payment processed successfully");
        await getAllTestsPatientsByDoctorID();
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      message.error("Failed to process payment");
    } finally {
      setPaying((prev) => ({ ...prev, [patientId]: false }));
    }
  };

  useEffect(() => {
    if (doctorId && user) {
      getAllTestsPatientsByDoctorID();
    }
  }, [user, doctorId, status]);

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
        // Determine overall patient status based on tests
        const allCompleted = record.tests.every(test => test.status === 'completed');
        const anyPending = record.tests.some(test => test.status === 'pending');
        
        let statusText = 'Partial';
        let color = 'orange';
        
        if (allCompleted) {
          statusText = 'Completed';
          color = 'green';
        } else if (anyPending && !record.tests.some(test => test.status === 'completed')) {
          statusText = 'Pending';
          color = 'gold';
        }
        
        return <Tag color={color}>{statusText}</Tag>;
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Button type="link" onClick={() => toggleCollapse(record.patientId)}>
          {expandedKeys.includes(record.patientId)
            ? "Hide Tests"
            : "Show Tests"}
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
          case 'completed':
            color = 'green';
            text = 'Completed';
            break;
          case 'pending':
            color = 'gold';
            text = 'Pending';
            break;
          case 'cancelled':
            color = 'red';
            text = 'Cancelled';
            break;
          case 'in_progress':
            color = 'blue';
            text = 'In Progress';
            break;
          default:
            color = 'gray';
            text = 'Unknown';
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
            Patients {status === 'pending' ? 'Pending' : 'Completed'} Tests
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
                      >
                        <Button
                          type="primary"
                          icon={<CreditCardOutlined />}
                          loading={paying[record.patientId]}
                          disabled={
                            totalAmount <= 0 ||
                            paying[record.patientId] ||
                            !hasPendingTests
                          }
                          style={{
                            background: "#1A3C6A",
                            borderColor: "#1A3C6A",
                            color: "white",
                            marginTop: 8,
                          }}
                        >
                          {hasPendingTests ? "Process Payment" : "Paid"}
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
  );
};

export default LabPatientManagement;