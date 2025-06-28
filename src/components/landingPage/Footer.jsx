import React from "react";
import { Row, Col, Card, Typography, Button, Input, Space, Divider } from "antd";
import { 
  CustomerServiceOutlined, 
  MessageOutlined, 
  SendOutlined,
  FacebookOutlined,
  TwitterOutlined,
  InstagramOutlined,
  LinkedinOutlined,
  GithubOutlined
} from "@ant-design/icons";

const { Title, Text } = Typography;

const Footer = () => {
  return (
    <footer style={{ background: "#f7fafd", marginTop: 40 }}>
      {/* Top Banner */}
      <Card
        style={{
          background: "linear-gradient(90deg, #00203f 0%, #00203f 100%)",
          borderRadius: 32,
          margin: "0 auto",
          marginTop: -40,
          maxWidth: 1320,
          color: "#fff",
          boxShadow: "0 8px 32px rgba(10,142,253,0.08)",
          border: "none"
        }}
        bodyStyle={{ padding: 48 }}
      >
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2} style={{ color: "#fff", margin: 0 }}>
              Working for Your <span style={{ color: "#fff" }}>Better Health.</span>
            </Title>
          </Col>
          <Col>
            <Space size={48}>
              <ContactInfo 
                icon={<CustomerServiceOutlined style={{ fontSize: 24 }} />}
                title="Customer Support"
                value="+92 97612 34789"
              />
              <ContactInfo 
                icon={<MessageOutlined style={{ fontSize: 24 }} />}
                title="Drop Us an Email"
                value="info1256@example.com"
              />
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Main Footer Content */}
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "64px 32px 32px" }}>
        <Row gutter={[32, 32]} justify="space-between">
          <Col xs={24} sm={12} md={6}>
            <FooterSection 
              title="Company"
              items={["About", "Features", "Works", "Careers", "Locations"]}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <FooterSection 
              title="Treatments"
              items={["Dental", "Cardiac", "Spinal Cord", "Hair Growth", "Anemia & Disorder"]}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <FooterSection 
              title="Specialities"
              items={["Transplant", "Cardiologist", "Oncology", "Pediatrics", "Gynacology"]}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <FooterSection 
              title="Utilities"
              items={["Pricing", "Contact", "Request A Quote", "Premium Membership", "Integrations"]}
            />
          </Col>
          <Col xs={24} md={12} lg={8}>
            <div style={{ minWidth: 320 }}>
              <Title level={5} style={{ marginBottom: 16 }}>Newsletter</Title>
              <Text style={{ display: "block", marginBottom: 12 }}>
                Subscribe & Stay Updated from the Doccure
              </Text>
              <Space.Compact style={{ width: "100%" }}>
                <Input placeholder="Enter Email Address" />
                <Button type="primary" icon={<SendOutlined />}>Send</Button>
              </Space.Compact>
              
              <div style={{ marginTop: 32 }}>
                <Title level={5} style={{ marginBottom: 12 }}>Connect With Us</Title>
                <Space size={16}>
                  <SocialIcon icon={<FacebookOutlined />} />
                  <SocialIcon icon={<TwitterOutlined />} />
                  <SocialIcon icon={<InstagramOutlined />} />
                  <SocialIcon icon={<LinkedinOutlined />} />
                  <SocialIcon icon={<GithubOutlined />} />
                </Space>
              </div>
            </div>
          </Col>
        </Row>
      </div>

      {/* Footer Bottom */}
      <Divider style={{ margin: 0 }} />
      <div style={{ background: "#eaf3fb", padding: "16px 0" }}>
        <Row 
          justify="space-between" 
          align="middle" 
          style={{ maxWidth: 1320, margin: "0 auto", padding: "0 32px" }}
        >
          <Col>
            <Text>Copyright © 2025 Doccure. All Rights Reserved</Text>
          </Col>
          <Col>
            <Space split={<Divider type="vertical" />}>
              <Text type="secondary">Legal Notice</Text>
              <Text type="secondary">Privacy Policy</Text>
              <Text type="secondary">Refund Policy</Text>
            </Space>
          </Col>
          <Col>
            <Space size={8}>
              <img src="https://img.icons8.com/color/32/000000/visa.png" alt="Visa" />
              <img src="https://img.icons8.com/color/32/000000/amex.png" alt="Amex" />
              <img src="https://img.icons8.com/color/32/000000/discover.png" alt="Discover" />
              <img src="https://img.icons8.com/color/32/000000/stripe.png" alt="Stripe" />
              <img src="https://img.icons8.com/color/32/000000/paypal.png" alt="Paypal" />
            </Space>
          </Col>
        </Row>
      </div>
    </footer>
  );
};

const ContactInfo = ({ icon, title, value }) => {
  return (
    <Space size={12}>
      {/* <Avatar 
        size={48} 
        icon={icon} 
        style={{ 
          background: "#fff", 
          color: "#00203f" 
        }} 
      /> */}
      <div>
        <Text style={{ color: "#fff", display: "block" }}>{title}</Text>
        <Text strong style={{ color: "#fff", display: "block" }}>{value}</Text>
      </div>
    </Space>
  );
};

const FooterSection = ({ title, items }) => {
  return (
    <div>
      <Title level={5} style={{ marginBottom: 16 }}>{title}</Title>
      <Space direction="vertical" size={8}>
        {items.map((item, index) => (
          <Text key={index} style={{ display: "block" }}>{item}</Text>
        ))}
      </Space>
    </div>
  );
};

const SocialIcon = ({ icon }) => {
  return (
    <Button 
      shape="circle" 
      icon={icon} 
      style={{ 
        background: "#f7fafd", 
        color: "#00203f",
        border: "none"
      }} 
    />
  );
};

export default Footer;