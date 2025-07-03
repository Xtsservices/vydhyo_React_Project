import React, { useEffect, useState } from "react";
import {
  Grid,
  Row,
  Col,
  Card,
  Table,
  Button,
  Space,
  Select,
  notification,
  Modal,
  Form,
  Input,
  DatePicker,
  Spin,
  message,
  Typography,
  Menu,
  Dropdown,
  Statistic,
  Avatar,
  Tag,
  Radio,
} from "antd";
import {
  PlusOutlined,
  UserOutlined,
  TeamOutlined,
  EditOutlined,
  EyeOutlined,
  DeleteOutlined,
  MoreOutlined,
  SearchOutlined,
   UserAddOutlined 
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs";
import '../../../components/stylings/StaffManagement.css';


const { Option } = Select;
const { TextArea } = Input;
const { useBreakpoint } = Grid;

// Add Staff Modal Component
const AddStaffModal = ({ isOpen, onCancel, onSubmit, loading }) => {
  const [form] = Form.useForm();

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const staffData = {
        firstname: values.firstName,
        lastname: values.lastName,
        DOB: dayjs(values.DOB).format("DD-MM-YYYY"),
        gender: values.gender,
        mobile: values.mobile,
        email: values.email,
        role: values.role,
        access: values.access,

      };
      await onSubmit(staffData);
      form.resetFields();
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  return (
    <Modal
      open={isOpen}
      onCancel={() => {
        onCancel();
        form.resetFields();
      }}
      footer={null}
      width={700}
      centered
      title={
        <div>
          <h2 style={{ marginBottom: 0 }}>
            <UserAddOutlined style={{ marginRight: 8 }} />
            Add New Staff Member
          </h2>
          <p style={{ margin: 0, color: "#888" }}>
            Fill in the details below to add a new staff member to your organization
          </p>
        </div>
      }
    >
      <Spin spinning={loading}>
        <Form
          form={form}
          layout="vertical"
          style={{ maxHeight: "60vh", overflowY: "auto", paddingRight: "10px" }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="First Name"
                name="firstName"
                rules={[{ required: true, message: "Please enter first name" }]}
              >
                <Input placeholder="Enter first name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Last Name"
                name="lastName"
                rules={[{ required: true, message: "Please enter last name" }]}
              >
                <Input placeholder="Enter last name" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Date of Birth"
                name="DOB"
                rules={[{ required: true, message: "Please select DOB" }]}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  format="DD-MM-YYYY"
                  placeholder="Select DOB"
                  disabledDate={(current) =>
                    current && current > dayjs().endOf("day")
                  }
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Gender"
                name="gender"
                rules={[{ required: true, message: "Please select gender" }]}
              >
                <Radio.Group>
                  <Radio value="Male">Male</Radio>
                  <Radio value="Female">Female</Radio>
                  <Radio value="Other">Other</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Mobile Number"
                name="mobile"
                rules={[
                  { required: true, message: "Please enter mobile number" },
                  {
                    pattern: /^[6-9]\d{9}$/,
                    message: "Enter valid 10-digit mobile number",
                  },
                ]}
              >
                <Input placeholder="Enter mobile number" maxLength={10} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Email ID"
                name="email"
                rules={[
                  { required: true, message: "Please enter email" },
                  { type: "email", message: "Invalid email format" },
                ]}
              >
                <Input placeholder="Enter email address" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Role"
                name="role"
                rules={[{ required: true, message: "Please select role" }]}
              >
                <Select placeholder="Select role">
                  <Option value="admin">Lab Assistant</Option>
                  <Option value="doctor">pharmacy Assistant</Option>
                  <Option value="receptionist">Receptionist</Option>
                  <Option value="receptionist">Assistent</Option>

                </Select>
              </Form.Item>
            </Col>
<Col span={12}>
  <Form.Item
    label="Access"
    name="access"
    rules={[{ required: true, message: "Please select access permissions" }]}
  >
    <Select
      mode="multiple"
      placeholder="Select access permissions"
      allowClear
    >
      <Option value="viewPatients">My Patients</Option>
      <Option value="editAppointments"> Appointments</Option>
      <Option value="manageBilling">Labs</Option>
      <Option value="dashboardAccess">Dashboard</Option>
      <Option value="dashboardAccess">Pharmacy</Option>
      <Option value="dashboardAccess">Availability</Option>
      <Option value="dashboardAccess">Accounts</Option>
    </Select>
  </Form.Item>
</Col>
          </Row>

          <Row justify="end" gutter={16}>
            <Col>
              <Button onClick={onCancel}>Cancel</Button>
            </Col>
            <Col>
              <Button type="primary" onClick={handleOk}>
                Add Staff
              </Button>
            </Col>
          </Row>
        </Form>
      </Spin>
    </Modal>
  );
};





const StaffManagement = () => {
  const screens = useBreakpoint();
  const navigate = useNavigate();
  const [selectedStaffType, setSelectedStaffType] = useState("receptionist");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [staffData, setStaffData] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [SearchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterRole, setFilterRole] = useState("all");
  const [modalMode, setModalMode] = useState("view"); // or 'edit', 'delete'
const [modalVisible, setModalVisible] = useState(false);
const [modalData, setModalData] = useState(null);

  const handleStaffTypeChange = (value) => {
    setSelectedStaffType(value);
  };

  const handleQuickAdd = () => {
    setIsModalOpen(true);
  };

  const handleModalCancel = () => {
    setIsModalOpen(false);
  };

  const handleAddStaff = async (staffData) => {
    try {
      setLoading(true);
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("accessToken")
          : "";

      if (selectedStaffType === "receptionist") {
        console.log("Sending receptionist data as object:", staffData);

        const response = await axios.post(
          "http://192.168.0.100:3000/doctor/createReceptionist",
          staffData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        console.log("Receptionist created:", response.data);
        notification.success({
          message: "Receptionist Added Successfully",
          description: "Receptionist has been added to the staff list.",
          duration: 3,
        });
      } else {
        console.log("Other staff type data as object:", staffData);
        notification.success({
          message: `${
            selectedStaffType.charAt(0).toUpperCase() +
            selectedStaffType.slice(1)
          } Added Successfully`,
          description: `${
            selectedStaffType.charAt(0).toUpperCase() +
            selectedStaffType.slice(1)
          } has been added to the staff list.`,
          duration: 3,
        });
      }

      setIsModalOpen(false);
    } catch (error) {
      console.error("Error creating staff:", error);

      let errorMessage = "An unexpected error occurred";

      if (error.response) {
        errorMessage =
          error.response.data?.message ||
          `Server error: ${error.response.status}`;
        if (error.response.status === 401) {
          errorMessage = "Authentication failed. Please login again.";
        } else if (error.response.status === 400) {
          errorMessage = "Invalid data provided. Please check all fields.";
        }
      } else if (error.request) {
        errorMessage = "Network error. Please check your internet connection.";
      }

      notification.error({
        message: "Error Adding Staff",
        description: errorMessage,
        duration: 5,
      });
    } finally {
      setLoading(false);
    }
  };


  

  const columns = [
    {
      title: "Staff Name",
      dataIndex: "name",
      key: "name",
      render: (_, record) => (
  <div style={{ display: "flex", alignItems: "center" }}>
    <Avatar style={{ marginRight: 8 }}>
      {record.name ? record.name.charAt(0) : "?"}
    </Avatar>
    {record.name || "N/A"}
     <span style={{ color: "#595959", marginLeft: 32 }}>
        {record.email || "No email"}
      </span>
  </div>
)
    },
    {
      title: "Role",
      dataIndex: "type",
      key: "role",
      // render: (type) => <Tag color="blue">{type}</Tag>,
    },
    {
      title: "Login Status",
      dataIndex: "isLoggedIn",
      key: "Login Status",
    },
    {
      title: "Last Login",
      dataIndex: "lastLogout",
      key: "Last Login",
    },
    
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
             <div className="action-icons">
        <EyeOutlined className="icon-view" onClick={() => handleView(record)} />
        <EditOutlined className="icon-edit" onClick={() => handleEdit(record)} />
        <DeleteOutlined className="icon-delete" onClick={() => handleDelete(record)} />
      </div>

      ),
    },
  ];

  const handleView = (record) => {
    console.log("View record:", record);
  setModalMode("view");
  setModalData(record);
  setModalVisible(true);
};

const handleEdit = (record) => {
  setModalMode("edit");
  setModalData(record);
  setModalVisible(true);
};

const handleDelete = (record) => {
  setModalMode("delete");
  setModalData(record);
  setModalVisible(true);
};


  const fetchStaff = async () => {
    try {
      setFetchLoading(true);
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(
        "http://192.168.0.100:3000/doctor/getStaffByCreator",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            userid: localStorage.getItem("userId"),
          },
        }
      );

      console.log("Staff data fetched:", response.data.data);

      const formattedData = response.data.data.map((staff, index) => ({
        id: index + 1,
        name: staff.name,
        type: staff.stafftype,
        email: staff.email,
        phone: staff.mobile,
        joinDate: dayjs(staff.joinDate).format("YYYY-MM-DD"),
        status: staff.status.charAt(0).toUpperCase() + staff.status.slice(1),
 lastLogout: staff.lastLogout
    ? dayjs(staff.lastLogout).format("YYYY-MM-DD HH:mm:ss")
    : "N/A",
  isLoggedIn: staff.isLoggedIn ? "Online" : "Offline",
      }));
      setStaffData(formattedData);
    } catch (error) {
      console.error("Error fetching staff:", error);
      let errorMessage = "Failed to fetch staff data";
      if (error.response) {
        errorMessage =
          error.response.data?.message || error.message || errorMessage;
      }
      notification.error({
        message: "Error Fetching Staff",
        description: errorMessage,
        duration: 5,
      });
    } finally {
      setFetchLoading(false);
    }
};

  const handleUpdate = async (data) => {
  try {
    await axios.put(`/api/updateStaff`, data);
    message.success("Updated successfully");
    setModalVisible(false);
    fetchStaffData();
  } catch (err) {
    message.error("Update failed");
  }
};

