import React, { useState, useEffect } from "react";
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
  VideoCameraOutlined,
  CarOutlined,
  EyeOutlined,
  ManOutlined,
} from "@ant-design/icons";
import { apiGet, apiPut } from "../../api";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const { Title, Text } = Typography;

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
  const [clinics, setClinics] = useState([]); // New state for clinics
  const location = useLocation();
  const navigate = useNavigate();

  const { userId, doctorId, statusFilter } = location.state || {};

  // Fetch doctor details and clinics from API
  const fetchDoctorDetails = async () => {
    if (!doctorId || !userId) {
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

      // Fetch doctor details
      const doctorResponse = await apiGet(
        `users/AllUsers?type=doctor&id=${doctorId}&status=${statusFilter || "all"}`
      );

      const doctorDataResponse = doctorResponse.data;

      let doctor = null;
      if (doctorDataResponse.status === "success" && doctorDataResponse.data) {
        if (Array.isArray(doctorDataResponse.data)) {
          doctor = doctorDataResponse.data.find((doc) => doc._id === doctorId);
          if (!doctor) {
            throw new Error("No doctor found with the provided ID.");
          }
        } else {
          if (doctorDataResponse.data._id !== doctorId) {
            throw new Error("Doctor ID mismatch in response.");
          }
          doctor = doctorDataResponse.data;
        }
      } else {
        throw new Error("Invalid data format");
      }

      // Fetch KYC details
      const kycResponse = await apiGet(`users/getKycByUserId?userId=${userId}`);
      const kycData = kycResponse.data;

      if (kycData.status !== "success") {
        throw new Error("Failed to fetch KYC details.");
      }

      // Fetch clinic addresses
      const clinicResponse = await apiGet(
        `/users/getClinicAddress?doctorId=${doctorId}`
      );
      const clinicData = clinicResponse.data;

      let activeClinics = [];
      if (clinicData.status === "success") {
        activeClinics = clinicData.data
          .filter(
            (address) =>
              address.type === "Clinic" &&
              address.status?.toLowerCase() === "active"
          )
          .map((address) => ({
            label: address.clinicName,
            value: address.addressId,
            address: address.location,
            startTime: address.startTime,
            endTime: address.endTime,
          }));
      } else {
        toast.error("No clinics found for the doctor.");
      }
      setClinics(activeClinics);

      // Normalize doctor data with KYC details
      const kycDetails = kycData.data
        ? {
            panNumber: kycData.data.pan?.number || "N/A",
            panImage: kycData.data.pan?.attachmentUrl?.data || null,
            panStatus: kycData.data.pan?.status || "pending",
            kycVerified: kycData.data.kycVerified || false,
          }
        : {
            panNumber: "N/A",
            panImage: null,
            panStatus: "pending",
            kycVerified: false,
          };

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
        bankDetails: doctor.bankDetails || {},
        kycDetails: kycDetails,
        certifications: Array.isArray(doctor.certifications)
          ? doctor.certifications
          : [],
        profilepic: doctor.profilepic || null,
        isVerified: doctor.isVerified || false,
      });
    } catch (error) {
      console.error("Error fetching doctor, KYC, or clinic details:", error);
      message.error(
        "Failed to fetch doctor, KYC, or clinic details. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch doctor details and clinics on component mount
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

  const updateDoctorStatus = async (newStatus) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        message.error("No authentication token found");
        toast.error("No authentication token found");
        return;
      }

      if (newStatus === "rejected" && !reason) {
        message.error("Please provide a reason for rejection");
        toast.error("Please provide a reason for rejection");
        return;
      }

      const body = {
        userId: userId,
        status: newStatus === "active" ? "approved" : "rejected",
      };

      if (newStatus === "rejected" && reason) {
        body.rejectionReason = reason;
      }

      const response = await apiPut("/admin/approveDoctor", JSON.stringify(body));

      if (response?.data?.status === "success") {
        if (newStatus === "active") {
          toast.success("Doctor has been approved successfully.");
          message.success("Doctor has been approved successfully.");
          setApproveModalVisible(false);
        } else {
          toast.error("Doctor has been rejected.");
          message.error("Doctor has been rejected.");
          setRejectModalVisible(false);
        }
        navigate("/SuperAdmin/doctors");
      } else {
        toast.warning("Failed to update doctor status.");
        message.warning("Failed to update doctor status.");
      }
    } catch (error) {
      console.error("Error updating doctor status:", error);
      toast.error("An error occurred while updating the status.");
      message.error("An error occurred while updating the status.");
    } finally {
      setActionLoading(null);
    }
  };

  if (!doctorData) {
    return <Spin spinning={loading} tip="Loading doctor details..." />;
  }

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

          {/* Clinics */}
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
                  Clinics
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
              {clinics.length > 0 ? (
                clinics.map((clinic, index) => (
                  <div
                    key={index}
                    style={{
                      marginBottom:
                        index < clinics.length - 1 ? "16px" : "0",
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
                          {clinic.label || "N/A"}
                        </Text>
                        <Text style={{ fontSize: "12px", color: "#6b7280" }}>
                          {clinic.address || "N/A"}
                        </Text>
                        <Text
                          style={{
                            fontSize: "12px",
                            color: "#6b7280",
                            display: "block",
                            marginTop: "4px",
                          }}
                        >
                          Operating Hours: {clinic.startTime} - {clinic.endTime}
                        </Text>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <Text style={{ fontSize: "14px", color: "#6b7280" }}>
                  No active clinics found for this doctor.
                </Text>
              )}
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
                    <Text
                      style={{
                        fontSize: "12px",
                        color: "#6b7280",
                        marginLeft: "8px",
                        display: "block",
                      }}
                    >
                      Status: {doctorData.kycDetails.panStatus}
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

              <div style={{ marginTop: "16px" }}>
                <Text strong style={{ fontSize: "14px", color: "#374151" }}>
                  KYC Verification Status:
                </Text>
                <Text
                  style={{
                    fontSize: "14px",
                    color: doctorData.kycDetails.kycVerified
                      ? "#16a34a"
                      : "#dc2626",
                    marginLeft: "8px",
                  }}
                >
                  {doctorData.kycDetails.kycVerified ? "Verified" : "Not Verified"}
                </Text>
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
                {doctorData?.status !== "rejected" && (
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
                )}
                {doctorData?.status !== "approved" && (
                  <Button
                    size="large"
                    loading={actionLoading === "approve"}
                    onClick={() => {
                      setApproveModalVisible(true);
                    }}
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
                )}
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

        {/* Approve Modal */}
        <Modal
          title="Approve Doctor"
          open={approveModalVisible}
          onCancel={() => setApproveModalVisible(false)}
          footer={
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
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

        {/* Reject Modal */}
        <Modal
          title="Reject Doctor"
          open={rejectModalVisible}
          onCancel={() => {
            setRejectModalVisible(false);
            setReason("");
          }}
          footer={
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Button
                onClick={() => {
                  setRejectModalVisible(false);
                  setReason("");
                }}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                style={{ marginLeft: 8 }}
                onClick={() => {
                  updateDoctorStatus("rejected");
                }}
              >
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