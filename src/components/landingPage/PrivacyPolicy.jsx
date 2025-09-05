import React, { useState } from "react";
import { 
  Row, 
  Col, 
  Card, 
  Typography, 
  Collapse, 
  Space, 
  Tag, 
  Grid,
  Badge
} from "antd";
import {
  PlusOutlined,
  MinusOutlined,
  CheckCircleOutlined,
  LockOutlined,
  SafetyCertificateOutlined
} from "@ant-design/icons";
import GetApp from "./GetApp"; 

const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;
const { useBreakpoint } = Grid;

const privacyPolicySections = [
  {
    question: "1. Information We Collect",
    answer: `We collect the following types of information:

A. Personal Information
• Name, gender, date of birth
• Phone number, email address, postal address
• Government-issued IDs (as required for verification)

B. Health Information
• Medical history, reports, prescriptions
• Appointment records
• Diagnostic and consultation data

C. Device & Usage Information
• IP address, browser type, device identifiers
• App usage data and interaction logs

D. Location Information
• Real-time location (for ambulance services, nearest providers, etc.)`,
  },
  {
    question: "2. How We Use Your Information",
    answer: `We use your data to:
• Enable doctor and diagnostic bookings
• Provide ambulance and blood bank access
• Coordinate home healthcare services
• Maintain medical history for continuity of care
• Improve user experience and offer personalized services
• Process payments and issue invoices
• Ensure regulatory compliance and audit readiness`,
  },
  {
    question: "3. Data Sharing and Disclosure",
    answer: `We do not sell or rent your personal data. Your information may only be shared with:
• Verified hospitals, doctors, diagnostic labs, and ambulances for service fulfillment
• Our internal support and tech teams (bound by strict confidentiality)
• Government authorities if mandated by law or in emergency situations`,
  },
  {
    question: "4. Your Rights",
    answer: `You have full control over your data. You can:
• Access and review your data anytime
• Request corrections or deletions
• Withdraw consent and deactivate your account
• Download your data in portable format

To exercise these rights, email us at privacy@vydyo.in`,
  },
  {
    question: "5. Data Retention",
    answer: `We retain your information only as long as necessary for:
• Legal, regulatory, or operational reasons
• Providing uninterrupted healthcare continuity

Inactive user data is securely deleted after [X years] or upon formal request.`,
  },
//   {
//     question: "6. Security Measures",
//     answer: `We use bank-grade encryption, secure cloud infrastructure, and industry-standard protocols:
// • End-to-end encryption (TLS 1.3)
// • Role-based access control and audit logs
// • ISO/IEC 27001 certified systems
// • HIPAA-compliant data handling`,
//   },
//   {
//     question: "7. Cookies and Tracking",
//     answer: `We use minimal cookies for:
// • Analytics and performance improvement
// • Remembering user preferences

// You can disable cookies via your browser without affecting core functionality.`,
//   },
//   {
//     question: "8. Third-Party Services",
//     answer:
//       "Some services may be integrated via trusted third parties (e.g., payment gateways). We ensure these partners meet equivalent data privacy and security standards.",
//   },
//   {
//     question: "9. Children's Privacy",
//     answer:
//       "VYDYO is not intended for users under the age of 18 without parental/guardian consent. We do not knowingly collect data from minors.",
//   },
//   {
//     question: "10. Grievance Officer",
//     answer: `Name: 
// Email: grievance@vydyo.in
// Contact: +91-XXXXXXXXXX
// Address: VYDYO HealthTech Pvt Ltd, Hall Mark Sunny Side, Manchirevula, Hyderabad, Telangana, India`,
//   },
//   {
//     question: "11. Policy Updates",
//     answer:
//       "We may revise this Privacy Policy to reflect legal or business changes. Users will be notified via app/website or email. Continued use of VYDYO implies consent to the updated policy.",
//   },
];

