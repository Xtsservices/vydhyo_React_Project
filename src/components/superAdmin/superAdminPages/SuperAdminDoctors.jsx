import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Table,
  Input,
  Button,
  Tag,
  Space,
  Select,
  Avatar,
  Modal,
  Spin,
  message,
  Row,
  Col,
  Card,
  DatePicker,
} from "antd";
import {
  SearchOutlined,
  EyeOutlined,
  UserOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  CheckCircleOutlined,
  CalendarOutlined,
  TeamOutlined,
} from "@ant-design/icons";

const { Option } = Select;

const DoctorOnboardingDashboard = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [doctors, setDoctors] = useState([
    {
      _id: "1",
      firstname: "Riya",
      lastname: "Sharma",
      email: "riya.sharma@email.com",
      mobile: "9876543210",
      specialization: [{ name: "Dermatology", experience: 7 }],
      location: "Delhi",
      createdAt: "2025-06-25",
      status: "pending",
      profilepic: null,
      requestDate: "02-07-2025",
    },
    {
      _id: "2",
      firstname: "Aarav",
      lastname: "Mehta",
      email: "aarav.mehta@email.com",
      mobile: "9898989898",
      specialization: [{ name: "Orthopedics", experience: 10 }],
      location: "Mumbai",
      createdAt: "2025-06-26",
      status: "pending",
      profilepic: null,
      requestDate: "02-07-2025",
    },
    {
      _id: "3",
      firstname: "Sneha",
      lastname: "Iyer",
      email: "sneha.iyer@email.com",
      mobile: "9123456789",
      specialization: [{ name: "Pediatrics", experience: 5 }],
      location: "Bengaluru",
      createdAt: "2025-06-25",
      status: "pending",
      profilepic: null,
      requestDate: "02-07-2025",
    },
    {
      _id: "4",
      firstname: "Rajeev",
      lastname: "Nair",
      email: "rajeev.nair@email.com",
      mobile: "9000786050",
      specialization: [{ name: "Cardiology", experience: 12 }],
      location: "Kochi",
      createdAt: "2025-06-24",
      status: "pending",
      profilepic: null,
      requestDate: "02-07-2025",
    },
    {
      _id: "5",
      firstname: "Meera",
      lastname: "Das",
      email: "meera.das@email.com",
      mobile: "9001234567",
      specialization: [{ name: "Gynecology", experience: 12 }],
      location: "Kochi",
      createdAt: "2025-06-24",
      status: "pending",
      profilepic: null,
      requestDate: "02-07-2025",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [statusFilter, setStatusFilter] = useState("Pending");
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");

  // Stats data
  const stats = {
    pending: 23,
    rejected: 12,
    approved: 76,
  };

  const applyFilters = (doctorList) => {
    let filtered = doctorList;

    if (searchText) {
      filtered = filtered.filter((doctor) => {
        const specializations = Array.isArray(doctor.specialization)
          ? doctor.specialization
          : doctor.specialization
          ? [doctor.specialization]
          : [];
        return (
          `${doctor.firstname} ${doctor.lastname}`
            .toLowerCase()
            .includes(searchText.toLowerCase()) ||
          doctor.email.toLowerCase().includes(searchText.toLowerCase()) ||
          specializations.some((specialization) =>
            specialization.name?.toLowerCase().includes(searchText.toLowerCase())
          )
        );
      });
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (doctor) => doctor.status?.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    setFilteredDoctors(filtered);
  };

  useEffect(() => {
    setFilteredDoctors(doctors);
  }, [doctors]);

  useEffect(() => {
    applyFilters(doctors);
  }, [searchText, doctors, statusFilter]);

  const getImageSrc = (profilepic) => {
    if (profilepic && profilepic.data && profilepic.mimeType) {
      return `data:${profilepic.mimeType};base64,${profilepic.data}`;
    }
    return null;
  };

  const showImageModal = (imageSrc) => {
    setSelectedImage(imageSrc);
    setImageModalVisible(true);
  };

  const handleViewProfile = (doctorId) => {
    navigate(`/SuperAdmin/profileView?id=${doctorId}`);
  };

  const columns = [
    {
      title: "#",
      dataIndex: "index",
      key: "index",
      width: 50,
      render: (text, record, index) => index + 1,
    },
    {
      title: "Doctor",
      dataIndex: "name",
      key: "name",
      render: (text, record) => {
        const imageSrc = getImageSrc(record.profilepic);
        return (
          <Space>
            <Avatar
              size={40}
              src={imageSrc}
              style={{ flexShrink: 0, borderRadius: "50%", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}
            >
              {!imageSrc &&
                `${record.firstname?.[0] ?? ""}${record.lastname?.[0] ?? ""}`}
            </Avatar>
            <div>
              <div style={{ fontWeight: 500, color: "#1890ff", fontSize: "clamp(12px, 1.8vw, 14px)" }}>
                Dr. {record.firstname || ""} {record.lastname || ""}
              </div>
              <div style={{ fontSize: "clamp(10px, 1.5vw, 12px)", color: "#8c8c8c" }}>
                {record.email}
              </div>
            </div>
          </Space>
        );
      },
    },
    {
      title: "Contact",
      dataIndex: "mobile",
      key: "mobile",
      render: (text) => (
        <span style={{ fontSize: "clamp(12px, 1.8vw, 14px)" }}>{text || "N/A"}</span>
      ),
    },
    {
      title: "Specialty",
      dataIndex: "specialization",
      key: "specialization",
      render: (specialization) => {
        const specializations = Array.isArray(specialization)
          ? specialization
          : specialization
          ? [specialization]
          : [];
        const firstSpec = specializations[0];
        return (
          <Tag
            color="blue"
            style={{
              borderRadius: "12px",
              fontWeight: 500,
              fontSize: "clamp(10px, 1.5vw, 12px)",
              padding: "4px 10px",
            }}
          >
            {firstSpec?.name || "Not specified"}
          </Tag>
        );
      },
    },
    {
      title: "Experience",
      dataIndex: "specialization",
      key: "experience",
      render: (specialization) => {
        const specializations = Array.isArray(specialization)
          ? specialization
          : specialization
          ? [specialization]
          : [];
        const firstSpec = specializations[0];
        return (
          <span style={{ fontSize: "clamp(12px, 1.8vw, 14px)" }}>
            {firstSpec?.experience || 0} yr
          </span>
        );
      },
    },
    {
      title: "Location",
      dataIndex: "location",
      key: "location",
      render: (text) => (
        <span style={{ fontSize: "clamp(12px, 1.8vw, 14px)" }}>{text || "N/A"}</span>
      ),
    },
    {
      title: "Request Date",
      dataIndex: "requestDate",
      key: "requestDate",
      render: (date) => (
        <span style={{ fontSize: "clamp(12px, 1.8vw, 14px)" }}>{date || "N/A"}</span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag
          color="orange"
          style={{
            borderRadius: "12px",
            fontWeight: 500,
            textTransform: "capitalize",
            fontSize: "clamp(10px, 1.5vw, 12px)",
            padding: "4px 10px",
          }}
        >
          Pending
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (text, record) => (
        <Button
          type="text"
          icon={<EyeOutlined />}
          onClick={() => handleViewProfile(record._id)}
          style={{ color: "#1890ff", fontSize: "clamp(12px, 1.8vw, 14px)" }}
        />
      ),
    },
  ];

  return (
    <div
      style={{
        padding: "clamp(16px, 3vw, 24px)",
        backgroundColor: "#f5f5f5",
        minHeight: "100vh",
      }}
    >
      <div style={{ marginBottom: "clamp(16px, 2vw, 24px)" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
            marginBottom: "clamp(16px, 2vw, 24px)",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "clamp(18px, 3vw, 24px)",
              fontWeight: 600,
              color: "#262626",
            }}
          >
            Doctor Onboarding Request
          </h2>
          
        </div>

        {/* Stats Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: "clamp(16px, 2vw, 24px)" }}>
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
                    {stats.pending}
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
                    {stats.rejected}
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
                    {stats.approved}
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
        </Row>

        {/* Search Bar */}
        <Row style={{ marginBottom: "clamp(16px, 2vw, 24px)" }}>
          <Col xs={24} md={8} style={{ marginBottom: 8 }}>
            <Input
              placeholder="Search by name..."
              prefix={<SearchOutlined />}
              value={searchText.name || ""}
              onChange={(e) =>
                setSearchText((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
              style={{
                borderRadius: "12px",
                maxWidth: "clamp(300px, 50vw, 400px)",
                fontSize: "clamp(12px, 1.8vw, 14px)",
                marginBottom: 8,
              }}
              allowClear
            />
          </Col>
          <Col xs={24} md={8} style={{ marginBottom: 8 }}>
            <Input
              placeholder="Search by locality..."
              prefix={<SearchOutlined />}
              value={searchText.locality || ""}
              onChange={(e) =>
                setSearchText((prev) => ({
                  ...prev,
                  locality: e.target.value,
                }))
              }
              style={{
                borderRadius: "12px",
                maxWidth: "clamp(300px, 50vw, 400px)",
                fontSize: "clamp(12px, 1.8vw, 14px)",
                marginBottom: 8,
              }}
              allowClear
            />
          </Col>
          <Col xs={24} md={8} style={{ marginBottom: 8 }}>
            <Input
              placeholder="Search by specialization..."
              prefix={<SearchOutlined />}
              value={searchText.specialization || ""}
              onChange={(e) =>
                setSearchText((prev) => ({
                  ...prev,
                  specialization: e.target.value,
                }))
              }
              style={{
                borderRadius: "12px",
                maxWidth: "clamp(300px, 50vw, 400px)",
                fontSize: "clamp(12px, 1.8vw, 14px)",
                marginBottom: 8,
              }}
              allowClear
            />
          </Col>
        </Row>
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
              {/* Date Range Picker */}
                <DatePicker.RangePicker
            value={null}
            placeholder={["Start date", "End date"]}
            style={{ borderRadius: "12px", fontSize: "clamp(12px, 1.8vw, 14px)" }}
            suffixIcon={<CalendarOutlined />}
            format="DD-MM-YYYY"
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
              dataSource={filteredDoctors.map((doctor) => ({
                ...doctor,
                key: doctor._id,
              }))}
              pagination={{
                current: 1,
                pageSize: 10,
                total: filteredDoctors.length,
                showSizeChanger: false,
                showQuickJumper: false,
                showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} items`,
                style: { marginTop: "16px" },
              }}
              scroll={{ x: true }}
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
              </div>

              {/* Image Modal */}
      <Modal
        title="Image View"
        open={imageModalVisible}
        onCancel={() => setImageModalVisible(false)}
        footer={null}
        width="clamp(300px, 80vw, 800px)"
        centered
      >
        <div style={{ textAlign: "center" }}>
          <img
            src={selectedImage}
            alt="Document"
            style={{
              maxWidth: "100%",
              maxHeight: "clamp(300px, 60vh, 600px)",
              objectFit: "contain",
              borderRadius: "12px",
            }}
          />
        </div>
      </Modal>
    </div>
  );
};

export default DoctorOnboardingDashboard;