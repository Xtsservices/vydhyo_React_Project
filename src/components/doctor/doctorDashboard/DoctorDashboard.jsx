import React, { useEffect, useState } from "react";
import { Card, Typography, Row, Col, Button, Badge, Progress } from "antd";
import {
  UserOutlined,
  SunOutlined,
  DownOutlined,
  LeftOutlined,
  RightOutlined,
  StarFilled,
  ArrowUpOutlined,
  ArrowDownOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import moment from "moment";
import { apiGet } from "../../api";

const { Title, Text } = Typography;

// Clinic data for navigation
const clinics = [
  { name: "Apollo Clinic", date: "02-07-2025", location: "Gachibowli" },
  { name: "Main Clinic", date: "03-07-2025", location: "Manikonda" },
  { name: "Branch Clinic", date: "04-07-2025", location: "Hitech City" },
  { name: "City Clinic", date: "05-07-2025", location: "Banjara Hills" },
];

const feedbacks = [
  {
    name: "Sarah Wilson",
    rating: 5,
    comment: "Excellent consultation and very professional approach.",
    daysAgo: 2,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
  },
  {
    name: "Robert Brown",
    rating: 5,
    comment: "Great experience, very thorough examination.",
    daysAgo: 1,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Robert",
  },
];

// Revenue chart data
const revenueData = [
  { label: "OPD", value: 60, color: "#4285f4" },
  { label: "Lab", value: 25, color: "#34a853" },
  { label: "Pharmacy", value: 15, color: "#fbbc04" },
];

const PercentageChangeIndicator = ({ value, positiveColor = "#16A34A", negativeColor = "#EF4444" }) => {
  const isPositive = value >= 0;
  const color = isPositive ? positiveColor : negativeColor;
  const arrow = isPositive ? <ArrowUpOutlined style={{ color, fontSize: "12px" }} /> : <ArrowDownOutlined style={{ color, fontSize: "12px" }} />;
  const displayValue = Math.abs(value);

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "4px", marginTop: "6px" }}>
      {arrow}
      <Text style={{ color, fontSize: "12px", fontWeight: 600, fontFamily: "Poppins, sans-serif" }}>
        {displayValue}%
      </Text>
    </div>
  );
};

