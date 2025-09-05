import React, { useState } from "react";
import { Row, Col, Card, Typography, Button, Input, Space, Divider } from "antd";
import { Link } from "react-router-dom";
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
  const [email, setEmail] = useState("");

  const handleEmailSubmit = () => {
    console.log("Newsletter subscription:", email);
    setEmail("");
  };

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
        <Row justify="space-between" align="middle" gutter={[24, 24]}>
          <Col xs={24} lg={12}>
            <Title level={2} style={{ color: "#fff", margin: 0, fontSize: "2rem" }}>
              Working for Your <span style={{ color: "#fff" }}>Better Health.</span>
            </Title>
          </Col>
          <Col xs={24} lg={12}>
            <Row justify="end" gutter={[48, 24]}>
              <Col xs={24} sm={12} lg={12}>
                <ContactInfo 
                  icon={<CustomerServiceOutlined style={{ fontSize: 24 }} />}
                  title="Customer Support"
                  value="+91 9666955501"
                />
              </Col>
              <Col xs={24} sm={12} lg={12}>
                <ContactInfo 
                  icon={<MessageOutlined style={{ fontSize: 24 }} />}
                  title="Drop Us an Email"
                  value="Vydhyo@gmail.com"
                />
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>

      {/* Main Footer Content */}
      <div
  style={{
    maxWidth: 1320,
    margin: '0 auto',
    padding: '64px 32px 32px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  }}
>
      {/* <div style={{ maxWidth: 1320, margin: "0 auto", padding: "64px 32px 32px", justifyContent:'center', alignItems:'center'}}> */}
        {/* <Row gutter={[32, 32]} justify="space-between">
          <Col xs={24} lg={16}>
            <Row gutter={[32, 32]}>
              <Col xs={12} sm={6} md={6} lg={6}>
                <FooterSection 
                  title="Company"
                  items={["About", "Features", "Works", "Careers", "Locations"]}
                />
              </Col>
              <Col xs={12} sm={6} md={6} lg={6}>
                <FooterSection 
                  title="Treatments"
                  items={["Dental", "Cardiac", "Spinal Cord", "Hair Growth", "Anemia & Disorder"]}
                />
              </Col>
              <Col xs={12} sm={6} md={6} lg={6}>
                <FooterSection 
                  title="Specialties"
                  items={["Transplant", "Cardiologist", "Oncology", "Pediatrics", "Gynecology"]}
                />
              </Col>
              <Col xs={12} sm={6} md={6} lg={6}>
                <FooterSection 
                  title="Utilities"
                  items={["Pricing", "Contact", "Request A Quote", "Premium Membership", "Integrations"]}
                />
              </Col>
            </Row>
          </Col>

          <Col xs={24} lg={8}>
            <div style={{ minWidth: 320 }}>
              <Title level={5} style={{ marginBottom: 16, fontSize: "1.1rem", fontWeight: 600 }}>
                Newsletter
              </Title>
              <Text style={{ display: "block", marginBottom: 16, fontSize: "1rem", color: "#666" }}>
                Subscribe & Stay Updated from the Vydhyo
              </Text>
              
              <Space.Compact style={{ width: "100%", marginBottom: 32 }}>
                <Input 
                  placeholder="Enter Email Address" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ 
                    height: 48,
                    fontSize: "1rem",
                    borderRadius: "8px 0 0 8px"
                  }}
                />
                <Button 
                  type="primary" 
                  icon={<SendOutlined />}
                  onClick={handleEmailSubmit}
                  style={{ 
                    height: 48,
                    background: "#00203f",
                    borderColor: "#00203f",
                    borderRadius: "0 8px 8px 0",
                    fontSize: "1rem",
                    fontWeight: 500
                  }}
                >
                  Send
                </Button>
              </Space.Compact>
              

            </div>
          </Col>
        </Row> */}
                      
                <Title level={5} style={{ marginBottom: 16, fontSize: "1rem", fontWeight: 600 }}>
                  Connect With Us
                </Title>
                <Space size={12}>

                <a href="https://www.facebook.com/profile.php?id=61577351085015" target="_blank" rel="noopener noreferrer">
                  <SocialIcon icon={<FacebookOutlined />} />
                </a>

                  <a href="https://x.com/vydhyo" target="_blank" rel="noopener noreferrer">
                    <SocialIcon icon={<TwitterOutlined />} />
                  </a>  

                  <a href="https://www.instagram.com/vydhyo_healthcare/profilecard/?igsh=ZGFzM25temd4bWZ4" target="_blank" rel="noopener noreferrer">              
                    <SocialIcon icon={<InstagramOutlined />} />
                  </a>
                  {/* <SocialIcon icon={<LinkedinOutlined />} />
                  <SocialIcon icon={<GithubOutlined />} /> */}
                </Space>
              
      </div>

      {/* Footer Bottom */}
      <Divider style={{ margin: 0 }} />
      <div style={{ background: "#eaf3fb", padding: "16px 0" }}>
        <Row 
          justify="space-between" 
          align="middle" 
          gutter={[16, 16]}
          style={{ maxWidth: 1320, margin: "0 auto", padding: "0 32px" }}
        >
          <Col xs={24} sm={8} lg={8}>
            <Text style={{ fontSize: "0.95rem" }}>
              Copyright © 2025 Vydhyo. All Rights Reserved<br />VYDHYO HEALTHCARE PRIVATE LIMITED
            </Text>
          </Col>
           <Col xs={24} sm={8} lg={8}>
      <Space split={<Divider type="vertical" />} style={{ justifyContent: 'center', width: '100%' }}>
        <Link to="/terms-and-conditions" style={{ color: '#1890ff', fontSize: '0.9rem' }}>
          <Text >Terms of Conditions</Text>
        </Link>
        <Link to="/privacy-policy-footer" style={{ color: '#1890ff', fontSize: '0.9rem' }}>
          <Text >Privacy Policy</Text>
        </Link>
        <Link to="/refund-policy" style={{ color: '#1890ff', fontSize: '0.9rem' }}>
          <Text >Refund Policy</Text>
        </Link>
      </Space>
    </Col>
          {/* <Col xs={24} sm={8} lg={8}>
            <div style={{ textAlign: "right" }}>
              <Space size={8}>
                <img 
                  src="https://img.icons8.com/color/32/000000/visa.png" 
                  alt="Visa" 
                  style={{ width: 32, height: 32 }}
                />
                <img 
                  src="https://img.icons8.com/color/32/000000/mastercard.png" 
                  alt="Mastercard" 
                  style={{ width: 32, height: 32 }}
                />
                <img 
                  src="https://img.icons8.com/color/32/000000/amex.png" 
                  alt="American Express" 
                  style={{ width: 32, height: 32 }}
                />
                <img 
                  src="https://img.icons8.com/color/32/000000/discover.png" 
                  alt="Discover" 
                  style={{ width: 32, height: 32 }}
                />
                <img 
                  src="https://img.icons8.com/color/32/000000/paypal.png" 
                  alt="PayPal" 
                  style={{ width: 32, height: 32 }}
                />
              </Space>
            </div>
          </Col> */}
        </Row>
      </div>
    </footer>
  );
};

