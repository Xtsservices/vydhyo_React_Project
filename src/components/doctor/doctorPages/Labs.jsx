import React, { useEffect, useState } from "react";
import { Input, Tabs, Card, Avatar, Space, Typography, Row, Col } from "antd";
import { SearchOutlined, UserOutlined, TeamOutlined } from "@ant-design/icons";
import TestManagement from "./TestManagement";
import LabPatientManagement from "./LabPatientManagement";
import { useSelector } from "react-redux";
import { apiGet } from "../../api";

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const Labs = () => {
  const user = useSelector((state) => state.currentUserData);
  const doctorId = user?.role === "doctor" ? user?.userId : user?.createdBy;
  const [cardsData, setCardsData] = useState();
  const [searchValue, setSearchValue] = useState("");

  async function fetchRevenueCount() {
    const response = await apiGet(
      `/finance/getDoctorTodayAndThisMonthRevenue/lab?doctorId=${doctorId}`
    );
    console.log("getDoctorTodayAndThisMonthRevenue", response);

    if (response.status === 200 && response?.data?.data) {
      console.log("getDoctorTodayAndThisMonthRevenue", response.data.data);
      setCardsData(response.data.data);
    }
  }

  useEffect(() => {
    if (user && doctorId) {
      fetchRevenueCount();
    }
  }, [user, doctorId]);

  function updateCount() {
    fetchRevenueCount();
  }

  console.log(searchValue, "searchValue");

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
        padding: "24px",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Header */}
      <Row
        justify="space-between"
        align="middle"
        style={{ marginBottom: "24px" }}
      >
        <Col>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                backgroundColor: "#1890ff",
                borderRadius: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: "16px",
                fontWeight: "bold",
              }}
            >
              ⚗
            </div>
            <Title level={2} style={{ margin: 0, color: "#262626" }}>
              Labs
            </Title>
          </div>
        </Col>
        <Col>
          <Input
            placeholder="Search by PatientId"
            prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
            style={{
              width: "320px",
              borderRadius: "8px",
            }}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value.trim())}
            allowClear
          />
        </Col>
      </Row>

      {/* Revenue Cards */}
      <Row gutter={24} style={{ marginBottom: "24px" }}>
        <Col span={12}>
          <Card
            style={{
              backgroundColor: "#DBEAFE",
              border: "none",
              borderRadius: "8px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div>
                <Text
                  style={{
                    color: "#2563EB",
                    fontWeight: 500,
                    fontSize: "14px",
                  }}
                >
                  Today Revenue
                </Text>
                <div
                  style={{
                    fontSize: "32px",
                    fontWeight: "bold",
                    color: "#2563EB",
                    margin: "8px 0",
                  }}
                >
                  ₹ {cardsData?.today?.revenue || 0}
                </div>
                <Text style={{ color: "#2563EB", fontSize: "14px" }}>
                  Patient: {cardsData?.today?.patients || 0}
                </Text>
              </div>
              <div
                style={{
                  backgroundColor: "#bae7ff",
                  padding: "8px",
                  borderRadius: "8px",
                }}
              >
                <UserOutlined style={{ fontSize: "24px", color: "#1890ff" }} />
              </div>
            </div>
          </Card>
        </Col>

        <Col span={12}>
          <Card
            style={{
              backgroundColor: "#DCFCE7",
              border: "none",
              borderRadius: "8px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div>
                <Text
                  style={{
                    color: "#16A34A",
                    fontWeight: 500,
                    fontSize: "14px",
                  }}
                >
                  This Month Revenue
                </Text>
                <div
                  style={{
                    fontSize: "32px",
                    fontWeight: "bold",
                    color: "#16A34A",
                    margin: "8px 0",
                  }}
                >
                  ₹ {cardsData?.month?.revenue || 0}
                </div>
                <Text style={{ color: "#16A34A", fontSize: "14px" }}>
                  Patients: {cardsData?.month?.patients || 0}
                </Text>
              </div>
              <div
                style={{
                  backgroundColor: "#b7eb8f",
                  padding: "8px",
                  borderRadius: "8px",
                }}
              >
                <TeamOutlined style={{ fontSize: "24px", color: "#52c41a" }} />
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Tabs for Test and Patient Management */}
      <Tabs
        defaultActiveKey="patients"
        type="card"
        style={{ marginBottom: "24px" }}
      >
        <TabPane tab="Patients" key="patients">
          <LabPatientManagement
            status="pending"
            updateCount={updateCount}
            searchValue={searchValue}
          />
        </TabPane>
        <TabPane tab="Completed Patients" key="completedPatients">
          <LabPatientManagement
            status="completed"
            updateCount={updateCount}
            searchValue={searchValue}
          />
        </TabPane>
        <TabPane tab="Tests" key="tests">
          <TestManagement />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default Labs;