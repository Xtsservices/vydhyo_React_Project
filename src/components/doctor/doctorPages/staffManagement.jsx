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
} from "antd";
import {
  PlusOutlined,
  UserOutlined,
  TeamOutlined,
  EditOutlined,
  EyeOutlined,
  DeleteOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs";

const { Option } = Select;
const { TextArea } = Input;
const { useBreakpoint } = Grid;

// Add Staff Modal Component
const AddStaffModal = ({ isOpen, onCancel, onSubmit, staffType, loading }) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      const staffData = {};

      if (staffType === "receptionist") {
        Object.assign(staffData, {
          firstname: values.firstname,
          lastname: values.lastname,
          gender: values.gender,
          DOB: dayjs(values.DOB).format("DD-MM-YYYY"),
          mobile: values.mobile,
        });
      } else {
        Object.keys(values).forEach((key) => {
          if (key === "DOB") {
            staffData[key] = dayjs(values[key]).format("DD-MM-YYYY");
          } else {
            staffData[key] = values[key];
          }
        });
        staffData.staffType = staffType;
      }

      await onSubmit(staffData);
      form.resetFields();
      setFileList([]);
    } catch (error) {
      console.error("Form validation failed:", error);
    }
  };

  const validateMobile = (_, value) => {
    if (!value) {
      return Promise.reject("Please enter mobile number");
    }
    const cleanedValue = value.replace(/\D/g, "");

    if (cleanedValue.length !== 10) {
      return Promise.reject("Mobile number must be exactly 10 digits");
    }
    if (!/^[6-9]\d{9}$/.test(cleanedValue)) {
      return Promise.reject("Mobile number must start with 6, 7, 8, or 9");
    }
    return Promise.resolve();
  };

  const validateName = (_, value) => {
    if (!value) {
      return Promise.reject("This field is required");
    }
    if (value.length < 2) {
      return Promise.reject("Name must be at least 2 characters");
    }
    if (value.length > 50) {
      return Promise.reject("Name cannot exceed 50 characters");
    }
    if (!/^[A-Za-z\s]+$/.test(value)) {
      return Promise.reject("Name should contain only letters and spaces");
    }
    return Promise.resolve();
  };

  const renderFormFields = () => {
    if (staffType === "receptionist") {
      return (
        <>
          <Form.Item
            name="firstname"
            label="First Name"
            rules={[{ validator: validateName }]}
          >
            <Input placeholder="Enter first name" />
          </Form.Item>

          <Form.Item
            name="lastname"
            label="Last Name"
            rules={[{ validator: validateName }]}
          >
            <Input placeholder="Enter last name" />
          </Form.Item>

          <Form.Item
            name="gender"
            label="Gender"
            rules={[{ required: true, message: "Please select gender" }]}
          >
            <Select placeholder="Select gender">
              <Option value="Male">Male</Option>
              <Option value="Female">Female</Option>
              <Option value="Other">Other</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="DOB"
            label="Date of Birth"
            rules={[{ required: true, message: "Please select date of birth" }]}
          >
            <DatePicker
              style={{ width: "100%" }}
              format="DD-MM-YYYY"
              placeholder="Select date of birth"
              disabledDate={(current) =>
                current && current > dayjs().endOf("day")
              }
              showToday={true}
            />
          </Form.Item>

          <Form.Item
            name="mobile"
            label="Mobile Number"
            rules={[{ validator: validateMobile }]}
          >
            <Input
              placeholder="Enter 10-digit mobile number"
              maxLength={10}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                e.target.value = value;
              }}
            />
          </Form.Item>
        </>
      );
    }

    return (
      <>
        <Form.Item
          name="firstname"
          label="First Name"
          rules={[{ validator: validateName }]}
        >
          <Input placeholder="Enter first name" />
        </Form.Item>

        <Form.Item
          name="lastname"
          label="Last Name"
          rules={[{ validator: validateName }]}
        >
          <Input placeholder="Enter last name" />
        </Form.Item>

        <Form.Item
          name="mobile"
          label="Mobile Number"
          rules={[{ validator: validateMobile }]}
        >
          <Input
            placeholder="Enter 10-digit mobile number"
            maxLength={10}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "");
              e.target.value = value;
            }}
          />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: "Please enter email" },
            { type: "email", message: "Please enter a valid email" },
          ]}
        >
          <Input placeholder="Enter email address" />
        </Form.Item>

        <Form.Item
          name="DOB"
          label="Date of Birth"
          rules={[{ required: true, message: "Please select date of birth" }]}
        >
          <DatePicker
            style={{ width: "100%" }}
            format="DD-MM-YYYY"
            placeholder="Select date of birth"
            disabledDate={(current) =>
              current && current > dayjs().endOf("day")
            }
            showToday={true}
          />
        </Form.Item>
      </>
    );
  };

  return (
    <Modal
      title={`Add New ${
        staffType.charAt(0).toUpperCase() + staffType.slice(1)
      }`}
      open={isOpen}
      onCancel={() => {
        onCancel();
        form.resetFields();
        setFileList([]);
      }}
      onOk={handleOk}
      confirmLoading={loading}
      width={600}
      centered
      okText={`Add ${staffType.charAt(0).toUpperCase() + staffType.slice(1)}`}
      cancelText="Cancel"
    >
      <Spin spinning={loading}>
        <Form
          form={form}
          layout="vertical"
          style={{ maxHeight: "60vh", overflowY: "auto", paddingRight: "10px" }}
        >
          {renderFormFields()}
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
          "http://192.168.1.42:3000/doctor/createReceptionist",
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
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (name) => (
        <div style={{ display: "flex", alignItems: "center" }}>
          <Avatar style={{ marginRight: 8 }}>{name.charAt(0)}</Avatar>
          {name}
        </div>
      ),
    },
    {
      title: "Staff Type",
      dataIndex: "type",
      key: "type",
      render: (type) => <Tag color="blue">{type}</Tag>,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Join Date",
      dataIndex: "joinDate",
      key: "joinDate",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "Active" ? "green" : "red"}>{status}</Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => {
        const actionMenu = (
          <Menu
            items={[
              {
                key: "edit",
                label: (
                  <>
                    <EditOutlined /> Edit
                  </>
                ),
                onClick: () =>
                  console.log(`Edit staff: ${record.id} - ${record.name}`),
              },
              {
                key: "view",
                label: (
                  <>
                    <EyeOutlined /> View
                  </>
                ),
                onClick: () =>
                  console.log(`View staff: ${record.id} - ${record.name}`),
              },
              {
                key: "delete",
                label: (
                  <>
                    <DeleteOutlined /> Delete
                  </>
                ),
                onClick: () =>
                  console.log(`Delete staff: ${record.id} - ${record.name}`),
              },
            ]}
          />
        );
        return (
          <Dropdown overlay={actionMenu} trigger={["click"]}>
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
        );
      },
    },
  ];

  const fetchStaff = async () => {
    try {
      setFetchLoading(true);
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(
        "http://192.168.1.42:3000/doctor/getStaffByCreator",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            userid: localStorage.getItem("userId"),
          },
        }
      );

      const formattedData = response.data.data.map((staff, index) => ({
        id: index + 1,
        name: staff.name,
        type: staff.stafftype,
        email: staff.email,
        phone: staff.mobile,
        joinDate: dayjs(staff.joinDate).format("YYYY-MM-DD"),
        status: staff.status.charAt(0).toUpperCase() + staff.status.slice(1),
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

  useEffect(() => {
    fetchStaff();
  }, []);

  return (
    <div
      style={{
        padding: screens.xs ? "16px" : "24px",
        background: "#f0f2f5",
        minHeight: "calc(100vh - 64px)",
      }}
    >
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Typography.Title level={4} style={{ margin: 0 }}>
            Staff Management
          </Typography.Title>
        </Col>
        <Col>
          <Space>
            <Select
              value={selectedStaffType}
              onChange={handleStaffTypeChange}
              style={{ width: screens.xs ? 120 : 150 }}
              placeholder="Select staff type"
            >
              <Option value="receptionist">Receptionist</Option>
            </Select>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleQuickAdd}
              loading={loading}
            >
              Quick Add
            </Button>
          </Space>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="Total Staff"
              value={staffData.length}
              prefix={<TeamOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="Receptionists"
              value={
                staffData.filter((staff) => staff.type === "receptionist")
                  .length
              }
              prefix={<UserOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="Doctor"
              value={
                staffData.filter((staff) => staff.type === "doctor").length
              }
              prefix={<UserOutlined />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card
            title="Current Staff Members"
            extra={
              <Space>
                <Button type="link">Export List</Button>
                <Button type="link">Import Staff</Button>
              </Space>
            }
          >
            <Table
              dataSource={staffData}
              columns={columns}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} items`,
              }}
              loading={fetchLoading}
            />
          </Card>
        </Col>
      </Row>

      <AddStaffModal
        isOpen={isModalOpen}
        onCancel={handleModalCancel}
        onSubmit={handleAddStaff}
        staffType={selectedStaffType}
        loading={loading}
      />
    </div>
  );
};

export default StaffManagement;
