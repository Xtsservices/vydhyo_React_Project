import { useState, useEffect } from "react";
import { Layout, Menu } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faTachometerAlt,
  faUserMd,
  faCalendarCheck,
} from "@fortawesome/free-solid-svg-icons";
import { Link, Outlet } from "react-router-dom";
import { motion } from "framer-motion";

const { Header, Sider, Content, Footer } = Layout;

const DoctorLayoutWrapper = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

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
          width={200}
          collapsedWidth={80}
          breakpoint="lg"
          onBreakpoint={(broken) => setIsMobile(broken)}
          style={{
            overflow: "auto",
            height: "calc(100vh - 64px)", // Adjusted for fixed Header
            position: "fixed",
            left: 0,
            top: 64, // Start below fixed Header
            bottom: 0,
            zIndex: 1000,
            display: isMobile && collapsed ? "none" : "block",
          }}
        >
          <motion.div
            initial={{ x: -200 }}
            animate={{ x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Menu
              theme="dark"
              mode="inline"
              defaultSelectedKeys={["dashboard"]}
            >
              <Menu.Item
                key="dashboard"
                icon={<FontAwesomeIcon icon={faTachometerAlt} />}
              >
                <Link to="/doctor-admin/dashboard">Dashboard</Link>
              </Menu.Item>
              <Menu.Item
                key="doctors"
                icon={<FontAwesomeIcon icon={faUserMd} />}
              >
                <Link to="/doctor-admin/doctors">Doctors</Link>
              </Menu.Item>
              <Menu.Item
                key="appointments"
                icon={<FontAwesomeIcon icon={faCalendarCheck} />}
              >
                <Link to="/doctor-admin/appointments">Appointments</Link>
              </Menu.Item>
            </Menu>
          </motion.div>
        </Sider>
        <Layout
          style={{
            marginLeft: isMobile ? 0 : collapsed ? 80 : 200,
            marginTop: 64, // Offset for fixed Header
            transition: "margin-left 0.2s",
            minHeight: "calc(100vh - 64px - 48px)", // Header: 64px, Footer: 48px
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
