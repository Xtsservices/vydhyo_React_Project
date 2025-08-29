import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Layout,
  Row,
  Col,
  Button,
  Avatar,
  Grid,
  Space,
} from "antd";
import {
  UserOutlined,
  MenuOutlined,
  DownloadOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import LandingPage1 from "./LandingPage1";

const { Header: AntHeader } = Layout;
const { useBreakpoint } = Grid;

const Header = () => {
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleRedirect = (path) => {
    navigate(path);
    setMenuOpen(false); // Close the menu after navigation
  };

  return (
    <>
      <AntHeader
        style={{
          background: "#fff",
          boxShadow: "0 2px 8px #f0f1f2",
          position: "sticky",
          top: 0,
          zIndex: 100,
          padding: "0 24px",
          height: "auto",
          lineHeight: "normal",
        }}
      >
        <Row align="middle" justify="space-between">
          {/* Logo */}
          <Col>
            <Space align="center">
              <img
                src="/images/pic1.png" // Updated path (ensure the image exists in public/images/)
                alt="Logo"
                style={{
                  height: screens.xs ? "180px" : "167px",
                  marginBottom: screens.xs ? "-60px" : "-50px",
                  marginRight: screens.xs ? "8px" : "16px",
                  marginTop: screens.xs ? "-50px" : "-34px",
                  objectFit: "contain",
                  borderRadius: 12,
                }}
              />
            </Space>
          </Col>

          {/* Mobile Menu Button */}
          <Col>
            {screens.xs && (
              <Button
                type="text"
                icon={<MenuOutlined />}
                onClick={() => setMenuOpen(!menuOpen)}
                style={{ fontSize: "24px" }} // Increase visibility of the menu button
              />
            )}
          </Col>

          {/* Navigation Items */}
          <Col
            xs={24}
            sm={16}
            md={18}
            lg={18}
            xl={18}
            style={{
              display: screens.xs ? (menuOpen ? "block" : "none") : "block", // Show nav items based on menuOpen for xs screens
              marginTop: screens.xs ? 12 : 0,
            }}
          >
            <Row
              gutter={[16, 16]}
              justify={screens.xs ? "start" : "end"}
              align="middle"
            >
              <Col>
                <Button
                  type="primary"
                  shape="round"
                  style={{
                    background: "linear-gradient(135deg, #ff6b35, #f7931e)",
                    boxShadow: "0 3px 10px rgba(255,107,53,0.2)",
                  }}
                >
                  ABHA
                </Button>
              </Col>

              <Col>
                <Button shape="round" icon={<TeamOutlined />}>
                  For Partners
                </Button>
              </Col>

              <Col>
                <Button shape="round" icon={<DownloadOutlined />}>
                  Download the App
                </Button>
              </Col>

              <Col>
                <Button
                  onClick={() => handleRedirect("/landingPage")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "6px 12px",
                    background: "#f8f9fa",
                    borderRadius: 24,
                    height: 45,
                    border: "1px solid #e9ecef",
                  }}
                >
                  <Avatar
                    size={32}
                    icon={<UserOutlined />}
                    style={{
                      background: "linear-gradient(135deg, #667eea, #764ba2)",
                    }}
                  />
                  <span style={{ fontWeight: 600 }}>Login</span>
                </Button>
              </Col>
            </Row>
          </Col>
        </Row>
      </AntHeader>

      <LandingPage1 />
    </>
  );
};

export default Header;