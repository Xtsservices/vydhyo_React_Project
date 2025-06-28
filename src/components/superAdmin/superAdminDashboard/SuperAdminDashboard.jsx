import React from 'react';
import { Card, Row, Col } from 'antd';
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

// Mock data matching the image exactly
const revenueSnapshotData = [
  { title: 'Today', value: '₹12,000', bgColor: 'bg-white' },
  { title: 'This Week', value: '₹84,500', bgColor: 'bg-white' },
  { title: 'This Month', value: '₹3,20,000', bgColor: 'bg-white' },
  { title: 'Total Revenue', value: '₹18,56,000', bgColor: 'bg-blue-600 text-white' },
];

const revenueContributionData = [
  { title: 'Appointments', value: '₹2,000', icon: '👤' },
  { title: 'Pharmacy', value: '₹2,000', icon: '💊' },
  { title: 'Labs', value: '₹2,000', icon: '🧪' },
  { title: 'Ambulance', value: '₹2,000', icon: '🚑' },
];

const approvalRequestsData = [
  { title: 'Pending Approval', value: 23, color: 'text-orange-500', bgColor: 'bg-orange-50' },
  { title: 'Approved', value: 76, color: 'text-green-500', bgColor: 'bg-green-50' },
  { title: 'Rejected', value: 12, color: 'text-red-500', bgColor: 'bg-red-50' },
];

const userMetricsData = [
  { title: 'Active Patients', value: '1,234', color: 'text-blue-500' },
  { title: 'Active Doctors', value: 76, color: 'text-purple-500' },
  { title: 'Total Patients', value: '5,690', color: 'text-blue-500' },
];

const consultationStatsData = [
  { title: 'Walk-ins', value: 214, icon: '🚶' },
  { title: 'Appointments', value: 156, icon: '📅' },
  { title: 'Video Consults', value: 92, icon: '📹' },
  { title: 'Home Visits', value: 47, icon: '🏠' },
];

const topDoctorsAppointments = [
  { name: 'Dr. Kavita Rao', appointments: 58 },
  { name: 'Dr. Arvind Sharma', appointments: 49 },
  { name: 'Dr. Meena Joshi', appointments: 47 },
  { name: 'Dr. Sandeep Yadav', appointments: 43 },
  { name: 'Dr. Neha Verma', appointments: 40 },
];

const topDoctorsRevenue = [
  { name: 'Dr. Meena Joshi', revenue: '₹1,20,000' },
  { name: 'Dr. Arvind Sharma', revenue: '₹98,000' },
  { name: 'Dr. Neha Verma', revenue: '₹90,500' },
  { name: 'Dr. Ravi Menon', revenue: '₹87,000' },
  { name: 'Dr. Kavita Rao', revenue: '₹84,300' },
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
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Super Admin Dashboard</h1>
      
      {/* Revenue Snapshot */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4">Revenue Snapshot</h2>
        <Row gutter={[16, 16]}>
          {revenueSnapshotData.map((item, index) => (
            <Col xs={24} sm={12} md={6} key={index}>
              <Card className={`text-center ${item.bgColor}`} bodyStyle={{ padding: '20px' }}>
                <div className="text-sm text-gray-600 mb-2">{item.title}</div>
                <div className={`text-2xl font-bold ${item.bgColor.includes('blue') ? 'text-white' : 'text-gray-900'}`}>
                  {item.value}
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* Revenue Contribution */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4">Revenue Contribution</h2>
        <Row gutter={[16, 16]}>
          {revenueContributionData.map((item, index) => (
            <Col xs={12} sm={6} key={index}>
              <Card className="text-center bg-white" bodyStyle={{ padding: '16px' }}>
                <div className="text-2xl mb-2">{item.icon}</div>
                <div className="text-lg font-bold text-gray-900">{item.value}</div>
                <div className="text-sm text-gray-600">{item.title}</div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* Three Main Sections */}
      <Row gutter={[16, 16]} className="mb-6">
        {/* Approval Requests */}
        <Col xs={24} md={8}>
          <Card title="Approval Requests" className="h-full">
            {approvalRequestsData.map((item, index) => (
              <div key={index} className={`flex items-center justify-between p-3 rounded-lg mb-2 ${item.bgColor}`}>
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full ${item.color.replace('text-', 'bg-')} mr-3`}></div>
                  <span className="text-sm">{item.title}</span>
                </div>
                <span className={`font-bold text-xl ${item.color}`}>{item.value}</span>
              </div>
            ))}
          </Card>
        </Col>

        {/* User Metrics */}
        <Col xs={24} md={8}>
          <Card title="User Metrics" className="h-full">
            {userMetricsData.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 mb-2">
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full ${item.color.replace('text-', 'bg-')} flex items-center justify-center mr-3`}>
                    <span className="text-white text-sm">👤</span>
                  </div>
                  <span className="text-sm">{item.title}</span>
                </div>
                <span className={`font-bold text-xl ${item.color}`}>{item.value}</span>
              </div>
            ))}
          </Card>
        </Col>

        {/* Consultation Stats */}
        <Col xs={24} md={8}>
          <Card title="Consultation Stats" className="h-full">
            {consultationStatsData.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 mb-2">
                <div className="flex items-center">
                  <div className="text-xl mr-3">{item.icon}</div>
                  <span className="text-sm">{item.title}</span>
                </div>
                <span className="font-bold text-xl text-gray-900">{item.value}</span>
              </div>
            ))}
          </Card>
        </Col>
      </Row>

      {/* Top Doctors */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} md={12}>
          <Card title="Top Doctors - Appointments" className="h-full">
            {topDoctorsAppointments.map((doctor, index) => (
              <div key={index} className="flex items-center justify-between p-2 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                    👨‍⚕️
                  </div>
                  <span className="text-sm font-medium">{doctor.name}</span>
                </div>
                <span className="font-bold text-orange-500">{doctor.appointments}</span>
              </div>
            ))}
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Top Doctors - Revenue" className="h-full">
            {topDoctorsRevenue.map((doctor, index) => (
              <div key={index} className="flex items-center justify-between p-2 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                    👨‍⚕️
                  </div>
                  <span className="text-sm font-medium">{doctor.name}</span>
                </div>
                <span className="font-bold text-green-500">{doctor.revenue}</span>
              </div>
            ))}
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={16}>
          <Card title="Revenue Trends" className="h-full">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueTrendsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card title="Appointment Distribution" className="h-full">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={appointmentDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={100}
                  dataKey="value"
                  label={({ value }) => value}
                >
                  {appointmentDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SuperAdminDashboard;