import { useState, useEffect } from "react";
import { Layout, Menu, Avatar } from "antd";
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
} from "@fortawesome/free-solid-svg-icons";
import { Link, Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";

const { Header, Sider, Content, Footer } = Layout;

const DoctorLayoutWrapper = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [selectedKey, setSelectedKey] = useState("dashboard"); // Track selected menu item
  const user = useSelector((state) => state.currentUserData);
  console.log("User Data:============", user);
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
    setSelectedKey(key); // Update selected key when a menu item is clicked
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
        <FontAwesomeIcon icon={faTachometerAlt} style={{ color: "#1976D2" }} />
      ),
    },
    {
      key: "appointments",
      label: <Link to="/doctor/doctorPages/Appointments">Appointments</Link>,
      icon: (
        <FontAwesomeIcon icon={faCalendarCheck} style={{ color: "#666" }} />
      ),
    },
    {
      key: "my-patients",
      label: <Link to="/doctor/doctorPages/Patients">My Patients</Link>,
      icon: <FontAwesomeIcon icon={faUsers} style={{ color: "#666" }} />,
    },
    {
      key: "walkin-patients",
      label: <Link to="/doctor/doctorPages/Walkin">Walkin Patients</Link>,
      icon: <FontAwesomeIcon icon={faWalking} style={{ color: "#666" }} />,
    },
    {
      key: "staff-management",
      label: (
        <Link to="/doctor/doctorPages/staffManagement">Staff Management</Link>
      ),
      icon: <FontAwesomeIcon icon={faCog} style={{ color: "#666" }} />,
    },
    {
      key: "availability",
      label: <Link to="/doctor/doctorPages/Availability">Availability</Link>,
      icon: <FontAwesomeIcon icon={faCalendarAlt} style={{ color: "#666" }} />,
    },
    {
      key: "accounts",
      label: <Link to="/doctor/doctorPages/Accounts">Accounts</Link>,
      icon: <FontAwesomeIcon icon={faFileInvoice} style={{ color: "#666" }} />,
    },
    {
      key: "invoices",
      label: <Link to="/doctor/doctorPages/Invoices">Invoices</Link>,
      icon: <FontAwesomeIcon icon={faFileInvoice} style={{ color: "#666" }} />,
    },
    {
      key: "messages",
      label: <Link to="/doctor/doctorPages/Messages">Messages</Link>,
      icon: <FontAwesomeIcon icon={faEnvelope} style={{ color: "#666" }} />,
    },
    {
      key: "logout",
      label: <Link to="/logout">Logout</Link>,
      icon: <FontAwesomeIcon icon={faSignOutAlt} style={{ color: "#666" }} />,
    },
  ];

  return (
    <Layout className="layout">
      <Header className="header">
        <div style={{ display: "flex", alignItems: "center" }}>
          <FontAwesomeIcon
            icon={faBars}
            className="toggle-button"
            onClick={toggleSidebar}
            style={{ marginRight: 16, color: "#fff" }}
          />
          <div className="logo" style={{ marginRight: 16 }}>
            <img
              src="https://img.freepik.com/free-vector/bird-colorful-logo-gradient-vector_343694-1365.jpg?semt=ais_hybrid&w=740"
              alt="My App Logo"
              style={{ height: 40, width: "auto" }}
            />
          </div>
          <h1 style={{ color: "#fff", margin: 0 }}>My App</h1>
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
            bottom: 0,
            zIndex: 1000,
            display: isMobile && collapsed ? "none" : "block",
            background: "#fff",
          }}
        >
          <motion.div
            initial={{ x: -200 }}
            animate={{ x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Doctor Profile Section */}
            <div
              style={{
                background: "linear-gradient(135deg, #4FC3F7, #29B6F6)",
                padding: "24px 16px",
                textAlign: "center",
                color: "white",
              }}
            >
              <Avatar
                size={60}
                src={profileImageSrc}
                icon={!profileImageSrc && <FontAwesomeIcon icon={faUser} />}
                style={{
                  backgroundColor: "rgba(255,255,255,0.2)",
                  marginBottom: 12,
                }}
              />

              <div
                style={{ fontSize: "16px", fontWeight: "600", marginBottom: 4 }}
              >
                {user?.firstname || "Doctor"}
              </div>

              <div
                style={{
                  background: "rgba(255,255,255,0.9)",
                  color: "#1976D2",
                  padding: "4px 12px",
                  borderRadius: "12px",
                  fontSize: "12px",
                  fontWeight: "500",
                  display: "inline-block",
                }}
              >
                {user?.specialization?.name || "Department"}
              </div>
            </div>

            {/* Navigation Menu */}
            <Menu
              mode="inline"
              selectedKeys={[selectedKey]} // Dynamically set selected key
              onClick={handleMenuClick} // Handle menu item click
              style={{
                border: "none",
                background: "#F5F5F5",
              }}
            >
              {menuItems.map((item) => (
                <Menu.Item key={item.key} icon={item.icon}>
                  {item.label}
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
            My App © {new Date().getFullYear()} Created with Ant Design
          </Footer>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default DoctorLayoutWrapper;