const confirmDelete = async (userId) => {
  try {
    await axios.get(`/deleteMyAccount?userId=${userId}`);
    message.success("Deleted successfully");
    setModalVisible(false);
    fetchStaffData();
  } catch (err) {
    message.error("Delete failed");
  }
};

  const handleSearch = (e) => {
  const value = e.target.value.toLowerCase();
  setSearchText(value);

  const filtered = staffData.filter((staff) =>
    staff.name.toLowerCase().includes(value)
  );
  setStaffData(filtered);
};
  useEffect(() => {
    fetchStaff();
    handleUpdate();
    confirmDelete();
  }, []);



  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Typography.Title level={4} style={{ margin: 0 }}>
            Staff Management
          </Typography.Title>
        </Col>
        <Col>
          <Space>
            
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleQuickAdd}
              loading={loading}
            >
              Add Staff
            </Button>
          </Space>
        </Col>
      </Row>
      
      <Row gutter={[16, 16]}>
              <div className="filters-container">
  <Row justify="space-between" align="middle">
    <Col>
      <Input
        placeholder="Search staff members..."
        prefix={<SearchOutlined />}
        onChange={handleSearch}
        className="filters-input"
      />
    </Col>
    <Col>
      <div className="selects-group">
        <Select className="filters-select" defaultValue="all" onChange={setFilterStatus}>
          <Option value="all">All Status</Option>
          <Option value="paid">Active</Option>
          <Option value="pending">InActive</Option>
        </Select>
        <Select className="filters-select" defaultValue="all" onChange={setFilterStatus}>
          <Option value="all">All Roles</Option>
          <Option value="paid">Lab Assistent</Option>
          <Option value="pending">Pharmacy Assistent</Option>
          <Option value="refunded">Receptionist</Option>
          <Option value="refunded">Assistent</Option>
        </Select>
      </div>
    </Col>
  </Row>
