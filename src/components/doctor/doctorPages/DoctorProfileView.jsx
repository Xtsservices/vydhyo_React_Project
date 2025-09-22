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
  Form,
  Input,
  Upload,
  Select,
  Descriptions,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { apiGet, apiPut, apiUploadFile, apiPost, postKYCDetails } from "../../api";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
  EditOutlined
} from "@ant-design/icons";
import "../../stylings/DoctorProfileView.css";

const { Title, Text } = Typography;
const { Option } = Select;

const languageOptions = [
  { label: 'Telugu', value: 'Telugu' },
  { label: 'Hindi', value: 'Hindi' },
  { label: 'English', value: 'English' },
  { label: 'Urdu', value: 'Urdu' },
];

// Validation Constants
const VALIDATION_RULES = {
  name: [
    { required: true, message: 'This field is required' },
    { pattern: /^[A-Za-z\s]+$/, message: 'Only letters and spaces allowed' },
    { min: 2, message: 'Minimum 2 characters required' },
    { max: 50, message: 'Maximum 50 characters allowed' }
  ],
  email: [
    { required: true, message: 'Email is required' },
    { type: 'email', message: 'Please enter a valid email' }
  ],
  mobile: [
    { required: true, message: 'Mobile number is required' },
    { pattern: /^[0-9]{10}$/, message: 'Please enter a valid 10-digit mobile number' }
  ],
  experience: [
    { required: true, message: 'Experience is required' },
    {
      pattern: /^[0-9]{10}$/,
      message: 'Mobile number must be exactly 10 digits',
    },
    { type: 'number', min: 0, message: 'Experience cannot be negative' },
    { type: 'number', max: 60, message: 'Experience cannot exceed 60 years' }
  ],
  pan: [
    { required: true, message: 'PAN number is required' },
  ],
  ifsc: [
    { required: true, message: 'IFSC code is required' },
    { pattern: /^[A-Z]{4}0[A-Z0-9]{6}$/, message: 'Invalid IFSC format (e.g., HDFC0ABCD12)' }
  ],
  accountNumber: [
    { required: true, message: 'Account number is required' },
    { pattern: /^[0-9]{9,18}$/, message: 'Account number must be 9-18 digits' }
  ],
  experience: [
    { required: true, message: 'Experience is required' },
    { pattern: /^[0-9]+$/, message: 'Please enter numbers only' },
    { min: 0, message: 'Experience cannot be negative' },
    { max: 60, message: 'Experience cannot exceed 60 years' }
  ],
  fee: [
    { required: true, message: 'Fee is required' },
    { pattern: /^[0-9]+$/, message: 'Please enter numbers only' },
    { min: 0, message: 'Fee cannot be negative' }
  ]
};

