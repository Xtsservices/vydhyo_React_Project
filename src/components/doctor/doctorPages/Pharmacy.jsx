import React, { useState } from 'react';
import { 
  Layout, 
  Card, 
  Table, 
  Tabs, 
  Input, 
  Button, 
  Avatar, 
  Space,
  Row,
  Col,
  Statistic,
  Typography,
  Pagination,
   Modal,
  InputNumber
} from 'antd';
import { 
  SearchOutlined, 
  UserOutlined, 
  UsergroupAddOutlined,
  EditOutlined,
  CheckOutlined,
  CloseOutlined,
  PlusOutlined,
  MedicineBoxOutlined
} from '@ant-design/icons';

const { Header, Content } = Layout;
const { Title, Text } = Typography;
import  '../../stylings/pharmacy.css'; // Import the CSS file for styling
import { apiPost } from '../../api';
import { useSelector } from 'react-redux';


export default function Pharmacy() {
  const user = useSelector((state) => state.currentUserData);

  const [activeTab, setActiveTab] = useState('1');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form, setForm] = useState({
    medName: '',
    quantity: '',
    price: ''
  });
  const [errors, setErrors] = useState({});   

  const patientData = [
    {
      key: '1',
      patientId: 'P-234512',
      name: 'John Doe',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      gender: 'Male',
      phone: '+91 98765XXXXX',
      date: '28 June 2025',
      time: '09:00 Am',
      amount: 500,
      status: 'pending'
    },
    {
      key: '2',
      patientId: 'P-234513',
      name: 'Sarah Wilson',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b647?w=150&h=150&fit=crop&crop=face',
      gender: 'Female',
      phone: '+91 98765XXXXY',
      date: '25 June 2025',
      time: '10:00 Am',
      amount: 500,
      status: 'pending'
    },
    {
      key: '3',
      patientId: 'P-234514',
      name: 'Michael Chen',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      gender: 'Male',
      phone: '+91 98765XXXXZ',
      date: '20 June 2025',
      time: '11:30 Pm',
      amount: 500,
      status: 'pending'
    },
    {
      key: '4',
      patientId: 'P-234513',
      name: 'Sarah Wilson',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b647?w=150&h=150&fit=crop&crop=face',
      gender: 'Female',
      phone: '+91 98765XXXXY',
      date: '25 June 2025',
      time: '04:30 Pm',
      amount: 500,
      status: 'pending'
    }
  ];

  const columns = [
    {
      title: 'Patient ID',
      dataIndex: 'patientId',
      key: 'patientId',
      width: 120,
    },
    {
      title: 'Patient',
      key: 'patient',
      width: 200,
      render: (_, record) => (
        <div className="patient-info">
          <img 
            src={record.avatar} 
            alt={record.name}
            className="patient-avatar"
          />
          <span className="patient-name">{record.name}</span>
        </div>
      ),
    },
    {
      title: 'Gender',
      dataIndex: 'gender',
      key: 'gender',
      width: 100,
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      width: 150,
    },
    {
      title: 'Date & Time',
      key: 'dateTime',
      width: 150,
      render: (_, record) => (
        <div className="date-time-cell">
          <div className="date">{record.date}</div>
          <div className="time">{record.time}</div>
        </div>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      width: 100,
      render: (amount) => <span className="amount-cell">₹ {amount}</span>,
    },
    {
      title: 'Action',
      key: 'action',
      width: 200,
      render: () => (
        <div className="action-buttons">
          <Button className="accept-btn">Accept</Button>
          <Button className="reject-btn">Reject</Button>
          <Button className="edit-btn">Edit</Button>
        </div>
      ),
    },
  ];

  const tabItems = [
    {
      key: '1',
      label: 'Pending',
      children: (
        <>
          <Table 
            columns={columns} 
            dataSource={patientData}
            pagination={false}
            size="middle"
            showHeader={true}
          />
          <div className="pagination-container">
            <span className="pagination-info">Showing 1 to 4 of 97 results</span>
            <Pagination 
              current={1}
              total={97}
              pageSize={4}
              showSizeChanger={false}
              showQuickJumper={false}
              simple={false}
            />
          </div>
        </>
      ),
    },
    {
      key: '2',
      label: 'Processing',
      children: (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Text type="secondary">No processing patients</Text>
        </div>
      ),
    },
    {
      key: '3',
      label: 'completed',
      children: (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Text type="secondary">No completed patients</Text>
        </div>
      ),
    },
  ];

const showModal = () => {
    setIsModalVisible(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    // Clear error for the field being edited
    setErrors({ ...errors, [name]: '' });
  };

  const handleNumberChange = (name, value) => {
    setForm({ ...form, [name]: value });
    // Clear error for the field being edited
    setErrors({ ...errors, [name]: '' });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.medName.trim()) {
      newErrors.medName = 'Medicine name is required';
    }
    if (!form.quantity || form.quantity <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0';
    }
    if (!form.price || form.price < 0) {
      newErrors.price = 'Price must be non-negative';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleOk = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      let doctorId
      if(user.role = 'receptionist') {
        doctorId= user.createdBy
      }
       doctorId = user.userId; // Replace with actual doctor ID from auth context
      await apiPost('pharmacy/addMedInventory', {
        ...form,
        doctorId: doctorId // Replace with actual doctor ID from auth context
      });
      console.log(apiPost)
      setForm({ medName: '', quantity: '', price: '' });
      setErrors({});
      setIsModalVisible(false);
      Modal.success({
        title: 'Success',
        content: 'Medicine added to inventory successfully',
      });
    } catch (error) {
      console.error('Error adding medicine:', error);
      Modal.error({
        title: 'Error',
        content: 'Failed to add medicine to inventory',
      });
    }
  };

  const handleCancel = () => {
    setForm({ medName: '', quantity: '', price: '' });
    setErrors({});
    setIsModalVisible(false);
  };

  console.log("User Data:", user);
  return (
    <div>
     
      <Layout className="pharmacy-layout">
        <Header className="pharmacy-header">
          <div className="pharmacy-logo">
            <MedicineBoxOutlined />
            <span className="pharmacy-title">Pharmacy</span>
          </div>
          
          <Input
            placeholder="Search Patient by Mobile Number"
            prefix={<SearchOutlined />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pharmacy-search"
          />
        </Header>

        <Content style={{ padding: '24px' }}>
          {/* Revenue Cards */}
          <Row gutter={[24, 24]} style={{ marginBottom: '24px' }}>
            <Col xs={24} sm={12}>
              <Card className="revenue-card-today">
                <div className="revenue-icon">
                  <div className="revenue-icon-today">
                    <UserOutlined style={{ color: 'white', fontSize: '18px' }} />
                  </div>
                </div>
                <div>
                  <div className="revenue-title-today">Today Revenue</div>
                  <div className="revenue-value-today">₹ 1,200</div>
                  <div className="revenue-subtitle-today">Patient : 12</div>
                </div>
              </Card>
            </Col>
            
            <Col xs={24} sm={12}>
              <Card className="revenue-card-month">
                <div className="revenue-icon">
                  <div className="revenue-icon-month">
                    <UsergroupAddOutlined style={{ color: 'white', fontSize: '18px' }} />
                  </div>
                </div>
                <div>
                  <div className="revenue-title-month">This Month Revenue</div>
                  <div className="revenue-value-month">₹ 19,000</div>
                  <div className="revenue-subtitle-month">Patients : 120</div>
                </div>
              </Card>
            </Col>
          </Row>
{/* here add add inventory button, when i click on the button display popup to display to add inventory, medname, quantity, price */}
 {/* Add Inventory Button */}
          <div style={{ marginBottom: '24px', textAlign: 'right' }}>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={showModal}
            >
              Add Inventory
            </Button>
          </div>

           {/* Add Inventory Modal */}
          <Modal
            title="Add Medicine to Inventory"
            open={isModalVisible}
            onOk={handleOk}
            onCancel={handleCancel}
            okText="Add"
            cancelText="Cancel"
          >
            <div style={{ padding: '16px 0' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px' }}>Medicine Name</label>
                <Input
                  name="medName"
                  value={form.medName}
                  onChange={handleInputChange}
                  placeholder="Enter medicine name"
                />
                {errors.medName && (
                  <div style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>
                    {errors.medName}
                  </div>
                )}
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px' }}>Quantity</label>
                <InputNumber
                  name="quantity"
                  value={form.quantity}
                  onChange={(value) => handleNumberChange('quantity', value)}
                  min={1}
                  placeholder="Enter quantity"
                  style={{ width: '100%' }}
                />
                {errors.quantity && (
                  <div style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>
                    {errors.quantity}
                  </div>
                )}
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px' }}>Price (₹)</label>
                <InputNumber
                  name="price"
                  value={form.price}
                  onChange={(value) => handleNumberChange('price', value)}
                  min={0}
                  step={0.01}
                  placeholder="Enter price"
                  style={{ width: '100%' }}
                />
                {errors.price && (
                  <div style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>
                    {errors.price}
                  </div>
                )}
              </div>
            </div>
          </Modal>
          {/* Patient Management Table */}
          <Card className="main-card">
            <Tabs 
              activeKey={activeTab} 
              onChange={setActiveTab}
              items={tabItems}
            />
          </Card>

          {/* My Notes Section */}
          <div className="notes-section">
            <div className="notes-header">
              <div className="notes-title">
                <EditOutlined />
                <span>My Notes</span>
              </div>
              <Button className="add-note-btn">
                <PlusOutlined />
              </Button>
            </div>
          </div>
        </Content>
      </Layout>
    </div>
  );
}