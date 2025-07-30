import React, { useEffect, useRef, useState } from "react";
import { Card, Typography, Button } from "antd";
import {
  UserOutlined,
  LeftOutlined,
  RightOutlined,
  StarFilled,
  ArrowUpOutlined,
  ArrowDownOutlined,
  ConsoleSqlOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import moment from "moment";
import { apiGet } from "../../api";
import { Users } from "lucide-react";

const { Title, Text } = Typography;

// Sample feedback data
const feedbacks = [
  {
    name: "Rahul Sharma",
    avatar: "",
    rating: 5,
    comment:
      "Dr. Arvind was very patient and explained everything clearly. Highly recommended!",
    daysAgo: 2,
  },
  {
    name: "Priya Patel",
    avatar: "",
    rating: 4,
    comment:
      "Good consultation but had to wait longer than expected. Otherwise satisfied with the treatment.",
    daysAgo: 5,
  },
];


const PercentageChangeIndicator = ({
  value,
  positiveColor = "#16A34A",
  negativeColor = "#EF4444",
}) => {
  const isPositive = value >= 0;
  const color = isPositive ? positiveColor : negativeColor;
  const arrow = isPositive ? (
    <ArrowUpOutlined style={{ color, fontSize: "12px" }} />
  ) : (
    <ArrowDownOutlined style={{ color, fontSize: "12px" }} />
  );
  const displayValue = Math.abs(value);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "4px",
        marginTop: "6px",
      }}
    >
      {arrow}
      <Text
        style={{
          color,
          fontSize: "12px",
          fontWeight: 600,
          fontFamily: "Poppins, sans-serif",
        }}
      >
        {displayValue}%
      </Text>
    </div>
  );
};

