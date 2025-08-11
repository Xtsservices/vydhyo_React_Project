import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Button,
  Tag,
  Row,
  Col,
  Statistic,
  Typography,
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
  EyeOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import moment from "moment";
import { apiGet } from "../../api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSelector } from "react-redux";

const { Title, Text } = Typography;
const { Option } = Select;

const EPrescriptionList = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.currentUserData);
  const hasgetAppointments = useRef(false);

  const doctorId = user?.role === "doctor" ? user?.userId : user?.createdBy;

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalAppointmentsCount, setTotalAppointmentsCount] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [filters, setFilters] = useState({
    clinic: "all",
    type: "all",
    status: "all",
    selectedFilterDate: null,
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0,
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

  const handleEPrescription = (appointment) => {
    let age = "N/A";
    const dob = appointment.patientDetails?.dob;
    if (dob) {
      const birthDate = moment(dob, ["YYYY-MM-DD", "DD-MM-YYYY", "MM/DD/YYYY"]);
      if (birthDate.isValid()) {
        age = moment().diff(birthDate, "years");
      }
    }

    const patientData = {
      appointmentId: appointment.appointmentId,
      patientId: appointment.userId || appointment.appointmentId,
      patientName: appointment.patientName,
      gender: appointment.patientDetails?.gender || "N/A",
      age: appointment.patientDetails?.age || age,
      mobileNumber: appointment.patientDetails?.mobile || "N/A",
      appointmentDepartment: appointment.appointmentDepartment,
      appointmentStatus: appointment.appointmentStatus,
      appointmentReason: appointment.appointmentReason || "N/A",
      addressId: appointment.addressId,
      appointmentTime: appointment.appointmentTime,
    };

    navigate("/doctor/doctorPages/EPrescription", { state: { patientData } });
  };

  const handleViewPreviousPrescriptions = async (appointment) => {
    try {
      const patientId = appointment.userId;
      if (!patientId) {
        message.error("Patient ID not found");
        return;
      }

      const response = await apiGet(
        `/pharmacy/getEPrescriptionByPatientId/${patientId}`
      );

      if (response.status === 200 && response.data.success) {
        navigate("/doctor/doctorPages/PreviousPrescriptions", {
          state: {
            prescriptions: response.data.data,
            patientName: appointment.patientName,
          },
        });
      } else {
        toast.error(
          response.data?.message || "Failed to fetch previous prescriptions"
        );
      }
    } catch (error) {
      console.error("Error fetching prescriptions:", error);
      toast.error("Error fetching previous prescriptions");
    }
  };

  const getAppointments = async (page = 1, limit = 5) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        doctorId,
        ...(searchText && { searchText }),
        ...(filters.clinic !== "all" && { clinic: filters.clinic }),
        ...(filters.type !== "all" && { appointmentType: filters.type }),
        ...(filters.status !== "all" && { status: filters.status }),
        ...(filters.selectedFilterDate && {
          date: filters.selectedFilterDate.format("YYYY-MM-DD")
        }),
        page,
        limit,
      });

      const response = await apiGet(
        `/appointment/getAppointmentsByDoctorID/appointment?${queryParams.toString()}`
      );

      if (response.status === 200) {
        const { appointments, pagination } = response.data.data;
        setAppointments(appointments);
        setPagination({
          current: pagination.currentPage,
          pageSize: pagination.pageSize,
          total: pagination.totalItems,
        });
      } else {
        toast.error("Failed to fetch appointments");
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast.error("Error fetching appointments");
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
        const count = response?.data?.data;
        setTotalAppointmentsCount(count.total);
      } else {
        toast.error("Failed to fetch appointments count");
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast.error("Error fetching appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && doctorId && !hasgetAppointments.current) {
      getAppointments();
      getAppointmentsCount();
      hasgetAppointments.current = true;
    }
  }, [user, doctorId]);

  useEffect(() => {
    getAppointments();
  }, [filters]);

  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }));
  };

  const handleDateChange = (date) => {
    setFilters((prev) => ({
      ...prev,
      selectedFilterDate: date,
    }));
  };

  const renderActionMenu = (record) => (
    <Menu>
      <Menu.Item
        key="e-prescription"
        onClick={() => handleEPrescription(record)}
        icon={<EyeOutlined />}
      >
        Digital-Prescription
      </Menu.Item>

      <Menu.Item
        key="view-previous-prescriptions"
        onClick={() => handleViewPreviousPrescriptions(record)}
        icon={<FileTextOutlined />}
      >
        View Previous Prescriptions
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

  return (
    <div style={{ padding: "24px" }}>
      <Spin spinning={loading}>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
              <Col span={24}>
                <Title level={2} style={{ margin: 0 }}>
                  e-Prescriptions
                </Title>
                <Text type="secondary">
                  View and create digital prescriptions for your patients
                </Text>
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
                  <Option value="completed">Completed</Option>
                  <Option value="cancelled">Cancelled</Option>
                </Select>
              </Col>

              <Col xs={24} sm={12} md={4}>
                <input
                  type="date"
                  value={filters.selectedFilterDate ? filters.selectedFilterDate.format("YYYY-MM-DD") : ""}
                  onChange={(e) => {
                    const dateValue = e.target.value;
                    handleDateChange(dateValue ? moment(dateValue, "YYYY-MM-DD") : null);
                  }}
                  max={moment().format("YYYY-MM-DD")}
                  style={{
                    width: "100%",
                    padding: "4px",
                    border: "1px solid #d9d9d9",
                    borderRadius: "4px",
                  }}
                />
              </Col>
            </Row>

            <Table
              columns={columns}
              dataSource={appointments}
              rowKey="appointmentId"
              loading={loading}
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
                showSizeChanger: false,
              }}
              onChange={(pagination) => {
                getAppointments(pagination.current, pagination.pageSize);
              }}
            />
          </Col>
        </Row>
      </Spin>

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

export default EPrescriptionList;