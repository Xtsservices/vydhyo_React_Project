import React from "react";
import { Row, Col, Card, Typography, Button, Space } from "antd";
import { 
  ClockCircleOutlined, 
  ThunderboltOutlined,
  AppleOutlined,
  AndroidOutlined 
} from "@ant-design/icons";
import Blogs from "./Blogs"; 

const { Title, Text } = Typography;

const GetApp = () => {
  return (
    <>
    <Card
      style={{
        background: "linear-gradient(90deg, rgb(0, 32, 63) 0%, #00203f 100%)",
        borderRadius: 40,
        padding: 24,
        margin: "0 auto",
        maxWidth: 1400,
        position: "relative",
        overflow: "hidden",
      }}
      bodyStyle={{ padding: 0 }}
    >
      {/* Decorative shapes */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 400,
          height: 400,
          zIndex: 0,
          background: "radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          bottom: 0,
          width: 350,
          height: 350,
          zIndex: 0,
          background: "radial-gradient(ellipse, rgba(255,255,255,0.09) 0%, transparent 70%)",
        }}
      />

      <Row align="middle" style={{ position: "relative", zIndex: 1 }}>
        {/* Left Content */}
        <Col xs={24} md={12} style={{ padding: 24 }}>
          <Button
            type="primary"
            style={{
              background: "#FFFFFF",
              color: "#0E82FD",
              borderRadius: 16,
              fontWeight: 600,
              marginBottom: 15,
              border: "none",
            }}
          >
            GET THE APP
          </Button>

          <Title 
            level={2} 
            style={{ 
              color: "#fff", 
              fontWeight: 700,
              marginBottom: 20,
              lineHeight: 1.1 
            }}
          >
            Coming soon Vydhyo - India's
            <br />
            Trusted Doctors App!
          </Title>

          <Text
            style={{
              color: "#e6f7ff",
              fontSize: 18,
              marginBottom: 32,
              display: "block",
              lineHeight: 1.6,
            }}
          >
            Connect with 10,000+ verified doctors across India. Book instant video
            consultations, order medicines, get lab tests done, and access your
            health records - all in one app. Available in Hindi, English, and 8
            other Indian languages.
          </Text>

          <Space size={16}>
            <Button
              href="https://play.google.com/store/apps/details?id=com.vydhyo.patient"
              target="_blank"
              icon={<AndroidOutlined />}
              size="large"
              style={{
                height: 48,
                padding: "0 24px",
                background: "#000",
                color: "#fff",
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
              }}
            >
              Google Play
            </Button>
            <Button
              href="https://apps.apple.com/in/app/vydhyo-doctors/id123456789"
              target="_blank"
              icon={<AppleOutlined />}
              size="large"
              style={{
                height: 48,
                padding: "0 24px",
                background: "#000",
                color: "#fff",
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
              }}
            >
              App Store
            </Button>
          </Space>

          <Space size={16} style={{ marginTop: 24 }}>
            <Text style={{ color: "#fff", display: "flex", alignItems: "center" }}>
              <ClockCircleOutlined style={{ marginRight: 8 }} />
              24x7 Doctor Support
            </Text>
            <Text style={{ color: "#fff", display: "flex", alignItems: "center" }}>
              <ThunderboltOutlined style={{ marginRight: 8 }} />
              ₹0 Consultation Fee*
            </Text>
          </Space>
        </Col>

        {/* Right Content: App Screenshots */}
        <Col xs={24} md={12} style={{ padding: 24 }}>
          <Row justify="end" gutter={[24, 24]}>
            <Col>
              <Card
                hoverable
                cover={
                  <img
                    alt="Vydhyo App Screenshot"
                    src="https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=600&q=80"
                  />
                }
                style={{
                  width: 200,
                  borderRadius: 32,
                  boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                  marginRight: -40,
                  border: "8px solid #fff",
                  transform: "rotate(-5deg)",
                }}
                bodyStyle={{ display: "none" }}
              />
            </Col>
            <Col>
              <Card
                hoverable
                cover={
                  <img
                    alt="Vydhyo App Screenshot"
                    src="https://images.unsplash.com/photo-1584634731339-252c58ab6554?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=600&q=80"
                  />
                }
                style={{
                  width: 180,
                  borderRadius: 24,
                  boxShadow: "0 8px 32px rgba(0,0,0,0.10)",
                  border: "8px solid #fff",
                  transform: "rotate(5deg)",
                }}
                bodyStyle={{ display: "none" }}
              />
            </Col>
          </Row>
        </Col>
      </Row>
    </Card>
    <Blogs />
    </>
  );
};

export default GetApp;