const specializationOptions = [
  'General Medicine',
  'Internal Medicine',
  'Pediatrics',
  'Obstetrics and Gynaecology',
  'General Surgery',
  'Family Medicine',
  'Emergency Medicine',
  'Geriatrics / Geriatric Medicine',
  'Critical Care / Critical Care Medicine',
  'Preventive Cardiology',
  'Clinical Cardiology',
  'Cardiology',
  'Diabetology',
  'Respiratory Medicine / Pulmonary & Critical Care Medicine',
  'Psychiatry / Psychological Medicine',
  'Dermatology, Venereology & Leprosy',
  'Neurology',
  'Nephrology',
  'Endocrinology',
  'Rheumatology',
  'Infectious Diseases',
  'Hepatology',
  'Cardiothoracic and Vascular Surgery',
  'Vascular Surgery',
  'Surgical Gastroenterology',
  'Surgical Oncology',
  'Endocrine Surgery',
  'Plastic & Reconstructive Surgery / Plastic Surgery',
  'Pediatric Surgery',
  'Neurosurgery',
  'Urology',
  'Hand Surgery',
  'Trauma Surgery and Critical Care',
  'Minimal Access Surgery and Robotic Surgery',
  'Hepato-Pancreato-Biliary Surgery',
  'Breast and Endocrine Surgery',
  'Gynaecologic Oncology',
  'Reproductive Medicine',
  'Maternal & Fetal Medicine',
  'Radiodiagnosis / Medical Radiodiagnosis / Radio Diagnosis',
  'Nuclear Medicine',
  'Interventional Radiology',
  'Pathology / Clinical Pathology / Oral Pathology and Microbiology',
  'Biochemistry',
  'Microbiology',
  'Pharmacology / Clinical Pharmacology',
  'Clinical Immunology / Immunology and Immunopathology',
  'Anatomy',
  'Physiology',
  'Forensic Medicine',
  'Hematology',
  'Medical Genetics',
  'Community Medicine',
  'Public Health / Public Health Dentistry',
  'Industrial Health',
  'Health Administration / Hospital Administration',
  'Occupational Health',
  'Lifestyle Medicine (IBLM)',
  'Tropical Medicine / Tropical Medicine and Health',
  'Medical Oncology',
  'Medical Gastroenterology',
  'Ophthalmology / Ophthalmic Medicine and Surgery',
  'ENT / Otorhinolaryngology (ENT)',
  'Tuberculosis and Chest Diseases',
  'Sports Medicine',
  'Immunohematology & Blood Transfusion',
  'Pain Medicine',
  'Palliative Medicine / Onco-Anesthesia and Palliative Medicine',
  'Clinical Nutrition',
  'Pediatric Cardiology',
  'Pediatric Neurology',
  'Pediatric Nephrology',
  'Pediatric Gastroenterology',
  'Neonatology',
  'Child Health',
  'Ayurveda',
  'Homeopathy',
  'Yoga and Naturopathy',
  'Unani',
  'Oral and Maxillofacial Surgery',
  'Orthodontics and Dentofacial Orthopedics',
  'Prosthodontics and Crown & Bridge',
  'Conservative Dentistry and Endodontics',
  'Pedodontics and Preventive Dentistry',
  'Oral Medicine and Radiology'
];

