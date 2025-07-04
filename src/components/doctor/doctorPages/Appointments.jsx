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

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;
const Appointment = () => {
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const [activeKey, setActiveKey] = useState("1");
  const [appointments, setAppointments] = useState({
    totalAppointmentsCount: 0,
    totalAppointments: [],
  });
  const [isRescheduleModalVisible, setIsRescheduleModalVisible] =
    useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [newDate, setNewDate] = useState(null);
  const [newTime, setNewTime] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

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
      const storedAppointments = JSON.parse(
        localStorage.getItem("appointments") ||
          '{"totalAppointmentsCount": 0, "totalAppointments": []}'
      );

      const updatedAppointments = storedAppointments.totalAppointments.map(
        (appt) =>
          appt.appointmentId === selectedAppointment.appointmentId
            ? {
                ...appt,
                appointmentDate: newDate.format("YYYY-MM-DD"),
                appointmentTime: newTime.format("HH:mm"),
                appointmentStatus: "rescheduled",
                updatedAt: new Date().toISOString(),
              }
            : appt
      );

      updatedAppointments.sort((a, b) => {
        const updatedA = a.updatedAt
          ? new Date(a.updatedAt).getTime()
          : new Date(`${a.appointmentDate}T${a.appointmentTime}`).getTime();
        const updatedB = b.updatedAt
          ? new Date(b.updatedAt).getTime()
          : new Date(`${b.appointmentDate}T${b.appointmentTime}`).getTime();
        return updatedB - updatedA;
      });

      const updatedData = {
        totalAppointmentsCount: updatedAppointments.length,
        totalAppointments: updatedAppointments,
      };

      localStorage.setItem("appointments", JSON.stringify(updatedData));
      setAppointments(updatedData);

      message.success("Appointment rescheduled successfully");
      setIsRescheduleModalVisible(false);
      setNewDate(null);
      setNewTime(null);
      setSelectedAppointment(null);
    } catch (error) {
      console.error("Error rescheduling appointment:", error);
      message.error("Failed to reschedule appointment");
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
        appointments.totalAppointments.filter(
          (appt) => appt.appointmentStatus === "scheduled"
        ).length
      })`,
      children: renderAppointmentList(
        appointments.totalAppointments.filter(
          (appt) => appt.appointmentStatus === "scheduled"
        )
      ),
    },
    {
      key: "2",
      label: `Completed (${
        appointments.totalAppointments.filter(
          (appt) => appt.appointmentStatus === "completed"
        ).length
      })`,
      children: renderAppointmentList(
        appointments.totalAppointments.filter(
          (appt) => appt.appointmentStatus === "completed"
        )
      ),
    },
    {
      key: "3",
      label: `Rescheduled (${
        appointments.totalAppointments.filter(
          (appt) => appt.appointmentStatus === "rescheduled"
        ).length
      })`,
      children: renderAppointmentList(
        appointments.totalAppointments.filter(
          (appt) => appt.appointmentStatus === "rescheduled"
        )
      ),
    },
    {
      key: "4",
      label: `Canceled (${
        appointments.totalAppointments.filter(
          (appt) => appt.appointmentStatus === "canceled"
        ).length
      })`,
      children: renderAppointmentList(
        appointments.totalAppointments.filter(
          (appt) => appt.appointmentStatus === "canceled"
        )
      ),
    },
  ];

  const API_BASE_URL = "http://192.168.1.44:3000";
  const getAppointments = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(
        `${API_BASE_URL}/appointment/getAllAppointments`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("appointments", JSON.stringify(data?.data));
        setAppointments(data?.data);
      } else {
        const storedAppointments = JSON.parse(
          localStorage.getItem("appointments") ||
            '{"totalAppointmentsCount": 1, "totalAppointments": [{"_id":"685bddbe34896a635716991f","appointmentId":"VYDAPMT1","userId":"VYDUSER1","doctorId":"685bcfdf29ad88ba7165ebaa","patientName":"Rani","doctorName":"Varun","appointmentType":"home-visit","appointmentDepartment":"General Physician","appointmentDate":"2025-07-01","appointmentTime":"08:15","appointmentReason":"Feeling not good with body pains","appointmentStatus":"scheduled","appointmentNotes":"Patient prefers early morning visits","createdBy":"VYDUSER16","updatedBy":"VYDUSER16","createdAt":"2025-06-25T11:30:06.991Z","updatedAt":"2025-06-25T11:30:06.991Z","__v":0}]}'
        );
        setAppointments(storedAppointments);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      const storedAppointments = JSON.parse(
        localStorage.getItem("appointments") ||
          '{"totalAppointmentsCount": 1, "totalAppointments": [{"_id":"685bddbe34896a635716991f","appointmentId":"VYDAPMT1","userId":"VYDUSER1","doctorId":"685bcfdf29ad88ba7165ebaa","patientName":"Rani","doctorName":"Varun","appointmentType":"home-visit","appointmentDepartment":"General Physician","appointmentDate":"2025-07-01","appointmentTime":"08:15","appointmentReason":"Feeling not good with body pains","appointmentStatus":"scheduled","appointmentNotes":"Patient prefers early morning visits","createdBy":"VYDUSER16","updatedBy":"VYDUSER16","createdAt":"2025-06-25T11:30:06.991Z","updatedAt":"2025-06-25T11:30:06.991Z","__v":0}]}'
      );
      setAppointments(storedAppointments);  
    }
  };

  useEffect(() => {
    getAppointments();
  }, []);
  console.log(appointments);

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
      title: "Patient ID",
      dataIndex: "patientId",
      key: "patientId",
    },
    {
      title: "Patient Name",
      dataIndex: "fullName",
      key: "fullName",
    },
    {
      title: "Clinic Name",
      dataIndex: "clinicName",
      key: "clinicName",
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
      render: (text) => (
        <Tag
          color={
            text === "completed"
              ? "green"
              : text === "cancelled"
              ? "red"
              : "blue"
          }
        >
          {text.charAt(0).toUpperCase() + text.slice(1)}
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
              <p style={{ margin: 0, cursor: "pointer" }}>Completed</p>
              <p style={{ margin: 0, cursor: "pointer" }}>Reschedule</p>
              <p style={{ margin: 0, cursor: "pointer" }}>Cancel</p>
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

  const filteredAppointments = appointments.totalAppointments.filter(
    (appt) => appt.appointmentStatus === "scheduled" // or other statuses
  );

  console.log(filteredAppointments, "after filteration");

  const tableData = filteredAppointments.map((appt, index) => ({
    key: index,
    patientId: appt.patientId,
    fullName: appt.fullName,
    clinicName: appt.clinicName,
    appointmentType: appt.appointmentType,
    appointmentStatus: appt.appointmentStatus,
    dateTime: appt.dateTime, // e.g., "2025-07-01 10:00 AM"
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
                    appointments.totalAppointments.filter(
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
                    appointments.totalAppointments.filter(
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
                    appointments.totalAppointments.filter(
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
                    {appointments.totalAppointments.find(
                      (appt) => appt.appointmentStatus === "canceled"
                    )?.patientName || "No recent cancellations"}
                  </Text>
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    {appointments.totalAppointments.find(
                      (appt) => appt.appointmentStatus === "canceled"
                    )
                      ? new Date(
                          appointments.totalAppointments.find(
                            (appt) => appt.appointmentStatus === "canceled"
                          ).appointmentDate
                        ).toLocaleDateString() +
                        " " +
                        appointments.totalAppointments.find(
                          (appt) => appt.appointmentStatus === "canceled"
                        ).appointmentTime
                      : "N/A"}
                  </Text>
                </Space>
              </Card>
            </Col>
          </Row>

          <Col span={24}>
            {/* <Row gutter={[16, 16]} align="middle" style={{ marginBottom: 24 }}>
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
          </Row> */}

            <Row gutter={[16, 16]} align="middle" className="filters-row">
              {/* Search Input */}
              <Col>
                <Input
                  placeholder="Search by Patient ID or Name"
                  prefix={<SearchOutlined />}
                  value={searchText}
                  onChange={handleSearch}
                  className="filters-input"
                />
              </Col>

              {/* Select Filters */}
              <Col xs={24} sm={12} md={4}>
                <Select
                  className="filters-select"
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
                  className="filters-select"
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
                  className="filters-select"
                  defaultValue="all"
                  onChange={setFilterStatus}
                >
                  <Option value="all">All Status</Option>
                  <Option value="paid">b</Option>
                  <Option value="pending">c</Option>
                  <Option value="refunded">d</Option>
                </Select>
              </Col>

              {/* Calendar Icon Trigger */}
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

              {/* Right Mark Icon */}
              <Col xs={2}>
                <CheckOutlined className="filters-icon right-icon" />
              </Col>
            </Row>
            {/* <Card>
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
            </Card> */}
          </Col>
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={tableData}
        pagination={{ pageSize: 5 }}
        scroll={{ x: screens.xs ? 1000 : undefined }}
      />
    </div>
  );
};

export default Appointment;
