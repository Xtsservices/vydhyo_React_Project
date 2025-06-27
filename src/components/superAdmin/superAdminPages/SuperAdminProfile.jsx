import React, { useState } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Tabs,
  Input,
  Select,
  DatePicker,
  Switch,
  Form,
  Avatar,
  Typography,
  Space,
  Divider,
  Grid
} from 'antd';
import { UserOutlined, EditOutlined, SaveOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { useBreakpoint } = Grid;

const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const screens = useBreakpoint();
  
  const [profileData, setProfileData] = useState({
    // Personal Information
    firstName: 'Dr. Priya',
    lastName: 'Sharma',
    email: 'priya.sharma@apollohyd.com',
    phone: '+91 98765 43210',
    dateOfBirth: '1985-03-15',
    gender: 'Female',
    address: 'Plot No. 251, Jubilee Hills, Hyderabad, Telangana 500033',
    aadharNumber: '1234 5678 9012',
    panNumber: 'ABCDE1234F',
    
    // Professional Information
    specialization: 'Cardiology & Interventional Cardiology',
    licenseNumber: 'TS/MED/12345/2010',
    mcRegistration: 'MCI-54321-2010',
    experience: '15 years',
    education: 'MBBS - Osmania Medical College, MD Cardiology - AIIMS Delhi, DM Interventional Cardiology - SGPGI Lucknow',
    hospital: 'Apollo Hospitals, Jubilee Hills',
    consultationFee: '₹1,500',
    followUpFee: '₹800',
    languages: ['English', 'Hindi', 'Telugu', 'Urdu'],
    
    // Settings
    notifications: {
      email: true,
      sms: true,
      appointment: true,
      billing: true,
      whatsapp: true
    },
    language: 'English',
    timezone: 'Asia/Kolkata'
  });

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNotificationChange = (type, value) => {
    setProfileData(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [type]: value
      }
    }));
  };

  const handleSave = () => {
    setIsEditing(false);
    // Here you would typically save to your backend
    console.log('Saving profile data:', profileData);
  };

  const renderPersonalInfo = () => (
    <div>
      <Title level={3} style={{ marginBottom: '24px' }}>Personal Information</Title>
      
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Form.Item label="First Name">
            <Input
              value={profileData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              disabled={!isEditing}
              placeholder="Enter first name"
            />
          </Form.Item>
        </Col>
        
        <Col xs={24} md={12}>
          <Form.Item label="Last Name">
            <Input
              value={profileData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              disabled={!isEditing}
              placeholder="Enter last name"
            />
          </Form.Item>
        </Col>
        
        <Col xs={24} md={12}>
          <Form.Item label="Email">
            <Input
              type="email"
              value={profileData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              disabled={!isEditing}
              placeholder="Enter email"
            />
          </Form.Item>
        </Col>
        
        <Col xs={24} md={12}>
          <Form.Item label="Phone">
            <Input
              value={profileData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              disabled={!isEditing}
              placeholder="Enter phone number"
            />
          </Form.Item>
        </Col>
        
        <Col xs={24} md={12}>
          <Form.Item label="Date of Birth">
            <DatePicker
              value={dayjs(profileData.dateOfBirth)}
              onChange={(date) => handleInputChange('dateOfBirth', date ? date.format('YYYY-MM-DD') : '')}
              disabled={!isEditing}
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Col>
        
        <Col xs={24} md={12}>
          <Form.Item label="Gender">
            <Select
              value={profileData.gender}
              onChange={(value) => handleInputChange('gender', value)}
              disabled={!isEditing}
              style={{ width: '100%' }}
            >
              <Option value="Male">Male</Option>
              <Option value="Female">Female</Option>
              <Option value="Other">Other</Option>
            </Select>
          </Form.Item>
        </Col>
        
        <Col xs={24}>
          <Form.Item label="Address">
            <TextArea
              value={profileData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              disabled={!isEditing}
              rows={3}
              placeholder="Enter address"
            />
          </Form.Item>
        </Col>
        
        <Col xs={24} md={12}>
          <Form.Item label="Aadhar Number">
            <Input
              value={profileData.aadharNumber}
              onChange={(e) => handleInputChange('aadharNumber', e.target.value)}
              disabled={!isEditing}
              placeholder="Enter Aadhar number"
            />
          </Form.Item>
        </Col>
        
        <Col xs={24} md={12}>
          <Form.Item label="PAN Number">
            <Input
              value={profileData.panNumber}
              onChange={(e) => handleInputChange('panNumber', e.target.value)}
              disabled={!isEditing}
              placeholder="Enter PAN number"
            />
          </Form.Item>
        </Col>
      </Row>
    </div>
  );

  const renderProfessionalInfo = () => (
    <div>
      <Title level={3} style={{ marginBottom: '24px' }}>Professional Information</Title>
      
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Form.Item label="Specialization">
            <Input
              value={profileData.specialization}
              onChange={(e) => handleInputChange('specialization', e.target.value)}
              disabled={!isEditing}
              placeholder="Enter specialization"
            />
          </Form.Item>
        </Col>
        
        <Col xs={24} md={12}>
          <Form.Item label="License Number">
            <Input
              value={profileData.licenseNumber}
              onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
              disabled={!isEditing}
              placeholder="Enter license number"
            />
          </Form.Item>
        </Col>
        
        <Col xs={24} md={12}>
          <Form.Item label="MC Registration">
            <Input
              value={profileData.mcRegistration}
              onChange={(e) => handleInputChange('mcRegistration', e.target.value)}
              disabled={!isEditing}
              placeholder="Enter MC registration"
            />
          </Form.Item>
        </Col>
        
        <Col xs={24} md={12}>
          <Form.Item label="Experience">
            <Input
              value={profileData.experience}
              onChange={(e) => handleInputChange('experience', e.target.value)}
              disabled={!isEditing}
              placeholder="Enter experience"
            />
          </Form.Item>
        </Col>
        
        <Col xs={24} md={12}>
          <Form.Item label="Hospital/Clinic">
            <Input
              value={profileData.hospital}
              onChange={(e) => handleInputChange('hospital', e.target.value)}
              disabled={!isEditing}
              placeholder="Enter hospital/clinic"
            />
          </Form.Item>
        </Col>
        
        <Col xs={24} md={12}>
          <Form.Item label="Consultation Fee">
            <Input
              value={profileData.consultationFee}
              onChange={(e) => handleInputChange('consultationFee', e.target.value)}
              disabled={!isEditing}
              placeholder="Enter consultation fee"
            />
          </Form.Item>
        </Col>
        
        <Col xs={24} md={12}>
          <Form.Item label="Follow-up Fee">
            <Input
              value={profileData.followUpFee}
              onChange={(e) => handleInputChange('followUpFee', e.target.value)}
              disabled={!isEditing}
              placeholder="Enter follow-up fee"
            />
          </Form.Item>
        </Col>
        
        <Col xs={24}>
          <Form.Item label="Education">
            <TextArea
              value={profileData.education}
              onChange={(e) => handleInputChange('education', e.target.value)}
              disabled={!isEditing}
              rows={3}
              placeholder="Enter education details"
            />
          </Form.Item>
        </Col>
        
        <Col xs={24}>
          <Form.Item label="Languages">
            <Select
              mode="multiple"
              value={profileData.languages}
              onChange={(value) => handleInputChange('languages', value)}
              disabled={!isEditing}
              style={{ width: '100%' }}
              placeholder="Select languages"
            >
              <Option value="English">English</Option>
              <Option value="Hindi">Hindi</Option>
              <Option value="Telugu">Telugu</Option>
              <Option value="Tamil">Tamil</Option>
              <Option value="Urdu">Urdu</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>
    </div>
  );

  const renderSettings = () => (
    <div>
      <Title level={3} style={{ marginBottom: '24px' }}>Settings</Title>
      
      <div style={{ marginBottom: '32px' }}>
        <Title level={4} style={{ marginBottom: '16px' }}>Notification Preferences</Title>
        <Row gutter={[16, 16]}>
          {Object.entries(profileData.notifications).map(([key, value]) => (
            <Col xs={24} md={12} key={key}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
                <Text style={{ textTransform: 'capitalize' }}>{key} Notifications</Text>
                <Switch
                  checked={value}
                  onChange={(checked) => handleNotificationChange(key, checked)}
                  disabled={!isEditing}
                />
              </div>
            </Col>
          ))}
        </Row>
      </div>
      
      <Row gutter={[16, 16]} style={{ marginBottom: '32px' }}>
        <Col xs={24} md={12}>
          <Form.Item label="Language">
            <Select
              value={profileData.language}
              onChange={(value) => handleInputChange('language', value)}
              disabled={!isEditing}
              style={{ width: '100%' }}
            >
              <Option value="English">English</Option>
              <Option value="Hindi">Hindi</Option>
              <Option value="Telugu">Telugu</Option>
              <Option value="Tamil">Tamil</Option>
            </Select>
          </Form.Item>
        </Col>
        
        <Col xs={24} md={12}>
          <Form.Item label="Timezone">
            <Select
              value={profileData.timezone}
              onChange={(value) => handleInputChange('timezone', value)}
              disabled={!isEditing}
              style={{ width: '100%' }}
            >
              <Option value="Asia/Kolkata">Asia/Kolkata (IST)</Option>
              <Option value="Asia/Dubai">Asia/Dubai (GST)</Option>
              <Option value="Europe/London">Europe/London (GMT)</Option>
              <Option value="America/New_York">America/New_York (EST)</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>
      
      <Divider />
      
      <div>
        <Title level={4} style={{ marginBottom: '16px' }}>Security</Title>
        <Space direction={screens.md ? 'horizontal' : 'vertical'} size="middle">
          <Button type="primary">
            Change Password
          </Button>
          <Button type="primary" style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}>
            Enable Two-Factor Authentication
          </Button>
        </Space>
      </div>
    </div>
  );

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <Card style={{ marginBottom: '24px' }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space size="large">
              <Avatar 
                size={80} 
                icon={<UserOutlined />}
                style={{ backgroundColor: '#1890ff', fontSize: '32px' }}
              >
                {profileData.firstName.charAt(0) + profileData.lastName.charAt(0)}
              </Avatar>
              <div>
                <Title level={2} style={{ margin: 0 }}>
                  {profileData.firstName} {profileData.lastName}
                </Title>
                <Text type="secondary" style={{ fontSize: '16px' }}>
                  {profileData.specialization}
                </Text>
                <br />
                <Text type="secondary">
                  {profileData.hospital}
                </Text>
              </div>
            </Space>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={isEditing ? <SaveOutlined /> : <EditOutlined />}
              size="large"
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              style={{
                backgroundColor: isEditing ? '#52c41a' : '#1890ff',
                borderColor: isEditing ? '#52c41a' : '#1890ff'
              }}
            >
              {isEditing ? 'Save Changes' : 'Edit Profile'}
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Navigation Tabs */}
      <Card>
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          size="large"
          tabPosition={screens.md ? 'top' : 'top'}
        >
          <TabPane tab="Personal Information" key="personal">
            {renderPersonalInfo()}
          </TabPane>
          
          <TabPane tab="Professional Information" key="professional">
            {renderProfessionalInfo()}
          </TabPane>
          
          <TabPane tab="Settings" key="settings">
            {renderSettings()}
          </TabPane>
        </Tabs>
      </Card>

      {/* Action Buttons */}
      {isEditing && (
        <Card style={{ marginTop: '24px' }}>
          <Row justify="end">
            <Space>
              <Button
                onClick={() => setIsEditing(false)}
                size="large"
              >
                Cancel
              </Button>
              <Button
                type="primary"
                onClick={handleSave}
                size="large"
                style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
              >
                Save Changes
              </Button>
            </Space>
          </Row>
        </Card>
      )}
    </div>
  );
};

export default ProfilePage;