const PieChart = ({ data }) => {
  const radius = 80;
  const centerX = 100;
  const centerY = 100;
  let currentAngle = 0;

  // Calculate total and handle zero values
  const total = data.reduce((sum, item) => sum + item.value, 0);

  console.log("PieChart data:", data, "Total:", total);

  // If total is 0, show equal segments for visual representation
  const processedData =
    total === 0
      ? data.map((item) => ({ ...item, value: 1 })) // Equal segments when no data
      : data.filter((item) => item.value > 0); // Only show non-zero segments

  const processedTotal = processedData.reduce(
    (sum, item) => sum + item.value,
    0
  );

  const segments = processedData.map((item, index) => {
    const percentage =
      processedTotal > 0
        ? item.value / processedTotal
        : 1 / processedData.length;
    const angle = percentage * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;

    // Convert angles to radians and calculate coordinates
    const startRadians = ((startAngle - 90) * Math.PI) / 180;
    const endRadians = ((endAngle - 90) * Math.PI) / 180;

    const x1 = centerX + radius * Math.cos(startRadians);
    const y1 = centerY + radius * Math.sin(startRadians);
    const x2 = centerX + radius * Math.cos(endRadians);
    const y2 = centerY + radius * Math.sin(endRadians);

    const largeArcFlag = angle > 180 ? 1 : 0;

    // Handle special case for full circle (360 degrees)
    const pathData =
      angle >= 360
        ? `M ${centerX} ${centerY} m -${radius} 0 a ${radius} ${radius} 0 1 1 ${
            radius * 2
          } 0 a ${radius} ${radius} 0 1 1 -${radius * 2} 0`
        : [
            `M ${centerX} ${centerY}`,
            `L ${x1} ${y1}`,
            `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
            "Z",
          ].join(" ");

    console.log(`Segment ${item.label}:`, {
      startAngle,
      endAngle,
      angle,
      pathData,
    });

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
  });

  return (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <div style={{ position: "relative", marginBottom: "24px" }}>
        <svg width="200" height="200" style={{ display: "block" }}>
          {processedData.length === 0 ? (
            <text
              x="100"
              y="100"
              textAnchor="middle"
              fill="#6c757d"
              fontFamily="Poppins, sans-serif"
              fontSize="14"
            >
              No revenue data
            </text>
          ) : (
            <>
              {segments}
              <circle cx={centerX} cy={centerY} r={30} fill="white" />
              {total === 0 && (
                <text
                  x="100"
                  y="105"
                  textAnchor="middle"
                  fill="#6c757d"
                  fontFamily="Poppins, sans-serif"
                  fontSize="12"
                >
                  No Data
                </text>
              )}
            </>
          )}
        </svg>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "24px",
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        {data.map((item, index) => (
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
            <Text
              style={{
                fontSize: "14px",
                color: "#666",
                fontWeight: 500,
                fontFamily: "Poppins, sans-serif",
              }}
            >
              {item.label} (₹{item.value.toLocaleString()})
            </Text>
          </div>
        ))}
      </div>
    </div>
  );
};

const Header = ({ user, navigate }) => {
  // Get current time in IST
  const now = new Date();
  // Convert to IST (UTC+5:30)
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const istNow = new Date(utc + 5.5 * 60 * 60 * 1000);
  const hour = istNow.getHours();

  let greeting = "Good Morning";
  if (hour >= 12 && hour < 16) {
    greeting = "Good Afternoon";
  } else if (hour >= 16) {
    greeting = "Good Evening";
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: "24px",
      }}
    >
      <div>
        <Title
          level={2}
          style={{
            margin: 0,
            fontWeight: 600,
            color: "#1a1a1a",
            fontSize: "28px",
            fontFamily: "Poppins, sans-serif",
          }}
        >
          {greeting}{" "}
          <span style={{ color: "#ff6b6b" }}>
            Dr. {user?.firstname || "Arvind"} {user?.lastname || "Sharma"}
          </span>
        </Title>
        <Text
          style={{
            color: "#8c8c8c",
            fontSize: "14px",
            marginTop: "4px",
            display: "block",
            fontFamily: "Poppins, sans-serif",
          }}
        >
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
};

const AppointmentsCard = ({ dashboardData }) => (
  <Card
    style={{
      borderRadius: "16px",
      background: "linear-gradient(135deg, #20d0c4 0%, #16a8a0 100%)",
      border: "none",
      boxShadow: "0 8px 32px rgba(32, 208, 196, 0.3)",
      position: "relative",
      overflow: "hidden",
      height: "220px",
      width: "100%",
    }}
    bodyStyle={{ padding: "16px" }}
  >
    <div style={{ textAlign: "center", marginBottom: "12px" }}>
      <Title
        level={1}
        style={{
          color: "white",
          margin: 0,
          fontSize: "48px",
          fontWeight: 700,
          lineHeight: "1",
          textShadow: "0 2px 4px rgba(0,0,0,0.1)",
          fontFamily: "Poppins, sans-serif",
        }}
      >
        {dashboardData.appointmentCounts.today}
      </Title>
      <Text
        style={{
          color: "white",
          fontSize: "14px",
          fontWeight: 500,
          marginTop: "6px",
          display: "block",
          fontFamily: "Poppins, sans-serif",
        }}
      >
        Today's Appointments
      </Text>
    </div>

    <div
      style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" } }
    >
      <div
        style={{
          backgroundColor: "#F0FDF4",
          borderRadius: "10px",
          padding: "12px",
          textAlign: "center",
          backdropFilter: "blur(10px)",
        }}
        // onClick={setNewAppointments(true)}
      >
        <Title
          level={2}
          style={{
            color: "#16A34A",
            margin: 0,
            fontSize: "24px",
            fontWeight: 700,
            fontFamily: "Poppins, sans-serif",
          }}
        >
          {dashboardData.appointmentCounts.newAppointments}
        </Title>
        <Text
          style={{
            color: "#16A34A",
            fontSize: "12px",
            fontWeight: 500,
            display: "block",
            marginTop: "4px",
            fontFamily: "Poppins, sans-serif",
          }}
        >
          New Appointments
        </Text>
        <PercentageChangeIndicator
          value={dashboardData.percentageChanges.newAppointments}
          positiveColor="#16A34A"
          negativeColor="#EF4444"
        />
      </div>

      <div
        style={{
          backgroundColor: "#EFF6FF",
          borderRadius: "10px",
          padding: "12px",
          textAlign: "center",
          backdropFilter: "blur(10px)",
        }}
        // onClick={setNewFollowups(true)}
      >
        <Title
          level={2}
          style={{
            color: "#2563EB",
            margin: 0,
            fontSize: "24px",
            fontWeight: 700,
            fontFamily: "Poppins, sans-serif",
          }}
        >
          {dashboardData.appointmentCounts.followUp}
        </Title>
        <Text
          style={{
            color: "#2563EB",
            fontSize: "12px",
            fontWeight: 500,
            display: "block",
            marginTop: "4px",
            fontFamily: "Poppins, sans-serif",
          }}
        >
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

const RevenueCard = ({ dashboardData }) => (
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
      <Title
        level={4}
        style={{
          margin: 0,
          fontWeight: 600,
          color: "#1a1a1a",
          fontSize: "16px",
          fontFamily: "Poppins, sans-serif",
        }}
      >
        Revenue
      </Title>
    </div>

    <div
      style={{
        marginBottom: "12px",
        backgroundColor: "#FAF5FF",
        padding: "12px",
        borderRadius: "8px",
        position: "relative",
      }}
    >
      <Text
        style={{
          fontSize: "12px",
          color: "#9333EA",
          display: "block",
          marginBottom: "4px",
          fontFamily: "Poppins, sans-serif",
        }}
      >
        Today's Revenue
      </Text>
      <div>
        <Title
          level={2}
          style={{
            margin: 0,
            fontWeight: 700,
            color: "#9333EA",
            fontSize: "28px",
            fontFamily: "Poppins, sans-serif",
          }}
        >
          ₹{dashboardData.totalAmount.today.toLocaleString()}
        </Title>
      </div>
    </div>

    <div
      style={{
        marginBottom: "12px",
        backgroundColor: "#FFF7ED",
        padding: "12px",
        borderRadius: "8px",
      }}
    >
      <Text
        style={{
          fontSize: "12px",
          color: "#EA580C",
          display: "block",
          marginBottom: "4px",
          fontFamily: "Poppins, sans-serif",
        }}
      >
        This Month
      </Text>
      <Title
        level={3}
        style={{
          margin: 0,
          fontWeight: 700,
          color: "#EA580C",
          fontSize: "20px",
          fontFamily: "Poppins, sans-serif",
        }}
      >
        ₹{dashboardData.totalAmount.month.toLocaleString()}
      </Title>
    </div>
  </Card>
);

const PatientAppointments = ({
  appointments,
  selectedDate,
  isLoadingAppointments,
  handleDateChange,
  getStatusColor,
  getTypeColor,
  getAppointmentTypeDisplay,
  newAppointments,
  newFollowups
}) => {
  const navigate = useNavigate();
console.log(newAppointments, "newappointments ")


  const filteredAppointments = appointments.filter(
    (appt) =>
      new Date(appt.appointmentDate).toISOString().split("T")[0] ===
      selectedDate
  );

  if (newAppointments) {
console.log("new appointments")


}

  // Show only first 5 appointments if there are more
  const displayedAppointments = filteredAppointments.slice(0, 5);
  const hasMoreAppointments = filteredAppointments.length > 5;

  const handleViewAll = () => {
    navigate("/doctor/doctorPages/Appointments");
  };

  return (
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
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <Title
          level={4}
          style={{
            margin: 0,
            fontWeight: 600,
            color: "#1a1a1a",
            fontSize: "18px",
            fontFamily: "Poppins, sans-serif",
          }}
        >
          Patient Appointments
        </Title>
        <div>
          <input
            type="date"
            style={{
              alignSelf: "flex-end",
              borderRadius: "12px",
              background: "#F6F6F6",
              padding: "0.4rem",
              color: "#1977f3",
              width: "130px",
              border: "1px solid #d9d9d9",
              marginTop: 8,
            }}
            value={selectedDate}
            onChange={(e) => handleDateChange(e.target.value)}
          />
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr 1fr 1fr",
          padding: "12px 0",
          borderBottom: "2px solid #f1f3f4",
          marginBottom: "16px",
        }}
      >
        <Text
          style={{
            fontWeight: 600,
            color: "#6c757d",
            fontSize: "12px",
            textTransform: "uppercase",
            fontFamily: "Poppins, sans-serif",
          }}
        >
          Patient Name
        </Text>
        <Text
          style={{
            fontWeight: 600,
            color: "#6c757d",
            fontSize: "12px",
            textTransform: "uppercase",
            fontFamily: "Poppins, sans-serif",
          }}
        >
          Time
        </Text>
        <Text
          style={{
            fontWeight: 600,
            color: "#6c757d",
            fontSize: "12px",
            textTransform: "uppercase",
            fontFamily: "Poppins, sans-serif",
          }}
        >
          Type
        </Text>
        <Text
          style={{
            fontWeight: 600,
            color: "#6c757d",
            fontSize: "12px",
            textTransform: "uppercase",
            fontFamily: "Poppins, sans-serif",
          }}
        >
          Status
        </Text>
      </div>

      {isLoadingAppointments ? (
        <div
          style={{ textAlign: "center", padding: "40px 0", color: "#8c8c8c" }}
        >
          <Text style={{ fontFamily: "Poppins, sans-serif" }}>
            Loading appointments...
          </Text>
        </div>
      ) : displayedAppointments.length > 0 ? (
        <>
          {displayedAppointments.map((appointment, index) => (
            <div
              key={appointment.appointmentId || index}
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr 1fr 1fr",
                padding: "16px 0",
                borderBottom:
                  index < displayedAppointments.length - 1
                    ? "1px solid #f8f9fa"
                    : "none",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontWeight: 500,
                  color: "#1a1a1a",
                  fontSize: "14px",
                  fontFamily: "Poppins, sans-serif",
                }}
              >
                {appointment.patientName || "Unknown Patient"}
              </Text>
              <Text
                style={{
                  color: "#6c757d",
                  fontSize: "14px",
                  fontFamily: "Poppins, sans-serif",
                }}
              >
                {appointment.appointmentTime || "N/A"}
              </Text>
              <div
                style={{
                  padding: "4px 12px",
                  backgroundColor:
                    appointment.appointmentType === "New-Walkin"
                      ? "#DBEAFE"
                      : "#e8f5e8",
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
                {appointment.appointmentStatus?.charAt(0).toUpperCase() +
                  appointment.appointmentStatus?.slice(1) || "Unknown"}
              </div>
            </div>
          ))}
        </>
      ) : (
        <div
          style={{ textAlign: "center", padding: "40px 0", color: "#8c8c8c" }}
        >
          <Text style={{ fontFamily: "Poppins, sans-serif" }}>
            No appointments found for the selected date
          </Text>
        </div>
      )}

      {hasMoreAppointments && (
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <Button
            type="link"
            onClick={handleViewAll}
            style={{
              color: "#4285f4",
              fontWeight: 500,
              fontSize: "14px",
              fontFamily: "Poppins, sans-serif",
            }}
          >
            View More
          </Button>
        </div>
      )}
    </Card>
  );
};

const PatientFeedback = () => (
  <Card
    style={{
      borderRadius: "16px",
      border: "none",
      boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
      background: "white",
    }}
    bodyStyle={{ padding: "24px" }}
  >
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "24px",
      }}
    >
      <Title
        level={4}
        style={{
          margin: 0,
          fontWeight: 600,
          color: "#1a1a1a",
          fontSize: "18px",
          fontFamily: "Poppins, sans-serif",
        }}
      >
        Patient Feedback
      </Title>
      <div style={{ display: "flex", gap: "8px" }}>
        <LeftOutlined
          style={{ fontSize: "16px", color: "#bfbfbf", cursor: "pointer" }}
        />
        <RightOutlined
          style={{ fontSize: "16px", color: "#bfbfbf", cursor: "pointer" }}
        />
      </div>
    </div>

    <div
      style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px" }}
    >
      {feedbacks.map((feedback, index) => (
        <div key={index}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "12px",
            }}
          >
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
              <Text
                style={{
                  fontWeight: 600,
                  color: "#1a1a1a",
                  fontSize: "16px",
                  display: "block",
                  fontFamily: "Poppins, sans-serif",
                }}
              >
                {feedback.name}
              </Text>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  marginTop: "4px",
                }}
              >
                {[...Array(feedback.rating)].map((_, i) => (
                  <StarFilled
                    key={i}
                    style={{ color: "#fbbf24", fontSize: "14px" }}
                  />
                ))}
              </div>
            </div>
          </div>
          <Text
            style={{
              color: "#6c757d",
              fontSize: "14px",
              lineHeight: "1.5",
              display: "block",
              marginBottom: "8px",
              fontStyle: "italic",
              fontFamily: "Poppins, sans-serif",
            }}
          >
            "{feedback.comment}"
          </Text>
          <Text
            style={{
              color: "#9ca3af",
              fontSize: "12px",
              fontFamily: "Poppins, sans-serif",
            }}
          >
            {feedback.daysAgo} days ago
          </Text>
        </div>
      ))}
    </div>
  </Card>
);

const ClinicAvailability = ({
  currentClinicIndex,
  setCurrentClinicIndex,
  doctorId,
}) => {
    const hasfetchClinics = useRef(false);

  const [availableSlots, setAvailableSlots] = useState([]);
  const [nextAvailableSlot, setNextAvailableSlot] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [clinics, setClinics] = useState([]);

  // Fetch clinics data
  useEffect(() => {
    const fetchClinics = async () => {
      try {
        const response = await apiGet(
          `/users/getClinicAddress?doctorId=${doctorId}`
        );
        if (response.data.status === "success") {
          // Filter to only show active clinics
          const activeClinics = response.data.data.filter(
            (clinic) => clinic.status === "Active"
          );
          setClinics(activeClinics || []);
        } else {
          setError("Failed to fetch clinics");
        }
      } catch (err) {
        console.error("Error fetching clinics:", err);
        setError("Error fetching clinics");
      }
    };

    if (doctorId && !hasfetchClinics.current) {
      fetchClinics();
      hasfetchClinics.current = true
    }
  }, [doctorId]);

  // Fetch available slots for the current clinic
  useEffect(() => {
    const fetchAvailableSlots = async () => {
      if (!doctorId || clinics.length === 0) return;

      try {
        setIsLoading(true);
        const currentClinic = clinics[currentClinicIndex];
        console.log(
          "Current Clinic for Slots:",
          currentClinic.addressId,
          doctorId
        );
        const response = await apiGet(
          `/appointment/getNextAvailableSlotsByDoctor?doctorId=${doctorId}`
        );
        // console.log("Available Slots Response:", response.data);
        if (response.data.status === "success") {
          const slotsData = response.data.data;
          console.log("Available Slots Data:", slotsData);

          const today = moment().format("YYYY-MM-DD");
          const tomorrow = moment().add(1, "day").format("YYYY-MM-DD");

          const todaySlotsData = slotsData.filter(
            (item) => item.date === today
          );
          const tomorrowSlotsData = slotsData.filter(
            (item) => item.date === tomorrow
          );

          // Today's available slots
          // const todaySlots = slotsData[0]?.slots
          //   ?.filter(slot => slot.status === "available")
          //   .map(slot => ({
          //     startTime: slot.time,
          //     endTime: calculateEndTime(slot.time)
          //   })) || [];

          console.log("Today's Available Slots:", tomorrowSlotsData);

          setAvailableSlots(todaySlotsData);
          setNextAvailableSlot(tomorrowSlotsData);

          // Next available slot (first available from next day)
          // if (slotsData.length > 1) {
          //   const nextDay = slotsData[1];
          //   const firstAvailable = nextDay.slots.find(slot => slot.status === "available");
          //   if (firstAvailable) {
          //     setNextAvailableSlot({
          //       date: nextDay.date,
          //       startTime: firstAvailable.time
          //     });
          //   }
          // }
        } else {
          setError("Failed to fetch available slots");
        }
      } catch (err) {
        console.error("Error fetching available slots:", err);
        setError("Error fetching available slots");
      } finally {
        setIsLoading(false);
      }
    };

    const calculateEndTime = (startTime) => {
      const [hours, minutes] = startTime.split(":").map(Number);
      const date = new Date();
      date.setHours(hours, minutes + 15, 0, 0);
      return `${date.getHours().toString().padStart(2, "0")}:${date
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;
    };

    if (clinics.length > 0) {
      fetchAvailableSlots();
    }
  }, [doctorId, clinics, currentClinicIndex]);

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

  const formatTime = (timeString) => {
    if (!timeString) return "";
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return moment(dateString).format("DD-MM-YYYY");
  };

  if (clinics.length === 0) {
    return (
      <Card
        style={{
          borderRadius: "16px",
          border: "none",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          background: "white",
          marginBottom: "24px",
          position: "relative",
          height: "250px",
        }}
        bodyStyle={{ padding: "14px" }}
      >
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <Text style={{ fontFamily: "Poppins, sans-serif" }}>
            No active clinics found for this doctor
          </Text>
        </div>
      </Card>
    );
  }

  const currentClinic = clinics[currentClinicIndex];

  console.log("Current Clinic:", currentClinic);

  return (
    <Card
      style={{
        borderRadius: "16px",
        border: "none",
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        background: "white",
        marginBottom: "-2rem",
        position: "relative",
        height: "250px",
      }}
      bodyStyle={{ padding: "14px" }}
    >
      {isLoading ? (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <Text style={{ fontFamily: "Poppins, sans-serif" }}>
            Loading clinic availability...
          </Text>
        </div>
      ) : error ? (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <Text style={{ fontFamily: "Poppins, sans-serif", color: "#ff4d4f" }}>
            {error}
          </Text>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: "12px" }}>
            <Title
              level={3}
              style={{
                margin: 0,
                fontWeight: 600,
                color: "#1a1a1a",
                fontSize: "16px",
                marginBottom: "4px",
                fontFamily: "Poppins, sans-serif",
              }}
            >
              Clinic Availability
            </Title>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                marginBottom: "12px",
              }}
            >
              <Title
                level={5}
                style={{
                  margin: 0,
                  fontWeight: 600,
                  color: "#495057",
                  fontSize: "14px",
                  fontFamily: "Poppins, sans-serif",
                }}
              >
                {currentClinic.clinicName}
              </Title>
              <Text
                style={{
                  fontSize: "11px",
                  color: "#8c8c8c",
                  fontFamily: "Poppins, sans-serif",
                }}
              >
                {currentClinic.startTime} - {currentClinic.endTime}
              </Text>
              <Text
                style={{
                  fontSize: "11px",
                  color: "#1890ff",
                  fontWeight: 500,
                  fontFamily: "Poppins, sans-serif",
                }}
              >
                {currentClinic.address.split(",")[0]}
              </Text>
            </div>

            <Text
              style={{
                fontSize: "13px",
                color: "#6c757d",
                display: "block",
                marginBottom: "8px",
                fontWeight: 500,
                fontFamily: "Poppins, sans-serif",
              }}
            >
              Available Slots:
            </Text>

            <div
              style={{
                display: "flex",
                gap: "6px",
                flexWrap: "wrap",
                marginBottom: "16px",
              }}
            >
              {availableSlots.length > 0 ? (
                (() => {
                  const matchedSlotGroup = availableSlots.find(
                    (slotGroup) =>
                      slotGroup.addressId === currentClinic.addressId
                  );

                  if (!matchedSlotGroup) {
                    // No matching clinic found
                    return (
                      <Text
                        style={{
                          fontSize: "12px",
                          color: "#8c8c8c",
                          fontFamily: "Poppins, sans-serif",
                        }}
                      >
                        No available slots for this clinic
                      </Text>
                    );
                  }

                  const available = matchedSlotGroup.slots
                    .filter((slot) => slot.status === "available")
                    .slice(0, 5);

                  console.log(
                    `Matched Address ID: ${matchedSlotGroup.addressId}`
                  );
                  console.log("Available slots:", available);

                  if (available.length === 0) {
                    // No available slots for this clinic
                    return (
                      <Text
                        style={{
                          fontSize: "12px",
                          color: "#8c8c8c",
                          fontFamily: "Poppins, sans-serif",
                        }}
                      >
                        No available slots today
                      </Text>
                    );
                  }

                  // Render up to 5 available slots
                  return (
                    <div
                      style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}
                    >
                      {available.map((slot, index) => (
                        <div
                          key={index}
                          style={{
                            padding: "4px 10px",
                            backgroundColor: "#f0f8f0",
                            color: "#16A34A",
                            borderRadius: "12px",
                            fontSize: "11px",
                            fontWeight: 500,
                            fontFamily: "Poppins, sans-serif",
                            lineHeight: "1.2",
                            height: "24px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            minWidth: "80px",
                          }}
                        >
                          {formatTime(slot.time)}
                        </div>
                      ))}
                    </div>
                  );
                })()
              ) : (
                // availableSlots is empty
                <Text
                  style={{
                    fontSize: "12px",
                    color: "#8c8c8c",
                    fontFamily: "Poppins, sans-serif",
                  }}
                >
                  No available slots today
                </Text>
              )}
              {/* {availableSlots.length > 0 ? (
                availableSlots.map((slot, index) => (
                slot.slice(0, 5).map((slot, index) => (
                  <div
                    key={index}
                    style={{
                      padding: "4px 10px",
                      backgroundColor: "#f0f8f0",
                      color: "#16A34A",
                      borderRadius: "12px",
                      fontSize: "11px",
                      fontWeight: 500,
                      fontFamily: "Poppins, sans-serif",
                      lineHeight: "1.2",
                      height: "24px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                  </div>
                )))
              ) ): (
                <Text
                  style={{
                    fontSize: "12px",
                    color: "#8c8c8c",
                    fontFamily: "Poppins, sans-serif",
                  }}
                >
                  No available slots today
                </Text>
              )} */}
            </div>
          </div>
          <div
            style={{
              padding: "12px",
              backgroundColor: "#f0f8f0",
              borderRadius: "10px",
              position: "relative",
              marginBottom: "2rem",
            }}
          >
            <Text
              style={{
                fontSize: "13px",
                display: "block",
                marginBottom: "2px",
                fontWeight: 500,
                fontFamily: "Poppins, sans-serif",
              }}
            >
              Next Availability
            </Text>
            <Title
              level={5}
              style={{
                margin: 0,
                fontWeight: 500,
                color: "#16A34A",
                fontSize: "14px",
                fontFamily: "Poppins, sans-serif",
              }}
            >
              {nextAvailableSlot?.length > 0 ? (
                (() => {
                  const matchedSlotGroup = nextAvailableSlot.find(
                    (slotGroup) =>
                      slotGroup.addressId === currentClinic.addressId
                  );

                  if (!matchedSlotGroup) {
                    return (
                      <Text
                        style={{
                          fontSize: "12px",
                          color: "#8c8c8c",
                          fontFamily: "Poppins, sans-serif",
                        }}
                      >
                        No available slots Tomorrow
                      </Text>
                    );
                  }

                  const available = matchedSlotGroup.slots
                    .filter((slot) => slot.status === "available")
                    .slice(0, 5);

                  console.log(
                    `Matched Address ID: ${matchedSlotGroup.addressId}`
                  );
                  console.log("Available slots (Tomorrow):", available);

                  if (available.length === 0) {
                    return (
                      <Text
                        style={{
                          fontSize: "12px",
                          color: "#8c8c8c",
                          fontFamily: "Poppins, sans-serif",
                        }}
                      >
                        No available slots Tomorrow
                      </Text>
                    );
                  }

                  return (
                    <div
                      style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}
                    >
                      {available.map((slot, index) => (
                        <div
                          key={index}
                          style={{
                            padding: "4px 10px",
                            backgroundColor: "#f0f8f0",
                            color: "#16A34A",
                            borderRadius: "12px",
                            fontSize: "11px",
                            fontWeight: 500,
                            fontFamily: "Poppins, sans-serif",
                            lineHeight: "1.2",
                            height: "24px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            minWidth: "80px",
                          }}
                        >
                          {formatTime(slot.time)}
                        </div>
                      ))}
                    </div>
                  );
                })()
              ) : (
                <Text
                  style={{
                    fontSize: "12px",
                    color: "#8c8c8c",
                    fontFamily: "Poppins, sans-serif",
                  }}
                >
                  No available slots Tomorrow
                </Text>
              )}

              {/* {nextAvailableSlot ? (
                <>
                  {formatDate(nextAvailableSlot.date)} at {formatTime(nextAvailableSlot.startTime)}
                </>
              ) : (
                "No upcoming availability"
              )} */}
            </Title>
          </div>

          {clinics.length > 1 && (
            <div
              style={{
                position: "absolute",
                top: "65%",
                left: "12px",
                right: "12px",
                display: "flex",
                justifyContent: "space-between",
                transform: "translateY(-50%)",
                gap: "44px", 
              }}
            >
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  backgroundColor: "#9EBEFF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                         marginLeft: "-12px", 
                          
 
                }}
                onClick={handlePreviousClinic}
              >
                <LeftOutlined style={{ fontSize: "12px", color: "white" }} />
              </div>
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  backgroundColor: "#9EBEFF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  marginRight: "-14px", 
                }}
                onClick={handleNextClinic}
              >
                <RightOutlined style={{ fontSize: "12px", color: "white" }} />
              </div>
            </div>
          )}
        </>
      )}
    </Card>
  );
};

