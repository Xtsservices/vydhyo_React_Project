import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Card,
  Row,
  Col,
  Modal,
  Form,
  Input,
  InputNumber,
  Typography,
  Upload,
  Divider,
  Alert,
} from "antd";
import { PlusOutlined, UploadOutlined, DownloadOutlined } from "@ant-design/icons";
import { apiGet, apiPost } from "../../api";
import { useSelector } from "react-redux";
import * as XLSX from "xlsx";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const { Title, Text } = Typography;
const { Dragger } = Upload;

const TestManagement = () => {
  const user = useSelector((state) => state.currentUserData);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isBulkModalVisible, setIsBulkModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [bulkData, setBulkData] = useState([]);
  const [bulkResults, setBulkResults] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const doctorId = user?.role === "doctor" ? user?.userId : user?.createdBy;

  // Fetch tests on component mount and when refreshTrigger changes
  useEffect(() => {
    const fetchTests = async () => {
      try {
        setFetchLoading(true);
        const response = await apiGet(`/lab/getTestsByDoctorId/${doctorId}`);
        const fetchedTests = response.data.data.map((test) => ({
          testId: test.id,
          testName: test.testName,
          price: test.testPrice,
        }));
        setTests([...new Map(fetchedTests.map((test) => [test.testId, test])).values()]);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to fetch tests", {
          position: "top-right",
          autoClose: 5000,
        });
      } finally {
        setFetchLoading(false);
      }
    };
    if (doctorId) {
      fetchTests();
    }
  }, [doctorId, refreshTrigger]);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const showBulkModal = () => {
    setIsBulkModalVisible(true);
    setBulkData([]);
    setBulkResults(null);
    setUploadedFile(null);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const testData = {
        testName: values.testName,
        testPrice: values.testPrice,
        doctorId,
      };
      setLoading(true);
      const response = await apiPost("/lab/addtest", testData);
      const newTest = {
        testId: response.data.data.id,
        testName: response.data.data.testName,
        price: response.data.data.testPrice,
      };
      setTests((prevTests) => [...prevTests, newTest]);
      toast.success("Test added successfully", {
        position: "top-right",
        autoClose: 3000,
      });
      form.resetFields();
      setIsModalVisible(false);
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      console.error("Error adding test:", error);
      if (
        error.response?.status === 400 &&
        error.response?.data?.message?.message === "A test with this name already exists"
      ) {
        toast.error("A test with this name already exists", {
          position: "top-right",
          autoClose: 5000,
        });
      } else {
        toast.error(error.response?.data?.message?.message || "Failed to add test. Please try again.", {
          position: "top-right",
          autoClose: 5000,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleBulkCancel = () => {
    setIsBulkModalVisible(false);
    setBulkData([]);
    setBulkResults(null);
    setUploadedFile(null);
  };

  const handleFileUpload = (file) => {
    setUploadedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const processedData = jsonData.map((row, index) => {
          if (!row.testName || !row.testPrice) {
            throw new Error('Excel must contain exactly "testName" and "testPrice" columns');
          }
          return {
            key: index,
            testName: row.testName,
            testPrice: parseFloat(row.testPrice),
            row: index + 2,
          };
        });

        setBulkData(processedData);
        setBulkResults(null);
        toast.success("File processed successfully! Preview your data before uploading.", {
          position: "top-right",
          autoClose: 3000,
        });
      } catch (error) {
        console.error("Error reading file:", error);
        toast.error(`Error reading file: ${error.message}`, {
          position: "top-right",
          autoClose: 5000,
        });
      }
    };
    reader.readAsArrayBuffer(file);
    return false;
  };

  const handleBulkUpload = async () => {
    if (!uploadedFile) {
      toast.error("Please upload a file first", {
        position: "top-right",
        autoClose: 5000,
      });
      return;
    }

    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append("file", uploadedFile);
      formData.append("doctorId", doctorId);

      const response = await apiPost("/lab/addtest/bulk", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.data.insertedCount > 0) {
        setBulkResults(response.data.data);
        toast.success(`${response.data.data.insertedCount} tests added successfully!`, {
          position: "top-right",
          autoClose: 3000,
        });
        setRefreshTrigger((prev) => prev + 1);
        if (!response.data.data.errors || response.data.data.errors.length === 0) {
          setTimeout(() => {
            setIsBulkModalVisible(false);
          }, 2000);
        }
      } else if (response.data.data.errors && response.data.data.errors.length > 0) {
        setBulkResults(response.data.data);
        toast.error("All tests already exist", {
          position: "top-right",
          autoClose: 5000,
        });
      }
    } catch (error) {
      console.error("Error uploading bulk data:", error);
      toast.error(error.response?.data?.message || "Failed to upload tests", {
        position: "top-right",
        autoClose: 5000,
      });
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
      { testName: "Complete Blood Count", testPrice: 350 },
      { testName: "Liver Function Test", testPrice: 550 },
      { testName: "Kidney Function Test", testPrice: 600 },
      { testName: "Lipid Profile", testPrice: 500 },
      { testName: "Thyroid Panel", testPrice: 400 },
    ];
    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Tests");
    XLSX.writeFile(workbook, "test_template.xlsx");
  };

  const columns = [
    {
      title: "Test ID",
      dataIndex: "testId",
      key: "testId",
    },
    {
      title: "Test Name",
      dataIndex: "testName",
      key: "testName",
    },
    {
      title: "Price (₹)",
      dataIndex: "price",
      key: "price",
      render: (price) => `₹${price.toLocaleString("en-IN")}`,
    },
  ];

  const bulkDataColumns = [
    {
      title: "Test Name",
      dataIndex: "testName",
      key: "testName",
    },
    {
      title: "Price (₹)",
      dataIndex: "testPrice",
      key: "testPrice",
      render: (price) => `₹${price}`,
    },
  ];

  return (
    <div>
      <ToastContainer />
      <Card style={{ borderRadius: "8px", marginBottom: "24px" }}>
        <Row
          justify="space-between"
          align="middle"
          style={{ marginBottom: "16px" }}
        >
          <Col>
            <Title level={4} style={{ margin: 0 }}>
              Tests
            </Title>
          </Col>
          <Col>
            <Button
              type="default"
              icon={<UploadOutlined />}
              onClick={showBulkModal}
              style={{ marginRight: "8px" }}
            >
              Bulk Import
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={showModal}
              loading={loading}
            >
              Add Test
            </Button>
          </Col>
        </Row>
        <Table
          columns={columns}
          dataSource={tests}
          rowKey="testId"
          pagination={false}
          loading={fetchLoading}
        />

        <Modal
          title="Add New Test"
          open={isModalVisible}
          onOk={handleOk}
          onCancel={handleCancel}
          okText="Add"
          cancelText="Cancel"
          confirmLoading={loading}
        >
          <Form form={form} layout="vertical" name="add_test_form">
            <Form.Item
              name="testName"
              label="Test Name"
              rules={[
                { required: true, message: "Please enter test name" },
                { min: 2, message: "Test name must be at least 2 characters long" },
                { max: 100, message: "Test name cannot exceed 100 characters" },
              ]}
            >
              <Input placeholder="Enter test name" />
            </Form.Item>
            <Form.Item
              name="testPrice"
              label="Test Price (₹)"
              rules={[
                { required: true, message: "Please enter test price" },
                { type: "number", min: 0, message: "Test price cannot be negative" },
              ]}
            >
              <InputNumber
                min={0}
                style={{ width: "100%" }}
                placeholder="Enter test price"
                formatter={(value) => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                parser={(value) => value.replace(/₹\s?|(,*)/g, "")}
              />
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          title="Bulk Import Tests"
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
              Upload Tests
            </Button>,
          ]}
        >
          <div style={{ padding: "16px 0" }}>
            <Alert
              message="Upload Instructions"
              description="Please upload an Excel file (.xlsx) with exactly these columns: testName, testPrice. Download the template for reference."
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
                Support for .xlsx and .xls files only. Must contain "testName" and
                "testPrice" columns.
              </p>
            </Dragger>

            {bulkData.length > 0 && (
              <div>
                <Divider>Preview ({bulkData.length} tests)</Divider>
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
                {bulkResults.insertedCount > 0 && (
                  <Alert
                    message={`Successfully added ${bulkResults.insertedCount} tests`}
                    type="success"
                    showIcon
                    style={{ marginBottom: "16px" }}
                  />
                )}

                {bulkResults.errors && bulkResults.errors.length > 0 && (
                  <>
                    <Alert
                      message={`${bulkResults.errors.length} warnings encountered`}
                      type="warning"
                      showIcon
                      style={{ marginBottom: "16px" }}
                    />
                    <div>
                      <Text strong>Warnings:</Text>
                      <ul style={{ marginTop: "8px" }}>
                        {bulkResults.errors.map((error, index) => (
                          <li key={index} style={{ color: "orange" }}>
                            Row {error.row}: {error.message}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </Modal>
      </Card>
    </div>
  );
};

export default TestManagement;