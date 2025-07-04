import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import {
  Table,
  Button,
  Tag,
  Space,
  Avatar,
  Modal,
  Spin,
  message,
  Card,
  Typography,
  Tooltip,
  Row,
  Col,
  Input,
  DatePicker,
  Select,
} from "antd";
import {
  EyeOutlined,
  UserOutlined,
  ReloadOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  CheckCircleOutlined,
  SearchOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import moment from "moment";

const { Title, Text } = Typography;
const { Option } = Select;

// Constants
const API_BASE_URL = "http://192.168.1.44:3000";
const DEFAULT_PAGE_SIZE = 10;

// Custom hooks
const useLocalStorage = (key) => {
  return localStorage.getItem(key);
};

const DoctorOnboardingDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // State management
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { userId, doctorId } = location.state || {};

  // Fetch doctors from API
  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    try {
      const token = useLocalStorage("accessToken");
      if (!token) {
        message.error("No authentication token found. Please login again.");
        navigate("/login");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/users/AllUsers?type=doctor`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          message.error("Session expired. Please login again.");
          navigate("/login");
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      let doctorsData = [];

      if (data.status === "success" && data.data) {
        doctorsData = Array.isArray(data.data) ? data.data : [data.data];
      } else if (Array.isArray(data)) {
        doctorsData = data;
      } else {
        doctorsData = data.data || [];
      }

      // Normalize doctor data
      doctorsData = doctorsData.map((doctor) => ({
        ...doctor,
        key: doctor._id,
        firstname: doctor.firstname || "N/A",
        lastname: doctor.lastname || "",
        specialization: doctor.specialization || {},
        email: doctor.email || "N/A",
        mobile: doctor.mobile || "N/A",
        status: doctor.status || "pending",
        medicalRegistrationNumber: doctor.medicalRegistrationNumber || "N/A",
        userId: doctor.userId || "N/A",
        createdAt: doctor.createdAt,
        consultationModeFee: doctor.consultationModeFee || [],
        spokenLanguage: doctor.spokenLanguage || [],
        gender: doctor.gender || "N/A",
        DOB: doctor.DOB || "N/A",
        bloodgroup: doctor.bloodgroup || "N/A",
        maritalStatus: doctor.maritalStatus || "N/A",
      }));

      setDoctors(doctorsData);
    } catch (error) {
      console.error("Error fetching doctors:", error);
      message.error("Failed to fetch doctors data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // Fetch doctors on component mount
  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const pending = doctors.filter((doc) => doc.status?.toLowerCase() === "pending").length;
    const rejected = doctors.filter((doc) => doc.status?.toLowerCase() === "rejected").length;
    const approved = doctors.filter(
      (doc) => doc.status?.toLowerCase() === "approved" || doc.status?.toLowerCase() === "active"
    ).length;

    return { pending, rejected, approved };
  }, [doctors]);

  // Filter doctors based on search and status
  const filteredDoctors = useMemo(() => {
    return doctors.filter((doctor) => {
      const matchesSearch = 
        doctor.firstname?.toLowerCase().includes(searchText.toLowerCase()) ||
        doctor.lastname?.toLowerCase().includes(searchText.toLowerCase()) ||
        doctor.email?.toLowerCase().includes(searchText.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || doctor.status?.toLowerCase() === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [doctors, searchText, statusFilter]);

  // Utility functions
  const getImageSrc = useCallback((profilepic) => {
    if (profilepic?.data && profilepic?.mimeType) {
      return `data:${profilepic.mimeType};base64,${profilepic.data}`;
    }
    return null;
  }, []);

  const showImageModal = useCallback((imageSrc) => {
    setSelectedImage(imageSrc);
    setImageModalVisible(true);
  }, []);

  const handleViewProfile = (userId, doctorId) => {
    navigate('/SuperAdmin/profileView', { state: { userId, doctorId } });
  };

  const handleRefresh = useCallback(() => {
    setCurrentPage(1);
    fetchDoctors();
  }, [fetchDoctors]);

  const formatDate = useCallback((dateString) => {
    if (!dateString) return "N/A";
    try {
      return moment(dateString).format("DD-MM-YYYY");
    } catch {
      return dateString;
    }
  }, []);

  // Table columns configuration
  const columns = useMemo(
    () => [
      {
        title: "#",
        key: "index",
        width: 50,
        render: (_, __, index) => (currentPage - 1) * pageSize + index + 1,
      },
      {
        title: "Doctor",
        key: "doctor",
        width: 250,
        render: (_, record) => {
          const imageSrc = getImageSrc(record.profilepic);
          const fullName = `${record.firstname || "N/A"} ${record.lastname || ""}`.trim();

          return (
            <Space size={12}>
              <Avatar
                size={40}
                src={imageSrc}
                style={{
                  flexShrink: 0,
                  borderRadius: "50%",
                }}
              >
                {!imageSrc &&
                  (fullName === "N/A"
                    ? <UserOutlined />
                    : `${record.firstname?.[0] ?? ""}${record.lastname?.[0] ?? ""}`)}
              </Avatar>
              <div>
                <Text strong style={{ display: "block", fontSize: "14px" }}>
                  Dr. {fullName}
                </Text>
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  {record.email}
                </Text>
              </div>
            </Space>
          );
        },
      },
      {
        title: "Contact",
        dataIndex: "mobile",
        key: "mobile",
        width: 120,
        render: (text) => <Text>{text}</Text>,
      },
      {
        title: "Specialty",
        key: "specialty",
        width: 150,
        render: (_, record) => {
          const specName = record.specialization?.name || "Not specified";
          const specColor = {
            Dermatology: "pink",
            Orthopedics: "blue",
            Pediatrics: "green",
            Cardiology: "red",
            Gynecology: "purple",
          };

          return (
            <Tag color={specColor[specName] || "default"} style={{ borderRadius: "12px" }}>
              {specName}
            </Tag>
          );
        },
      },
      {
        title: "Experience",
        key: "experience",
        width: 100,
        render: (_, record) => {
          const experience = record.specialization?.experience || 0;
          return <Text>{experience} yr</Text>;
        },
      },
      // {
      //   title: "Location",
      //   key: "location",
      //   width: 120,
      //   render: () => <Text>-</Text>,
      // },
      {
        title: "Request Date",
        dataIndex: "createdAt",
        key: "createdAt",
        width: 120,
        render: (date) => <Text>{formatDate(date)}</Text>,
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        width: 100,
        render: (status) => {
          const statusConfig = {
            pending: { color: "orange", icon: "🟡" },
            approved: { color: "green", icon: "✅" },
            active: { color: "green", icon: "✅" },
            rejected: { color: "red", icon: "❌" },
          };

          const config = statusConfig[status?.toLowerCase()] || { color: "default", icon: "⚪" };

          return (
            <Tag color={config.color} style={{ borderRadius: "12px", textTransform: "capitalize" }}>
              {config.icon} {status}
            </Tag>
          );
        },
      },
      {
        title: "Actions",
        key: "actions",
        width: 80,
        render: (_, record) => (
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleViewProfile(record.userId, record._id)}
            style={{ color: "#1890ff" }}
          />
        ),
      },
    ],
    [currentPage, pageSize, getImageSrc, handleViewProfile, formatDate]
  );

  return (
    <div style={{ padding: "24px", backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      {/* Header */}
      <Title level={2} style={{ marginBottom: "24px", fontSize: "24px", fontWeight: 600 }}>
        Doctor Onboarding Request
      </Title>

      {/* Summary Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={12} md={8}>
          <Card
            style={{
              backgroundColor: "#d4edda",
              border: "1px solid #c3e6cb",
              borderRadius: "12px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
              transition: "all 0.3s ease",
            }}
            hoverable
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div
                  style={{
                    fontSize: "clamp(10px, 1.5vw, 12px)",
                    color: "#155724",
                    marginBottom: "4px",
                  }}
                >
                  Approved
                </div>
                <div
                  style={{
                    fontSize: "clamp(20px, 3vw, 32px)",
                    fontWeight: "bold",
                    color: "#155724",
                  }}
                >
                  {summaryStats.approved}
                </div>
              </div>
              <div
                style={{
                  width: "clamp(32px, 5vw, 40px)",
                  height: "clamp(32px, 5vw, 40px)",
                  backgroundColor: "#28a745",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
                }}
              >
                <CheckCircleOutlined
                  style={{ color: "white", fontSize: "clamp(16px, 2.5vw, 20px)" }}
                />
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card
            style={{
              backgroundColor: "#fff3cd",
              border: "1px solid #ffeaa7",
              borderRadius: "12px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
              transition: "all 0.3s ease",
            }}
            hoverable
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div
                  style={{
                    fontSize: "clamp(10px, 1.5vw, 12px)",
                    color: "#856404",
                    marginBottom: "4px",
                  }}
                >
                  Pending Approvals
                </div>
                <div
                  style={{
                    fontSize: "clamp(20px, 3vw, 32px)",
                    fontWeight: "bold",
                    color: "#856404",
                  }}
                >
                  {summaryStats.pending}
                </div>
              </div>
              <div
                style={{
                  width: "clamp(32px, 5vw, 40px)",
                  height: "clamp(32px, 5vw, 40px)",
                  backgroundColor: "#ffc107",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
                }}
              >
                <ClockCircleOutlined
                  style={{ color: "white", fontSize: "clamp(16px, 2.5vw, 20px)" }}
                />
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card
            style={{
              backgroundColor: "#f8d7da",
              border: "1px solid #f5c6cb",
              borderRadius: "12px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
              transition: "all 0.3s ease",
            }}
            hoverable
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div
                  style={{
                    fontSize: "clamp(10px, 1.5vw, 12px)",
                    color: "#721c24",
                    marginBottom: "4px",
                  }}
                >
                  Rejected
                </div>
                <div
                  style={{
                    fontSize: "clamp(20px, 3vw, 32px)",
                    fontWeight: "bold",
                    color: "#721c24",
                  }}
                >
                  {summaryStats.rejected}
                </div>
              </div>
              <div
                style={{
                  width: "clamp(32px, 5vw, 40px)",
                  height: "clamp(32px, 5vw, 40px)",
                  backgroundColor: "#dc3545",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
                }}
              >
                <CloseCircleOutlined
                  style={{ color: "white", fontSize: "clamp(16px, 2.5vw, 20px)" }}
                />
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Search Bar */}
      <Row style={{ marginBottom: "clamp(16px, 2vw, 24px)" }}>
        <Col xs={24}>
          <Input
            placeholder="Search doctors..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{
              borderRadius: "12px",
              maxWidth: "clamp(300px, 50vw, 400px)",
              fontSize: "clamp(12px, 1.8vw, 14px)",
            }}
          />
        </Col>
      </Row>

      {/* Table */}
        <Card
          style={{
            borderRadius: "12px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
            transition: "all 0.3s ease",
          }}
          hoverable
        >
          <div
            style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "clamp(12px, 2vw, 16px)",
          flexWrap: "wrap",
          gap: "8px",
            }}
          >
            <div
          style={{
            fontWeight: 600,
            fontSize: "clamp(14px, 2vw, 16px)",
            color: "#262626",
          }}
            >
          Doctor Requests
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <DatePicker.RangePicker
            value={null}
            placeholder={["Start Date", "End Date"]}
            style={{ borderRadius: "12px", fontSize: "clamp(12px, 1.8vw, 14px)" }}
            suffixIcon={<CalendarOutlined />}
            allowClear
          />
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{
              width: "clamp(100px, 20vw, 120px)",
              borderRadius: "12px",
              fontSize: "clamp(12px, 1.8vw, 14px)",
            }}
          >
            <Option value="pending">Pending</Option>
            <Option value="approved">Approved</Option>
            <Option value="rejected">Rejected</Option>
            <Option value="all">All</Option>
          </Select>
            </div>
          </div>
          <Table
            columns={columns}
            dataSource={filteredDoctors}
            pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: filteredDoctors.length,
          showSizeChanger: true,
          onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            },
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
            style: { marginTop: "16px" },
          }}
          scroll={{ x: true }}
          loading={loading}
          rowClassName="custom-row"
          style={{
            '.ant-table-thead > tr > th': {
              backgroundColor: '#fafafa',
              fontWeight: 600,
              color: '#262626',
              fontSize: 'clamp(12px, 1.8vw, 14px)',
            },
            '.ant-table-row': {
              transition: 'background-color 0.3s ease',
            },
            '.ant-table-row:hover': {
              backgroundColor: '#f0f9ff',
            },
          }}
        />
      </Card>

      {/* Image Modal */}
      <Modal
        title="Document View"
        open={imageModalVisible}
        onCancel={() => setImageModalVisible(false)}
        footer={null}
        width="800px"
        centered
        destroyOnClose
      >
        <div style={{ textAlign: "center" }}>
          <img
            src={selectedImage}
            alt="Document"
            style={{
              maxWidth: "100%",
              maxHeight: "600px",
              objectFit: "contain",
              borderRadius: "8px",
            }}
          />
        </div>
      </Modal>
    </div>
  );
};

export default DoctorOnboardingDashboard;