const RevenueSummary = ({ revenueSummaryData }) => (
  <Card
    style={{
      borderRadius: "16px",
      border: "none",
      boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
      background: "white",
      marginTop: "2rem",
    }}
    bodyStyle={{ padding: "24px" }}
  >
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "24px",
      }}
    >
      <Title
        level={4}
        style={{
          margin: 0,
          fontWeight: 600,
          color: "#1a1a1a",
          fontSize: "18px",
          fontFamily: "Poppins, sans-serif",
        }}
      >
        Revenue Summary
      </Title>
    </div>
    <div style={{ textAlign: "center" }}>
      <PieChart data={revenueSummaryData} />
    </div>
  </Card>
);

const DoctorDashboard = () => {
  const navigate = useNavigate();
    const hasFetchedIntialRender = useRef(false);
  
  const user = useSelector((state) => state.currentUserData);
  const doctorId = user?.role === "doctor" ? user?.userId : user?.createdBy;
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
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  const formattedDate = `${year}-${month}-${day}`;
  const [selectedDate, setSelectedDate] = useState(formattedDate);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);
  const [revenueSummaryData, setRevenueSummaryData] = useState([
    { label: "Appointment", value: 0, color: "#4285f4" },
    { label: "Lab", value: 0, color: "#34a853" },
    { label: "Pharmacy", value: 0, color: "#fbbc04" },
  ]);

   const [newAppointments, setNewAppointments] = useState(false);
  const [newFollowups, setNewFollowups] = useState(false);
 

  const isReceptionist = user?.role === "receptionist";

  const formatDateForComparison = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

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
    return type === "New-Walkin" || type === "home-visit"
      ? "#1E40AF"
      : "#16A34A";
  };

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

  const getAppointments = async (date = null) => {
    try {
      setIsLoadingAppointments(true);
      const formattedDate = date || moment().format("YYYY-MM-DD");
      const response = await apiGet(
        `/appointment/getAppointmentsByDoctorID/dashboardAppointment?date=${formattedDate}&doctorId=${doctorId}`
      );
      console.log("Appointments API response:", response.data.data);

      if (
        response.data.status === "success" &&
        Array.isArray(response.data.data)
      ) {
        const appointmentsList = response.data.data;

        // Sort by appointmentTime in descending order (latest first)
        appointmentsList.sort((a, b) => {
          const timeA = moment(a.appointmentTime, "HH:mm");
          const timeB = moment(b.appointmentTime, "HH:mm");
          return timeB.diff(timeA); // descending
        });

        console.log("Sorted Appointments List:", appointmentsList);

        setAppointments(appointmentsList);
      } else {
        console.warn("Unexpected API response structure:", response.data);
        setAppointments([]);
        if (formattedDate === moment().format("YYYY-MM-DD")) {
          updatePatientAppointmentsData([], formattedDate);
        }
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setAppointments([]);
      const formattedDate = date || moment().format("YYYY-MM-DD");
      if (formattedDate === moment().format("YYYY-MM-DD")) {
        updatePatientAppointmentsData([], formattedDate);
      }
    } finally {
      setIsLoadingAppointments(false);
    }
  };

  const getTodayAppointmentCount = async () => {
    try {
      const response = await apiGet(
        `/appointment/getTodayAppointmentCount?doctorId=${doctorId}`
      );
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
            newAppointments:
              response.data.data.newAppointments.percentageChange,
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

  const getRevenueSummary = async () => {
    try {
      const response = await apiGet(
        "/finance/getDoctorRevenueSummaryThismonth"
      );
      console.log("Revenue summary API response:", response.data);
      if (response.data.status === "success") {
        const data = response.data.data;
        setRevenueSummaryData([
          {
            label: "Appointment",
            value: data.appointment || 0,
            color: "#4285f4",
          },
          { label: "Lab", value: data.lab || 0, color: "#34a853" },
          { label: "Pharmacy", value: data.pharmacy || 0, color: "#fbbc04" },
        ]);
      } else {
        console.error(
          "Revenue summary API response status is not success:",
          response.data
        );
        setRevenueSummaryData([
          { label: "Appointment", value: 1620, color: "#4285f4" },
          { label: "Lab", value: 0, color: "#34a853" },
          { label: "Pharmacy", value: 0, color: "#fbbc04" },
        ]);
      }
    } catch (error) {
      console.error("Error fetching revenue summary:", error);
      setRevenueSummaryData([
        { label: "Appointment", value: 1620, color: "#4285f4" },
        { label: "Lab", value: 0, color: "#34a853" },
        { label: "Pharmacy", value: 0, color: "#fbbc04" },
      ]);
    }
  };

  const updatePatientAppointmentsData = (appointmentsList, date) => {
    const today = date || moment().format("YYYY-MM-DD");
    const dateAppointments = appointmentsList.filter(
      (appt) => formatDateForComparison(appt.appointmentDate) === today
    );
    const newAppointments = appointmentsList.filter(
      (appt) =>
        appt.appointmentType === "New-Walkin" ||
        appt.appointmentType === "home-visit"
    ).length;
    const followUpAppointments = appointmentsList.filter(
      (appt) => appt.appointmentType === "follow-up" || appt.isFollowUp === true
    ).length;
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

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    getAppointments(newDate);
  };

  useEffect(() => {
    if (user && doctorId && !hasFetchedIntialRender.current) {
      getAppointments();
      getTodayAppointmentCount();
      getRevenueSummary();
      getTodayRevenue();
      hasFetchedIntialRender.current = true; // ✅ Prevent future fetch attempt
    }

  }, [user, doctorId]);

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
        <Header user={user} navigate={navigate} />

        {/* Main layout grid - same for all roles */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: user?.role === "doctor" ? "1.9fr 1fr" : "1fr",
            gap: "24px",
            marginBottom: "24px",
          }}
        >

          <AppointmentsCard dashboardData={dashboardData} />


          {user?.role === "doctor" && (
            <RevenueCard dashboardData={dashboardData} />
          )}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: user?.role === "doctor" ? "1.9fr 1fr" : "1fr",
            gap: "24px",
          }}
        >
          <div>
            <PatientAppointments
              appointments={appointments}
              selectedDate={selectedDate}
              isLoadingAppointments={isLoadingAppointments}
              handleDateChange={handleDateChange}
              getStatusColor={getStatusColor}
              getTypeColor={getTypeColor}
              getAppointmentTypeDisplay={getAppointmentTypeDisplay}
              newAppointments={newAppointments}
              newFollowups={newFollowups}
            />
            <PatientFeedback />
          </div>

          {/* Right column - only visible to doctors */}
          {user?.role === "doctor" && (
            <div
              style={{
                display: "grid",
                gridTemplateRows: "auto auto",
                gap: "24px",
              }}
            >
              <ClinicAvailability
                currentClinicIndex={currentClinicIndex}
                setCurrentClinicIndex={setCurrentClinicIndex}
                doctorId={doctorId}
              />
              <RevenueSummary revenueSummaryData={revenueSummaryData} />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default DoctorDashboard;
