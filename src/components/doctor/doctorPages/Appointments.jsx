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
} from "antd";
import {
  PhoneOutlined,
  VideoCameraOutlined,
  MoreOutlined,
  UserOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  ArrowUpOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import moment from "moment";

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

  const API_BASE_URL = "http://216.10.251.239:3000";
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

  return (
    <div style={{ padding: "24px" }}>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Row justify="end" style={{ marginBottom: 16 }}>
            <Col>
              <Radio.Group
                optionType="button"
                buttonStyle="solid"
                defaultValue="online"
                size={screens.xs ? "small" : "middle"}
              >
                <Radio.Button value="online">Online</Radio.Button>
                <Radio.Button value="walk-in">Walk-in</Radio.Button>
                <Radio.Button value="home-services">Home-services</Radio.Button>
              </Radio.Group>
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col span={24}>
              <Title level={2} style={{ margin: 0 }}>
                Appointments
              </Title>
              <Text type="secondary">Manage your patient appointments</Text>
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Completed Appointments"
                  value={
                    appointments.totalAppointments.filter(
                      (appt) => appt.appointmentStatus === "completed"
                    ).length
                  }
                  valueStyle={{ color: "#1890ff" }}
                  prefix={<UserOutlined />}
                  suffix={
                    <Text type="success" style={{ fontSize: "12px" }}>
                      <ArrowUpOutlined /> +4% From Last Week
                    </Text>
                  }
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Scheduled Appointments"
                  value={
                    appointments.totalAppointments.filter(
                      (appt) => appt.appointmentStatus === "scheduled"
                    ).length
                  }
                  valueStyle={{ color: "#52c41a" }}
                  prefix={<UserOutlined />}
                  suffix={
                    <Text type="success" style={{ fontSize: "12px" }}>
                      <ArrowUpOutlined /> +8% From Yesterday
                    </Text>
                  }
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Rescheduled Appointments"
                  value={
                    appointments.totalAppointments.filter(
                      (appt) => appt.appointmentStatus === "rescheduled"
                    ).length
                  }
                  valueStyle={{ color: "#fa8c16" }}
                  prefix={<CalendarOutlined />}
                  suffix={
                    <Text type="success" style={{ fontSize: "12px" }}>
                      <ArrowUpOutlined /> +2% From Yesterday
                    </Text>
                  }
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Space direction="vertical">
                  <Text type="secondary" style={{ fontSize: "14px" }}>
                    Cancelled Appointments
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

      <Modal
        title="Reschedule Appointment"
        open={isRescheduleModalVisible}
        onOk={handleRescheduleSubmit}
        onCancel={() => {
          setIsRescheduleModalVisible(false);
          setNewDate(null);
          setNewTime(null);
          setSelectedAppointment(null);
        }}
        okText="Reschedule"
        cancelText="Cancel"
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          <Text>Select new date:</Text>
          <DatePicker
            style={{ width: "100%" }}
            onChange={(date) => setNewDate(date ? moment(date.toDate()) : null)}
            disabledDate={(current) =>
              current && current < moment().startOf("day")
            }
          />
          <Text style={{ marginTop: 16 }}>Select new time:</Text>
          <TimePicker
            style={{ width: "100%" }}
            format="HH:mm"
            onChange={(time) => setNewTime(time ? moment(time.toDate()) : null)}
          />
        </Space>
      </Modal>
    </div>
  );
};

export default Appointment;
