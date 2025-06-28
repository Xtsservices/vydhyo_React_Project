import React from 'react';
import { Card, Row, Col, Avatar, Typography } from 'antd';
import { 
  UserOutlined, 
  TeamOutlined, 
  MedicineBoxOutlined,
  CalendarOutlined,
  VideoCameraOutlined,
  HomeOutlined,
  UsergroupAddOutlined,
  ExperimentOutlined,
  CarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const { Title, Text } = Typography;

// Mock data matching the image exactly
const revenueSnapshotData = [
  { title: 'Today', value: '₹12,000' , bgColor: '#F1C1151A' },
  { title: 'This Week', value: '₹84,500', bgColor: '#EFF6FF' },
  { title: 'This Month', value: '₹3,20,000', bgColor: '#F0FDF4' },
  { title: 'Total Revenue', value: '₹18,56,000', isHighlight: true, bgColor: '#2E4861',color: '#FFFFFF' },
];

const revenueContributionData = [
  { title: 'Appointments', value: '₹2,000', icon: '👤', bgColor: '#F0FDF4' },
  { title: 'Pharmacy', value: '₹2,000', icon: '⚕️', bgColor: '#F1C1151A' },
  { title: 'Labs', value: '₹2,000', icon: '🧪', bgColor: '#EFF6FF' },
  { title: 'Ambulance', value: '₹2,000', icon: '🚑', bgColor: '#f0f9ff' },
];

const approvalRequestsData = [
  { title: 'Pending Approval', value: 23, color: '#fa8c16', bgColor: '#fff7e6', icon: <ClockCircleOutlined /> },
  { title: 'Approved', value: 76, color: '#52c41a', bgColor: '#f6ffed', icon: <CheckCircleOutlined /> },
  { title: 'Rejected', value: 12, color: '#ff4d4f', bgColor: '#fff2f0', icon: <CloseCircleOutlined /> },
];

const userMetricsData = [
  { title: 'Active Patients', value: '1,234', bgcolor: '#EFF6FF', icon: <TeamOutlined />, iconBg: '#1890ff' },
  { title: 'Active Doctors', value: 76, bgcolor: '#FAF5FF', icon: <UserOutlined />, iconBg: '#722ed1' },
  { title: 'Total Patients', value: '5,690', bgcolor: '#EFF6FF', icon: <UserOutlined />, iconBg: '#1890ff' },
];

const consultationStatsData = [
  { title: 'Walk-ins', value: 214, icon: '🚶', bgColor: '#f5f5f5' },
  { title: 'Appointments', value: 156, icon: '📅', bgColor: '#F1C1151A' },
  { title: 'Video Consults', value: 92, icon: '📹', bgColor: '#f0f9ff' },
  { title: 'Home Visits', value: 47, icon: '🏠', bgColor: '#F0FDF4' },
];

const topDoctorsAppointments = [
  { name: 'Dr. Kavita Rao', appointments: 58 },
  { name: 'Dr. Arvind Sharma', appointments: 49 },
  { name: 'Dr. Meena Joshi', appointments: 47 },
  { name: 'Dr. Sandeep Yadav', appointments: 43 },
];

const topDoctorsRevenue = [
  { name: 'Dr. Meena Joshi', revenue: '₹1,20,000',bgColor: '#F0FDF4' },
  { name: 'Dr. Arvind Sharma', revenue: '₹98,000',bgColor: '#F0FDF4' },
  { name: 'Dr. Neha Verma', revenue: '₹90,500',bgColor: '#F0FDF4' },
  { name: 'Dr. Ravi Menon', revenue: '₹87,000',bgColor: '#F0FDF4' },
  { name: 'Dr. Kavita Rao', revenue: '₹84,300',bgColor: '#F0FDF4' },
];

const revenueTrendsData = [
  { name: 'Jan', revenue: 17 },
  { name: 'Feb', revenue: 25 },
  { name: 'Mar', revenue: 40 },
  { name: 'Apr', revenue: 64 },
  { name: 'May', revenue: 78 },
  { name: 'Jun', revenue: 95 },
  { name: 'Jul', revenue: 103 },
];

const appointmentDistributionData = [
  { name: 'Dr. Kavita Rao', value: 17, color: '#3b82f6' },
  { name: 'Dr. Arvind Sharma', value: 25, color: '#10b981' },
  { name: 'Dr. Meena Joshi', value: 40, color: '#f59e0b' },
  { name: 'Dr. Sandeep Yadav', value: 55, color: '#8b5cf6' },
  { name: 'Dr. Neha Verma', value: 64, color: '#ec4899' },
  { name: 'Others', value: 78, color: '#6b7280' },
];

const SuperAdminDashboard = () => {
  return (
    <div style={{ padding: '16px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Title level={4} style={{ marginBottom: '16px', color: '#8c8c8c', fontWeight: 400 }}>
        Super Admin Dashboard
      </Title>
      
      {/* Top Row: Revenue Snapshot + Revenue Contribution */}
      <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
        {/* Revenue Snapshot - Left Side */}
        <Col xs={24} md={14}>
          <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '46px', color: '#262626' }}>
            Revenue Snapshot
          </div>
          <Row gutter={[8, 8]}>
            {revenueSnapshotData.map((item, index) => (
              <Col xs={24} sm={12} md={6} key={index}>
                <Card 
                  style={{
                    textAlign: 'center',
                    backgroundColor: item.bgColor,
                    borderRadius: '8px',
                    border: '1px solid #f0f0f0',
                    height: '100px'
                  }}
                  bodyStyle={{ padding: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}
                >
                  <div style={{ fontSize: '12px', color: item.color || '#8c8c8c', marginBottom: '4px' }}>
                    {item.title}
                  </div>
                  <div style={{ 
                    fontSize: '16px', 
                    fontWeight: 'bold', 
                    color: item.color || 'black', 
                  }}>
                    {item.value}
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </Col>

        {/* Revenue Contribution - Right Side */}
        <Col xs={24} md={10}>
          <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: '#262626' }}>
            Revenue Contribution
          </div>
          <Row gutter={[8, 8]}>
            {revenueContributionData.map((item, index) => (
              <Col xs={12} sm={6} md={12} key={index}>
                <Card 
                  style={{
                    textAlign: 'center',
                    backgroundColor: item.bgColor,
                    borderRadius: '8px',
                    border: '1px solid #f0f0f0',
                    height: '100px'
                  }}
                  bodyStyle={{ padding: '8px', display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}
                >
                  <div style={{ fontSize: '20px', marginBottom: '4px' }}>
                    {item.icon}
                  </div>
                  <div style={{ fontSize: '12px', color: '#8c8c8c', marginBottom: '4px' }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#262626' }}>
                    {item.value}
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </Col>
      </Row>

      {/* Second Row: Approval Requests, User Metrics, Consultation Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        {/* Approval Requests */}
        <Col xs={24} sm={12} md={8}>
          <Card 
            title="Approval Requests" 
            style={{ borderRadius: '8px', minHeight: '280px' }}
            headStyle={{ fontSize: '16px', fontWeight: 600 }}
            bodyStyle={{ padding: '12px' }}
          >
            {approvalRequestsData.map((item, index) => (
              <div 
                key={index} 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px',
                  backgroundColor: item.bgColor,
                  borderRadius: '6px',
                  marginBottom: index < approvalRequestsData.length - 1 ? '8px' : '0',
                  minHeight: '60px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ color: item.color, marginRight: '8px', fontSize: '16px' }}>
                    {item.icon}
                  </div>
                  <span style={{ fontSize: '14px', color: '#595959' }}>{item.title}</span>
                </div>
                <span style={{ fontSize: '20px', fontWeight: 'bold', color: item.color }}>
                  {item.value}
                </span>
              </div>
            ))}
          </Card>
        </Col>

        {/* User Metrics */}
        <Col xs={24} sm={12} md={8}>
          <Card 
            title="User Metrics" 
            style={{ borderRadius: '8px', minHeight: '280px' }}
            headStyle={{ fontSize: '16px', fontWeight: 600 }}
            bodyStyle={{ padding: '12px' }}
          >
            {userMetricsData.map((item, index) => (
              <div 
                key={index} 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 0',
                  borderBottom: index < userMetricsData.length - 1 ? '1px solid #f0f0f0' : 'none',
                  minHeight: '60px',
                  backgroundColor: item.bgcolor,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar 
                    size={32} 
                    style={{ backgroundColor: item.iconBg, marginRight: '8px' }}
                    icon={item.icon}
                  />
                  <span style={{ fontSize: '14px', color: '#595959' }}>{item.title}</span>
                </div>
                <span style={{ fontSize: '18px', fontWeight: 'bold', color: item.color }}>
                  {item.value}
                </span>
              </div>
            ))}
          </Card>
        </Col>

        {/* Consultation Stats */}
        <Col xs={24} md={8}>
          <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: '#262626' }}>
            Consultation Stats
          </div>
          <Row gutter={[8, 8]} style={{ minHeight: '220px' }}>
            {consultationStatsData.map((item, index) => (
              <Col xs={12} sm={6} md={12} key={index}>
                <Card 
                  style={{
                    textAlign: 'center',
                    backgroundColor: item.bgColor,
                    borderRadius: '8px',
                    border: '1px solid #f0f0f0',
                    height: '100px'
                  }}
                  bodyStyle={{ padding: '8px', display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}
                >
                  <div style={{ fontSize: '20px', marginBottom: '4px' }}>
                    {item.icon}
                  </div>
                  <div style={{ fontSize: '12px', color: '#8c8c8c', marginBottom: '4px' }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#262626' }}>
                    {item.value}
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </Col>
      </Row>

      {/* Top Doctors */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} lg={12}>
          <Card title="Top Doctors - Appointments" style={{ borderRadius: '8px', minHeight: '350px' }}>
            {topDoctorsAppointments.map((doctor, index) => (
              <div 
                key={index} 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 0',
                  borderBottom: index < topDoctorsAppointments.length - 1 ? '1px solid #f0f0f0' : 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar 
                    size={40} 
                    style={{ 
                      backgroundColor: `hsl(${index * 60}, 60%, 70%)`, 
                      marginRight: '12px',
                      border: '2px solid #fff',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                    src={`https://i.pravatar.cc/40?img=${index + 10}`}
                  />
                  <span style={{ fontSize: '14px', fontWeight: 500, color: '#262626' }}>
                    {doctor.name}
                  </span>
                </div>
                <div 
                  style={{
                    backgroundColor: '#fff7e6',
                    borderRadius: '12px',
                    padding: '4px 8px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: '#fa8c16'
                  }}
                >
                  {doctor.appointments}
                </div>
              </div>
            ))}
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card title="Top Doctors - Revenue" style={{ borderRadius: '8px', minHeight: '350px' }}>
            {topDoctorsRevenue.map((doctor, index) => (
              <div 
                key={index} 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 0',
                  borderBottom: index < topDoctorsRevenue.length - 1 ? '1px solid #f0f0f0' : 'none',
                  backgroundColor: '#F0FDF4'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar 
                    size={40} 
                    style={{ 
                      backgroundColor: `hsl(${(index + 3) * 60}, 60%, 70%)`, 
                      marginRight: '12px',
                      border: '2px solid #fff',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                    src={`https://i.pravatar.cc/40?img=${index + 15}`}
                  />
                  <span style={{ fontSize: '14px', fontWeight: 500, color: '#262626' }}>
                    {doctor.name}
                  </span>
                </div>
                <div 
                  style={{
                    backgroundColor: '#f6ffed',
                    borderRadius: '12px',
                    padding: '4px 8px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: '#52c41a'
                  }}
                >
                  {doctor.revenue}
                </div>
              </div>
            ))}
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="Revenue Trends" style={{ borderRadius: '8px' }}>
            <div style={{ width: '100%', height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueTrendsData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#8c8c8c' }} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#8c8c8c' }} 
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #d9d9d9', 
                      borderRadius: '6px',
                      fontSize: '12px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#1890ff" 
                    fill="#1890ff" 
                    fillOpacity={0.1}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} lg={8}>
          <Card title="Appointment Distribution" style={{ borderRadius: '8px' }}>
            <div style={{ width: '100%', height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={appointmentDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    dataKey="value"
                    label={({ value }) => value}
                    labelStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                  >
                    {appointmentDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #d9d9d9', 
                      borderRadius: '6px',
                      fontSize: '12px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SuperAdminDashboard;