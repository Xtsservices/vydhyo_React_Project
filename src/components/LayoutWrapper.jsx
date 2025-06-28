import { useState, useEffect } from "react";
import { Layout, Menu } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faTachometerAlt,
  faUserMd,
  faCalendarCheck,
  faUserInjured,
  faStethoscope,
  faFileInvoiceDollar,
  faListAlt,
  faComments,
  faStar,
  faUserCircle,
  faChartLine,
} from "@fortawesome/free-solid-svg-icons";
import { Link, Outlet } from "react-router-dom";
import { motion } from "framer-motion";

const { Header, Sider, Content, Footer } = Layout;

const LayoutWrapper = () => {
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
      <Header className="header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 24px" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <FontAwesomeIcon
            icon={faBars}
            className="toggle-button"
            onClick={toggleSidebar}
            style={{ marginRight: 16, color: "#fff", cursor: "pointer", fontSize: 20 }}
          />
          <div className="logo" style={{ marginRight: 16 }}>
            <img
              src="https://img.freepik.com/free-vector/bird-colorful-logo-gradient-vector_343694-1365.jpg?semt=ais_hybrid&w=740"
              alt="My App Logo"
              style={{ height: 40, width: "auto" }}
            />
          </div>
          <h1 style={{ color: "#fff", margin: 0, fontSize: 24, fontWeight: 600 }}>My App</h1>
        </div>
        <button
        onClick={() => {
          localStorage.removeItem("accessToken");
          window.location.href = "/"; 
        }}
          style={{
            background: "#40a9ff",
            color: "#fff",
            border: "none",
            borderRadius: "50px",
            padding: "0px 16px",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            transition: "background 0.2s, box-shadow 0.2s",
            boxShadow: "0 1px 4px rgba(24,144,255,0.12)",
            letterSpacing: 0.5,
            outline: "none"
          }}
          onMouseOver={e => (e.currentTarget.style.background = "#40a9ff")}
          onMouseOut={e => (e.currentTarget.style.background = "#1890ff")}
        >
          Logout
        </button>
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
            height: "calc(100vh - 64px)",
            position: "fixed",
            left: 0,
            top: 64,
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
                <Link to="/SuperAdmin/dashboard">Dashboard</Link>
              </Menu.Item>
              <Menu.Item
                key="doctors"
                icon={<FontAwesomeIcon icon={faUserMd} />}
              >
                <Link to="/SuperAdmin/doctors">Doctors</Link>
              </Menu.Item>
              <Menu.Item
                key="patients"
                icon={<FontAwesomeIcon icon={faUserInjured} />}
              >
                <Link to="/SuperAdmin/patients">Patients</Link>
              </Menu.Item>
              <Menu.Item
                key="services"
                icon={<FontAwesomeIcon icon={faStethoscope} />}
              >
                <Link to="/SuperAdmin/services">Services</Link>
              </Menu.Item>
              <Menu.Item
                key="appointments"
                icon={<FontAwesomeIcon icon={faCalendarCheck} />}
              >
                <Link to="/SuperAdmin/appointments">Appointments</Link>
              </Menu.Item>
              <Menu.Item
                key="revenue"
                icon={<FontAwesomeIcon icon={faChartLine} />}
              >
                <Link to="/SuperAdmin/revenue">Revenue</Link>
              </Menu.Item>
              <Menu.Item
                key="billing-status"
                icon={<FontAwesomeIcon icon={faFileInvoiceDollar} />}
              >
                <Link to="/SuperAdmin/billing-status">Billing Status</Link>
              </Menu.Item>
              <Menu.Item
                key="specialities"
                icon={<FontAwesomeIcon icon={faListAlt} />}
              >
                <Link to="/SuperAdmin/specialities">Specialities</Link>
              </Menu.Item>
              <Menu.Item
                key="reviews"
                icon={<FontAwesomeIcon icon={faComments} />}
              >
                <Link to="/SuperAdmin/reviews">Reviews/Feedback</Link>
              </Menu.Item>
              <Menu.Item key="reports" icon={<FontAwesomeIcon icon={faStar} />}>
                <Link to="/SuperAdmin/reports">Reports</Link>
              </Menu.Item>
              <Menu.Item
                key="profile"
                icon={<FontAwesomeIcon icon={faUserCircle} />}
              >
                <Link to="/SuperAdmin/profile">Profile</Link>
              </Menu.Item>
            </Menu>
          </motion.div>
        </Sider>
        <Layout
          style={{
            marginLeft: isMobile ? 0 : collapsed ? 80 : 200,
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

export default LayoutWrapper;