const PieChart = () => {
  const radius = 80;
  const centerX = 100;
  const centerY = 100;
  let currentAngle = 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ position: "relative", marginBottom: "24px" }}>
        <svg width="200" height="200">
          {revenueData.map((item, index) => {
            const percentage = item.value / 100;
            const angle = percentage * 360;
            const startAngle = currentAngle;
            const endAngle = currentAngle + angle;

            const x1 = centerX + radius * Math.cos(((startAngle - 90) * Math.PI) / 180);
            const y1 = centerY + radius * Math.sin(((startAngle - 90) * Math.PI) / 180);
            const x2 = centerX + radius * Math.cos(((endAngle - 90) * Math.PI) / 180);
            const y2 = centerY + radius * Math.sin(((endAngle - 90) * Math.PI) / 180);

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
                strokeWidth="3"
              />
            );
          })}
          <circle cx={centerX} cy={centerY} r={30} fill="white" />
        </svg>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "24px", justifyContent: "center" }}>
        {revenueData.map((item, index) => (
          <div key={index} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                backgroundColor: item.color,
              }}
            />
            <Text style={{ fontSize: "14px", color: "#666", fontWeight: 500, fontFamily: "Poppins, sans-serif" }}>
              {item.label}
            </Text>
          </div>
        ))}
      </div>
    </div>
  );
};

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.currentUserData);
  const [dashboardData, setDashboardData] = useState({
    success: true,
    totalAmount: { today: 0, week: 0, month: 0, total: 0 },
    appointmentCounts: {
      today: 0,
      newAppointments: 0,
      followUp: 0,
      upcoming: 0,
      completed: 0,
      rescheduled: 0,
      cancelled: 0,
      active: 0,
      total: 0,
    },
    percentageChanges: {
      today: 0,
      newAppointments: 0,
      followUp: 0,
    },
  });

  const [appointments, setAppointments] = useState([]);
  const [currentClinicIndex, setCurrentClinicIndex] = useState(0);

  // Helper function to format date for comparison
  const formatDateForComparison = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  // Status color mapping
  const getStatusColor = (status) => {
    const statusConfig = {
      scheduled: "#52c41a",
      completed: "#1890ff",
      rescheduled: "#fa8c16",
      canceled: "#ff4d4f",
    };
    return statusConfig[status] || "#d9d9d9";
  };

  const getTypeColor = (type) => {
    return type === "New-Walkin" || type === "home-visit" ? "#1E40AF" : "#16A34A";
  };

  // Helper function to get display text for appointment type
  const getAppointmentTypeDisplay = (type) => {
    switch (type) {
      case "New-Walkin":
        return "New";
      case "home-visit":
        return "New";
      case "follow-up":
        return "Follow-up";
      default:
        return type;
    }
  };

  const handlePreviousClinic = () => {
    setCurrentClinicIndex((prev) => (prev === 0 ? clinics.length - 1 : prev - 1));
  };

  const handleNextClinic = () => {
    setCurrentClinicIndex((prev) => (prev === clinics.length - 1 ? 0 : prev + 1));
  };

  // Fetch appointments from API
  const getAppointments = async () => {
    try {
      const formattedDate = moment().format("YYYY-MM-DD");
      const response = await apiGet(`/appointment/getAppointmentsByDoctorID/patients?date=${formattedDate}`);
      
      console.log("API Response:", response); // Debug log
      
      // Handle the corrected API response structure
      if (response.data.status === "success" && Array.isArray(response.data.data)) {
        const appointmentsList = response.data.data;
        localStorage.setItem("appointments", JSON.stringify(appointmentsList));
        setAppointments(appointmentsList);
        updatePatientAppointmentsData(appointmentsList, formattedDate);
      } else {
        console.warn("Unexpected API response structure:", response.data);
        setAppointments([]);
        updatePatientAppointmentsData([], formattedDate);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setAppointments([]);
      updatePatientAppointmentsData([], moment().format("YYYY-MM-DD"));
    }
  };

  const getTodayAppointmentCount = async () => {
    try {
      const response = await apiGet("/appointment/getTodayAppointmentCount");
      if (response.data.status === "success") {
        setDashboardData((prev) => ({
          ...prev,
          appointmentCounts: {
            ...prev.appointmentCounts,
            today: response.data.data.totalAppointments.today,
            newAppointments: response.data.data.newAppointments.today,
            followUp: response.data.data.followupAppointments.today,
          },
          percentageChanges: {
            today: response.data.data.totalAppointments.percentageChange,
            newAppointments: response.data.data.newAppointments.percentageChange,
            followUp: response.data.data.followupAppointments.percentageChange,
          },
        }));
      } else {
        console.error("API response status is not success:", response.data);
      }
    } catch (error) {
      console.error("Error fetching today's appointment count:", error);
    }
  };

  const getTodayRevenue = async () => {
    try {
      const response = await apiGet("/finance/getTodayRevenuebyDoctorId");
      if (response.data.status === "success") {
        setDashboardData((prev) => ({
          ...prev,
          totalAmount: {
            ...prev.totalAmount,
            today: response.data.data.todayRevenue,
            month: response.data.data.monthRevenue,
          },
        }));
      } else {
        console.error("API response status is not success:", response.data);
      }
    } catch (error) {
      console.error("Error fetching today's revenue:", error);
    }
  };

  const updatePatientAppointmentsData = (appointmentsList, date) => {
    const today = date || moment().format("YYYY-MM-DD");
    
    // Filter appointments for today
    const dateAppointments = appointmentsList.filter(
      (appt) => formatDateForComparison(appt.appointmentDate) === today
    );
    
    // Count different types of appointments
    const newAppointments = appointmentsList.filter(
      (appt) => appt.appointmentType === "New-Walkin" || appt.appointmentType === "home-visit"
    ).length;
    
    const followUpAppointments = appointmentsList.filter(
      (appt) => appt.appointmentType === "follow-up" || appt.isFollowUp === true
    ).length;

    // Count appointments by status
    const completedCount = appointmentsList.filter(
      (appt) => appt.appointmentStatus === "completed"
    ).length;
    
    const rescheduledCount = appointmentsList.filter(
      (appt) => appt.appointmentStatus === "rescheduled"
    ).length;
    
    const cancelledCount = appointmentsList.filter(
      (appt) => appt.appointmentStatus === "canceled"
    ).length;
    
    const scheduledCount = appointmentsList.filter(
      (appt) => appt.appointmentStatus === "scheduled"
    ).length;

    setDashboardData((prev) => ({
      ...prev,
      appointmentCounts: {
        ...prev.appointmentCounts,
        upcoming: scheduledCount,
        completed: completedCount,
        rescheduled: rescheduledCount,
        cancelled: cancelledCount,
        active: scheduledCount,
        total: appointmentsList.length,
      },
    }));
  };

  useEffect(() => {
    getAppointments();
    getTodayAppointmentCount();
    getTodayRevenue();
  }, []);

  const renderHeader = () => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
      <div>
        <Title level={2} style={{ margin: 0, fontWeight: 600, color: "#1a1a1a", fontSize: "28px", fontFamily: "Poppins, sans-serif" }}>
          Good Morning <span style={{ color: "#ff6b6b" }}>Dr. {user?.firstname || "Arvind"} {user?.lastname || "Sharma"}</span>
        </Title>
        <Text style={{ color: "#8c8c8c", fontSize: "14px", marginTop: "4px", display: "block", fontFamily: "Poppins, sans-serif" }}>
          Have a great day at work
        </Text>
      </div>
      <Button
        type="primary"
        onClick={() => navigate("/doctor/doctorPages/Walkin")}
        style={{
          color: "#374151",
          backgroundColor: "#EFF6FF",
          borderColor: "#EFF6FF",
          borderRadius: "15px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          fontWeight: 500,
          height: "42px",
          paddingLeft: "20px",
          paddingRight: "20px",
          fontSize: "14px",
          fontFamily: "Poppins, sans-serif",
        }}
        icon={<UserOutlined />}
      >
        + New Appointments
      </Button>
    </div>
  );

  const renderAppointmentsCard = () => (
    <Card
      style={{
        borderRadius: "16px",
        background: "linear-gradient(135deg, #20d0c4 0%, #16a8a0 100%)",
        border: "none",
        boxShadow: "0 8px 32px rgba(32, 208, 196, 0.3)",
        position: "relative",
        overflow: "hidden",
        height: "220px",
      }}
      bodyStyle={{ padding: "16px" }}
    >
      <div style={{ textAlign: "center", marginBottom: "12px" }}>
        <Title level={1} style={{ color: "white", margin: 0, fontSize: "48px", fontWeight: 700, lineHeight: "1", textShadow: "0 2px 4px rgba(0,0,0,0.1)", fontFamily: "Poppins, sans-serif" }}>
          {dashboardData.appointmentCounts.today}
        </Title>
        <Text style={{ color: "white", fontSize: "14px", fontWeight: 500, marginTop: "6px", display: "block", fontFamily: "Poppins, sans-serif" }}>
          Today's Appointments
        </Text>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
        <div style={{ backgroundColor: "#F0FDF4", borderRadius: "10px", padding: "12px", textAlign: "center", backdropFilter: "blur(10px)" }}>
          <Title level={2} style={{ color: "#16A34A", margin: 0, fontSize: "24px", fontWeight: 700, fontFamily: "Poppins, sans-serif" }}>
            {dashboardData.appointmentCounts.newAppointments}
          </Title>
          <Text style={{ color: "#16A34A", fontSize: "12px", fontWeight: 500, display: "block", marginTop: "4px", fontFamily: "Poppins, sans-serif" }}>
            New Appointments
          </Text>
          <PercentageChangeIndicator 
            value={dashboardData.percentageChanges.newAppointments} 
            positiveColor="#16A34A"
            negativeColor="#EF4444"
          />
        </div>

        <div style={{ backgroundColor: "#EFF6FF", borderRadius: "10px", padding: "12px", textAlign: "center", backdropFilter: "blur(10px)" }}>
          <Title level={2} style={{ color: "#2563EB", margin: 0, fontSize: "24px", fontWeight: 700, fontFamily: "Poppins, sans-serif" }}>
            {dashboardData.appointmentCounts.followUp}
          </Title>
          <Text style={{ color: "#2563EB", fontSize: "12px", fontWeight: 500, display: "block", marginTop: "4px", fontFamily: "Poppins, sans-serif" }}>
            Follow-ups
          </Text>
          <PercentageChangeIndicator 
            value={dashboardData.percentageChanges.followUp} 
            positiveColor="#2563EB"
            negativeColor="#EF4444"
          />
        </div>
      </div>
    </Card>
  );

  const renderRevenueCard = () => (
    <Card
      style={{
        borderRadius: "16px",
        border: "none",
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        background: "white",
        height: "220px",
      }}
      bodyStyle={{ padding: "16px" }}
    >
      <div style={{ marginBottom: "8px" }}>
        <Title level={4} style={{ margin: 0, fontWeight: 600, color: "#1a1a1a", fontSize: "16px", fontFamily: "Poppins, sans-serif" }}>
          Revenue
        </Title>
      </div>

      <div style={{ marginBottom: "12px", backgroundColor: "#FAF5FF", padding: "12px", borderRadius: "8px", position: "relative" }}>
        <Text style={{ fontSize: "12px", color: "#9333EA", display: "block", marginBottom: "4px", fontFamily: "Poppins, sans-serif" }}>
          Today's Revenue
        </Text>
        <div>
          <Title level={2} style={{ margin: 0, fontWeight: 700, color: "#9333EA", fontSize: "28px", fontFamily: "Poppins, sans-serif" }}>
            ₹{dashboardData.totalAmount.today.toLocaleString()}
          </Title>
        </div>
      </div>

      <div style={{ marginBottom: "12px", backgroundColor: "#FFF7ED", padding: "12px", borderRadius: "8px" }}>
        <Text style={{ fontSize: "12px", color: "#EA580C", display: "block", marginBottom: "4px", fontFamily: "Poppins, sans-serif" }}>
          This Month
        </Text>
        <Title level={3} style={{ margin: 0, fontWeight: 700, color: "#EA580C", fontSize: "20px", fontFamily: "Poppins, sans-serif" }}>
          ₹{dashboardData.totalAmount.month.toLocaleString()}
        </Title>
      </div>
    </Card>
  );

  const renderPatientAppointments = () => {
    // Filter appointments for today
    const todayFormatted = moment().format("YYYY-MM-DD");
    const filteredAppointments = appointments.filter(
      (appt) => formatDateForComparison(appt.appointmentDate) === todayFormatted
    );

    return (
      <Card
        style={{
          borderRadius: "16px",
          border: "none",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          background: "white",
          marginBottom: "24px",
          position: "relative"
        }}
        bodyStyle={{ padding: "24px" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <Title level={4} style={{ margin: 0, fontWeight: 600, color: "#1a1a1a", fontSize: "18px", fontFamily: "Poppins, sans-serif" }}>
            Patient Appointments
          </Title>
          <Text style={{ color: "#495057", fontSize: "14px", fontWeight: 500, fontFamily: "Poppins, sans-serif" }}>
            Today - {moment().format("DD-MM-YYYY")}
          </Text>
        </div>

        {/* Table Header */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", padding: "12px 0", borderBottom: "2px solid #f1f3f4", marginBottom: "16px" }}>
          <Text style={{ fontWeight: 600, color: "#6c757d", fontSize: "12px", textTransform: "uppercase", fontFamily: "Poppins, sans-serif" }}>
            Patient Name
          </Text>
          <Text style={{ fontWeight: 600, color: "#6c757d", fontSize: "12px", textTransform: "uppercase", fontFamily: "Poppins, sans-serif" }}>
            Time
          </Text>
          <Text style={{ fontWeight: 600, color: "#6c757d", fontSize: "12px", textTransform: "uppercase", fontFamily: "Poppins, sans-serif" }}>
            Type
          </Text>
          <Text style={{ fontWeight: 600, color: "#6c757d", fontSize: "12px", textTransform: "uppercase", fontFamily: "Poppins, sans-serif" }}>
            Status
          </Text>
        </div>

        {/* Appointments List */}
        {filteredAppointments.length > 0 ? (
          filteredAppointments.map((appointment, index) => (
            <div
              key={appointment.appointmentId || index}
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr 1fr 1fr",
                padding: "16px 0",
                borderBottom: index < filteredAppointments.length - 1 ? "1px solid #f8f9fa" : "none",
                alignItems: "center",
              }}
            >
              <Text style={{ fontWeight: 500, color: "#1a1a1a", fontSize: "14px", fontFamily: "Poppins, sans-serif" }}>
                {appointment.patientName || "Unknown Patient"}
              </Text>
              <Text style={{ color: "#6c757d", fontSize: "14px", fontFamily: "Poppins, sans-serif" }}>
                {appointment.appointmentTime || "N/A"}
              </Text>
              <div
                style={{
                  padding: "4px 12px",
                  backgroundColor: appointment.appointmentType === "New-Walkin" ? "#DBEAFE" : "#e8f5e8",
                  color: getTypeColor(appointment.appointmentType),
                  borderRadius: "16px",
                  fontSize: "12px",
                  fontWeight: 400,
                  textAlign: "center",
                  width: "fit-content",
                  fontFamily: "Poppins, sans-serif",
                }}
              >
                {getAppointmentTypeDisplay(appointment.appointmentType)}
              </div>
              <div
                style={{
                  padding: "4px 12px",
                  backgroundColor:
                    appointment.appointmentStatus === "scheduled"
                      ? "#e8f5e8"
                      : appointment.appointmentStatus === "completed"
                      ? "#e3f2fd"
                      : appointment.appointmentStatus === "rescheduled"
                      ? "#fff3e0"
                      : "#ffebee",
                  color: getStatusColor(appointment.appointmentStatus),
                  borderRadius: "16px",
                  fontSize: "12px",
                  fontWeight: 400,
                  textAlign: "center",
                  width: "fit-content",
                  fontFamily: "Poppins, sans-serif",
                }}
              >
                {appointment.appointmentStatus?.charAt(0).toUpperCase() + appointment.appointmentStatus?.slice(1) || "Unknown"}
              </div>
            </div>
          ))
        ) : (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#8c8c8c" }}>
            <Text style={{ fontFamily: "Poppins, sans-serif" }}>No appointments found for today</Text>
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <Button
            type="link"
            style={{
              color: "#4285f4",
              fontWeight: 500,
              fontSize: "14px",
              fontFamily: "Poppins, sans-serif",
            }}
          >
            View All
          </Button>
        </div>
      </Card>
    );
  };

  const renderPatientFeedback = () => (
    <Card
      style={{
        borderRadius: "16px",
        border: "none",
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        background: "white",
      }}
      bodyStyle={{ padding: "24px" }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <Title level={4} style={{ margin: 0, fontWeight: 600, color: "#1a1a1a", fontSize: "18px", fontFamily: "Poppins, sans-serif" }}>
          Patient Feedback
        </Title>
        <div style={{ display: "flex", gap: "8px" }}>
          <LeftOutlined style={{ fontSize: "16px", color: "#bfbfbf", cursor: "pointer" }} />
          <RightOutlined style={{ fontSize: "16px", color: "#bfbfbf", cursor: "pointer" }} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px" }}>
        {feedbacks.map((feedback, index) => (
          <div key={index}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
              <img
                src={feedback.avatar}
                alt={feedback.name}
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  backgroundColor: "#f3f4f6",
                }}
              />
              <div style={{ flex: 1 }}>
                <Text style={{ fontWeight: 600, color: "#1a1a1a", fontSize: "16px", display: "block", fontFamily: "Poppins, sans-serif" }}>
                  {feedback.name}
                </Text>
                <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "4px" }}>
                  {[...Array(feedback.rating)].map((_, i) => (
                    <StarFilled key={i} style={{ color: "#fbbf24", fontSize: "14px" }} />
                  ))}
                </div>
              </div>
            </div>
            <Text style={{ color: "#6c757d", fontSize: "14px", lineHeight: "1.5", display: "block", marginBottom: "8px", fontStyle: "italic", fontFamily: "Poppins, sans-serif" }}>
              "{feedback.comment}"
            </Text>
            <Text style={{ color: "#9ca3af", fontSize: "12px", fontFamily: "Poppins, sans-serif" }}>
              {feedback.daysAgo} days ago
            </Text>
          </div>
        ))}
      </div>
    </Card>
  );

  const renderClinicAvailability = () => (
    <Card
      style={{
        borderRadius: "16px",
        border: "none",
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        background: "white",
        marginBottom: "24px",
        position: "relative",
      }}
      bodyStyle={{ padding: "24px" }}
    >
      <div style={{ marginBottom: "20px" }}>
        <Title level={4} style={{ margin: 0, fontWeight: 600, color: "#1a1a1a", fontSize: "18px", marginBottom: "8px", fontFamily: "Poppins, sans-serif" }}>
          Clinic Availability
        </Title>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Title level={3} style={{ margin: 0, fontWeight: 600, color: "#495057", fontSize: "16px", marginBottom: "16px", fontFamily: "Poppins, sans-serif" }}>
            {clinics[currentClinicIndex].name}
          </Title>
          <Text style={{ fontSize: "12px", color: "#8c8c8c", fontFamily: "Poppins, sans-serif" }}>
            {clinics[currentClinicIndex].date}
          </Text>

          <Text style={{ fontSize: "12px", color: "#1890ff", fontWeight: 500, fontFamily: "Poppins, sans-serif" }}>
            {clinics[currentClinicIndex].location}
          </Text>
        </div>

        <Text style={{ fontSize: "14px", color: "#6c757d", display: "block", marginBottom: "12px", fontWeight: 500, fontFamily: "Poppins, sans-serif" }}>
          Available Slots:
        </Text>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "20px" }}>
          <div style={{ padding: "6px 12px", backgroundColor: "#f0f8f0", color: "#16A34A", borderRadius: "15px", fontSize: "12px", fontWeight: 500, border: "", fontFamily: "Poppins, sans-serif" }}>
            10:00 AM - 11:00 AM
          </div>
          <div style={{ padding: "6px 12px", backgroundColor: "#f0f8f0", color: "#16A34A", borderRadius: "16px", fontSize: "12px", fontWeight: 500, border: "", fontFamily: "Poppins, sans-serif" }}>
            2:00 PM - 3:00 PM
          </div>
        </div>
      </div>

      <div style={{ padding: "16px", backgroundColor: "#f0f8f0", borderRadius: "12px", position: "relative", marginBottom: "3rem" }}>
        <Text style={{ fontSize: "14px", color: "", display: "block", marginBottom: "4px", fontWeight: 500, fontFamily: "Poppins, sans-serif" }}>
          Next Availability
        </Text>
        <Title level={4} style={{ margin: 0, fontWeight: 500, color: "#16A34A", fontSize: "16px", fontFamily: "Poppins, sans-serif" }}>
          Tomorrow 9:30 AM
        </Title>
      </div>

      <div style={{ position: "absolute", bottom: "16px", right: "16px", display: "flex", gap: "14rem" }}>
        <div
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            backgroundColor: "#9EBEFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
          onClick={handlePreviousClinic}
        >
          <LeftOutlined style={{ fontSize: "14px", color: "white" }} />
        </div>
        <div
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            backgroundColor: "#9EBEFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
          onClick={handleNextClinic}
        >
          <RightOutlined style={{ fontSize: "14px", color: "white" }} />
        </div>
      </div>
    </Card>
  );

  const renderRevenueSummary = () => (
    <Card
      style={{
        borderRadius: "16px",
        border: "none",
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        background: "white",
      }}
      bodyStyle={{ padding: "24px" }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <Title level={4} style={{ margin: 0, fontWeight: 600, color: "#1a1a1a", fontSize: "18px", fontFamily: "Poppins, sans-serif" }}>
          Revenue Summary
        </Title>
      </div>
      <div style={{ textAlign: "center" }}>
        <PieChart />
      </div>
    </Card>
  );

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <div
        style={{
          padding: "24px",
          backgroundColor: "#F3FFFD",
          minHeight: "100vh",
          fontFamily: "Poppins, sans-serif",
        }}
      >
        {renderHeader()}

        {/* Main Content Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1.9fr 1fr", gap: "24px", marginBottom: "24px" }}>
          {renderAppointmentsCard()}
          {renderRevenueCard()}
        </div>

        {/* Bottom Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1.9fr 1fr", gap: "24px" }}>
          {/* Left Column */}
          <div>
            {renderPatientAppointments()}
            {renderPatientFeedback()}
          </div>

          {/* Right Column */}
          <div style={{ display: "grid", gridTemplateRows: "auto auto", gap: "24px" }}>
            {renderClinicAvailability()}
            {renderRevenueSummary()}
          </div>
        </div>
      </div>
    </>
  );
};

export default DoctorDashboard;