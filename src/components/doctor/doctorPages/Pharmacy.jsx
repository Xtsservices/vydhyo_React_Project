import React, { useState } from 'react';
import { 
  Layout, 
  Card, 
  Table, 
  Tabs, 
  Input, 
  Button, 
  Avatar, 
  Space,
  Row,
  Col,
  Statistic,
  Typography,
  Pagination
} from 'antd';
import { 
  SearchOutlined, 
  UserOutlined, 
  UsergroupAddOutlined,
  EditOutlined,
  CheckOutlined,
  CloseOutlined,
  PlusOutlined,
  MedicineBoxOutlined
} from '@ant-design/icons';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

const styles = `
  .pharmacy-layout {
    min-height: 100vh;
    background: #f8f9fa !important;
  }

  .pharmacy-header {
    background: #fff !important;
    padding: 12px 24px !important;
    box-shadow: none !important;
    border-bottom: 1px solid #e8e8e8 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: space-between !important;
    height: 64px !important;
  }

  .pharmacy-logo {
    display: flex !important;
    align-items: center !important;
    gap: 8px !important;
  }

  .pharmacy-logo .anticon {
    font-size: 20px !important;
    color: #4285f4 !important;
  }

  .pharmacy-title {
    font-size: 20px !important;
    font-weight: 600 !important;
    color: #333 !important;
    margin: 0 !important;
  }

  .pharmacy-search {
    width: 400px !important;
    height: 40px !important;
    border-radius: 20px !important;
    border: 1px solid #e0e0e0 !important;
    background: #f8f9fa !important;
  }

  .pharmacy-search .ant-input {
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
    font-size: 14px !important;
    color: #999 !important;
  }

  .pharmacy-search .ant-input::placeholder {
    color: #999 !important;
  }

  .pharmacy-search .anticon {
    color: #999 !important;
  }

  .revenue-card-today {
    background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%) !important;
    border: none !important;
    border-radius: 12px !important;
    padding: 20px !important;
    position: relative !important;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08) !important;
  }

  .revenue-card-month {
    background: linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%) !important;
    border: none !important;
    border-radius: 12px !important;
    padding: 20px !important;
    position: relative !important;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08) !important;
  }

  .revenue-icon {
    position: absolute !important;
    top: 16px !important;
    right: 16px !important;
  }

  .revenue-icon-today {
    background: #2196f3 !important;
    width: 40px !important;
    height: 40px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    border-radius: 8px !important;
  }

  .revenue-icon-month {
    background: #4caf50 !important;
    width: 40px !important;
    height: 40px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    border-radius: 8px !important;
  }

  .revenue-title-today {
    color: #2196f3 !important;
    font-size: 14px !important;
    font-weight: 500 !important;
    margin-bottom: 8px !important;
  }

  .revenue-title-month {
    color: #4caf50 !important;
    font-size: 14px !important;
    font-weight: 500 !important;
    margin-bottom: 8px !important;
  }

  .revenue-value-today {
    color: #2196f3 !important;
    font-size: 32px !important;
    font-weight: 700 !important;
    margin-bottom: 4px !important;
  }

  .revenue-value-month {
    color: #4caf50 !important;
    font-size: 32px !important;
    font-weight: 700 !important;
    margin-bottom: 4px !important;
  }

  .revenue-subtitle-today {
    color: #2196f3 !important;
    font-size: 14px !important;
  }

  .revenue-subtitle-month {
    color: #4caf50 !important;
    font-size: 14px !important;
  }

  .main-card {
    border-radius: 12px !important;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06) !important;
    border: 1px solid #e8e8e8 !important;
    overflow: hidden !important;
  }

  .ant-tabs-nav {
    margin: 0 !important;
    background: #fff !important;
  }

  .ant-tabs-tab {
    padding: 16px 24px !important;
    font-size: 14px !important;
    font-weight: 500 !important;
    color: #666 !important;
    border-right: 1px solid #e8e8e8 !important;
    margin: 0 !important;
    background: #fff !important;
  }

  .ant-tabs-tab:last-child {
    border-right: none !important;
  }

  .ant-tabs-tab-active {
    background: #fff !important;
    color: #333 !important;
    border-bottom: 2px solid #4285f4 !important;
  }

  .ant-tabs-ink-bar {
    background: #4285f4 !important;
  }

  .ant-tabs-content-holder {
    background: #fff !important;
  }

  .ant-table {
    background: #fff !important;
  }

  .ant-table-thead > tr > th {
    background: #fff !important;
    border-bottom: 1px solid #e8e8e8 !important;
    font-weight: 400 !important;
    color: #666 !important;
    font-size: 12px !important;
    padding: 12px 16px !important;
  }

  .ant-table-tbody > tr > td {
    padding: 16px !important;
    border-bottom: 1px solid #e8e8e8 !important;
    font-size: 14px !important;
  }

  .ant-table-tbody > tr:hover > td {
    background: #fafafa !important;
  }

  .patient-avatar {
    width: 40px !important;
    height: 40px !important;
    border-radius: 50% !important;
    object-fit: cover !important;
  }

  .patient-name {
    font-size: 14px !important;
    font-weight: 500 !important;
    color: #333 !important;
    margin-left: 12px !important;
  }

  .patient-info {
    display: flex !important;
    align-items: center !important;
  }

  .date-time-cell {
    line-height: 1.2 !important;
  }

  .date-time-cell .date {
    font-size: 13px !important;
    color: #333 !important;
    font-weight: 400 !important;
  }

  .date-time-cell .time {
    font-size: 12px !important;
    color: #666 !important;
  }

  .amount-cell {
    font-weight: 600 !important;
    color: #333 !important;
    font-size: 14px !important;
  }

  .action-buttons {
    display: flex !important;
    gap: 8px !important;
  }

  .accept-btn {
    background: #4caf50 !important;
    border: none !important;
    color: white !important;
    padding: 4px 12px !important;
    border-radius: 4px !important;
    font-size: 12px !important;
    height: 28px !important;
    font-weight: 500 !important;
  }

  .reject-btn {
    background: #f44336 !important;
    border: none !important;
    color: white !important;
    padding: 4px 12px !important;
    border-radius: 4px !important;
    font-size: 12px !important;
    height: 28px !important;
    font-weight: 500 !important;
  }

  .edit-btn {
    background: #757575 !important;
    border: none !important;
    color: white !important;
    padding: 4px 8px !important;
    border-radius: 4px !important;
    font-size: 12px !important;
    height: 28px !important;
    width: 28px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
  }

  .pagination-container {
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
    padding: 16px 24px !important;
    border-top: 1px solid #e8e8e8 !important;
    background: #fff !important;
  }

  .pagination-info {
    color: #666 !important;
    font-size: 13px !important;
  }

  .ant-pagination {
    margin: 0 !important;
  }

  .ant-pagination-item {
    border: 1px solid #e0e0e0 !important;
    background: #fff !important;
  }

  .ant-pagination-item-active {
    background: #4285f4 !important;
    border-color: #4285f4 !important;
  }

  .ant-pagination-item-active a {
    color: #fff !important;
  }

  .notes-section {
    margin-top: 24px !important;
  }

  .notes-header {
    display: flex !important;
    align-items: center !important;
    justify-content: space-between !important;
    margin-bottom: 16px !important;
  }

  .notes-title {
    display: flex !important;
    align-items: center !important;
    gap: 8px !important;
    font-size: 18px !important;
    font-weight: 600 !important;
    color: #333 !important;
  }

  .add-note-btn {
    background: #4285f4 !important;
    border: none !important;
    border-radius: 50% !important;
    width: 36px !important;
    height: 36px !important;
    padding: 0 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    box-shadow: 0 2px 8px rgba(66, 133, 244, 0.3) !important;
  }

  .add-note-btn .anticon {
    color: white !important;
    font-size: 16px !important;
  }
`;

