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
  Input
} from 'antd';
import { EyeOutlined, PrinterOutlined, SearchOutlined } from '@ant-design/icons';

const { Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const CompletedTab = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [dateRange, setDateRange] = useState([]);

  // Sample completed orders data - replace with actual API call
  const sampleCompletedOrders = [
    {
      key: '1',
      orderId: 'ORD-001',
      patientId: 'P-234512',
      patientName: 'John Doe',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      phone: '+91 98765XXXXX',
      medicines: [
        { name: 'Paracetamol', quantity: 2, price: 5.50 },
        { name: 'Amoxicillin', quantity: 1, price: 12.75 }
      ],
      totalAmount: 23.75,
      completedDate: '2025-07-01',
      completedTime: '14:30',
      status: 'completed',
      paymentMethod: 'Cash'
    },
    {
      key: '2',
      orderId: 'ORD-002',
      patientId: 'P-234513',
      patientName: 'Sarah Wilson',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b647?w=150&h=150&fit=crop&crop=face',
      phone: '+91 98765XXXXY',
      medicines: [
        { name: 'Ibuprofen', quantity: 1, price: 8.25 },
        { name: 'Cetirizine', quantity: 1, price: 15.00 }
      ],
      totalAmount: 23.25,
      completedDate: '2025-07-02',
      completedTime: '10:15',
      status: 'completed',
      paymentMethod: 'Card'
    },
    {
      key: '3',
      orderId: 'ORD-003',
      patientId: 'P-234514',
      patientName: 'Michael Chen',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      phone: '+91 98765XXXXZ',
      medicines: [
        { name: 'Metformin', quantity: 1, price: 18.50 }
      ],
      totalAmount: 18.50,
      completedDate: '2025-07-03',
      completedTime: '16:45',
      status: 'completed',
      paymentMethod: 'UPI'
    },
    {
      key: '4',
      orderId: 'ORD-004',
      patientId: 'P-234515',
      patientName: 'Emily Johnson',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      phone: '+91 98765XXXXW',
      medicines: [
        { name: 'Paracetamol', quantity: 3, price: 5.50 },
        { name: 'Ibuprofen', quantity: 2, price: 8.25 }
      ],
      totalAmount: 33.00,
      completedDate: '2025-07-04',
      completedTime: '11:20',
      status: 'completed',
      paymentMethod: 'Cash'
    },
    {
      key: '5',
      orderId: 'ORD-005',
      patientId: 'P-234516',
      patientName: 'David Brown',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
      phone: '+91 98765XXXXV',
      medicines: [
        { name: 'Amoxicillin', quantity: 2, price: 12.75 },
        { name: 'Cetirizine', quantity: 1, price: 15.00 }
      ],
      totalAmount: 40.50,
      completedDate: '2025-07-05',
      completedTime: '09:30',
      status: 'completed',
      paymentMethod: 'Card'
    }
  ];

  useEffect(() => {
    // Simulate API call
    setLoading(true);
    setTimeout(() => {
      setCompletedOrders(sampleCompletedOrders);
      setLoading(false);
    }, 1000);
  }, []);

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
          <img 
            src={record.avatar} 
            alt={record.patientName}
            className="patient-avatar"
          />
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
      render: (amount) => <span className="amount-cell">₹ {amount.toFixed(2)}</span>,
    },
    {
      title: 'Completed Date',
      key: 'completedDate',
      width: 140,
      render: (_, record) => (
        <div className="date-time-cell">
          <div className="date">{record.completedDate}</div>
          <div className="time">{record.completedTime}</div>
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
      render: (status) => (
        <Tag color="success">
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Tag>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      width: 120,
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
      order.patientName.toLowerCase().includes(searchText.toLowerCase()) ||
      order.orderId.toLowerCase().includes(searchText.toLowerCase()) ||
      order.phone.includes(searchText);
    
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    
    // Add date range filtering logic here if needed
    
    return matchesSearch && matchesStatus;
  });

  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  if (completedOrders.length === 0 && !loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <Text type="secondary">No completed orders</Text>
      </div>
    );
  }

  return (
    <>
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
          <Option value="refunded">Refunded</Option>
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
        .patient-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          object-fit: cover;
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
        .date {
          font-weight: 500;
          font-size: 13px;
        }
        .time {
          font-size: 12px;
          color: #8c8c8c;
        }
        .amount-cell {
          font-weight: 500;
          color: #52c41a;
        }
      `}</style>
    </>
  );
};

export default CompletedTab;