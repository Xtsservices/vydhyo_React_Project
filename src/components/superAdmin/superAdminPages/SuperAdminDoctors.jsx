import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
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
} from "antd";
import {
  EyeOutlined,
  UserOutlined,
  ReloadOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import moment from "moment";

const { Title, Text } = Typography;

// Constants
const API_BASE_URL = "http://216.10.251.239:3000";
const DEFAULT_PAGE_SIZE = 10;

// Custom hooks
const useLocalStorage = (key) => {
  return localStorage.getItem(key);
};

const DoctorOnboardingDashboard = () => {
  const navigate = useNavigate();

  // State management
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const { userId, doctorId } = location.state || {};

  // Fetch doctors from API
  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    try {
      const token = useLocalStorage("accessToken");
      if (!token) {
        message.error("No authentication token found. Please login again.");
        navigate("/login"); // Redirect to login if needed
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


  const handleViewProfile = (userId, doctorId) =>{
    navigate('/SuperAdmin/profileView', { state: { userId: userId, doctorId: doctorId } });
  }

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
      {
        title: "Location",
        key: "location",
        width: 120,
        render: () => <Text>-</Text>,
      },
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
        <Col xs={24} sm={8}>
          <Card
            style={{
              background: "linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%)",
              border: "none",
              borderRadius: "12px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <Text style={{ fontSize: "14px", color: "#856404" }}>Pending Approvals</Text>
                <Title level={2} style={{ margin: 0, color: "#856404" }}>
                  {summaryStats.pending}
                </Title>
              </div>
              <ClockCircleOutlined style={{ fontSize: "24px", color: "#f39c12" }} />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card
            style={{
              background: "linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%)",
              border: "none",
              borderRadius: "12px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <Text style={{ fontSize: "14px", color: "#721c24" }}>Rejected</Text>
                <Title level={2} style={{ margin: 0, color: "#721c24" }}>
                  {summaryStats.rejected}
                </Title>
              </div>
              <CloseCircleOutlined style={{ fontSize: "24px", color: "#e74c3c" }} />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card
            style={{
              background: "linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)",
              border: "none",
              borderRadius: "12px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <Text style={{ fontSize: "14px", color: "#155724" }}>Approved</Text>
                <Title level={2} style={{ margin: 0, color: "#155724" }}>
                  {summaryStats.approved}
                </Title>
              </div>
              <CheckCircleOutlined style={{ fontSize: "24px", color: "#27ae60" }} />
            </div>
          </Card>
        </Col>
      </Row>

      {/* Table */}
      <Card style={{ borderRadius: "12px", boxShadow: "0 2px 8px rgba(1,0,0,0.1)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <Title level={4} style={{ margin: 0, fontSize: "18px", color: "#262626" }}>
            Doctor Requests
          </Title>
          <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
            Refresh
          </Button>
        </div>

        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={doctors}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: doctors.length,
              showSizeChanger: false,
              showQuickJumper: false,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
              onChange: (page) => setCurrentPage(page),
              style: { marginTop: "16px" },
            }}
            scroll={{ x: 1200 }}
            size="middle"
            bordered={false}
          />
        </Spin>
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