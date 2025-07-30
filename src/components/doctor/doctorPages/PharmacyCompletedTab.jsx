import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Pagination,
  Typography,
  Space,
  Tag,
  DatePicker,
  Select,
  Input,
  Card,
  Popconfirm,
  message
} from 'antd';
import { EyeOutlined, PrinterOutlined, SearchOutlined, CheckOutlined } from '@ant-design/icons';
import { apiGet, apiPost } from '../../api';
import { useSelector } from 'react-redux';

const { Text, Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const CompletedTab = ({ searchValue, updateCount }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [dateRange, setDateRange] = useState([]);
  const [processingPayment, setProcessingPayment] = useState({});
  const user = useSelector((state) => state.currentUserData);
  const doctorId = user?.role === "doctor" ? user?.userId : user?.createdBy;

  // Fetch completed orders
  const fetchCompletedOrders = async () => {
    try {
      setLoading(true);
      const response = await apiGet(
        `/pharmacy/getCompletedOrders/${doctorId}?searchValue=${searchValue || searchText}`
      );

      if (response.status === 200 && response.data?.data) {
        setCompletedOrders(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching completed orders:", error);
      message.error(error.response?.data?.message || "Failed to load completed orders");
    } finally {
      setLoading(false);
    }
  };

  // Process payment for an order
  const handleProcessPayment = async (orderId) => {
    try {
      setProcessingPayment(prev => ({ ...prev, [orderId]: true }));
      
      const response = await apiPost('/pharmacy/processPayment', {
        orderId,
        doctorId
      });

      if (response.status === 200) {
        message.success("Payment processed successfully");
        updateCount();
        fetchCompletedOrders();
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      message.error(error.response?.data?.message || "Failed to process payment");
    } finally {
      setProcessingPayment(prev => ({ ...prev, [orderId]: false }));
    }
  };

  useEffect(() => {
    if (doctorId) {
      fetchCompletedOrders();
    }
  }, [doctorId, searchValue]);

  const handleViewDetails = (record) => {
    console.log('View details for:', record);
    // Add view details logic here
  };

  const handlePrintReceipt = (record) => {
    console.log('Print receipt for:', record);
    // Add print receipt logic here
  };

  const columns = [
    {
      title: 'Order ID',
      dataIndex: 'orderId',
      key: 'orderId',
      width: 100,
    },
    {
      title: 'Patient',
      key: 'patient',
      width: 200,
      render: (_, record) => (
        <div className="patient-info">
          <div>
            <div className="patient-name">{record.patientName}</div>
            <div className="patient-id">{record.patientId}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      width: 130,
    },
    {
      title: 'Medicines',
      key: 'medicines',
      width: 200,
      render: (_, record) => (
        <div>
          {record.medicines.slice(0, 2).map((med, index) => (
            <div key={index} className="medicine-item">
              {med.name} x{med.quantity}
            </div>
          ))}
          {record.medicines.length > 2 && (
            <div className="medicine-more">
              +{record.medicines.length - 2} more
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Total Amount',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 120,
      render: (amount) => <span className="amount-cell">₹ {amount?.toFixed(2)}</span>,
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 140,
      render: (date) => (
        <div className="date-time-cell">
          {new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })}
        </div>
      ),
    },
    {
      title: 'Payment',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      width: 100,
      render: (method) => (
        <Tag color={method === 'Cash' ? 'green' : method === 'Card' ? 'blue' : 'orange'}>
          {method}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        let color = 'default';
        let text = status;
        
        switch (status) {
          case 'completed':
            color = 'green';
            text = 'Completed';
            break;
          case 'pending_payment':
            color = 'orange';
            text = 'Pending Payment';
            break;
          case 'paid':
            color = 'blue';
            text = 'Paid';
            break;
          default:
            color = 'gray';
        }
        
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: 'Action',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="text" 
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record)}
            size="small"
            title="View Details"
          />
          <Button 
            type="text" 
            icon={<PrinterOutlined />}
            onClick={() => handlePrintReceipt(record)}
            size="small"
            title="Print Receipt"
          />
          {record.status === 'pending_payment' && (
            <Popconfirm
              title="Confirm Payment"
              description={`Process payment of ₹${record.totalAmount?.toFixed(2)}?`}
              onConfirm={() => handleProcessPayment(record._id)}
              okText="Yes"
              cancelText="No"
            >
              <Button 
                type="primary" 
                size="small"
                icon={<CheckOutlined />}
                loading={processingPayment[record._id]}
              >
                Process
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSearch = (value) => {
    setSearchText(value);
  };

  const handleStatusFilter = (value) => {
    setFilterStatus(value);
  };

  const handleDateRangeChange = (dates) => {
    setDateRange(dates);
  };

  // Filter data based on search and filters
  const filteredData = completedOrders.filter(order => {
    const matchesSearch = !searchText || 
      order.patientName?.toLowerCase().includes(searchText.toLowerCase()) ||
      order.orderId?.toLowerCase().includes(searchText.toLowerCase()) ||
      order.phone?.includes(searchText);
    
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    
    // Add date range filtering logic here if needed
    
    return matchesSearch && matchesStatus;
  });

  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

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
            Completed Pharmacy Orders
          </Title>
        </Col>
      </Row>

      {/* Filters */}
      <div style={{ marginBottom: '16px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <Input
          placeholder="Search by patient name, order ID, or phone"
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => handleSearch(e.target.value)}
          style={{ width: 300 }}
        />
        <Select
          placeholder="Filter by status"
          value={filterStatus}
          onChange={handleStatusFilter}
          style={{ width: 150 }}
        >
          <Option value="all">All Status</Option>
          <Option value="completed">Completed</Option>
          <Option value="pending_payment">Pending Payment</Option>
          <Option value="paid">Paid</Option>
        </Select>
        <RangePicker
          placeholder={['Start Date', 'End Date']}
          value={dateRange}
          onChange={handleDateRangeChange}
        />
      </div>

      <Table 
        columns={columns} 
        dataSource={paginatedData}
        pagination={false}
        size="middle"
        showHeader={true}
        loading={loading}
        rowKey="_id"
        style={{ background: "#ffffff", borderRadius: "6px" }}
      />
      
      {filteredData.length > 0 && (
        <div className="pagination-container">
          <span className="pagination-info">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length} results
          </span>
          <Pagination 
            current={currentPage}
            total={filteredData.length}
            pageSize={pageSize}
            showSizeChanger={false}
            showQuickJumper={false}
            simple={false}
            onChange={handlePageChange}
          />
        </div>
      )}

      <style jsx>{`
        .patient-info {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .patient-name {
          font-weight: 500;
          font-size: 14px;
        }
        .patient-id {
          font-size: 12px;
          color: #8c8c8c;
        }
        .medicine-item {
          font-size: 12px;
          margin-bottom: 2px;
        }
        .medicine-more {
          font-size: 12px;
          color: #1890ff;
          font-style: italic;
        }
        .date-time-cell {
          line-height: 1.3;
        }
        .amount-cell {
          font-weight: 500;
          color: #52c41a;
        }
        .pagination-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 16px;
        }
        .pagination-info {
          font-size: 14px;
          color: #666;
        }
      `}</style>
    </Card>
  );
};

export default CompletedTab;