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
  Tooltip
} from 'antd';
import { 
  SearchOutlined, 
  DownloadOutlined, 
  EyeOutlined 
} from '@ant-design/icons';

const { Title } = Typography;
const { Option } = Select;

const TotalExpenditureScreen = () => {
  const [searchText, setSearchText] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [transactionType, setTransactionType] = useState('Transaction Type');
  const [status, setStatus] = useState('All Status');
  const [service, setService] = useState('All Services');
  const [currentPage, setCurrentPage] = useState(1);

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
    console.log('Date changed:', date);
  };

  return (
    <div style={{ 
      // padding: '24px', 
      // backgroundColor: '#f5f5f5', 
      minHeight: '100vh' 
    }}>
      <Card 
        style={{ 
          borderRadius: '8px', 
          // boxShadow: '0 2px 8px rgba(0,0,0,0.1)' 
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <Title level={3} style={{ margin: 0, color: '#111827' }}>
            All Expenditures
          </Title>
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
            style={{ 
              width: '300px',
              // minWidth: '230px'
            }}
          />
          
          <DatePicker
            placeholder="mm/dd/yyyy"
            style={{ width: '120px' }}
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
    </div>
  );
};

export default TotalExpenditureScreen;