const PrivacyPolicy = () => {
  const [activeKey, setActiveKey] = useState(['0']);
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const handleCollapseChange = (key) => {
    setActiveKey(key);
  };

  const genExtra = (isActive) => (
    <div
      style={{
        width: 24,
        height: 24,
        borderRadius: 4,
        background: isActive ? "#1890ff" : "#f5f5f5",
        color: isActive ? "#fff" : "#8c8c8c",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.2s ease",
      }}
    >
      {isActive ? <MinusOutlined style={{ fontSize: 12 }} /> : <PlusOutlined style={{ fontSize: 12 }} />}
    </div>
  );

  return (
    <>
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        padding: isMobile ? "20px 16px" : "40px 20px",
      }}
    >
      <Row justify="center">
        <Col xs={24} sm={22} md={20} lg={16} xl={14}>
          {/* Header Section */}
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <Row justify="center" style={{ position: 'relative', zIndex: 1, marginBottom: 40 }}>
              <Col>
                <button
                  type="button"
                  style={{
                    background: '#00203f',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: 14,
                    border: 'none',
                    borderRadius: 20,
                    height: 'auto',
                    padding: '10px 20px',
                    marginTop: 0,
                    boxShadow: '0 4px 15px rgba(66, 133, 244, 0.3)',
                    cursor: 'pointer',
                  }}
                >
                  Privacy Policy
                </button>
              </Col>
            </Row>
              <div style={{ paddingTop: 0 }}>
                <Title 
                  level={1} 
                  style={{ 
                    fontSize: isMobile ? 24 : 32,
                    fontWeight: 700,
                    color: "#1e293b",
                    lineHeight: 1.2,
                  }}
                >
                  Your Data Privacy Matters
                </Title>
                <Paragraph
                  style={{
                    color: "#64748b",
                    fontSize: 16,
                    lineHeight: 1.5,
                    maxWidth: 600,
                    margin: "0 auto",
                  }}
                >
                  At VYDYO, we are committed to protecting your personal and health
                  information with the highest security standards. This policy
                  explains how we collect, use, and safeguard your data.
                </Paragraph>
              </div>
          </div>

          {/* Privacy Policy Sections */}
          <Card
            style={{
              borderRadius: 12,
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              marginBottom: 40,
            }}
            bodyStyle={{ padding: 0 }}
          >
            <Collapse
              activeKey={activeKey}
              onChange={handleCollapseChange}
              expandIconPosition="right"
              ghost
              size="large"
            >
              {privacyPolicySections.map((section, idx) => (
                <Panel
                  header={
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <Badge
                        count={idx + 1}
                        style={{
                          backgroundColor: "#1890ff",
                          fontSize: 12,
                          minWidth: 20,
                          height: 20,
                          lineHeight: "20px",
                        }}
                      />
                      <Text
                        strong
                        style={{
                          fontSize: isMobile ? 14 : 16,
                          color: "#1e293b",
                        }}
                      >
                        {section.question}
                      </Text>
                    </div>
                  }
                  key={idx.toString()}
                  extra={genExtra(activeKey.includes(idx.toString()))}
                  style={{
                    borderBottom: idx !== privacyPolicySections.length - 1 ? "1px solid #f0f0f0" : "none",
                  }}
                >
                  <div
                    style={{
                      color: "#475569",
                      fontSize: 15,
                      lineHeight: 1.6,
                      paddingLeft: isMobile ? 0 : 32,
                      whiteSpace: "pre-line",
                    }}
                  >
                    {section.answer}
                  </div>
                </Panel>
              ))}
            </Collapse>
          </Card>

          {/* Trust Section */}
          <Card
            style={{
              borderRadius: 12,
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              textAlign: "center",
            }}
            bodyStyle={{ padding: isMobile ? 24 : 32 }}
          >
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                background: "#e6f4ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
                color: "#1890ff",
              }}
            >
            <SafetyCertificateOutlined style={{ fontSize: 28 }} />
            </div>
            
            <Title
              level={2}
              style={{
                fontSize: isMobile ? 20 : 24,
                fontWeight: 700,
                color: "#1e293b",
                marginBottom: 12,
              }}
            >
              🔒 Built for Trust. Powered by Compliance.
            </Title>
            
            <Paragraph
              style={{
                color: "#64748b",
                fontSize: 16,
                lineHeight: 1.5,
                marginBottom: 24,
              }}
            >
              We stand for transparency, security, and patient rights.
              <br />
              Thank you for trusting VYDYO with your healthcare journey.
            </Paragraph>

            {/* Compliance Badges */}
            <Space 
              size="middle" 
              wrap
              style={{ 
                justifyContent: "center",
                width: "100%"
              }}
            >
              <Tag
                icon={<CheckCircleOutlined />}
                style={{
                  background: "#dcfce7",
                  color: "#166534",
                  padding: "8px 16px",
                  borderRadius: 20,
                  fontSize: 14,
                  fontWeight: 600,
                  border: "1px solid #bbf7d0",
                }}
              >
                ISO 27001 Certified
              </Tag>
              
              <Tag
                icon={<SafetyCertificateOutlined />}
                style={{
                  background: "#dbeafe",
                  color: "#1e40af",
                  padding: "8px 16px",
                  borderRadius: 20,
                  fontSize: 14,
                  fontWeight: 600,
                  border: "1px solid #bfdbfe",
                }}
              >
                HIPAA Compliant
              </Tag>
              
              <Tag
                icon={<LockOutlined />}
                style={{
                  background: "#fef3c7",
                  color: "#92400e",
                  padding: "8px 16px",
                  borderRadius: 20,
                  fontSize: 14,
                  fontWeight: 600,
                  border: "1px solid #fde68a",
                }}
              >
                256-bit Encryption
              </Tag>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
    <GetApp />
    </>
  );
};

export default PrivacyPolicy;