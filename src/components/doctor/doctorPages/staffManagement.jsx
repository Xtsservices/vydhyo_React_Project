import React, { useEffect, useState } from "react";
import {
  Grid,
  Row,
  Col,
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
  Avatar,
  Radio,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  UserAddOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs";
import "../../../components/stylings/StaffManagement.css";
import { apiGet, apiPost, apiPut } from "../../api";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const { Option } = Select;
const { useBreakpoint } = Grid;

// Staff Modal Component (handles both Add and Edit)
const StaffModal = ({
  isOpen,
  onCancel,
  onSubmit,
  loading,
  modalMode,
  initialData,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (modalMode === "edit" && initialData) {
      form.setFieldsValue({
        firstName: initialData.name?.split(" ")[0] || "",
        lastName: initialData.name?.split(" ")[1] || "",
        DOB: initialData.DOB ? dayjs(initialData.DOB, "DD-MM-YYYY") : null,
        gender: initialData.gender,
        mobile: initialData.phone,
        email: initialData.email,
        role: initialData.type,
        access: initialData.access || [],
      });
    } else {
      form.resetFields();
    }
  }, [modalMode, initialData, form]);

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
      await onSubmit(staffData, modalMode);
      form.resetFields();
    } catch (error) {
      console.error("Validation failed:", error);
      notification.error({
        message: "Validation Error",
        description: "Please check all required fields.",
        duration: 3,
      });
    }
  };

  const accessOptions = [
    { value: "my-patients", label: "My Patients" },
    { value: "appointments", label: "Appointments" },
    { value: "labs", label: "Labs" },
    { value: "dashboard", label: "Dashboard" },
    { value: "pharmacy", label: "Pharmacy" },
    { value: "availability", label: "Availability" },
    { value: "accounts", label: "Accounts" },
    { value: "staff-management", label: "Staff Management" },
    { value: "clinic-management", label: "Clinic Management" },
    { value: "e_prescription", label: "E-Prescription" },
    { value: "billing", label: "Billing" },
    { value: "reviews", label: "Reviews" },
  ];

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
            {modalMode === "edit"
              ? "Edit Staff Member"
              : "Add New Staff Member"}
          </h2>
          <p style={{ margin: 0, color: "#888" }}>
            {modalMode === "edit"
              ? "Update the details below to modify staff member information"
              : "Fill in the details below to add a new staff member to your organization"}
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
                  <Option value="lab-Assistant">Lab Assistant</Option>
                  <Option value="pharmacy-Assistant">Pharmacy Assistant</Option>
                  <Option value="receptionist">Receptionist</Option>
                  <Option value="assistent">Assistant</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Access"
                name="access"
                rules={[
                  {
                    required: true,
                    message: "Please select access permissions",
                  },
                ]}
              >
                <Select
                  mode="multiple"
                  placeholder="Select access permissions"
                  allowClear
                  options={accessOptions}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row justify="end" gutter={16}>
            <Col>
              <Button onClick={onCancel}>Cancel</Button>
            </Col>
            <Col>
              <Button type="primary" onClick={handleOk}>
                {modalMode === "edit" ? "Update Staff" : "Add Staff"}
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
  const [originalStaffData, setOriginalStaffData] = useState([]); // Store original data for filtering
  const [fetchLoading, setFetchLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterRole, setFilterRole] = useState("all");
  const [modalMode, setModalMode] = useState("add"); // 'add', 'edit', 'view', 'delete'
  const [modalData, setModalData] = useState(null);
  const user = useSelector((state) => state.currentUserData);

  const handleStaffTypeChange = (value) => {
    setSelectedStaffType(value);
  };

  const handleQuickAdd = () => {
    setModalMode("add");
    setModalData(null);
    setIsModalOpen(true);
  };

  const handleModalCancel = () => {
    setIsModalOpen(false);
    setModalData(null);
  };

  const handleStaffOperation = async (staffData, mode) => {
   
    try {
      setLoading(true);

      if (mode === "add") {
  try {
    const userid = user.createdBy;
    console.log("Staff Data:", staffData, "Mode:", mode);

    const response = await apiPost(`/doctor/createReceptionist/${userid}`, {
      ...staffData,
    });

    console.log("API Response:", response);

    if (response.status !== 200) {
      throw new Error(response?.data?.message || "Failed to add staff");
    }else if (response.status === 200) {
      setIsModalOpen(false);
    }


    notification.success({
      message:
        `${selectedStaffType.charAt(0).toUpperCase() + selectedStaffType.slice(1)} Added Successfully`,
      description:
        `${selectedStaffType.charAt(0).toUpperCase() + selectedStaffType.slice(1)} has been added to the staff list.`,
      duration: 3,
    });

    toast.success(
      response.data?.message ||
        response?.message ||
        "Staff added successfully"
    );
  } catch (error) {
    console.log("Error while adding staff:", error?.response?.data?.message.message);
     // keep modal open if failed
    toast.error(
      error?.response?.data?.message.message ||
        "Something went wrong while adding staff"
    );
    setIsModalOpen(true);
  }
} else if (mode === "edit") {
        const body = {
          ...staffData,
          stafftype: staffData.role,
          userId: modalData.userId,
        };

        const resposne = await apiPut("/doctor/editReceptionist", body);

        notification.success({
          message: "Staff Updated Successfully",
          description: "Staff member details have been updated.",
          duration: 3,
        });
        toast.success(
          resposne.data?.message ||
            response?.message ||
            "Staff updated successfully"
        );
      }

      
      fetchStaff();
    } catch (error) {
      console.error(
        `Error ${mode === "add" ? "adding" : "updating"} staff:`,
        error
      );
      let errorMessage = `An unexpected error occurred while ${
        mode === "add" ? "adding" : "updating"
      } staff`;

      if (error.response) {
        errorMessage =
          error.response.data?.message?.message ||
          error.response.data?.message ||
          error.response?.message ||
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
        message: `Error ${mode === "add" ? "Adding" : "Updating"} Staff`,
        description: errorMessage,
        duration: 5,
      });
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      // setIsModalOpen(false);
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
          <div>
            <span style={{ fontWeight: 600 }}>{record.name || "N/A"}</span>
            <br />
            <span style={{ color: "#595959", fontSize: 12 }}>
              {record.email || "No email"}
            </span>
          </div>
        </div>
      ),
    },
    {
      title: "Role",
      dataIndex: "type",
      key: "role",
    },
    {
      title: "Login Status",
      dataIndex: "isLoggedIn",
      key: "loginStatus",
    },
    {
      title: "Last Login",
      dataIndex: "lastLogout",
      key: "lastLogin",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <div className="action-icons">
          <EyeOutlined
            className="icon-view"
            onClick={() => handleView(record)}
          />
          <EditOutlined
            className="icon-edit"
            onClick={() => handleEdit(record)}
          />
          <DeleteOutlined
            className="icon-delete"
            onClick={() => handleDelete(record)}
          />
        </div>
      ),
    },
  ];

  const handleView = (record) => {
    setModalMode("view");
    setModalData(record);
    setIsModalOpen(true);
  };

  const handleEdit = (record) => {
    setModalMode("edit");
    setModalData(record);
    setIsModalOpen(true);
  };

  const handleDelete = (record) => {
    setModalMode("delete");
    setModalData(record);
    setIsModalOpen(true);
  };

  const fetchStaff = async () => {
    try {
      setFetchLoading(true);
      const userid = user.createdBy;
      console.log("user", user);
      const response = await apiGet(`/doctor/getStaffByCreator/${userid}`);

      const filterData = response.data.data.filter(
        (each) => each.userId !== user.createdBy
      );
      console.log("filterData", filterData);
      const formattedData = filterData.map((staff, index) => ({
        name: staff.name,
        userId: staff.userId,
        type: staff.stafftype,
        email: staff.email,
        phone: staff.mobile,
        joinDate: dayjs(staff.joinDate).format("YYYY-MM-DD"),
        status: staff.status.charAt(0).toUpperCase() + staff.status.slice(1),
        lastLogout:
          staff.lastLogout && staff.lastLogout !== "N/A"
            ? dayjs(staff.lastLogout).isValid()
              ? dayjs(staff.lastLogout).format("YYYY-MM-DD HH:mm:ss")
              : staff.lastLogout
            : "-",
        lastLogin:
          staff.lastLogin && staff.lastLogin !== "N/A"
            ? dayjs(staff.lastLogin).isValid()
              ? dayjs(staff.lastLogin).format("YYYY-MM-DD HH:mm:ss")
              : staff.lastLogin
            : "-",
        isLoggedIn: staff.isLoggedIn ? "Online" : "Offline",
        gender: staff.gender,
        DOB: staff.DOB,
        access: staff.access || [],
      }));

      setStaffData(formattedData);
      setOriginalStaffData(formattedData); // Store original data for filtering
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

  const confirmDelete = async (userId) => {
    try {
      const res = await apiGet(`/users/deleteMyAccount?userId=${userId}`);
      message.success("Deleted successfully");
      toast.success("Deleted successfully");
      setIsModalOpen(false);
      fetchStaff();
    } catch (err) {
      message.error("Delete failed");
      toast.error("Delete failed");
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchText(value);
    let filtered = [...originalStaffData];

    if (value) {
      filtered = filtered.filter((staff) =>
        staff.name.toLowerCase().includes(value)
      );
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter((staff) =>
        filterStatus === "paid"
          ? staff.status === "Active"
          : staff.status === "InActive"
      );
    }

    if (filterRole !== "all") {
      filtered = filtered.filter((staff) => staff.type === filterRole);
    }

    setStaffData(filtered);
  };

  const handleFilterStatus = (value) => {
    setFilterStatus(value);
    let filtered = [...originalStaffData];

    if (searchText) {
      filtered = filtered.filter((staff) =>
        staff.name.toLowerCase().includes(searchText)
      );
    }

    if (value !== "all") {
      filtered = filtered.filter((staff) =>
        value === "paid"
          ? staff.status === "Active"
          : staff.status === "InActive"
      );
    }

    if (filterRole !== "all") {
      filtered = filtered.filter((staff) => staff.type === filterRole);
    }

    setStaffData(filtered);
  };

  const handleFilterRole = (value) => {
    setFilterRole(value);
    let filtered = [...originalStaffData];

    if (searchText) {
      filtered = filtered.filter((staff) =>
        staff.name.toLowerCase().includes(searchText)
      );
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter((staff) =>
        filterStatus === "paid"
          ? staff.status === "Active"
          : staff.status === "InActive"
      );
    }

    if (value !== "all") {
      filtered = filtered.filter((staff) => staff.type === value);
    }

    setStaffData(filtered);
  };

  useEffect(() => {
    if (user) {
      fetchStaff();
    }
  }, [user]);

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
        <div className="filters-container" style={{ width: "100%" }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Input
                placeholder="Search staff members..."
                prefix={<SearchOutlined />}
                onChange={handleSearch}
                className="filters-input"
                value={searchText}
              />
            </Col>
            <Col>
              <div className="selects-group">
                <Select
                  className="filters-select"
                  defaultValue="all"
                  onChange={handleFilterStatus}
                  value={filterStatus}
                >
                  <Option value="all">All Status</Option>
                  <Option value="paid">Active</Option>
                  <Option value="pending">InActive</Option>
                </Select>
                <Select
                  className="filters-select"
                  defaultValue="all"
                  onChange={handleFilterRole}
                  value={filterRole}
                >
                  <Option value="all">All Roles</Option>
                  <Option value="lab-Assistant">Lab Assistant</Option>
                  <Option value="pharmacy-Assistant">Pharmacy Assistant</Option>
                  <Option value="receptionist">Receptionist</Option>
                  <Option value="assistent">Assistant</Option>
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

      <StaffModal
        isOpen={isModalOpen && (modalMode === "add" || modalMode === "edit")}
        onCancel={handleModalCancel}
        onSubmit={handleStaffOperation}
        loading={loading}
        modalMode={modalMode}
        initialData={modalData}
      />

      <Modal
        title="View Staff Details"
        open={modalMode === "view" && isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsModalOpen(false)}>
            Close
          </Button>,
        ]}
      >
        {modalMode === "view" && (
          <>
            <p>
              <strong>Name:</strong> {modalData?.name}
            </p>
            <p>
              <strong>Email:</strong> {modalData?.email}
            </p>
            <p>
              <strong>Phone:</strong> {modalData?.phone}
            </p>
            <p>
              <strong>Role:</strong> {modalData?.type}
            </p>
            <p>
              <strong>Status:</strong> {modalData?.status}
            </p>
            <p>
              <strong>DOB:</strong> {modalData?.DOB}
            </p>
            <p>
              <strong>Gender:</strong> {modalData?.gender}
            </p>
            <p>
              <strong>Access:</strong> {modalData?.access?.join(", ") || "None"}
            </p>
          </>
        )}
      </Modal>

      <Modal
        title="Confirm Delete"
        open={modalMode === "delete" && isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => confirmDelete(modalData?.userId)}
        okText="Delete"
        okButtonProps={{ danger: true }}
      >
        {modalMode === "delete" && (
          <>
            <p>Are you sure you want to delete this staff member?</p>
            <p>
              <strong>Name:</strong> {modalData?.name}
            </p>
            <p>
              <strong>Email:</strong> {modalData?.email}
            </p>
          </>
        )}
      </Modal>
    </div>
  );
};

export default StaffManagement;
