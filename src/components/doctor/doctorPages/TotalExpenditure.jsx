import React, { useState, useEffect, useRef } from 'react';
import {
  Table,
  Input,
  Select,
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
  PlusOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import { apiPost, apiGet } from '../../api';
import { useSelector } from "react-redux";
import moment from 'moment';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const TotalExpenditureScreen = () => {
  const user = useSelector((state) => state.currentUserData);
  const userId = user?.userId;
  const [searchText, setSearchText] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [transactionType, setTransactionType] = useState('Transaction Type');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [fetching, setFetching] = useState(false);
  const datePickerRef = useRef(null);

  // Expense categories for dropdown
  const expenseCategories = [
    'Rent',
    'Salary',
    'Utilities',
    'Others'
  ];

  // Fetch expenses data
  const fetchExpenses = async (start = null, end = null) => { 
    try {
      setFetching(true);
      let startDate, endDate;

      if (start && end) {
        startDate = moment(start).format('YYYY-MM-DD');
        endDate = moment(end).format('YYYY-MM-DD');
      } else {
        // Default to current month if no range provided
        startDate = moment().startOf('month').format('YYYY-MM-DD');
        endDate = moment().endOf('month').format('YYYY-MM-DD');
      }
      
      const response = await apiGet(`/finance/getExpense/${user?.userId}?startDate=${startDate}&endDate=${endDate}`);
      
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
    fetchExpenses(startDate, endDate);
  }, [startDate, endDate]);

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
      fetchExpenses(startDate, endDate);
    }
  };

  const showModal = () => {
    form.setFieldsValue({ 
      date: moment(),
      paymentMethod: 'cash',
      description: undefined
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
        date: values?.date,
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
        await fetchExpenses(startDate, endDate);
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

  const formatDisplayDate = () => {
    if (startDate && endDate) {
      return `${moment(startDate).format('MMM D, YYYY')} - ${moment(endDate).format('MMM D, YYYY')}`;
    }
    return 'Select a date range';
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
          gap: '16px',
          marginBottom: '24px',
          flexWrap: 'wrap',
          alignItems: 'center',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginRight: '0.5rem' }}>
            <CalendarTodayIcon style={{ marginRight: '8px', color: '#1977f3' }} />
            <div style={{ position: 'relative' }}>
              <DatePicker
                ref={datePickerRef}
                selected={startDate}
                onChange={(dates) => {
                  const [start, end] = dates;
                  setStartDate(start);
                  setEndDate(end);
                }}
                startDate={startDate}
                endDate={endDate}
                selectsRange
                isClearable
                placeholderText="Select a date range"
                className="custom-datepicker"
                maxDate={new Date()}
                customInput={
                  <Button
                    style={{
                      borderRadius: '8px',
                      border: '1px solid #d9d9d9',
                      padding: '8px 16px',
                      width: '250px',
                      textAlign: 'left',
                      backgroundColor: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span>{formatDisplayDate()}</span>
                  </Button>
                }
              />
            </div>
          </div>
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
            description: undefined,
            amount: '',
            paymentMethod: 'cash',
            notes: ''
          }}
        >
           <Form.Item
    label="Date"
    name="date"
    rules={[{ required: true, message: 'Please select a date' }]}
    getValueFromEvent={(e) => e.target.value} // <-- store string
  >
    <input type="date" style={datePickerStyle} max={moment().format('YYYY-MM-DD')} />
  </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: 'Please select a description' }]}
          >
            <Select
              placeholder="Select expense category"
              allowClear
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {expenseCategories.map(category => (
                <Option key={category} value={category}>
                  {category}
                </Option>
              ))}
            </Select>
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