export default function Pharmacy() {
  const [activeTab, setActiveTab] = useState('1');
  const [searchQuery, setSearchQuery] = useState('');

  const patientData = [
    {
      key: '1',
      patientId: 'P-234512',
      name: 'John Doe',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      gender: 'Male',
      phone: '+91 98765XXXXX',
      date: '28 June 2025',
      time: '09:00 Am',
      amount: 500,
      status: 'pending'
    },
    {
      key: '2',
      patientId: 'P-234513',
      name: 'Sarah Wilson',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b647?w=150&h=150&fit=crop&crop=face',
      gender: 'Female',
      phone: '+91 98765XXXXY',
      date: '25 June 2025',
      time: '10:00 Am',
      amount: 500,
      status: 'pending'
    },
    {
      key: '3',
      patientId: 'P-234514',
      name: 'Michael Chen',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      gender: 'Male',
      phone: '+91 98765XXXXZ',
      date: '20 June 2025',
      time: '11:30 Pm',
      amount: 500,
      status: 'pending'
    },
    {
      key: '4',
      patientId: 'P-234513',
      name: 'Sarah Wilson',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b647?w=150&h=150&fit=crop&crop=face',
      gender: 'Female',
      phone: '+91 98765XXXXY',
      date: '25 June 2025',
      time: '04:30 Pm',
      amount: 500,
      status: 'pending'
    }
  ];

  const columns = [
    {
      title: 'Patient ID',
      dataIndex: 'patientId',
      key: 'patientId',
      width: 120,
    },
    {
      title: 'Patient',
      key: 'patient',
      width: 200,
      render: (_, record) => (
        <div className="patient-info">
          <img 
            src={record.avatar} 
            alt={record.name}
            className="patient-avatar"
          />
          <span className="patient-name">{record.name}</span>
        </div>
      ),
    },
    {
      title: 'Gender',
      dataIndex: 'gender',
      key: 'gender',
      width: 100,
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      width: 150,
    },
    {
      title: 'Date & Time',
      key: 'dateTime',
      width: 150,
      render: (_, record) => (
        <div className="date-time-cell">
          <div className="date">{record.date}</div>
          <div className="time">{record.time}</div>
        </div>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      width: 100,
      render: (amount) => <span className="amount-cell">₹ {amount}</span>,
    },
    {
      title: 'Action',
      key: 'action',
      width: 200,
      render: () => (
        <div className="action-buttons">
          <Button className="accept-btn">Accept</Button>
          <Button className="reject-btn">Reject</Button>
          <Button className="edit-btn">Edit</Button>
        </div>
      ),
    },
  ];

  const tabItems = [
    {
      key: '1',
      label: 'Pending',
      children: (
        <>
          <Table 
            columns={columns} 
            dataSource={patientData}
            pagination={false}
            size="middle"
            showHeader={true}
          />
          <div className="pagination-container">
            <span className="pagination-info">Showing 1 to 4 of 97 results</span>
            <Pagination 
              current={1}
              total={97}
              pageSize={4}
              showSizeChanger={false}
              showQuickJumper={false}
              simple={false}
            />
          </div>
        </>
      ),
    },
    {
      key: '2',
      label: 'Processing',
      children: (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Text type="secondary">No processing patients</Text>
        </div>
      ),
    },
    {
      key: '3',
      label: 'completed',
      children: (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Text type="secondary">No completed patients</Text>
        </div>
      ),
    },
  ];

  return (
    <div>
      <style>{styles}</style>
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

        <Content style={{ padding: '24px' }}>
          {/* Revenue Cards */}
          <Row gutter={[24, 24]} style={{ marginBottom: '24px' }}>
            <Col xs={24} sm={12}>
              <Card className="revenue-card-today">
                <div className="revenue-icon">
                  <div className="revenue-icon-today">
                    <UserOutlined style={{ color: 'white', fontSize: '18px' }} />
                  </div>
                </div>
                <div>
                  <div className="revenue-title-today">Today Revenue</div>
                  <div className="revenue-value-today">₹ 1,200</div>
                  <div className="revenue-subtitle-today">Patient : 12</div>
                </div>
              </Card>
            </Col>
            
            <Col xs={24} sm={12}>
              <Card className="revenue-card-month">
                <div className="revenue-icon">
                  <div className="revenue-icon-month">
                    <UsergroupAddOutlined style={{ color: 'white', fontSize: '18px' }} />
                  </div>
                </div>
                <div>
                  <div className="revenue-title-month">This Month Revenue</div>
                  <div className="revenue-value-month">₹ 19,000</div>
                  <div className="revenue-subtitle-month">Patients : 120</div>
                </div>
              </Card>
            </Col>
          </Row>

          {/* Patient Management Table */}
          <Card className="main-card">
            <Tabs 
              activeKey={activeTab} 
              onChange={setActiveTab}
              items={tabItems}
            />
          </Card>

          {/* My Notes Section */}
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