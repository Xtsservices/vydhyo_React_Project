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
import { apiGet, apiPost, apiDelete, apiPut } from "../../api";
import moment from "moment";
import { useSelector } from "react-redux";

const { Title, Text } = Typography;
const { Option } = Select;
const { Panel } = Collapse;

const AvailabilityScreen = () => {
  const today = new Date();
  const dayName = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ][today.getDay()];
  const [clinics, setClinics] = useState([]);
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [selectedDay, setSelectedDay] = useState(dayName);
  const [selectedDate, setSelectedDate] = useState(moment());
  const [selectedEndDate, setSelectedEndDate] = useState(null);
  const [loading, setLoading] = useState(false);

  // Clinic-specific slots state
  const [clinicSlots, setClinicSlots] = useState({});

  // Available slots time controls
  const [availableStartTime, setAvailableStartTime] = useState(9);
  const [availableStartPeriod, setAvailableStartPeriod] = useState("AM");
  const [availableEndTime, setAvailableEndTime] = useState(11);
  const [availableEndPeriod, setAvailableEndPeriod] = useState("AM");
  const [availableDuration, setAvailableDuration] = useState(30);

  // Unavailable slots time controls
  const [unavailableStartTime, setUnavailableStartTime] = useState(9);
  const [unavailableStartPeriod, setUnavailableStartPeriod] = useState("AM");
  const [unavailableEndTime, setUnavailableEndTime] = useState(11);
  const [unavailableEndPeriod, setUnavailableEndPeriod] = useState("AM");
  const [unavailableDuration, setUnavailableDuration] = useState(30);

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

  // Helper function to get current clinic's slots
  const getCurrentClinicSlots = () => {
    if (!selectedClinic) return { availableSlots: [], unavailableSlots: [] };
    return (
      clinicSlots[selectedClinic] || {
        availableSlots: [],
        unavailableSlots: [],
      }
    );
  };

  // Helper function to set current clinic's slots
  const setCurrentClinicSlots = (newSlots) => {
    setClinicSlots((prev) => ({
      ...prev,
      [selectedClinic]: newSlots,
    }));
  };

  const fetchClinicsForDoctor = async (doctorId) => {
    try {
      setLoading(true);
      const response = await apiGet(`/users/getClinicAddress?doctorId=${doctorId}`);
      
      if (response.status === 200 && response.data?.status === "success") {
        const activeClinics = response.data.data
          .filter((address) => address.status === "Active")
          .map((address) => ({
            label: address.clinicName,
            value: address.addressId,
            addressData: address,
          }));

        setClinics(activeClinics);

        if (activeClinics.length > 0) {
          setSelectedClinic(activeClinics[0].value);
        } else {
          setSelectedClinic(null);
          message.warning("No active clinics available");
        }
      } else {
        throw new Error(response.data?.message || "Failed to fetch clinics");
      }
    } catch (error) {
      console.error("Error fetching clinics:", error);
      message.error("Failed to fetch clinic data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (doctorId) {
      fetchClinicsForDoctor(doctorId);
    }
  }, [doctorId]);

  useEffect(() => {
    const date = new Date().toISOString().split("T")[0];
    console.log(selectedDate?.format("YYYY-MM-DD"), date, "selectedDate");

    if (doctorId && selectedClinic) {
      if (selectedDate !== null) {
        fetchSlotsForDate(selectedDate?.format("YYYY-MM-DD"));
      } else {
        fetchSlotsForDate(date);
      }
    }
  }, [selectedDate, doctorId, selectedClinic]);

  const fetchSlotsForDate = async (date) => {
    try {
      setLoading(true);
      const response = await apiGet("/appointment/getSlotsByDoctorIdAndDate", {
        params: {
          doctorId: doctorId,
          date: date,
          addressId: selectedClinic,
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
                id: slot._id,
                originalTime: slot.time,
              });
            } else {
              unavailable.push({
                time: timeStr,
                available: false,
                id: slot._id,
                reason: slot.reason || "Not available",
                originalTime: slot.time,
              });
            }
          });
        }

        setCurrentClinicSlots({
          availableSlots: available,
          unavailableSlots: unavailable,
        });
      } else if (response.response?.status === 404) {
        setCurrentClinicSlots({
          availableSlots: [],
          unavailableSlots: [],
        });
        message.info(
          "No slots found for this date - starting with empty schedule"
        );
      } else {
        message.error(response.data?.message || "Failed to fetch slots");
      }
    } catch (error) {
      console.error("Error fetching slots:", error);
      if (error.response?.status === 404) {
        setCurrentClinicSlots({
          availableSlots: [],
          unavailableSlots: [],
        });
        message.info(
          "No slots found for this date - starting with empty schedule"
        );
      } else {
        message.error("Failed to fetch slots");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSlots = async () => {
    try {
      setLoading(true);
      const { availableSlots, unavailableSlots } = getCurrentClinicSlots();

      const allSlots = [
        ...availableSlots.map((slot) => ({
          time: slot.originalTime,
          status: "available",
          reason: "",
        })),
        ...unavailableSlots.map((slot) => ({
          time: slot.originalTime,
          status: "unavailable",
          reason: slot.reason,
        })),
      ];

      const timeSlots = allSlots.map((slot) => slot.time);

      const response = await apiPut("/appointment/updateDoctorSlots", {
        doctorId: doctorId,
        date: selectedDate.format("YYYY-MM-DD"),
        addressId: selectedClinic,
      });

      if (response.data && response.data.status === "success") {
        message.success("Slots updated successfully");
        fetchSlotsForDate(selectedDate.format("YYYY-MM-DD"));
      } else {
        message.error(response.data?.message || "Failed to update slots");
      }
    } catch (error) {
      console.error("Error updating slots:", error);
      message.error("Failed to update slots");
    } finally {
      setLoading(false);
    }
  };

  const handleAddAvailableSlots = async () => {
    console.log(selectedDate, selectedEndDate, "selectedDate");
    try {
      setLoading(true);

      const getDateRangeArray = (fromDate, endDate) => {
        const dates = [];
        let currentDate = moment(fromDate, "YYYY-MM-DD");
        const end = moment(endDate, "YYYY-MM-DD");

        while (currentDate.isSameOrBefore(end)) {
          dates.push(currentDate.format("YYYY-MM-DD"));
          currentDate.add(1, "days");
        }

        return dates;
      };

      const fromDate = selectedDate?.format("YYYY-MM-DD");
      const endDate = selectedEndDate?.format("YYYY-MM-DD");

      let selectedDates = [];
      if (fromDate && endDate) {
        selectedDates = getDateRangeArray(fromDate, endDate);
      } else {
        selectedDates = [fromDate];
      }

      const response = await apiPost("/appointment/createSlotsForDoctor", {
        doctorId: doctorId,
        dates: selectedDates,
        startTime: moment(
          `${availableStartTime}:00 ${availableStartPeriod}`,
          "hh:mm A"
        ).format("HH:mm"),
        endTime: moment(
          `${availableEndTime}:00 ${availableEndPeriod}`,
          "hh:mm A"
        ).format("HH:mm"),
        interval: availableDuration,
        isAvailable: true,
        addressId: selectedClinic,
      });

      if (response.data && response.data.status === "success") {
        message.success("Available slots created successfully");
        fetchSlotsForDate(selectedDate.format("YYYY-MM-DD"));
      } else {
        message.error(
          response.data?.message || "Failed to create available slots"
        );
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
      const { availableSlots } = getCurrentClinicSlots();
      const slotIds = availableSlots.map((slot) => slot.id);

      if (slotIds.length > 0) {
        const response = await apiDelete("/appointment/deleteSlots", {
          data: {
            slotIds: slotIds,
          },
        });

        if (response.data && response.data.status === "success") {
          message.success("Available slots deleted successfully");
          setCurrentClinicSlots({
            ...getCurrentClinicSlots(),
            availableSlots: [],
          });
        } else {
          message.error(
            response.data?.message || "Failed to delete available slots"
          );
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
      const { availableSlots, unavailableSlots } = getCurrentClinicSlots();

      const startTime = moment(
        `${unavailableStartTime}:00 ${unavailableStartPeriod}`,
        "hh:mm A"
      ).format("HH:mm");

      const endTime = moment(
        `${unavailableEndTime}:00 ${unavailableEndPeriod}`,
        "hh:mm A"
      ).format("HH:mm");

      const slotsToMarkUnavailable = generateTimeSlots(
        startTime,
        endTime,
        unavailableDuration
      );

      const existingUnavailableTimes = unavailableSlots.map(
        (slot) => slot.originalTime
      );
      const newSlotsToMark = slotsToMarkUnavailable.filter(
        (time) => !existingUnavailableTimes.includes(time)
      );

      if (newSlotsToMark.length === 0) {
        message.info("All selected slots are already marked as unavailable");
        return;
      }

      const overlappingAvailableSlots = availableSlots.filter((slot) =>
        newSlotsToMark.includes(slot.originalTime)
      );

      const newUnavailableSlots = [
        ...unavailableSlots,
        ...newSlotsToMark
          .filter(
            (time) => !availableSlots.some((slot) => slot.originalTime === time)
          )
          .map((time) => ({
            time: moment(time, "HH:mm").format("hh:mm A"),
            available: false,
            id: `temp-${Date.now()}-${time}`,
            reason: unavailableReason || "Not available",
            originalTime: time,
          })),
      ];

      const updatedAvailableSlots = availableSlots.filter(
        (slot) => !newSlotsToMark.includes(slot.originalTime)
      );

      if (overlappingAvailableSlots.length > 0) {
        overlappingAvailableSlots.forEach((slot) => {
          newUnavailableSlots.push({
            ...slot,
            available: false,
            reason: unavailableReason || "Not available",
          });
        });
      }

      setCurrentClinicSlots({
        availableSlots: updatedAvailableSlots,
        unavailableSlots: newUnavailableSlots,
      });

      const response = await apiPut("/appointment/updateDoctorSlots", {
        doctorId: doctorId,
        date: selectedDate.format("YYYY-MM-DD"),
        addressId: selectedClinic,
      });

      if (response.data && response.data.status === "success") {
        message.success("Slots marked as unavailable successfully");
      } else {
        throw new Error(response.data?.message || "Failed to update slots");
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
      const { unavailableSlots } = getCurrentClinicSlots();
      const slotIds = unavailableSlots.map((slot) => slot.id);

      if (slotIds.length > 0) {
        const response = await apiDelete("/appointment/deleteSlots", {
          data: {
            slotIds: slotIds,
          },
        });

        if (response.data && response.data.status === "success") {
          message.success("Unavailable slots deleted successfully");
          setCurrentClinicSlots({
            ...getCurrentClinicSlots(),
            unavailableSlots: [],
          });
        } else {
          message.error(
            response.data?.message || "Failed to delete unavailable slots"
          );
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

  const generateTimeSlots = (startTime, endTime, interval) => {
    const slots = [];
    let currentTime = moment(startTime, "HH:mm");
    const endTimeMoment = moment(endTime, "HH:mm");

    while (currentTime.isSameOrBefore(endTimeMoment)) {
      slots.push(currentTime.format("HH:mm"));
      currentTime.add(interval, "minutes");
    }

    return slots;
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

  const renderTimeControls = (section) => {
    const isAvailable = section === "available";
    const { availableSlots, unavailableSlots } = getCurrentClinicSlots();
    const startTime = isAvailable ? availableStartTime : unavailableStartTime;
    const startPeriod = isAvailable
      ? availableStartPeriod
      : unavailableStartPeriod;
    const endTime = isAvailable ? availableEndTime : unavailableEndTime;
    const endPeriod = isAvailable ? availableEndPeriod : unavailableEndPeriod;
    const duration = isAvailable ? availableDuration : unavailableDuration;
    const addHandler = isAvailable
      ? handleAddAvailableSlots
      : handleAddUnavailableSlots;
    const deleteHandler = isAvailable
      ? handleDeleteAllAvailable
      : handleDeleteAllUnavailable;
    const title = isAvailable
      ? "Available Time Slots"
      : "Unavailable Time Slots";

    return (
      <>
        <Title
          level={4}
          style={{
            marginBottom: 16,
            color: isAvailable ? "#16A34A" : "#FF3B30",
          }}
        >
          {title}
        </Title>

        <Row gutter={[24, 24]} align="middle" style={{ marginBottom: 16 }}>
          {/* Start Time */}
          <Col xs={12} sm={6}>
            <Text strong>Start Time:</Text>
            <div
              style={{ display: "flex", alignItems: "center", marginTop: 8 }}
            >
              <span
                style={{
                  minWidth: 30,
                  textAlign: "center",
                  fontSize: 16,
                  fontWeight: "bold",
                }}
              >
                {startTime}
              </span>
              <div style={{ marginLeft: 8 }}>
                <Button
                  size="small"
                  icon={<UpOutlined />}
                  onClick={() => adjustTime("start", "up", section)}
                  style={{
                    display: "block",
                    marginBottom: 2,
                    width: 30,
                    height: 20,
                  }}
                />
                <Button
                  size="small"
                  icon={<DownOutlined />}
                  onClick={() => adjustTime("start", "down", section)}
                  style={{ display: "block", width: 30, height: 20 }}
                />
              </div>
              <Button
                size="small"
                onClick={() =>
                  isAvailable
                    ? setAvailableStartPeriod(
                        startPeriod === "AM" ? "PM" : "AM"
                      )
                    : setUnavailableStartPeriod(
                        startPeriod === "AM" ? "PM" : "AM"
                      )
                }
                style={{
                  marginLeft: 8,
                  backgroundColor: startPeriod === "AM" ? "#fff" : "#ffeaa7",
                  border: "1px solid #ddd",
                  borderRadius: 4,
                  minWidth: 35,
                  height: 24,
                }}
              >
                {startPeriod}
              </Button>
            </div>
          </Col>

          {/* End Time */}
          <Col xs={12} sm={6}>
            <Text strong>End Time:</Text>
            <div
              style={{ display: "flex", alignItems: "center", marginTop: 8 }}
            >
              <span
                style={{
                  minWidth: 30,
                  textAlign: "center",
                  fontSize: 16,
                  fontWeight: "bold",
                }}
              >
                {endTime}
              </span>
              <div style={{ marginLeft: 8 }}>
                <Button
                  size="small"
                  icon={<UpOutlined />}
                  onClick={() => adjustTime("end", "up", section)}
                  style={{
                    display: "block",
                    marginBottom: 2,
                    width: 30,
                    height: 20,
                  }}
                />
                <Button
                  size="small"
                  icon={<DownOutlined />}
                  onClick={() => adjustTime("end", "down", section)}
                  style={{ display: "block", width: 30, height: 20 }}
                />
              </div>
              <Button
                size="small"
                onClick={() =>
                  isAvailable
                    ? setAvailableEndPeriod(endPeriod === "AM" ? "PM" : "AM")
                    : setUnavailableEndPeriod(endPeriod === "AM" ? "PM" : "AM")
                }
                style={{
                  marginLeft: 8,
                  backgroundColor: endPeriod === "AM" ? "#fff" : "#ffeaa7",
                  border: "1px solid #ddd",
                  borderRadius: 4,
                  minWidth: 35,
                  height: 24,
                }}
              >
                {endPeriod}
              </Button>
            </div>
          </Col>

          {/* Duration */}
          {isAvailable && (
            <Col xs={12} sm={6}>
              <Text strong>Duration (minutes):</Text>
              <div
                style={{ display: "flex", alignItems: "center", marginTop: 8 }}
              >
                <span
                  style={{
                    minWidth: 30,
                    textAlign: "center",
                    fontSize: 16,
                    fontWeight: "bold",
                  }}
                >
                  {duration}
                </span>
                <div style={{ marginLeft: 8 }}>
                  <Button
                    size="small"
                    icon={<UpOutlined />}
                    onClick={() => adjustDuration("up", section)}
                    style={{
                      display: "block",
                      marginBottom: 2,
                      width: 30,
                      height: 20,
                    }}
                  />
                  <Button
                    size="small"
                    icon={<DownOutlined />}
                    onClick={() => adjustDuration("down", section)}
                    style={{ display: "block", width: 30, height: 20 }}
                  />
                </div>
              </div>
            </Col>
          )}

          {/* Action Buttons */}
          <Col xs={12} sm={6}>
            <Space>
              <Button
                type="primary"
                onClick={addHandler}
                icon={<PlusOutlined />}
                style={{ fontWeight: "bold" }}
              >
                Add Slots
              </Button>
            </Space>
          </Col>
        </Row>

        {/* Reason Input for Unavailable */}
        {!isAvailable && (
          <div style={{ marginBottom: 16 }}>
            <Text strong>Reason for Unavailability:</Text>
            <Input
              placeholder="Enter reason..."
              value={unavailableReason}
              onChange={(e) => setUnavailableReason(e.target.value)}
              style={{ marginTop: 8 }}
            />
          </div>
        )}

        {/* Slots Display */}
        <Row gutter={[12, 12]} style={{ marginBottom: 24 }}>
          {(isAvailable ? availableSlots : unavailableSlots).map(
            (slot, index) => (
              <Col key={index} xs={12} sm={8} md={6} lg={4}>
                <Button
                  block
                  style={{
                    height: 48,
                    borderRadius: 8,
                    border: isAvailable
                      ? "1px solid #52c41a"
                      : "1px solid #ff4d4f",
                    backgroundColor: isAvailable ? "#DCFCE7" : "#FEE2E2",
                    color: isAvailable ? "#52c41a" : "#ff4d4f",
                    fontWeight: "bold",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  icon={
                    isAvailable ? <ClockCircleOutlined /> : <StopOutlined />
                  }
                >
                  {slot.time}
                </Button>
              </Col>
            )
          )}
        </Row>

        <Divider />
      </>
    );
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleEndDateChange = (date) => {
    setSelectedEndDate(date);
  };

  return (
    <div
      style={{ padding: 24, backgroundColor: "#F3FFFD", minHeight: "100vh" }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <Title level={3} style={{ marginBottom: 24, color: "#1f2937" }}>
          Availability Management
        </Title>

        {/* Clinic Selection */}
        <Card style={{ marginBottom: 24, borderRadius: 12 }}>
          <Text strong style={{ marginRight: 16 }}>
            Select Clinic:
          </Text>
          <Select
            value={selectedClinic}
            onChange={setSelectedClinic}
            style={{ width: 250 }}
            suffixIcon={<DownOutlined />}
            loading={loading}
          >
            {clinics.map((clinic) => (
              <Option key={clinic.value} value={clinic.value}>
                {clinic.label}
              </Option>
            ))}
          </Select>
        </Card>

        <Spin spinning={loading}>
          {/* Main Card */}
          <Card
            title={
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Space>
                  <Text strong>Manage Availability for:</Text>
                  <Text strong>Start Date:</Text>
                  <DatePicker
                    placeholder="mm/dd/yyyy"
                    style={{ width: "120px" }}
                    onChange={handleDateChange}
                    value={selectedDate}
                    format="MM/DD/YYYY"
                  />

                  <Text strong>End Date:</Text>

                  <DatePicker
                    placeholder="mm/dd/yyyy"
                    style={{ width: "120px" }}
                    onChange={handleEndDateChange}
                    value={selectedEndDate}
                    format="MM/DD/YYYY"
                  />
                </Space>
              </div>
            }
            style={{ borderRadius: 12, marginBottom: 24 }}
            bodyStyle={{ padding: 24 }}
          >
            {/* Day Selection */}
            <div style={{ marginBottom: 24 }}>
              <Text
                strong
                style={{ display: "block", marginBottom: 16, fontSize: 16 }}
              >
                Select Day of Week:
              </Text>
              <Row gutter={[8, 8]}>
                {days.map((day) => (
                  <Col key={day}>
                    <Button
                      type={selectedDay === day ? "primary" : "default"}
                      onClick={() => setSelectedDay(day)}
                      style={{ borderRadius: 20, minWidth: 80, height: 36 }}
                    >
                      {day}
                    </Button>
                  </Col>
                ))}
              </Row>
            </div>

            {/* Available Slots Section */}
            {renderTimeControls("available")}

            {/* Unavailable Slots Section */}
            {renderTimeControls("unavailable")}

            {/* Legend */}
            <div style={{ marginBottom: 16 }}>
              <Space>
                <Tag color="#16A34A" icon={<ClockCircleOutlined />}>
                  Available Slots
                </Tag>
                <Tag color="#FF3B30" icon={<StopOutlined />}>
                  Unavailable Slots
                </Tag>
              </Space>
            </div>
          </Card>

          {/* Action Buttons */}
          <div style={{ textAlign: "right" }}>
            <Space size="large">
              <Button size="large" style={{ minWidth: 100 }}>
                Cancel
              </Button>
              <Button
                type="primary"
                size="large"
                style={{ minWidth: 120, borderRadius: 8 }}
                onClick={handleUpdateSlots}
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