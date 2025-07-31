import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate, useLocation } from "react-router-dom";
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
  Row,
  Col,
  Input,
} from "antd";
import {
  EyeOutlined,
  UserOutlined,
  ReloadOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  CheckCircleOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import moment from "moment";
import { apiGet } from "../../api";
import { debounce } from "lodash";

const { Title, Text } = Typography;

// Constants
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
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    total: 0,
  });
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("inActive");
  const [summaryStats, setSummaryStats] = useState({
    pending: 0,
    rejected: 0,
    approved: 0,
  });
  const { userId, doctorId } = location.state || {};

  // Ref to track component mount state
  const isMounted = useRef(true);

  // Fetch doctors count from API
  const fetchDoctorsCount = useCallback(async () => {
    try {
      const token = useLocalStorage("accessToken");
      if (!token) {
        message.error("No authentication token found. Please login again.");
        navigate("/login");
        return;
      }
      const response = await apiGet("users/getDoctorsCount", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (isMounted.current) {
        const data = response.data.data;
        setSummaryStats({
          pending: data.inActive || 0,
          rejected: data.rejected || 0,
          approved: data.approved || 0,
        });
      }
    } catch (error) {
      if (isMounted.current) {
        console.error("Error fetching doctors count:", error);
        message.error("Failed to fetch doctors count. Please try again.");
      }
    }
  }, [navigate]);

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
      const queryParams = new URLSearchParams({
        type: "doctor",
        page: pagination.current,
        limit: pagination.pageSize,
        status: statusFilter,
        ...(searchText.trim() && { search: searchText.trim() }),
      });
      const response = await apiGet(
        `users/AllUsers?${queryParams.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (isMounted.current) {
        const { data, pagination: apiPagination } = response.data;
        let doctorsData = Array.isArray(data) ? data : [];

        setPagination((prev) => ({
          ...prev,
          total: apiPagination?.total || doctorsData.length,
        }));

        doctorsData = doctorsData.map((doctor) => ({
          ...doctor,
          key: doctor._id,
          firstname: doctor.firstname || "N/A",
          lastname: doctor.lastname || "",
        }));

        setDoctors(doctorsData);
      }
    } catch (error) {
      if (isMounted.current) {
        message.error("Failed to fetch doctors data. Please try again.");
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [
    navigate,
    pagination.current,
    pagination.pageSize,
    statusFilter,
    searchText,
  ]);

  // Create a debounced version of fetchDoctors
  const debouncedFetchDoctors = useMemo(
    () => debounce(fetchDoctors, 500),
    [fetchDoctors]
  );

  // Cleanup on unmount
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      debouncedFetchDoctors.cancel();
    };
  }, [debouncedFetchDoctors]);

  // Fetch doctors and count on mount and when dependencies change
  useEffect(() => {
    fetchDoctors();
    fetchDoctorsCount();
  }, [
    fetchDoctorsCount,
    statusFilter,
    pagination.current,
    pagination.pageSize,
  ]);

  // Trigger debounced fetch when searchText changes
  useEffect(() => {
    if (searchText !== "") {
      debouncedFetchDoctors();
    } else {
      // If search text is empty, fetch immediately without debounce
      fetchDoctors();
    }
  }, [searchText, debouncedFetchDoctors, fetchDoctors]);

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
    navigate("/SuperAdmin/profileView", {
      state: { userId, doctorId, statusFilter },
    });
  };

  const handleRefresh = useCallback(() => {
    setPagination((prev) => ({ ...prev, current: 1 }));
    fetchDoctors();
    fetchDoctorsCount();
  }, [fetchDoctors, fetchDoctorsCount]);

  const formatDate = useCallback((dateString) => {
    if (!dateString) return "N/A";
    try {
      return moment(dateString).format("DD-MM-YYYY");
    } catch {
      return dateString;
    }
  }, []);

  // Handle search input with mobile number validation
  const handleSearchChange = (e) => {
    const value = e.target.value;

    // Check if the input might be a mobile number (all digits)
    if (/^\d+$/.test(value)) {
      if (value.length <= 10) {
        setSearchText(value);
      }
    } else {
      setSearchText(value);
    }
  };

  // Table columns configuration
  const columns = useMemo(
    () => [
      {
        title: "#",
        key: "index",
        width: 50,
        render: (_, __, index) =>
          (pagination.current - 1) * pagination.pageSize + index + 1,
      },
      {
        title: "Doctor",
        key: "doctor",
        width: 250,
        render: (_, record) => {
          const imageSrc = getImageSrc(record.profilepic);
          const fullName = `${record.firstname || "N/A"} ${
            record.lastname || ""
          }`.trim();

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
                  (fullName === "N/A" ? (
                    <UserOutlined />
                  ) : (
                    `${record.firstname?.[0] ?? ""}${
                      record.lastname?.[0] ?? ""
                    }`
                  ))}
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
        render: (text) => <Text>{text || "N/A"}</Text>,
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
            <Tag
              color={specColor[specName] || "default"}
              style={{ borderRadius: "12px" }}
            >
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
            inActive: { color: "orange", icon: "🟡" },
          };

          const config = statusConfig[status?.toLowerCase()] || {
            color: "default",
            icon: "⚪",
          };

          return (
            <Tag
              color={config.color}
              style={{ borderRadius: "12px", textTransform: "capitalize" }}
            >
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
    [
      pagination.current,
      pagination.pageSize,
      getImageSrc,
      handleViewProfile,
      formatDate,
    ]
  );

  const handleCardClick = (status) => {
    setStatusFilter(status);
    setPagination((prev) => ({ ...prev, current: 1 }));
    setSearchText(""); // Reset search when changing status filter
  };

  return (
    <div
      style={{
        padding: "24px",
        backgroundColor: "#f5f5f5",
        minHeight: "100vh",
      }}
    >
      {/* Header */}
      <Title
        level={2}
        style={{ marginBottom: "24px", fontSize: "24px", fontWeight: 600 }}
      >
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
            onClick={() => handleCardClick("approved")}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
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
                  style={{
                    color: "white",
                    fontSize: "clamp(16px, 2.5vw, 20px)",
                  }}
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
            onClick={() => handleCardClick("inActive")}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
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
                  style={{
                    color: "white",
                    fontSize: "clamp(16px, 2.5vw, 20px)",
                  }}
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
            onClick={() => handleCardClick("rejected")}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
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
                  style={{
                    color: "white",
                    fontSize: "clamp(16px, 2.5vw, 20px)",
                  }}
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
            placeholder="Search by name or mobile number..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={handleSearchChange}
            allowClear
            style={{
              borderRadius: "12px",
              maxWidth: "clamp(300px, 50vw, 400px)",
              fontSize: "clamp(12px, 1.8vw, 14px)",
            }}
            maxLength={30} // Reasonable limit for names
            // suffix={
            //   /^\d+$/.test(searchText) && searchText.length > 0 ? (
            //     <Text type={searchText.length === 10 ? "success" : "danger"}>
            //       {searchText.length}/10
            //     </Text>
            //   ) : null
            // }
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
            {statusFilter === "approved"
              ? "Doctors Approved"
              : statusFilter === "rejected"
              ? "Doctors Rejected"
              : statusFilter === "inActive"
              ? "Doctor Requests"
              : "All Doctor Requests"}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Button
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
              style={{ borderRadius: "12px" }}
            >
              Refresh
            </Button>
          </div>
        </div>
        <Table
          columns={columns}
          dataSource={doctors}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50"],
            onChange: (page, size) => {
              setPagination((prev) => ({
                ...prev,
                current: page,
                pageSize: size,
              }));
            },
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} items`,
            style: { marginTop: "16px" },
          }}
          scroll={{ x: true }}
          loading={loading}
          rowClassName="custom-row"
          style={{
            ".ant-table-thead > tr > th": {
              backgroundColor: "#fafafa",
              fontWeight: 600,
              color: "#262626",
              fontSize: "clamp(12px, 1.8vw, 14px)",
            },
            ".ant-table-row": {
              transition: "background-color 0.3s ease",
            },
            ".ant-table-row:hover": {
              backgroundColor: "#f0f9ff",
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
