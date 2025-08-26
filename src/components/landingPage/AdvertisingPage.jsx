import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Row, Col, Button, Card, Divider, Grid, Dropdown, Space, Layout } from "antd";
import {
  AndroidFilled,
  AppleFilled,
  CheckOutlined,
  StarFilled,
  ClockCircleOutlined,
  ToolOutlined,
  EyeOutlined,
  FundOutlined,
  UserOutlined,
  FormOutlined,
} from "@ant-design/icons";

const { Header } = Layout;
const { useBreakpoint } = Grid;

const AdvertisingDoctorsPage = () => {
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogin = () => {
    navigate('/login');
  };

  const handleJoinNow = () => {
    setShowDropdown(!showDropdown);
  };

  const handleGetStarted = () => {
    setShowDropdown(!showDropdown);
  };

  const dropdownContent = (
    <Card style={{ width: screens.xs ? 300 : 400, borderRadius: 12 }}>
      <div style={{ textAlign: "center" }}>
        <Button
          type="primary"
          style={{ 
            backgroundColor: "#4A90E2", 
            marginBottom: 16,
            height: 48,
            fontSize: 16,
            fontWeight: 600,
            borderRadius: 8
          }}
        >
          GET THE APP
        </Button>
        <h3 style={{ 
          color: "#1A3B34", 
          marginBottom: 8,
          fontSize: 18,
          fontWeight: 600
        }}>
          Coming soon Vydhyo - India's Trusted Doctors App!
        </h3>
        <p style={{ 
          color: "#4B5C58", 
          marginBottom: 24,
          fontSize: 14,
          lineHeight: 1.6
        }}>
          Connect with 10,000+ verified doctors across India. Book instant video
          consultations, order medicines, get lab tests done, and access your
          health records - all in one app. Available in Hindi, English, and 8
          other Indian languages.
        </p>

        <Space size={16} style={{ marginBottom: 20 }}>
          <Button
            icon={<AndroidFilled />}
            style={{ 
              backgroundColor: "#000", 
              color: "#fff",
              height: 45,
              borderRadius: 8,
              padding: '0 16px'
            }}
          >
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: 10 }}>GET IT ON</div>
              <div style={{ fontWeight: "bold", fontSize: 14 }}>Google Play</div>
            </div>
          </Button>
          <Button
            icon={<AppleFilled />}
            style={{ 
              backgroundColor: "#000", 
              color: "#fff", 
              height: 45,
              borderRadius: 8,
              padding: '0 16px'
            }}
          >
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: 10 }}>Download on the</div>
              <div style={{ fontWeight: "bold", fontSize: 14 }}>App Store</div>
            </div>
          </Button>
        </Space>

        <Space size={24} style={{ fontSize: 14, color: "#4B5C58" }}>
          <span>
            <CheckOutlined
              style={{
                color: "#6EDC8C",
                marginRight: 4,
              }}
            />
            24x7 Doctor Support
          </span>
          <span>
            <StarFilled
              style={{
                color: "#6EDC8C",
                marginRight: 4,
              }}
            />
            ₹0 Consultation Fee*
          </span>
        </Space>
      </div>
    </Card>
  );

  return (
    <div style={{ backgroundColor: "#F8FCFA", minHeight: "100vh" }}>
      {/* Header */}
      <Header style={{ 
        background: "#fff", 
        // padding: screens.xs ? "10px 16px" : "10px 30px",
        boxShadow: "0 1px 4px rgba(0,21,41,.08)",
        position: "sticky",
        top: 0,
        zIndex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: 80
      }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <img
            src="/images/pic1.png"
            alt="Vydhyo Logo"
            style={{ 
              height: screens.xs ? "160px" : "158px",
              marginTop: screens.xs ? "0px" : "10px",
              marginRight: screens.xs ? "8px" : "0px",
              marginLeft: screens.xs ? "-25px" : "6px", 
            }}
          />
        </div>
        <Button
          type="primary"
          style={{
            backgroundColor: "#1A3B34",
            fontWeight: "bold",
            height: 40,
            marginRight: screens.xs ? -10 : 0,
            fontSize: 14,
            borderRadius: 6
          }}
          onClick={handleLogin}
        >
          Login
        </Button>
      </Header>

      {/* Hero Section */}
      <section style={{ padding: screens.xs ? "40px 16px" : "0px 0px" }}>
        <Row
          justify="space-between"
          align="middle"
          style={{ maxWidth: 1300, margin: "0px 0px",backgroundColor: "#eafbf2"}}
        >
          <Col xs={24} md={12} style={{ paddingLeft: screens.md ? 50 : 16 }}>
            <h1
              style={{
                fontSize: screens.md ? 48 : 32,
                fontWeight: 700,
                color: "#1A3B34",
                marginBottom: 24,
                lineHeight: 1.2
              }}
            >
              Helping Doctors <br /> Bring Trusted Care <br />
              Closer, Faster & Smarter
            </h1>
            <p
              style={{
                color: "#4B5C58",
                marginBottom: 24,
                maxWidth: 500,
                fontSize: 16,
                lineHeight: 1.6
              }}
            >
              With growing cities and rising expectations, patients seek
              instant, guaranteed appointments with minimal wait times, while doctors
              want predictable OPDs, steady revenue, and digital visibility.
            </p>
            <p style={{ fontSize: 16, lineHeight: 1.6 }}>
              <span style={{ fontWeight: 600, fontSize: 18 }}>Vydhyo</span> - built by doctors for Doctors in tier 2/3 cities -
              offers an all-in-one solution.
            </p>
            <p style={{ fontSize: 16, marginBottom: 32 }}>Join now for free to begin your journey with us.</p>
            <Dropdown
              open={showDropdown}
              onOpenChange={setShowDropdown}
              dropdownRender={() => dropdownContent}
              placement="bottomLeft"
            >
              <Button
                type="primary"
                size="large"
                style={{
                  backgroundColor: "#1A3B34",
                  fontWeight: 600,
                  padding: "0 32px",
                  height: 48,
                  fontSize: 16,
                  borderRadius: 8
                }}
                onClick={handleJoinNow}
              >
                Join Now - It's Free
              </Button>
            </Dropdown>
          </Col>
          <Col xs={24} md={12} style={{ textAlign: "center", marginTop: screens.md ? 0 : 32 }}>
            <img
              src="/images/div.png"
              alt="Vydhyo Devices"
              style={{
                width: "100%",
                maxWidth: 800,
                filter: "drop-shadow(0 10px 8px rgba(0,0,0,0.1))",
              }}
            />
          </Col>
        </Row>
      </section>

      {/* Features */}
      <section style={{ maxWidth: 1200, marginBottom: "-40px", margin: "0px auto", padding: "32px 16px" }}>
  <Row gutter={[24, 24]}>
    <Col xs={24} md={6}>
      <Card
        style={{
          textAlign: "center",
          height: "90%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          borderRadius: 12,
          padding: 24
        }}
      >
        <div
          style={{
            backgroundColor: "#EAFBF2",
            borderRadius: "50%",
            width: 60,
            height: 60,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 10px",
          }}
        >
          <ClockCircleOutlined
            style={{
              fontSize: 28,
              color: "#6EDC8C",
            }}
          />
        </div>
        <h3
          style={{
            fontWeight: 600,
            fontSize: 20,
            color: "#1A3B34",
            marginBottom: 16,
          }}
        >
          Efficient Appointment Management
        </h3>
        <p style={{ color: "#4B5C58", fontSize: 16, lineHeight: 1.6 }}>
          Access your schedule anytime, anywhere with live updates on your
          appointments.
        </p>
      </Card>
    </Col>
    <Col xs={24} md={6}>
      <Card
        style={{
          textAlign: "center",
          height: "90%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          borderRadius: 12,
          padding: 24
        }}
      >
        <div
          style={{
            backgroundColor: "#EAFBF2",
            borderRadius: "50%",
            width: 60,
            height: 60,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 10px",
          }}
        >
          <ToolOutlined
            style={{
              fontSize: 28,
              color: "#6EDC8C",
            }}
          />
        </div>
        <h3
          style={{
            fontWeight: 600,
            fontSize: 20,
            color: "#1A3B34",
            marginBottom: 16,
          }}
        >
          Digital Tool for Practice Management
        </h3>
        <p style={{ color: "#4B5C58", fontSize: 16, lineHeight: 1.6 }}>
          VYDHYO offers all-in-one tools for easy, seamless patient care.
        </p>
      </Card>
    </Col>
    <Col xs={24} md={6}>
      <Card
        style={{
          textAlign: "center",
          height: "90%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          borderRadius: 12,
          padding: 24
        }}
      >
        <div
          style={{
            backgroundColor: "#EAFBF2",
            borderRadius: "50%",
            width: 60,
            height: 60,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
          }}
        >
          <EyeOutlined
            style={{
              fontSize: 28,
              color: "#6EDC8C",
            }}
          />
        </div>
        <h3
          style={{
            fontWeight: 600,
            fontSize: 20,
            color: "#1A3B34",
            marginBottom: 16,
          }}
        >
          Increased Visibility & Patient Reach
        </h3>
        <p style={{ color: "#4B5C58", fontSize: 16, lineHeight: 1.6 }}>
          Be seen. Be chosen. Go digital with Vydhyo.
        </p>
      </Card>
    </Col>
    <Col xs={24} md={6}>
      <Card
        style={{
          textAlign: "center",
          height: "90%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          borderRadius: 12,
          padding: 24
        }}
      >
        <div
          style={{
            backgroundColor: "#EAFBF2",
            borderRadius: "50%",
            width: 60,
            height: 60,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
          }}
        >
          <CheckOutlined
            style={{
              fontSize: 28,
              color: "#6EDC8C",
            }}
          />
        </div>
        <h3
          style={{
            fontWeight: 600,
            fontSize: 20,
            color: "#1A3B34",
            marginBottom: 10,
          }}
        >
          Consistent care with smart follow-ups
        </h3>
        <p style={{ color: "#4B5C58", fontSize: 16, lineHeight: 1.6 }}>
          Automated follow-up reminders ensure timely check-ins---building trust and long-term relationship.
        </p>
      </Card>
    </Col>
  </Row>
</section>

      {/* Why Choose */}
     <section style={{ backgroundColor: "#EAFBF2", padding: "64px 0" }}>
  <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 16px" }}>
    <h2
      style={{
        fontSize: screens.md ? 32 : 24,
        fontWeight: 700,
        textAlign: "center",
        color: "#1A3B34",
        marginBottom: 48,
      }}
    >
      Why Choose Vydhyo?
    </h2>
    <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
      <Col xs={24} sm={12} md={6}>
        <Card
          style={{
            textAlign: "center",
            borderRadius: 12,
            padding: 24,
            minHeight: 220,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <div
            style={{
              backgroundColor: "#6EDC8C",
              borderRadius: "50%",
              width: 48,
              height: 48,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <EyeOutlined style={{ color: "#fff", fontSize: 24 }} />
          </div>
          <p style={{ fontWeight: 600, color: "#1A3B34", marginBottom: 8, fontSize: 16 }}>
            Smart, Localized, Digital Profile
          </p>
          <p style={{ color: "#4B5C58", fontSize: 14, lineHeight: 1.5 }}>
            Geo-targeted, SEO-optimized, Telugu-friendly
          </p>
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card
          style={{
            textAlign: "center",
            borderRadius: 12,
            padding: 12,
            minHeight: 220,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <div
            style={{
              backgroundColor: "#6EDC8C",
              borderRadius: "50%",
              width: 48,
              height: 48,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <ClockCircleOutlined style={{ color: "#fff", fontSize: 24 }} />
          </div>
          <p style={{ fontWeight: 600, color: "#1A3B34", marginBottom: 8, fontSize: 16 }}>
            Intelligent Appointment Engine
          </p>
          <p style={{ color: "#4B5C58", fontSize: 14, lineHeight: 1.5 }}>
            Live slot booking via WhatsApp, IVR with local language support & APP
          </p>
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card
          style={{
            textAlign: "center",
            borderRadius: 12,
            padding: 24,
            minHeight: 220,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <div
            style={{
              backgroundColor: "#6EDC8C",
              borderRadius: "50%",
              width: 48,
              height: 48,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <UserOutlined style={{ color: "#fff", fontSize: 24 }} />
          </div>
          <p style={{ fontWeight: 600, color: "#1A3B34", marginBottom: 8, fontSize: 16 }}>
            Hyperlocal Patient Discovery
          </p>
          <p style={{ color: "#4B5C58", fontSize: 14, lineHeight: 1.5 }}>
            Be seen by local patients instantly
          </p>
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card
          style={{
            textAlign: "center",
            borderRadius: 12,
            padding: 24,
            minHeight: 220,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <div
            style={{
              backgroundColor: "#6EDC8C",
              borderRadius: "50%",
              width: 48,
              height: 48,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <StarFilled style={{ color: "#fff", fontSize: 24 }} />
          </div>
          <p style={{ fontWeight: 600, color: "#1A3B34", marginBottom: 8, fontSize: 16 }}>
            Connected Local Ecosystem
          </p>
          <p style={{ color: "#4B5C58", fontSize: 14, lineHeight: 1.5 }}>
            Labs, pharmacies & home care all in one flow
          </p>
        </Card>
      </Col>
    </Row>
    <Row gutter={[24, 24]}>
      <Col xs={24} sm={12} md={6}>
        <Card
          style={{
            textAlign: "center",
            borderRadius: 12,
            padding: 24,
            minHeight: 220,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <div
            style={{
              backgroundColor: "#6EDC8C",
              borderRadius: "50%",
              width: 48,
              height: 48,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <CheckOutlined style={{ color: "#fff", fontSize: 24 }} />
          </div>
          <p style={{ fontWeight: 600, color: "#1A3B34", marginBottom: 8, fontSize: 16 }}>
            Reputation Builder
          </p>
          <p style={{ color: "#4B5C58", fontSize: 14, lineHeight: 1.5 }}>
            Collect reviews & promote trust locally
          </p>
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card
          style={{
            textAlign: "center",
            borderRadius: 12,
            padding: 24,
            minHeight: 220,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <div
            style={{
              backgroundColor: "#6EDC8C",
              borderRadius: "50%",
              width: 48,
              height: 48,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <FundOutlined style={{ color: "#fff", fontSize: 24 }} />
          </div>
          <p style={{ fontWeight: 600, color: "#1A3B34", marginBottom: 8, fontSize: 16 }}>
            Practice Growth Tools
          </p>
          <p style={{ color: "#4B5C58", fontSize: 14, lineHeight: 1.5 }}>
            Digital branding, patient education & brand tools
          </p>
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card
          style={{
            textAlign: "center",
            borderRadius: 12,
            padding: 24,
            minHeight: 220,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <div
            style={{
              backgroundColor: "#6EDC8C",
              borderRadius: "50%",
              width: 48,
              height: 48,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <FormOutlined style={{ color: "#fff", fontSize: 24 }} />
          </div>
          <p style={{ fontWeight: 600, color: "#1A3B34", marginBottom: 8, fontSize: 16 }}>
            EMR + E-Prescriptions
          </p>
          <p style={{ color: "#4B5C58", fontSize: 14, lineHeight: 1.5 }}>
            Secure, digital prescriptions & patient records
          </p>
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card
          style={{
            textAlign: "center",
            borderRadius: 12,
            padding: 14,
            minHeight: 220,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <div
            style={{
              backgroundColor: "#6EDC8C",
              borderRadius: "50%",
              width: 48,
              height: 48,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 10px", // Adjusted to match original padding
            }}
          >
            <ToolOutlined style={{ color: "#fff", fontSize: 24 }} />
          </div>
          <p style={{ fontWeight: 600, color: "#1A3B34", marginBottom: 8, fontSize: 16 }}>
            CRM & Analytics Dashboard
          </p>
          <p style={{ color: "#4B5C58", fontSize: 14, lineHeight: 1.5 }}>
            Track visits, send reminders & grow repeat business
          </p>
        </Card>
      </Col>
    </Row>
  </div>
</section>
      {/* 3-Step Process */}
      <section style={{ padding: "20px 0" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 16px" }}>
          <h2
            style={{
              fontSize: screens.md ? 32 : 24,
              fontWeight: 700,
              textAlign: "center",
              color: "#1A3B34",
              marginBottom: 48,
            }}
          >
            Simple 3-Step Process
          </h2>
          <Row
            justify="space-between"
            align="middle"
            gutter={[16, 32]}
            style={{ textAlign: "center" }}
          >
            <Col xs={24} sm={8}>
              <div
                style={{
                  backgroundColor: "#6EDC8C",
                  color: "white",
                  borderRadius: "50%",
                  width: 48,
                  height: 48,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 600,
                  fontSize: 20,
                  margin: "0 auto 16px",
                }}
              >
                1
              </div>
              <p style={{ fontWeight: 600, color: "#1A3B34", marginBottom: 8, fontSize: 18 }}>
                Register
              </p>
              <p style={{ color: "#4B5C58", fontSize: 16, lineHeight: 1.5 }}>
                Kindly fill in your name, email address, phone number
              </p>
            </Col>
            <Col xs={24} sm={8}>
              <div
                style={{
                  backgroundColor: "#6EDC8C",
                  color: "white",
                  borderRadius: "50%",
                  width: 48,
                  height: 48,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 600,
                  fontSize: 20,
                  margin: "0 auto 16px",
                }}
              >
                2
              </div>
              <p style={{ fontWeight: 600, color: "#1A3B34", marginBottom: 8, fontSize: 18 }}>
                Add Profile Info
              </p>
              <p style={{ color: "#4B5C58", fontSize: 16, lineHeight: 1.5 }}>
                Kindly share your medical registration number, clinic timings,
                consultation fee, and practice details for your profile.
              </p>
            </Col>
            <Col xs={24} sm={8}>
              <div
                style={{
                  backgroundColor: "#6EDC8C",
                  color: "white",
                  borderRadius: "50%",
                  width: 48,
                  height: 48,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 600,
                  fontSize: 20,
                  margin: "0 auto 16px",
                }}
              >
                3
              </div>
              <p style={{ fontWeight: 600, color: "#1A3B34", marginBottom: 8, fontSize: 18 }}>
                Verify by Vydhyo
              </p>
              <p style={{ color: "#4B5C58", fontSize: 16, lineHeight: 1.5 }}>
                Once we verify online you are onboarded on Vydhyo
              </p>

            </Col>
          </Row>

          
        </div>

        <Button
                type="primary"
                style={{
                  backgroundColor: "#1A3B34",
                  fontWeight: 600,
                  padding: "0 24px",
                  height: 40,
                  fontSize: 16,
                  borderRadius: 8,
                  marginTop: 16,
                  marginLeft: "43%",
                }}
                onClick={handleJoinNow}
              >
                Be Part of Vydhyo
              </Button>

      </section>

      {/* Money & Tech Fee */}
      <section style={{ padding: "0px 0", backgroundColor: "#EAFBF2" }}>
        <Row
          align="middle"
          gutter={[32, 32]}
          style={{ maxWidth: 1000, margin: "0 auto", padding: "0 16px" }}
        >
          <Col xs={24} md={12}>
            <h3
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: "#1A3B34",
                marginBottom: 24,
              }}
            >
              Vydhyo Money & Zero Tech Fee
            </h3>
            <ul style={{ color: "#4B5C58", paddingLeft: 20, fontSize: 16, lineHeight: 1.8 }}>
              <li>Patients earn Vydhyo Money with every consultation</li>
              <li>No hidden technology fees</li>
              <li>Redeem rewards for future consultations</li>
            </ul>
          </Col>
          <Col xs={24} md={12} style={{ textAlign: "center" }}>
            <img
              src="/images/div (1).png"
              alt="Money Illustration"
              style={{ width: "100%", maxWidth: 800 }}
            />
          </Col>
        </Row>
      </section>

      {/* Data Security */}
      <section style={{ padding: "0px 0" }}>
        <Row
          align="middle"
          gutter={[32, 32]}
          style={{ maxWidth: 1000, margin: "0 auto", padding: "0 16px" }}
        >
          <Col xs={24} md={12} style={{ textAlign: "center", order: screens.md ? 0 : 1 }}>
            <img
              src="/images/div (2).png"
              alt="Security Illustration"
              style={{ width: "100%", maxWidth: 800 }}
            />
          </Col>
          <Col xs={24} md={12} style={{ order: screens.md ? 1 : 0 }}>
            <h3
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: "#1A3B34",
                marginBottom: 24,
              }}
            >
              Patient Data is Safe & Secure
            </h3>
            <ul style={{ color: "#4B5C58", paddingLeft: 20, fontSize: 16, lineHeight: 1.8 }}>
              <li>
                <strong>End-to-End Encryption</strong> - All communications are encrypted and secure
              </li>
              <li>
                <strong>HIPAA Compliant</strong> - Full compliance with healthcare privacy laws
              </li>
              <li>
                <strong>Multi-layered security</strong> with regular audits - Data stored on secure, certified servers
              </li>
            </ul>
          </Col>
        </Row>
      </section>

      {/* CTA */}
      <section
        style={{
          padding: "80px 0",
          // background: "linear-gradient(to bottom, #F8FCFA 0%, #EAFBF2 100%)",
          backgroundColor: "#EAFBF2",
        }}
      >
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center", padding: "0 16px", }}>
          <h2
            style={{
              fontSize: screens.md ? 36 : 28,
              fontWeight: 700,
              color: "#1A3B34",
              marginBottom: 24,
              lineHeight: 1.2
            }}
          >
            Ready to Amplify Your Digital Presence?
          </h2>
          <p style={{ 
            color: "#4B5C58", 
            marginBottom: 32,
            fontSize: 18,
            lineHeight: 1.6
          }}>
            Join Vydhyo to reclaim control of your practice
          </p>
          <Dropdown
            open={showDropdown}
            onOpenChange={setShowDropdown}
            dropdownRender={() => dropdownContent}
            placement="bottom"
          >
            <Button
              type="primary"
              size="large"
              style={{
                backgroundColor: "#1A3B34",
                fontWeight: 600,
                padding: "0 32px",
                height: 48,
                fontSize: 16,
                borderRadius: 8
              }}
              onClick={handleGetStarted}
            >
              Get Started Today
            </Button>
          </Dropdown>
        </div>
      </section>
 
      {/* Footer */}
      <footer
        style={{
          background: "#1A3B34",
          color: "#F8FCFA",
          padding: screens.md ? "30px 0 15px 0" : "48px 0 24px 0",
        }}
      >
        <div
          style={{
            maxWidth: 1400,
            margin: "0 auto",
            padding: "0 32px",
            display: "flex",
            flexDirection: screens.md ? "row" : "column",
            alignItems: screens.md ? "flex-start" : "center",
            justifyContent: "space-between",
            gap: screens.md ? 0 : 32,
          }}
        >
          {/* Logo and tagline */}
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
              <span style={{ 
                fontWeight: 700, 
                fontSize: 32, 
                color: "#F8FCFA", 
                marginRight: 8 
              }}>
                Vydhyo
              </span>
            </div>
            <div style={{ 
              color: "#B7EBD7", 
              fontSize: 18, 
              marginBottom: 0,
              fontWeight: 500 
            }}>
              for Healthcare
            </div>
          </div>
          
          {/* Links */}
          <div
            style={{
              flex: 2,
              display: "flex",
              flexDirection: screens.md ? "row" : "column",
              justifyContent: screens.md ? "flex-end" : "center",
              gap: screens.md ? 80 : 32,
              width: "100%",
              marginTop: screens.md ? 0 : 32,
            }}
          >
            <div>
              <div style={{ 
                fontWeight: 600, 
                fontSize: 18, 
                marginBottom: 16,
                color: "#fff"
              }}>
                Quick Links
              </div>
              <div style={{ marginBottom: 12 }}>
                <a href="/landingPage" style={{ 
                  color: "#F8FCFA", 
                  textDecoration: "none",
                  fontSize: 16,
                  opacity: 0.8,
                  ':hover': {
                    opacity: 1
                  }
                }}>Home</a>
              </div>
              <div style={{ marginBottom: 12 }}>
                <a href="/landingPage" style={{ 
                  color: "#F8FCFA", 
                  textDecoration: "none",
                  fontSize: 16,
                  opacity: 0.8
                }}>About</a>
              </div>
              <div>
                <a href="/landingPage" style={{ 
                  color: "#F8FCFA", 
                  textDecoration: "none",
                  fontSize: 16,
                  opacity: 0.8
                }}>Contact</a>
              </div>
            </div>
            <div>
              <div style={{ 
                fontWeight: 600, 
                fontSize: 18, 
                marginBottom: 16,
                color: "#fff"
              }}>
                Support
              </div>
              <div style={{ marginBottom: 12 }}>
                <a href="/landingPage" style={{ 
                  color: "#F8FCFA", 
                  textDecoration: "none",
                  fontSize: 16,
                  opacity: 0.8
                }}>Help Center</a>
              </div>
              <div style={{ marginBottom: 12 }}>
                <a href="/landingPage" style={{ 
                  color: "#F8FCFA", 
                  textDecoration: "none",
                  fontSize: 16,
                  opacity: 0.8
                }}>Privacy Policy</a>
              </div>
              <div>
                <a href="/landingPage" style={{ 
                  color: "#F8FCFA", 
                  textDecoration: "none",
                  fontSize: 16,
                  opacity: 0.8
                }}>Terms</a>
              </div>
            </div>
            <div>
              <div style={{ 
                fontWeight: 600, 
                fontSize: 18, 
                marginBottom: 16,
                color: "#fff"
              }}>
                Contact
              </div>
              <div style={{ marginBottom: 12 }}>
                <a href="mailto:support@vydhyo.com" style={{ 
                  color: "#F8FCFA", 
                  textDecoration: "none",
                  fontSize: 16,
                  opacity: 0.8
                }}>
                  support@vydhyo.com
                </a>
              </div>
              <div>
                <span style={{ 
                  color: "#F8FCFA", 
                  fontSize: 16,
                  opacity: 0.8
                }}>+1 234 567 890</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Copyright */}
        {/* <div style={{
          textAlign: "center",
          marginTop: 48,
          paddingTop: 24,
          borderTop: "1px solid rgba(255,255,255,0.1)",
          color: "rgba(255,255,255,0.6)",
          fontSize: 14
        }}>
          © {new Date().getFullYear()} Vydhyo. All rights reserved.
        </div> */}
      </footer>
    </div>
  );
};

export default AdvertisingDoctorsPage;