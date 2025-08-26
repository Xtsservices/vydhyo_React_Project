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
import { apiGet, apiPut, apiUploadFile, apiPost } from "../../api";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// import crypto = require('crypto');

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

const DoctorProfileView = () => {
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [doctorData, setDoctorData] = useState(null);
  const [editModalType, setEditModalType] = useState(null);
  const [form] = Form.useForm();
  const location = useLocation();
  const navigate = useNavigate();
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
// const algorithm = 'aes-256-cbc';
// const secretKey = process.env.ENCRYPTION_KEY; // 32-byte hex key
// const iv = Buffer.from(process.env.ENCRYPTION_IV, 'hex'); // 16-byte IV

// function decrypt2(text) {
//   const decipher = crypto.createDecipheriv(algorithm, Buffer.from(secretKey, 'hex'), iv);
//   let decrypted = decipher.update(text, 'hex', 'utf8');
//   decrypted += decipher.final('utf8');
//   return decrypted;
// }


  const fetchDoctorData = async () => {
    setLoading(true);
    try {
      const response = await apiGet("/users/getUser");
      console.log(response, "doctor data");
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
  ifscCode: bankDetails.ifscCode, // assuming this is not encrypted
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
          bankDetails:decryptedBankDetails || userData.bankDetails || {},
          kycDetails: {
            panNumber: userData.kycDetails?.pan?.number || "N/A",
            panImage: userData.kycDetails?.pan?.attachmentUrl || null,
           
          },
          certifications: certifications,
          profilepic: null,
        });
      }
    } catch (error) {
      console.error("Error fetching doctor data:", error);
      message.error("Failed to load doctor data.");
    } finally {
      setLoading(false);
    }
  };
const [degrees, setDegrees] = useState([]);
const [specializations, setSpecializations] = useState([]);
const [loadingDegrees, setLoadingDegrees] = useState(false);
const [loadingSpecs, setLoadingSpecs] = useState(false);

