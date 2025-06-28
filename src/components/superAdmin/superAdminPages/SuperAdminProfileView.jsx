import React, { useState } from "react";
import {
  Card,
  Avatar,
  Button,
  Row,
  Col,
  Tag,
  Space,
  Divider,
  Typography,
  Modal,
  message,
  Spin,
} from "antd";
import {
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  CalendarOutlined,
  MedicineBoxOutlined,
  BankOutlined,
  IdcardOutlined,
  EnvironmentOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DollarOutlined,
  HomeOutlined,
  VideoCameraOutlined,
  CarOutlined,
  EyeOutlined,
  ManOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const DoctorProfileView = () => {
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState(null);

  // Sample doctor data based on the image
  const doctorData = {
    _id: "doctor123",
    firstname: "Rajesh",
    lastname: "Kumar",
    profilepic: null,
    medicalRegistrationNumber: "MH-12345-2018",
    mobile: "9876543210",
    email: "dr.rajesh@email.com",
    DOB: "March 15, 1985",
    gender: "Male",
    bloodgroup: "O+",
    maritalStatus: "Married",
    spokenLanguage: ["English", "Hindi", "Marathi"],
    specialization: [
      {
        name: "Orthopedic",
        experience: 8,
        id: "ORTH001"
      },
      {
        name: "Sports Medicine",
        experience: 5,
        id: "SPORT001"
      },
      {
        name: "Joint Replacement",
        experience: 6,
        id: "JOINT001"
      }
    ],
    workingLocations: [
      {
        name: "Boston General Hospital",
        address: "300 Longwood Ave, Boston, MA 02115"
      },
      {
        name: "Heart Care Clinic",
        address: "45 Medical Plaza, Cambridge, MA 02139"
      }
    ],
    consultationModeFee: [
      {
        type: "In-Person Consultation",
        fee: 800,
        currency: "₹",
        description: "Clinic visit consultation"
      },
      {
        type: "Video Call",
        fee: 600,
        currency: "₹",
        description: "Online video consultation"
      },
      {
        type: "Home Visit",
        fee: 1200,
        currency: "₹",
        description: "At-home consultation"
      }
    ],
    bankDetails: {
      bankName: "HDFC Bank",
      accountHolderName: "Dr. Rajesh Kumar",
      accountNumber: "****-****-1234",
      ifscCode: "HDFC0001234"
    },
    kycDetails: {
      panNumber: "ABCDE1234F",
      voterId: "ABC1234567"
    },
    certifications: [
      {
        name: "Maharashtra Medical Council",
        registrationNo: "MH-12345-2018"
      },
      {
        name: "Canadienne Doctors Hospital",
        type: "Medical Certificate for School",
        details: {
          date: "June 1, 2019",
          location: "470 Bluff Street, Beltsville, Maryland",
          patient: "Greyson Bleu",
          condition: "Allergies",
          duration: "7 days"
        }
      }
    ],
    status: "pending",
    isVerified: false,
    createdAt: new Date().toISOString()
  };

  const handleApprove = async () => {
    setActionLoading('approve');
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      message.success('Doctor approved successfully');
    } catch (error) {
      message.error('Failed to approve doctor');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = () => {
    Modal.confirm({
      title: 'Reject Doctor',
      content: 'Are you sure you want to reject this doctor? This action cannot be undone.',
      okText: 'Yes, Reject',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        setActionLoading('reject');
        try {
          await new Promise(resolve => setTimeout(resolve, 1500));
          message.success('Doctor rejected successfully');
        } catch (error) {
          message.error('Failed to reject doctor');
        } finally {
          setActionLoading(null);
        }
      }
    });
  };

  const showModal = (cert) => {
    setSelectedCertificate(cert);
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
    setSelectedCertificate(null);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedCertificate(null);
  };

  return (
    <div style={{ padding: '16px', backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <Spin spinning={loading}>
        <Row gutter={[16, 16]}>
          {/* Personal Information */}
          <Col xs={24} lg={12}>
            <Card 
              title={
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  padding: '8px 0',
                  fontSize: '18px',
                  fontWeight: '600',
                  fontFamily: 'Inter',
                  lineHeight: '100%',
                  letterSpacing: '0%',
                  color: '#1f2937'
                }}>
                  <UserOutlined style={{ marginRight: '8px', color: '#3b82f6' }} />
                  Personal Information
                </div>
              }
              style={{ 
                height: '100%',
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}
              headStyle={{
                backgroundColor: '#ffffff',
                border: 'none',
                borderBottom: '1px solid #e5e7eb'
              }}
              bodyStyle={{ padding: '20px' }}
            >
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <Avatar
                  size={64}
                  src={doctorData.profilepic}
                  style={{ 
                    backgroundColor: '#6366f1',
                    fontSize: '24px',
                    fontWeight: '500'
                  }}
                >
                  {`${doctorData.firstname?.[0]}${doctorData.lastname?.[0]}`}
                </Avatar>
                <Title level={4} style={{ margin: '12px 0 4px 0', fontSize: '18px', color: '#1f2937' }}>
                  Dr. {doctorData.firstname} {doctorData.lastname}
                </Title>
                <Text style={{ color: '#6b7280', fontSize: '14px', display: 'block' }}>
                  Medical Registration: {doctorData.medicalRegistrationNumber}
                </Text>
                <Text style={{ color: '#6b7280', fontSize: '14px', display: 'block' }}>
                  Mobile Number: {doctorData.mobile}
                </Text>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <CalendarOutlined style={{ marginRight: 8, color: '#6b7280' }} />
                  <Text style={{ fontSize: '14px', color: '#374151' }}>
                    <strong>Date of Birth:</strong> {doctorData.DOB}
                  </Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <ManOutlined style={{ marginRight: 8, color: '#6b7280' }} />
                  <Text style={{ fontSize: '14px', color: '#374151' }}>
                    <strong>Gender:</strong> {doctorData.gender}
                  </Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <Text style={{ fontSize: '14px', color: '#374151', marginLeft: '24px' }}>
                    <strong>Blood Group:</strong> {doctorData.bloodgroup}
                  </Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <Text style={{ fontSize: '14px', color: '#374151', marginLeft: '24px' }}>
                    <strong>Marital Status:</strong> {doctorData.maritalStatus}
                  </Text>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <MailOutlined style={{ marginRight: 8, color: '#6b7280' }} />
                  <Text style={{ fontSize: '14px', color: '#374151' }}>
                    <strong>Email:</strong> {doctorData.email}
                  </Text>
                </div>
              </div>
              
              <div>
                <Text strong style={{ fontSize: '14px', color: '#374151' }}>Languages:</Text>
                <div style={{ marginTop: '8px' }}>
                  {doctorData.spokenLanguage.map((lang, index) => (
                    <Tag 
                      key={index} 
                      style={{ 
                        marginBottom: '4px',
                        marginRight: '8px',
                        backgroundColor: '#DBEAFE',
                        color: '#1E40AF',
                        border: '1px solid #d1d5db',
                        borderRadius: '10px'
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
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  padding: '8px 0',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#1f2937'
                }}>
                  <MedicineBoxOutlined style={{ marginRight: '8px', color: '#3b82f6' }} />
                  Professional Summary
                </div>
              }
              style={{ 
                height: '100%',
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}
              headStyle={{
                backgroundColor: '#ffffff',
                border: 'none',
                borderBottom: '1px solid #e5e7eb'
              }}
              bodyStyle={{ padding: '20px' }}
            >
              <div style={{ marginBottom: '20px' }}>
                <Text strong style={{ fontSize: '14px', color: '#166534', display: 'block', marginBottom: '8px',fontWeight: '600' }}>
                  Specializations
                </Text>
                <div>
                  {doctorData.specialization.map((spec, index) => (
                    <Tag 
                      key={index} 
                      style={{ 
                        marginBottom: '6px',
                        marginRight: '8px',
                        backgroundColor: '#dcfce7',
                        color: '#166534',
                        border: '1px solid #bbf7d0',
                        borderRadius: '6px',
                        padding: '4px 8px'
                      }}
                    >
                      {spec.name}
                    </Tag>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <Text strong style={{ fontSize: '14px', color: '#374151', display: 'block', marginBottom: '8px' }}>
                  Work Experience
                </Text>
                <div style={{ 
                  backgroundColor: '#f0f9ff', 
                  padding: '16px', 
                  borderRadius: '8px',
                  textAlign: 'center',
                  border: '1px solid #e0f2fe'
                }}>
                  <Title level={2} style={{ margin: 0, color: '#0369a1', fontSize: '32px', fontWeight: '700' }}>
                    8 Years
                  </Title>
                </div>
              </div>

              <div>
                <Text strong style={{ fontSize: '14px', color: '#374151', display: 'block', marginBottom: '12px' }}>
                  Certifications
                </Text>
                {doctorData.certifications.map((cert, index) => (
                  <div key={index} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '12px 0',
                    borderBottom: index < doctorData.certifications.length - 1 ? '1px solid #f3f4f6' : 'none'
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '500', fontSize: '14px', color: '#374151', marginBottom: '2px' }}>
                        {cert.name}
                      </div>
                      <Text style={{ fontSize: '12px', color: '#6b7280' }}>
                        {cert.registrationNo || cert.type}
                      </Text>
                    </div>
                    <Button 
                      type="link" 
                      size="small" 
                      icon={<EyeOutlined style={{ color: '#3b82f6' }} />}
                      onClick={() => showModal(cert)}
                      style={{ padding: '4px 8px' }}
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
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  padding: '8px 0',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#1f2937'
                }}>
                  <EnvironmentOutlined style={{ marginRight: '8px', color: '#3b82f6' }} />
                  Working Locations
                </div>
              }
              style={{ 
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}
              headStyle={{
                backgroundColor: '#ffffff',
                border: 'none',
                borderBottom: '1px solid #e5e7eb'
              }}
              bodyStyle={{ padding: '20px' }}
            >
              {doctorData.workingLocations.map((location, index) => (
                <div key={index} style={{ 
                  marginBottom: index < doctorData.workingLocations.length - 1 ? '16px' : '0',
                  padding: '16px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  backgroundColor: '#ffffff'
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                    <EnvironmentOutlined style={{ 
                      color: '#3b82f6', 
                      fontSize: '16px', 
                      marginRight: '12px',
                      marginTop: '2px'
                    }} />
                    <div style={{ flex: 1 }}>
                      <Text strong style={{ fontSize: '14px', color: '#374151', display: 'block', marginBottom: '4px' }}>
                        {location.name}
                      </Text>
                      <Text style={{ fontSize: '12px', color: '#6b7280' }}>
                        {location.address}
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
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  padding: '8px 0',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#1f2937'
                }}>
                  <IdcardOutlined style={{ marginRight: '8px', color: '#3b82f6' }} />
                  KYC Details:
                </div>
              }
              style={{ 
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}
              headStyle={{
                backgroundColor: '#ffffff',
                border: 'none',
                borderBottom: '1px solid #e5e7eb'
              }}
              bodyStyle={{ padding: '20px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <IdcardOutlined style={{ marginRight: 8, color: '#6b7280' }} />
                  <div>
                    <Text strong style={{ fontSize: '14px', color: '#374151' }}>PAN Number:</Text>
                    <Text style={{ fontSize: '14px', color: '#374151', marginLeft: '8px' }}>
                      {doctorData.kycDetails.panNumber}
                    </Text>
                  </div>
                </div>
                <Button 
                  type="link" 
                  size="small" 
                  icon={<EyeOutlined style={{ color: '#3b82f6' }} />}
                  style={{ padding: '4px 8px' }}
                />
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <IdcardOutlined style={{ marginRight: 8, color: '#6b7280' }} />
                  <div>
                    <Text strong style={{ fontSize: '14px', color: '#374151' }}>Voter ID:</Text>
                    <Text style={{ fontSize: '14px', color: '#374151', marginLeft: '8px' }}>
                      {doctorData.kycDetails.voterId}
                    </Text>
                  </div>
                </div>
                <Button 
                  type="link" 
                  size="small" 
                  icon={<EyeOutlined style={{ color: '#3b82f6' }} />}
                  style={{ padding: '4px 8px' }}
                />
              </div>
            </Card>
          </Col>

          {/* Consultation Charges */}
          <Col xs={24} lg={12}>
            <Card 
              title={
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  padding: '8px 0',
                  fontSize: '18px',
                  fontWeight: '600',
                  fontFamily: 'Inter',
                  lineHeight: '100%',
                  letterSpacing: '0%',
                  color: '#1f2937'
                }}>
                  <DollarOutlined style={{ marginRight: '8px', color: '#3b82f6' }} />
                  Consultation Charges
                </div>
              }
              style={{ 
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}
              headStyle={{
                backgroundColor: '#ffffff',
                border: 'none',
                borderBottom: '1px solid #e5e7eb'
              }}
              bodyStyle={{ padding: '20px' }}
            >
              {/* In-Person Consultation */}
              <div style={{ 
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '16px',
                backgroundColor: '#f0f9ff',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <UserOutlined style={{ fontSize: '20px', color: '#3b82f6', marginRight: '12px' }} />
                  <div>
                    <Text strong style={{ display: 'block', fontSize: '14px', color: '#374151' }}>
                      In-Person Consultation
                    </Text>
                    <Text style={{ fontSize: '12px', color: '#6b7280' }}>
                      Clinic visit consultation
                    </Text>
                  </div>
                </div>
                <div style={{ 
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#1f2937'
                }}>
                  ₹800
                </div>
              </div>

              {/* Video Call */}
              <div style={{ 
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '16px',
                backgroundColor: '#f0fdf4',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <VideoCameraOutlined style={{ fontSize: '20px', color: '#16a34a', marginRight: '12px' }} />
                  <div>
                    <Text strong style={{ display: 'block', fontSize: '14px', color: '#374151' }}>
                      Video Call
                    </Text>
                    <Text style={{ fontSize: '12px', color: '#6b7280' }}>
                      Online video consultation
                    </Text>
                  </div>
                </div>
                <div style={{ 
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#1f2937'
                }}>
                  ₹600
                </div>
              </div>

              {/* Home Visit */}
              <div style={{ 
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '16px',
                backgroundColor: '#faf5ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <CarOutlined style={{ fontSize: '20px', color: '#9333ea', marginRight: '12px' }} />
                  <div>
                    <Text strong style={{ display: 'block', fontSize: '14px', color: '#374151' }}>
                      Home Visit
                    </Text>
                    <Text style={{ fontSize: '12px', color: '#6b7280' }}>
                      At-home consultation
                    </Text>
                  </div>
                </div>
                <div style={{ 
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#1f2937'
                }}>
                  ₹1200
                </div>
              </div>
            </Card>
          </Col>

          {/* Bank & KYC Details */}
          <Col xs={24} lg={12}>
            <Card 
              title={
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  padding: '8px 0',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#1f2937'
                }}>
                  <BankOutlined style={{ marginRight: '8px', color: '#3b82f6' }} />
                  Bank & KYC Details
                </div>
              }
              style={{ 
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}
              headStyle={{
                backgroundColor: '#ffffff',
                border: 'none',
                borderBottom: '1px solid #e5e7eb'
              }}
              bodyStyle={{ padding: '20px' }}
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <BankOutlined style={{ marginRight: 8, color: '#6b7280' }} />
                      <Text strong style={{ fontSize: '14px', color: '#374151' }}>Bank:</Text>
                      <Text style={{ fontSize: '14px', color: '#374151', marginLeft: '8px' }}>
                        {doctorData.bankDetails.bankName}
                      </Text>
                    </div>
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <UserOutlined style={{ marginRight: 8, color: '#6b7280' }} />
                      <Text strong style={{ fontSize: '14px', color: '#374151' }}>Account Holder:</Text>
                      <Text style={{ fontSize: '14px', color: '#374151', marginLeft: '8px' }}>
                        {doctorData.bankDetails.accountHolderName}
                      </Text>
                    </div>
                  </div>
                </Col>
                <Col xs={24} md={12}>
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <Text strong style={{ fontSize: '14px', color: '#374151' }}>Account Number:</Text>
                        <Text style={{ fontSize: '14px', color: '#374151', marginLeft: '8px' }}>
                          {doctorData.bankDetails.accountNumber}
                        </Text>
                      </div>
                      <Button 
                        type="link" 
                        size="small" 
                        icon={<EyeOutlined style={{ color: '#3b82f6' }} />}
                        style={{ padding: '4px 8px' }}
                      />
                    </div>
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <Text strong style={{ fontSize: '14px', color: '#374151' }}>Bank IFSC:</Text>
                    <Text style={{ fontSize: '14px', color: '#374151', marginLeft: '8px' }}>
                      {doctorData.bankDetails.ifscCode}
                    </Text>
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>

          {/* Action Buttons */}
          <Col xs={24}>
            <div style={{ 
              textAlign: 'right', 
              padding: '20px',
              backgroundColor: 'white',
              borderRadius: '8px',
              border: '1px solid #e5e7eb'
            }}>
              <Space size="large">
                <Button 
                  size="large"
                  loading={actionLoading === 'reject'}
                  onClick={handleReject}
                  style={{ 
                    minWidth: '140px',
                    backgroundColor: '#dc2626',
                    borderColor: '#dc2626',
                    color: 'white',
                    fontWeight: '500'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#b91c1c';
                    e.target.style.borderColor = '#b91c1c';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#dc2626';
                    e.target.style.borderColor = '#dc2626';
                  }}
                >
                  Reject Request
                </Button>
                <Button 
                  size="large"
                  loading={actionLoading === 'approve'}
                  onClick={handleApprove}
                  style={{ 
                    minWidth: '140px',
                    backgroundColor: '#16a34a',
                    borderColor: '#16a34a',
                    color: 'white',
                    fontWeight: '500'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#15803d';
                    e.target.style.borderColor = '#15803d';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#16a34a';
                    e.target.style.borderColor = '#16a34a';
                  }}
                >
                  Accept Request
                </Button>
              </Space>
            </div>
          </Col>
        </Row>

        <Modal
          title="Medical Certificate for School"
          visible={isModalVisible}
          onOk={handleOk}
          onCancel={handleCancel}
          footer={[
            <Button key="close" onClick={handleCancel}>
              Close
            </Button>,
          ]}
          width={600}
        >
          {selectedCertificate && selectedCertificate.details && (
  <div style={{ textAlign: 'center' }}>
    <img 
      src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==" 
      alt="Medical Certificate"
      style={{ 
        width: '100%', 
        maxWidth: '500px', 
        height: 'auto',
        border: '1px solid #e5e7eb',
        borderRadius: '8px'
      }}
    />
  </div>
)}
        </Modal>
      </Spin>
    </div>
  );
};

export default DoctorProfileView;