import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Layout,
  Row,
  Col,
  Button,
  Avatar,
  Dropdown,
  Menu,
  Grid,
  Space,
} from "antd";
import {
  UserOutlined,
  MenuOutlined,
  DownOutlined,
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

  const menu = (
    <Menu>
      <Menu.Item
        key="1"
        onClick={() => handleRedirect("/landingPage")}
        style={{ padding: "8px 16px" }}
      >
        For Doctors
      </Menu.Item>
      <Menu.Item
        key="2"
        onClick={() => handleRedirect("/patients")}
        style={{ padding: "8px 16px" }}
      >
        For Patients
      </Menu.Item>
    </Menu>
  );

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
                src="/images/vydh_logo.png" // Updated path (ensure the image exists in public/images/)
                alt="Logo"
                style={{
                  width: screens.xs ? 80 : 120,
                  height: screens.xs ? 80 : 120,
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
                <Dropdown
                  overlay={menu}
                  trigger={["click"]}
                  placement="bottomRight"
                >
                  <Button
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
                    <DownOutlined style={{ fontSize: 12 }} />
                  </Button>
                </Dropdown>
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