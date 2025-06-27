import React from "react";
import { Card, Row, Col, Typography } from "antd";
import {
  ExperimentOutlined,
  HomeOutlined,
  BankOutlined,
  MedicineBoxOutlined,
  HeartOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const services = [
  {
    title: "Outpatient Services (OP)",
    icon: <HomeOutlined />,
    color: "#e6f7ff",
    iconColor: "#1890ff",
  },
  {
    title: "Pharmacy",
    icon: <BankOutlined />,
    color: "#f9f0ff",
    iconColor: "#722ed1",
  },
  {
    title: "Diagnostics",
    icon: <ExperimentOutlined />,
    color: "#fff7e6",
    iconColor: "#fa8c16",
  },
  {
    title: "Blood Banks",
    icon: <HeartOutlined />,
    color: "#fff1f0",
    iconColor: "#f5222d",
  },
];

const Services = () => {
  return (
    <div>
      <Row gutter={[32, 32]} justify="center">
        <Col xs={24}>
          <Title level={2} style={{ textAlign: "center", marginBottom: 8, marginTop: 30 }}>
            Our Services
          </Title>
          <Text
            style={{
              display: "block",
              textAlign: "center",
              fontSize: "22px",
              marginBottom: "2rem",
              color: "#001f3f",
            }}
          >
            <u>Coming Soon</u>
          </Text>
        </Col>
        {services.map((service, index) => (
          <Col key={index} xs={24} sm={12} md={8} lg={6}>
            <Card
              hoverable
              bordered={false}
              bodyStyle={{
                padding: "32px 16px",
                backgroundColor: service.color,
                borderRadius: 10,
                textAlign: "center",
                transition: "all 0.3s ease",
              }}
              style={{
                borderRadius: 10,
                overflow: "hidden",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(0, 0, 0, 0.1)";
                e.currentTarget.style.transform = "translateY(-6px) scale(1.02)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.transform = "translateY(0) scale(1)";
              }}
            >
              <div style={{ marginBottom: "1rem" }}>
                {React.cloneElement(service.icon, {
                  style: { fontSize: 30, color: service.iconColor },
                })}
              </div>
              <Text strong style={{ fontSize: 16 }}>
                {service.title}
              </Text>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default Services;