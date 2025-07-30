import React from "react";
import { useEffect, useState } from "react";
import { Card, Row, Col, Avatar, Typography } from "antd";
import {
  UserOutlined,
  TeamOutlined,
  MedicineBoxOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
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
} from "recharts";
import { apiGet } from "../../api";
const { Title, Text } = Typography;

// Define initial state for apiData
const initialApiData = {
  today: 0,
  month: 0,
  total: 0,
};

// Mock data with fallback values
const revenueSnapshotData = (apiData) => [
  {
    title: "Today",
    value: `₹${(apiData.today || 0).toLocaleString()}`,
    bgColor: "#F1C1151A",
  },
  {
    title: "This Month",
    value: `₹${(apiData.month || 0).toLocaleString()}`,
    bgColor: "#F0FDF4",
  },
  {
    title: "Total Revenue",
    value: `₹${(apiData.total || 0).toLocaleString()}`,
    isHighlight: true,
    bgColor: "#2E4861",
    color: "#FFFFFF",
  },
];

const revenueContributionData = [
  { title: "Appointments", value: "₹2,000", icon: "👤", bgColor: "#F0FDF4" },
  { title: "Pharmacy", value: "₹2,000", icon: "⚕️", bgColor: "#F1C1151A" },
  { title: "Labs", value: "₹2,000", icon: "🧪", bgColor: "#EFF6FF" },
  { title: "Ambulance", value: "₹2,000", icon: "🚑", bgColor: "#f0f9ff" },
  { title: "BloodBank", value: "₹2,000", icon: "🩺", bgColor: "#EFF6FF" },
  { title: "Home Care", value: "₹2,000", icon: "🏠", bgColor: "#EFF6FF" },
];

const approvalRequestsData = [
  {
    title: "Pending Approval",
    value: 23,
    color: "#fa8c16",
    bgColor: "#fff7e6",
    icon: <ClockCircleOutlined />,
  },
  {
    title: "Approved",
    value: 76,
    color: "#52c41a",
    bgColor: "#f6ffed",
    icon: <CheckCircleOutlined />,
  },
  {
    title: "Rejected",
    value: 12,
    color: "#ff4d4f",
    bgColor: "#fff2f0",
    icon: <CloseCircleOutlined />,
  },
];

const userMetricsData = [
  {
    title: "Total Downloads",
    value: "1,234",
    bgcolor: "#EFF6FF",
    icon: <TeamOutlined />,
    iconBg: "#1890ff",
  },
  {
    title: "Active User",
    value: 76,
    bgcolor: "#FAF5FF",
    icon: <UserOutlined />,
    iconBg: "#722ed1",
  },
  {
    title: "Repeated User",
    value: "5,690",
    bgcolor: "#EFF6FF",
    icon: <UserOutlined />,
    iconBg: "#1890ff",
  },
];

const consultationStatsData = [
  { title: "Walk-ins", value: 214, icon: "🚶", bgColor: "#f5f5f5" },
  { title: "Home Care", value: 47, icon: "🏠", bgColor: "#F0FDF4" },
  { title: "Ambulance", value: 156, icon: "🚑", bgColor: "#F1C1151A" },
  { title: "Diagnostic", value: 156, icon: "🧪", bgColor: "#F1C1151A" },
  { title: "Video Consults", value: 92, icon: "📹", bgColor: "#f0f9ff" },
  { title: "Pharmacy", value: 47, icon: "⚕️", bgColor: "#F0FDF4" },
];

const topDoctorsAppointments = [
  { name: "Dr. Kavita Rao", appointments: 58 },
  { name: "Dr. Arvind Sharma", appointments: 49 },
  { name: "Dr. Meena Joshi", appointments: 47 },
  { name: "Dr. Sandeep Yadav", appointments: 43 },
];

const revenueTrendsData = [
  { name: "Jan", revenue: 17 },
  { name: "Feb", revenue: 25 },
  { name: "Mar", revenue: 40 },
  { name: "Apr", revenue: 64 },
  { name: "May", revenue: 78 },
  { name: "Jun", revenue: 95 },
  { name: "Jul", revenue: 103 },
];

const appointmentDistributionData = [
  { name: "Dr. Kavita Rao", value: 17, color: "#3b82f6" },
  { name: "Dr. Arvind Sharma", value: 25, color: "#10b981" },
  { name: "Dr. Meena Joshi", value: 40, color: "#f59e0b" },
  { name: "Dr. Sandeep Yadav", value: 55, color: "#8b5cf6" },
  { name: "Dr. Neha Verma", value: 64, color: "#ec4899" },
  { name: "Others", value: 78, color: "#6b7280" },
];

