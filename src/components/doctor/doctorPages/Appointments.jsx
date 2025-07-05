import React, { use, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Button,
  Tag,
  Row,
  Col,
  Statistic,
  Typography,
  Modal,
  DatePicker,
  TimePicker,
  message,
  Input,
  Select,
  Table,
  Dropdown,
  Menu,
  Spin,
} from "antd";
import {
  SearchOutlined,
  MoreOutlined,
  CheckOutlined,
  CalendarOutlined,
  UserOutlined,
  CalendarFilled,
  ClockCircleFilled,
  ArrowUpOutlined,
  PlusOutlined,
  DeleteOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import moment from "moment";
import "../../../components/stylings/Appointments.css";
import { apiGet, apiPost } from "../../api";
import PrescriptionForm from "../../Models/PrescriptionForm";

const { Title, Text } = Typography;
const { Option } = Select;

const Appointment = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [appointmentsCount, setAppointmentsCount] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rescheduleLoading, setRescheduleLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  const [isRescheduleModalVisible, setIsRescheduleModalVisible] = useState(false);
  const [isCancelModalVisible, setIsCancelModalVisible] = useState(false);
  const [isPatientProfileModalVisible, setIsPatientProfileModalVisible] = useState(false);
  
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
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

  const handleViewPatientProfile = (appointment) => {
    console.log("appointment========",appointment)
    // Convert appointment data to patient format
    const patientData = {
      id: appointment.patientId || appointment.appointmentId,
      name: appointment.patientName,
      gender: appointment.patientGender || "N/A",
      age: appointment.patientAge || "N/A",
      phone: appointment.patientPhone || "N/A",
      lastVisit: moment(appointment.appointmentDate).format("YYYY-MM-DD"),
      department: appointment.appointmentDepartment,
      status: appointment.appointmentStatus,
      userId: appointment.userId || "N/A",
    };
    
    setSelectedPatient(patientData);
    setSelectedAppointment(appointment);
    setIsPatientProfileModalVisible(true);
    

  };
  const handleReschedule = (appointment) => {
    setSelectedAppointment(appointment);
    setIsRescheduleModalVisible(true);
    setNewDate(moment(appointment.appointmentDate));
    setNewTime(moment(appointment.appointmentTime, "HH:mm"));
  };

  const handleCancelAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setIsCancelModalVisible(true);
  };

  const handleCancelConfirm = async () => {
    if (!selectedAppointment) return;

    setCancelLoading(true);
    try {
      const response = await apiPost("/appointment/cancelAppointment", {
        appointmentId: selectedAppointment.appointmentId,
        reason: "Patient requested cancellation",
      });

      if (response.status === 200) {
        message.success(
          response.data.message || "Appointment cancelled successfully"
        );
        setIsCancelModalVisible(false);
        await getAppointments();
      } else {
        message.error(response.data?.message || "Failed to cancel appointment");
      }
    } catch (error) {
      console.error("Cancellation error:", error);
      message.error(
        error.response?.data?.message ||
        "Failed to cancel appointment. Please try again."
      );
    } finally {
      setCancelLoading(false);
    }
  };

  const handleCompleteAppointment = async (appointmentId) => {
    try {
      const res = await apiPost("/appointment/completeAppointment", {
        appointmentId,
        appointmentNotes: "Appointment completed successfully",
      });

      if (res.status === 200) {
        message.success("Appointment marked as completed");
        await getAppointments();
      } else {
        message.error(res.data?.message || "Failed to complete appointment");
      }
    } catch (err) {
      console.error("Complete error:", err);
      message.error(
        err.response?.data?.message || "Failed to complete appointment"
      );
    }
  };

  const handleRescheduleSubmit = async () => {
    if (!selectedAppointment) {
      message.error("No appointment selected");
      return;
    }

    if (!newDate || !newTime) {
      message.error("Please select both date and time");
      return;
    }

    setRescheduleLoading(true);
    try {
      const response = await apiPost("/appointment/rescheduleAppointment", {
        appointmentId: selectedAppointment.appointmentId,
        newDate: newDate.format("YYYY-MM-DD"),
        newTime: newTime.format("HH:mm"),
        reason: "Patient requested reschedule",
      });
      
      if (response.status == 200) {
        message.success(
          response.data.message || "Appointment rescheduled successfully"
        );
        setIsRescheduleModalVisible(false);
        setNewDate(null);
        setNewTime(null);
        await getAppointments();
        setSelectedAppointment(null);
      } else {
        message.error(
          response.data?.message || "Failed to reschedule appointment"
        );
      }
    } catch (error) {
      console.error("Reschedule error:", error);
      message.error(
        error.response?.data?.message ||
        "Failed to reschedule appointment. Please try again."
      );
    } finally {
      setRescheduleLoading(false);
    }
  };

  const applyFilters = (data) => {
    return data.filter((appointment) => {
      const matchesSearch =
        searchText === "" ||
        appointment.patientName
          .toLowerCase()
          .includes(searchText.toLowerCase()) ||
        appointment.appointmentId.toString().includes(searchText);

      const matchesClinic =
        filters.clinic === "all" ||
        appointment.appointmentDepartment === filters.clinic;

      const matchesType =
        filters.type === "all" || appointment.appointmentType === filters.type;

      const matchesStatus =
        filters.status === "all" ||
        appointment.appointmentStatus === filters.status;

      const matchesDate =
        !filters.date ||
        moment(appointment.appointmentDate).isSame(filters.date, "day");

      return (
        matchesSearch &&
        matchesClinic &&
        matchesType &&
        matchesStatus &&
        matchesDate
      );
    });
  };

  const getAppointments = async () => {
    setLoading(true);
    try {
      const response = await apiGet(
        "/appointment/getAppointmentsByDoctorID/appointment"
      );

      if (response.status === 200) {
        const updatedAppointments = response.data.data;
        setAppointments(updatedAppointments);
        setFilteredData(applyFilters(updatedAppointments));
      } else {
        message.error("Failed to fetch appointments");
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      message.error("Error fetching appointments");
    } finally {
      setLoading(false);
    }
  };

  const getAppointmentsCount = async () => {
    setLoading(true);
    try {
      const response = await apiGet(
        "/appointment/getAppointmentsCountByDoctorID"
      );

      if (response.status === 200) {
        const updatedAppointments = response.data.data;
        setAppointmentsCount(updatedAppointments);
      } else {
        message.error("Failed to fetch appointments");
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      message.error("Error fetching appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAppointments();
    getAppointmentsCount();
  }, []);

  useEffect(() => {
    setFilteredData(applyFilters(appointments));
  }, [searchText, filters, appointments]);

  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }));
  };

  const handleDateChange = (date) => {
    setFilters((prev) => ({
      ...prev,
      date: date,
    }));
  };

  const renderActionMenu = (record) => (
    <Menu>
      <Menu.Item
        key="view-profile"
        onClick={() => handleViewPatientProfile(record)}
        icon={<EyeOutlined />}
      >
        Prescription
      </Menu.Item>
      
      <Menu.Item
        key="complete"
        onClick={() => handleCompleteAppointment(record.appointmentId)}
        disabled={
          record.appointmentStatus === "completed" ||
          record.appointmentStatus === "canceled"
        }
        icon={<CheckOutlined />}
      >
        Mark as Completed
      </Menu.Item>

      <Menu.Item
        key="reschedule"
        onClick={() => handleReschedule(record)}
        disabled={
          record.appointmentStatus === "completed" ||
          record.appointmentStatus === "canceled"
        }
        icon={<CalendarOutlined />}
      >
        Reschedule
      </Menu.Item>
      
      <Menu.Item
        key="cancel"
        onClick={() => handleCancelAppointment(record)}
        disabled={
          record.appointmentStatus === "completed" ||
          record.appointmentStatus === "canceled"
        }
        icon={<UserOutlined />}
        danger
      >
        Cancel
      </Menu.Item>
    </Menu>
  );

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
      dataIndex: "appointmentDepartment",
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
      render: (status) => getStatusTag(status),
    },
    {
      title: "Date & Time",
      key: "dateTime",
      render: (_, record) => (
        <span>
          {moment(record.appointmentDate).format("YYYY-MM-DD")}{" "}
          {record.appointmentTime}
        </span>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => {
        console.log(record,"record===========")
        return(
        <Dropdown overlay={renderActionMenu(record)} trigger={["click"]}>
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
    )}
      ,
    },
  ];

  console.log("filteredData",filteredData)

  return (
    <div style={{ padding: "24px" }}>
      <Spin spinning={loading}>
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
                    value={appointmentsCount.length}
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
                <Card className="appointments-card upcomming-card">
                  <Statistic
                    title="Upcoming"
                    value={
                      appointmentsCount.filter(
                        (appt) => appt.appointmentStatus === "scheduled" || appt.appointmentStatus === "rescheduled"
                      ).length
                    }
                    valueRender={(value) => (
                      <div className="statistic-value-row">
                        <span className="statistic-value">{value}</span>
                        <ClockCircleFilled
                          className="calendar-icon"
                          style={{ color: "#75c34e" }}
                        />
                      </div>
                    )}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card className="appointments-card completed-card">
                  <Statistic
                    title="Completed"
                    value={
                      appointmentsCount.filter(
                        (appt) => appt.appointmentStatus === "completed"
                      ).length
                    }
                    valueRender={(value) => (
                      <div className="statistic-value-row">
                        <span className="statistic-value">{value}</span>
                        <CheckOutlined className="right-mark-icon" />
                      </div>
                    )}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card className="appointments-card cancled-card">
                  <Statistic
                    title="Cancelled"
                    value={
                      appointmentsCount.filter(
                        (appt) => appt.appointmentStatus === "canceled"
                      ).length
                    }
                    valueRender={(value) => (
                      <div className="statistic-value-row">
                        <span className="statistic-value">{value}</span>
                        <Tag color="red" style={{ marginLeft: 8 }}>
                          Cancelled
                        </Tag>
                      </div>
                    )}
                  />
                </Card>
              </Col>
            </Row>

            <Row gutter={[16, 16]} align="middle" className="filters-row">
              <Col>
                <Input
                  placeholder="Search by Patient Name or ID"
                  prefix={<SearchOutlined />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="filters-input"
                />
              </Col>

              <Col xs={24} sm={12} md={4}>
                <Select
                  className="filters-select"
                  value={filters.clinic}
                  onChange={(value) => handleFilterChange("clinic", value)}
                >
                  <Option value="all">All clinics</Option>
                  <Option value="Cardiology">Cardiology</Option>
                  <Option value="Neurology">Neurology</Option>
                  <Option value="Orthopedics">Orthopedics</Option>
                </Select>
              </Col>

              <Col xs={24} sm={12} md={4}>
                <Select
                  className="filters-select"
                  value={filters.type}
                  onChange={(value) => handleFilterChange("type", value)}
                >
                  <Option value="all">All Types</Option>
                  <Option value="Consultation">Consultation</Option>
                  <Option value="Follow-up">Follow-up</Option>
                  <Option value="Emergency">Emergency</Option>
                </Select>
              </Col>

              <Col xs={24} sm={12} md={4}>
                <Select
                  className="filters-select"
                  value={filters.status}
                  onChange={(value) => handleFilterChange("status", value)}
                >
                  <Option value="all">All Status</Option>
                  <Option value="scheduled">Scheduled</Option>
                  <Option value="completed">Completed</Option>
                  <Option value="rescheduled">Rescheduled</Option>
                  <Option value="canceled">Canceled</Option>
                </Select>
              </Col>

              <Col>
                <DatePicker
                  onChange={handleDateChange}
                  value={filters.date}
                  allowClear
                  placeholder="Filter by date"
                />
              </Col>
            </Row>

            <Table
              columns={columns}
              dataSource={filteredData}
              rowKey="appointmentId"
              pagination={{ pageSize: 5 }}
            />
          </Col>
        </Row>
      </Spin>

      {/* Patient Profile Modal */}
      
{isPatientProfileModalVisible && (

  <PrescriptionForm 
  selectedPatient={selectedPatient}
  isVisible={isPatientProfileModalVisible}
  onClose={() => setIsPatientProfileModalVisible(false)}
  />
)}

      {/* Reschedule Modal */}
      <Modal
        title="Reschedule Appointment"
        visible={isRescheduleModalVisible}
        onOk={handleRescheduleSubmit}
        onCancel={() => {
          setIsRescheduleModalVisible(false);
          setNewDate(null);
          setNewTime(null);
        }}
        okText="Reschedule"
        cancelText="Cancel"
        confirmLoading={rescheduleLoading}
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
                onChange={(date) => setNewDate(date)}
                disabledDate={(current) =>
                  current && current < moment().startOf("day")
                }
              />
              <TimePicker
                style={{ width: "100%" }}
                value={newTime}
                onChange={(time) => setNewTime(time)}
                format="HH:mm"
              />
            </div>
          </div>
        )}
      </Modal>

      {/* Cancel Modal */}
      <Modal
        title="Cancel Appointment"
        visible={isCancelModalVisible}
        onOk={handleCancelConfirm}
        onCancel={() => setIsCancelModalVisible(false)}
        okText="Confirm Cancel"
        cancelText="Close"
        okButtonProps={{ danger: true }}
        confirmLoading={cancelLoading}
      >
        {selectedAppointment && (
          <div>
            <p>
              Are you sure you want to cancel the appointment for{" "}
              <strong>{selectedAppointment.patientName}</strong>?
            </p>
            <p>
              Appointment Date:{" "}
              {moment(selectedAppointment.appointmentDate).format("YYYY-MM-DD")}{" "}
              {selectedAppointment.appointmentTime}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Appointment;