import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Card,
  Button,
  DatePicker,
  TimePicker,
  Select,
  Spin,
  Tag,
  Typography,
  Dropdown,
  Menu,
  message,
} from "antd";
import {
  DownOutlined,
  CloseOutlined,
  LeftOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const { Option } = Select;
const { Title } = Typography;

const AvailabilityPage = () => {
  const navigate = useNavigate();
  const [selectedAction, setSelectedAction] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const scheduleData = [];
  const leaveData = [];
  const [currentDate, setCurrentDate] = useState(new Date());

  const [formData, setFormData] = useState({
    fromDate: "",
    toDate: "",
    fromTime: "",
    toTime: "",
  });

  const API_BASE_URL = "http://192.168.1.42:3000";
  const STAFF_ID = localStorage.getItem("userId");
  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    const fetchSchedulesAndLeaves = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          `${API_BASE_URL}/doctor/getSchedulesAndLeaves`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.data) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = response.data;
        if (result.data) {
          const schedules = result.data.filter(
            (item) => !item.type || item.type === "schedule"
          );
          const leaves = result.data.filter((item) => item.type === "leave");

          scheduleData.push(...schedules);
          leaveData.push(...leaves);
        }
      } catch (error) {
        console.error("Error fetching schedules and leaves:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (STAFF_ID && token) {
      fetchSchedulesAndLeaves();
    }
  }, [STAFF_ID, token]);

  const createSchedule = async (scheduleData) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/doctor/createSchedule`,
        {
          staffId: STAFF_ID,
          fromDate: scheduleData.fromDate,
          toDate: scheduleData.toDate,
          fromTime: scheduleData.fromTime,
          toTime: scheduleData.toTime,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.data) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.data;
    } catch (error) {
      console.error("Error creating schedule:", error);
      throw error;
    }
  };

  const createLeave = async (leaveData) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/doctor/createLeave`,
        {
          staffId: STAFF_ID,
          fromDate: leaveData.fromDate,
          toDate: leaveData.toDate,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.data) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.data;
    } catch (error) {
      console.error("Error creating leave:", error);
      throw error;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${year}-${String(month + 1).padStart(
        2,
        "0"
      )}-${String(day).padStart(2, "0")}`;
      days.push({
        day,
        dateString,
        isScheduled: scheduleData.some((item) =>
          isDateInRange(
            dateString,
            formatDate(item.fromDate),
            formatDate(item.toDate)
          )
        ),
        isLeave: leaveData.some((item) =>
          isDateInRange(
            dateString,
            formatDate(item.fromDate),
            formatDate(item.toDate)
          )
        ),
      });
    }

    return days;
  };

  const isDateInRange = (date, fromDate, toDate) => {
    return date >= fromDate && date <= toDate;
  };

  const handleAdd = async () => {
    if (!formData.fromDate || !formData.toDate) return;

    setIsLoading(true);

    try {
      if (selectedAction === "schedule") {
        const result = await createSchedule(formData);
        const newEntry = {
          id: result.data.id,
          fromDate: formData.fromDate,
          toDate: formData.toDate,
          fromTime: formData.fromTime,
          toTime: formData.toTime,
          status: "pending",
        };
        scheduleData.push(newEntry);

        message.success("Schedule created successfully!");
      } else if (selectedAction === "leave") {
        const result = await createLeave(formData);
        const newEntry = {
          id: result.data.id,
          type: "leave",
          fromDate: formData.fromDate,
          toDate: formData.toDate,
          status: result.data.status || "pending",
        };
        leaveData.push(newEntry);

        message.success("Leave created successfully!");
      }

      setFormData({
        fromDate: "",
        toDate: "",
        fromTime: "",
        toTime: "",
      });
    } catch (error) {
      console.error("Error adding entry:", error);
      message.error("Error saving data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (type, id) => {
    try {
      setIsLoading(true);
      if (type === "schedule") {
        const index = scheduleData.findIndex((s) => s.id === id);
        if (index !== -1) scheduleData.splice(index, 1);
      } else {
        const index = leaveData.findIndex((l) => l.id === id);
        if (index !== -1) leaveData.splice(index, 1);
      }
    } catch (error) {
      console.error("Error deleting entry:", error);
      message.error("Error deleting entry. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const navigateMonth = (direction) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const dayNames = ["S", "M", "T", "W", "T", "F", "S"];

  const menu = (
    <Menu>
      <Menu.Item
        key="schedule"
        onClick={() => {
          setSelectedAction("schedule");
          setIsDropdownOpen(false);
        }}
      >
        Schedule
      </Menu.Item>
      <Menu.Item
        key="leave"
        onClick={() => {
          setSelectedAction("leave");
          setIsDropdownOpen(false);
        }}
      >
        Leave
      </Menu.Item>
    </Menu>
  );

  return (
    <div>
      <Spin spinning={isLoading}>
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={8}>
            <Card title="Action Selection" bordered={false}>
              <Dropdown
                overlay={menu}
                visible={isDropdownOpen}
                onVisibleChange={setIsDropdownOpen}
              >
                <Button
                  type="primary"
                  block
                  icon={<DownOutlined />}
                  disabled={isLoading}
                >
                  {selectedAction
                    ? selectedAction === "schedule"
                      ? "Schedule"
                      : "Leave"
                    : "Select Action"}
                </Button>
              </Dropdown>
              {selectedAction && (
                <div className="mt-2">
                  <Row gutter={[8, 8]}>
                    <Col xs={12}>
                      <DatePicker
                        value={
                          formData.fromDate ? new Date(formData.fromDate) : null
                        }
                        onChange={(date) =>
                          setFormData({
                            ...formData,
                            fromDate: date ? date.format("YYYY-MM-DD") : "",
                          })
                        }
                        placeholder="From Date"
                        disabled={isLoading}
                        style={{ width: "100%" }}
                      />
                    </Col>
                    <Col xs={12}>
                      <DatePicker
                        value={
                          formData.toDate ? new Date(formData.toDate) : null
                        }
                        onChange={(date) =>
                          setFormData({
                            ...formData,
                            toDate: date ? date.format("YYYY-MM-DD") : "",
                          })
                        }
                        placeholder="To Date"
                        disabled={isLoading}
                        style={{ width: "100%" }}
                      />
                    </Col>
                  </Row>
                  {selectedAction === "schedule" && (
                    <Row gutter={[8, 8]} className="mt-2">
                      <Col xs={12}>
                        <TimePicker
                          value={
                            formData.fromTime
                              ? moment(formData.fromTime, "HH:mm")
                              : null
                          }
                          onChange={(time) =>
                            setFormData({
                              ...formData,
                              fromTime: time ? time.format("HH:mm") : "",
                            })
                          }
                          placeholder="From Time"
                          disabled={isLoading}
                          style={{ width: "100%" }}
                        />
                      </Col>
                      <Col xs={12}>
                        <TimePicker
                          value={
                            formData.toTime
                              ? moment(formData.toTime, "HH:mm")
                              : null
                          }
                          onChange={(time) =>
                            setFormData({
                              ...formData,
                              toTime: time ? time.format("HH:mm") : "",
                            })
                          }
                          placeholder="To Time"
                          disabled={isLoading}
                          style={{ width: "100%" }}
                        />
                      </Col>
                    </Row>
                  )}
                  <Button
                    type="primary"
                    block
                    onClick={handleAdd}
                    disabled={
                      !formData.fromDate || !formData.toDate || isLoading
                    }
                    className="mt-2"
                  >
                    Add
                  </Button>
                </div>
              )}
            </Card>
            <Card title="Legend" bordered={false} className="mt-2">
              <div>
                <Tag color="green">Scheduled</Tag>
                <Tag color="red">Unavailable</Tag>
                <Tag color="purple">Both</Tag>
              </div>
            </Card>
          </Col>
          <Col xs={24} lg={16}>
            <Card
              title={
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Title level={4}>
                    {monthNames[currentDate.getMonth()]}{" "}
                    {currentDate.getFullYear()}
                  </Title>
                  <div>
                    <Button
                      icon={<LeftOutlined />}
                      onClick={() => navigateMonth(-1)}
                      style={{ marginRight: 8 }}
                    />
                    <Button
                      icon={<RightOutlined />}
                      onClick={() => navigateMonth(1)}
                    />
                  </div>
                </div>
              }
              bordered={false}
            >
              <Row gutter={[8, 8]}>
                {dayNames.map((day) => (
                  <Col key={day} span={24 / 7}>
                    <div
                      style={{
                        textAlign: "center",
                        fontWeight: "bold",
                        color: "#666",
                      }}
                    >
                      {day}
                    </div>
                  </Col>
                ))}
                {generateCalendarDays().map((dayData, index) => (
                  <Col key={index} span={24 / 7}>
                    {dayData ? (
                      <div
                        style={{
                          textAlign: "center",
                          padding: "4px",
                          borderRadius: "4px",
                          backgroundColor:
                            dayData.isScheduled && dayData.isLeave
                              ? "#d8b4fe"
                              : dayData.isScheduled
                              ? "#bbf7d0"
                              : dayData.isLeave
                              ? "#fecaca"
                              : "transparent",
                          color:
                            dayData.isScheduled || dayData.isLeave
                              ? "#6b21a8"
                              : "#000",
                          fontWeight:
                            dayData.isScheduled || dayData.isLeave
                              ? "bold"
                              : "normal",
                          cursor: "pointer",
                        }}
                      >
                        {dayData.day}
                      </div>
                    ) : (
                      <div style={{ padding: "4px" }}></div>
                    )}
                  </Col>
                ))}
              </Row>
            </Card>
          </Col>
        </Row>
        <Row gutter={[16, 16]} className="mt-2">
          <Col xs={24} md={12}>
            <Card title={`Scheduled (${scheduleData.length})`} bordered={false}>
              {scheduleData.length === 0 ? (
                <Typography.Text type="secondary">
                  No scheduled periods
                </Typography.Text>
              ) : (
                <div style={{ maxHeight: "128px", overflowY: "auto" }}>
                  {scheduleData.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "8px",
                        background: "#f0fdf4",
                        borderRadius: "4px",
                        marginBottom: "8px",
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: "bold", color: "#166534" }}>
                          {formatDate(item.fromDate)} -{" "}
                          {formatDate(item.toDate)}
                        </div>
                        {item.fromTime && item.toTime && (
                          <div style={{ color: "#047857" }}>
                            {item.fromTime} - {item.toTime}
                          </div>
                        )}
                        {item.status && (
                          <div
                            style={{
                              color:
                                item.status === "approved"
                                  ? "#166534"
                                  : item.status === "rejected"
                                  ? "#dc2626"
                                  : "#ca8a04",
                            }}
                          >
                            Status: {item.status}
                          </div>
                        )}
                      </div>
                      <Button
                        icon={<CloseOutlined />}
                        onClick={() => handleDelete("schedule", item.id)}
                        disabled={isLoading}
                        style={{ color: "#166534" }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card title={`Leave (${leaveData.length})`} bordered={false}>
              {leaveData.length === 0 ? (
                <Typography.Text type="secondary">
                  No leave periods
                </Typography.Text>
              ) : (
                <div style={{ maxHeight: "128px", overflowY: "auto" }}>
                  {leaveData.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "8px",
                        background: "#fee2e2",
                        borderRadius: "4px",
                        marginBottom: "8px",
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: "bold", color: "#991b1b" }}>
                          {formatDate(item.fromDate)} -{" "}
                          {formatDate(item.toDate)}
                        </div>
                        {item.status && (
                          <div
                            style={{
                              color:
                                item.status === "approved"
                                  ? "#166534"
                                  : item.status === "rejected"
                                  ? "#dc2626"
                                  : "#ca8a04",
                            }}
                          >
                            Status: {item.status}
                          </div>
                        )}
                      </div>
                      <Button
                        icon={<CloseOutlined />}
                        onClick={() => handleDelete("leave", item.id)}
                        disabled={isLoading}
                        style={{ color: "#991b1b" }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  );
};

export default AvailabilityPage;
