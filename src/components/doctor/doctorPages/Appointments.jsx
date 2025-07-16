import React, { use, useEffect, useState,useCallback, } from "react";
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
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSelector } from "react-redux";

const { Title, Text } = Typography;
const { Option } = Select;

const Appointment = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.currentUserData);

  const doctorId = user?.role === "doctor" ? user?.userId : user?.createdBy;

  const [appointmentsCount, setAppointmentsCount] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rescheduleLoading, setRescheduleLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  const [isRescheduleModalVisible, setIsRescheduleModalVisible] = useState(false);
  const [isCancelModalVisible, setIsCancelModalVisible] = useState(false);
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
  const [selectedDate, setSelectedDate] = useState(null);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);

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

  const handleEPrescription = (appointment) => {
    console.log("appointment===",appointment.patientDetails?.age)
    // Calculate age from dob if available
    let age = "N/A";
    const dob = appointment.patientDetails?.dob;
    if (dob) {
      const birthDate = moment(dob, ["YYYY-MM-DD", "DD-MM-YYYY", "MM/DD/YYYY"]);
      if (birthDate.isValid()) {
        age = moment().diff(birthDate, "years");
      }
    }


    const patientData = {
      appointmentId:appointment.appointmentId,
      patientId: appointment.userId || appointment.appointmentId,
      patientName: appointment.patientName,
      gender: appointment.patientDetails?.gender || "N/A",
      age:  appointment.patientDetails?.age || "N/A",
      mobileNumber: appointment.patientDetails?.mobile || "N/A",
      appointmentId: appointment.appointmentId,
      appointmentDate: moment(appointment.appointmentDate).format("YYYY-MM-DD"),
      appointmentDepartment: appointment.appointmentDepartment,
      appointmentStatus: appointment.appointmentStatus,
      appointmentReason: appointment.appointmentReason || "N/A",
      addressId: appointment.addressId,
      appointmentTime:appointment.appointmentTime,
    };

    console.log("patientData",patientData)

    // Navigate to E-Prescription page with patient data
    navigate("/doctor/doctorPages/EPrescription", { state: { patientData } });
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
        toast.success(
          response.data.message || "Appointment cancelled successfully"
        );
        setIsCancelModalVisible(false);
        await getAppointments();
      } else {
        message.error(response.data?.message || "Failed to cancel appointment");
        toast.error(response.data?.message || "Failed to cancel appointment");
      }
    } catch (error) {
      console.error("Cancellation error:", error);
      const errorMsg =
        error.response?.data?.message ||
        "Failed to cancel appointment. Please try again.";
      message.error(errorMsg);
      toast.error(errorMsg);
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
        toast.success("Appointment marked as completed");
        await getAppointments();
      } else {
        message.error(res.data?.message || "Failed to complete appointment");
        toast.error(res.data?.message || "Failed to complete appointment");
      }
    } catch (err) {
      console.error("Complete error:", err);
      const errorMsg =
        err.response?.data?.message || "Failed to complete appointment";
      message.error(errorMsg);
      toast.error(errorMsg);
    }
  };

  const handleRescheduleSubmit = async () => {

    console.log("Selected Appointment:", selectedAppointment);
    console.log("New Date:", newDate);
    console.log("New Time:", newTime);
    if (!selectedAppointment) {
      message.error("No appointment selected");
      toast.error("No appointment selected");
      return;
    }

    if (!newDate || !newTime) {
      message.error("Please select both date and time");
      toast.error("Please select both date and time");
      return;
    }

    setRescheduleLoading(true);
    try {
      const response = await apiPost("/appointment/rescheduleAppointment", {
        appointmentId: selectedAppointment.appointmentId,
        newDate: newDate.format("YYYY-MM-DD"),
        newTime: newTime,
        reason: "Patient requested reschedule",
      });

      console.log(response, "response from reschedule API");
      if (response.status == 200) {
        message.success(
          response.data.message || "Appointment rescheduled successfully"
        );
        toast.success(
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
        toast.error(
          response.data?.message || "Failed to reschedule appointment"
        );
      }
    } catch (error) {
      console.error("Reschedule error:", error);
      const errorMsg =
        error.response?.data?.message ||
        "Failed to reschedule appointment. Please try again.";
      message.error(errorMsg);
      toast.error(errorMsg);
    } finally {
      setRescheduleLoading(false);
    }
  };

  const applyFilters = (data) => {

    return data.filter((appointment) => {
      const matchesSearch =
        searchText === "" ||
        (appointment.patientName &&
          appointment.patientName
            .toLowerCase()
            .includes(searchText.toLowerCase())) ||
        (appointment.appointmentId &&
          appointment.appointmentId
            .toString()
            .toLowerCase()
            .includes(searchText.toLowerCase()));

      const matchesClinic =
        filters.clinic === "all" ||
        appointment.appointmentDepartment === filters.clinic;

      const matchesType =
        filters.type === "all" || appointment.appointmentType === filters.type;

      const matchesStatus =
        filters.status === "all" ||
        appointment.appointmentStatus === filters.status;
console.log(filters.date, "selectedDate")
     const matchesDate =
  !filters.date ||
  moment(appointment.appointmentDate).format("YYYY-MM-DD") ===
    filters.date.format("YYYY-MM-DD");

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
        `/appointment/getAppointmentsByDoctorID/appointment?doctorId=${doctorId}`
      );

      console.log("Response from getAppointments:", response);

      if (response.status === 200) {
         const updatedAppointments = response.data.data;

  const sortedAppointments = updatedAppointments.sort((a, b) => {
    // First, compare by appointmentDate (latest date first)
    const dateA = moment(a.appointmentDate, "YYYY-MM-DD");
    const dateB = moment(b.appointmentDate, "YYYY-MM-DD");

    if (dateA.isBefore(dateB)) return 1;
    if (dateA.isAfter(dateB)) return -1;

    // If same date, then compare by appointmentId (highest first)
    const idA = parseInt(a.appointmentId.replace("VYDAPMT", ""), 10);
    const idB = parseInt(b.appointmentId.replace("VYDAPMT", ""), 10);
    return idB - idA;
  });

        setAppointments(sortedAppointments);
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
        `/appointment/getAppointmentsCountByDoctorID?doctorId=${doctorId}`
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
    if (user && doctorId) {
      getAppointments();
      getAppointmentsCount();
    }
  }, [user, doctorId]);

  useEffect(() => {
    setFilteredData(applyFilters(appointments));
  }, [searchText, filters, appointments, ]);

  const timeslots = async (date) => {
     console.log("Selected Date:", date);
     console.log(selectedAppointment, "selectedAppointment");
    const selectedDate = date
    const clinicId =selectedAppointment?.addressId
;
    const currentUserID = selectedAppointment?.doctorId || selectedAppointment?.createdBy;
   
    try {
        const response = await apiGet(
              `/appointment/getSlotsByDoctorIdAndDate?doctorId=${currentUserID}&date=${selectedDate}&addressId=${clinicId}`
            );
            const data = response.data;
            if (data.status === "success"){
              setAvailableTimeSlots(data?.data?.slots)
            }else{
              toast.error(data?.message?.message || "Failed to fetch timeslots");
            }

      
            console.log("Time Slots Response:=============",   data );
    } catch (error) {
      toast.error(error?.response?.data?.message?.message || "Error fetching timeslots");
    }
  };

  useEffect(() => {
    if (selectedDate) {
      timeslots(selectedDate.format("YYYY-MM-DD"));
    }
    
  }, [selectedDate]);


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
     {user?.role === "doctor" && (
    <Menu.Item
      key="e-prescription"
      onClick={() => handleEPrescription(record)}
      disabled={
        record.appointmentStatus === "completed" ||
        record.appointmentStatus === "cancelled"
      }
      icon={<EyeOutlined />}
    >
      Digital-Prescription
    </Menu.Item>
  )}


      <Menu.Item
        key="complete"
        onClick={() => handleCompleteAppointment(record.appointmentId)}
        disabled={
          record.appointmentStatus === "completed" ||
          record.appointmentStatus === "cancelled"
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
          record.appointmentStatus === "cancelled"
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
          record.appointmentStatus === "cancelled"
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
      render: (_, record) => (
        <Dropdown overlay={renderActionMenu(record)} trigger={["click"]}>
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

    const handleInputChange = useCallback(( value) => {
      console.log("Input Change:", value);
      setNewTime(value);
    }, []);

  console.log(selectedAppointment, "selectedAppointment");

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
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card className="appointments-card upcomming-card">
                  <Statistic
                    title="Upcoming"
                    value={
                      appointments.filter(
                        (appt) =>
                          appt.appointmentStatus === "scheduled" ||
                          appt.appointmentStatus === "rescheduled"
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
                      appointments.filter(
                        (appt) => appt.appointmentStatus === "cancelled"
                      ).length
                    }
                    valueRender={(value) => (
                      <div className="statistic-value-row">
                        <span className="statistic-value">{value}</span>
                        <span
                          style={{
                            marginLeft: 8,
                            color: "#ff4d4f",
                            fontSize: 20,
                          }}
                        >
                          X
                        </span>
                      </div>
                    )}
                  />
                </Card>
              </Col>
            </Row>

            <Row gutter={[16, 16]} align="middle" className="filters-row">
              <Col>
                <Input
                  placeholder="Search by Patient Name or Appointment ID or email or mobile"
                  prefix={<SearchOutlined />}
                  value={searchText.toUpperCase()}
                   onChange={(e) => setSearchText(e.target.value.toLowerCase())}
                  className="filters-input"
                  
                />
              </Col>

              <Col xs={24} sm={12} md={4}>
                <Select
                  className="filters-select"
                  value={filters.clinic}
                  onChange={(value) => handleFilterChange("clinic", value)}
                >
                  <Option value="all">All Departments</Option>
                  <Option value="cardiology">Cardiology</Option>
                  <Option value="neurology">Neurology</Option>
                  <Option value="orthopedics">Orthopedics</Option>
                  <Option value="General Physician">General Physician</Option>
                </Select>
              </Col>

              <Col xs={24} sm={12} md={4}>
                <Select
                  className="filters-select"
                  value={filters.type}
                  onChange={(value) => handleFilterChange("type", value)}
                >
                  <Option value="all">All Types</Option>
                  <Option value="new-walkin">New Walkin</Option>
                  <Option value="new-homecare">New HomeCare</Option>
                  <Option value="followup-walkin">Followup Walkin</Option>
                  <Option value="followup-video">Followup Video</Option>
                  <Option value="followup-homecare">Followup Homecare</Option>
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
                  {/* <Option value="rescheduled">Rescheduled</Option> */}
                  <Option value="cancelled">Cancelled</Option>
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
                value={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                disabledDate={(current) =>
                  current && current < moment().startOf("day")
                }
              />

              <Select
                          value={newTime}
                          onChange={(value) => handleInputChange( value)}
                          placeholder="Select time slot"
                          // disabled={!patientCreated && !userFound}
                          style={{ width: "100%", marginTop: 8 }}
                        >
{availableTimeSlots?.map((slot) => (
  <Option key={slot._id} value={slot.time}>
    {slot.time}
  </Option>
))}
                        </Select>
              {/* <TimePicker
                style={{ width: "100%" }}
                value={newTime}
                onChange={(time) => setNewTime(time)}
                format="HH:mm"
              /> */}
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

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default Appointment;