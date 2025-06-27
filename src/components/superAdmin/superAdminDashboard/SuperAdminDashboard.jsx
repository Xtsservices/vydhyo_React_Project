import React from 'react';
import { Card, Row, Col, Statistic, Progress, Avatar, List } from 'antd';
import { 
  UserOutlined, 
  TeamOutlined, 
  CalendarOutlined,
  VideoCameraOutlined,
  HomeOutlined,
  CarOutlined,
  HeartOutlined,
  MedicineBoxOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Dashboard = () => {
  // Sample data for charts
  const revenueData = [
    { name: 'Jan', value: 17 },
    { name: 'Feb', value: 25 },
    { name: 'Mar', value: 40 },
    { name: 'Apr', value: 55 },
    { name: 'May', value: 64 },
    { name: 'Jun', value: 78 },
    { name: 'Jul', value: 95 },
    { name: 'Aug', value: 100 }
  ];

  const appointmentData = [
    { name: 'Category 1', value: 100, color: '#52c41a' },
    { name: 'Category 2', value: 95, color: '#d9d9d9' },
    { name: 'Category 3', value: 78, color: '#1890ff' },
    { name: 'Category 4', value: 64, color: '#722ed1' },
    { name: 'Category 5', value: 55, color: '#13c2c2' },
    { name: 'Category 6', value: 40, color: '#eb2f96' },
    { name: 'Category 7', value: 25, color: '#f5222d' },
    { name: 'Category 8', value: 17, color: '#fa541c' }
  ];

  const topDoctorsAppointments = [
    { name: 'Dr. Kavita Rao', appointments: 56, avatar: '/api/placeholder/32/32' },
    { name: 'Dr. Arvind Sharma', appointments: 49, avatar: '/api/placeholder/32/32' },
    { name: 'Dr. Meena Joshi', appointments: 47, avatar: '/api/placeholder/32/32' },
    { name: 'Dr. Sandeep Yadav', appointments: 43, avatar: '/api/placeholder/32/32' },
    { name: 'Dr. Neha Verma', appointments: 40, avatar: '/api/placeholder/32/32' }
  ];

  const topDoctorsRevenue = [
    { name: 'Dr. Meena Joshi', revenue: '₹1,20,000', avatar: '/api/placeholder/32/32' },
    { name: 'Dr. Arvind Sharma', revenue: '₹98,000', avatar: '/api/placeholder/32/32' },
    { name: 'Dr. Neha Verma', revenue: '₹90,500', avatar: '/api/placeholder/32/32' },
    { name: 'Dr. Ravi Menon', revenue: '₹87,000', avatar: '/api/placeholder/32/32' },
    { name: 'Dr. Kavita Rao', revenue: '₹84,300', avatar: '/api/placeholder/32/32' }
  ];

  return (
    <div style={{ padding: '24px', backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
      {/* Revenue Snapshot */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Today"
              value="₹12,000"
              valueStyle={{ color: '#1890ff', fontSize: '24px', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="This Week"
              value="₹84,500"
              valueStyle={{ color: '#1890ff', fontSize: '24px', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="This Month"
              value="₹3,20,000"
              valueStyle={{ color: '#1890ff', fontSize: '24px', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card style={{ backgroundColor: '#fadb14' }}>
            <Statistic
              title="Total Revenue"
              value="₹18,56,000"
              valueStyle={{ color: '#ffffff', fontSize: '24px', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Revenue Contribution */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <MedicineBoxOutlined style={{ fontSize: '32px', color: '#1890ff', marginBottom: '8px' }} />
              <div style={{ fontSize: '12px', color: '#8c8c8c' }}>Appointments</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>₹2,000</div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <HeartOutlined style={{ fontSize: '32px', color: '#52c41a', marginBottom: '8px' }} />
              <div style={{ fontSize: '12px', color: '#8c8c8c' }}>Pharmacy</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>₹2,000</div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <UserOutlined style={{ fontSize: '32px', color: '#722ed1', marginBottom: '8px' }} />
              <div style={{ fontSize: '12px', color: '#8c8c8c' }}>Labs</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>₹2,000</div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <CarOutlined style={{ fontSize: '32px', color: '#13c2c2', marginBottom: '8px' }} />
              <div style={{ fontSize: '12px', color: '#8c8c8c' }}>Ambulance</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>₹2,000</div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Main Content Row */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        {/* Approval Requests */}
        <Col span={8}>
          <Card title="Approval Requests">
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span><ClockCircleOutlined style={{ color: '#faad14', marginRight: '8px' }} />Pending Approval</span>
                <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#faad14' }}>23</span>
              </div>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span><CheckCircleOutlined style={{ color: '#52c41a', marginRight: '8px' }} />Approved</span>
                <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#52c41a' }}>76</span>
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span><CloseCircleOutlined style={{ color: '#f5222d', marginRight: '8px' }} />Rejected</span>
                <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#f5222d' }}>12</span>
              </div>
            </div>
          </Card>
        </Col>

        {/* User Metrics */}
        <Col span={8}>
          <Card title="User Metrics">
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span><TeamOutlined style={{ color: '#1890ff', marginRight: '8px' }} />Active Users</span>
                <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#1890ff' }}>1,234</span>
              </div>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span><UserOutlined style={{ color: '#722ed1', marginRight: '8px' }} />Active Doctors</span>
                <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#722ed1' }}>76</span>
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span><TeamOutlined style={{ color: '#13c2c2', marginRight: '8px' }} />Total Patients</span>
                <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#13c2c2' }}>5,690</span>
              </div>
            </div>
          </Card>
        </Col>

        {/* Consultation Stats */}
        <Col span={8}>
          <Card title="Consultation Stats">
            <Row gutter={16}>
              <Col span={12}>
                <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                  <HomeOutlined style={{ fontSize: '24px', color: '#1890ff', marginBottom: '8px' }} />
                  <div style={{ fontSize: '12px', color: '#8c8c8c' }}>Walk-ins</div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold' }}>214</div>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                  <CalendarOutlined style={{ fontSize: '24px', color: '#faad14', marginBottom: '8px' }} />
                  <div style={{ fontSize: '12px', color: '#8c8c8c' }}>Appointments</div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold' }}>156</div>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ textAlign: 'center' }}>
                  <VideoCameraOutlined style={{ fontSize: '24px', color: '#1890ff', marginBottom: '8px' }} />
                  <div style={{ fontSize: '12px', color: '#8c8c8c' }}>Video Consults</div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold' }}>92</div>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ textAlign: 'center' }}>
                  <HomeOutlined style={{ fontSize: '24px', color: '#52c41a', marginBottom: '8px' }} />
                  <div style={{ fontSize: '12px', color: '#8c8c8c' }}>Home Visits</div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold' }}>47</div>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Doctor Rankings */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col span={12}>
          <Card title="Top Doctors - Appointments">
            <List
              itemLayout="horizontal"
              dataSource={topDoctorsAppointments}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar src={item.avatar} icon={<UserOutlined />} />}
                    title={item.name}
                  />
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#faad14' }}>
                    {item.appointments} appts
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Top Doctors - Revenue">
            <List
              itemLayout="horizontal"
              dataSource={topDoctorsRevenue}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar src={item.avatar} icon={<UserOutlined />} />}
                    title={item.name}
                  />
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#52c41a' }}>
                    {item.revenue}
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card title="Revenue Trends">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#1890ff" 
                  strokeWidth={3}
                  dot={{ fill: '#1890ff', strokeWidth: 2, r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Appointment Distribution">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={appointmentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {appointmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              {appointmentData.map((item, index) => (
                <div key={index} style={{ display: 'inline-block', margin: '0 8px', fontSize: '12px' }}>
                  <span style={{ 
                    display: 'inline-block', 
                    width: '12px', 
                    height: '12px', 
                    backgroundColor: item.color,
                    marginRight: '4px',
                    borderRadius: '2px'
                  }} />
                  {item.value}
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;