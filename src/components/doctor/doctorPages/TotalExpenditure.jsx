import React, { useState } from 'react';
import {
  Table,
  Input,
  Select,
  DatePicker,
  Button,
  Tag,
  Space,
  Card,
  Typography,
  Pagination,
  Tooltip,
  Modal,
  Form,
  message
} from 'antd';
import {
  SearchOutlined,
  DownloadOutlined,
  EyeOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { apiPost } from '../../api';
import { useSelector } from "react-redux";
import moment from 'moment'; // Import moment for date handling
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const TotalExpenditureScreen = () => {
  const user = useSelector((state) => state.currentUserData);
  const userId = user?.userId;
  const [searchText, setSearchText] = useState('');
  // Initialize selectedDate with today's date using moment
  const [selectedDate, setSelectedDate] = useState(moment());
  const [transactionType, setTransactionType] = useState('Transaction Type');
  const [status, setStatus] = useState('All Status');
  const [service, setService] = useState('All Services');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Sample data matching the image
  const dataSource = [
    {
      key: '1',
      transactionId: 'TXN00123',
      transactionType: 'Bills',
      date: '01-Jul-2025',
      service: 'Lab',
      amount: '₹500',
      status: 'Paid',
      paymentMethod: 'UPI'
    },
    {
      key: '2',
      transactionId: 'TXN00124',
      transactionType: 'Rent',
      date: '30-Jun-2025',
      service: 'Pharmacy',
      amount: '₹1,500',
      status: 'Pending',
      paymentMethod: 'Cash'
    },
    {
      key: '3',
      transactionId: 'TXN00125',
      transactionType: 'Salary',
      date: '29-Jun-2025',
      service: 'Clinic',
      amount: '₹750',
      status: 'Paid',
      paymentMethod: 'Card'
    },
    {
      key: '4',
      transactionId: 'TXN00125',
      transactionType: 'Others',
      date: '29-Jun-2025',
      service: 'Clinic',
      amount: '₹750',
      status: 'Paid',
      paymentMethod: 'Card'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid':
        return '#52c41a';
      case 'Pending':
        return '#fa8c16';
      default:
        return '#d9d9d9';
    }
  };

  const columns = [
    {
      title: 'Transaction ID',
      dataIndex: 'transactionId',
      key: 'transactionId',
      render: (text) => <span style={{ fontWeight: 500 }}>{text}</span>
    },
    {
      title: 'Transaction Type',
      dataIndex: 'transactionType',
      key: 'transactionType',
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Service',
      dataIndex: 'service',
      key: 'service',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => <span style={{ fontWeight: 500 }}>{amount}</span>
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag
          color={getStatusColor(status)}
          style={{
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: 500,
            border: 'none'
          }}
        >
          {status}
        </Tag>
      )
    },
    {
      title: 'Payment Method',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
    },
    {
      title: 'Action',
      key: 'action',
      render: () => (
        <Tooltip title="View Details">
          <Button
            type="text"
            icon={<EyeOutlined />}
            style={{ color: '#2563EB' }}
          />
        </Tooltip>
      )
    }
  ];

  const handleExport = () => {
    console.log('Export functionality');
  };

  const handleSearch = (value) => {
    setSearchText(value);
    console.log('Search:', value);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    console.log('Date changed:', date ? date.format('MM/DD/YYYY') : null);
  };

  const showModal = () => {
    // Set default date in form when modal opens
    form.setFieldsValue({ date: moment() });
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const payload = {
        userId: userId,
        date: values.date.format('YYYY-MM-DD'),
        description: values.description,
        amount: values.amount,
        notes: values.notes || ''
      };

      // Call the API
      const response = await apiPost('/finance/createExpense', payload);
console.log('API Response:', response.data.success);
if(response.data.success){
toast.success('Expense created successfully!', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
}
      // message.success('Expense created successfully!');
      setIsModalVisible(false);
      form.resetFields();

      console.log('API Response:', response);

    } catch (error) {
      console.error('Error creating expense:', error);
      message.error('Failed to create expense. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // DatePicker styles matching the reference code
  const datePickerStyle = {
    borderRadius: '12px',
    background: '#F6F6F6',
    padding: '0.4rem',
    color: '#1977f3',
    width: '130px',
    border: '1px solid #d9d9d9'
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      <Card style={{ borderRadius: '8px' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <Title level={3} style={{ margin: 0, color: '#111827' }}>
            All Expenditures
          </Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={showModal}
            style={{
              backgroundColor: '#2563EB',
              borderColor: '#2563EB',
              borderRadius: '6px'
            }}
          >
            Add Expense
          </Button>
        </div>

        {/* Filters */}
        <div style={{
          display: 'flex',
          gap: '5px',
          marginBottom: '24px',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          <Input
            placeholder="Search by Patient Name or Transaction ID"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => handleSearch(e.target.value)}
            style={{ width: '300px' }}
          />

          <DatePicker
            placeholder="mm/dd/yyyy"
            style={datePickerStyle} // Apply custom styles
            value={selectedDate} // Set default to today
            onChange={handleDateChange}
            format="MM/DD/YYYY"
          />

          <Select
            value={transactionType}
            onChange={setTransactionType}
            style={{ width: '150px' }}
          >
            <Option value="">Transaction Type</Option>
            <Option value="Bills">Bills</Option>
            <Option value="Rent">Rent</Option>
            <Option value="Salary">Salary</Option>
            <Option value="Others">Others</Option>
          </Select>

          <Select
            value={service}
            onChange={setService}
            style={{ width: '120px' }}
          >
            <Option value="">All Services</Option>
            <Option value="appointment">Appointment</Option>
            <Option value="lab">Lab</Option>
            <Option value="pharmacy">Pharmacy</Option>
          </Select>

          <Select
            value={status}
            onChange={setStatus}
            style={{ width: '100px' }}
          >
            <Option value="">All Status</Option>
            <Option value="Paid">Paid</Option>
            <Option value="Pending">Pending</Option>
          </Select>

          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleExport}
            style={{
              backgroundColor: '#16A34A',
              borderColor: '#52c41a',
              borderRadius: '6px',
              marginLeft: '0px'
            }}
          >
            Export
          </Button>
        </div>

        {/* Transaction History Section */}
        <div style={{ marginBottom: '16px' }}>
          <Title level={4} style={{ margin: 0, color: '#111827' }}>
            Transaction History
          </Title>
        </div>

        {/* Table */}
        <Table
          dataSource={dataSource}
          columns={columns}
          pagination={false}
          size="middle"
          style={{ marginBottom: '16px' }}
          scroll={{ x: 'max-content' }}
        />

        {/* Footer with pagination info and pagination */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <span style={{ color: '#666', fontSize: '14px' }}>
            Showing 1 to 10
          </span>

          <Pagination
            current={currentPage}
            total={30}
            pageSize={10}
            showSizeChanger={false}
            onChange={(page) => setCurrentPage(page)}
            style={{ margin: 0 }}
          />
        </div>
      </Card>

      {/* Add Expense Modal */}
      <Modal
        title="Add New Expense"
        visible={isModalVisible}
        onOk={handleSubmit}
        onCancel={handleCancel}
        confirmLoading={loading}
        okText="Submit"
        cancelText="Cancel"
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            date: moment(), // Default to today
            description: '',
            amount: '',
            notes: ''
          }}
        >
          <Form.Item
            label="Date"
            name="date"
            rules={[{ required: true, message: 'Please select a date' }]}
          >
            <DatePicker
              style={datePickerStyle} // Apply custom styles
              format="MM/DD/YYYY"
            />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: 'Please enter a description' }]}
          >
            <Input placeholder="e.g., Salary, Rent, Supplies" />
          </Form.Item>

          <Form.Item
            label="Amount (₹)"
            name="amount"
            rules={[
              { required: true, message: 'Please enter the amount' },
              { pattern: /^[0-9]+$/, message: 'Please enter a valid number' }
            ]}
          >
            <Input type="number" placeholder="Enter amount" />
          </Form.Item>

          <Form.Item
            label="Notes"
            name="notes"
          >
            <TextArea rows={3} placeholder="Additional notes (optional)" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TotalExpenditureScreen;