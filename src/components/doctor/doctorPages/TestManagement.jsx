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
  Typography 
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { apiGet, apiPost } from '../../api';
import { useSelector } from 'react-redux';

const { Title } = Typography;

const TestManagement = () => {
  const user = useSelector((state) => state.currentUserData);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
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
        // Remove duplicates by testId
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

  const handleOk = async () => {
    try {
      // Validate form fields
      const values = await form.validateFields();
      
      // Prepare data for API call
      const testData = {
        testName: values.testName,
        testPrice: values.testPrice,
        doctorId,
      };

      setLoading(true);

      // Make API POST call to add test
      const response = await apiPost('/lab/addtest', testData);

      // Add new test to state, ensuring no duplicates
      const newTest = {
        testId: response.data.data.id,
        testName: response.data.data.testName,
        price: response.data.data.testPrice,
      };
      setTests(prevTests => {
        const updatedTests = [...prevTests, newTest];
        return [...new Map(updatedTests.map(test => [test.testId, test])).values()];
      });

      // Show success notification
      notification.success({
        message: 'Test Added Successfully',
        description: 'The test has been added to the database.',
        duration: 3,
      });

      // Reset form and close modal
      form.resetFields();
      setIsModalVisible(false);
    } catch (error) {
      console.error('Error adding test:', error);
      // Show error notification
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

  return (
    <Card style={{ borderRadius: '8px', marginBottom: '24px' }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: '16px' }}>
        <Col>
          <Title level={4} style={{ margin: 0 }}>Tests</Title>
        </Col>
        <Col>
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
    </Card>
  );
};

export default TestManagement;