// fetch degrees (you already have this—kept same, just added a loading flag)
const fetchDegrees = async () => {
  try {
    setLoadingDegrees(true);
    const response = await apiGet('/catalogue/degree/getAllDegrees');
    const data = response?.data?.data || [];
    console.log(data, "1234")
    setDegrees(data);
  } catch (error) {
    console.error('Error fetching degrees:', error);
    toast.error('Failed to fetch degrees.');
  } finally {
    setLoadingDegrees(false);
  }
};



  useEffect(() => {
    fetchDoctorData();
    fetchDegrees();
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
        const initialDegreeId = degrees.find(d => d.name === doctorData?.specialization?.[0]?.degree)?._id;
        const initialSpecs = doctorData?.specialization?.map(s => s.name) || [];
        return {
          degreeId: initialDegreeId,
          degree: doctorData?.specialization?.[0]?.degree,
          specialization: initialSpecs,
          experience: doctorData?.specialization?.[0]?.experience,
          certifications: doctorData?.certifications,
          about :doctorData?.specialization?.[0]?.bio
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

  const handleSaveProfile = async (values) => {

    let response;
    try {
      switch (editModalType) {
        case 'personal':
          console.log("Updating personal information", values);
            const { mobileNumber, ...rest } = values;
          await apiPut("/users/updateUser", {
            ...rest,
            spokenLanguage: values.spokenLanguage || []
          });
          break;
       

    case 'professional': {
  const formDataObj = new FormData();
  formDataObj.append('id', doctorData?.userId || '');

  formDataObj.append('name', Array.isArray(values.specialization) ? values.specialization.join(',') : values.specialization || '');
  formDataObj.append('experience', values.experience || '');
  formDataObj.append('degree', Array.isArray(values.degreeId) ? values.degreeId.join(',') : values.degreeId || '');
  formDataObj.append('bio', values.about || '');
  formDataObj.append('services', values.services || ''); // Optional field
  if (values.drgreeCertificate) {
    formDataObj.append('drgreeCertificate', values.drgreeCertificate);
  }
  if (values.specializationCertificate) {
    formDataObj.append('specializationCertificate', values.specializationCertificate);
  }

  // Log FormData entries for debugging
  for (let pair of formDataObj.entries()) {
    console.log(pair[0] + ': ' + pair[1]);
  }

  await apiPost(
    `/users/updateSpecialization?userId=${doctorData?.userId || ''}`,
   
    formDataObj, // FormData with fields
    // { headers: { id: doctorData?.userId || '' } } // Send userId in headers as fallback
  );
  break;
}
        case 'locations':
          await apiPut("/users/updateLocations", { addresses: values.workingLocations });
          break;
 case 'kyc': {
  const file =
    values?.panImage?.originFileObj instanceof File
      ? values.panImage.originFileObj
      : (values?.panImage instanceof File ? values.panImage : null);

      console.log(file, "file");

response =  await apiUploadFile(
    "/users/addKYCDetails",
    file,                    // <-- raw File (or null)
    "panFile",               // <-- field name your backend expects
    {
      userId: String(doctorData?.userId),
      panNumber: (values?.panNumber || "").toUpperCase(),
    }
  );
  break;
}


        case 'consultation':
           const cleanedFees = values.consultationModeFee.map(item => ({
    type: item.type,
    fee: Number(item.fee),       // Convert fee to number
    currency: item.currency,
  }));
          console.log(cleanedFees, "consultation values")
          await apiPost("/users/updateConsultationModes", { consultationModeFee: cleanedFees });

          break;
        case 'bank':
          await apiPost("/users/updateBankDetails", values);
          break;
      }
      console.log(response, "response after update");
      message.success("Profile updated successfully");
      handleEditModalClose();
      fetchDoctorData();
    } catch (error) {
      console.error("Error updating profile:", error);
      message.error("Failed to update profile");
    }
  };

  const UploadImage = ({ onUpload }) => {
    return (
      <Upload
        beforeUpload={(file) => {
          const isValidType =
            file.type.startsWith("image/") || file.type === "application/pdf";
          if (!isValidType) {
            message.error("You can only upload JPG/PNG/PDF files!");
            return Upload.LIST_IGNORE;
          }
          onUpload(file);
          return false;
        }}
        maxCount={1}
        showUploadList={{ showRemoveIcon: true }}
      >
        <Button icon={<UploadOutlined />}>Upload File</Button>
      </Upload>
    );
  };

  if (!doctorData) {
    return <Spin spinning={loading} tip="Loading doctor details..." />;
  }

  // put this near the top of your file
const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/; // 11 chars: 4 letters + '0' + 6 alnum


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
                
                {/* <Text className="doctor-meta">
                  Mobile Number: {doctorData.mobile}
                </Text> */}
              </div>
              <div className="info-section">
                {/* <div className="info-item">
                  <CalendarOutlined className="info-icon" />
                  <Text className="info-text">
                    <strong>Date of Birth:</strong> {doctorData.DOB}
                  </Text>
                </div> */}
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
                    <strong>Degrees: </strong>  {doctorData.specialization.length > 0 ? (
                    doctorData.specialization.map((spec, index) => (
                      <Tag key={index} className="specialization-tag">
                        {spec.degree || "Not specified"}
                      </Tag>
                    ))
                  ) : (
                    <Text style={{ color: "#6b7280" }}>
                      No specializations added
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
                    doctorData.specialization.map((spec, index) => (
                      <Tag key={index} className="specialization-tag">
                        {spec.name || "Not specified"}
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
              {/* <div style={{ marginBottom: "20px" }}>
                <Text strong className="info-text" style={{ display: "block", marginBottom: "8px" }}>
                  Work Experience
                </Text>
                <div className="experience-container">
                  <Title level={2} className="experience-years">
                    {doctorData.specialization[0]?.experience || 0} Years
                  </Title>
                </div>
              </div> */}
              {/* <div>
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
                            className="view-button"
                            size="small"
                            onClick={() => showModal({ type: "Specialization Certificate", data: cert.image })}
                          >
                            View Certificate
                          </Button>
                        )}
                        {cert.degreeCertificate && (
                          <Button
                            className="view-button"
                            size="small"
                            onClick={() => showModal({ type: "Degree Certificate", data: cert.degreeCertificate })}
                          >
                            View Degree
                          </Button>
                        )}
                      </Space>
                    </div>
                  ))
                ) : (
                  <Text style={{ color: "#6b7280" }}>
                    No certifications added
                  </Text>
                )}
              </div> */}
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
                  <Button type="link" icon={<EditOutlined />} onClick={() => handleEditModalOpen('kyc')}>
                    
                  </Button>
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
                      {doctorData.kycDetails.panNumber || "N/A"}
                    </Text>
                  </div>
                </div>
                {doctorData.kycDetails.panImage && (
                  <Button
                    type="link"
                    size="small"
                    onClick={() => showModal({ type: "pan", data: doctorData.kycDetails.panImage })}
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
                      {/* <Text style={{ fontSize: "12px", color: "#6b7280" }}>{mode.description || "N/A"}</Text> */}
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
                  <Button type="link" icon={<EditOutlined />} onClick={() => handleEditModalOpen('bank')}>
                    
                  </Button>
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
                  src={getImageSrc(selectedDocument.data)}
                  alt={selectedDocument.type}
                  className="document-modal-image"
                />
              ) : (
                <Text className="info-text">No image available for this document.</Text>
              )}
            </div>
          )}
        </Modal>

        <Modal
          title={`Edit ${editModalType ? editModalType.charAt(0).toUpperCase() + editModalType.slice(1) : ''} Details`}
          open={!!editModalType}
          onCancel={handleEditModalClose}
          onOk={() => form.submit()}
          okText="Save Changes"
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSaveProfile}
          >
            {editModalType === 'personal' && (
              <>
                <Form.Item label="First Name" name="firstname">
                  <Input />
                </Form.Item>
                <Form.Item label="Last Name" name="lastname">
                  <Input />
                </Form.Item>
                <Form.Item label="Mobile Number" name="mobileNumber" >
                  <Input disabled/>
                </Form.Item>
                <Form.Item label="Email" name="email">
                  <Input />
                </Form.Item>
               
               {/* inside your 'personal' block */}
<Form.List name="spokenLanguage">
  {(fields, { add, remove }) => (
    <>
      {fields.map(({ key, name, ...restField }) => (
        <Form.Item
          key={key}
          label="Language"
          style={{ marginBottom: 12 }}
          // keep validation on the inner noStyle item
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
              // icon only keeps row tight; add text if you prefer
              // icon={<DeleteOutlined />}
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
      label: d.name || d.degreeName || d.title, // adapt to your API fields
      value: d.degreeName || d.name || d.title, // adapt to your API fields
    }))}
  />
</Form.Item>
<Form.Item
  label="Specializations"
  name="specialization"
  rules={[{ required: true, message: 'Please select at least one specialization' }]}
>
  <Select
    mode="multiple"
    placeholder="Select specializations"
    loading={loadingSpecs}
    showSearch
    optionFilterProp="label"
    options={specializationOptions.map(s => ({
      label: s,
      value: s,
    }))}
  />
</Form.Item>
<Form.Item
  label="Experience"
  name="experience"
  rules={[{ required: true, message: 'Please enter your experience' }]}
>
  <Input type="number" />
</Form.Item>

<Form.Item
  label="About"
  name="about"
>
  <Input.TextArea />
</Form.Item>

              </>
            )}
          {editModalType === 'kyc' && (
  <>
    <Form.Item
      label="PAN Number"
      name="panNumber"
      rules={[
        { required: true, message: 'Please enter your PAN number' },
      ]}
    >
      <Input style={{ textTransform: 'uppercase' }} maxLength={10} />
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
                        >
                          <Input />
                        </Form.Item>
                        <Form.Item
                          {...restField}
                          name={[name, 'fee']}
                          label="Fee"
                        >
                          <Input type="number" />
                        </Form.Item>
                       
                       
                      </Space>
                    ))}
                   
                  </>
                )}
              </Form.List>
            )}
            {editModalType === 'bank' && (
              <>
                <Form.Item label="Bank Name" name={["bankDetails", "bankName"]}>
                  <Input />
                </Form.Item>
                <Form.Item label="Account Holder Name" name={["bankDetails", "accountHolderName"]}>
                  <Input />
                </Form.Item>
                <Form.Item label="Account Number" name={["bankDetails", "accountNumber"]}  rules={[
    {
      pattern: /^\d{6,14}$/,
      message: "Account number must be 6 to 14 digits",
    },
  ]}>
                  <Input />
                </Form.Item>
                <Form.Item
  label="IFSC Code"
  name={['bankDetails', 'ifscCode']}
  validateFirst
  hasFeedback
  getValueFromEvent={(e) =>
    String(e?.target?.value || '')
      .toUpperCase()
      .replace(/\s|-/g, '') // strip spaces/dashes if pasted
  }
  rules={[
    { required: true, message: 'IFSC is required' },
    { len: 11, message: 'IFSC must be exactly 11 characters' },
    {
      pattern: IFSC_REGEX,
      message: 'Invalid IFSC format (e.g., HDFC0XXXXXX)',
    },
  ]}
>
  <Input
    placeholder="e.g., HDFC0ABCD12"
    maxLength={11}
    autoComplete="off"
    allowClear
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