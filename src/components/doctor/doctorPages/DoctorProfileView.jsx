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
} from "antd";
import { apiGet } from "../../api";
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
import "../../stylings/DoctorProfileView.css";

const { Title, Text } = Typography;

const DoctorProfileView = () => {
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [doctorData, setDoctorData] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  const fetchDoctorData = async () => {
    setLoading(true);
    try {
      const response = await apiGet("/users/getUser");
      const userData = response.data?.data;
      
      if (userData) {
        const specializations = userData.specialization 
          ? Array.isArray(userData.specialization) 
            ? userData.specialization 
            : [userData.specialization]
          : [];

        const certifications = specializations.map(spec => ({
          name: spec.name || "Specialization",
          registrationNo: spec.id || "N/A",
          image: spec.specializationCertificate || null,
          degreeCertificate: spec.drgreeCertificate || null
        }));

        setDoctorData({
          ...userData,
          key: userData._id,
          firstname: userData.firstname || "N/A",
          lastname: userData.lastname || "",
          specialization: specializations,
          email: userData.email || "N/A",
          mobile: userData.mobile || "N/A",
          status: userData.status || "pending",
          medicalRegistrationNumber: userData.medicalRegistrationNumber || "N/A",
          userId: userData.userId || "N/A",
          createdAt: userData.createdAt,
          consultationModeFee: Array.isArray(userData.consultationModeFee)
            ? userData.consultationModeFee
            : [],
          spokenLanguage: Array.isArray(userData.spokenLanguage)
            ? userData.spokenLanguage
            : [],
          gender: userData.gender || "N/A",
          DOB: userData.DOB || "N/A",
          bloodgroup: userData.bloodgroup || "N/A",
          maritalStatus: userData.maritalStatus || "N/A",
          workingLocations: Array.isArray(userData.addresses)
            ? userData.addresses.map(addr => ({
                name: addr.clinicName || "Clinic",
                address: `${addr.address}, ${addr.city}, ${addr.state}, ${addr.country} - ${addr.pincode}`,
                startTime: addr.startTime,
                endTime: addr.endTime
              }))
            : [],
          bankDetails: userData.bankDetails || {},
          kycDetails: {
            panNumber: userData.kycDetails?.pan?.number || "N/A",
            panImage: userData.kycDetails?.pan?.attachmentUrl || null,
            voterId: userData.kycDetails?.voter?.number || "N/A",
            voterIdImage: userData.kycDetails?.voter?.attachmentUrl || null
          },
          certifications: certifications,
          profilepic: null
        });
      }
    } catch (error) {
      console.error("Error fetching doctor data:", error);
      message.error("Failed to load doctor data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorData();
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

  return (
    <div className="doctor-profile-container">
      <Spin spinning={loading}>
        <Row gutter={[16, 16]}>
          {/* Personal Information */}
          <Col xs={24} lg={12}>
            <Card
              title={
                <div className="profile-card-header">
                  <UserOutlined style={{ marginRight: "8px", color: "#3b82f6" }} />
                  Personal Information
                </div>
              }
              className="profile-card"
            >
              <div className="avatar-container">
                <Avatar
                  size={64}
                  src={getImageSrc(doctorData.profilepic)}
                  className="doctor-avatar"
                >
                  {`${doctorData.firstname?.[0] ?? ""}${doctorData.lastname?.[0] ?? ""}`}
                </Avatar>
                <Title level={4} className="doctor-name">
                  Dr. {doctorData.firstname} {doctorData.lastname}
                </Title>
                <Text className="doctor-meta">
                  Medical Registration: {doctorData.medicalRegistrationNumber}
                </Text>
                <Text className="doctor-meta">
                  Mobile Number: {doctorData.mobile}
                </Text>
              </div>

              <div className="info-section">
                <div className="info-item">
                  <CalendarOutlined className="info-icon" />
                  <Text className="info-text">
                    <strong>Date of Birth:</strong> {doctorData.DOB}
                  </Text>
                </div>
                <div className="info-item">
                  <ManOutlined className="info-icon" />
                  <Text className="info-text">
                    <strong>Gender:</strong> {doctorData.gender}
                  </Text>
                </div>
                <div className="info-item">
                  <Text className="info-text" style={{ marginLeft: "24px" }}>
                    <strong>Blood Group:</strong> {doctorData.bloodgroup}
                  </Text>
                </div>
                <div className="info-item">
                  <Text className="info-text" style={{ marginLeft: "24px" }}>
                    <strong>Marital Status:</strong> {doctorData.maritalStatus}
                  </Text>
                </div>
              </div>

              <div className="info-section">
                <div className="info-item">
                  <MailOutlined className="info-icon" />
                  <Text className="info-text">
                    <strong>Email:</strong> {doctorData.email}
                  </Text>
                </div>
              </div>

              <div>
                <Text strong className="info-text">
                  Languages:
                </Text>
                <div style={{ marginTop: "8px" }}>
                  {doctorData.spokenLanguage.map((lang, index) => (
                    <Tag key={index} className="language-tag">
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
                <div className="profile-card-header">
                  <MedicineBoxOutlined style={{ marginRight: "8px", color: "#3b82f6" }} />
                  Professional Summary
                </div>
              }
              className="profile-card"
            >
              <div style={{ marginBottom: "20px" }}>
                <Text strong style={{ fontSize: "14px", color: "#166534", display: "block", marginBottom: "8px", fontWeight: "600" }}>
                  Specializations
                </Text>
                <div>
                  {doctorData.specialization.length > 0 ? (
                    doctorData.specialization.map((spec, index) => (
                      <Tag key={index} className="specialization-tag">
                        {spec.name || "Not specified"}
                      </Tag>
                    ))
                  ) : (
                    <Text style={{ color: "#6b7280" }}>No specializations added</Text>
                  )}
                </div>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <Text strong className="info-text" style={{ display: "block", marginBottom: "8px" }}>
                  Work Experience
                </Text>
                <div className="experience-container">
                  <Title level={2} className="experience-years">
                    {doctorData.specialization[0]?.experience || 0} Years
                  </Title>
                </div>
              </div>

              <div>
                <Text strong className="info-text" style={{ display: "block", marginBottom: "12px" }}>
                  Certifications
                </Text>
                {doctorData.certifications.length > 0 ? (
                  doctorData.certifications.map((cert, index) => (
                    <div
                      key={index}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "12px 0",
                        borderBottom: index < doctorData.certifications.length - 1 ? "1px solid #e5e7eb" : "none",
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: "500", fontSize: "14px", color: "#374151", marginBottom: "2px" }}>
                          {cert.name || "N/A"}
                        </div>
                        <Text style={{ fontSize: "12px", color: "#6b7280" }}>
                          {cert.registrationNo || "N/A"}
                        </Text>
                      </div>
                      <Space>
                        {cert.image && (
                          <Button
                            type="link"
                            size="small"
                            icon={<EyeOutlined style={{ color: "#3b82f6" }} />}
                            onClick={() => showModal({ type: "Specialization Certificate", data: cert.image })}
                            style={{ padding: "4px 8px" }}
                          />
                        )}
                        {cert.degreeCertificate && (
                          <Button
                            type="link"
                            size="small"
                            icon={<EyeOutlined style={{ color: "#3b82f6" }} />}
                            onClick={() => showModal({ type: "Degree Certificate", data: cert.degreeCertificate })}
                            style={{ padding: "4px 8px" }}
                          />
                        )}
                      </Space>
                    </div>
                  ))
                ) : (
                  <Text style={{ color: "#6b7280" }}>No certifications added</Text>
                )}
              </div>
            </Card>
          </Col>

         {/* Working Locations */}
<Col xs={24} lg={12}>
  <Card
    title={
      <div className="profile-card-header">
        <EnvironmentOutlined style={{ marginRight: "8px", color: "#3b82f6" }} />
        Working Locations
      </div>
    }
    className="profile-card"
  >
    {doctorData.workingLocations.length > 1 ? (
      <div style={{ marginBottom: "16px" }}>
        <select 
          className="location-dropdown"
          onChange={(e) => {
            const selectedIndex = e.target.value;
            setDoctorData(prev => ({
              ...prev,
              selectedLocation: selectedIndex !== "" ? 
                doctorData.workingLocations[selectedIndex] : null
            }));
          }}
        >
          <option value="">Select a location</option>
          {doctorData.workingLocations.map((location, index) => (
            <option key={index} value={index}>
              {location.name || "N/A"}
            </option>
          ))}
        </select>
      </div>
    ) : null}

    {(doctorData.selectedLocation || doctorData.workingLocations[0]) && (
      <div className="location-card">
        <div style={{ display: "flex", alignItems: "flex-start" }}>
          <EnvironmentOutlined className="location-icon" />
          <div style={{ flex: 1 }}>
            <Text strong className="info-text" style={{ display: "block", marginBottom: "4px" }}>
              {(doctorData.selectedLocation || doctorData.workingLocations[0]).name || "N/A"}
            </Text>
            <Text style={{ fontSize: "12px", color: "#6b7280" }}>
              {(doctorData.selectedLocation || doctorData.workingLocations[0]).address || "N/A"}
            </Text>
            <Text style={{ fontSize: "12px", color: "#6b7280" }}>
              <strong>Timings:</strong>{" "}
              {(doctorData.selectedLocation || doctorData.workingLocations[0]).startTime || "N/A"} -{" "}
              {(doctorData.selectedLocation || doctorData.workingLocations[0]).endTime || "N/A"}
            </Text>
          </div>
        </div>
      </div>
    )}
  </Card>
</Col>

          {/* KYC Details */}
          <Col xs={24} lg={12}>
            <Card
              title={
                <div className="profile-card-header">
                  <IdcardOutlined style={{ marginRight: "8px", color: "#3b82f6" }} />
                  KYC Details
                </div>
              }
              className="profile-card"
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <IdcardOutlined className="info-icon" />
                  <div>
                    <Text strong className="info-text">
                      PAN Number:
                    </Text>
                    <Text className="info-text" style={{ marginLeft: "8px" }}>
                      {doctorData.kycDetails.panNumber || "N/A"}
                    </Text>
                  </div>
                </div>
                {doctorData.kycDetails.panImage && (
                  <Button
                    type="link"
                    size="small"
                    // icon={<EyeOutlined style={{ color: "#3b82f6" }} />}
                    onClick={() => showModal({ type: "pan", data: doctorData.kycDetails.panImage })}
                    style={{ padding: "4px 8px" }}
                  />
                )}
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <IdcardOutlined className="info-icon" />
                  <div>
                    <Text strong className="info-text">
                      Voter ID:
                    </Text>
                    <Text className="info-text" style={{ marginLeft: "8px" }}>
                      {doctorData.kycDetails.voterId || "N/A"}
                    </Text>
                  </div>
                </div>
                {doctorData.kycDetails.voterIdImage && (
                  <Button
                    type="link"
                    size="small"
                    // icon={<EyeOutlined style={{ color: "#3b82f6" }} />}
                    onClick={() => showModal({ type: "voterId", data: doctorData.kycDetails.voterIdImage })}
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
                <div className="profile-card-header">
                  <DollarOutlined style={{ marginRight: "8px", color: "#3b82f6" }} />
                  Consultation Charges
                </div>
              }
              className="profile-card"
            >
              {doctorData.consultationModeFee.map((mode, index) => (
                <div
                  key={index}
                  className={`consultation-card ${
                    mode.type === "In-Person" ? "consultation-in-person" :
                    mode.type === "Video" ? "consultation-video" : "consultation-home"
                  }`}
                >
                  <div style={{ display: "flex", alignItems: "center" }}>
                    {mode.type === "In-Person" && (
                      <UserOutlined className="consultation-icon" style={{ color: "#3b82f6" }} />
                    )}
                    {mode.type === "Video" && (
                      <VideoCameraOutlined className="consultation-icon" style={{ color: "#16a34a" }} />
                    )}
                    {mode.type === "Home Visit" && (
                      <CarOutlined className="consultation-icon" style={{ color: "#9333ea" }} />
                    )}
                    <div>
                      <Text strong className="info-text" style={{ display: "block" }}>
                        {mode.type}
                      </Text>
                      <Text style={{ fontSize: "12px", color: "#6b7280" }}>
                        {mode.description || "N/A"}
                      </Text>
                    </div>
                  </div>
                  <div className="consultation-price">
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
                <div className="profile-card-header">
                  <BankOutlined style={{ marginRight: "8px", color: "#3b82f6" }} />
                  Bank Details
                </div>
              }
              className="profile-card"
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <div style={{ marginBottom: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <BankOutlined className="info-icon" />
                      <Text strong className="info-text">
                        Bank:
                      </Text>
                      <Text className="info-text" style={{ marginLeft: "8px" }}>
                        {doctorData.bankDetails.bankName || "N/A"}
                      </Text>
                    </div>
                  </div>
                  <div style={{ marginBottom: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <UserOutlined className="info-icon" />
                      <Text strong className="info-text">
                        Account Holder:
                      </Text>
                      <Text className="info-text" style={{ marginLeft: "8px" }}>
                        {doctorData.bankDetails.accountHolderName || "N/A"}
                      </Text>
                    </div>
                  </div>
                </Col>
                <Col xs={24} md={12}>
                  <div style={{ marginBottom: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div>
                        <Text strong className="info-text">
                          Account Number:
                        </Text>
                        <Text className="info-text" style={{ marginLeft: "8px" }}>
                          {doctorData.bankDetails.accountNumber || "N/A"}
                        </Text>
                      </div>
                      {doctorData.bankDetails.accountProof && (
                        <Button
                          type="link"
                          size="small"
                          icon={<EyeOutlined style={{ color: "#3b82f6" }} />}
                          onClick={() => showModal({ type: "accountProof", data: doctorData.bankDetails.accountProof })}
                          style={{ padding: "4px 8px" }}
                        />
                      )}
                    </div>
                  </div>
                  <div style={{ marginBottom: "12px" }}>
                    <Text strong className="info-text">
                      Bank IFSC:
                    </Text>
                    <Text className="info-text" style={{ marginLeft: "8px" }}>
                      {doctorData.bankDetails.ifscCode || "N/A"}
                    </Text>
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>

        <Modal
          title={selectedDocument?.type || "Document"}
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
              {selectedDocument.data ? (
                <img
                  src={getImageSrc(selectedDocument.data)}
                  alt={selectedDocument.type}
                  className="document-modal-image"
                />
              ) : (
                <Text className="info-text">
                  No image available for this document.
                </Text>
              )}
            </div>
          )}
        </Modal>
      </Spin>
    </div>
  );
};

export default DoctorProfileView;