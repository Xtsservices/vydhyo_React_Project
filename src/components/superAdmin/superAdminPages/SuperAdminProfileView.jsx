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
import { apiGet, apiPut } from "../../api"; // Ensure this is the same API utility as used in ClinicManagement
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
  const [reason, setReason] = useState("");
  const [clinics, setClinics] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

  const { doctorId, userId ,statusFilter } = location.state || {};

  const convertTo12HourFormat = (time24) => {
    if (!time24 || time24 === "N/A") return "N/A";

    try {
      const [hours, minutes] = time24.split(':').map(Number);
      const period = hours >= 12 ? 'PM' : 'AM';
      const hours12 = hours % 12 || 12;
      return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
    } catch (error) {
      return time24; // Return original if conversion fails
    }
  };

  // Fetch doctor details and clinics from API
  const fetchDoctorDetails = async () => {
    if (!doctorId || !userId) {
      message.error("No doctor ID or user ID provided.");
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

      // Fetch doctor details using /users/getUser
      const doctorResponse = await apiGet(`/users/getUser?userId=${userId}`);
      console.log(doctorResponse, "doctor response");
      const userData = doctorResponse.data?.data;

      let doctor = null;
      if (userData) {
        doctor = userData;
        if (doctor._id !== doctorId) {
          doctor = null;
        }
      }

      if (!doctor) {
        message.warning("Doctor not found. Displaying available data if any.");
        doctor = {};
      }

      // Normalize specializations
      const specializations = doctor.specialization
        ? Array.isArray(doctor.specialization)
          ? doctor.specialization
          : [doctor.specialization]
        : [];

      // Map certifications
      const certifications = specializations.map((spec) => ({
        name: spec.name || "Specialization",
        registrationNo: spec.id || "N/A",
        image: spec?.specializationCertificateUrl  || null,
        degreeCertificate: spec?.degreeCertificateUrl || null,
      }));

      // Normalize bank details
      const bankDetails = doctor.bankDetails || {};

      const decryptedBankDetails = {
        accountNumber: bankDetails.accountNumber || "N/A",
        accountHolderName: bankDetails.accountHolderName || "N/A",
        ifscCode: bankDetails.ifscCode || "N/A",
        bankName: bankDetails.bankName || "N/A",
        accountProof: bankDetails.accountProof || null,
      };

      // Fetch KYC details
      const kycResponse = await apiGet(`users/getKycByUserId?userId=${userId}`);
      const kycData = kycResponse.data;
      const kycDetails = kycData.status === "success" && kycData.data
        ? {
          panNumber: kycData.data.pan?.number || "N/A",
          panImage: kycData.data.pan?.attachmentUrl || null,
          panStatus: kycData.data.pan?.status || "pending",
          kycVerified: kycData.data.kycVerified || false,
        }
        : {
          panNumber: "N/A",
          panImage: null,
          panStatus: "pending",
          kycVerified: false,
        };


      setClinics(doctor.addresses || []);
      setDoctorData({
        ...doctor,
        key: doctor._id || "",
        firstname: doctor.firstname || "N/A",
        lastname: doctor.lastname || "",
        specialization: specializations,
        email: doctor.email || "N/A",
        mobile: doctor.mobile || "N/A",
        status: doctor.status || "pending",
        medicalRegistrationNumber: doctor.medicalRegistrationNumber || "N/A",
        userId: doctor.userId || "N/A",
        createdAt: doctor.createdAt || null,
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
        bankDetails: decryptedBankDetails,
        kycDetails: kycDetails,
        certifications: certifications,
        profilepic: doctor.profilepic || null,
        isVerified: doctor.isVerified || false,
      });
    } catch (error) {
      message.error(
        "Failed to fetch doctor, KYC, or clinic details. Please try again."
      );
      setClinics([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch doctor details and clinics on component mount
  useEffect(() => {
    fetchDoctorDetails();
  }, [doctorId, statusFilter]);

  const showModal = (doc) => {
    setSelectedDocument(doc);
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
    setSelectedDocument(null);
  };
console.log(selectedDocument,"selectedDocument")
  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedDocument(null);
  };

  const getImageSrc = (image) => {
    if (image?.data && image?.mimeType) {
      return `data:${image.mimeType};base64,${image.data}`;
    } else if (typeof image === "string") {
      if (image.startsWith("http") || image.startsWith("data:")) {
        return image;
      }
    }
    return null;
  };

  const updateDoctorStatus = async (newStatus) => {
    try {
      setActionLoading(newStatus);
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
          setReason("");
        }
        navigate("/SuperAdmin/doctors");
      } else {
        toast.warning("Failed to update doctor status.");
        message.warning("Failed to update doctor status.");
      }
    } catch (error) {
      message.error("An error occurred while updating the status.");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return <Spin spinning={loading} />;
  }

  console.log(doctorData, "doctorData in render");
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
                {doctorData?.profilepic ? (
                  <Avatar
                    style={{
                      borderRadius: "50%",
                      width: "80px",
                      height: "80px",
                      
                     
                  }}
                    src={doctorData?.profilepic || undefined}
                  />
                ) : (
                  <div
                    style={{
                    backgroundColor: "#6366f1",
                    fontSize: "24px",
                    fontWeight: "500",
                    borderRadius: "50%",
                    width: "80px",
                    height: "80px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginLeft: "auto",
                    marginRight: "auto",
                  }}>
                  {`${doctorData?.firstname?.[0] ?? ""}${doctorData?.lastname?.[0] ?? ""}`}

                  </div>
                )}  
                <Title
                  level={4}
                  style={{
                    margin: "12px 0 4px 0",
                    fontSize: "18px",
                    color: "#1f2937",
                  }}
                >
                  Dr. {doctorData?.firstname} {doctorData?.lastname}
                </Title>
                <Text
                  style={{
                    color: "#6b7280",
                    fontSize: "14px",
                    display: "block",
                  }}
                >
                  Medical Registration: {doctorData?.medicalRegistrationNumber}
                </Text>
                <Text
                  style={{
                    color: "#6b7280",
                    fontSize: "14px",
                    display: "block",
                  }}
                >
                  Mobile Number: {doctorData?.mobile}
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
                  <ManOutlined style={{ marginRight: 8, color: "#6b7280" }} />
                  <Text style={{ fontSize: "14px", color: "#374151" }}>
                    <strong>Gender:</strong> {doctorData?.gender}
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
                    <strong>Email:</strong> {doctorData?.email}
                  </Text>
                </div>
              </div>

              <div>
                <Text strong style={{ fontSize: "14px", color: "#374151" }}>
                  Languages:
                </Text>
                <div style={{ marginTop: "8px" }}>
                  {doctorData?.spokenLanguage.length > 0 ? (
                    doctorData.spokenLanguage.map((lang, index) => (
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
                    ))
                  ) : (
                    <Text style={{ fontSize: "14px", color: "#6b7280" }}>
                      No languages added
                    </Text>
                  )}
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
                    padding: "4px 0",
                    fontSize: "14px",
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
                 padding: "0 12px",
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
                    fontSize: "18px",
                    fontWeight: "600",
                  }}
                >
                  Bio
                </Text>
                <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap" }}>
                  {doctorData?.specialization[0]?.name ? (
                    doctorData.specialization[0].name.split(',').map((spec, index) => (
                      <div key={index} style={{ display: "flex", alignItems: "center", marginBottom: "6px" }}>
                        <Tag
                          style={{
                            marginRight: "8px",
                            color: "#000000",
                            padding: "4px 8px",
                          }}
                        >
                          {doctorData?.specialization[0]?.bio}
                        </Tag>
                      </div>
                    ))
                  ) : (
                    <Text style={{ fontSize: "14px", color: "#6b7280" }}>No specializations added</Text>
                  )}
                </div>
              </div>
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
                <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap" }}>
                  {doctorData?.specialization[0]?.name ? (
                    doctorData.specialization[0].name.split(',').map((spec, index) => (
                      <div key={index} style={{ display: "flex", alignItems: "center", marginBottom: "6px" }}>
                        <Tag
                          style={{
                            marginRight: "8px",
                            backgroundColor: "#dcfce7",
                            color: "#166534",
                            border: "1px solid #bbf7d0",
                            borderRadius: "6px",
                            padding: "4px 8px",
                          }}
                        >
                          {spec.trim() || "Not specified"}
                        </Tag>
                        {/* {doctorData?.specialization[0]?.specializationCertificateUrl && index === 0 && (
                          <Button
                            type="link"
                            size="small"
                            icon={<EyeOutlined style={{ color: "#3b82f6" }} />}
                            onClick={() =>
                              showModal({ type: "specialization", data: doctorData.specialization[0].specializationCertificateUrl })
                            }
                            style={{ padding: "4px 8px" }}
                          >
                            View Specialization
                          </Button>
                        )} */}
                      </div>
                    ))
                  ) : (
                    <Text style={{ fontSize: "14px", color: "#6b7280" }}>No specializations added</Text>
                  )}
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
                  Degrees
                </Text>
                <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap" }}>
                  {doctorData?.specialization[0]?.degree ? (
                    doctorData.specialization[0].degree.split(',').map((degree, index) => (
                      <div key={index} style={{ display: "flex", alignItems: "center", marginBottom: "6px" }}>
                        <Tag
                          style={{
                            marginRight: "8px",
                            backgroundColor: "#e0f2fe",
                            color: "#0369a1",
                            border: "1px solid #bae6fd",
                            borderRadius: "6px",
                            padding: "4px 8px",
                          }}
                        >
                          {degree.trim()}
                        </Tag>
                        {/* {doctorData?.specialization[0]?.degreeCertificateUrl && index === 0 && (
                          <Button
                            type="link"
                            size="small"
                            icon={<EyeOutlined style={{ color: "#3b82f6" }} />}
                            onClick={() =>
                              showModal({ type: "degree", data: doctorData.specialization[0].degreeCertificateUrl })
                            }
                            style={{ padding: "4px 8px" }}
                          >
                            View Degree
                          </Button>
                        )} */}
                      </div>
                    ))
                  ) : (
                    <Text style={{ fontSize: "14px", color: "#6b7280" }}>No degrees added</Text>
                  )}
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
                    {doctorData?.specialization[0]?.experience || 0} Years
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
                {doctorData?.certifications.length > 0 ? (
                  doctorData.certifications.map((cert, index) => (
                    <div
                      key={index}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "12px 0",
                        borderBottom:
                          index < doctorData.certifications.length - 1
                            ? "1px solid #e5e7eb"
                            : "none",
                      }}
                    >
                      <Space>
                        {cert.image && (
                          <Button
                            size="small"
                            onClick={() =>
                              showModal({ type: "certificate", data: cert.image })
                            }
                            style={{
                              padding: "4px 8px",
                              border: "1px solid #3b82f6",
                              color: "#3b82f6",
                              borderRadius: "6px"
                            }}
                          >
                            View Certificate
                          </Button>
                        )}
                        {cert.degreeCertificate && (
                          <Button
                            size="small"
                            onClick={() =>
                              showModal({ type: "degree", data: cert.degreeCertificate })
                            }
                            style={{
                              padding: "4px 8px",
                              border: "1px solid #3b82f6",
                              color: "#3b82f6",
                              borderRadius: "6px"
                            }}
                          >
                            View Degree
                          </Button>
                        )}
                      </Space>
                    </div>
                  ))
                ) : (
                  <Text style={{ fontSize: "14px", color: "#6b7280" }}>
                    No certifications added
                  </Text>
                )}
              </div>
            </Card>
          </Col>

          {/* Working Locations (Clinics) */}
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
              {clinics.length > 0 ? (
                clinics.map((clinic, index) => (
                  <div
                    key={clinic._id}
                    style={{
                      marginBottom: index < clinics.length - 1 ? "16px" : "0",
                      padding: "16px",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      backgroundColor: "#f0f9ff",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start" }}>
                      <div
                        style={{
                          width: "16px",
                          height: "16px",
                          borderRadius: "8px",
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
                          {clinic.clinicName}
                        </Text>
                        <Text
                          style={{
                            fontSize: "12px",
                            color: "#6b7280",
                            display: "block",
                          }}
                        >
                         <strong>Address:</strong>  {clinic.address}
                        </Text>
                        <Text
                          style={{
                            fontSize: "12px",
                            color: "#6b7280",
                            display: "block",
                            marginTop: "4px",
                          }}
                        >
                          <strong>Contact:</strong> {clinic.mobile}
                        </Text>
                       
                        <Text
                          style={{
                            fontSize: "12px",
                            color: "#6b7280",
                            display: "block",
                            marginTop: "4px",
                          }}
                        >
                          <strong>Status:</strong> {clinic.status}
                        </Text>
                        {clinic.headerImage && (
                          <Button
                            type="link"
                            size="small"
                            icon={<EyeOutlined style={{ color: "#3b82f6" }} />}
                            onClick={() =>
                              showModal({ type: "headerImage", data: clinic.headerImage })
                            }
                            style={{ padding: "4px 8px", marginTop: "8px" }}
                          >
                            View Header Image
                          </Button>
                        )}
                        {clinic.digitalSignature && (
                          <Button
                            type="link"
                            size="small"
                            icon={<EyeOutlined style={{ color: "#3b82f6" }} />}
                            onClick={() =>
                              showModal({ type: "digitalSignature", data: clinic.digitalSignature })
                            }
                            style={{ padding: "4px 8px", marginTop: "8px" }}
                          >
                            View Digital Signature
                          </Button>
                        )}
                      </div>
                    </div>
                    {/* Pharmacy Details */}
                    {clinic.pharmacyName  && (
                      <div style={{ marginTop: "12px", paddingLeft: "28px" }}>
                        <Text
                          strong
                          style={{
                            fontSize: "14px",
                            color: "#374151",
                            display: "block",
                            marginBottom: "8px",
                          }}
                        >
                          Pharmacy Details
                        </Text>
                        <Text
                          style={{
                            fontSize: "12px",
                            color: "#6b7280",
                            display: "block",
                          }}
                        >
                          <strong>Name:</strong> {clinic.pharmacyName}
                        </Text>
                        <Text
                          style={{
                            fontSize: "12px",
                            color: "#6b7280",
                            display: "block",
                            marginTop: "4px",
                          }}
                        >
                          <strong>Registration Number:</strong> {clinic.pharmacyRegistrationNo
}
                        </Text>
                        <Text
                          style={{
                            fontSize: "12px",
                            color: "#6b7280",
                            display: "block",
                            marginTop: "4px",
                          }}
                        >
                          <strong>GST Number:</strong> {clinic.pharmacyGst}
                        </Text>
                        <Text
                          style={{
                            fontSize: "12px",
                            color: "#6b7280",
                            display: "block",
                            marginTop: "4px",
                          }}
                        >
                          <strong>PAN:</strong> {clinic.pharmacyPan
}
                        </Text>
                        <Text
                          style={{
                            fontSize: "12px",
                            color: "#6b7280",
                            display: "block",
                            marginTop: "4px",
                          }}
                        >
                          <strong>Address:</strong> {clinic.pharmacyAddress}
                        </Text>
                        {clinic.pharmacyHeader && (
                          <Button
                            type="link"
                            size="small"
                            icon={<EyeOutlined style={{ color: "#3b82f6" }} />}
                            onClick={() =>
                              showModal({ type: "pharmacyHeader", data: clinic.pharmacyHeader })
                            }
                            style={{ padding: "4px 8px", marginTop: "8px" }}
                          >
                            View Pharmacy Header
                          </Button>
                        )}
                      </div>
                    )}
                    {/* Lab Details */}
                    {clinic.labName && (
                      <div style={{ marginTop: "12px", paddingLeft: "28px" }}>
                        <Text
                          strong
                          style={{
                            fontSize: "14px",
                            color: "#374151",
                            display: "block",
                            marginBottom: "8px",
                          }}
                        >
                          Lab Details
                        </Text>
                        <Text
                          style={{
                            fontSize: "12px",
                            color: "#6b7280",
                            display: "block",
                          }}
                        >
                          <strong>Name:</strong> {clinic.labName}
                        </Text>
                        <Text
                          style={{
                            fontSize: "12px",
                            color: "#6b7280",
                            display: "block",
                            marginTop: "4px",
                          }}
                        >
                          <strong>Registration Number:</strong> {clinic.labRegistrationNo}
                        </Text>
                        <Text
                          style={{
                            fontSize: "12px",
                            color: "#6b7280",
                            display: "block",
                            marginTop: "4px",
                          }}
                        >
                          <strong>GST Number:</strong> {clinic.labGst}
                        </Text>
                        <Text
                          style={{
                            fontSize: "12px",
                            color: "#6b7280",
                            display: "block",
                            marginTop: "4px",
                          }}
                        >
                          <strong>PAN:</strong> {clinic.labPan}
                        </Text>
                        <Text
                          style={{
                            fontSize: "12px",
                            color: "#6b7280",
                            display: "block",
                            marginTop: "4px",
                          }}
                        >
                          <strong>Address:</strong> {clinic.labAddress}
                        </Text>
                        {clinic.labHeader && (
                          <Button
                            type="link"
                            size="small"
                            icon={<EyeOutlined style={{ color: "#3b82f6" }} />}
                            onClick={() =>
                              showModal({ type: "labHeader", data: clinic.labHeader })
                            }
                            style={{ padding: "4px 8px", marginTop: "8px" }}
                          >
                            View Lab Header
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <Text style={{ fontSize: "14px", color: "#6b7280" }}>
                  No working locations found for this doctor.
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
                  <IdcardOutlined style={{ marginRight: 8, color: "#6b7280" }} />
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
                      {doctorData?.kycDetails.panNumber || "N/A"}
                    </Text>
                    <Text
                      style={{
                        fontSize: "12px",
                        color: "#6b7280",
                        marginLeft: "8px",
                        display: "block",
                      }}
                    >
                      Status: {doctorData?.kycDetails.panStatus}
                    </Text>
                  </div>
                </div>
                {doctorData?.kycDetails.panImage && (
                  <Button
                    size="small"
                    onClick={() =>
                      showModal({
                        type: "PAN",
                        data: doctorData.kycDetails.panImage,
                      })
                    }
                    style={{
                      padding: "4px 8px",
                      border: "1px solid #3b82f6",
                      color: "#3b82f6",
                      borderRadius: "6px"
                    }}
                  >
                    View PAN
                  </Button>
                )}
              </div>

              <div style={{ marginTop: "16px" }}>
                <Text strong style={{ fontSize: "14px", color: "#374151" }}>
                  KYC Verification Status:
                </Text>
                <Text
                  style={{
                    fontSize: "14px",
                    color: doctorData?.kycDetails.kycVerified
                      ? "#16a34a"
                      : "#dc2626",
                    marginLeft: "8px",
                  }}
                >
                  {doctorData?.kycDetails.kycVerified ? "Verified" : "Not Verified"}
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
              {doctorData?.consultationModeFee.length > 0 ? (
                doctorData.consultationModeFee.map((mode, index) => (
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
                      {mode.type.toLowerCase() === "in-person" && (
                        <UserOutlined
                          style={{
                            fontSize: "20px",
                            color: "#3b82f6",
                            marginRight: "12px",
                          }}
                        />
                      )}
                      {mode.type.toLowerCase() === "video" && (
                        <VideoCameraOutlined
                          style={{
                            fontSize: "20px",
                            color: "#16a34a",
                            marginRight: "12px",
                          }}
                        />
                      )}
                      {mode.type.toLowerCase() === "home visit" && (
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
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: "24px",
                        fontWeight: "bold",
                        color: "#1f2937",
                      }}
                    >
                      {mode.currency || "₹"} {mode.fee}
                    </div>
                  </div>
                ))
              ) : (
                <Text style={{ fontSize: "14px", color: "#6b7280" }}>
                  No consultation charges added
                </Text>
              )}
            </Card>
          </Col>

          {/* Bank Details */}
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
                  Bank Details
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
                        {doctorData?.bankDetails.bankName || "N/A"}
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
                        {doctorData?.bankDetails.accountHolderName || "N/A"}
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
                          {doctorData?.bankDetails.accountNumber || "N/A"}
                        </Text>
                      </div>
                      {doctorData?.bankDetails.accountProof && (
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
                        >
                          View Proof
                        </Button>
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
                      {doctorData?.bankDetails.ifscCode || "N/A"}
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
              ? "Certificate"
              : selectedDocument?.type === "degree"
                ? "Degree Certificate"
                : selectedDocument?.type === "specialization"
                  ? "Specialization Certificate"
                  : selectedDocument?.type === "PAN"
                    ? "PAN Card"
                    : selectedDocument?.type === "accountProof"
                      ? "Account Proof"
                      : selectedDocument?.type === "headerImage"
                        ? "Clinic Header Image"
                        : selectedDocument?.type === "digitalSignature"
                          ? "Digital Signature"
                          : selectedDocument?.type === "pharmacyHeader"
                            ? "Pharmacy Header Image"
                            : selectedDocument?.type === "labHeader"
                              ? "Lab Header Image"
                              : "Document"
          }
          open={isModalVisible}
          onOk={handleOk}
          onCancel={handleCancel}
          footer={[
            <Button key="close" onClick={handleCancel}>
              Close
            </Button>,
          ]}
          width={400}
        >
          {selectedDocument && (
            <div style={{ textAlign: "center" }}>
              {selectedDocument?.data ? (
                <img
                  src={getImageSrc(selectedDocument?.data)}
                  alt={selectedDocument?.type}
                  style={{
                    width: "100%",
                    maxWidth: "300px",
                    height: "auto",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
              ) : (
                <Text style={{ fontSize: "14px", color: "#374151" }}>
                  No image available for this document.
                </Text>
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