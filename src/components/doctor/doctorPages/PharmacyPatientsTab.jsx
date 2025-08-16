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
    const totalAmount = medicines.reduce(
      (sum, med) => sum + (med.price || 0) * (med.quantity || 1),
      0
    );

    const gstDetails = medicines.map(med => {
      const subtotal = (med.price || 0) * (med.quantity || 1);
      const gstRate = med.gst || 0;
      const cgstRate = med.cgst || 0;
      
      const gstAmount = subtotal * (gstRate / (100 + gstRate + cgstRate));
      const cgstAmount = subtotal * (cgstRate / (100 + gstRate + cgstRate));
      
      return {
        medName: med.medName,
        price: med.price,
        quantity: med.quantity,
        gst: gstRate,
        cgst: cgstRate,
        subtotal,
        gstAmount,
        cgstAmount
      };
    });

    const totalGST = gstDetails.reduce((sum, item) => sum + item.gstAmount, 0);
    const totalCGST = gstDetails.reduce((sum, item) => sum + item.cgstAmount, 0);
    const grandTotal = totalAmount;

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
                ${pharmacyData?.pharmacyHeaderUrl ? `
                  <img 
                    src="${pharmacyData.pharmacyHeaderUrl}" 
                    class="header-logo"
                    alt="Pharmacy Header"
                    onload="window.print()"
                    onerror="this.style.display='none'; window.print()"
                  />
                ` : `
                  <div style="font-size: 20px; font-weight: bold; color: #333; text-align: center; padding: 10px;">
                    ${pharmacyData?.pharmacyName || 'Pharmacy'}
                  </div>
                `}
              </div>

              <div class="title">
                TAX INVOICE
              </div>

              <div class="info-section">
                <div class="patient-info">
                  <p><strong>Patient Name:</strong> ${originalData.patientName}</p>
                  <p><strong>Patient ID:</strong> ${originalData.patientId}</p>
                  <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                </div>
                <div class="pharmacy-info">
                  ${pharmacyData?.pharmacyRegistrationNo ? `<p><strong>Reg No:</strong> ${pharmacyData.pharmacyRegistrationNo}</p>` : ''}
                  ${pharmacyData?.pharmacyGst ? `<p><strong>GST:</strong> ${pharmacyData.pharmacyGst}</p>` : ''}
                  ${pharmacyData?.pharmacyPan ? `<p><strong>PAN:</strong> ${pharmacyData.pharmacyPan}</p>` : ''}
                  ${pharmacyData?.pharmacyAddress ? `<p><strong>Address:</strong> ${pharmacyData.pharmacyAddress}</p>` : ''}
                </div>
              </div>

              <table>
                <thead>
                  <tr>
                    <th>Medicine</th>
                    <th>Price (Incl. GST)</th>
                    <th>Qty</th>
                    <th>GST %</th>
                    <th>CGST %</th>
                    <th>Subtotal (Incl. GST)</th>
                  </tr>
                </thead>
                <tbody>
                  ${gstDetails.map((item, index) => `
                    <tr key=${index}>
                      <td>${item.medName}</td>
                      <td>₹${item.price?.toFixed(2) || '0.00'}</td>
                      <td>${item.quantity}</td>
                      <td>${item.gst}%</td>
                      <td>${item.cgst}%</td>
                      <td>₹${item.subtotal.toFixed(2)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>

              <div class="total-section">
                <table>
                  <tr>
                    <td><strong>Total GST:</strong></td>
                    <td>₹${totalGST.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td><strong>Total CGST:</strong></td>
                    <td>₹${totalCGST.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td><strong>Grand Total (Incl. GST):</strong></td>
                    <td>₹${grandTotal.toFixed(2)}</td>
                  </tr>
                </table>
              </div>

              <div class="footer">
                Thank you for your purchase!<br />
                All sales are final. Please contact us for any inquiries.
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
      title: "GST (%)",
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
          {record.addressId && (
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => showPharmacyDetails(record.addressId)}
              title="View Pharmacy Details"
            />
          )}
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
                      <Row justify="end" style={{ padding: "12px", background: "#f1f5f9", borderRadius: "6px" }}>
                        <Col>
                          <Text strong style={{ marginRight: "16px" }}>
                            Total Amount: ₹ {totalAmount.toFixed(2)}
                          </Text>
                          {status === "completed" ? (
                            <Button
                              type="primary"
                              icon={<PrinterOutlined />}
                              onClick={() => handlePrint(record)}
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
                              disabled={isPaymentDone[record.patientId] || status === "completed"}
                            >
                              <Button
                                type="primary"
                                icon={<CreditCardOutlined />}
                                loading={paying[record.patientId]}
                                disabled={
                                  totalAmount <= 0 ||
                                  paying[record.patientId] ||
                                  !hasPending ||
                                  isPaymentDone[record.patientId] ||
                                  status === "completed"
                                }
                                style={{
                                  background: "#1A3C6A",
                                  borderColor: "#1A3C6A",
                                  color: "white",
                                  marginTop: 8,
                                }}
                              >
                                {hasPending && !isPaymentDone[record.patientId] && status !== "completed"
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
    </div>
  );
};

export default PatientsTab;