const SuperAdminDashboard = () => {
  const [apiData, setApiData] = useState(initialApiData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await apiGet("finance/getTotalAmount");
        if (response.status == 200) {
          const data = response.data;
          setApiData(data);
        }
      } catch (error) {
        console.error("Error fetching revenue data:", error);
        setError("Failed to fetch revenue data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate total points for percentage
  const totalPoints = appointmentDistributionData.reduce(
    (sum, item) => sum + item.value,
    0
  );

  // Prepare pie chart data from consultationStatsData
  const consultationPieData = consultationStatsData.map((item, idx) => ({
    name: item.title,
    value: item.value,
    color: [
      "#FF6384",
      "#36A2EB",
      "#FFCE56",
      "#4BC0C0",
      "#9966FF",
      "#FF9F40",
      "#43E97B",
    ][idx % 7],
  }));
  const totalConsultation = consultationPieData.reduce(
    (sum, item) => sum + item.value,
    0
  );

  // Custom tooltip for the consultation pie chart
  const ConsultationPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const entry = payload[0].payload;
      return (
        <div
          style={{
            background: "#fff",
            border: "1px solid #d9d9d9",
            borderRadius: 6,
            padding: "8px 12px",
            fontSize: 13,
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          }}
        >
          <div style={{ fontWeight: 600, color: "#262626" }}>{entry.name}</div>
          <div style={{ color: "#1890ff", fontWeight: 600 }}>
            {entry.value} pts
          </div>
          <div style={{ color: "#8c8c8c", fontSize: 12 }}>
            {((entry.value / totalConsultation) * 100).toFixed(1)}%
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div
      style={{
        padding: "16px",
        backgroundColor: "#f5f5f5",
        minHeight: "100vh",
      }}
    >
      <Title
        level={4}
        style={{ marginBottom: "16px", color: "#262626", fontWeight: 600 }}
      >
        Super Admin Dashboard
      </Title>

      {/* Top Row: Revenue Snapshot + Revenue Contribution */}
      <Row gutter={[16, 16]} style={{ marginBottom: "16px" }}>
        {/* Revenue Snapshot - Left Side */}
        <Col xs={24} md={14}>
          <div
            style={{
              fontSize: "20px",
              fontWeight: 600,
              marginBottom: "46px",
              color: "#262626",
            }}
          >
            Revenue Snapshot
          </div>
          {loading && <div>Loading revenue data...</div>}
          {error && <div style={{ color: "red" }}>{error}</div>}

          <Row gutter={[8, 8]}>
            {revenueSnapshotData(apiData).map((item, index) => (
              <Col xs={24} sm={12} md={8} key={index}>
                <Card
                  style={{
                    textAlign: "center",
                    backgroundColor: item.bgColor,
                    borderRadius: "8px",
                    border: "1px solid #f0f0f0",
                    height: "150px",
                    marginLeft: "30px",
                    width: "100%",
                  }}
                  bodyStyle={{
                    padding: "12px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    height: "100%",
                  }}
                >
                  <div
                    style={{
                      fontSize: "15px",
                      color: item.color || "#8c8c8c",
                      marginBottom: "4px",
                    }}
                  >
                    {item.title}
                  </div>
                  <div
                    style={{
                      fontSize: "16px",
                      fontWeight: "bold",
                      color: item.color || "black",
                    }}
                  >
                    {item.value}
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </Col>

        {/* Revenue Contribution - Right Side */}
        <Col xs={24} md={10}>
  <div style={{ fontSize: "20px", fontWeight: 600, marginBottom: "26px", color: "#262626", marginLeft: "90px" }}>
    Revenue Contribution
  </div>
  
  {/* First 3 Items */}
  <div style={{ marginLeft: "90px", marginBottom: "16px", fontWeight: 500 }}>
    Top Categories
  </div>
  <Row gutter={[8, 8]} style={{ marginBottom: "24px" }}>
    {revenueContributionData.slice(0, 3).map((item, index) => (
      <Col xs={12} sm={6} md={6} key={`top-${index}`}>
        <Card
          style={{
            textAlign: "center",
            backgroundColor: item.bgColor,
            borderRadius: "8px",
            border: "1px solid #f0f0f0",
            height: "100px",
            width: "100%",
            marginLeft: "90px",
          }}
          bodyStyle={{
            padding: "8px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            height: "100%",
          }}
        >
          <div style={{ fontSize: "20px", marginBottom: "4px" }}>{item.icon}</div>
          <div style={{ fontSize: "12px", color: "#8c8c8c", marginBottom: "4px" }}>{item.title}</div>
          <div style={{ fontSize: "14px", fontWeight: "bold", color: "#262626" }}>{item.value}</div>
        </Card>
      </Col>
    ))}
  </Row>
  
  {/* Last 3 Items */}
  <div style={{ marginLeft: "90px", marginBottom: "16px", fontWeight: 500 }}>
    Other Categories
  </div>
  <Row gutter={[8, 8]}>
    {revenueContributionData.slice(-3).map((item, index) => (
      <Col xs={12} sm={6} md={6} key={`bottom-${index}`}>
        <Card
          style={{
            textAlign: "center",
            backgroundColor: item.bgColor,
            borderRadius: "8px",
            border: "1px solid #f0f0f0",
            height: "100px",
            width: "100%",
            marginLeft: "90px",
          }}
          bodyStyle={{
            padding: "8px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            height: "100%",
          }}
        >
          <div style={{ fontSize: "20px", marginBottom: "4px" }}>{item.icon}</div>
          <div style={{ fontSize: "12px", color: "#8c8c8c", marginBottom: "4px" }}>{item.title}</div>
          <div style={{ fontSize: "14px", fontWeight: "bold", color: "#262626" }}>{item.value}</div>
        </Card>
      </Col>
    ))}
  </Row>
</Col>
      </Row>

      {/* Second Row: Approval Requests, User Metrics, Consultation Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        {/* Approval Requests */}
        <Col xs={24} sm={12} md={8}>
          <Card
            title="Partners"
            style={{ borderRadius: "8px", minHeight: "380px" }}
            headStyle={{ fontSize: "16px", fontWeight: 600 }}
            bodyStyle={{ padding: "12px" }}
          >
            {approvalRequestsData.map((item, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px",
                  backgroundColor: item.bgColor,
                  borderRadius: "6px",
                  marginBottom:
                    index < approvalRequestsData.length - 1 ? "8px" : "0",
                  minHeight: "90px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center" }}>
                  <div
                    style={{
                      color: item.color,
                      marginRight: "8px",
                      fontSize: "16px",
                    }}
                  >
                    {item.icon}
                  </div>
                  <span style={{ fontSize: "14px", color: "#595959" }}>
                    {item.title}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: "20px",
                    fontWeight: "bold",
                    color: item.color,
                  }}
                >
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
            style={{ borderRadius: "8px", minHeight: "380px" }}
            headStyle={{ fontSize: "16px", fontWeight: 600 }}
            bodyStyle={{ padding: "12px" }}
          >
            {userMetricsData.map((item, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 20px",
                  borderRadius: "16px",
                  borderBottom:
                    index < userMetricsData.length - 1
                      ? "8px solid rgb(255, 253, 253)"
                      : "none",
                  minHeight: "100px",
                  backgroundColor: item.bgcolor,
                }}
              >
                <div style={{ display: "flex", alignItems: "center" }}>
                  <Avatar
                    size={32}
                    style={{ backgroundColor: item.iconBg, marginRight: "8px" }}
                    icon={item.icon}
                  />
                  <span style={{ fontSize: "14px", color: "#595959" }}>
                    {item.title}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: "18px",
                    fontWeight: "bold",
                    color: "#262626",
                  }}
                >
                  {item.value}
                </span>
              </div>
            ))}
          </Card>
        </Col>

        {/* Consultation Stats */}
        <Col xs={24} md={8}>
          <div
            style={{
              fontSize: "16px",
              fontWeight: 600,
              marginTop: 15,
              marginBottom: "20px",
              color: "#262626",
            }}
          >
            Consultation Stats
          </div>
          <Row gutter={[8, 8]} style={{ minHeight: "220px" }}>
            {consultationStatsData.map((item, index) => (
              <Col xs={12} sm={6} md={12} key={index}>
                <Card
                  style={{
                    textAlign: "center",
                    backgroundColor: item.bgColor,
                    borderRadius: "8px",
                    border: "1px solid #f0f0f0",
                    height: "100px",
                  }}
                  bodyStyle={{
                    padding: "8px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    height: "100%",
                  }}
                >
                  <div style={{ fontSize: "20px", marginBottom: "4px" }}>
                    {item.icon}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#8c8c8c",
                      marginBottom: "4px",
                    }}
                  >
                    {item.title}
                  </div>
                  <div
                    style={{
                      fontSize: "16px",
                      fontWeight: "bold",
                      color: "#262626",
                    }}
                  >
                    {item.value}
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="Revenue Trends" style={{ borderRadius: "8px" }}>
            <div style={{ width: "100%", height: "300px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={revenueTrendsData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#8c8c8c" }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#8c8c8c" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #d9d9d9",
                      borderRadius: "6px",
                      fontSize: "12px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
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
          <Card
            title="Consultation Stats Distribution"
            style={{ borderRadius: "8px", minHeight: "360px", padding: 0 }}
          >
            <div
              style={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "0px 0",
              }}
            >
              <PieChart width={220} height={180}>
                <Pie
                  data={consultationPieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={48}
                  paddingAngle={2}
                  labelLine={false}
                >
                  {consultationPieData.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<ConsultationPieTooltip />} />
              </PieChart>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: "0px 0 0 0",
                  width: "100%",
                }}
              >
                {consultationPieData.map((entry, idx) => (
                  <li
                    key={entry.name}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "0px 0",
                      borderBottom:
                        idx < consultationPieData.length - 1
                          ? "1px solid #f0f0f0"
                          : "none",
                      fontSize: 13,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <span
                        style={{
                          display: "inline-block",
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          background: entry.color,
                          marginRight: 8,
                        }}
                      />
                      <span style={{ color: "#262626" }}>{entry.name}</span>
                    </div>
                    <div style={{ fontWeight: 600, color: "#1890ff" }}>
                      {entry.value} pts
                      <span
                        style={{
                          color: "#8c8c8c",
                          fontWeight: 400,
                          fontSize: 12,
                          marginLeft: 6,
                        }}
                      >
                        ({((entry.value / totalConsultation) * 100).toFixed(1)}
                        %)
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SuperAdminDashboard;