</div>
        <Col span={24}>
          
            <Table
              dataSource={staffData}
              columns={columns}
              rowKey="id"
               pagination={{
    pageSize: 5,
    showPrevNextJumpers: true,
    showSizeChanger: false,
    showQuickJumper: false,
    itemRender: (_, type, originalElement) => {
      if (type === "prev") return <a>Previous</a>;
      if (type === "next") return <a>Next</a>;
      
      return null;
    },
  }}
              loading={fetchLoading}
              bordered
            />
          
        </Col>
      </Row>

      <AddStaffModal
        isOpen={isModalOpen}
        onCancel={handleModalCancel}
        onSubmit={handleAddStaff}
        staffType={selectedStaffType}
        loading={loading}
      />
      <Modal
  title={
    modalMode === "view"
      ? "View Staff Details"
      : modalMode === "edit"
      ? "Edit Staff"
      : "Confirm Delete"
  }
  open={modalVisible}
  onCancel={() => setModalVisible(false)}
  onOk={() => {
    if (modalMode === "edit") {
      handleUpdate(modalData); // send updated data
    } else if (modalMode === "delete") {
      confirmDelete(modalData.userId);
    } else {
      setModalVisible(false);
    }
  }}
  okText={modalMode === "delete" ? "Delete" : modalMode === "edit" ? "Save" : "OK"}
  okButtonProps={
    modalMode === "delete" ? { danger: true } : modalMode === "view" ? { style: { display: "none" } } : {}
  }
>
  {modalMode === "view" && (
    <>
      <p><strong>Name:</strong> {modalData?.name}</p>
      <p><strong>Email:</strong> {modalData?.email}</p>
      <p><strong>Phone:</strong> {modalData?.phone}</p>
      <p><strong>Role:</strong> {modalData?.type}</p>
      <p><strong>Status:</strong> {modalData?.status}</p>
    </>
  )}

  {modalMode === "edit" && (
    <Form layout="vertical">
      <Form.Item label="Name">
        <Input
          value={modalData?.name}
          onChange={(e) => setModalData({ ...modalData, name: e.target.value })}
        />
      </Form.Item>
      <Form.Item label="Email">
        <Input
          value={modalData?.email}
          onChange={(e) => setModalData({ ...modalData, email: e.target.value })}
        />
      </Form.Item>
      <Form.Item label="Phone">
        <Input
          value={modalData?.phone}
          onChange={(e) => setModalData({ ...modalData, phone: e.target.value })}
        />
      </Form.Item>
    </Form>
  )}

  {modalMode === "delete" && (
    <>
      <p>Are you sure you want to delete this staff member?</p>
      <p><strong>Name:</strong> {modalData?.name}</p>
      <p><strong>Email:</strong> {modalData?.email}</p>
    </>
  )}
</Modal>
    </div>
  );
};

export default StaffManagement;
