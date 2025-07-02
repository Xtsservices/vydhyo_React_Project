import React, { useState } from 'react';
import { 
  Input, 
  Tabs, 
  Table, 
  Button, 
  Card, 
  Avatar, 
  Space, 
  Typography,
  Row,
  Col,
  Pagination
} from 'antd';
import { 
  SearchOutlined, 
  UserOutlined, 
  TeamOutlined,
  EditOutlined,
  PlusOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const Labs = () => {
  const [activeTab, setActiveTab] = useState('1');
  const [current, setCurrent] = useState(1);

  const patients = [
    {
      key: '1',
      patientId: 'P-234512',
      name: 'John Doe',
      gender: 'Male',
      phone: '+91 98765XXXXX',
      date: '28 June 2025',
      time: '09:00 Am',
      amount: 500,
      avatar: '👨'
    },
    {
      key: '2',
      patientId: 'P-234513',
      name: 'Sarah Wilson',
      gender: 'Female',
      phone: '+91 98765XXXXY',
      date: '25 June 2025',
      time: '10:00 Am',
      amount: 500,
      avatar: '👩'
    },
    {
      key: '3',
      patientId: 'P-234514',
      name: 'Michael Chen',
      gender: 'Male',
      phone: '+91 98765XXXXZ',
      date: '20 June 2025',
      time: '11:30 Pm',
      amount: 500,
      avatar: '👨'
    },
    {
      key: '4',
      patientId: 'P-234513',
      name: 'Sarah Wilson',
      gender: 'Female',
      phone: '+91 98765XXXXY',
      date: '25 June 2025',
      time: '04:30 Pm',
      amount: 500,
      avatar: '👩'
    }
  ];

  const notes = [
    {
      id: 1,
      text: 'Follow up with patient #1247 for X-ray results',
      time: 'Today, 2:30 PM'
    },
    {
      id: 2,
      text: 'Equipment maintenance scheduled for next week',
      time: 'Yesterday, 4:15 PM'
    }
  ];

  const columns = [
    {
      title: 'Patient ID',
      dataIndex: 'patientId',
      key: 'patientId',
      render: (text) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ 
            width: '4px', 
            height: '24px', 
            backgroundColor: '#ff4d4f', 
            borderRadius: '2px' 
          }}></div>
          <Text strong style={{ fontSize: '13px' }}>{text}</Text>
        </div>
      ),
    },
    {
      title: 'Patient',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            backgroundColor: '#f5f5f5',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px'
          }}>
            {record.avatar}
          </div>
          <Text strong>{text}</Text>
        </div>
      ),
    },
    {
      title: 'Gender',
      dataIndex: 'gender',
      key: 'gender',
      render: (text) => <Text style={{ color: '#666', fontSize: '13px' }}>{text}</Text>
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      render: (text) => <Text style={{ color: '#666', fontSize: '13px' }}>{text}</Text>
    },
    {
      title: 'Date & Time',
      key: 'datetime',
      render: (_, record) => (
        <div>
          <div style={{ color: '#666', fontSize: '13px' }}>{record.date}</div>
          <div style={{ color: '#666', fontSize: '13px' }}>{record.time}</div>
        </div>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => <Text strong>₹ {amount}</Text>
    },
    {
      title: 'Action',
      key: 'action',
      render: () => (
        <Space size="small">
          <Button 
            size="small" 
            type="primary" 
            style={{ 
              backgroundColor: '#52c41a', 
              borderColor: '#52c41a',
              fontSize: '11px',
              height: '24px',
              padding: '0 8px'
            }}
          >
            Accept
          </Button>
          <Button 
            size="small" 
            danger 
            style={{ 
              backgroundColor: 'red',
              color:'white', 
              fontSize: '11px',
              height: '24px',
              padding: '0 8px'
            }}
          >
            Reject
          </Button>
          <Button 
            size="small" 
            style={{ 
              backgroundColor: '#8c8c8c',
              borderColor: '#8c8c8c',
              color: 'white',
              fontSize: '11px',
              height: '24px',
              padding: '0 8px'
            }}
          >
            Edit
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f5f5f5', 
      padding: '24px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Header */}
      <Row justify="space-between" align="middle" style={{ marginBottom: '24px' }}>
        <Col>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              backgroundColor: '#1890ff',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '16px',
              fontWeight: 'bold'
            }}>
              ⚗
            </div>
            <Title level={2} style={{ margin: 0, color: '#262626' }}>Labs</Title>
          </div>
        </Col>
        <Col>
          <Input
            placeholder="Search Patient by Mobile Number"
            prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
            style={{ 
              width: '320px',
              borderRadius: '8px'
            }}
          />
        </Col>
      </Row>

      {/* Revenue Cards */}
      <Row gutter={24} style={{ marginBottom: '24px' }}>
        <Col span={12}>
          <Card style={{ 
            backgroundColor: '#DBEAFE',
            border: 'none',
            borderRadius: '8px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <Text style={{ color: '#2563EB', fontWeight: 500, fontSize: '14px' }}>Today Revenue</Text>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#2563EB', margin: '8px 0' }}>
                  ₹1,200
                </div>
                <Text style={{ color: '#2563EB', fontSize: '14px' }}>Patient : 12</Text>
              </div>
              <div style={{
                backgroundColor: '#bae7ff',
                padding: '8px',
                borderRadius: '8px'
              }}>
                <UserOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
              </div>
            </div>
          </Card>
        </Col>
        
        <Col span={12}>
          <Card style={{ 
            backgroundColor: '#DCFCE7',
            border: 'none',
            borderRadius: '8px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <Text style={{ color: '#16A34A', fontWeight: 500, fontSize: '14px' }}>This Month Revenue</Text>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#16A34A', margin: '8px 0' }}>
                  ₹19,000
                </div>
                <Text style={{ color: '#16A34A', fontSize: '14px' }}>Patients : 120</Text>
              </div>
              <div style={{
                backgroundColor: '#b7eb8f',
                padding: '8px',
                borderRadius: '8px'
              }}>
                <TeamOutlined style={{ fontSize: '24px', color: '#52c41a' }} />
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Main Table Card */}
      <Card style={{ marginBottom: '24px', borderRadius: '8px', border: '1px solid #f0f0f0' }}>
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          style={{ marginBottom: '0' }}
        >
          <TabPane tab="Pending" key="1" />
          <TabPane tab="Processing" key="2" />
          <TabPane tab="completed" key="3" />
        </Tabs>
        
        <Table
          columns={columns}
          dataSource={patients}
          pagination={false}
          style={{ marginTop: '16px' }}
        />
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginTop: '16px',
          paddingTop: '16px',
          borderTop: '1px solid #f0f0f0'
        }}>
          <Text style={{ color: '#8c8c8c', fontSize: '13px' }}>
            Showing 1to10of197results
          </Text>
          <Pagination
            current={current}
            total={197}
            pageSize={10}
            onChange={setCurrent}
            showSizeChanger={false}
            size="small"
          />
        </div>
      </Card>

      {/* My Notes Section */}
      <Card style={{ borderRadius: '8px', border: '1px solid #f0f0f0' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Title level={4} style={{ margin: 0, color: '#262626' }}>My Notes</Title>
            <EditOutlined style={{ color: '#bfbfbf', fontSize: '16px' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Button
              shape="circle"
              icon={<PlusOutlined />}
              style={{ 
                border: '1px solid #d9d9d9',
                backgroundColor: 'white'
              }}
            />
            <div style={{
              width: '64px',
              height: '64px',
              background: 'linear-gradient(135deg, #b37feb, #9254de)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px'
            }}>
              👨‍⚕️
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Card 
            size="small" 
            style={{ 
              backgroundColor: '#fffbe6',
              border: '1px solid #ffe58f',
              borderRadius: '8px'
            }}
          >
            <Text style={{ color: '#595959', fontSize: '13px', display: 'block', marginBottom: '4px' }}>
              Follow up with patient #1247 for X-ray results
            </Text>
            <Text style={{ color: '#8c8c8c', fontSize: '11px' }}>Today, 2:30 PM</Text>
          </Card>
          
          <Card 
            size="small" 
            style={{ 
              backgroundColor: '#e6f7ff',
              border: '1px solid #91d5ff',
              borderRadius: '8px'
            }}
          >
            <Text style={{ color: '#595959', fontSize: '13px', display: 'block', marginBottom: '4px' }}>
              Equipment maintenance scheduled for next week
            </Text>
            <Text style={{ color: '#8c8c8c', fontSize: '11px' }}>Yesterday, 4:15 PM</Text>
          </Card>
        </div>
      </Card>
    </div>
  );
};

export default Labs;