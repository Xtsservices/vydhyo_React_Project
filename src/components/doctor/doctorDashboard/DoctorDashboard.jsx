import React, { useEffect, useState } from "react";
import { Card, Typography, Row, Col, Button, Badge } from "antd";
import {
  CalendarOutlined,
  UserOutlined,
  BarChartOutlined,
  SunOutlined,
  DownOutlined,
  LeftOutlined,
  RightOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const DoctorDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    success: true,
    totalAmount: { today: 25000, week: 0, month: 0, total: 0 },
    appointmentCounts: {
      today: 12,
      upcoming: 0,
      completed: 0,
      rescheduled: 0,
      cancelled: 0,
      active: 0,
      total: 0,
    },
  });

  // Clinic data for navigation
  const clinics = [
    { name: "Main Clinic", date: "02-06-2025", location: "Manikonda" },
    { name: "Branch Clinic", date: "03-06-2025", location: "Hitech City" },
    { name: "City Clinic", date: "04-06-2025", location: "Banjara Hills" },
    { name: "Metro Clinic", date: "05-06-2025", location: "Jubilee Hills" },
  ];

  const [currentClinicIndex, setCurrentClinicIndex] = useState(0);

  const handlePreviousClinic = () => {
    setCurrentClinicIndex((prev) =>
      prev === 0 ? clinics.length - 1 : prev - 1
    );
  };

  const handleNextClinic = () => {
    setCurrentClinicIndex((prev) =>
      prev === clinics.length - 1 ? 0 : prev + 1
    );
  };

  const appointments = [
    {
      id: 1,
      name: "Priya Sharma",
      time: "09:00 AM",
      status: "Active",
      statusColor: "#52c41a",
    },
    {
      id: 2,
      name: "Amit Patel",
      time: "10:30 AM",
      status: "Completed",
      statusColor: "#1890ff",
    },
    {
      id: 3,
      name: "Sunita Gupta",
      time: "11:15 AM",
      status: "Rescheduled",
      statusColor: "#faad14",
    },
    {
      id: 4,
      name: "Ravi Kumar",
      time: "02:00 PM",
      status: "Cancelled",
      statusColor: "#ff4d4f",
    },
    {
      id: 5,
      name: "Meera Singh",
      time: "03:30 PM",
      status: "Active",
      statusColor: "#52c41a",
    },
  ];

  // Calculate appointment status counts for pie chart
  const statusCounts = appointments.reduce((acc, apt) => {
    acc[apt.status] = (acc[apt.status] || 0) + 1;
    return acc;
  }, {});

  const pieData = [
    { label: "Active", count: statusCounts.Active || 0, color: "#52c41a" },
    {
      label: "Completed",
      count: statusCounts.Completed || 0,
      color: "#1890ff",
    },
    {
      label: "Rescheduled",
      count: statusCounts.Rescheduled || 0,
      color: "#faad14",
    },
    {
      label: "Cancelled",
      count: statusCounts.Cancelled || 0,
      color: "#ff4d4f",
    },
  ];

  const total = pieData.reduce((sum, item) => sum + item.count, 0);
  let currentAngle = 0;

  const PieChart = () => {
    const radius = 80;
    const centerX = 100;
    const centerY = 100;

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <svg width="200" height="200" style={{ marginBottom: "20px" }}>
          <circle
            cx={centerX}
            cy={centerY}
            r={radius}
            fill="none"
            stroke="#f0f0f0"
            strokeWidth="2"
          />
          {pieData.map((item, index) => {
            if (item.count === 0) return null;

            const percentage = item.count / total;
            const angle = percentage * 360;
            const startAngle = currentAngle;
            const endAngle = currentAngle + angle;

            const x1 =
              centerX + radius * Math.cos(((startAngle - 90) * Math.PI) / 180);
            const y1 =
              centerY + radius * Math.sin(((startAngle - 90) * Math.PI) / 180);
            const x2 =
              centerX + radius * Math.cos(((endAngle - 90) * Math.PI) / 180);
            const y2 =
              centerY + radius * Math.sin(((endAngle - 90) * Math.PI) / 180);

            const largeArcFlag = angle > 180 ? 1 : 0;

            const pathData = [
              `M ${centerX} ${centerY}`,
              `L ${x1} ${y1}`,
              `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
              "Z",
            ].join(" ");

            currentAngle += angle;

            return (
              <path
                key={index}
                d={pathData}
                fill={item.color}
                stroke="#fff"
                strokeWidth="2"
              />
            );
          })}
          <circle cx={centerX} cy={centerY} r={30} fill="white" />
        </svg>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {pieData.map((item, index) => (
            <div
              key={index}
              style={{ display: "flex", alignItems: "center", gap: "8px" }}
            >
              <div
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  backgroundColor: item.color,
                }}
              />
              <Text style={{ fontSize: "14px", color: "#666" }}>
                {item.label}
              </Text>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Common card style for uniform appearance
  const commonCardStyle = {
    borderRadius: "0px",
    border: "none",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    backgroundColor: "#fff",
    height: "150px", // Fixed height for all cards
  };

  return (
    <div
      style={{
        padding: "24px",
        backgroundColor: "#f5f5f5",
        minHeight: "100vh",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "32px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <SunOutlined style={{ fontSize: "24px", color: "#faad14" }} />
          <Title
            level={3}
            style={{ margin: 0, fontWeight: 500, color: "#262626" }}
          >
            Good Morning, Dr. Rajesh Kumar
          </Title>
        </div>
        <Button
          type="primary"
          style={{
            backgroundColor: "#f5f7fa",
            borderColor: "#f5f7fa",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            boxShadow: "none",
            color: "#262626",
            fontWeight: 500,
            fontSize: "16px",
          }}
          icon={
            <span style={{ display: "flex", alignItems: "center" }}>
              <UserOutlined style={{ color: "#1890ff", fontSize: 20 }} />
              <span
                style={{
                  display: "inline-block",
                  background: "#1890ff",
                  color: "#fff",
                  borderRadius: "50%",
                  width: 16,
                  height: 16,
                  fontSize: 12,
                  lineHeight: "16px",
                  textAlign: "center",
                  marginLeft: -8,
                  marginRight: 4,
                  fontWeight: 700,
                }}
              >
                +
              </span>
            </span>
          }
        >
          Walk-ins
        </Button>
      </div>

      {/* Top Stats Cards */}
      <Row gutter={[24, 24]} style={{ marginBottom: "32px" }}>
        <Col xs={24} sm={8}>
          <Card style={commonCardStyle}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                height: "100%",
              }}
            >
              <div>
                <Text
                  style={{
                    fontSize: "14px",
                    color: "#8c8c8c",
                    display: "block",
                  }}
                >
                  Today's Appointments
                </Text>
                <Title
                  level={2}
                  style={{ margin: 0, fontWeight: 600, color: "#262626" }}
                >
                  {dashboardData.appointmentCounts.today}
                </Title>
              </div>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  backgroundColor: "#e6f7ff",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CalendarOutlined
                  style={{ fontSize: "24px", color: "#1890ff" }}
                />
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={8}>
          <Card style={commonCardStyle}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                height: "100%",
              }}
            >
              <div>
                <Text
                  style={{
                    fontSize: "14px",
                    color: "#8c8c8c",
                    display: "block",
                  }}
                >
                  Today's Revenue
                </Text>
                <Title
                  level={2}
                  style={{ margin: 0, fontWeight: 600, color: "#262626" }}
                >
                  ₹{dashboardData.totalAmount.today.toLocaleString()}
                </Title>
              </div>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  backgroundColor: "#f6ffed",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span
                  style={{
                    fontSize: "22px",
                    color: "#52c41a",
                    fontWeight: 700,
                    fontFamily: "monospace",
                  }}
                >
                  Rp
                </span>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={8}>
          <Card style={commonCardStyle}>
            <div
              style={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Header section */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                }}
              >
                <div>
                  <Text
                    style={{
                      fontSize: "14px",
                      color: "#8c8c8c",
                      display: "block",
                      marginTop: "-30px",
                    }}
                  >
                    Clinic Status
                  </Text>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <Title
                      level={4}
                      style={{
                        margin: 0,
                        fontWeight: 600,
                        color: "#52c41a",
                        fontSize: 20,
                      }}
                    >
                      Available
                    </Title>
                    <DownOutlined
                      style={{ fontSize: "12px", color: "#52c41a" }}
                    />
                  </div>
                </div>
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    backgroundColor: "#f6ffed",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <rect
                      x="3"
                      y="7"
                      width="5"
                      height="10"
                      rx="1.5"
                      fill="#52c41a"
                    />
                    <rect
                      x="10"
                      y="3"
                      width="4"
                      height="14"
                      rx="1.5"
                      fill="#52c41a"
                      fillOpacity="0.6"
                    />
                    <rect
                      x="16"
                      y="10"
                      width="5"
                      height="7"
                      rx="1.5"
                      fill="#52c41a"
                      fillOpacity="0.3"
                    />
                  </svg>
                </div>
              </div>

              {/* Next availability section */}
              <div style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: "12px",
                    color: "#8c8c8c",
                    display: "block",
                    marginTop: "-8px",
                    marginBottom: "-18px",
                  }}
                >
                  Next availability
                </Text>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    width: "100%",
                    padding: "6px 0px",
                    backgroundColor: "#fafafa",
                    borderRadius: "0px",
                    border: "1px solid transparent",
                  }}
                >
                  <LeftOutlined
                    style={{
                      fontSize: "12px",
                      color: "#bfbfbf",
                      cursor: "pointer",
                      padding: "2px",
                      transition: "color 0.2s",
                      flexShrink: 0,
                      marginRight: "auto",
                    }}
                    onMouseEnter={(e) => (e.target.style.color = "#1890ff")}
                    onMouseLeave={(e) => (e.target.style.color = "#bfbfbf")}
                    onClick={handlePreviousClinic}
                  />
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      gap: "2px",
                      textAlign: "center",
                      minWidth: "50px",
                      height: "48px",
                      overflow: "hidden",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: "11px",
                        color: "#262626",
                        fontWeight: 600,
                        margin: 0,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        width: "100%",
                      }}
                    >
                      {clinics[currentClinicIndex].name}
                    </Text>
                    <Text
                      style={{
                        fontSize: "10px",
                        color: "#8c8c8c",
                        margin: 0,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {clinics[currentClinicIndex].date}
                    </Text>
                    <Text
                      style={{
                        fontSize: "10px",
                        color: "#1890ff",
                        fontWeight: 500,
                        margin: 0,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        width: "100%",
                      }}
                    >
                      {clinics[currentClinicIndex].location}
                    </Text>
                  </div>
                  <RightOutlined
                    style={{
                      fontSize: "12px",
                      color: "#bfbfbf",
                      cursor: "pointer",
                      padding: "2px",
                      transition: "color 0.2s",
                      flexShrink: 0,
                      marginLeft: "auto",
                    }}
                    onMouseEnter={(e) => (e.target.style.color = "#1890ff")}
                    onMouseLeave={(e) => (e.target.style.color = "#bfbfbf")}
                    onClick={handleNextClinic}
                  />
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Main Content */}
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={14}>
          <Card
            style={{
              borderRadius: "0px",
              border: "none",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "24px",
              }}
            >
              <Title level={4} style={{ margin: 0, fontWeight: 600 }}>
                Patient Appointments
              </Title>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "8px 16px",
                  backgroundColor: "#f5f5f5",
                  borderRadius: "0px",
                  border: "1px solid #d9d9d9",
                }}
              >
                <CalendarOutlined style={{ color: "#8c8c8c" }} />
                <Text style={{ color: "#262626" }}>02-07-2025</Text>
              </div>
            </div>

            {/* Table Header */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr 1fr",
                padding: "12px 0",
                borderBottom: "1px solid #f0f0f0",
                marginBottom: "16px",
              }}
            >
              <Text style={{ fontWeight: 500, color: "#8c8c8c" }}>
                Patient Name
              </Text>
              <Text style={{ fontWeight: 500, color: "#8c8c8c" }}>Time</Text>
              <Text style={{ fontWeight: 500, color: "#8c8c8c" }}>Status</Text>
            </div>

            {/* Appointments List */}
            {appointments.map((appointment, index) => (
              <div
                key={appointment.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1fr 1fr",
                  padding: "16px 0",
                  borderBottom:
                    index < appointments.length - 1
                      ? "1px solid #f5f5f5"
                      : "none",
                  alignItems: "center",
                }}
              >
                <Text style={{ fontWeight: 500, color: "#262626" }}>
                  {appointment.name}
                </Text>
                <Text style={{ color: "#8c8c8c" }}>{appointment.time}</Text>
                <Badge
                  color={appointment.statusColor}
                  text={appointment.status}
                  style={{
                    fontSize: "13px",
                    color: appointment.statusColor,
                    fontWeight: 500,
                  }}
                />
              </div>
            ))}
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card
            style={{
              borderRadius: "0px",
              border: "none",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}
          >
            <Title
              level={4}
              style={{ margin: 0, marginBottom: "24px", fontWeight: 600 }}
            >
              Appointment Status
            </Title>
            <PieChart />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DoctorDashboard;
