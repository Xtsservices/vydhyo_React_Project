import React, { useState, useEffect } from "react";
import {
  Table,
  Input,
  Button,
  DatePicker,
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
  Divider,
  Grid,
} from "antd";
import {
  SearchOutlined,
  CalendarOutlined,
  DownloadOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  BankOutlined,
  IdcardOutlined,
  MedicineBoxOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const { RangePicker } = DatePicker;
const { Option } = Select;
const { useBreakpoint } = Grid;
const DoctorList = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [specializationFilter, setSpecializationFilter] = useState("all");
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [specializationModalVisible, setSpecializationModalVisible] = useState(false);
  const [selectedSpecializations, setSelectedSpecializations] = useState([]);
  const [selectedDoctorName, setSelectedDoctorName] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [doctorDetailsModalVisible, setDoctorDetailsModalVisible] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  const applyFilters = (doctorList) => {
    let filtered = doctorList;

    if (searchText) {
      filtered = filtered.filter(
        (doctor) => {
          const specializations = Array.isArray(doctor.specialization) 
            ? doctor.specialization 
            : doctor.specialization ? [doctor.specialization] : [];
          
          return (
            `${doctor.firstname} ${doctor.lastname}`
              .toLowerCase()
              .includes(searchText.toLowerCase()) ||
            doctor.email.toLowerCase().includes(searchText.toLowerCase()) ||
            doctor.medicalRegistrationNumber
              ?.toLowerCase()
              .includes(searchText.toLowerCase()) ||
            specializations.some((specialization) =>
              specialization.name
                ?.toLowerCase()
                .includes(searchText.toLowerCase())
            )
          );
        }
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (doctor) => doctor.status?.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    if (specializationFilter !== "all") {
      filtered = filtered.filter((doctor) => {
        const specializations = Array.isArray(doctor.specialization) 
          ? doctor.specialization 
          : doctor.specialization ? [doctor.specialization] : [];
        
        return specializations.some((specialization) =>
          specialization.name
            ?.toLowerCase()
            .includes(specializationFilter.toLowerCase())
        );
      });
    }

    setFilteredDoctors(filtered);
  };

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        message.error("No authentication token found. Please login again.");
        return;
      }

      const response = await axios.get(
        `http://192.168.1.42:3000/users/AllUsers?type=doctor&status=approved`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.data) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = response.data;
      let doctorsData = [];
      if (data.status === "success" && data.data) {
        doctorsData = Array.isArray(data.data) ? data.data : [data.data];
      } else if (Array.isArray(data)) {
        doctorsData = data;
      } else {
        doctorsData = data.data || [];
      }

      setDoctors(doctorsData);
      setFilteredDoctors(doctorsData);
    } catch (error) {
      console.error("Error fetching doctors:", error);
      message.error("Failed to fetch doctors data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const updateDoctorStatus = async (doctorId, newStatus) => {
    setUpdatingStatus(doctorId);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        message.error("No authentication token found");
        return;
      }

      const response = await axios.put(
        `http://192.168.1.42:3000/admin/approveDoctor`,
        {
          userId: doctorId,
          status: newStatus === "active" ? "Approved" : "Rejected",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.data) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedDoctors = doctors.map((doctor) =>
        doctor._id === doctorId ? { ...doctor, status: newStatus } : doctor
      );

      setDoctors(updatedDoctors);
      applyFilters(updatedDoctors);

      message.success(
        `Doctor ${newStatus === "active" ? "approved" : "rejected"} successfully`
      );
    } catch (error) {
      console.error("Error updating doctor status:", error);
      message.error(error.message || "Failed to update doctor status");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleApprove = (doctorId) => {
    Modal.confirm({
      title: "Approve Doctor",
      content: "Are you sure you want to approve this doctor?",
      okText: "Yes, Approve",
      okType: "primary",
      cancelText: "Cancel",
      onOk: () => updateDoctorStatus(doctorId, "active"),
    });
  };

  const handleReject = (doctorId) => {
    Modal.confirm({
      title: "Reject Doctor",
      content:
        "Are you sure you want to reject this doctor? This action cannot be undone.",
      okText: "Yes, Reject",
      okType: "danger",
      cancelText: "Cancel",
      onOk: () => updateDoctorStatus(doctorId, "inactive"),
    });
  };

  const showDoctorDetailsModal = (doctor) => {
    setSelectedDoctor(doctor);
    setDoctorDetailsModalVisible(true);
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    applyFilters(doctors);
  }, [searchText, doctors, statusFilter, specializationFilter]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

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

  const showSpecializationModal = (specializations, doctorName) => {
    setSelectedSpecializations(specializations);
    setSelectedDoctorName(doctorName);
    setSpecializationModalVisible(true);
  };

  const getUniqueSpecializations = () => {
    const allSpecs = doctors.flatMap((doctor) => {
      const specializations = Array.isArray(doctor.specialization) 
        ? doctor.specialization 
        : doctor.specialization ? [doctor.specialization] : [];
      return specializations.map((specialization) => specialization.name);
    });
    return [...new Set(allSpecs)].filter(
      (specialization) => specialization && String(specialization).trim() !== ""
    );
  };

  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case "active":
      case "approved":
        return "success";
      case "inactive":
      case "rejected":
        return "error";
      case "pending":
        return "warning";
      default:
        return "default";
    }
  };

  const columns = [
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
              style={{
                flexShrink: 0,
                cursor: imageSrc ? "pointer" : "default",
              }}
              onClick={imageSrc ? () => showImageModal(imageSrc) : undefined}
            >
              {!imageSrc &&
                `${record.firstname?.[0] ?? ""}${record.lastname?.[0] ?? ""}`}
            </Avatar>
            <span 
              style={{ 
                fontWeight: 500, 
                cursor: "pointer", 
                color: "#1890ff",
                textDecoration: "underline"
              }}
              onClick={() => showDoctorDetailsModal(record)}
            >
              Dr. {record.firstname || ""} {record.lastname || ""}
            </span>
          </Space>
        );
      },
    },
    {
      title: "Doctor ID",
      dataIndex: "medicalRegistrationNumber",
      key: "medicalRegistrationNumber",
      render: (text) => text || "N/A",
    },
    {
      title: "Specialization",
      dataIndex: "specialization",
      key: "specialization",
      render: (specialization, record) => {
        const specializations = Array.isArray(specialization) 
          ? specialization 
          : specialization ? [specialization] : [];
        
        return (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div>
              {specializations.length > 0
                ? specializations
                    .map((spec) => spec.name)
                    .filter((name) => name)
                    .join(", ")
                : "Not specified"}
            </div>
            {specializations.length > 0 && (
              <Button
                type="link"
                size="small"
                onClick={() =>
                  showSpecializationModal(
                    specializations,
                    `Dr. ${record.firstname || ""} ${record.lastname || ""}`
                  )
                }
                style={{ padding: "0 4px", height: "auto", fontSize: "12px" }}
              >
                View
              </Button>
            )}
          </div>
        );
      },
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (text) => text || "N/A",
    },
    {
      title: "Phone",
      dataIndex: "mobile",
      key: "mobile",
      render: (text) => text || "N/A",
    },
    {
      title: "Registered On",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => formatDate(date),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag
          color={getStatusColor(status)}
          style={{
            borderRadius: "4px",
            fontWeight: 500,
            border: "none",
            textTransform: "capitalize",
          }}
        >
          {status || "Unknown"}
        </Tag>
      ),
    },
    {
      title: "Verified",
      dataIndex: "isVerified",
      key: "isVerified",
      render: (isVerified) => (
        <Tag
          color={isVerified ? "success" : "warning"}
          style={{
            borderRadius: "4px",
            fontWeight: 500,
            border: "none",
          }}
        >
          {isVerified ? "Verified" : "Pending"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (text, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            onClick={() => handleApprove(record._id)}
            loading={updatingStatus === record._id}
            disabled={record.status === "active"}
          >
            Approve
          </Button>
          <Button
            type="danger"
            size="small"
            onClick={() => handleReject(record._id)}
            loading={updatingStatus === record._id}
            disabled={record.status === "inactive"}
          >
            Reject
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Spin spinning={loading}>
        <Row gutter={[16, 16]}>
          <Col xs={24}>
            <Card title="Doctor List" bordered={false}>
              <Row gutter={[16, 16]} justify="space-between" align="middle">
                <Col xs={24} md={12}>
                  <Input
                    placeholder="Search by name, ID, email, or specialization"
                    prefix={<SearchOutlined />}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                  />
                </Col>
                <Col xs={24} md={12} style={{ textAlign: "right" }}>
                  <Button onClick={fetchDoctors} loading={loading}>
                    Refresh
                  </Button>
                </Col>
              </Row>
              <Divider />
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
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) =>
                    `${range[0]}-${range[1]} of ${total} doctors`,
                }}
                scroll={{ x: true }}
              />
              <div style={{ marginTop: "16px", color: "#8c8c8c", fontSize: "14px" }}>
                Showing {filteredDoctors.length} of {doctors.length} doctors
              </div>
            </Card>
          </Col>
        </Row>

        {/* Doctor Details Modal */}
        <Modal
          title={
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <UserOutlined />
              <span>
                Dr. {selectedDoctor?.firstname || ""} {selectedDoctor?.lastname || ""} - Details
              </span>
            </div>
          }
          open={doctorDetailsModalVisible}
          onCancel={() => setDoctorDetailsModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setDoctorDetailsModalVisible(false)}>
              Close
            </Button>,
          ]}
          width={900}
          centered
        >
          {selectedDoctor && (
            <div style={{ maxHeight: "70vh", overflowY: "auto" }}>
              <Card 
                title={
                  <span>
                    <UserOutlined style={{ marginRight: 8 }} />
                    Personal Information
                  </span>
                }
                size="small"
              >
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={6} style={{ textAlign: "center" }}>
                    <Avatar
                      size={80}
                      src={getImageSrc(selectedDoctor.profilepic)}
                      style={{ marginBottom: "8px" }}
                    >
                      {!getImageSrc(selectedDoctor.profilepic) &&
                        `${selectedDoctor.firstname?.[0] ?? ""}${selectedDoctor.lastname?.[0] ?? ""}`}
                    </Avatar>
                    <div style={{ fontWeight: 500 }}>
                      Dr. {selectedDoctor.firstname} {selectedDoctor.lastname}
                    </div>
                  </Col>
                  <Col xs={24} md={18}>
                    <Row gutter={[16, 16]}>
                      <Col xs={24} md={12}>
                        <div>
                          <strong>User ID:</strong> {selectedDoctor.userId || "N/A"}<br />
                          <strong>Medical Registration:</strong> {selectedDoctor.medicalRegistrationNumber || "N/A"}<br />
                          <strong>Gender:</strong> {selectedDoctor.gender || "N/A"}<br />
                          <strong>Date of Birth:</strong> {selectedDoctor.DOB || "N/A"}
                        </div>
                      </Col>
                      <Col xs={24} md={12}>
                        <div>
                          <strong>Blood Group:</strong> {selectedDoctor.bloodgroup || "N/A"}<br />
                          <strong>Marital Status:</strong> {selectedDoctor.maritalStatus || "N/A"}<br />
                          <strong>Role:</strong> {selectedDoctor.role || "N/A"}<br />
                          <strong>Relationship:</strong> {selectedDoctor.relationship || "N/A"}
                        </div>
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </Card>

              <Row gutter={16} style={{ marginTop: "16px" }}>
                <Col xs={24} md={12}>
                  <Card 
                    title={
                      <span>
                        <PhoneOutlined style={{ marginRight: 8 }} />
                        Contact Information
                      </span>
                    }
                    size="small"
                  >
                    <div>
                      <strong>Email:</strong> {selectedDoctor.email || "N/A"}<br />
                      <strong>Mobile:</strong> {selectedDoctor.mobile || "N/A"}<br />
                      <strong>Spoken Languages:</strong> {selectedDoctor.spokenLanguage?.join(", ") || "N/A"}<br />
                      <strong>App Language:</strong> {selectedDoctor.appLanguage || "N/A"}
                    </div>
                  </Card>
                </Col>
                <Col xs={24} md={12}>
                  <Card 
                    title={
                      <span>
                        <Tag color={getStatusColor(selectedDoctor.status)} style={{ marginRight: 8 }}>
                          {selectedDoctor.status}
                        </Tag>
                        Status Information
                      </span>
                    }
                    size="small"
                  >
                    <div>
                      <strong>Verified:</strong> <Tag color={selectedDoctor.isVerified ? "success" : "warning"}>
                        {selectedDoctor.isVerified ? "Verified" : "Pending"}
                      </Tag><br />
                      <strong>Deleted:</strong> <Tag color={selectedDoctor.isDeleted ? "error" : "success"}>
                        {selectedDoctor.isDeleted ? "Yes" : "No"}
                      </Tag><br />
                      <strong>Rejection Reason:</strong> {selectedDoctor.rejectionReason || "N/A"}<br />
                      <strong>Created At:</strong> {formatDate(selectedDoctor.createdAt)}
                    </div>
                  </Card>
                </Col>
              </Row>

              <Card 
                title={
                  <span>
                    <MedicineBoxOutlined style={{ marginRight: 8 }} />
                    Specialization
                  </span>
                }
                size="small"
                style={{ marginTop: "16px" }}
              >
                {(() => {
                  const specializations = Array.isArray(selectedDoctor.specialization) 
                    ? selectedDoctor.specialization 
                    : selectedDoctor.specialization ? [selectedDoctor.specialization] : [];
                  
                  if (specializations.length === 0) {
                    return <div style={{ color: "#8c8c8c" }}>No specialization information available</div>;
                  }

                  return specializations.map((spec, index) => (
                    <div key={spec._id || index} style={{ 
                      border: "1px solid #e8e8e8", 
                      borderRadius: "6px", 
                      padding: "12px", 
                      marginBottom: "12px",
                      backgroundColor: "#fafafa"
                    }}>
                      <Row gutter={[16, 8]}>
                        <Col xs={24} md={8}>
                          <strong>Name:</strong> {spec.name || "N/A"}
                        </Col>
                        <Col xs={24} md={8}>
                          <strong>Experience:</strong> {spec.experience || 0} years
                        </Col>
                        <Col xs={24} md={8}>
                          <strong>ID:</strong> {spec.id || "N/A"}
                        </Col>
                      </Row>
                      <div style={{ marginTop: "12px" }}>
                        <strong>Certificates:</strong>
                        <div style={{ marginTop: "8px" }}>
                          {spec.drgreeCertificate?.data && (
                            <Button
                              type="link"
                              size="small"
                              onClick={() => showImageModal(`data:${spec.drgreeCertificate?.mimeType};base64,${spec.drgreeCertificate?.data}`)}
                            >
                              View Degree Certificate
                            </Button>
                          )}
                          {spec.specializationCertificate?.data && (
                            <Button
                              type="link"
                              size="small"
                              onClick={() => showImageModal(`data:${spec.specializationCertificate?.mimeType};base64,${spec.specializationCertificate?.data}`)}
                            >
                              View Specialization Certificate
                            </Button>
                          )}
                          {!spec.drgreeCertificate?.data && !spec.specializationCertificate?.data && (
                            <span style={{ color: "#8c8c8c", fontStyle: "italic" }}>
                              No certificates available
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ));
                })()}
              </Card>

              <Card 
                title={
                  <span>
                    <MedicineBoxOutlined style={{ marginRight: 8 }} />
                    Practice
                  </span>
                }
                size="small"
                style={{ marginTop: "16px" }}
              >
                <div style={{ color: "#8c8c8c", fontStyle: "italic" }}>
                  Coming soon
                </div>
              </Card>

              {selectedDoctor.consultationModeFee && selectedDoctor.consultationModeFee.length > 0 && (
                <Card 
                  title={
                    <span>
                      <DollarOutlined style={{ marginRight: 8 }} />
                      Consultation Fees
                    </span>
                  }
                  size="small"
                  style={{ marginTop: "16px" }}
                >
                  {selectedDoctor.consultationModeFee.map((fee, index) => (
                    <div key={fee._id || index} style={{ 
                      display: "flex", 
                      justifyContent: "space-between", 
                      padding: "8px 0",
                      borderBottom: index < selectedDoctor.consultationModeFee.length - 1 ? "1px solid #f0f0f0" : "none"
                    }}>
                      <span>{fee.type}</span>
                      <span style={{ fontWeight: 500 }}>
                        {fee.currency} {fee.fee}
                      </span>
                    </div>
                  ))}
                </Card>
              )}

              {selectedDoctor.bankDetails && (
                <Card 
                  title={
                    <span>
                      <BankOutlined style={{ marginRight: 8 }} />
                      Bank Details
                    </span>
                  }
                  size="small"
                  style={{ marginTop: "16px" }}
                >
                  <Row gutter={16}>
                    <Col xs={24} md={8}>
                      <strong>Bank Name:</strong> {selectedDoctor.bankDetails.bankName || "N/A"}
                    </Col>
                    <Col xs={24} md={8}>
                      <strong>Account Holder:</strong> {selectedDoctor.bankDetails.accountHolderName || "N/A"}
                    </Col>
                    <Col xs={24} md={8}>
                      <strong>Account Number:</strong> {selectedDoctor.bankDetails.accountNumber || "N/A"}
                    </Col>
                    <Col xs={24} md={8} style={{ marginTop: "8px" }}>
                      <strong>IFSC Code:</strong> {selectedDoctor.bankDetails.ifscCode || "N/A"}
                    </Col>
                  </Row>
                </Card>
              )}

              <Card 
                title={
                  <span>
                    <IdcardOutlined style={{ marginRight: 8 }} />
                    KYC Details
                  </span>
                }
                size="small"
                style={{ marginTop: "16px" }}
              >
                <div style={{ color: "#8c8c8c", fontStyle: "italic" }}>
                  Coming soon
                </div>
              </Card>
            </div>
          )}
        </Modal>

        {/* Image Modal */}
        <Modal
          title="Certificate View"
          open={imageModalVisible}
          onCancel={() => setImageModalVisible(false)}
          footer={null}
          width={800}
          centered
        >
          <div style={{ textAlign: "center" }}>
            <img
              src={selectedImage}
              alt="Certificate"
              style={{
                maxWidth: "100%",
                maxHeight: "600px",
                objectFit: "contain",
              }}
            />
          </div>
        </Modal>

        {/* Specialization Modal */}
        <Modal
          title={`Specialization Details - ${selectedDoctorName}`}
          open={specializationModalVisible}
          onCancel={() => setSpecializationModalVisible(false)}
          footer={null}
          width={700}
          centered
        >
          <div style={{ maxHeight: "60vh", overflowY: "auto" }}>
            {selectedSpecializations.map((specialization, index) => (
              <div
                key={specialization._id || index}
                style={{
                  border: "1px solid #e8e8e8",
                  borderRadius: "8px",
                  padding: "16px",
                  marginBottom: "16px",
                  backgroundColor: "#fafafa",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "12px",
                    marginBottom: "16px",
                  }}
                >
                  <div>
                    <strong>Specialization:</strong>
                    <div style={{ marginTop: "4px", color: "#595959" }}>
                      {specialization.name || "Not specified"}
                    </div>
                  </div>
                  <div>
                    <strong>Experience:</strong>
                    <div style={{ marginTop: "4px", color: "#595959" }}>
                      {specialization.experience || 0} years
                    </div>
                  </div>
                  <div>
                    <strong>ID:</strong>
                    <div style={{ marginTop: "4px", color: "#595959" }}>
                      {specialization.id || "Not available"}
                    </div>
                  </div>
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <div>
                    <strong>Certificates:</strong>
                    <div
                      style={{
                        marginTop: "8px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                      }}
                    >
                      {specialization.drgreeCertificate &&
                      specialization.drgreeCertificate.data ? (
                        <Button
                          type="link"
                          size="small"
                          onClick={() => showImageModal(`data:${specialization.drgreeCertificate?.mimeType};base64,${specialization.drgreeCertificate?.data}`)}
                        >
                          View Degree Certificate
                        </Button>
                      ) : null}

                      {specialization.specializationCertificate &&
                      specialization.specializationCertificate?.data ? (
                        <Button
                          type="link"
                          size="small"
                          onClick={() => showImageModal(`data:${specialization.specializationCertificate?.mimeType};base64,${specialization.specializationCertificate?.data}`)}
                        >
                          View Specialization Certificate
                        </Button>
                      ) : null}

                      {(!specialization.drgreeCertificate ||
                        !specialization.drgreeCertificate.data) &&
                        (!specialization.specializationCertificate ||
                          !specialization.specializationCertificate.data) && (
                          <span
                            style={{ color: "#8c8c8c", fontStyle: "italic" }}
                          >
                            No certificates available
                          </span>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {selectedSpecializations.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  color: "#8c8c8c",
                  padding: "40px",
                }}
              >
                No specialization details available
              </div>
            )}
          </div>
        </Modal>
      </Spin>
    </div>
  );
};

export default DoctorList;