const DoctorProfileView = () => {
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [doctorData, setDoctorData] = useState(null);
  const [editModalType, setEditModalType] = useState(null);
  const [kyc, setKyc] = useState(null)
  const [form] = Form.useForm();
  const location = useLocation();
  const navigate = useNavigate();
  const [degrees, setDegrees] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [loadingDegrees, setLoadingDegrees] = useState(false);
  const [loadingSpecs, setLoadingSpecs] = useState(false);

 

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

        const certifications = specializations.map((spec) => ({
          name: spec.name || "Specialization",
          registrationNo: spec.id || "N/A",
          image: spec.specializationCertificate || null,
          degreeCertificate: spec.drgreeCertificate || null,
        }));

        const bankDetails = userData.bankDetails;

        const decryptedBankDetails = {
          accountNumber: bankDetails.accountNumber,
          accountHolderName: bankDetails.accountHolderName,
          ifscCode: bankDetails.ifscCode,
          bankName: bankDetails.bankName,
        };

        setDoctorData({
          ...userData,
          key: userData._id,
          firstname: userData.firstname || "N/A",
          lastname: userData.lastname || "",
          specialization: specializations,
          email: userData.email || "N/A",
          mobile: userData.mobile || "N/A",
          status: userData.status || "pending",
          medicalRegistrationNumber:
            userData.medicalRegistrationNumber || "N/A",
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
            ? userData.addresses.map((addr) => ({
              name: addr.clinicName || "Clinic",
              address: `${addr.address}, ${addr.city}, ${addr.state}, ${addr.country} - ${addr.pincode}`,
              startTime: addr.startTime,
              endTime: addr.endTime,
            }))
            : [],
          bankDetails: decryptedBankDetails || userData.bankDetails || {},
          kycDetails: {
            panNumber: userData.kycDetails?.pan?.number || "N/A",
            panImage: userData.kycDetails?.pan?.attachmentUrl || null,
          },
          certifications: certifications,
          profilepic:  userData.profilepic,
        });
      }
    } catch (error) {
      message.error("Failed to load doctor data.");
    } finally {
      setLoading(false);
    }
  };

  const fetchKyc = async () => {
    setLoading(true);
    try {
      const response = await apiGet("/users/getKycByUserId");
      const userData = response.data?.data;
      setKyc(userData)
    } catch (error) {
      message.error("Failed to load doctor data.");
    } finally {
      setLoading(false);
    }
  };
   const fetchDegrees = async () => {
    try {
      setLoadingDegrees(true);
      const response = await apiGet('/catalogue/degree/getAllDegrees');
      const data = response?.data?.data || [];
      setDegrees(data);
    } catch (error) {
      toast.error('Failed to fetch degrees.');
    } finally {
      setLoadingDegrees(false);
    }
  };

  useEffect(() => {
    fetchDoctorData();
    fetchDegrees();
    fetchKyc();
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

  const handleEditModalOpen = (type) => {
    setEditModalType(type);
    form.resetFields();
    form.setFieldsValue(getInitialFormValues(type));
  };

  const handleEditModalClose = () => {
    setEditModalType(null);
  };

  const getInitialFormValues = (type) => {
    switch (type) {
      case 'personal':
        return {
          firstname: doctorData?.firstname,
          lastname: doctorData?.lastname,
          email: doctorData?.email,
          DOB: doctorData?.DOB,
          bloodgroup: doctorData?.bloodgroup,
          maritalStatus: doctorData?.maritalStatus,
          medicalRegistrationNumber: doctorData?.medicalRegistrationNumber,
          spokenLanguage: doctorData?.spokenLanguage || [],
          mobileNumber: doctorData?.mobile,
        };
      case 'professional': {
        const initialDegreeIds = doctorData?.specialization?.[0]?.degree
          ? doctorData.specialization[0].degree.split(',').map(deg => deg.trim())
          : [];

        const initialSpecs = doctorData?.specialization?.map(s => s.name) || [];

        return {
          degreeId: initialDegreeIds,
          specialization: initialSpecs,
          experience: doctorData?.specialization?.[0]?.experience,
          about: doctorData?.specialization?.[0]?.bio
        };
      }
      case 'locations':
        return {
          workingLocations: doctorData?.workingLocations,
        };
      case 'kyc':
        return {
          panNumber: doctorData?.kycDetails?.panNumber,
        };
      case 'consultation':
        return {
          consultationModeFee: doctorData?.consultationModeFee,
        };
      case 'bank':
        return {
          bankDetails: doctorData?.bankDetails,
        };
      default:
        return {};
    }
  };

  function extractFileFromAntdValue(value) {
    if (!value) return null;
    if (Array.isArray(value) && value.length) {
      const f = value[0];
      return f?.originFileObj instanceof File ? f.originFileObj : (f instanceof File ? f : null);
    }
    if (value?.originFileObj instanceof File) return value.originFileObj;
    if (value instanceof File) return value;
    return null;
  }

  const handleSaveProfile = async (values) => {
    let response;
    try {
      switch (editModalType) {
        case 'personal':
          const { mobileNumber, ...rest } = values;
          await apiPut("/users/updateUser", {
            ...rest,
            spokenLanguage笛: values.spokenLanguage || []
          });
          break;

        case 'professional': {
          const formDataObj = new FormData();
          formDataObj.append('id', doctorData?.userId || '');
          formDataObj.append('name', doctorData.specialization[0].name);
          formDataObj.append('experience', values.experience || '');
          formDataObj.append('degree', Array.isArray(values.degreeId)
            ? values.degreeId.join(',')
            : values.degreeId || '');
          formDataObj.append('bio', values.about || '');
          if (values.drgreeCertificate) {
            formDataObj.append('drgreeCertificate', values.drgreeCertificate);
          }
          if (values.specializationCertificate) {
            formDataObj.append('specializationCertificate', values.specializationCertificate);
          }
          await apiPost(
            `/users/updateSpecialization?userId=${doctorData?.userId || ''}`,
            formDataObj
          );
          break;
        }

        case 'locations':
          await apiPut("/users/updateLocations", { addresses: values.workingLocations });
          break;

        case 'kyc': {
          const file = extractFileFromAntdValue(values?.panImage);
          if (!file) {
            message.error("Please select a PAN image/PDF.");
            break;
          }

          const userId = String(doctorData?.userId ?? values?.userId ?? "").trim();
          const panNumber = String(values?.panNumber ?? "").trim();

          const resp = await postKYCDetails({ file, userId, panNumber });
          break;
        }

        case 'consultation':
          const cleanedFees = values.consultationModeFee.map(item => ({
            type: item.type,
            fee: Number(item.fee),
            currency: item.currency,
          }));
          await apiPost("/users/updateConsultationModes", { consultationModeFee: cleanedFees });
          break;

        case 'bank':
          await apiPost("/users/updateBankDetails", values);
          break;
      }

      message.success("Profile updated successfully");
      handleEditModalClose();
      fetchDoctorData();
    } catch (error) {

      // Handle backend validation errors
      if (error.response?.data?.message?.message) {
        toast.error(error.response.data.message.message);
      } else {
        message.error("Failed to update profile");
      }
    }
  };

  const UploadImage = ({ onUpload, accept = "image/*,.pdf" }) => {
    return (
      <Upload
        beforeUpload={(file) => {
          const isValidType = file.type.startsWith("image/") ||
            file.type === "application/pdf";
          const isLt5M = file.size / 1024 / 1024 < 5;

          if (!isValidType) {
            message.error("You can only upload JPG, PNG, or PDF files!");
            return Upload.LIST_IGNORE;
          }

          if (!isLt5M) {
            message.error("File must be smaller than 5MB!");
            return Upload.LIST_IGNORE;
          }

          onUpload(file);
          return false;
        }}
        maxCount={1}
        accept={accept}
        showUploadList={{ showRemoveIcon: true }}
      >
        <Button icon={<UploadOutlined />}>Upload File (Max 5MB)</Button>
      </Upload>
    );
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
                <div className="profile-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <UserOutlined style={{ marginRight: "8px", color: "#3b82f6" }} />
                    Personal Information
                  </div>
                  <Button type="link" icon={<EditOutlined />} onClick={() => handleEditModalOpen('personal')}>

                  </Button>
                </div>
              }
              className="profile-card"
            >
              <div className="avatar-container">
                {doctorData?.profilepic ? (
                   <Avatar
                    src={doctorData?.profilepic || undefined}
                    size={{ xs: 28, sm: 32, md: 36, lg: 40, xl: 44, xxl: 48 }}
                    style={{ flexShrink: 0, backgroundColor: "#e2e8f0" }}
                  />
  
                ) : (
<div
                  size={64}
                 style={{ flexShrink: 0, backgroundColor: "#1162cbff", borderRadius: "50%", height:'50px', width:  '50px', display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", fontWeight: "600", fontSize: "20px" }}
                  className="doctor-avatar"
                >
                  {`${doctorData.firstname?.[0] ?? ""}${doctorData.lastname?.[0] ?? ""}`}
                </div>
                )}
              
                
                <Title level={4} className="doctor-name">
                {doctorData.role === "doctor" && <span>Dr. </span>}  {doctorData?.firstname} {doctorData?.lastname}
                </Title>


              </div>
              <div className="info-section">
                <div className="info-item">
                  <Text className="info-text" style={{ marginLeft: "24px" }}>
                    <strong>Mobile Number:</strong> {doctorData.mobile}
                  </Text>
                </div>
                <div className="info-item">
                  <ManOutlined className="info-icon" />
                  <Text className="info-text">
                    <strong>Gender:</strong> {doctorData.gender}
                  </Text>
                </div>
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
                  {doctorData.spokenLanguage.length > 0 ? (
                    doctorData.spokenLanguage.map((lang, index) => (
                      <Tag key={index} className="language-tag">
                        {lang}
                      </Tag>
                    ))
                  ) : (
                    <Text style={{ color: "#6b7280" }}>
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
                <div className="profile-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <MedicineBoxOutlined style={{ marginRight: "8px", color: "#3b82f6" }} />
                    Professional Summary
                  </div>
                  <Button type="link" icon={<EditOutlined />} onClick={() => handleEditModalOpen('professional')}>

                  </Button>
                </div>
              }
              className="profile-card"
            >
              <div className="info-item">
                <Text className="info-text">
                  <strong>Medical Registration:</strong> {doctorData.medicalRegistrationNumber}
                </Text>
              </div>
              <div className="info-item">
                <Text className="info-text">
                  <strong>State Medical Council: </strong> TSMC
                </Text>
              </div>
              <div className="info-item">
                <Text className="info-text">
                  <strong>Degrees: </strong>
                  {doctorData.specialization[0]?.degree ? (
                    doctorData.specialization[0].degree.split(',').map((degree, index) => (
                      <Tag key={index} className="specialization-tag">
                        {degree.trim()}
                      </Tag>
                    ))
                  ) : (
                    <Text style={{ color: "#6b7280" }}>
                      No degrees added
                    </Text>
                  )}
                </Text>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <Text strong style={{ fontSize: "14px", color: "#166534", display: "block", marginBottom: "8px", fontWeight: "600" }}>
                  Specializations
                </Text>
                <div>
                  {doctorData.specialization.length > 0 ? (
                    doctorData.specialization[0].name.split(',').map((spec, index) => (
                      <Tag key={index} className="specialization-tag">
                        {spec || "Not specified"}
                      </Tag>
                    ))
                  ) : (
                    <Text style={{ color: "#6b7280" }}>
                      No specializations added
                    </Text>
                  )}
                </div>
              </div>
              <div className="info-item">
                <Text className="info-text">
                  <strong>Work Experience:</strong>{doctorData.specialization[0]?.experience || 0} Years
                </Text>
              </div>

              <div className="info-item">
                <Text className="info-text">
                  <strong>About:</strong>{doctorData.specialization[0]?.bio || "N/A"}
                </Text>
              </div>

              {/* Add View buttons for degree and specialization certificates */}
              <div style={{ marginTop: "16px", display: "flex", gap: "8px" }}>
                {doctorData.specialization[0]?.degreeCertificateUrl && (
                  <Button
                    type="primary"
                    size="small"
                    onClick={() => showModal({
                      type: "Degree Certificate",
                      data: doctorData.specialization[0].degreeCertificateUrl
                    })}
                  >
                    View Degree Certificate
                  </Button>
                )}
                {doctorData.specialization[0]?.specializationCertificateUrl && (
                  <Button
                    type="primary"
                    size="small"
                    onClick={() => showModal({
                      type: "Specialization Certificate",
                      data: doctorData.specialization[0].specializationCertificateUrl
                    })}
                  >
                    View Specialization Certificate
                  </Button>
                )}
              </div>
            </Card>
          </Col>

          {/* KYC Details */}
          <Col xs={24} lg={12}>
            <Card
              title={
                <div className="profile-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <IdcardOutlined style={{ marginRight: "8px", color: "#3b82f6" }} />
                    KYC Details
                  </div>
                  {!kyc?.pan?.number && <Button type="link" icon={<EditOutlined />} onClick={() => handleEditModalOpen('kyc')}>

                  </Button>}
                </div>
              }
              className="profile-card"
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <IdcardOutlined className="info-icon" />
                  <div>
                    <Text strong className="info-text">PAN Number:</Text>
                    <Text className="info-text" style={{ marginLeft: "8px" }}>
                      {kyc?.pan?.number || "N/A"}
                    </Text>
                  </div>
                </div>

                {/* Updated View button for PAN document */}
                {kyc?.pan?.attachmentUrl && (
                  <Button
                    type="primary"
                    size="small"
                    onClick={() => showModal({
                      type: "PAN Document",
                      data: kyc.pan.attachmentUrl
                    })}
                  >
                    View PAN
                  </Button>
                )}
              </div>
            </Card>
          </Col>

          {/* Consultation Charges */}
          <Col xs={24} lg={12}>
            <Card
              title={
                <div className="profile-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <DollarOutlined style={{ marginRight: "8px", color: "#3b82f6" }} />
                    Consultation Charges
                  </div>
                  <Button type="link" icon={<EditOutlined />} onClick={() => handleEditModalOpen('consultation')}>

                  </Button>
                </div>
              }
              className="profile-card"
            >
              {doctorData.consultationModeFee.map((mode, index) => (
                <div
                  key={index}
                  className={`consultation-card ${mode.type === "In-Person" ? "consultation-in-person" : mode.type === "Video" ? "consultation-video" : "consultation-home"}`}
                >
                  <div style={{ display: "flex", alignItems: "center" }}>
                    {mode.type === "In-Person" && <UserOutlined className="consultation-icon" style={{ color: "#3b82f6" }} />}
                    {mode.type === "Video" && <VideoCameraOutlined className="consultation-icon" style={{ color: "#16a34a" }} />}
                    {mode.type === "Home Visit" && <CarOutlined className="consultation-icon" style={{ color: "#9333ea" }} />}
                    <div>
                      <Text strong className="info-text" style={{ display: "block" }}>{mode.type}</Text>
                    </div>
                  </div>
                  <div className="consultation-price">
                    {mode.currency}{mode.fee}
                  </div>
                </div>
              ))}
            </Card>
          </Col>

          {/* Bank Details */}
          <Col xs={24} lg={12}>
            <Card
              title={
                <div className="profile-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <BankOutlined style={{ marginRight: "8px", color: "#3b82f6" }} />
                    Bank Details
                  </div>
                  {!doctorData.bankDetails.accountNumber && (
                    <Button type="link" icon={<EditOutlined />} onClick={() => handleEditModalOpen('bank')}>
                    </Button>
                  )}
                </div>
              }
              className="profile-card"
            >
              <Descriptions column={1} colon={true} labelStyle={{ fontWeight: 'bold' }}>
                <Descriptions.Item label="Bank">
                  {doctorData.bankDetails.bankName || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Account Holder">
                  {doctorData.bankDetails.accountHolderName || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Account Number">
                  <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                    {doctorData.bankDetails.accountNumber || "N/A"}
                    {doctorData.bankDetails.accountProof && (
                      <Button
                        type="link"
                        size="small"
                        icon={<EyeOutlined style={{ color: "#3b82f6" }} />}
                        onClick={() => showModal({ type: "accountProof", data: doctorData.bankDetails.accountProof })}
                      />
                    )}
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Bank IFSC">
                  {doctorData.bankDetails.ifscCode || "N/A"}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
        </Row>

        <Modal
          title={selectedDocument?.type || "Document"}
          open={isModalVisible}
          onOk={handleOk}
          onCancel={handleCancel}
          footer={[<Button key="close" onClick={handleCancel}>Close</Button>]}
          width={600}
        >
          {selectedDocument && (
            <div style={{ textAlign: "center" }}>
              {selectedDocument.data ? (
                <img
                  src={selectedDocument.data}
                  alt={selectedDocument.type}
                  className="document-modal-image"
                  style={{ maxWidth: '100%' }}
                />
              ) : (
                <Text className="info-text">No image available for this document.</Text>
              )}
            </div>
          )}
        </Modal>

        <Modal

          title=
          {editModalType === 'kyc' ? `Add KYC Details` : `Edit ${editModalType ? editModalType.charAt(0).toUpperCase() + editModalType.slice(1) : ''} Details`}
          open={!!editModalType}
          onCancel={handleEditModalClose}
          onOk={() => form.submit()}
          okText="Save Changes"
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSaveProfile}
          >
            {editModalType === 'personal' && (
              <>
                <Form.Item
                  label="First Name"
                  name="firstname"
                  rules={VALIDATION_RULES.name}
                >
                  <Input
                    onChange={(e) => {
                      e.target.value = e.target.value.replace(/[^A-Za-z\s]/g, '');
                    }}
                  />
                </Form.Item>

                <Form.Item
                  label="Last Name"
                  name="lastname"
                  rules={VALIDATION_RULES.name}
                >
                  <Input
                    onChange={(e) => {
                      e.target.value = e.target.value.replace(/[^A-Za-z\s]/g, '');
                    }}
                  />
                </Form.Item>

                <Form.Item
                  label="Mobile Number"
                  name="mobileNumber"
                  rules={VALIDATION_RULES.mobile}
                >
                  <Input
                    disabled
                    maxLength={10}
                    onChange={(e) => {
                      e.target.value = e.target.value.replace(/[^0-9]/g, '');
                    }}
                  />
                </Form.Item>

                <Form.Item
                  label="Email"
                  name="email"
                  rules={VALIDATION_RULES.email}
                >
                  <Input type="email" />
                </Form.Item>

                <Form.List name="spokenLanguage">
                  {(fields, { add, remove }) => (
                    <>
                      {fields.map(({ key, name, ...restField }) => (
                        <Form.Item
                          key={key}
                          label="Language"
                          style={{ marginBottom: 12 }}
                        >
                          <Space.Compact block>
                            <Form.Item
                              {...restField}
                              name={name}
                              noStyle
                              rules={[{ required: true, message: 'Please select a language' }]}
                            >
                              <Select
                                placeholder="Select a language"
                                popupMatchSelectWidth={false}
                                style={{ minWidth: 220 }}
                              >
                                {languageOptions.map((option) => (
                                  <Option
                                    key={option.value}
                                    value={option.value}
                                    disabled={(form.getFieldValue('spokenLanguage') || []).includes(option.value)}
                                  >
                                    {option.label}
                                  </Option>
                                ))}
                              </Select>
                            </Form.Item>

                            <Button
                              danger
                              onClick={() => remove(name)}
                            >
                              Remove
                            </Button>
                          </Space.Compact>
                        </Form.Item>
                      ))}

                      <Form.Item>
                        <Button
                          type="dashed"
                          onClick={() => add()}
                          block
                          disabled={fields.length >= languageOptions.length}
                        >
                          Add Language
                        </Button>
                      </Form.Item>
                    </>
                  )}
                </Form.List>
              </>
            )}

            {editModalType === 'professional' && (
              <>
                <Form.Item
                  label="Degree"
                  name="degreeId"
                  rules={[{ required: true, message: 'Please select a degree' }]}
                >
                  <Select
                    mode="multiple"
                    placeholder="Select degree"
                    loading={loadingDegrees}
                    showSearch
                    optionFilterProp="label"
                    options={degrees.map(d => ({
                      label: d.name || d.degreeName || d.title,
                      value: d.name || d.degreeName || d.title,
                    }))}
                  />
                </Form.Item>

                <Form.Item
                  label="Experience (Years)"
                  name="experience"
                  rules={VALIDATION_RULES.experience}
                >
                  <Input
                    type="number"
                    min={0}
                    max={60}
                    onChange={(e) => {
                      e.target.value = e.target.value.replace(/[^0-9]/g, '');
                    }}
                  />
                </Form.Item>

                <Form.Item
                  label="About"
                  name="about"
                  rules={[
                    { max: 500, message: 'About cannot exceed 500 characters' }
                  ]}
                >
                  <Input.TextArea
                    showCount
                    maxLength={500}
                    rows={4}
                  />
                </Form.Item>
              </>
            )}

            {editModalType === 'kyc' && (
              <>
                <Form.Item
                  label="PAN Number"
                  name="panNumber"
                  rules={VALIDATION_RULES.pan}
                >
                  <Input
                    style={{ textTransform: 'uppercase' }}
                    maxLength={10}
                    onChange={(e) => {
                      e.target.value = e.target.value.replace(/[^A-Z0-9]/g, '').toUpperCase();
                    }}
                  />
                </Form.Item>

                <Form.Item
                  label="PAN Image"
                  name="panImage"
                  rules={[{ required: true, message: 'Please upload a PAN image' }]}
                >
                  <UploadImage onUpload={(file) => form.setFieldsValue({ panImage: file })} />
                </Form.Item>
              </>
            )}

            {editModalType === 'consultation' && (
              <Form.List name="consultationModeFee">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                        <Form.Item
                          {...restField}
                          name={[name, 'type']}
                          label="Consultation Type"
                          rules={[{ required: true, message: 'Type is required' }]}
                        >
                          <Input />
                        </Form.Item>
                        <Form.Item
                          {...restField}
                          name={[name, 'fee']}
                          label="Fee (₹)"
                          rules={VALIDATION_RULES.fee}
                        >
                          <Input
                            type="number"
                            min={0}
                            onChange={(e) => {
                              e.target.value = e.target.value.replace(/[^0-9]/g, '');
                            }}
                          />
                        </Form.Item>

                      </Space>
                    ))}

                  </>
                )}
              </Form.List>
            )}

            {editModalType === 'bank' && (
              <>
                <Form.Item
                  label="Bank Name"
                  name={["bankDetails", "bankName"]}
                  rules={[
                    { required: true, message: 'Please enter bank name' },
                    { min: 2, message: 'Bank name must be at least 2 characters' },
                    { max: 100, message: 'Bank name cannot exceed 100 characters' },
                    {
                      pattern: /^[a-zA-Z\s]+$/,
                      message: 'Bank name should contain only letters and spaces',
                    },
                  ]}
                >
                  <Input
                    onKeyPress={(e) => {
                      // Prevent typing numbers and special characters
                      if (!/^[a-zA-Z\s]$/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    onPaste={(e) => {
                      // Get pasted data and validate
                      const pastedData = e.clipboardData.getData('text');
                      if (!/^[a-zA-Z\s]*$/.test(pastedData)) {
                        e.preventDefault();
                        message.error('Only letters and spaces are allowed');
                      }
                    }}
                  />
                </Form.Item>

                <Form.Item
                  label="Account Holder Name"
                  name={["bankDetails", "accountHolderName"]}
                  rules={[
                    { required: true, message: 'Please enter account holder name' },
                    { min: 2, message: 'Account holder name must be at least 2 characters' },
                    { max: 100, message: 'Account holder name cannot exceed 100 characters' },
                    {
                      pattern: /^[a-zA-Z\s]+$/,
                      message: 'Account holder name should contain only letters and spaces'
                    }
                  ]}
                >
                  <Input
                    onKeyPress={(e) => {
                      // Prevent typing numbers and special characters
                      if (!/^[a-zA-Z\s]$/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    onPaste={(e) => {
                      // Get pasted data and validate
                      const pastedData = e.clipboardData.getData('text');
                      if (!/^[a-zA-Z\s]*$/.test(pastedData)) {
                        e.preventDefault();
                        message.error('Only letters and spaces are allowed');
                      }
                    }}
                  />
                </Form.Item>

                <Form.Item
                  label="Account Number"
                  name={["bankDetails", "accountNumber"]}
                  rules={VALIDATION_RULES.accountNumber}
                >
                  <Input
                    maxLength={18}
                    onChange={(e) => {
                      e.target.value = e.target.value.replace(/[^0-9]/g, '');
                    }}
                    onKeyPress={(e) => {
                      // Allow only numbers
                      if (!/^[0-9]$/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                  />
                </Form.Item>

                <Form.Item
                  label="IFSC Code"
                  name={['bankDetails', 'ifscCode']}
                  rules={[
                    { required: true, message: 'IFSC code is required' },
                    () => ({
                      validator(_, value) {
                        if (!value) return Promise.resolve();

                        if (value.length !== 11) {
                          return Promise.reject(new Error('IFSC code must be exactly 11 characters'));
                        }

                        if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(value)) {
                          return Promise.reject(new Error('Format: 4 letters + 0 + 6 characters (e.g., HDFC0000123)'));
                        }

                        return Promise.resolve();
                      },
                    }),
                  ]}
                >
                  <Input
                    placeholder="e.g., HDFC0000123"
                    maxLength={11}
                    onChange={(e) => {
                      const upperValue = e.target.value.toUpperCase();
                      form.setFieldsValue({
                        bankDetails: {
                          ...form.getFieldValue('bankDetails'),
                          ifscCode: upperValue
                        }
                      });
                    }}
                    style={{ textTransform: 'uppercase' }}
                  />
                </Form.Item>
              </>
            )}
          </Form>
        </Modal>
      </Spin>
    </div>
  );
};

export default DoctorProfileView;