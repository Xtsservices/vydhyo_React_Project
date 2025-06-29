import { useState, useEffect } from "react";
import { Layout, Menu, Avatar, Badge, Dropdown } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faTachometerAlt,
  faCalendarCheck,
  faUsers,
  faUserInjured,
  faCog,
  faCalendarAlt,
  faFileInvoice,
  faEnvelope,
  faSignOutAlt,
  faUser,
  faWalking,
  faBell,
} from "@fortawesome/free-solid-svg-icons";
import { Link, Outlet ,useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import logo from "../assets/logooo.png"; // Adjust path relative to your component

const { Header, Sider, Content, Footer } = Layout;

const DoctorLayoutWrapper = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [selectedKey, setSelectedKey] = useState("dashboard");
  const user = useSelector((state) => state.currentUserData);
  const navigate = useNavigate();
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setCollapsed(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const handleMenuClick = ({ key }) => {
    setSelectedKey(key);
    if (key === "logout") {
      handleLogout();
    }
  };

   const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };


  const getProfileImage = (user) => {
    if (user?.profilepic?.data && user?.profilepic?.mimeType) {
      return `data:${user.profilepic.mimeType};base64,${user.profilepic.data}`;
    }
    return null;
  };

  const profileImageSrc = getProfileImage(user);

  const menuItems = [
    {
      key: "dashboard",
      label: <Link to="/doctor/Dashboard">Dashboard</Link>,
      icon: (
        <FontAwesomeIcon icon={faTachometerAlt} style={{ color: "#ffffff" }} />
      ),
    },
    {
      key: "appointments",
      label: <Link to="/doctor/doctorPages/Appointments">Appointments</Link>,
      icon: (
        <FontAwesomeIcon icon={faCalendarCheck} style={{ color: "#ffffff" }} />
      ),
    },
    {
      key: "my-patients",
      label: <Link to="/doctor/doctorPages/Patients">My Patients</Link>,
      icon: <FontAwesomeIcon icon={faUsers} style={{ color: "#ffffff" }} />,
    },
    {
      key: "walkin-patients",
      label: <Link to="/doctor/doctorPages/Walkin">Walkin Patients</Link>,
      icon: <FontAwesomeIcon icon={faWalking} style={{ color: "#ffffff" }} />,
    },
    {
      key: "staff-management",
      label: (
        <Link to="/doctor/doctorPages/staffManagement">Staff Management</Link>
      ),
      icon: <FontAwesomeIcon icon={faCog} style={{ color: "#ffffff" }} />,
    },
    {
      key: "availability",
      label: <Link to="/doctor/doctorPages/Availability">Availability</Link>,
      icon: (
        <FontAwesomeIcon icon={faCalendarAlt} style={{ color: "#ffffff" }} />
      ),
    },
    {
      key: "accounts",
      label: <Link to="/doctor/doctorPages/Accounts">Accounts</Link>,
      icon: (
        <FontAwesomeIcon icon={faFileInvoice} style={{ color: "#ffffff" }} />
      ),
    },
    {
      key: "invoices",
      label: <Link to="/doctor/doctorPages/Invoices">Invoices</Link>,
      icon: (
        <FontAwesomeIcon icon={faFileInvoice} style={{ color: "#ffffff" }} />
      ),
    },
    {
      key: "messages",
      label: <Link to="/doctor/doctorPages/Messages">Messages</Link>,
      icon: <FontAwesomeIcon icon={faEnvelope} style={{ color: "#ffffff" }} />,
    },
     {
      key: "logout",
      label: <span onClick={handleLogout}>Logout</span>,
      icon: (
        <FontAwesomeIcon icon={faSignOutAlt} style={{ color: "#ffffff" }} />
      ),
    },
  ];

  // Dropdown menu for profile
  const profileMenu = (
    <Menu
      style={{
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
      }}
    >
      <Menu.Item key="logout" onClick={handleLogout}>
        <FontAwesomeIcon icon={faSignOutAlt} style={{ marginRight: 8 }} />
        Logout
      </Menu.Item>
    </Menu>
  );


  return (
    <Layout className="layout">
      <Header
        className="header"
        style={{
          background: "#ffffff",
          padding: "0 24px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          borderBottom: "1px solid #f0f0f0",
          zIndex: 1001,
          position: "fixed",
          width: "100%",
          top: 0,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* Left side - Logo and hamburger */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <FontAwesomeIcon
            icon={faBars}
            className="toggle-button"
            onClick={toggleSidebar}
            style={{
              marginRight: 24,
              color: "#64748b",
              cursor: "pointer",
              fontSize: "16px",
            }}
          />
          <div className="logo">
            <img
              src={logo}
              alt="VYDHYO Logo"
              style={{
                height: "120px",
                width: "auto",
                objectFit: "contain",
              }}
            />
          </div>
        </div>

        {/* Right side - Notifications and User Profile */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "24px",
            marginLeft: "auto",
          }}
        >
          {/* Notification Bell */}
          <Badge
            count={5}
            size="small"
            style={{
              cursor: "pointer",
              marginRight: "8px",
            }}
          >
            <FontAwesomeIcon
              icon={faBell}
              style={{
                fontSize: "18px",
                color: "#64748b",
              }}
            />
          </Badge>

          {/* User Profile Section with Dropdown */}
          <Dropdown overlay={profileMenu} trigger={["click"]}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "8px 12px",
                borderRadius: "8px",
                background: "#f8fafc",
                cursor: "pointer",
                marginLeft: "8px",
              }}
            >
              <Avatar
                size={32}
                src={profileImageSrc}
                icon={!profileImageSrc && <FontAwesomeIcon icon={faUser} />}
                style={{
                  backgroundColor: "#e2e8f0",
                  color: "#64748b",
                }}
              />
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#1e293b",
                    lineHeight: "1.2",
                  }}
                >
                  Dr. {user?.firstname || "Arvind"} {user?.lastname || "Sharma"}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#64748b",
                    lineHeight: "1.2",
                  }}
                >
                  {user?.role || "Doctor"}
                </div>
              </div>
            </div>
          </Dropdown>
        </div>
      </Header>

      <Layout>
        <Sider
          className="sider"
          collapsed={collapsed || (isMobile && !collapsed)}
          collapsible
          trigger={null}
          width={250}
          collapsedWidth={80}
          breakpoint="lg"
          onBreakpoint={(broken) => setIsMobile(broken)}
          style={{
            overflow: "auto",
            height: "calc(100vh - 64px)",
            position: "fixed",
            left: 0,
            top: 64,
            zIndex: 1000,
            display: isMobile && collapsed ? "none" : "block",
            background: "#334155",
            boxShadow: "2px 0 8px rgba(0,0,0,0.15)",
          }}
        >
          <motion.div
            initial={{ x: -200 }}
            animate={{ x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Doctor Profile Section - Shown only when not collapsed */}
            {!collapsed && (
              <div
                style={{
                  background: "#334155",
                  padding: "32px 16px 24px 16px",
                  textAlign: "center",
                  borderBottom: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <Avatar
                  size={80}
                  src={profileImageSrc}
                  icon={!profileImageSrc && <FontAwesomeIcon icon={faUser} />}
                  style={{
                    backgroundColor: "#4a5568",
                    marginBottom: 16,
                    border: "3px solid rgba(255,255,255,0.2)",
                  }}
                />
                <div
                  style={{
                    fontSize: "16px",
                    fontWeight: "600",
                    marginBottom: 6,
                    color: "#ffffff",
                  }}
                >
                  {user?.firstname || "Doctor"}
                </div>
                <div
                  style={{
                    color: "rgba(255,255,255,0.7)",
                    fontSize: "13px",
                    fontWeight: "400",
                  }}
                >
                  {user?.specialization?.name || "Department"}
                </div>
              </div>
            )}

            {/* Navigation Menu */}
            <Menu
              mode="inline"
              selectedKeys={[selectedKey]}
              onClick={handleMenuClick}
              style={{
                border: "none",
                background: "#334155",
                color: "#ffffff",
                fontSize: "14px",
              }}
              theme="dark"
            >
              {menuItems.map((item) => (
                <Menu.Item
                  key={item.key}
                  icon={item.icon}
                  style={{
                    color: "#ffffff",
                    height: "48px",
                    lineHeight: "48px",
                    margin: "2px 8px",
                    borderRadius: "6px",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      marginLeft: "8px",
                      color: "#ffffff",
                      fontWeight: "500",
                    }}
                  >
                    {item.label}
                  </span>
                </Menu.Item>
              ))}
            </Menu>
          </motion.div>
        </Sider>

        <Layout
          style={{
            marginLeft: isMobile ? 0 : collapsed ? 80 : 250,
            marginTop: 64,
            transition: "margin-left 0.2s",
            minHeight: "calc(100vh - 64px - 48px)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Content className="content" style={{ flex: 1 }}>
            <Outlet />
          </Content>
          <Footer className="footer">
            VYDHYO © {new Date().getFullYear()} connect. care. cure
          </Footer>
        </Layout>
      </Layout>

      <style jsx>{`
        .ant-menu-dark .ant-menu-item-selected {
          background-color: rgba(59, 130, 246, 0.8) !important;
        }

        .ant-menu-dark .ant-menu-item:hover {
          background-color: rgba(255, 255, 255, 0.1) !important;
        }

        .ant-menu-dark .ant-menu-item {
          border-radius: 6px !important;
          margin: 2px 8px !important;
        }

        .ant-menu-dark .ant-menu-item a {
          color: #ffffff !important;
          text-decoration: none;
        }

        .ant-menu-dark .ant-menu-item-selected a {
          color: #ffffff !important;
        }

        .toggle-button:hover {
          color: #1e40af !important;
        }
      `}</style>
    </Layout>
  );
};

export default DoctorLayoutWrapper;