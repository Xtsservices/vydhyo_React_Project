import React, { useState, useEffect } from 'react';
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
  notification, 
  Typography,
  Upload,
  Divider,
  Alert,
  message
} from 'antd';
import { PlusOutlined, UploadOutlined, DownloadOutlined } from '@ant-design/icons';
import { apiGet, apiPost } from '../../api';
import { useSelector } from 'react-redux';
import * as XLSX from 'xlsx';

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
  const doctorId = user?.role === 'doctor' ? user?.userId : user?.createdBy;

  // Fetch tests on component mount
  useEffect(() => {
    const fetchTests = async () => {
      try {
        setFetchLoading(true);
        const response = await apiGet(`/lab/getTestsByDoctorId/${doctorId}`);
        const fetchedTests = response.data.data.map(test => ({
          testId: test.id,
          testName: test.testName,
          price: test.testPrice,
        }));
        setTests([...new Map(fetchedTests.map(test => [test.testId, test])).values()]);
      } catch (error) {
        notification.error({
          message: 'Error Fetching Tests',
          description: error.response?.data?.message || 'Failed to fetch tests',
          duration: 5,
        });
      } finally {
        setFetchLoading(false);
      }
    };
    if (doctorId) {
      fetchTests();
    }
  }, [doctorId]);

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

      const response = await apiPost('/lab/addtest', testData);

      const newTest = {
        testId: response.data.data.id,
        testName: response.data.data.testName,
        price: response.data.data.testPrice,
      };
      setTests(prevTests => {
        const updatedTests = [...prevTests, newTest];
        return [...new Map(updatedTests.map(test => [test.testId, test])).values()];
      });

      notification.success({
        message: 'Test Added Successfully',
        description: 'The test has been added to the database.',
        duration: 3,
      });

      form.resetFields();
      setIsModalVisible(false);
    } catch (error) {
      console.error('Error adding test:', error);
      notification.error({
        message: 'Error Adding Test',
        description: error.response?.data?.message || 'Failed to add test. Please try again.',
        duration: 5,
      });
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
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Strictly enforce the exact column names: testName and testPrice
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
        message.success('File processed successfully! Preview your data before uploading.');
      } catch (error) {
        console.error('Error reading file:', error);
        message.error(`Error reading file: ${error.message}`);
      }
    };
    reader.readAsArrayBuffer(file);
    return false;
  };

  const handleBulkUpload = async () => {
    if (!uploadedFile) {
      message.error('Please upload a file first');
      return;
    }

    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);
      formData.append('doctorId', doctorId);

      const response = await apiPost("/lab/addtest/bulk", formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.status === 200) {
        setBulkResults(response.data.data);
        message.success(`${response.data.data.insertedCount} tests added successfully!`);
        
        const fetchResponse = await apiGet(`/lab/getTestsByDoctorId/${doctorId}`);
        const fetchedTests = fetchResponse.data.data.map(test => ({
          testId: test.id,
          testName: test.testName,
          price: test.testPrice,
        }));
        setTests([...new Map(fetchedTests.map(test => [test.testId, test])).values()]);
      }
    } catch (error) {
      console.error('Error uploading bulk data:', error);
      message.error('Failed to upload tests');
      
      if (error.response && error.response.data && error.response.data.errors) {
        setBulkResults({
          errors: error.response.data.errors.map(err => ({
            row: err.row,
            message: err.message
          }))
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadTemplate = () => {
    const sampleData = [
      { testName: 'Complete Blood Count', testPrice: 350 },
      { testName: 'Liver Function Test', testPrice: 550 },
      { testName: 'Kidney Function Test', testPrice: 600 },
      { testName: 'Lipid Profile', testPrice: 500 },
      { testName: 'Thyroid Panel', testPrice: 400 },
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tests');
    XLSX.writeFile(workbook, 'test_template.xlsx');
  };

  const columns = [
    {
      title: 'Test ID',
      dataIndex: 'testId',
      key: 'testId',
    },
    {
      title: 'Test Name',
      dataIndex: 'testName',
      key: 'testName',
    },
    {
      title: 'Price (₹)',
      dataIndex: 'price',
      key: 'price',
      render: (price) => `₹${price.toLocaleString('en-IN')}`,
    },
  ];

  const bulkDataColumns = [
    {
      title: 'Test Name',
      dataIndex: 'testName',
      key: 'testName',
    },
    {
      title: 'Price (₹)',
      dataIndex: 'testPrice',
      key: 'testPrice',
      render: (price) => `₹${price}`,
    },
  ];

  return (
    <Card style={{ borderRadius: '8px', marginBottom: '24px' }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: '16px' }}>
        <Col>
          <Title level={4} style={{ margin: 0 }}>Tests</Title>
        </Col>
        <Col>
          <Button 
            type="default" 
            icon={<UploadOutlined />}
            onClick={showBulkModal}
            style={{ marginRight: '8px' }}
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
        <Form
          form={form}
          layout="vertical"
          name="add_test_form"
        >
          <Form.Item
            name="testName"
            label="Test Name"
            rules={[
              { required: true, message: 'Please enter test name' },
              { min: 2, message: 'Test name must be at least 2 characters long' },
              { max: 100, message: 'Test name cannot exceed 100 characters' },
            ]}
          >
            <Input placeholder="Enter test name" />
          </Form.Item>
          <Form.Item
            name="testPrice"
            label="Test Price (₹)"
            rules={[
              { required: true, message: 'Please enter test price' },
              { type: 'number', min: 0, message: 'Test price cannot be negative' },
            ]}
          >
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              placeholder="Enter test price"
              formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/₹\s?|(,*)/g, '')}
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
          <Button key="template" icon={<DownloadOutlined />} onClick={downloadTemplate}>
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
        <div style={{ padding: '16px 0' }}>
          <Alert
            message="Upload Instructions"
            description="Please upload an Excel file (.xlsx) with exactly these columns: testName, testPrice. Download the template for reference."
            type="info"
            showIcon
            style={{ marginBottom: '16px' }}
          />

          <Dragger
            accept=".xlsx,.xls"
            beforeUpload={handleFileUpload}
            showUploadList={false}
            style={{ marginBottom: '16px' }}
          >
            <p className="ant-upload-drag-icon">
              <UploadOutlined />
            </p>
            <p className="ant-upload-text">Click or drag Excel file to this area to upload</p>
            <p className="ant-upload-hint">
              Support for .xlsx and .xls files only. Must contain "testName" and "testPrice" columns.
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
            <div style={{ marginTop: '16px' }}>
              <Divider>Upload Results</Divider>
              {bulkResults.insertedCount && (
                <Alert
                  message={`Successfully added ${bulkResults.insertedCount} tests`}
                  type="success"
                  showIcon
                  style={{ marginBottom: '16px' }}
                />
              )}
              
              {bulkResults.errors && bulkResults.errors.length > 0 && (
                <>
                  <Alert
                    message={`${bulkResults.errors.length} errors encountered`}
                    type="warning"
                    showIcon
                    style={{ marginBottom: '16px' }}
                  />
                  <div>
                    <Text strong>Errors:</Text>
                    <ul style={{ marginTop: '8px' }}>
                      {bulkResults.errors.map((error, index) => (
                        <li key={index} style={{ color: 'red' }}>
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
  );
};

export default TestManagement;