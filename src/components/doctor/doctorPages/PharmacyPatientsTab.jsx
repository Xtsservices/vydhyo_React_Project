import React, { useEffect, useState } from "react";
import {
  Table,
  Typography,
  Spin,
  message,
  Card,
  Row,
  Col,
  Tag,
  Divider,
  InputNumber,
  Button,
  Collapse,
  Popconfirm,
  QRCode,
  Empty,
  Pagination,
} from "antd";
import { CheckOutlined, CreditCardOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import { apiGet, apiPost } from "../../api";

const { Title, Text } = Typography;
const { Panel } = Collapse;

const PatientsTab = ({ status, updateCount, searchQuery }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(4);
  const [loading, setLoading] = useState(false);
  const [patientData, setPatientData] = useState([]);
  const [totalPatients, setTotalPatients] = useState(0);
  const [expandedKeys, setExpandedKeys] = useState([]);
  const [editablePrices, setEditablePrices] = useState([]);
  const [saving, setSaving] = useState({});
  const [paying, setPaying] = useState({});
  const [isPaymentDone, setIsPaymentDone] = useState(false);

  const user = useSelector((state) => state.currentUserData);
  const doctorId = user?.role === "doctor" ? user?.userId : user?.createdBy;

async function filterPatientsDAta(data) {
  console.log(data, "filter");
  console.log(status, "filter");

  const isPending = status === "pending";

  const filtered = data
    .map((patient) => {
      const filteredMeds = patient.medicines.filter((med) =>
        isPending ? med.status === "pending" : med.status !== "pending"
      );

      if (filteredMeds.length > 0) {
        const { medicines, ...rest } = patient; 
        return {
          ...rest,
          medicines: filteredMeds,
        };
      }

      return null;
    })
    .filter(Boolean);

  console.log(`${isPending ? "pending" : "completed"} filtered`, filtered);

  return filtered;
}

  const fetchPharmacyPatients = async () => {
    try {
      setLoading(true);
      const response = await apiGet(
        "/pharmacy/getAllPharmacyPatientsByDoctorID",
        {
          params: { doctorId: doctorId },
        }
      );

      console.log("dataArraystart", response);

      let dataArray = [];
      if (response?.status === 200 && response?.data?.data) {
        dataArray = await filterPatientsDAta(response.data.data);

        // Sort by patientId numeric part descending
  dataArray.sort((a, b) => {
    const getIdNumber = (id) => parseInt(id.replace(/\D/g, '')) || 0;
    return getIdNumber(b.patientId) - getIdNumber(a.patientId);
  });
  if (searchQuery?.trim()) {
  const lowerSearch = searchQuery.toLowerCase();
  dataArray = dataArray.filter((patient) =>
    patient.patientId?.toLowerCase().includes(lowerSearch)
  );
}
      }

      console.log("dataArray", dataArray);

      if (dataArray.length > 0) {
        const formattedData = dataArray.map((patient, index) => {

          const totalAmount =
            patient.medicines?.reduce((sum, med) => {
              const price = parseFloat(med.price) || 0;
              const quantity = parseInt(med.quantity) || 0;
              return sum + price * quantity;
            }, 0) || 0;

          const hasPending = patient.medicines?.some(
            (med) => med.status === "pending"
          );
          const status = hasPending ? "pending" : "completed";

          return {
            key: patient.patientId || `patient-${index}`,
            patientId: patient.patientId || `PAT-${index}`,
            doctorId: patient.doctorId || "N/A",
            name: patient.patientName || "Unknown Patient",
            medicines: patient.medicines || [],
            totalMedicines: patient.medicines?.length || 0,
            totalAmount: totalAmount,
            status: status,
            originalData: patient,
          };
        });

        setPatientData(formattedData);
        setTotalPatients(formattedData.length);
      } else {
        setPatientData([]);
        setTotalPatients(0);
      }
    } catch (error) {
      console.error("Error fetching pharmacy patients:", error);
      message.error(
        error.response?.data?.message || "Error fetching pharmacy patients"
      );
      setPatientData([]);
      setTotalPatients(0);
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
    setEditablePrices((prev) =>
      prev.includes(medicineId) ? prev : [...prev, medicineId]
    );
  };

  const handlePriceSave = async (patientId, medicineId) => {
  try {
    setSaving((prev) => ({ ...prev, [medicineId]: true }));
    const patient = patientData.find((p) => p.patientId === patientId);
    const medicine = patient.medicines.find((m) => m._id === medicineId);
    const price = medicine.price;

    if (price === null || price === undefined) {
      message.error("Please enter a valid price");
      return;
    }

    await apiPost(`/pharmacy/updatePatientMedicinePrice`, {
      medicineId,
      patientId,
      price,
      doctorId,
    });

    message.success("Price updated successfully");
    setEditablePrices((prev) => prev.filter((id) => id !== medicineId));
    
    // Update local state instead of refetching
    setPatientData(prev => 
      prev.map(p => 
        p.patientId === patientId
          ? {
              ...p,
              medicines: p.medicines.map(m => 
                m._id === medicineId ? { ...m, price } : m
              )
            }
          : p
      )
    );
  } catch (error) {
    console.error("Error updating medicine price:", error);
    message.error(error.response?.data?.message || "Failed to update price");
  } finally {
    setSaving((prev) => ({ ...prev, [medicineId]: false }));
  }
};

  const handlePayment = async (patientId) => {
    setIsPaymentDone(true)
    try {
      setPaying((prev) => ({ ...prev, [patientId]: true }));
      const patient = patientData.find((p) => p.patientId === patientId);
      const totalAmount = patient.medicines.reduce(
        (sum, med) => sum + (med.price || 0) * (med.quantity || 1),
        0
      );

      if (totalAmount <= 0) {
        message.error("No valid prices set for payment");
        return;
      }
      const data = {
        patientId,
        doctorId,
        amount: totalAmount,
        medicines: patient.medicines.map((med) => ({
          medicineId: med._id,
          price: med.price,
          quantity: med.quantity,
          pharmacyMedID: med.pharmacyMedID || null,
        })),
      };
      console.log("bodyyyyyyy:", data);

      const response = await apiPost(`/pharmacy/pharmacyPayment`, {
        patientId,
        doctorId,
        amount: totalAmount,
        medicines: patient.medicines.map((med) => ({
          medicineId: med._id,
          price: med.price,
          quantity: med.quantity,
          pharmacyMedID: med.pharmacyMedID || null,
        })),
      });

      updateCount();
      if (response.status === 200) {
        message.success("Payment processed successfully");
        await fetchPharmacyPatients();
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      setIsPaymentDone(false);
      message.error(
        error.response?.data?.message || "Failed to process payment"
      );
    } finally {
      setPaying((prev) => ({ ...prev, [patientId]: false }));
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const medicineColumns = [
    {
      title: "Medicine Name",
      dataIndex: "medName",
      key: "medName",
      render: (name) => <Text strong>{name}</Text>,
    },
    {
      title: "Price",
      key: "price",
      render: (_, medicine, index, patientId) => {
        const isEditable = editablePrices.includes(medicine._id);
        const isPriceInitiallyNull =
          medicine.price === null || medicine.price === undefined;
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
              onFocus={() => {
                if (!isEditable) enableEdit(medicine._id);
              }}
              onChange={(value) =>
                handlePriceChange(patientId, medicine._id, value)
              }
            />
            <Button
              type="primary"
              icon={<CheckOutlined />}
              onClick={() => handlePriceSave(patientId, medicine._id)}
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
        <div
          className="patient-info"
          style={{ display: "flex", alignItems: "center" }}
        >
          <span className="patient-name">{record.name}</span>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status) => (
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
        <Button type="link" onClick={() => toggleCollapse(record.patientId)}>
          {expandedKeys.includes(record.patientId)
            ? "Hide Medicines"
            : "View Medicines"}
        </Button>
      ),
    },
  ];

  useEffect(() => {
    if (doctorId) {
      fetchPharmacyPatients();
    }
  }, [doctorId]);

  const currentPageData = patientData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const startIndex = totalPatients > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endIndex = Math.min(currentPage * pageSize, totalPatients);

 

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
            Pharmacy Patients
          </Title>
        </Col>
      </Row>

      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={currentPageData}
          pagination={false}
          size="middle"
          showHeader={true}
          scroll={{ x: "max-content" }}
          locale={{
            emptyText: (
              <Empty
                description={loading ? "Loading..." : "No patients found"}
              />
            ),
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
                <Collapse
                  defaultActiveKey={["1"]}
                  style={{
                    background: "#f9fafb",
                    borderRadius: "6px",
                    border: "1px solid #e5e7eb",
                  }}
                >
                  <Panel
                    header="Medicine Details"
                    key="1"
                    style={{
                      background: "#ffffff",
                      borderRadius: "6px",
                      border: "none",
                    }}
                  >
                    <Table
                      columns={medicineColumns.map((col) => ({
                        ...col,
                        render: (text, medicine, index) =>
                          col.render
                            ? col.render(
                                text,
                                medicine,
                                index,
                                record.patientId
                              )
                            : text,
                      }))}
                      dataSource={record.medicines}
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
                        <Text strong style={{ marginRight: "16px" }}>
                          Total Amount: ₹ {totalAmount.toFixed(2)}
                        </Text>

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
                          disabled={isPaymentDone ? true : false}
                        >
                          <Button
                            type="primary"
                            icon={<CreditCardOutlined />}
                            loading={paying[record.patientId]}
                            disabled={
                              totalAmount <= 0 ||
                              paying[record.patientId] ||
                              !hasPending
                            }
                            style={{
                              background: "#1A3C6A",
                              borderColor: "#1A3C6A",
                              color: "white",
                              marginTop: 8,
                            }}
                          >
                            {hasPending ? "Process Payment" : "Paid"}
                          </Button>
                        </Popconfirm>
                      </Col>
                    </Row>
                  </Panel>
                </Collapse>
              );
            },
          }}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 16,
          }}
        >
          <span style={{ lineHeight: "32px" }}>
            {totalPatients > 0
              ? `Showing ${startIndex} to ${endIndex} of ${totalPatients} results`
              : "No results found"}
          </span>
          {totalPatients > pageSize && (
            <Pagination
              current={currentPage}
              total={totalPatients}
              pageSize={pageSize}
              showSizeChanger={false}
              showQuickJumper={false}
              onChange={(page) => setCurrentPage(page)}
            />
          )}
        </div>
      </Spin>
    </Card>
  );
};

export default PatientsTab;