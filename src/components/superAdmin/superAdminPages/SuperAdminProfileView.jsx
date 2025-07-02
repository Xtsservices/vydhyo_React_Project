import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Card,
  Avatar,
  Button,
  Row,
  Col,
  Tag,
  Space,
  Typography,
  Modal,
  message,
  Spin,
  Input,
} from "antd";
const { TextArea } = Input;

import {
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  CalendarOutlined,
  MedicineBoxOutlined,
  BankOutlined,
  IdcardOutlined,
  EnvironmentOutlined,
  DollarOutlined,
  HomeOutlined,
  VideoCameraOutlined,
  CarOutlined,
  EyeOutlined,
  ManOutlined,
} from "@ant-design/icons";
import { apiPut } from "../../api";

const { Title, Text } = Typography;

// Constants
const API_BASE_URL = "http://192.168.1.44:3000";

// Custom hooks
const useLocalStorage = (key) => {
  return localStorage.getItem(key);
};

const DoctorProfileView = () => {
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [doctorData, setDoctorData] = useState(null);
  const [approveModalVisible, setApproveModalVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [reason, setReason] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  const { userId, doctorId } = location.state || {};

  console.log("Doctor ID from URL:", doctorId); 
  // Fetch doctor details from API
  const fetchDoctorDetails = async () => {
    console.log("Fetching doctor details for ID:", doctorId);
    console.log("Fetching doctor details for ID:", !doctorId);
    if (!doctorId || !userId ) {
      message.error("No doctor ID provided.");
      navigate("/SuperAdmin/doctor-onboarding");
      return;
      
    }

    setLoading(true);
    try {
      const token = useLocalStorage("accessToken");
      if (!token) {
        message.error("No authentication token found. Please login again.");
        navigate("/login");
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/users/AllUsers?type=doctor&id=${doctorId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          message.error("Session expired. Please login again.");
          navigate("/login");
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("API Response:", data); // Debug: Log the API response

      let doctor = null;
      if (data.status === "success" && data.data) {
        if (Array.isArray(data.data)) {
          doctor = data.data.find((doc) => doc._id === doctorId);
          if (!doctor) {
            throw new Error("No doctor found with the provided ID.");
          }
        } else {
          if (data.data._id !== doctorId) {
            throw new Error("Doctor ID mismatch in response.");
          }
          doctor = data.data;
        }
      } else {
        throw new Error("Invalid data format");
      }

      // Normalize doctor data
      setDoctorData({
        ...doctor,
        key: doctor._id,
        firstname: doctor.firstname || "N/A",
        lastname: doctor.lastname || "",
        specialization: Array.isArray(doctor.specialization)
          ? doctor.specialization
          : [doctor.specialization || {}],
        email: doctor.email || "N/A",
        mobile: doctor.mobile || "N/A",
        status: doctor.status || "pending",
        medicalRegistrationNumber: doctor.medicalRegistrationNumber || "N/A",
        userId: doctor.userId || "N/A",
        createdAt: doctor.createdAt,
        consultationModeFee: Array.isArray(doctor.consultationModeFee)
          ? doctor.consultationModeFee
          : [],
        spokenLanguage: Array.isArray(doctor.spokenLanguage)
          ? doctor.spokenLanguage
          : [],
        gender: doctor.gender || "N/A",
        DOB: doctor.DOB || "N/A",
        bloodgroup: doctor.bloodgroup || "N/A",
        maritalStatus: doctor.maritalStatus || "N/A",
        workingLocations: Array.isArray(doctor.workingLocations)
          ? doctor.workingLocations
          : [],
        bankDetails: doctor.bankDetails || {},
        kycDetails: doctor.kycDetails || {},
        certifications: Array.isArray(doctor.certifications)
          ? doctor.certifications
          : [],
        profilepic: doctor.profilepic || null,
        isVerified: doctor.isVerified || false,
      });
    } catch (error) {
      console.error("Error fetching doctor details:", error);
      message.error("Failed to fetch doctor details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch doctor details on component mount
  useEffect(() => {
    fetchDoctorDetails();
  }, []);


  const showModal = (doc) => {
    setSelectedDocument(doc);
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
    setSelectedDocument(null);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedDocument(null);
  };

  const getImageSrc = (image) => {
    if (image?.data && image?.mimeType) {
      return `data:${image.mimeType};base64,${image.data}`;
    }
    return null;
  };

  if (!doctorData) {
    return <Spin spinning={loading} tip="Loading doctor details..." />;
  }

  const updateDoctorStatus = async (newStatus) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        message.error("No authentication token found");
        return;
      }

      //here define body based on newStatus
      if (newStatus === "rejected" && !reason) {
        message.error("Please provide a reason for rejection");   
        return;
      }

        // Build request body
    const body = {
      userId: userId,
      status: newStatus === "active" ? "approved" : "rejected",
    };

    if (newStatus === "rejected" && reason) {
      body.rejectionReason = reason;
    }
      const response = await apiPut("/admin/approveDoctor", JSON.stringify(body) )

      console.log("Doctor status updated successfully:", newStatus);
      if (newStatus === "active") {
        setApproveModalVisible(false)
      } else if (newStatus === "inactive") {
        setRejectModalVisible(false)
      }
      navigate("/SuperAdmin/doctors"); 
    } finally {
      setUpdatingStatus(null);
    }
  };

  return (
    <div
      style={{
        padding: "16px",
        backgroundColor: "#f8f9fa",
        minHeight: "100vh",
      }}
    >
      <Spin spinning={loading}>
        <Row gutter={[16, 16]}>
          {/* Personal Information */}
          <Col xs={24} lg={12}>
            <Card
              title={
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "8px 0",
                    fontSize: "18px",
                    fontWeight: "600",
                    fontFamily: "Inter",
                    lineHeight: "100%",
                    letterSpacing: "0%",
                    color: "#1f2937",
                  }}
                >
                  <UserOutlined
                    style={{ marginRight: "8px", color: "#3b82f6" }}
                  />
                  Personal Information
                </div>
              }
              style={{
                height: "100%",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
              headStyle={{
                backgroundColor: "#ffffff",
                border: "none",
                borderBottom: "1px solid #e5e7eb",
              }}
              bodyStyle={{ padding: "20px" }}
            >
              <div style={{ textAlign: "center", marginBottom: "24px" }}>
                <Avatar
                  size={64}
                  src={getImageSrc(doctorData.profilepic)}
                  style={{
                    backgroundColor: "#6366f1",
                    fontSize: "24px",
                    fontWeight: "500",
                  }}
                >
                  {`${doctorData.firstname?.[0] ?? ""}${
                    doctorData.lastname?.[0] ?? ""
                  }`}
                </Avatar>
                <Title
                  level={4}
                  style={{
                    margin: "12px 0 4px 0",
                    fontSize: "18px",
                    color: "#1f2937",
                  }}
                >
                  Dr. {doctorData.firstname} {doctorData.lastname}
                </Title>
                <Text
                  style={{
                    color: "#6b7280",
                    fontSize: "14px",
                    display: "block",
                  }}
                >
                  Medical Registration: {doctorData.medicalRegistrationNumber}
                </Text>
                <Text
                  style={{
                    color: "#6b7280",
                    fontSize: "14px",
                    display: "block",
                  }}
                >
                  Mobile Number: {doctorData.mobile}
                </Text>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "8px",
                  }}
                >
                  <CalendarOutlined
                    style={{ marginRight: 8, color: "#6b7280" }}
                  />
                  <Text style={{ fontSize: "14px", color: "#374151" }}>
                    <strong>Date of Birth:</strong> {doctorData.DOB}
                  </Text>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "8px",
                  }}
                >
                  <ManOutlined style={{ marginRight: 8, color: "#6b7280" }} />
                  <Text style={{ fontSize: "14px", color: "#374151" }}>
                    <strong>Gender:</strong> {doctorData.gender}
                  </Text>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "8px",
                  }}
                >
                  <Text
                    style={{
                      fontSize: "14px",
                      color: "#374151",
                      marginLeft: "24px",
                    }}
                  >
                    <strong>Blood Group:</strong> {doctorData.bloodgroup}
                  </Text>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "8px",
                  }}
                >
                  <Text
                    style={{
                      fontSize: "14px",
                      color: "#374151",
                      marginLeft: "24px",
                    }}
                  >
                    <strong>Marital Status:</strong> {doctorData.maritalStatus}
                  </Text>
                </div>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "8px",
                  }}
                >
                  <MailOutlined style={{ marginRight: 8, color: "#6b7280" }} />
                  <Text style={{ fontSize: "14px", color: "#374151" }}>
                    <strong>Email:</strong> {doctorData.email}
                  </Text>
                </div>
              </div>

              <div>
                <Text strong style={{ fontSize: "14px", color: "#374151" }}>
                  Languages:
                </Text>
                <div style={{ marginTop: "8px" }}>
                  {doctorData.spokenLanguage.map((lang, index) => (
                    <Tag
                      key={index}
                      style={{
                        marginBottom: "4px",
                        marginRight: "8px",
                        backgroundColor: "#DBEAFE",
                        color: "#1E40AF",
                        border: "1px solid #d1d5db",
                        borderRadius: "10px",
                      }}
                    >
                      {lang}
                    </Tag>
                  ))}
                </div>
              </div>
            </Card>
          </Col>

          {/* Professional Summary */}
          <Col xs={24} lg={12}>
            <Card
              title={
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "8px 0",
                    fontSize: "16px",
                    fontWeight: "600",
                    color: "#1f2937",
                  }}
                >
                  <MedicineBoxOutlined
                    style={{ marginRight: "8px", color: "#3b82f6" }}
                  />
                  Professional Summary
                </div>
              }
              style={{
                height: "100%",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
              headStyle={{
                backgroundColor: "#ffffff",
                border: "none",
                borderBottom: "1px solid #e5e7eb",
              }}
              bodyStyle={{ padding: "20px" }}
            >
              <div style={{ marginBottom: "20px" }}>
                <Text
                  strong
                  style={{
                    fontSize: "14px",
                    color: "#166534",
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "600",
                  }}
                >
                  Specializations
                </Text>
                <div>
                  {doctorData.specialization.map((spec, index) => (
                    <Tag
                      key={index}
                      style={{
                        marginBottom: "6px",
                        marginRight: "8px",
                        backgroundColor: "#dcfce7",
                        color: "#166534",
                        border: "1px solid #bbf7d0",
                        borderRadius: "6px",
                        padding: "4px 8px",
                      }}
                    >
                      {spec.name || "Not specified"}
                    </Tag>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <Text
                  strong
                  style={{
                    fontSize: "14px",
                    color: "#374151",
                    display: "block",
                    marginBottom: "8px",
                  }}
                >
                  Work Experience
                </Text>
                <div
                  style={{
                    backgroundColor: "#f0f9ff",
                    padding: "16px",
                    borderRadius: "8px",
                    textAlign: "center",
                    border: "1px solid #e0f2fe",
                  }}
                >
                  <Title
                    level={2}
                    style={{
                      margin: 0,
                      color: "#0369a1",
                      fontSize: "32px",
                      fontWeight: "700",
                    }}
                  >
                    {doctorData.specialization[0]?.experience || 0} Years
                  </Title>
                </div>
              </div>

              <div>
                <Text
                  strong
                  style={{
                    fontSize: "14px",
                    color: "#374151",
                    display: "block",
                    marginBottom: "12px",
                  }}
                >
                  Certifications
                </Text>
                {doctorData.certifications.map((cert, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "12px 0",
                      borderBottom:
                        index < doctorData.certifications.length - 1
                          ? "1px solid #3f4f6"
                          : "none",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontWeight: "500",
                          fontSize: "14px",
                          color: "#374151",
                          marginBottom: "2px",
                        }}
                      >
                        {cert.name || "N/A"}
                      </div>
                      <Text style={{ fontSize: "12px", color: "#6b7280" }}>
                        {cert.registrationNo || cert.type || "N/A"}
                      </Text>
                    </div>
                    <Button
                      type="link"
                      size="small"
                      icon={<EyeOutlined style={{ color: "#3b82f6" }} />}
                      onClick={() =>
                        showModal({ type: "certificate", data: cert })
                      }
                      style={{ padding: "4px 8px" }}
                    />
                  </div>
                ))}
              </div>
            </Card>
          </Col>

          {/* Working Locations */}
          <Col xs={24} lg={12}>
            <Card
              title={
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "8px 0",
                    fontSize: "16px",
                    fontWeight: "600",
                    color: "#1f2937",
                  }}
                >
                  <EnvironmentOutlined
                    style={{ marginRight: "8px", color: "#3b82f6" }}
                  />
                  Working Locations
                </div>
              }
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
              headStyle={{
                backgroundColor: "#ffffff",
                border: "none",
                borderBottom: "1px solid #e5e7eb",
              }}
              bodyStyle={{ padding: "20px" }}
            >
              {doctorData.workingLocations.map((location, index) => (
                <div
                  key={index}
                  style={{
                    marginBottom:
                      index < doctorData.workingLocations.length - 1
                        ? "16px"
                        : "0",
                    padding: "16px",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    backgroundColor: "#ffffff",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start" }}>
                    <EnvironmentOutlined
                      style={{
                        color: "#3b82f6",
                        fontSize: "16px",
                        marginRight: "12px",
                        marginTop: "2px",
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <Text
                        strong
                        style={{
                          fontSize: "14px",
                          color: "#374151",
                          display: "block",
                          marginBottom: "4px",
                        }}
                      >
                        {location.name || "N/A"}
                      </Text>
                      <Text style={{ fontSize: "12px", color: "#6b7280" }}>
                        {location.address || "N/A"}
                      </Text>
                    </div>
                  </div>
                </div>
              ))}
            </Card>
          </Col>

          {/* KYC Details */}
          <Col xs={24} lg={12}>
            <Card
              title={
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "8px 0",
                    fontSize: "16px",
                    fontWeight: "600",
                    color: "#1f2937",
                  }}
                >
                  <IdcardOutlined
                    style={{ marginRight: "8px", color: "#3b82f6" }}
                  />
                  KYC Details
                </div>
              }
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
              headStyle={{
                backgroundColor: "#ffffff",
                border: "none",
                borderBottom: "1px solid #e5e7eb",
              }}
              bodyStyle={{ padding: "20px" }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "16px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center" }}>
                  <IdcardOutlined
                    style={{ marginRight: 8, color: "#6b7280" }}
                  />
                  <div>
                    <Text strong style={{ fontSize: "14px", color: "#374151" }}>
                      PAN Number:
                    </Text>
                    <Text
                      style={{
                        fontSize: "14px",
                        color: "#374151",
                        marginLeft: "8px",
                      }}
                    >
                      {doctorData.kycDetails.panNumber || "N/A"}
                    </Text>
                  </div>
                </div>
                {doctorData.kycDetails.panImage && (
                  <Button
                    type="link"
                    size="small"
                    icon={<EyeOutlined style={{ color: "#3b82f6" }} />}
                    onClick={() =>
                      showModal({
                        type: "pan",
                        data: doctorData.kycDetails.panImage,
                      })
                    }
                    style={{ padding: "4px 8px" }}
                  />
                )}
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", alignItems: "center" }}>
                  <IdcardOutlined
                    style={{ marginRight: 8, color: "#6b7280" }}
                  />
                  <div>
                    <Text strong style={{ fontSize: "14px", color: "#374151" }}>
                      Voter ID:
                    </Text>
                    <Text
                      style={{
                        fontSize: "14px",
                        color: "#374151",
                        marginLeft: "8px",
                      }}
                    >
                      {doctorData.kycDetails.voterId || "N/A"}
                    </Text>
                  </div>
                </div>
                {doctorData.kycDetails.voterIdImage && (
                  <Button
                    type="link"
                    size="small"
                    icon={<EyeOutlined style={{ color: "#3b82f6" }} />}
                    onClick={() =>
                      showModal({
                        type: "voterId",
                        data: doctorData.kycDetails.voterIdImage,
                      })
                    }
                    style={{ padding: "4px 8px" }}
                  />
                )}
              </div>
            </Card>
          </Col>

          {/* Consultation Charges */}
          <Col xs={24} lg={12}>
            <Card
              title={
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "8px 0",
                    fontSize: "18px",
                    fontWeight: "600",
                    fontFamily: "Inter",
                    lineHeight: "100%",
                    letterSpacing: "0%",
                    color: "#1f2937",
                  }}
                >
                  <DollarOutlined
                    style={{ marginRight: "8px", color: "#3b82f6" }}
                  />
                  Consultation Charges
                </div>
              }
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
              headStyle={{
                backgroundColor: "#ffffff",
                border: "none",
                borderBottom: "1px solid #e5e7eb",
              }}
              bodyStyle={{ padding: "20px" }}
            >
              {doctorData.consultationModeFee.map((mode, index) => (
                <div
                  key={index}
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    padding: "16px",
                    backgroundColor:
                      index === 0
                        ? "#f0f9ff"
                        : index === 1
                        ? "#f0fdf4"
                        : "#faf5ff",
                    marginBottom: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center" }}>
                    {mode.type === "In-Person Consultation" && (
                      <UserOutlined
                        style={{
                          fontSize: "20px",
                          color: "#3b82f6",
                          marginRight: "12px",
                        }}
                      />
                    )}
                    {mode.type === "Video Call" && (
                      <VideoCameraOutlined
                        style={{
                          fontSize: "20px",
                          color: "#16a34a",
                          marginRight: "12px",
                        }}
                      />
                    )}
                    {mode.type === "Home Visit" && (
                      <CarOutlined
                        style={{
                          fontSize: "20px",
                          color: "#9333ea",
                          marginRight: "12px",
                        }}
                      />
                    )}
                    <div>
                      <Text
                        strong
                        style={{
                          display: "block",
                          fontSize: "14px",
                          color: "#374151",
                        }}
                      >
                        {mode.type}
                      </Text>
                      <Text style={{ fontSize: "12px", color: "#6b7280" }}>
                        {mode.description || "N/A"}
                      </Text>
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: "24px",
                      fontWeight: "bold",
                      color: "#1f2937",
                    }}
                  >
                    {mode.currency}
                    {mode.fee}
                  </div>
                </div>
              ))}
            </Card>
          </Col>

          {/* Bank & KYC Details */}
          <Col xs={24} lg={12}>
            <Card
              title={
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "8px 0",
                    fontSize: "16px",
                    fontWeight: "600",
                    color: "#1f2937",
                  }}
                >
                  <BankOutlined
                    style={{ marginRight: "8px", color: "#3b82f6" }}
                  />
                  Bank & KYC Details
                </div>
              }
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
              headStyle={{
                backgroundColor: "#ffffff",
                border: "none",
                borderBottom: "1px solid #e5e7eb",
              }}
              bodyStyle={{ padding: "20px" }}
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <div style={{ marginBottom: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <BankOutlined
                        style={{ marginRight: 8, color: "#6b7280" }}
                      />
                      <Text
                        strong
                        style={{ fontSize: "14px", color: "#374151" }}
                      >
                        Bank:
                      </Text>
                      <Text
                        style={{
                          fontSize: "14px",
                          color: "#374151",
                          marginLeft: "8px",
                        }}
                      >
                        {doctorData.bankDetails.bankName || "N/A"}
                      </Text>
                    </div>
                  </div>
                  <div style={{ marginBottom: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <UserOutlined
                        style={{ marginRight: 8, color: "#6b7280" }}
                      />
                      <Text
                        strong
                        style={{ fontSize: "14px", color: "#374151" }}
                      >
                        Account Holder:
                      </Text>
                      <Text
                        style={{
                          fontSize: "14px",
                          color: "#374151",
                          marginLeft: "8px",
                        }}
                      >
                        {doctorData.bankDetails.accountHolderName || "N/A"}
                      </Text>
                    </div>
                  </div>
                </Col>
                <Col xs={24} md={12}>
                  <div style={{ marginBottom: "12px" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <div>
                        <Text
                          strong
                          style={{ fontSize: "14px", color: "#374151" }}
                        >
                          Account Number:
                        </Text>
                        <Text
                          style={{
                            fontSize: "14px",
                            color: "#374151",
                            marginLeft: "8px",
                          }}
                        >
                          {doctorData.bankDetails.accountNumber || "N/A"}
                        </Text>
                      </div>
                      {doctorData.bankDetails.accountProof && (
                        <Button
                          type="link"
                          size="small"
                          icon={<EyeOutlined style={{ color: "#3b82f6" }} />}
                          onClick={() =>
                            showModal({
                              type: "accountProof",
                              data: doctorData.bankDetails.accountProof,
                            })
                          }
                          style={{ padding: "4px 8px" }}
                        />
                      )}
                    </div>
                  </div>
                  <div style={{ marginBottom: "12px" }}>
                    <Text strong style={{ fontSize: "14px", color: "#374151" }}>
                      Bank IFSC:
                    </Text>
                    <Text
                      style={{
                        fontSize: "14px",
                        color: "#374151",
                        marginLeft: "8px",
                      }}
                    >
                      {doctorData.bankDetails.ifscCode || "N/A"}
                    </Text>
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>

          {/* Action Buttons */}
          <Col xs={24}>
            <div
              style={{
                textAlign: "right",
                padding: "20px",
                backgroundColor: "white",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
              }}
            >
              <Space size="large">
                <Button
                  size="large"
                  loading={actionLoading === "reject"}
                  onClick={() => {
                    setRejectModalVisible(true);
                  }}
                  style={{
                    minWidth: "140px",
                    backgroundColor: "#dc2626",
                    borderColor: "#dc2626",
                    color: "white",
                    fontWeight: "500",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "#b91c1c";
                    e.target.style.borderColor = "#b91c1c";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "#dc2626";
                    e.target.style.borderColor = "#dc2626";
                  }}
                >
                  Reject Request
                </Button>
                <Button
                  size="large"
                  loading={actionLoading === "approve"}
                  onClick={() => {setApproveModalVisible(true)}}
                  style={{
                    minWidth: "140px",
                    backgroundColor: "#16a34a",
                    borderColor: "#16a34a",
                    color: "white",
                    fontWeight: "500",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "#15803d";
                    e.target.style.borderColor = "#15803d";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "#16a34a";
                    e.target.style.borderColor = "#16a34a";
                  }}
                >
                  Accept Request
                </Button>
              </Space>
            </div>
          </Col>
        </Row>

        <Modal
          title={
            selectedDocument?.type === "certificate"
              ? selectedDocument.data.name
              : selectedDocument?.type || "Document"
          }
          open={isModalVisible}
          onOk={handleOk}
          onCancel={handleCancel}
          footer={[
            <Button key="close" onClick={handleCancel}>
              Close
            </Button>,
          ]}
          width={600}
        >
          {selectedDocument && (
            <div style={{ textAlign: "center" }}>
              {selectedDocument.data?.image ? (
                <img
                  src={getImageSrc(selectedDocument.data.image)}
                  alt={selectedDocument.type}
                  style={{
                    width: "100%",
                    maxWidth: "500px",
                    height: "auto",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
              ) : (
                <div>
                  {selectedDocument.type === "certificate" ? (
                    <>
                      <Text style={{ fontSize: "14px", color: "#374151" }}>
                        <strong>Name:</strong>{" "}
                        {selectedDocument.data.name || "N/A"}
                      </Text>
                      <br />
                      <Text style={{ fontSize: "14px", color: "#374151" }}>
                        <strong>Registration/Type:</strong>{" "}
                        {selectedDocument.data.registrationNo ||
                          selectedDocument.data.type ||
                          "N/A"}
                      </Text>
                      {selectedDocument.data.details && (
                        <>
                          <br />
                          <Text style={{ fontSize: "14px", color: "#374151" }}>
                            <strong>Date:</strong>{" "}
                            {selectedDocument.data.details.date || "N/A"}
                          </Text>
                          <br />
                          <Text style={{ fontSize: "14px", color: "#374151" }}>
                            <strong>Location:</strong>{" "}
                            {selectedDocument.data.details.location || "N/A"}
                          </Text>
                          <br />
                          <Text style={{ fontSize: "14px", color: "#374151" }}>
                            <strong>Patient:</strong>{" "}
                            {selectedDocument.data.details.patient || "N/A"}
                          </Text>
                          <br />
                          <Text style={{ fontSize: "14px", color: "#374151" }}>
                            <strong>Condition:</strong>{" "}
                            {selectedDocument.data.details.condition || "N/A"}
                          </Text>
                          <br />
                          <Text style={{ fontSize: "14px", color: "#374151" }}>
                            <strong>Duration:</strong>{" "}
                            {selectedDocument.data.details.duration || "N/A"}
                          </Text>
                        </>
                      )}
                    </>
                  ) : (
                    <Text style={{ fontSize: "14px", color: "#374151" }}>
                      No image available for this document.
                    </Text>
                  )}
                </div>
              )}
            </div>
          )}
        </Modal>

        {/* approve modal */}
        <Modal
          title="Approve Doctor"
          open={approveModalVisible}
          onCancel={() => setApproveModalVisible(false)}
          footer={
            <div style={{ display: "flex", justifyContent: "flex-end"  }}>
              <Button onClick={() => setApproveModalVisible(false)}>
                Cancel
              </Button>
              <Button
                style={{ marginLeft: "8px" }}
                type="primary"
                onClick={() => {
                  updateDoctorStatus("active");
                  setApproveModalVisible(false);
                }}
              >
                Yes, Approve
              </Button>
            </div>
          }
        >
          <p>Are you sure you want to approve this doctor?</p>
        </Modal>

        {/* reject modal */}
        <Modal
      title="Reject Doctor"
      open={rejectModalVisible}
      onCancel={() => {
        setRejectModalVisible(false);
        setReason("");
      }}
      footer={
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button onClick={() => setRejectModalVisible(false)}>Cancel</Button>
          <Button type="primary" style={{ marginLeft: 8 }} 
          onClick={() =>{
              updateDoctorStatus("rejected")
          }}>
            Yes, Reject
          </Button>
        </div>
      }
    >
      <p>Please provide a reason for rejecting this doctor:</p>
      <TextArea
        rows={4}
        placeholder="Enter reason..."
        value={reason}
        onChange={(e) => setReason(e.target.value)}
      />
    </Modal>
      </Spin>
    </div>
  );
};

export default DoctorProfileView;
