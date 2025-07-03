import { useState, useEffect } from "react";
import { Layout, Menu, Avatar, Badge } from "antd";
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
  faSignOutAlt,
  faComments,
  faStar,
  faUserCircle,
  faChartLine,
  faBell,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { Link, Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import logo from "../assets/logooo.png";
import { useSelector } from "react-redux";

const { Header, Sider, Content, Footer } = Layout;

const LayoutWrapper = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const user = useSelector((state) => state.currentUserData);
  console.log("User Data:", user);

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

  const customStyles = `
    .ant-layout {
      min-height: 100vh;
    }
    
    .ant-layout-header {
      position: fixed;
      z-index: 1001;
      width: 100%;
      padding: 0;
    }
    
    .ant-layout-sider {
      position: fixed;
      height: 100vh;
      z-index: 1000;
      top: 0;
      left: 0;
      margin-top: 64px;
    }
    
    .ant-layout-content {
      margin-top: 64px !important;
      padding: 24px;
    }

    .custom-header {
      background: #ffffff !important;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
      border-bottom: 1px solid #f0f0f0 !important;
      padding: 0 24px !important;
      display: flex !important;
      justify-content: space-between !important;
      align-items: center !important;
      height: 64px !important;
    }
    
    .header-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    
    .header-right {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    
    .logo-section {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .app-title {
      color: #1890ff !important;
      font-size: 20px !important;
      font-weight: 600 !important;
      margin: 0 !important;
      letter-spacing: -0.5px !important;
    }
    
    .connect-subtitle {
      color: #666 !important;
      font-size: 12px !important;
      font-weight: 400 !important;
      margin: 0 !important;
      margin-top: -2px !important;
    }
    
    .toggle-btn {
      color: #666 !important;
      cursor: pointer !important;
      font-size: 18px !important;
      padding: 8px !important;
      border-radius: 4px !important;
      transition: all 0.2s !important;
    }
    
    .toggle-btn:hover {
      background: #f5f5f5 !important;
      color: #1890ff !important;
    }
    
    .notification-btn {
      color: #666 !important;
      cursor: pointer !important;
      font-size: 18px !important;
      padding: 8px !important;
      border-radius: 50% !important;
      transition: all 0.2s !important;
      position: relative !important;
    }
    
    .notification-btn:hover {
      background: #f5f5f5 !important;
      color: #1890ff !important;
    }
    
    .user-info {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 6px;
      transition: all 0.2s;
    }
    
    .user-info:hover {
      background: #f5f5f5;
    }
    
    .user-details {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }
    
    .user-name {
      color: #333 !important;
      font-size: 14px !important;
      font-weight: 600 !important;
      margin: 0 !important;
      line-height: 1.2 !important;
    }
    
    .user-role {
      color: #666 !important;
      font-size: 12px !important;
      font-weight: 400 !important;
      margin: 0 !important;
      line-height: 1.2 !important;
    }

    .ant-layout-sider {
      background: linear-gradient(180deg, #4a6fa5 0%, #3d5a8a 100%) !important;
      box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
    }
    
    .ant-menu-dark {
      background: transparent !important;
      border-right: none !important;
    }
    
    .ant-menu-dark .ant-menu-item {
      background: transparent !important;
      border-radius: 8px !important;
      // margin: 4px 12px !important;
      padding: 12px 16px !important;
      height: auto !important;
      line-height: 1.4 !important;
      border: 1px solid rgba(255, 255, 255, 0.1) !important;
      transition: all 0.3s ease !important;
    }
    
    .ant-menu-dark .ant-menu-item:hover {
      background: rgba(255, 255, 255, 0.1) !important;
      border-color: rgba(255, 255, 255, 0.2) !important;
      transform: translateX(2px) !important;
    }
    
    .ant-menu-dark .ant-menu-item-selected {
      background: rgba(255, 255, 255, 0.15) !important;
      border-color: rgba(255, 255, 255, 0.3) !important;
      color: #ffffff !important;
    }
    
    .ant-menu-dark .ant-menu-item a {
      color: #ffffff !important;
      text-decoration: none !important;
      font-weight: 500 !important;
      font-size: 14px !important;
      display: flex !important;
      align-items: center !important;
    }
    
    .ant-menu-dark .ant-menu-item .anticon {
      color: #ffffff !important;
      font-size: 16px !important;
      margin-right: 12px !important;
      min-width: 16px !important;
    }
    
    .sidebar-profile {
      padding: 20px;
      text-align: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      margin-bottom: 16px;
    }
    
    .profile-avatar {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      margin: 0 auto 12px;
      border: 3px solid rgba(255, 255, 255, 0.2);
      overflow: hidden;
    }
    
    .profile-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .profile-name {
      color: #ffffff;
      font-size: 16px;
      font-weight: 600;
      margin: 0;
    }
  `;

  const getProfileImage = (user) => {
    if (user?.profilepic?.data && user?.profilepic?.mimeType) {
      return `data:${user.profilepic.mimeType};base64,${user.profilepic.data}`;
    }
    return null;
  };

  const profileImageSrc = getProfileImage(user);

  // const profileMenu = (
  //    <Menu
  //      style={{
  //        borderRadius: "8px",
  //        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
  //      }}
  //    >
  //      <Menu.Item key="logout" onClick={handleLogout}>
  //        <FontAwesomeIcon icon={faSignOutAlt} style={{ marginRight: 8 }} />
  //        Logout
  //      </Menu.Item>
  //    </Menu>
  //  ); 

  return (
    <>
      <style>{customStyles}</style>
      <Layout className="layout">
        <Header
          className="custom-header"
          style={{ position: "fixed", width: "100%", zIndex: 1001 }}
        >
          <div className="header-left">
            <FontAwesomeIcon
              icon={faBars}
              className="toggle-btn"
              onClick={toggleSidebar}
            />
            <div className="logo-section">
              <img
                src={logo}
                alt="VYDHYO Logo"
                style={{
                  height: 120,
                  width: 140,
                  objectFit: "contain",
                }}
              />
            </div>
          </div>

          <div className="header-right">
            <Badge count={5} size="small">
              <FontAwesomeIcon icon={faBell} className="notification-btn" />
            </Badge>

            {/* <div className="user-info" onClick={() => {
              localStorage.removeItem("accessToken");
              window.location.href = "/"; 
            }}>
              <div className="user-details">
                <span className="user-name">Dr. Arvind Sharma</span>
                <span className="user-role">Super Admin</span>
              </div>
              <Avatar
                size={40}
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
                style={{ 
                  border: '2px solid #e8e8e8',
                  cursor: 'pointer'
                }}
              />
            </div> */}
            
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
              height: "calc(100vh - 64px)",
              position: "fixed",
              left: 0,
              top: 64,
              bottom: 0,
              zIndex: 1000,
              marginTop: 5,
              display: isMobile && collapsed ? "none" : "block",
            }}
          >
            <motion.div
              initial={{ x: -200 }}
              animate={{ x: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Profile Section */}
              {!collapsed && (
                <div className="sidebar-profile">
                  <div className="profile-avatar">
                    <img
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
                      alt="Profile" 
                    />
                  </div>
                  <h3 className="profile-name">{user?.firstname || "Arvind"} {user?.lastname || "Sharma"}</h3>
                </div>
              )}

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
                  key="revenue"
                  icon={<FontAwesomeIcon icon={faChartLine} />}
                >
                  <Link to="/SuperAdmin/revenue">Revenue</Link>
                </Menu.Item>
                <Menu.Item
                  key="billing-status"
                  icon={<FontAwesomeIcon icon={faFileInvoiceDollar} />}
                >
                  <Link to="/SuperAdmin/billing-status">Settlements</Link>
                </Menu.Item>

                {/* <Menu.Item
                  key="patients"
                  icon={<FontAwesomeIcon icon={faUserInjured} />}
                >
                  <Link to="/SuperAdmin/patients">Patients</Link>
                </Menu.Item> */}
                <Menu.Item
                  key="services"
                  icon={<FontAwesomeIcon icon={faStethoscope} />}
                >
                  <Link to="/SuperAdmin/services">Pharmacy</Link>
                </Menu.Item>
                <Menu.Item
                  key="specialities"
                  icon={<FontAwesomeIcon icon={faListAlt} />}
                >
                  <Link to="/SuperAdmin/specialities">Labs</Link>
                </Menu.Item>
                <Menu.Item
                  key="appointments"
                  icon={<FontAwesomeIcon icon={faCalendarCheck} />}
                >
                  <Link to="/SuperAdmin/dashboard">Settings</Link>
                </Menu.Item>

                <Menu.Item
                  key="appointments"
                  icon={<FontAwesomeIcon icon={faCalendarCheck} />}
                >
                  <Link to="/SuperAdmin/dashboard">Staff Management</Link>
                </Menu.Item>
                <Menu.Item
                  key="logout"
                  icon={<FontAwesomeIcon icon={faSignOutAlt} />}
                >
                  <Link to="/login">Logout</Link>
                </Menu.Item>

              </Menu>
            </motion.div>
          </Sider>
          <Layout
            style={{
              marginLeft: isMobile ? 0 : collapsed ? 80 : 200,
              transition: "margin-left 0.2s",
              minHeight: "calc(100vh - 64px - 48px)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Content className="content" style={{ flex: 1, marginTop: 64 }}>
              <Outlet />
            </Content>
            <Footer className="footer">
              My App © {new Date().getFullYear()} Created with Ant Design
            </Footer>
          </Layout>
        </Layout>
      </Layout>
    </>
  );
};

export default LayoutWrapper;
