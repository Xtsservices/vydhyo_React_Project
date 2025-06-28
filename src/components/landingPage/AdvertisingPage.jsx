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
    <Card style={{ width: screens.xs ? 300 : 400 }}>
      <div style={{ textAlign: "center" }}>
        <Button
          type="primary"
          style={{ backgroundColor: "#4A90E2", marginBottom: 16 }}
        >
          GET THE APP
        </Button>
        <h3 style={{ color: "#1A3B34", marginBottom: 8 }}>
          Coming soon Vydhyo - India's Trusted Doctors App!
        </h3>
        <p style={{ color: "#4B5C58", marginBottom: 24 }}>
          Connect with 10,000+ verified doctors across India. Book instant video
          consultations, order medicines, get lab tests done, and access your
          health records - all in one app. Available in Hindi, English, and 8
          other Indian languages.
        </p>

        <Space size={16} style={{ marginBottom: 20 }}>
          <Button
            icon={<AndroidFilled />}
            style={{ backgroundColor: "#000", color: "#fff" , height: 45}}
          >
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: 10 }}>GET IT ON</div>
              <div style={{ fontWeight: "bold" }}>Google Play</div>
            </div>
          </Button>
          <Button
            icon={<AppleFilled />}
            style={{ backgroundColor: "#000", color: "#fff", height: 45 }}
          >
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: 10 }}>Download on the</div>
              <div style={{ fontWeight: "bold" }}>App Store</div>
            </div>
          </Button>
        </Space>

        <Space size={24} style={{ fontSize: 12, color: "#4B5C58" }}>
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
        padding: "10px 30px",
        boxShadow: "0 1px 4px rgba(0,21,41,.08)",
        position: "sticky",
        top: 0,
        zIndex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <img
            src="/images/vydh_logo.png"
            alt="Vydhyo Logo"
            style={{ height: "100px",marginTop: "10px", marginRight: "16px" }}
          />
        </div>
        <Button
          type="primary"
          style={{
            backgroundColor: "#1A3B34",
            fontWeight: "bold",
          }}
          onClick={handleLogin}
        >
          Login
        </Button>
      </Header>

      {/* Hero Section */}
      <section style={{ padding: screens.xs ? "24px 0" : "48px 0" }}>
        <Row
          justify="space-between"
          align="middle"
          style={{ maxWidth: 1200, margin: "0 auto", padding: "0 16px" }}
        >
          <Col xs={24} md={12} style={{ paddingLeft: screens.md ? 50 : 16 }}>
            <h1
              style={{
                fontSize: screens.md ? 36 : 28,
                fontWeight: "bold",
                color: "#1A3B34",
                marginBottom: 16,
              }}
            >
              Helping Doctors <br /> Bring Trust Care <br />
              Closer,Faster & Smarter
            </h1>
            <p
              style={{
                color: "#4B5C58",
                marginBottom: 24,
                maxWidth: 500,
              }}
            >
              With Growing cities and rising expectations, patients seek
              instant, guaranteed appointment an minimal wait times, while doctor
              want predictable OPDs, steady revenue, and digital visibility
            </p>
            <p>
              <h3>Vydhyo</h3> - build by doctors for Doctors in tier2/3 cities -
              offers an all-in-one solution.
            </p>
            <p>Join now or free to bring your journey with</p>
            <br />
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
                  fontWeight: "bold",
                  padding: "0 32px",
                  height: 48,
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
                width: screens.md ? 420 : 340,
                filter: "drop-shadow(0 10px 8px rgba(0,0,0,0.1))",
              }}
            />
          </Col>
        </Row>
      </section>

      {/* Features */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 16px" }}>
        <Row gutter={[24, 24]}>
          <Col xs={24} md={8}>
            <Card
              style={{
                textAlign: "center",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  backgroundColor: "#EAFBF2",
                  borderRadius: "50%",
                  padding: 12,
                  marginBottom: 12,
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
                  fontWeight: "600",
                  fontSize: 18,
                  color: "#1A3B34",
                  marginBottom: 8,
                }}
              >
                Efficient Appointment Management
              </h3>
              <p style={{ color: "#4B5C58", fontSize: 14 }}>
                Access your schedule anytime,anywhere live updates on your
                appointments.
              </p>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card
              style={{
                textAlign: "center",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  backgroundColor: "#EAFBF2",
                  borderRadius: "50%",
                  padding: 12,
                  marginBottom: 12,
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
                  fontWeight: "600",
                  fontSize: 18,
                  color: "#1A3B34",
                  marginBottom: 8,
                }}
              >
                Digital Tool for Practice Management
              </h3>
              <p style={{ color: "#4B5C58", fontSize: 14 }}>
                VYDHYO offers all - in -one tools for easy,seemles patient care.
              </p>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card
              style={{
                textAlign: "center",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  backgroundColor: "#EAFBF2",
                  borderRadius: "50%",
                  padding: 12,
                  marginBottom: 12,
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
                  fontWeight: "600",
                  fontSize: 18,
                  color: "#1A3B34",
                  marginBottom: 8,
                }}
              >
                Increased Visibility & Patient reach
              </h3>
              <p style={{ color: "#4B5C58", fontSize: 14 }}>
                BE seen . BE chosen. Go digital with Vydhyo.
              </p>
            </Card>
          </Col>
        </Row>
      </section>

      {/* Why Choose */}
      <section style={{ backgroundColor: "#EAFBF2", padding: "40px 0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 16px" }}>
          <h2
            style={{
              fontSize: screens.md ? 24 : 20,
              fontWeight: "600",
              textAlign: "center",
              color: "#1A3B34",
              marginBottom: 32,
            }}
          >
            Why Choose Vydhyo?
          </h2>
          <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
            <Col xs={24} sm={12} md={6}>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontWeight: "bold", color: "#1A3B34", marginBottom: 4 }}>
                  Smart, Localized, Digital profile
                </p>
                <p style={{ color: "#4B5C58", fontSize: 12 }}>
                  Geo-targeted, SEO-optimized, Telugu-friendly
                </p>
              </div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontWeight: "bold", color: "#1A3B34", marginBottom: 4 }}>
                  Intelligent Appointment Engine
                </p>
                <p style={{ color: "#4B5C58", fontSize: 12 }}>
                  Live slot booking via WhatsApp, IVR thru local language support
                  & APP
                </p>
              </div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontWeight: "bold", color: "#1A3B34", marginBottom: 4 }}>
                  Hyperlocal Patient Discovery
                </p>
                <p style={{ color: "#4B5C58", fontSize: 12 }}>
                  Be seen by local patients instantly
                </p>
              </div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontWeight: "bold", color: "#1A3B34", marginBottom: 4 }}>
                  Connected Local Ecosystem
                </p>
                <p style={{ color: "#4B5C58", fontSize: 12 }}>
                  Labs, pharmacies & home care all in one flow
                </p>
              </div>
            </Col>
          </Row>
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={12} md={6}>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontWeight: "bold", color: "#1A3B34", marginBottom: 4 }}>
                  Reputation Builder
                </p>
                <p style={{ color: "#4B5C58", fontSize: 12 }}>
                  Collect reviews & promote trust locally
                </p>
              </div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontWeight: "bold", color: "#1A3B34", marginBottom: 4 }}>
                  Practice Growth Tools
                </p>
                <p style={{ color: "#4B5C58", fontSize: 12 }}>
                  Digital branding, patient education & brand tools
                </p>
              </div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontWeight: "bold", color: "#1A3B34", marginBottom: 4 }}>
                  EMR + E-Prescriptions
                </p>
                <p style={{ color: "#4B5C58", fontSize: 12 }}>
                  Secure, digital prescriptions & patient records
                </p>
              </div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontWeight: "bold", color: "#1A3B34", marginBottom: 4 }}>
                  CRM & Analytics Dashboard
                </p>
                <p style={{ color: "#4B5C58", fontSize: 12 }}>
                  Track visits, send reminders & grow repeat business
                </p>
              </div>
            </Col>
          </Row>
        </div>
      </section>

      {/* 3-Step Process */}
      <section style={{ padding: "48px 0" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 16px" }}>
          <h2
            style={{
              fontSize: screens.md ? 24 : 20,
              fontWeight: "600",
              textAlign: "center",
              color: "#1A3B34",
              marginBottom: 32,
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
                  width: 40,
                  height: 40,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold",
                  margin: "0 auto 8px",
                }}
              >
                1
              </div>
              <p style={{ fontWeight: "600", color: "#1A3B34", marginBottom: 4 }}>
                Register
              </p>
              <p style={{ color: "#4B5C58", fontSize: 12 }}>
                Kindly fill in your name, email address, phone number
              </p>
            </Col>
            <Col xs={24} sm={8}>
              <div
                style={{
                  backgroundColor: "#6EDC8C",
                  color: "white",
                  borderRadius: "50%",
                  width: 40,
                  height: 40,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold",
                  margin: "0 auto 8px",
                }}
              >
                2
              </div>
              <p style={{ fontWeight: "600", color: "#1A3B34", marginBottom: 4 }}>
                Add Profile Info
              </p>
              <p style={{ color: "#4B5C58", fontSize: 12 }}>
                Kindly Share your medical registration number, clinic timings,
                consultation fee, and practice details for your profile.
              </p>
            </Col>
            <Col xs={24} sm={8}>
              <div
                style={{
                  backgroundColor: "#6EDC8C",
                  color: "white",
                  borderRadius: "50%",
                  width: 40,
                  height: 40,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold",
                  margin: "0 auto 8px",
                }}
              >
                3
              </div>
              <p style={{ fontWeight: "600", color: "#1A3B34", marginBottom: 4 }}>
                Verify by Vydhyo
              </p>
              <p style={{ color: "#4B5C58", fontSize: 12 }}>
                Once we verify online you are on-boarded on vydhyo
              </p>
            </Col>
          </Row>
        </div>
      </section>

      {/* Money & Tech Fee */}
      <section style={{ padding: "40px 0" }}>
        <Row
          align="middle"
          gutter={[32, 32]}
          style={{ maxWidth: 1000, margin: "0 auto", padding: "0 16px" }}
        >
          <Col xs={24} md={12}>
            <h3
              style={{
                fontSize: 18,
                fontWeight: "600",
                color: "#1A3B34",
                marginBottom: 12,
              }}
            >
              Vydhyo Money & Zero Tech Fee
            </h3>
            <ul style={{ color: "#4B5C58", paddingLeft: 20 }}>
              <li>Patient Earn Vydhyo Money with every consultation</li>
              <li>No hidden technology fees</li>
              <li>Redeem rewards for future consultations</li>
            </ul>
          </Col>
          <Col xs={24} md={12} style={{ textAlign: "center" }}>
            <img
              src="/images/div (1).png"
              alt="Money Illustration"
              style={{ width: screens.md ? 280 : 220 }}
            />
          </Col>
        </Row>
      </section>

      {/* Data Security */}
      <section style={{ padding: "40px 0" }}>
        <Row
          align="middle"
          gutter={[32, 32]}
          style={{ maxWidth: 1000, margin: "0 auto", padding: "0 16px" }}
        >
          <Col xs={24} md={12} style={{ textAlign: "center", order: screens.md ? 0 : 1 }}>
            <img
              src="/images/div (2).png"
              alt="Security Illustration"
              style={{ width: screens.md ? 280 : 220 }}
            />
          </Col>
          <Col xs={24} md={12} style={{ order: screens.md ? 1 : 0 }}>
            <h3
              style={{
                fontSize: 18,
                fontWeight: "600",
                color: "#1A3B34",
                marginBottom: 12,
              }}
            >
              Patient Data is Safe & Secure
            </h3>
            <ul style={{ color: "#4B5C58", paddingLeft: 20 }}>
              <li>
                End-to-End Encryption - <br />
                All communications are encrypted and secure
              </li>
              <li>
                HIPAA Compliant - <br />
                Full compliance with healthcare privacy laws
              </li>
              <li>
                Multi-layered security with regular audits - <br />
                Data stored on secure, certified servers
              </li>
            </ul>
          </Col>
        </Row>
      </section>

      {/* CTA */}
      <section
        style={{
          padding: "48px 0",
          background:
            "linear-gradient(to bottom, #F8FCFA 0%, #EAFBF2 100%)",
        }}
      >
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
          <h2
            style={{
              fontSize: screens.md ? 28 : 24,
              fontWeight: "bold",
              color: "#1A3B34",
              marginBottom: 16,
            }}
          >
            Ready to Amplify your digital presence
          </h2>
          <p style={{ color: "#4B5C58", marginBottom: 24 }}>
            Join vydhyo to reclaim control of your practice
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
                fontWeight: "bold",
                padding: "0 32px",
                height: 48,
              }}
              onClick={handleGetStarted}
            >
              Get Started Today
            </Button>
          </Dropdown>
        </div>
      </section>
 
        {/* footer */}
        <footer
        style={{
          background: "#1A3B34",
          color: "#F8FCFA",
          padding: screens.md ? "48px 0 24px 0" : "32px 0 16px 0",
          marginTop: 0,
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
              <span style={{ fontWeight: "bold", fontSize: 32, color: "#F8FCFA", marginRight: 8 }}>
                Vydhyo
              </span>
            </div>
            <div style={{ color: "#B7EBD7", fontSize: 18, marginBottom: 0 }}>
              for Healthcare
            </div>
            {/* <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: "#111C18",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 32,
                color: "#F8FCFA",
                border: "2px solid #222",
                marginBottom: 8,
              }}
            >
              N
            </div> */}
          </div>
          {/* Links */}
          <div
            style={{
              flex: 2,
              display: "flex",
              flexDirection: screens.md ? "row" : "column",
              justifyContent: screens.md ? "flex-end" : "center",
              gap: screens.md ? 80 : 24,
              width: "100%",
              marginTop: screens.md ? 0 : 24,
            }}
          >
            <div>
              <div style={{ fontWeight: "bold", fontSize: 22, marginBottom: 12 }}>
                Quick Links
              </div>
              <div style={{ marginBottom: 8 }}>
                <a href="/" style={{ color: "#F8FCFA", textDecoration: "none" }}>Home</a>
              </div>
              <div style={{ marginBottom: 8 }}>
                <a href="/about" style={{ color: "#F8FCFA", textDecoration: "none" }}>About</a>
              </div>
              <div>
                <a href="/contact" style={{ color: "#F8FCFA", textDecoration: "none" }}>Contact</a>
              </div>
            </div>
            <div>
              <div style={{ fontWeight: "bold", fontSize: 22, marginBottom: 12 }}>
                Support
              </div>
              <div style={{ marginBottom: 8 }}>
                <a href="/help" style={{ color: "#F8FCFA", textDecoration: "none" }}>Help Center</a>
              </div>
              <div style={{ marginBottom: 8 }}>
                <a href="/privacy" style={{ color: "#F8FCFA", textDecoration: "none" }}>Privacy Policy</a>
              </div>
              <div>
                <a href="/terms" style={{ color: "#F8FCFA", textDecoration: "none" }}>Terms</a>
              </div>
            </div>
            <div>
              <div style={{ fontWeight: "bold", fontSize: 22, marginBottom: 12 }}>
                Contact
              </div>
              <div style={{ marginBottom: 8 }}>
                <a href="mailto:support@vydhyo.com" style={{ color: "#F8FCFA", textDecoration: "none" }}>
                  support@vydhyo.com
                </a>
              </div>
              <div>
                <span style={{ color: "#F8FCFA" }}>+1 234 567 890</span>
              </div>
            </div>
          </div>
        </div>
      </footer>


    </div>
  );
};

export default AdvertisingDoctorsPage;