import React, { useState, useEffect } from "react";
import {
  Card,
  Select,
  Button,
  Row,
  Col,
  Tag,
  Typography,
  Space,
  Divider,
  DatePicker,
  Input,
  Collapse,
  message,
  Spin,
} from "antd";
import {
  DownOutlined,
  UpOutlined,
  ClockCircleOutlined,
  StopOutlined,
  CalendarOutlined,
  PlusOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { apiGet, apiPost, apiDelete } from "../../api";
import moment from "moment";
import { useSelector } from "react-redux";

const { Title, Text } = Typography;
const { Option } = Select;
const { Panel } = Collapse;

const AvailabilityScreen = () => {
  const [selectedClinic, setSelectedClinic] = useState("Clinic Availability");
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [selectedDate, setSelectedDate] = useState(moment());
  const [loading, setLoading] = useState(false);

  // Available slots time controls
  const [availableStartTime, setAvailableStartTime] = useState(9);
  const [availableStartPeriod, setAvailableStartPeriod] = useState("AM");
  const [availableEndTime, setAvailableEndTime] = useState(11);
  const [availableEndPeriod, setAvailableEndPeriod] = useState("AM");
  const [availableDuration, setAvailableDuration] = useState(30);
  const [availableSlots, setAvailableSlots] = useState([]);

  // Unavailable slots time controls
  const [unavailableStartTime, setUnavailableStartTime] = useState(9);
  const [unavailableStartPeriod, setUnavailableStartPeriod] = useState("AM");
  const [unavailableEndTime, setUnavailableEndTime] = useState(11);
  const [unavailableEndPeriod, setUnavailableEndPeriod] = useState("AM");
  const [unavailableDuration, setUnavailableDuration] = useState(30);
  const [unavailableSlots, setUnavailableSlots] = useState([]);

  const [unavailableStartDate, setUnavailableStartDate] = useState(null);
  const [unavailableEndDate, setUnavailableEndDate] = useState(null);
  const [unavailableReason, setUnavailableReason] = useState("");

  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const user = useSelector((state) => state.currentUserData);
  const doctorId = user?.role === "doctor" ? user?.userId : user?.createdBy;

  useEffect(() => {
    if (doctorId) {
      fetchSlotsForDate(selectedDate.format("YYYY-MM-DD"));
    }
  }, [selectedDate, doctorId]);

  const fetchSlotsForDate = async (date) => {
    try {
      setLoading(true);
      const response = await apiGet("/appointment/getSlotsByDoctorIdAndDate", {
        params: {
          doctorId: doctorId,
          date: date,
        },
      });

      if (response.data && response.data.status === "success") {
        const slotsData = response.data.data;
        const available = [];
        const unavailable = [];

        if (slotsData?.slots && Array.isArray(slotsData.slots)) {
          slotsData.slots.forEach((slot) => {
            const timeStr = moment(slot.time, "HH:mm").format("hh:mm A");
            if (slot.status === "available") {
              available.push({ 
                time: timeStr, 
                available: true,
                id: slot._id
              });
            } else {
              unavailable.push({ 
                time: timeStr, 
                available: false,
                id: slot._id,
                reason: slot.reason || "Not available"
              });
            }
          });
        }

        setAvailableSlots(available);
        setUnavailableSlots(unavailable);
      } else {
        message.error(response.data?.message || "Failed to fetch slots");
      }
    } catch (error) {
      console.error("Error fetching slots:", error);
      message.error("Failed to fetch slots");
    } finally {
      setLoading(false);
    }
  };

  const generateTimeSlots = (
    startTime,
    startPeriod,
    endTime,
    endPeriod,
    duration
  ) => {
    const slots = [];
    let startHour = startTime;
    let endHour = endTime;

    // Convert to 24-hour format
    if (startPeriod === "PM" && startTime !== 12) {
      startHour = startTime + 12;
    } else if (startPeriod === "AM" && startTime === 12) {
      startHour = 0;
    }

    if (endPeriod === "PM" && endTime !== 12) {
      endHour = endTime + 12;
    } else if (endPeriod === "AM" && endTime === 12) {
      endHour = 0;
    }

    let currentTime = startHour * 60;
    const endTimeMinutes = endHour * 60;

    while (currentTime <= endTimeMinutes) {
      const hour = Math.floor(currentTime / 60);
      const minute = currentTime % 60;
      let displayHour = hour;
      let period = "AM";

      if (hour === 0) {
        displayHour = 12;
        period = "AM";
      } else if (hour < 12) {
        displayHour = hour;
        period = "AM";
      } else if (hour === 12) {
        displayHour = 12;
        period = "PM";
      } else {
        displayHour = hour - 12;
        period = "PM";
      }

      const timeString = `${displayHour.toString().padStart(2, "0")}:${minute
        .toString()
        .padStart(2, "0")} ${period}`;

      slots.push({
        time: timeString,
        available: true,
      });

      currentTime += duration;
    }

    return slots;
  };

  const handleAddAvailableSlots = async () => {
    try {
      setLoading(true);
      const response = await apiPost("/appointment/createSlotsForDoctor", {
        doctorId: doctorId,
        dates: [selectedDate.format("YYYY-MM-DD")],
        startTime: moment(`${availableStartTime}:00 ${availableStartPeriod}`, "hh:mm A").format("HH:mm"),
        endTime: moment(`${availableEndTime}:00 ${availableEndPeriod}`, "hh:mm A").format("HH:mm"),
        interval: availableDuration,
        isAvailable: true
      });

      if (response.data && response.data.status === "success") {
        message.success("Available slots created successfully");
        fetchSlotsForDate(selectedDate.format("YYYY-MM-DD"));
      } else {
        message.error(response.data?.message || "Failed to create available slots");
      }
    } catch (error) {
      console.error("Error creating available slots:", error);
      message.error("Failed to create available slots");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAllAvailable = async () => {
    try {
      setLoading(true);
      const slotIds = availableSlots.map(slot => slot.id);
      
      if (slotIds.length > 0) {
        const response = await apiDelete("/appointment/deleteSlots", {
          data: {
            slotIds: slotIds
          }
        });

        if (response.data && response.data.status === "success") {
          message.success("Available slots deleted successfully");
          setAvailableSlots([]);
        } else {
          message.error(response.data?.message || "Failed to delete available slots");
        }
      } else {
        message.info("No available slots to delete");
      }
    } catch (error) {
      console.error("Error deleting available slots:", error);
      message.error("Failed to delete available slots");
    } finally {
      setLoading(false);
    }
  };

  const handleAddUnavailableSlots = async () => {
    try {
      setLoading(true);
      const response = await apiPost("/appointment/createSlotsForDoctor", {
        doctorId: doctorId,
        dates: [selectedDate.format("YYYY-MM-DD")],
        startTime: moment(`${unavailableStartTime}:00 ${unavailableStartPeriod}`, "hh:mm A").format("HH:mm"),
        endTime: moment(`${unavailableEndTime}:00 ${unavailableEndPeriod}`, "hh:mm A").format("HH:mm"),
        interval: unavailableDuration,
        isAvailable: false,
        reason: unavailableReason || "Not available"
      });

      if (response.data && response.data.status === "success") {
        message.success("Unavailable slots created successfully");
        setUnavailableReason("");
        fetchSlotsForDate(selectedDate.format("YYYY-MM-DD"));
      } else {
        message.error(response.data?.message || "Failed to create unavailable slots");
      }
    } catch (error) {
      console.error("Error creating unavailable slots:", error);
      message.error("Failed to create unavailable slots");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAllUnavailable = async () => {
    try {
      setLoading(true);
      const slotIds = unavailableSlots.map(slot => slot.id);
      
      if (slotIds.length > 0) {
        const response = await apiDelete("/appointment/deleteSlots", {
          data: {
            slotIds: slotIds
          }
        });

        if (response.data && response.data.status === "success") {
          message.success("Unavailable slots deleted successfully");
          setUnavailableSlots([]);
        } else {
          message.error(response.data?.message || "Failed to delete unavailable slots");
        }
      } else {
        message.info("No unavailable slots to delete");
      }
    } catch (error) {
      console.error("Error deleting unavailable slots:", error);
      message.error("Failed to delete unavailable slots");
    } finally {
      setLoading(false);
    }
  };

  const adjustTime = (type, direction, section) => {
    if (section === "available") {
      if (type === "start") {
        if (direction === "up") {
          setAvailableStartTime((prev) => (prev === 12 ? 1 : prev + 1));
        } else {
          setAvailableStartTime((prev) => (prev === 1 ? 12 : prev - 1));
        }
      } else {
        if (direction === "up") {
          setAvailableEndTime((prev) => (prev === 12 ? 1 : prev + 1));
        } else {
          setAvailableEndTime((prev) => (prev === 1 ? 12 : prev - 1));
        }
      }
    } else {
      if (type === "start") {
        if (direction === "up") {
          setUnavailableStartTime((prev) => (prev === 12 ? 1 : prev + 1));
        } else {
          setUnavailableStartTime((prev) => (prev === 1 ? 12 : prev - 1));
        }
      } else {
        if (direction === "up") {
          setUnavailableEndTime((prev) => (prev === 12 ? 1 : prev + 1));
        } else {
          setUnavailableEndTime((prev) => (prev === 1 ? 12 : prev - 1));
        }
      }
    }
  };

  const adjustDuration = (direction, section) => {
    if (section === "available") {
      if (direction === "up") {
        setAvailableDuration((prev) => Math.min(120, prev + 15));
      } else {
        setAvailableDuration((prev) => Math.max(15, prev - 15));
      }
    } else {
      if (direction === "up") {
        setUnavailableDuration((prev) => Math.min(120, prev + 15));
      } else {
        setUnavailableDuration((prev) => Math.max(15, prev - 15));
      }
    }
  };

  const handleAddUnavailableDateRange = async () => {
    if (!unavailableStartDate || !unavailableEndDate) {
      message.error("Please select both start and end dates");
      return;
    }

    try {
      setLoading(true);
      const response = await apiPost("/appointment/createUnavailableDateRange", {
        doctorId: doctorId,
        startDate: unavailableStartDate.format("YYYY-MM-DD"),
        endDate: unavailableEndDate.format("YYYY-MM-DD"),
        reason: unavailableReason || "Not available"
      });

      if (response.data && response.data.status === "success") {
        message.success("Unavailable date range set successfully");
        setUnavailableStartDate(null);
        setUnavailableEndDate(null);
        setUnavailableReason("");
      } else {
        message.error(response.data?.message || "Failed to set unavailable date range");
      }
    } catch (error) {
      console.error("Error setting unavailable date range:", error);
      message.error("Failed to set unavailable date range");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        padding: "24px",
        backgroundColor: "#F3FFFD",
        minHeight: "100vh",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <Title level={3} style={{ marginBottom: "24px", color: "#1f2937" }}>
          Available Timings
        </Title>

        {/* Clinic Selection */}
        <Card style={{ marginBottom: "24px", borderRadius: "12px" }}>
          <Select
            value={selectedClinic}
            onChange={setSelectedClinic}
            style={{ width: "250px" }}
            suffixIcon={<DownOutlined />}
          >
            <Option value="Clinic 1">Clinic 1</Option>
            <Option value="Clinic 2">Clinic 2</Option>
            <Option value="Clinic 3">Clinic 3</Option>
          </Select>
        </Card>

        {/* Main Content */}
        <Spin spinning={loading}>
          <Card
            title={
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>Select Available Slots</span>
                <DatePicker
                  value={selectedDate}
                  onChange={setSelectedDate}
                  format="DD/MM/YYYY"
                  placeholder="DD/MM/YYYY"
                  suffixIcon={<CalendarOutlined />}
                />
              </div>
            }
            style={{ borderRadius: "12px", marginBottom: "24px" }}
            bodyStyle={{ padding: "32px" }}
          >
            {/* Day Selection */}
            <div style={{ marginBottom: "32px" }}>
              <Text
                strong
                style={{
                  display: "block",
                  marginBottom: "16px",
                  fontSize: "16px",
                }}
              >
                Select Available days
              </Text>
              <Row gutter={[8, 8]}>
                {days.map((day) => (
                  <Col key={day}>
                    <Button
                      type={selectedDay === day ? "primary" : "default"}
                      onClick={() => setSelectedDay(day)}
                      style={{
                        borderRadius: "20px",
                        minWidth: "80px",
                        height: "36px",
                      }}
                    >
                      {day}
                    </Button>
                  </Col>
                ))}
              </Row>
            </div>

            {/* Time Configuration for Available Slots */}
            <Row
              gutter={[24, 24]}
              align="middle"
              style={{ marginBottom: "32px" }}
            >
              <Col xs={24} sm={6}>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <Title level={4} style={{ margin: 0, color: "#1f2937" }}>
                    {selectedDay}
                  </Title>
                  <Text type="secondary">
                    {selectedDate.format("DD/MM/YYYY")}
                  </Text>
                </div>
              </Col>

              {/* Start Time */}
              <Col xs={12} sm={4}>
                <Text strong>Start Time :</Text>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginTop: "8px",
                  }}
                >
                  <span
                    style={{
                      minWidth: "30px",
                      textAlign: "center",
                      fontSize: "16px",
                      fontWeight: "bold",
                    }}
                  >
                    {availableStartTime}
                  </span>
                  <div style={{ marginLeft: "8px" }}>
                    <Button
                      size="small"
                      icon={<UpOutlined />}
                      onClick={() => adjustTime("start", "up", "available")}
                      style={{
                        display: "block",
                        marginBottom: "2px",
                        width: "30px",
                        height: "20px",
                      }}
                    />
                    <Button
                      size="small"
                      icon={<DownOutlined />}
                      onClick={() => adjustTime("start", "down", "available")}
                      style={{
                        display: "block",
                        width: "30px",
                        height: "20px",
                      }}
                    />
                  </div>
                  <Button
                    size="small"
                    onClick={() =>
                      setAvailableStartPeriod(
                        availableStartPeriod === "AM" ? "PM" : "AM"
                      )
                    }
                    style={{
                      marginLeft: "8px",
                      backgroundColor:
                        availableStartPeriod === "AM" ? "#fff" : "#ffeaa7",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      minWidth: "35px",
                      height: "24px",
                    }}
                  >
                    {availableStartPeriod}
                  </Button>
                </div>
              </Col>

              {/* End Time */}
              <Col xs={12} sm={4}>
                <Text strong>End Time :</Text>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginTop: "8px",
                  }}
                >
                  <span
                    style={{
                      minWidth: "30px",
                      textAlign: "center",
                      fontSize: "16px",
                      fontWeight: "bold",
                    }}
                  >
                    {availableEndTime}
                  </span>
                  <div style={{ marginLeft: "8px" }}>
                    <Button
                      size="small"
                      icon={<UpOutlined />}
                      onClick={() => adjustTime("end", "up", "available")}
                      style={{
                        display: "block",
                        marginBottom: "2px",
                        width: "30px",
                        height: "20px",
                      }}
                    />
                    <Button
                      size="small"
                      icon={<DownOutlined />}
                      onClick={() => adjustTime("end", "down", "available")}
                      style={{
                        display: "block",
                        width: "30px",
                        height: "20px",
                      }}
                    />
                  </div>
                  <Button
                    size="small"
                    onClick={() =>
                      setAvailableEndPeriod(
                        availableEndPeriod === "AM" ? "PM" : "AM"
                      )
                    }
                    style={{
                      marginLeft: "8px",
                      backgroundColor:
                        availableEndPeriod === "AM" ? "#fff" : "#ffeaa7",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      minWidth: "35px",
                      height: "24px",
                    }}
                  >
                    {availableEndPeriod}
                  </Button>
                </div>
              </Col>

              {/* Duration */}
              <Col xs={12} sm={4}>
                <Text strong>Duration :</Text>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginTop: "8px",
                  }}
                >
                  <span
                    style={{
                      minWidth: "30px",
                      textAlign: "center",
                      fontSize: "16px",
                      fontWeight: "bold",
                    }}
                  >
                    {availableDuration}
                  </span>
                  <div style={{ marginLeft: "8px" }}>
                    <Button
                      size="small"
                      icon={<UpOutlined />}
                      onClick={() => adjustDuration("up", "available")}
                      style={{
                        display: "block",
                        marginBottom: "2px",
                        width: "30px",
                        height: "20px",
                      }}
                    />
                    <Button
                      size="small"
                      icon={<DownOutlined />}
                      onClick={() => adjustDuration("down", "available")}
                      style={{
                        display: "block",
                        width: "30px",
                        height: "20px",
                      }}
                    />
                  </div>
                </div>
              </Col>

              {/* Action Buttons */}
              <Col xs={12} sm={6}>
                <Space>
                  <Button
                    type="link"
                    onClick={handleAddAvailableSlots}
                    style={{ color: "#1890ff", fontWeight: "bold" }}
                  >
                    Add Slots
                  </Button>
                  <Button
                    type="link"
                    danger
                    onClick={handleDeleteAllAvailable}
                    style={{ fontWeight: "bold" }}
                  >
                    Delete All
                  </Button>
                </Space>
              </Col>
            </Row>

            {/* Available Time Slots */}
            <Row gutter={[12, 12]} style={{ marginBottom: "32px" }}>
              {availableSlots.map((slot, index) => (
                <Col key={index} xs={12} sm={8} md={6} lg={4}>
                  <Button
                    block
                    style={{
                      height: "48px",
                      borderRadius: "8px",
                      border: "1px solid #52c41a",
                      backgroundColor: "#DCFCE7",
                      color: "#52c41a",
                      fontWeight: "bold",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    icon={<ClockCircleOutlined />}
                  >
                    {slot.time}
                  </Button>
                </Col>
              ))}
            </Row>
          </Card>

          {/* Select Unavailable Slots */}
          <Card
            title="Select Unavailable Slots"
            style={{ borderRadius: "12px", marginBottom: "24px" }}
            bodyStyle={{ padding: "32px" }}
          >
            {/* Time Configuration for Unavailable */}
            <Row
              gutter={[24, 24]}
              align="middle"
              style={{ marginBottom: "32px" }}
            >
              <Col xs={24} sm={6}>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <Title level={4} style={{ margin: 0, color: "#1f2937" }}>
                    {selectedDay}
                  </Title>
                  <Text type="secondary">
                    {selectedDate.format("DD/MM/YYYY")}
                  </Text>
                </div>
              </Col>

              {/* Start Time */}
              <Col xs={12} sm={4}>
                <Text strong>Start Time :</Text>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginTop: "8px",
                  }}
                >
                  <span
                    style={{
                      minWidth: "30px",
                      textAlign: "center",
                      fontSize: "16px",
                      fontWeight: "bold",
                    }}
                  >
                    {unavailableStartTime}
                  </span>
                  <div style={{ marginLeft: "8px" }}>
                    <Button
                      size="small"
                      icon={<UpOutlined />}
                      onClick={() => adjustTime("start", "up", "unavailable")}
                      style={{
                        display: "block",
                        marginBottom: "2px",
                        width: "30px",
                        height: "20px",
                      }}
                    />
                    <Button
                      size="small"
                      icon={<DownOutlined />}
                      onClick={() => adjustTime("start", "down", "unavailable")}
                      style={{
                        display: "block",
                        width: "30px",
                        height: "20px",
                      }}
                    />
                  </div>
                  <Button
                    size="small"
                    onClick={() =>
                      setUnavailableStartPeriod(
                        unavailableStartPeriod === "AM" ? "PM" : "AM"
                      )
                    }
                    style={{
                      marginLeft: "8px",
                      backgroundColor:
                        unavailableStartPeriod === "AM" ? "#fff" : "#ffeaa7",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      minWidth: "35px",
                      height: "24px",
                    }}
                  >
                    {unavailableStartPeriod}
                  </Button>
                </div>
              </Col>

              {/* End Time */}
              <Col xs={12} sm={4}>
                <Text strong>End Time :</Text>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginTop: "8px",
                  }}
                >
                  <span
                    style={{
                      minWidth: "30px",
                      textAlign: "center",
                      fontSize: "16px",
                      fontWeight: "bold",
                    }}
                  >
                    {unavailableEndTime}
                  </span>
                  <div style={{ marginLeft: "8px" }}>
                    <Button
                      size="small"
                      icon={<UpOutlined />}
                      onClick={() => adjustTime("end", "up", "unavailable")}
                      style={{
                        display: "block",
                        marginBottom: "2px",
                        width: "30px",
                        height: "20px",
                      }}
                    />
                    <Button
                      size="small"
                      icon={<DownOutlined />}
                      onClick={() => adjustTime("end", "down", "unavailable")}
                      style={{
                        display: "block",
                        width: "30px",
                        height: "20px",
                      }}
                    />
                  </div>
                  <Button
                    size="small"
                    onClick={() =>
                      setUnavailableEndPeriod(
                        unavailableEndPeriod === "AM" ? "PM" : "AM"
                      )
                    }
                    style={{
                      marginLeft: "8px",
                      backgroundColor:
                        unavailableEndPeriod === "AM" ? "#fff" : "#ffeaa7",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      minWidth: "35px",
                      height: "24px",
                    }}
                  >
                    {unavailableEndPeriod}
                  </Button>
                </div>
              </Col>

              {/* Duration */}
              <Col xs={12} sm={4}>
                <Text strong>Duration :</Text>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginTop: "8px",
                  }}
                >
                  <span
                    style={{
                      minWidth: "30px",
                      textAlign: "center",
                      fontSize: "16px",
                      fontWeight: "bold",
                    }}
                  >
                    {unavailableDuration}
                  </span>
                  <div style={{ marginLeft: "8px" }}>
                    <Button
                      size="small"
                      icon={<UpOutlined />}
                      onClick={() => adjustDuration("up", "unavailable")}
                      style={{
                        display: "block",
                        marginBottom: "2px",
                        width: "30px",
                        height: "20px",
                      }}
                    />
                    <Button
                      size="small"
                      icon={<DownOutlined />}
                      onClick={() => adjustDuration("down", "unavailable")}
                      style={{
                        display: "block",
                        width: "30px",
                        height: "20px",
                      }}
                    />
                  </div>
                </div>
              </Col>

              {/* Action Buttons */}
              <Col xs={12} sm={6}>
                <Space>
                  <Button
                    type="link"
                    // onClick={handleAddUnavailableSlots}
                    style={{ color: "#1890ff", fontWeight: "bold" }}
                  >
                    Add Slots
                  </Button>
                  <Button
                    type="link"
                    danger
                    onClick={handleDeleteAllUnavailable}
                    style={{ fontWeight: "bold" }}
                  >
                    Delete All
                  </Button>
                </Space>
              </Col>
            </Row>

            {/* Unavailable Time Slots */}
            <Row gutter={[12, 12]} style={{ marginBottom: "32px" }}>
              {unavailableSlots.map((slot, index) => (
                <Col key={index} xs={12} sm={8} md={6} lg={4}>
                  <Button
                    block
                    style={{
                      height: "48px",
                      borderRadius: "8px",
                      border: "1px solid #ff4d4f",
                      backgroundColor: "#FEE2E2",
                      color: "#ff4d4f",
                      fontWeight: "bold",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    icon={<StopOutlined />}
                  >
                    {slot.time}
                  </Button>
                </Col>
              ))}
            </Row>
          </Card>

          {/* Available, Unavailable */}
          <div style={{ marginBottom: "20px", marginLeft: "18px" }}>
            <Space>
              <Tag color="#16A34A" icon={<ClockCircleOutlined />}>
                Availability
              </Tag>
              <Tag color="#FF3B30" icon={<StopOutlined />}>
                Unavailability
              </Tag>
            </Space>
          </div>

          {/* Unavailable Date Section */}
          <Card style={{ borderRadius: "12px", marginBottom: "0px" }}>
            <Collapse
              defaultActiveKey={["1"]}
              expandIconPosition="right"
              style={{ border: "none", backgroundColor: "transparent" }}
            >
              <Panel
                header={
                  <Title level={4} style={{ margin: 0 }}>
                    Unavailable Date
                  </Title>
                }
                key="1"
                style={{ border: "none", backgroundColor: "transparent" }}
              >
                <Row
                  gutter={[24, 24]}
                  align="middle"
                  style={{ marginBottom: "24px" }}
                >
                  <Col xs={24} sm={8}>
                    <Text strong>Start Date :</Text>
                    <div style={{ marginTop: "8px" }}>
                      <DatePicker
                        placeholder="DD/MM/YYYY"
                        suffixIcon={<CalendarOutlined />}
                        value={unavailableStartDate}
                        onChange={setUnavailableStartDate}
                        style={{ width: "100%" }}
                      />
                    </div>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Text strong>End Date :</Text>
                    <div style={{ marginTop: "8px" }}>
                      <DatePicker
                        placeholder="DD/MM/YYYY"
                        suffixIcon={<CalendarOutlined />}
                        value={unavailableEndDate}
                        onChange={setUnavailableEndDate}
                        style={{ width: "100%" }}
                      />
                    </div>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Space>
                      <Button
                        type="link"
                        icon={<PlusOutlined />}
                        onClick={handleAddUnavailableDateRange}
                        style={{ color: "#1890ff", fontWeight: "bold" }}
                      >
                        Add
                      </Button>
                      <Button
                        type="link"
                        icon={<DeleteOutlined />}
                        danger
                        style={{ fontWeight: "bold" }}
                      >
                        Delete
                      </Button>
                    </Space>
                  </Col>
                </Row>

                <div style={{ marginBottom: "24px" }}>
                  <Text strong>Reason :</Text>
                  <Input.TextArea
                    rows={3}
                    placeholder="Enter reason for unavailability..."
                    value={unavailableReason}
                    onChange={(e) => setUnavailableReason(e.target.value)}
                    style={{ marginTop: "8px" }}
                  />
                </div>
              </Panel>
            </Collapse>
          </Card>

          {/* Action Buttons */}
          <div style={{ textAlign: "right", marginTop: "20px" }}>
            <Space size="large">
              <Button size="large" style={{ minWidth: "100px" }}>
                Cancel
              </Button>
              <Button
                type="primary"
                size="large"
                style={{ minWidth: "120px", borderRadius: "8px" }}
              >
                Save Changes
              </Button>
            </Space>
          </div>
        </Spin>
      </div>
    </div>
  );
};

export default AvailabilityScreen;