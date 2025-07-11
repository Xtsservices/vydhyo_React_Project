import React, { useEffect, useState } from "react";
import {
  Layout,
  Card,
  Tabs,
  Input,
  Button,
  Row,
  Col,
  Typography,
  Modal,
  InputNumber,
  Upload,
  message,
  Table,
  Alert,
  Divider,
} from "antd";
import {
  SearchOutlined,
  UserOutlined,
  UsergroupAddOutlined,
  EditOutlined,
  PlusOutlined,
  MedicineBoxOutlined,
  UploadOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import * as XLSX from "xlsx";

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const { Dragger } = Upload;

// Import the tab components
import PatientsTab from "./PharmacyPatientsTab";
import MedicinesTab from "./PharmacyMedicinesTab";
import CompletedTab from "./PharmacyCompletedTab";

import "../../stylings/pharmacy.css"; // Import the CSS file for styling
import { apiGet, apiPost } from "../../api";
import { useSelector } from "react-redux";

export default function Pharmacy() {
  const user = useSelector((state) => state.currentUserData);
  const doctorId = user?.role === "doctor" ? user?.userId : user?.createdBy;

  const [activeTab, setActiveTab] = useState("1");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isBulkModalVisible, setIsBulkModalVisible] = useState(false);
  const [cardsData, setCardsData] = useState();
  const [form, setForm] = useState({
    medName: "",
    quantity: "",
    price: "",
  });
  const [errors, setErrors] = useState({});
  const [bulkData, setBulkData] = useState([]);
  const [bulkErrors, setBulkErrors] = useState([]);
  const [bulkResults, setBulkResults] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const showBulkModal = () => {
    setIsBulkModalVisible(true);
    setBulkData([]);
    setBulkErrors([]);
    setBulkResults(null);
    setUploadedFile(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const handleNumberChange = (name, value) => {
    setForm({ ...form, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.medName.trim()) {
      newErrors.medName = "Medicine name is required";
    }
    if (!form.price || form.price < 0) {
      newErrors.price = "Price must be non-negative";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleOk = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const doctorId = user?.role === "doctor" ? user?.userId : user?.createdBy;

      form.quantity = 100;
      await apiPost("pharmacy/addMedInventory", {
        ...form,
        doctorId: doctorId,
      });
      setForm({ medName: "", quantity: "", price: "" });
      setErrors({});
      setIsModalVisible(false);
      Modal.success({
        title: "Success",
        content: "Medicine added to inventory successfully",
      });
      updateCount();
    } catch (error) {
      console.error("Error adding medicine:", error);
      Modal.error({
        title: "Error",
        content: "Failed to add medicine to inventory",
      });
    }
  };

  const handleCancel = () => {
    setForm({ medName: "", quantity: "", price: "" });
    setErrors({});
    setIsModalVisible(false);
  };

  const handleBulkCancel = () => {
    setBulkData([]);
    setBulkErrors([]);
    setBulkResults(null);
    setUploadedFile(null);
    setIsBulkModalVisible(false);
  };

  const handleFileUpload = (file) => {
    setUploadedFile(file); // Store the file for later upload

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const processedData = jsonData.map((row, index) => ({
          key: index,
          medName: row.medName || row.MedName || row["Medicine Name"] || "",
          price: parseFloat(row.price || row.Price || 0),
          quantity: parseInt(row.quantity || row.Quantity || 100),
          row: index + 2,
        }));

        setBulkData(processedData);
        setBulkErrors([]);
        setBulkResults(null);
        message.success(
          "File processed successfully! Preview your data before uploading."
        );
      } catch (error) {
        console.error("Error reading file:", error);
        message.error("Error reading file. Please check the file format.");
      }
    };
    reader.readAsArrayBuffer(file);
    return false; // Prevent default upload behavior
  };

  const handleBulkUpload = async () => {
    if (!uploadedFile) {
      message.error("Please upload a file first");
      return;
    }

    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append("file", uploadedFile);
      formData.append("doctorId", doctorId);

      const response = await apiPost(
        "pharmacy/addMedInventory/bulk",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        setBulkResults(response.data.data);
        message.success(
          `${response.data.data.insertedCount} medicines added successfully!`
        );
        updateCount();
      }
    } catch (error) {
      console.error("Error uploading bulk data:", error);
      message.error("Failed to upload medicines");

      if (error.response && error.response.data && error.response.data.errors) {
        setBulkResults({
          errors: error.response.data.errors.map((err) => ({
            row: err.row,
            message: err.message,
          })),
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadTemplate = () => {
    const sampleData = [
      { medName: "Paracetamol", price: 10.5, quantity: 100 },
      { medName: "Ibuprofen", price: 15.75, quantity: 50 },
      { medName: "Amoxicillin", price: 25, quantity: 30 },
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Medicines");
    XLSX.writeFile(workbook, "medicine_template.xlsx");
  };

  const tabItems = [
    {
      key: "1",
      label: "Pending Patients",
      children: <PatientsTab status={"pending"} updateCount={updateCount} />,
    },
    {
      key: "2",
      label: "Completed Patients",
      children: <PatientsTab status={"completed"} updateCount={updateCount} />,
    },
    {
      key: "3",
      label: "Medicines",
      children: <MedicinesTab />,
    },
  ];

  async function fetchRevenueCount() {
    const response = await apiGet(
      `/finance/getDoctorTodayAndThisMonthRevenue/pharmacy?doctorId=${doctorId}`
    );

    if (response.status === 200 && response?.data?.data) {
      setCardsData(response.data.data);
    }
  }

  useEffect(() => {
    if ((user, doctorId)) {
      fetchRevenueCount();
    }
  }, [user, doctorId]);

  function updateCount() {
    fetchRevenueCount();
  }

  const bulkDataColumns = [
    {
      title: "Medicine Name",
      dataIndex: "medName",
      key: "medName",
    },
    {
      title: "Price (₹)",
      dataIndex: "price",
      key: "price",
      render: (price) => `₹${price}`,
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
    },
  ];

  return (
    <div>
      <Layout className="pharmacy-layout">
        <Header className="pharmacy-header">
          <div className="pharmacy-logo">
            <MedicineBoxOutlined />
            <span className="pharmacy-title">Pharmacy</span>
          </div>

          <Input
            placeholder="Search Patient by Mobile Number"
            prefix={<SearchOutlined />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pharmacy-search"
          />
        </Header>

        <Content style={{ padding: "24px" }}>
          <Row gutter={[24, 24]} style={{ marginBottom: "24px" }}>
            <Col xs={24} sm={12}>
              <Card className="revenue-card-today">
                <div className="revenue-icon">
                  <div className="revenue-icon-today">
                    <UserOutlined
                      style={{ color: "white", fontSize: "18px" }}
                    />
                  </div>
                </div>
                <div>
                  <div className="revenue-title-today">Today Revenue</div>
                  <div className="revenue-value-today">
                    ₹ {cardsData?.today?.revenue}
                  </div>
                  <div className="revenue-subtitle-today">
                    Patient : {cardsData?.today?.patients}
                  </div>
                </div>
              </Card>
            </Col>

            <Col xs={24} sm={12}>
              <Card className="revenue-card-month">
                <div className="revenue-icon">
                  <div className="revenue-icon-month">
                    <UsergroupAddOutlined
                      style={{ color: "white", fontSize: "18px" }}
                    />
                  </div>
                </div>
                <div>
                  <div className="revenue-title-month">This Month Revenue</div>
                  <div className="revenue-value-month">
                    ₹ {cardsData?.month?.revenue}
                  </div>
                  <div className="revenue-subtitle-month">
                    Patients : {cardsData?.month?.patients}
                  </div>
                </div>
              </Card>
            </Col>
          </Row>

          <div style={{ marginBottom: "24px", textAlign: "right" }}>
            <Button
              type="default"
              icon={<UploadOutlined />}
              onClick={showBulkModal}
              style={{ marginRight: "8px" }}
            >
              Bulk Import
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={showModal}>
              Add Medicine
            </Button>
          </div>

          <Modal
            title="Add Medicine to Inventory"
            open={isModalVisible}
            onOk={handleOk}
            onCancel={handleCancel}
            okText="Add"
            cancelText="Cancel"
          >
            <div style={{ padding: "16px 0" }}>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", marginBottom: "8px" }}>
                  Medicine Name
                </label>
                <Input
                  name="medName"
                  value={form.medName}
                  onChange={handleInputChange}
                  placeholder="Enter medicine name"
                />
                {errors.medName && (
                  <div
                    style={{ color: "red", fontSize: "12px", marginTop: "4px" }}
                  >
                    {errors.medName}
                  </div>
                )}
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "8px" }}>
                  Price (₹)
                </label>
                <InputNumber
                  name="price"
                  value={form.price}
                  onChange={(value) => handleNumberChange("price", value)}
                  min={0}
                  step={0.01}
                  placeholder="Enter price"
                  style={{ width: "100%" }}
                />
                {errors.price && (
                  <div
                    style={{ color: "red", fontSize: "12px", marginTop: "4px" }}
                  >
                    {errors.price}
                  </div>
                )}
              </div>
            </div>
          </Modal>

          <Modal
            title="Bulk Import Medicines"
            open={isBulkModalVisible}
            onCancel={handleBulkCancel}
            width={800}
            footer={[
              <Button
                key="template"
                icon={<DownloadOutlined />}
                onClick={downloadTemplate}
              >
                Download Template
              </Button>,
              <Button key="cancel" onClick={handleBulkCancel}>
                Cancel
              </Button>,
              <Button
                key="upload"
                type="primary"
                loading={isProcessing}
                onClick={handleBulkUpload}
                disabled={!uploadedFile}
              >
                Upload Medicines
              </Button>,
            ]}
          >
            <div style={{ padding: "16px 0" }}>
              <Alert
                message="Upload Instructions"
                description="Please upload an Excel file (.xlsx) with columns: medName, price, quantity. Download the template for reference."
                type="info"
                showIcon
                style={{ marginBottom: "16px" }}
              />

              <Dragger
                accept=".xlsx,.xls"
                beforeUpload={handleFileUpload}
                showUploadList={false}
                style={{ marginBottom: "16px" }}
              >
                <p className="ant-upload-drag-icon">
                  <UploadOutlined />
                </p>
                <p className="ant-upload-text">
                  Click or drag Excel file to this area to upload
                </p>
                <p className="ant-upload-hint">
                  Support for .xlsx and .xls files only
                </p>
              </Dragger>

              {bulkData.length > 0 && (
                <div>
                  <Divider>Preview ({bulkData.length} medicines)</Divider>
                  <Table
                    columns={bulkDataColumns}
                    dataSource={bulkData}
                    pagination={{ pageSize: 5 }}
                    size="small"
                  />
                </div>
              )}

              {bulkResults && (
                <div style={{ marginTop: "16px" }}>
                  <Divider>Upload Results</Divider>
                  <Alert
                    message={`Successfully added ${bulkResults.insertedCount} medicines`}
                    type="success"
                    showIcon
                    style={{ marginBottom: "16px" }}
                  />

                  {bulkResults.errors && bulkResults.errors.length > 0 && (
                    <Alert
                      message={`${bulkResults.errors.length} errors encountered`}
                      type="warning"
                      showIcon
                      style={{ marginBottom: "16px" }}
                    />
                  )}

                  {bulkResults.errors && bulkResults.errors.length > 0 && (
                    <div>
                      <Text strong>Errors:</Text>
                      <ul style={{ marginTop: "8px" }}>
                        {bulkResults.errors.map((error, index) => (
                          <li key={index} style={{ color: "red" }}>
                            Row {error.row}: {error.message}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Modal>

          <Card className="main-card">
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={tabItems}
            />
          </Card>

          <div className="notes-section">
            <div className="notes-header">
              <div className="notes-title">
                <EditOutlined />
                <span>My Notes</span>
              </div>
              <Button className="add-note-btn">
                <PlusOutlined />
              </Button>
            </div>
          </div>
        </Content>
      </Layout>
    </div>
  );
}
