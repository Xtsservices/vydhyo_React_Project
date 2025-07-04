import React, { useEffect, useState } from "react";
import {
  Layout,
  Card,
  Tabs,
  Input,
  Button,
  Row,
  Col,
  Typography,
  Modal,
  InputNumber,
} from "antd";
import {
  SearchOutlined,
  UserOutlined,
  UsergroupAddOutlined,
  EditOutlined,
  PlusOutlined,
  MedicineBoxOutlined,
} from "@ant-design/icons";

const { Header, Content } = Layout;
const { Title, Text } = Typography;

// Import the tab components
import PatientsTab from "./PharmacyPatientsTab";
import MedicinesTab from "./PharmacyMedicinesTab";
import CompletedTab from "./PharmacyCompletedTab";

import "../../stylings/pharmacy.css"; // Import the CSS file for styling
import { apiGet, apiPost } from "../../api";
import { useSelector } from "react-redux";

export default function Pharmacy() {
  const user = useSelector((state) => state.currentUserData);
  const doctorId = user?.role === "doctor" ? user?.userId : user?.createdBy;

  const [activeTab, setActiveTab] = useState("1");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [cardsData, setCardsData] = useState();
  const [form, setForm] = useState({
    medName: "",
    quantity: "",
    price: "",
  });
  const [errors, setErrors] = useState({});

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    // Clear error for the field being edited
    setErrors({ ...errors, [name]: "" });
  };

  const handleNumberChange = (name, value) => {
    setForm({ ...form, [name]: value });
    // Clear error for the field being edited
    setErrors({ ...errors, [name]: "" });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.medName.trim()) {
      newErrors.medName = "Medicine name is required";
    }
    // if (!form.quantity || form.quantity <= 0) {
    //   newErrors.quantity = "Quantity must be greater than 0";
    // }
    if (!form.price || form.price < 0) {
      newErrors.price = "Price must be non-negative";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleOk = async () => {
    console.log("api start");
    if (!validateForm()) {
      return;
    }

    try {
      const doctorId = user?.role === "doctor" ? user?.userId : user?.createdBy;

      form.quantity = 100;
      await apiPost("pharmacy/addMedInventory", {
        ...form,
        doctorId: doctorId, // Replace with actual doctor ID from auth context
      });
      console.log(apiPost);
      setForm({ medName: "", quantity: "", price: "" });
      setErrors({});
      setIsModalVisible(false);
      Modal.success({
        title: "Success",
        content: "Medicine added to inventory successfully",
      });
    } catch (error) {
      console.error("Error adding medicine:", error);
      Modal.error({
        title: "Error",
        content: "Failed to add medicine to inventory",
      });
    }
  };

  const handleCancel = () => {
    setForm({ medName: "", quantity: "", price: "" });
    setErrors({});
    setIsModalVisible(false);
  };

  const tabItems = [
    {
      key: "1",
      label: "Pending Patients",
      children: <PatientsTab status={"pending"} updateCount={updateCount} />,
    },
    {
      key: "2",
      label: "Medicines",
      children: <MedicinesTab />,
    },
    {
      key: "3",
      label: "Completed Patients",
      children: <PatientsTab status={"completed"} updateCount={updateCount} />,
    },
  ];

  console.log("User Data:", user);

  async function fetchRevenueCount() {
    const response = await apiGet(
      "/finance/getDoctorTodayAndThisMonthRevenue/pharmacy"
    );
    console.log("getDoctorTodayAndThisMonthRevenue", response);

    if (response.status === 200 && response?.data?.data) {
      console.log("getDoctorTodayAndThisMonthRevenue", response.data.data);
      setCardsData(response.data.data);
    }
  }

  useEffect(() => {
    if ((user, doctorId)) {
      fetchRevenueCount();
    }
  }, [user, doctorId]);

  function updateCount() {
    fetchRevenueCount();
  }

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

        <Content style={{ padding: "24px" }}>
          {/* Revenue Cards */}
          <Row gutter={[24, 24]} style={{ marginBottom: "24px" }}>
            <Col xs={24} sm={12}>
              <Card className="revenue-card-today">
                <div className="revenue-icon">
                  <div className="revenue-icon-today">
                    <UserOutlined
                      style={{ color: "white", fontSize: "18px" }}
                    />
                  </div>
                </div>
                <div>
                  <div className="revenue-title-today">Today Revenue</div>
                  <div className="revenue-value-today">
                    ₹ {cardsData?.today?.revenue}
                  </div>
                  <div className="revenue-subtitle-today">
                    Patient : {cardsData?.today?.patients}
                  </div>
                </div>
              </Card>
            </Col>

            <Col xs={24} sm={12}>
              <Card className="revenue-card-month">
                <div className="revenue-icon">
                  <div className="revenue-icon-month">
                    <UsergroupAddOutlined
                      style={{ color: "white", fontSize: "18px" }}
                    />
                  </div>
                </div>
                <div>
                  <div className="revenue-title-month">This Month Revenue</div>
                  <div className="revenue-value-month">
                    ₹ {cardsData?.month?.revenue}
                  </div>
                  <div className="revenue-subtitle-month">
                    Patients : {cardsData?.month?.patients}
                  </div>
                </div>
              </Card>
            </Col>
          </Row>

          {/* Add Inventory Button */}
          <div style={{ marginBottom: "24px", textAlign: "right" }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={showModal}>
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
            <div style={{ padding: "16px 0" }}>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", marginBottom: "8px" }}>
                  Medicine Name
                </label>
                <Input
                  name="medName"
                  value={form.medName}
                  onChange={handleInputChange}
                  placeholder="Enter medicine name"
                />
                {errors.medName && (
                  <div
                    style={{ color: "red", fontSize: "12px", marginTop: "4px" }}
                  >
                    {errors.medName}
                  </div>
                )}
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "8px" }}>
                  Price (₹)
                </label>
                <InputNumber
                  name="price"
                  value={form.price}
                  onChange={(value) => handleNumberChange("price", value)}
                  min={0}
                  step={0.01}
                  placeholder="Enter price"
                  style={{ width: "100%" }}
                />
                {errors.price && (
                  <div
                    style={{ color: "red", fontSize: "12px", marginTop: "4px" }}
                  >
                    {errors.price}
                  </div>
                )}
              </div>
            </div>
          </Modal>

          {/* Patient Management Table with Tabs */}
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
