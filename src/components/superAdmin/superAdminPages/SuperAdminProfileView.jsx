import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Tabs,
  Card,
  Avatar,
  Button,
  Tag,
  Row,
  Col,
  Statistic,
  Space,
  Typography,
  List,
  Modal,
  DatePicker,
  TimePicker,
  message,
  Radio,
  Grid,
  Input,
  Select,
  Table,
  Popover,
} from "antd";
import {
  SearchOutlined,
  PhoneOutlined,
  VideoCameraOutlined,
  MoreOutlined,
  UserOutlined,
  CalendarOutlined,
  CheckOutlined,
  CalendarFilled,
  ClockCircleFilled,
  ArrowUpOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import moment from "moment";
import "../../../components/stylings/Appointments.css";
import { apiGet, apiPost } from "../../api";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;
const { Option } = Select;

const Appointment = () => {
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const [activeKey, setActiveKey] = useState("1");
  const [appointments, setAppointments] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  const [isRescheduleModalVisible, setIsRescheduleModalVisible] =
    useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [newDate, setNewDate] = useState(null);
  const [newTime, setNewTime] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [filters, setFilters] = useState({
    clinic: "all",
    type: "all",
    status: "all",
    date: null,
  });

  const getStatusTag = (status) => {
    const statusConfig = {
      scheduled: { color: "green", text: "Scheduled" },
      completed: { color: "blue", text: "Completed" },
      rescheduled: { color: "purple", text: "Rescheduled" },
      canceled: { color: "red", text: "Canceled" },
    };
    const config = statusConfig[status] || { color: "default", text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const handleReschedule = (appointment) => {
    setSelectedAppointment(appointment);
    setIsRescheduleModalVisible(true);
  };

  const handleRescheduleSubmit = async () => {
    if (!selectedAppointment || !newDate || !newTime) {
      message.error("Please select both date and time");
      return;
    }

    try {
      const res = await apiPost("/appointment/rescheduleAppointment", {
        appointmentId: selectedAppointment.appointmentId,
        newDate: newDate.format("YYYY-MM-DD"),
        newTime: newTime.format("HH:mm"),
        reason: "Rescheduled by admin",
      });

      if (res.status === 200) {
        message.success("Appointment rescheduled successfully");
        setIsRescheduleModalVisible(false);
        setNewDate(null);
        setNewTime(null);
        setSelectedAppointment(null);
        getAppointments();
      }
    } catch (err) {
      console.error("Error rescheduling:", err);
      message.error("Failed to reschedule appointment");
    }
  };

  const handleCompleteAppointment = async (appointmentId) => {
    try {
      const res = await apiPost("/appointment/completeAppointment", {
        appointmentId,
        appointmentNotes: "Suggestions for patient on issues",
      });

      if (res.status === 200) {
        message.success("Appointment marked as completed");
        getAppointments();
      }
    } catch (err) {
      console.error("Complete error:", err);
      message.error("Failed to complete appointment");
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    try {
      const res = await apiPost("/appointment/cancelAppointment", {
        appointmentId,
        reason: "Feeling much better, want to cancel appointment",
      });

      if (res.status === 200) {
        message.success("Appointment cancelled");
        getAppointments();
      }
    } catch (err) {
      console.error("Cancel error:", err);
      message.error("Failed to cancel appointment");
    }
  };

  const renderAppointmentList = (appointments) => (
    <List
      dataSource={appointments}
      renderItem={(appointment) => (
        <List.Item
          actions={[
            <Button type="text" icon={<PhoneOutlined />} />,
            <Button type="text" icon={<VideoCameraOutlined />} />,
            <Button
              type="text"
              icon={<ReloadOutlined />}
              onClick={() => handleReschedule(appointment)}
              disabled={
                appointment.appointmentStatus === "completed" ||
                appointment.appointmentStatus === "canceled"
              }
            />,
            <Button type="text" icon={<MoreOutlined />} />,
          ]}
        >
          <List.Item.Meta
            avatar={
              <Avatar size={48} style={{ backgroundColor: "#1890ff" }}>
                {appointment.patientName.charAt(0)}
              </Avatar>
            }
            title={
              <Space direction="vertical" size={0}>
                <Text strong style={{ fontSize: "16px" }}>
                  {appointment.patientName}
                </Text>
                <Space>
                  <CalendarOutlined style={{ color: "#666" }} />
                  <Text type="secondary">
                    {new Date(appointment.appointmentDate).toLocaleDateString()}{" "}
                    {appointment.appointmentTime}
                  </Text>
                </Space>
                <Text type="secondary">
                  {appointment.appointmentType} -{" "}
                  {appointment.appointmentDepartment}
                </Text>
              </Space>
            }
            description={
              <Space direction="vertical" size={4}>
                {getStatusTag(appointment.appointmentStatus)}
                <Text type="secondary">
                  Reason: {appointment.appointmentReason}
                </Text>
                {appointment.appointmentNotes && (
                  <Text type="secondary">
                    Notes: {appointment.appointmentNotes}
                  </Text>
                )}
              </Space>
            }
          />
        </List.Item>
      )}
    />
  );

  const tabItems = [
    {
      key: "1",
      label: `Scheduled (${
        appointments.filter((appt) => appt.appointmentStatus === "scheduled")
          .length
      })`,
      children: renderAppointmentList(
        appointments.filter((appt) => appt.appointmentStatus === "scheduled")
      ),
    },
    {
      key: "2",
      label: `Completed (${
        appointments.filter((appt) => appt.appointmentStatus === "completed")
          .length
      })`,
      children: renderAppointmentList(
        appointments.filter((appt) => appt.appointmentStatus === "completed")
      ),
    },
    {
      key: "3",
      label: `Rescheduled (${
        appointments?.filter((appt) => appt.appointmentStatus === "rescheduled")
          .length
      })`,
      children: renderAppointmentList(
        appointments?.filter((appt) => appt.appointmentStatus === "rescheduled")
      ),
    },
    {
      key: "4",
      label: `Canceled (${
        appointments?.filter((appt) => appt.appointmentStatus === "canceled")
          .length
      })`,
      children: renderAppointmentList(
        appointments?.filter((appt) => appt.appointmentStatus === "canceled")
      ),
    },
  ];

  const getAppointments = async () => {
    try {
      const response = await apiGet(
        "/appointment/getAppointmentsByDoctorID/appointment"
      );
      console.log(response, "response from api");

      console.log(response.data, "data from api1");
      if (response.status === 200) {
        console.log(response.data, "data from api");
        setAppointments(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  };

  useEffect(() => {
    getAppointments();
  }, []);
  console.log(appointments, " ");

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchText(value);
  };

  const [calendarVisible, setCalendarVisible] = useState(false);
  const handleFilterChange = (value) => {
    setFilterStatus(value);
  };

  const columns = [
    {
      title: "Appointment ID",
      dataIndex: "appointmentId",
      key: "appointmentId",
    },
    {
      title: "Patient Name",
      dataIndex: "patientName",
      key: "patientName",
    },
    {
      title: "Department",
      dataIndex: "department",
      key: "department",
    },
    {
      title: "Type",
      dataIndex: "appointmentType",
      key: "appointmentType",
    },
    {
      title: "Status",
      dataIndex: "appointmentStatus",
      key: "appointmentStatus",
      render: (status) => (
        <Tag
          color={
            status === "completed"
              ? "green"
              : status === "canceled"
              ? "red"
              : status === "rescheduled"
              ? "purple"
              : "blue"
          }
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Tag>
      ),
    },
    {
      title: "Date & Time",
      dataIndex: "dateTime",
      key: "dateTime",
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Popover
          content={
            <div>
              <p
                style={{ margin: 0, cursor: "pointer" }}
                onClick={() => handleCompleteAppointment(record.appointmentId)}
              >
                Completed
              </p>
              <p
                style={{ margin: 0, cursor: "pointer" }}
                onClick={() => handleReschedule(record)}
              >
                Reschedule
              </p>
              <p
                style={{ margin: 0, cursor: "pointer", color: "red" }}
                onClick={() => handleCancelAppointment(record.appointmentId)}
              >
                Cancel
              </p>
            </div>
          }
          trigger="click"
          placement="bottomRight"
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Popover>
      ),
    },
  ];

  const filteredAppointments = appointments?.filter(
    (appt) => appt.appointmentStatus === "scheduled" // or other statuses
  );

  console.log(filteredAppointments, "after filteration");
  const tableData = filteredAppointments.map((appt, index) => ({
    key: index,
    appointmentId: appt.appointmentId,
    patientName: appt.patientName,
    department: appt.appointmentDepartment,
    appointmentType: appt.appointmentType,
    appointmentStatus: appt.appointmentStatus,
    dateTime: `${appt.appointmentDate} ${appt.appointmentTime}`,
  }));

  return (
    <div style={{ padding: "24px" }}>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col span={24}>
              <Title level={2} style={{ margin: 0 }}>
                Appointments
              </Title>
              <Text type="secondary">
                View all your schedules and appointments in one place
              </Text>
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} lg={6}>
              <Card className="appointments-card">
                <Statistic
                  title="Total Appointments"
                  value={
                    appointments?.filter(
                      (appt) => appt.appointmentStatus === "completed"
                    ).length
                  }
                  valueRender={(value) => (
                    <div className="statistic-value-row">
                      <span className="statistic-value">{value}</span>
                      <CalendarFilled className="calendar-icon" />
                    </div>
                  )}
                  suffix={
                    <Text type="success" className="statistic-suffix">
                      <ArrowUpOutlined /> +8% from Last month
                    </Text>
                  }
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className="appointments-card , upcomming-card">
                <Statistic
                  title="Upcomming"
                  value={
                    appointments?.filter(
                      (appt) => appt.appointmentStatus === "scheduled"
                    ).length
                  }
                  valueRender={(value) => (
                    <div className="statistic-value-row">
                      <span className="statistic-value">{value}</span>
                      <ClockCircleFilled
                        className="calendar-icon"
                        style={{ color: "#75c34e " }}
                      />
                    </div>
                  )}
                  suffix={
                    <Text type="success" style={{ fontSize: "12px" }}></Text>
                  }
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className="appointments-card, completed-card">
                <Statistic
                  title="Completed"
                  value={
                    appointments?.filter(
                      (appt) => appt.appointmentStatus === "rescheduled"
                    ).length
                  }
                  valueRender={(value) => (
                    <div className="statistic-value-row">
                      <span className="statistic-value">{value}</span>
                      <CheckOutlined className="right-mark-icon" />
                    </div>
                  )}
                  suffix={
                    <Text type="success" style={{ fontSize: "12px" }}></Text>
                  }
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className="appointments-card, cancled-card">
                <Space direction="vertical">
                  <Text type="secondary" style={{ fontSize: "14px" }}>
                    Cancelled
                  </Text>
                  <Text strong style={{ fontSize: "16px" }}>
                    {appointments.find(
                      (appt) => appt.appointmentStatus === "canceled"
                    )?.patientName || "No recent cancellations"}
                  </Text>
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    {appointments.find(
                      (appt) => appt.appointmentStatus === "canceled"
                    )
                      ? new Date(
                          appointments?.find(
                            (appt) => appt.appointmentStatus === "canceled"
                          ).appointmentDate
                        ).toLocaleDateString() +
                        " " +
                        appointments?.find(
                          (appt) => appt.appointmentStatus === "canceled"
                        ).appointmentTime
                      : "N/A"}
                  </Text>
                </Space>
              </Card>
            </Col>
          </Row>

          <Col span={24}>
            <Row gutter={[16, 16]} align="middle" className="filters-row">
              <Col>
                <Input
                  placeholder="Search by Patient ID or Name"
                  prefix={<SearchOutlined />}
                  value={searchText}
                  onChange={handleSearch}
                  style={{ width: screens.xs ? 200 : 300 }}
                />
              </Col>
              <Col xs={24} sm={12} md={4}>
                <Select
                  style={{ width: "100%" }}
                  defaultValue="all"
                  onChange={setFilterStatus}
                >
                  <Option value="all">All clinics</Option>
                  <Option value="paid">b</Option>
                  <Option value="pending">c</Option>
                  <Option value="refunded">d</Option>
                </Select>
              </Col>
              <Col xs={24} sm={12} md={4}>
                <Select
                  style={{ width: "100%" }}
                  defaultValue="all"
                  onChange={setFilterStatus}
                >
                  <Option value="all">All Types</Option>
                  <Option value="paid">b</Option>
                  <Option value="pending">c</Option>
                  <Option value="refunded">d</Option>
                </Select>
              </Col>
              <Col xs={24} sm={12} md={4}>
                <Select
                  style={{ width: "100%" }}
                  defaultValue="all"
                  onChange={setFilterStatus}
                >
                  <Option value="all">All Status</Option>
                  <Option value="paid">b</Option>
                  <Option value="pending">c</Option>
                  <Option value="refunded">d</Option>
                </Select>
              </Col>
              <Col xs={2}>
                <DatePicker
                  open={calendarVisible}
                  onOpenChange={(open) => setCalendarVisible(open)}
                  className="filters-hidden-datepicker"
                  onChange={(date) => console.log("Selected Date:", date)}
                />
                <div
                  className="icon-box"
                  onClick={() => setCalendarVisible(true)}
                >
                  <CalendarOutlined className="calendar-icon" />
                </div>
              </Col>
              <Col xs={2}>
                <CheckOutlined className="filters-icon right-icon" />
              </Col>
            </Row>
            <Card>
              <Tabs
                activeKey={activeKey}
                onChange={setActiveKey}
                type="line"
                size="large"
                items={tabItems}
                tabBarStyle={{
                  marginBottom: "24px",
                  borderBottom: "1px solid #f0f0f0",
                }}
              />
            </Card>
          </Col>
        </Col>
      </Row>

      {/* Updated Reschedule Modal to match reference */}
      <Modal
        title="Reschedule Appointment"
        open={isRescheduleModalVisible}
        onCancel={() => setIsRescheduleModalVisible(false)}
        footer={
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button onClick={() => setIsRescheduleModalVisible(false)}>
              Cancel
            </Button>
            <Button
              style={{ marginLeft: "8px" }}
              type="primary"
              onClick={handleRescheduleSubmit}
            >
              Yes, Reschedule
            </Button>
          </div>
        }
      >
        {selectedAppointment && (
          <div>
            <p>
              Rescheduling appointment for{" "}
              <strong>{selectedAppointment.patientName}</strong>
            </p>
            <p>
              Current date/time:{" "}
              {moment(selectedAppointment.appointmentDate).format("YYYY-MM-DD")}{" "}
              {selectedAppointment.appointmentTime}
            </p>
            <div style={{ margin: "16px 0" }}>
              <DatePicker
                style={{ width: "100%", marginBottom: 16 }}
                value={newDate}
                onChange={setNewDate}
                disabledDate={(current) =>
                  current && current < moment().startOf("day")
                }
              />
              <TimePicker
                style={{ width: "100%" }}
                value={newTime}
                onChange={setNewTime}
                format="HH:mm"
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Appointment;
