import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, useNavigate } from "react-router-dom";
import {
  Layout,
  Card,
  Avatar,
  Button,
  List,
  Typography,
  Row,
  Col,
  Menu,
  Badge,
  Statistic,
  Tag,
  Select,
  Space,
  Pagination,
  Grid,
} from "antd";
import {
  UserOutlined,
  CalendarOutlined,
  DashboardOutlined,
  FileTextOutlined,
  TeamOutlined,
  SettingOutlined,
  VideoCameraOutlined,
  PhoneOutlined,
  MailOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { apiGet } from "../../api";

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;
const { useBreakpoint } = Grid;
const DoctorDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    success: true,
    totalAmount: { today: 0, week: 0, month: 0, total: 0 },
    appointmentTypes: { "In-Person": 0, Video: 0, "home-visit": 0 },
    appointmentCounts: {
      today: 0,
      upcoming: 0,
      completed: 0,
      rescheduled: 0,
      cancelled: 0,
      active: 0,
      total: 0,
    },
    uniquePatients: { total: 0, today: 0, week: 0, month: 0 },
  });
  const [appointmentsPage, setAppointmentsPage] = useState(1);
  const [patientsPage, setPatientsPage] = useState(1);
  const [invoicesPage, setInvoicesPage] = useState(1);
  const [notificationsPage, setNotificationsPage] = useState(1);
  const pageSize = 5;
  const navigate = useNavigate();
  const screens = useBreakpoint();

  const appointments = [
    {
      id: 1,
      name: "Adrian Marshall",
      time: "11 Nov 2024 10:45 AM",
      type: "General Visit",
      status: "confirmed",
      avatar: "👨‍💼",
    },
    {
      id: 2,
      name: "Kelly Stevens",
      time: "10 Nov 2024 11:30 AM",
      type: "Routine Checkup",
      status: "confirmed",
      avatar: "👩‍💼",
    },
    {
      id: 3,
      name: "Samuel Anderson",
      time: "09 Nov 2024 02:00 PM",
      type: "Follow-up",
      status: "pending",
      avatar: "👨‍💻",
    },
    {
      id: 4,
      name: "Catherine Griffin",
      time: "07 Nov 2024 04:00 PM",
      type: "Consultation",
      status: "completed",
      avatar: "👩‍🦳",
    },
    {
      id: 5,
      name: "Robert Hutchinson",
      time: "28 Oct 2024 05:30 PM",
      type: "Surgery",
      status: "completed",
      avatar: "👨‍🦲",
    },
  ];

  const recentPatients = [
    { name: "Adrian Marshall", lastVisit: "Mar 2024", id: "P0001" },
    { name: "Kelly Stevens", lastVisit: "Mar 2024", id: "P0002" },
    { name: "Samuel Anderson", lastVisit: "Mar 2024", id: "P0003" },
    { name: "Catherine Griffin", lastVisit: "Mar 2024", id: "P0004" },
    { name: "Robert Hutchinson", lastVisit: "Feb 2024", id: "P0005" },
  ];

  const recentInvoices = [
    { patient: "Adrian", amount: "$450", date: "11 Nov 2024", status: "paid" },
    {
      patient: "Kelly",
      amount: "$500",
      date: "10 Nov 2024",
      status: "pending",
    },
    { patient: "Samuel", amount: "$320", date: "09 Nov 2024", status: "paid" },
    {
      patient: "Catherine",
      amount: "$245",
      date: "01 Nov 2024",
      status: "overdue",
    },
    { patient: "Robert", amount: "$380", date: "28 Oct 2024", status: "paid" },
  ];

  const notifications = [
    {
      type: "success",
      title: "Booking Confirmed",
      message: "on 21 Mar 2024 10:30 AM",
      time: "1 min ago",
    },
    {
      type: "info",
      title: "You have a New Review",
      message: "for your Appointment",
      time: "2 Days ago",
    },
    {
      type: "warning",
      title: "You have Appointment",
      message: "with Ahmed by 01:20 PM",
      time: "12:56 PM",
    },
    {
      type: "error",
      title: "You have missed $200",
      message: "for an Appointment by 01:20 PM",
      time: "2 Days ago",
    },
  ];

  const clinics = [
    {
      name: "Sofia Clinic",
      price: "$900",
      hours: "07:00 AM - 09:00 PM",
      days: "Tue: 07:00 AM - 09:00 PM, Wed: 07:00 AM - 09:00 PM",
    },
    {
      name: "The Family Dentistry Clinic",
      price: "$600",
      hours: "07:00 AM - 09:00 PM",
      days: "Sat: 07:00 AM - 09:00 PM, Tue: 07:00 AM - 09:00 PM",
    },
  ];

  const menuItemsData = [
    {
      key: "dashboard",
      icon: <DashboardOutlined />,
      label: "Dashboard",
      path: "/doctor/dashboard",
    },
    {
      key: "appointments",
      icon: <CalendarOutlined />,
      label: "Appointments",
      path: "/doctor/appointment",
    },
    {
      key: "patients",
      icon: <TeamOutlined />,
      label: "My Patients",
      path: "/doctor/patients",
    },
    {
      key: "reviews",
      icon: <UserOutlined />,
      label: "Walkin Patients",
      path: "/doctor/walkin",
    },
    {
      key: "services",
      icon: <SettingOutlined />,
      label: "Staff Management",
      path: "/doctor/staffManagement",
    },
    {
      key: "availability",
      icon: <DashboardOutlined />,
      label: "Availability",
      path: "/doctor/Availability",
    },
    {
      key: "accounts",
      icon: <FileTextOutlined />,
      label: "Accounts",
      path: "/doctor/accounts",
    },
    {
      key: "invoices",
      icon: <FileTextOutlined />,
      label: "Invoices",
      path: "/doctor/invoices",
    },
    {
      key: "messages",
      icon: <MailOutlined />,
      label: "Messages",
      path: "/doctor/messages",
    },
    { key: "logout", icon: <UserOutlined />, label: "Logout", path: "/logout" },
  ];

  const menuItems = menuItemsData.map((item) => ({
    key: item.key,
    icon: item.icon,
    label: item.label,
    onClick: () => navigate(item.path),
  }));

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "green";
      case "pending":
        return "orange";
      case "completed":
        return "blue";
      default:
        return "default";
    }
  };

  const getInvoiceStatusColor = (status) => {
    switch (status) {
      case "paid":
        return "green";
      case "pending":
        return "orange";
      case "overdue":
        return "red";
      default:
        return "default";
    }
  };

  const getDashboardData = async () => {
    try {
      const response = await apiGet("/doctorDashboard/dashboard");
      setDashboardData(response.data);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    }
  };

  useEffect(() => {
    getDashboardData();
  }, []);

  const paginatedAppointments = appointments.slice(
    (appointmentsPage - 1) * pageSize,
    appointmentsPage * pageSize
  );
  const paginatedPatients = recentPatients.slice(
    (patientsPage - 1) * pageSize,
    patientsPage * pageSize
  );
  const paginatedInvoices = recentInvoices.slice(
    (invoicesPage - 1) * pageSize,
    invoicesPage * pageSize
  );
  const paginatedNotifications = notifications.slice(
    (notificationsPage - 1) * pageSize,
    notificationsPage * pageSize
  );

  return (
    <Content style={{ margin: "2px", background: "#f0f2f5" }}>
      <Row gutter={[16, 16]} justify="space-between">
        {[
          {
            title: "Today Appointments",
            value: dashboardData.appointmentCounts.today,
            color: "#1890ff",
          },
          {
            title: "Upcoming Appointments",
            value: dashboardData.appointmentCounts.upcoming,
            color: "#fa8c16",
          },
          {
            title: "Completed Appointments",
            value: dashboardData.appointmentCounts.completed,
            color: "#52c41a",
          },
          {
            title: "Rescheduled Appointments",
            value: dashboardData.appointmentCounts.rescheduled,
            color: "#faad14",
          },
          {
            title: "Cancelled Appointments",
            value: dashboardData.appointmentCounts.cancelled,
            color: "#f5222d",
          },
        ].map((item) => (
          <Col xs={24} sm={12} md={8} lg={4} key={item.title}>
            <Card hoverable>
              <Statistic
                title={item.title}
                value={item.value}
                valueStyle={{ color: item.color }}
                prefix={<CalendarOutlined />}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Row
        gutter={[16, 16]}
        style={{ marginTop: "16px" }}
        justify="space-between"
      >
        {[
          {
            title: "Today Revenue",
            value: dashboardData.totalAmount.today,
            color: "#1890ff",
          },
          {
            title: "This Week",
            value: dashboardData.totalAmount.week,
            color: "#52c41a",
          },
          {
            title: "This Month",
            value: dashboardData.totalAmount.month,
            color: "#fa8c16",
          },
          {
            title: "Total Revenue",
            value: dashboardData.totalAmount.total,
            color: "#13c2c2",
          },
        ].map((item) => (
          <Col xs={24} sm={12} md={6} key={item.title}>
            <Card hoverable>
              <Statistic
                title={item.title}
                value={item.value}
                valueStyle={{ color: item.color }}
                prefix="₹"
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Row
        gutter={[16, 16]}
        style={{ marginTop: "16px" }}
        justify="space-between"
      >
        {[
          {
            title: "Total Patients",
            value: dashboardData.uniquePatients.total,
            color: "#13c2c2",
            icon: <UserOutlined />,
          },
          {
            title: "This Week",
            value: dashboardData.uniquePatients.week,
            color: "#52c41a",
            icon: <UserOutlined />,
          },
          {
            title: "This Month",
            value: dashboardData.uniquePatients.month,
            color: "#fa8c16",
            icon: <UserOutlined />,
          },
        ].map((item) => (
          <Col xs={24} sm={12} md={8} key={item.title}>
            <Card hoverable>
              <Statistic
                title={item.title}
                value={item.value}
                valueStyle={{ color: item.color }}
                prefix={item.icon}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Row
        gutter={[16, 16]}
        style={{ marginTop: "16px" }}
        justify="space-between"
      >
        {[
          {
            title: "In-Person",
            value: dashboardData.appointmentTypes["In-Person"],
            color: "#1890ff",
            icon: <UserOutlined />,
          },
          {
            title: "Video",
            value: dashboardData.appointmentTypes.Video,
            color: "#52c41a",
            icon: <VideoCameraOutlined />,
          },
          {
            title: "Home Visit",
            value: dashboardData.appointmentTypes["home-visit"],
            color: "#fa8c16",
            icon: <TeamOutlined />,
          },
        ].map((item,index) => (
          <Col xs={24} sm={12} md={8} key={index}>
            <Card hoverable>
              <Statistic
                title={item.title}
                value={item.value}
                valueStyle={{ color: item.color }}
                prefix={item.icon}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: "16px" }}>
        <Col span={24}>
          <Card
            title="Weekly Overview"
            extra={<Text>Mar 15 - Mar 21</Text>}
            style={{ padding: "16px" }}
            hoverable
          >
            <div style={{ position: "relative", height: "250px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                  height: "200px",
                  padding: "16px",
                  background: "#f5f7fa",
                  borderRadius: "8px",
                }}
              >
                {[
                  { day: "M", appointments: 60, patients: 40 },
                  { day: "T", appointments: 50, patients: 30 },
                  { day: "W", appointments: 80, patients: 60 },
                  { day: "T", appointments: 30, patients: 20 },
                  { day: "F", appointments: 70, patients: 50 },
                  { day: "S", appointments: 20, patients: 15 },
                  { day: "S", appointments: 50, patients: 35 },
                ].map((item, index) => (
                  <div key={index} style={{ textAlign: "center", flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "flex-end",
                        height: "100%",
                        gap: "4px",
                      }}
                    >
                      <div
                        style={{
                          width: "20px",
                          height: `${item.appointments}px`,
                          background: "#1890ff",
                          borderRadius: "4px 4px 0 0",
                          transition: "height 0.3s ease",
                        }}
                        title={`Appointments: ${item.appointments}`}
                      ></div>
                      <div
                        style={{
                          width: "20px",
                          height: `${item.patients}px`,
                          background: "#faad14",
                          borderRadius: "4px 4px 0 0",
                          transition: "height 0.3s ease",
                        }}
                        title={`Patients: ${item.patients}`}
                      ></div>
                    </div>
                    <Text style={{ marginTop: "8px", fontSize: "12px" }}>
                      {item.day}
                    </Text>
                  </div>
                ))}
              </div>
              <div
                style={{
                  position: "absolute",
                  bottom: "40px",
                  left: "16px",
                  right: "16px",
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "10px",
                  color: "#888",
                }}
              >
                {["0", "20", "40", "60", "80", "100"].map((label) => (
                  <Text key={label}>{label}</Text>
                ))}
              </div>
              <div
                style={{
                  position: "absolute",
                  top: "16px",
                  left: "-40px",
                  transform: "rotate(-90deg)",
                  fontSize: "12px",
                  color: "#888",
                }}
              >
                Count
              </div>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "24px",
                marginTop: "16px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center" }}>
                <div
                  style={{
                    width: "12px",
                    height: "12px",
                    background: "#1890ff",
                    marginRight: "8px",
                    borderRadius: "2px",
                  }}
                ></div>
                <Text>Appointments</Text>
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                <div
                  style={{
                    width: "12px",
                    height: "12px",
                    background: "#faad14",
                    marginRight: "8px",
                    borderRadius: "2px",
                  }}
                ></div>
                <Text>Patients</Text>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: "16px" }}>
        <Col span={24}>
          <Card title="Revenue Trend" hoverable>
            <div
              style={{
                width: "100%",
                height: 300,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                width="100%"
                height="260"
                viewBox="0 0 700 260"
                style={{
                  background: "#fff",
                  borderRadius: 12,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                }}
              >
                {[0, 100, 200, 300, 400, 500].map((y, i) => (
                  <g key={i}>
                    <line
                      x1={60}
                      y1={220 - (y / 500) * 180}
                      x2={660}
                      y2={220 - (y / 500) * 180}
                      stroke="#f0f0f0"
                      strokeDasharray="4"
                    />
                    <text
                      x={40}
                      y={225 - (y / 500) * 180}
                      fontSize="12"
                      fill="#bfbfbf"
                      textAnchor="end"
                    >
                      {y}
                    </text>
                  </g>
                ))}
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                  (d, i) => (
                    <text
                      key={d}
                      x={80 + i * 90}
                      y={240}
                      fontSize="13"
                      fill="#888"
                      textAnchor="middle"
                      fontWeight={500}
                    >
                      {d}
                    </text>
                  )
                )}
                <path
                  d="
                        M80,200
                        C110,170 170,140 170,140
                        S260,80 260,80
                        S350,120 350,120
                        S440,160 440,160
                        S530,110 530,110
                        S620,60 620,60
                      "
                  fill="none"
                  stroke="#1890ff"
                  strokeWidth="4"
                  style={{ filter: "drop-shadow(0 2px 6px #1890ff33)" }}
                />
                <path
                  d="
                        M80,200
                        C110,170 170,140 170,140
                        S260,80 260,80
                        S350,120 350,120
                        S440,160 440,160
                        S530,110 530,110
                        S620,60 620,60
                        L620,220 L80,220 Z
                      "
                  fill="#1890ff22"
                  stroke="none"
                />
                {[
                  { x: 80, y: 200, value: 100 },
                  { x: 170, y: 140, value: 260 },
                  { x: 260, y: 80, value: 400 },
                  { x: 350, y: 120, value: 320 },
                  { x: 440, y: 160, value: 220 },
                  { x: 530, y: 110, value: 350 },
                  { x: 620, y: 60, value: 500 },
                ].map((pt, i) => (
                  <g key={i}>
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={7}
                      fill="#fff"
                      stroke="#1890ff"
                      strokeWidth={3}
                    />
                    <circle cx={pt.x} cy={pt.y} r={3} fill="#1890ff" />
                    <text
                      x={pt.x}
                      y={pt.y - 15}
                      fontSize="13"
                      fill="#1890ff"
                      textAnchor="middle"
                      fontWeight={600}
                    >
                      ₹{pt.value}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: 8,
              }}
            >
              <span style={{ color: "#888", fontSize: 12 }}>
                Data is for illustration only
              </span>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: "16px" }}>
        <Col xs={24} md={12}>
          <Card
            title="Appointments"
            extra={<Button type="link">View All</Button>}
            hoverable
          >
            <List
              itemLayout="horizontal"
              dataSource={paginatedAppointments}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Button type="text" icon={<PhoneOutlined />} />,
                    <Button type="text" icon={<VideoCameraOutlined />} />,
                    <Button type="text" icon={<MoreOutlined />} />,
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Avatar>{item.avatar}</Avatar>}
                    title={
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Text strong>{item.name}</Text>
                        <Tag color={getStatusColor(item.status)}>
                          {item.status}
                        </Tag>
                      </div>
                    }
                    description={
                      <div>
                        <Text type="secondary">{item.time}</Text>
                        <br />
                        <Text>{item.type}</Text>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
            <Pagination
              current={appointmentsPage}
              pageSize={pageSize}
              total={appointments.length}
              onChange={(page) => setAppointmentsPage(page)}
              style={{ marginTop: "16px", textAlign: "right" }}
            />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card
            title="Recent Patients"
            extra={<Button type="link">View All</Button>}
            hoverable
          >
            <List
              size="small"
              dataSource={paginatedPatients}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar style={{ background: "#87d068" }}>
                        {item.name.charAt(0)}
                      </Avatar>
                    }
                    title={item.name}
                    description={`Patient ID: ${item.id} | Last Appointment: ${item.lastVisit}`}
                  />
                </List.Item>
              )}
            />
            <Pagination
              current={patientsPage}
              pageSize={pageSize}
              total={recentPatients.length}
              onChange={(page) => setPatientsPage(page)}
              style={{ marginTop: "16px", textAlign: "right" }}
            />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card
            title="Recent Invoices"
            extra={<Button type="link">View All</Button>}
            hoverable
          >
            <List
              size="small"
              dataSource={paginatedInvoices}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    title={item.patient}
                    description={`${item.amount} • ${item.date}`}
                  />
                  <Tag color={getInvoiceStatusColor(item.status)}>
                    {item.status}
                  </Tag>
                </List.Item>
              )}
            />
            <Pagination
              current={invoicesPage}
              pageSize={pageSize}
              total={recentInvoices.length}
              onChange={(page) => setInvoicesPage(page)}
              style={{ marginTop: "16px", textAlign: "right" }}
            />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card
            title="Notifications"
            extra={<Button type="link">View All</Button>}
            hoverable
          >
            <List
              size="small"
              dataSource={paginatedNotifications}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        style={{
                          backgroundColor:
                            item.type === "success"
                              ? "#52c41a"
                              : item.type === "info"
                              ? "#1890ff"
                              : item.type === "warning"
                              ? "#faad14"
                              : "#f5222d",
                        }}
                      >
                        {item.title.charAt(0)}
                      </Avatar>
                    }
                    title={item.title}
                    description={`${item.message} • ${item.time}`}
                  />
                </List.Item>
              )}
            />
            <Pagination
              current={notificationsPage}
              pageSize={pageSize}
              total={notifications.length}
              onChange={(page) => setNotificationsPage(page)}
              style={{ marginTop: "16px", textAlign: "right" }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: "16px" }}>
        <Col span={24}>
          <Card title="Clinics & Availability" hoverable>
            <Row gutter={[16, 16]}>
              {clinics.map((clinic, index) => (
                <Col xs={24} md={12} key={index}>
                  <Card size="small" style={{ marginBottom: "10px" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <Text strong>{clinic.name}</Text>
                        <br />
                        <Text type="secondary">{clinic.hours}</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: "12px" }}>
                          {clinic.days}
                        </Text>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <Text
                          strong
                          style={{ fontSize: "18px", color: "#1890ff" }}
                        >
                          {clinic.price}
                        </Text>
                        <br />
                        <Button size="small" style={{ marginTop: "5px" }}>
                          Change
                        </Button>
                      </div>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
      </Row>
    </Content>
  );
};

export default DoctorDashboard;
