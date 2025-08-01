import React, { useState, useEffect } from 'react';
import {
  Table,
  Input,
  Select,
  DatePicker,
  Button,
  Card,
  Typography,
  Pagination,
  Modal,
  Form,
  message
} from 'antd';
import {
  SearchOutlined,
  DownloadOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { apiPost, apiGet } from '../../api';
import { useSelector } from "react-redux";
import moment from 'moment';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const TotalExpenditureScreen = () => {
  const user = useSelector((state) => state.currentUserData);
  const userId = user?.userId;
  const [searchText, setSearchText] = useState('');
  const [selectedDate, setSelectedDate] = useState(moment());
  const [transactionType, setTransactionType] = useState('Transaction Type');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [fetching, setFetching] = useState(false);

  // Fetch expenses data
  const fetchExpenses = async (start = null, end = null) => { 
    try {
      setFetching(true);
      let startDate, endDate;

      if (start) {
        startDate = start.format('YYYY-MM-DD');
        endDate = end ? end.format('YYYY-MM-DD') : startDate; // Use startDate as endDate if end is not provided
      }
      // Get today's date and 7 days back for the default range
      // const endDate = moment().format('YYYY-MM-DD');
      // const startDate = moment().subtract(7, 'days').format('YYYY-MM-DD');
      
      const response = await apiGet(`/finance/getExpense?startDate=${startDate}&endDate=${endDate}`);
      
      if (response.data.success) {
        setExpenses(response.data.data);
        setTotalExpenses(response.data.data.length);
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
      message.error('Failed to fetch expenses. Please try again.');
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
     const today = moment();
  fetchExpenses(today); // Pass today's date as start (and end)
  setSelectedDate(today);
    // fetchExpenses();
  }, []);

  const columns = [
    {
      title: 'Transaction ID',
      dataIndex: '_id',
      key: 'transactionId',
      render: (id) => <span style={{ fontWeight: 500 }}>{id || 'N/A'}</span>
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (text) => <span style={{ fontWeight: 500 }}>{text || 'N/A'}</span>
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date) => moment(date).format('DD-MMM-YYYY') || 'N/A'
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => <span style={{ fontWeight: 500 }}>{amount ? `₹${amount}` : 'N/A'}</span>
    },
    {
      title: 'Payment Method',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      render: (text) => text ? text.charAt(0).toUpperCase() + text.slice(1) : 'N/A'
    },
    {
      title: 'Notes',
      dataIndex: 'notes',
      key: 'notes',
      render: (text) => text || 'N/A'
    }
  ];

  const handleExport = () => {
    console.log('Export functionality');
  };

  const handleSearch = (value) => {
    setSearchText(value);
    if (value) {
      const filtered = expenses.filter(expense => 
        expense._id?.toLowerCase().includes(value.toLowerCase()) ||
        expense.description?.toLowerCase().includes(value.toLowerCase()) ||
        expense.notes?.toLowerCase().includes(value.toLowerCase())
      );
      setExpenses(filtered);
    } else {
      fetchExpenses();
    }
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    console.log('Selected date:', date ? date.format('YYYY-MM-DD') : 'None');
    if (date) {
      const filtered = expenses.filter(expense => 
        moment(expense.date).isSame(date, 'day')
      );
      setExpenses(filtered);
      fetchExpenses(date);

    } else {
      fetchExpenses();
    }
  };

  const showModal = () => {
    form.setFieldsValue({ 
      date: moment(),
      paymentMethod: 'cash'
    });
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
        paymentMethod: values.paymentMethod || 'cash',
        notes: values.notes || ''
      };

      const response = await apiPost('/finance/createExpense', payload);
      
      if(response.data.success){
        toast.success('Expense created successfully!', {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        await fetchExpenses();
      }
      
      setIsModalVisible(false);
      form.resetFields();

    } catch (error) {
      console.error('Error creating expense:', error);
      message.error('Failed to create expense. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
          {/* <Input
            placeholder="Search by Transaction ID, Description or Notes"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => handleSearch(e.target.value)}
            style={{ width: '300px' }}
          /> */}

          <DatePicker
            placeholder="mm/dd/yyyy"
            style={datePickerStyle}
            value={selectedDate}
            onChange={handleDateChange}
            format="MM/DD/YYYY"
          />

          {/* <Select
            value={transactionType}
            onChange={(value) => {
              setTransactionType(value);
              if (value) {
                const filtered = expenses.filter(expense => 
                  expense.description === value
                );
                setExpenses(filtered);
              } else {
                fetchExpenses();
              }
            }}
            style={{ width: '150px' }}
          >
            <Option value="">Transaction Type</Option>
            <Option value="rent">Rent</Option>
            <Option value="salary">Salary</Option>
            <Option value="bills">Bills</Option>
            <Option value="supplies">Supplies</Option>
          </Select> */}

          {/* <Button
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
          </Button> */}
        </div>

        {/* Transaction History Section */}
        <div style={{ marginBottom: '16px' }}>
          <Title level={4} style={{ margin: 0, color: '#111827' }}>
            Transaction History
          </Title>
        </div>

        {/* Table */}
        <Table
          dataSource={expenses}
          columns={columns}
          pagination={false}
          size="middle"
          style={{ marginBottom: '16px' }}
          scroll={{ x: 'max-content' }}
          loading={fetching}
          rowKey="_id"
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
            Showing 1 to {expenses.length} of {totalExpenses} entries
          </span>

          <Pagination
            current={currentPage}
            total={totalExpenses}
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
            date: moment(),
            description: '',
            amount: '',
            paymentMethod: 'cash',
            notes: ''
          }}
        >
          <Form.Item
            label="Date"
            name="date"
            rules={[{ required: true, message: 'Please select a date' }]}
          >
            <DatePicker
              style={datePickerStyle}
              format="MM/DD/YYYY"
            />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: 'Please enter a description' }]}
          >
            <Input placeholder="e.g., Rent, Salary, Supplies" />
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
            label="Payment Method"
            name="paymentMethod"
          >
            <Select>
              <Option value="cash">Cash</Option>
              <Option value="card">Card</Option>
              <Option value="upi">UPI</Option>
              <Option value="bank transfer">Bank Transfer</Option>
            </Select>
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