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
  PlusOutlined,
  DeleteOutlined,
  EyeOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import moment from "moment";
import "../../../components/stylings/Appointments.css";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;
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

  // Patient Profile Modal States
  const [medicineName, setMedicineName] = useState("");
  const [medicineQuantity, setMedicineQuantity] = useState("");
  const [medicines, setMedicines] = useState([]);
  const [testName, setTestName] = useState("");
  const [tests, setTests] = useState([]);

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
    };
    
    setSelectedPatient(patientData);
    setSelectedAppointment(appointment);
    setIsPatientProfileModalVisible(true);
    
    // Reset medicine and test states
    setMedicines([]);
    setTests([]);
    setMedicineName("");
    setMedicineQuantity("");
    setTestName("");
  };

  const handleAddMedicine = () => {
    if (!medicineName.trim() || !medicineQuantity.trim()) {
      message.error("Please enter both medicine name and quantity");
      return;
    }

    const newMedicine = {
      id: Date.now(),
      name: medicineName,
      quantity: medicineQuantity,
    };

    setMedicines([...medicines, newMedicine]);
    setMedicineName("");
    setMedicineQuantity("");
    message.success("Medicine added successfully");
  };

  const handleRemoveMedicine = (id) => {
    setMedicines(medicines.filter(medicine => medicine.id !== id));
    message.success("Medicine removed successfully");
  };

  const handleAddTest = () => {
    if (!testName.trim()) {
      message.error("Please enter test name");
      return;
    }

    const newTest = {
      id: Date.now(),
      name: testName,
    };

    setTests([...tests, newTest]);
    setTestName("");
    message.success("Test added successfully");
  };

  const handleRemoveTest = (id) => {
    setTests(tests.filter(test => test.id !== id));
    message.success("Test removed successfully");
  };

  const handleSubmitPatientProfile = async () => {
    try {
      const prescriptionData = {
        appointmentId: selectedAppointment.appointmentId,
        patientId: selectedPatient.id,
        medicines: medicines,
        tests: tests,
        notes: "Prescription generated from appointment",
      };

      // You can replace this with your actual API call
      console.log("Prescription data:", prescriptionData);
      
      message.success("Prescription submitted successfully");
      setIsPatientProfileModalVisible(false);
      
      // Reset states
      setMedicines([]);
      setTests([]);
      setSelectedPatient(null);
      setSelectedAppointment(null);
      
    } catch (error) {
      console.error("Error submitting prescription:", error);
      message.error("Failed to submit prescription");
    }
  };

  const medicineColumns = [
    {
      title: "Medicine Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveMedicine(record.id)}
        />
      ),
    },
  ];

  const testColumns = [
    {
      title: "Test Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveTest(record.id)}
        />
      ),
    },
  ];

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
    if (!selectedAppointment || !newDate || !newTime) {
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
  console.log(appointments);

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchText(value);
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
              dataSource={filteredData}
              rowKey="appointmentId"
              pagination={{ pageSize: 5 }}
            />
          </Col>
        </Row>
      </Spin>

      {/* Patient Profile Modal */}
      <Modal
        title="Patient Profile"
        open={isPatientProfileModalVisible}
        onCancel={() => setIsPatientProfileModalVisible(false)}
        width={800}
        footer={[
          <Button key="cancel" onClick={() => setIsPatientProfileModalVisible(false)}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={handleSubmitPatientProfile}>
            Submit
          </Button>,
        ]}
      >
        {selectedPatient && (
          <div style={{ padding: '20px 0' }}>
            {/* Patient Information */}
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{ marginBottom: '20px', color: '#1f2937', fontSize: '18px', fontWeight: '600' }}>
                Patient Information
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <strong>Patient ID:</strong> {selectedPatient.id}
                </div>
                <div>
                  <strong>Name:</strong> {selectedPatient.name}
                </div>
                <div>
                  <strong>Gender:</strong> {selectedPatient.gender}
                </div>
                <div>
                  <strong>Age:</strong> {selectedPatient.age}
                </div>
                <div>
                  <strong>Phone:</strong> {selectedPatient.phone}
                </div>
                <div>
                  <strong>Last Visit:</strong> {selectedPatient.lastVisit}
                </div>
                <div>
                  <strong>Department:</strong> {selectedPatient.department}
                </div>
                <div>
                  <strong>Status:</strong> {selectedPatient.status}
                </div>
              </div>
            </div>

            {/* Add Medicine Section */}
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{ marginBottom: '20px', color: '#1f2937', fontSize: '18px', fontWeight: '600' }}>
                Add Medicine
              </h3>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', alignItems: 'center' }}>
                <Input
                  placeholder="Medicine Name"
                  value={medicineName}
                  onChange={(e) => setMedicineName(e.target.value)}
                  style={{ flex: 1 }}
                />
                <Input
                  placeholder="Quantity"
                  value={medicineQuantity}
                  onChange={(e) => setMedicineQuantity(e.target.value)}
                  style={{ flex: 1 }}
                />
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAddMedicine}>
                  Add
                </Button>
              </div>
              
              {medicines.length > 0 && (
                <Table
                  dataSource={medicines}
                  columns={medicineColumns}
                  rowKey="id"
                  pagination={false}
                  size="small"
                  style={{ marginTop: '16px' }}
                />
              )}
            </div>

            {/* Add Test Section */}
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ marginBottom: '20px', color: '#1f2937', fontSize: '18px', fontWeight: '600' }}>
                Add Test
              </h3>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', alignItems: 'center' }}>
                <Input
                  placeholder="Test Name"
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  style={{ flex: 1 }}
                />
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAddTest}>
                  Add
                </Button>
              </div>
              
              {tests.length > 0 && (
                <Table
                  dataSource={tests}
                  columns={testColumns}
                  rowKey="id"
                  pagination={false}
                  size="small"
                  style={{ marginTop: '16px' }}
                />
              )}
            </div>
          </div>
        )}
      </Modal>

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