const ContactInfo = ({ icon, title, value }) => {
  return (
    <Space size={12} align="start">
      <div style={{
        width: 48,
        height: 48,
        borderRadius: "50%",
        background: "#fff",
        color: "#00203f",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        {icon}
      </div>
      <div>
        <Text style={{ color: "#fff", display: "block", fontSize: "0.9rem", marginBottom: 4 }}>
          {title}
        </Text>
        <Text strong style={{ color: "#fff", display: "block", fontSize: "1.1rem" }}>
          {value}
        </Text>
      </div>
    </Space>
  );
};

const FooterSection = ({ title, items }) => {
  return (
    <div>
      <Title level={5} style={{ 
        marginBottom: 20, 
        fontSize: "1.1rem", 
        fontWeight: 600,
        color: "#333"
      }}>
        {title}
      </Title>
      <Space direction="vertical" size={12} style={{ width: "100%" }}>
        {items.map((item, index) => (
          <Text 
            key={index} 
            style={{ 
              display: "block", 
              color: "#666",
              fontSize: "1rem",
              cursor: "pointer",
              transition: "color 0.2s"
            }}
            className="footer-link"
          >
            {item}
          </Text>
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
      size="large"
      style={{ 
        background: "#f7fafd", 
        color: "#00203f",
        border: "1px solid #e8e8e8",
        width: 44,
        height: 44,
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
      className="social-icon-btn"
    />
  );
};

export default Footer;