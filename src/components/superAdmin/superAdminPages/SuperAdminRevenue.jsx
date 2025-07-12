import React from "react";
import { Table, Card, Row, Col, Typography, Avatar, Pagination } from "antd";
import { Tag, Space } from "antd";
import { useEffect, useState } from "react";
import { apiGet } from "../../api";
const { Title } = Typography;

const revenueData = [
  {
    key: "01",
    doctorName: "Dr. Sarah Johnson",
    doctorEmail: "sarah.johnson@clinic.com",
    patientName: "Michael Chen",
    clinicName: "City Medical Center",
    date: "2025-06-28",
    time: "11:00 AM",
    amount: 900.0,
    avatar:
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=40&h=40&fit=crop&crop=face",
  },
  {
    key: "02",
    doctorName: "Dr. Emily Davis",
    doctorEmail: "emily.davis@healthcenter.com",
    patientName: "Jennifer Wilson",
    clinicName: "Metro Health Clinic",
    date: "2025-06-28",
    time: "10:30 AM",
    amount: 750.0,
    avatar:
      "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=40&h=40&fit=crop&crop=face",
  },
  {
    key: "03",
    doctorName: "Dr. Robert Martinez",
    doctorEmail: "robert.martinez@medical.com",
    patientName: "David Thompson",
    clinicName: "Prime Healthcare",
    date: "2025-06-27",
    time: "2:15 PM",
    amount: 1200.0,
    avatar:
      "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=40&h=40&fit=crop&crop=face",
  },
  {
    key: "04",
    doctorName: "Dr. Lisa Anderson",
    doctorEmail: "lisa.anderson@wellness.com",
    patientName: "Amanda Rodriguez",
    clinicName: "Wellness Center",
    date: "2025-06-27",
    time: "9:45 AM",
    amount: 650.0,
    avatar:
      "https://images.unsplash.com/photo-1594824804732-5c0c65068d1c?w=40&h=40&fit=crop&crop=face",
  },
  {
    key: "05",
    doctorName: "Dr. James Wilson",
    doctorEmail: "james.wilson@specialty.com",
    patientName: "Kevin Brown",
    clinicName: "Specialty Clinic",
    date: "2025-06-26",
    time: "4:00 PM",
    amount: 900.0,
    avatar:
      "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=40&h=40&fit=crop&crop=face",
  },
  {
    key: "06",
    doctorName: "Dr. Maria Garcia",
    doctorEmail: "maria.garcia@family.com",
    patientName: "Patricia Miller",
    clinicName: "Family Care Center",
    date: "2025-06-26",
    time: "1:30 PM",
    amount: 800.0,
    avatar:
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=40&h=40&fit=crop&crop=face",
  },
];

const RevenueList = () => {
  const [apiData, setApiData] = useState({
    total: 0,
    today: 0,
    week: 0,
    month: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await apiGet("finance/getTotalAmount");
        if (response.status === 200) {
          const data = response.data;
          setApiData({
            total: data.total || 0,
            today: data.today || 0,
            week: data.week || 0,
            month: data.month || 0,
          });
        }
      } catch (error) {
        console.error("Error fetching revenue data:", error);
        setError("Failed to fetch revenue data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const columns = [
    {
      title: "#",
      dataIndex: "key",
      key: "key",
      width: 50,
    },
    {
      title: "Doctor Name",
      dataIndex: "doctorName",
      key: "doctorName",
      render: (text, record) => (
        <Space>
          <Avatar src={record.avatar} size={40} />
          <div>
            <div style={{ fontWeight: 500 }}>{text}</div>
            <div style={{ color: "#666", fontSize: "12px" }}>
              {record.doctorEmail}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: "Patient Name",
      dataIndex: "patientName",
      key: "patientName",
    },
    {
      title: "Clinic Name",
      dataIndex: "clinicName",
      key: "clinicName",
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Time",
      dataIndex: "time",
      key: "time",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount) => (
        <span style={{ color: "#52c41a", fontWeight: 500 }}>
          ₹{amount.toFixed(2)}
        </span>
      ),
    },
  ];

  return (
    <div
      style={{
        padding: "20px",
        backgroundColor: "#f5f5f5",
        minHeight: "100vh",
      }}
    >
      {/* Header Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={6}>
          <Card style={{ backgroundColor: "#fff3e0", border: "none" }}>
            <div
              style={{
                color: "#ff9800",
                fontSize: "12px",
                marginBottom: "4px",
              }}
            >
              Today
            </div>
            <div
              style={{ fontSize: "24px", fontWeight: "bold", color: "#333" }}
            >
              ₹{apiData.today.toLocaleString()}
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card style={{ backgroundColor: "#e8f5e8", border: "none" }}>
            <div
              style={{
                color: "#4caf50",
                fontSize: "12px",
                marginBottom: "4px",
              }}
            >
              This Week
            </div>
            <div
              style={{ fontSize: "24px", fontWeight: "bold", color: "#333" }}
            >
              ₹{apiData.week.toLocaleString()}
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card style={{ backgroundColor: "#e8f5e8", border: "none" }}>
            <div
              style={{
                color: "#4caf50",
                fontSize: "12px",
                marginBottom: "4px",
              }}
            >
              This Month
            </div>
            <div
              style={{ fontSize: "24px", fontWeight: "bold", color: "#333" }}
            >
              ₹{apiData.month.toLocaleString()}
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card style={{ backgroundColor: "#2c3e50", border: "none" }}>
            <div
              style={{
                color: "#bdc3c7",
                fontSize: "12px",
                marginBottom: "4px",
              }}
            >
              Total Revenue
            </div>
            <div
              style={{ fontSize: "24px", fontWeight: "bold", color: "#fff" }}
            >
              ₹{apiData.total.toLocaleString()}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Revenue List Section */}
      <Card
        style={{
          backgroundColor: "white",
          borderRadius: "8px",
          border: "none",
        }}
      >
        <div
          style={{
            marginBottom: "16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <Title level={3} style={{ margin: 0, color: "#333" }}>
              Revenue List
            </Title>
            <div style={{ color: "#666", fontSize: "14px", marginTop: "4px" }}>
              Manage and track all revenue transactions
            </div>
          </div>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            {/* <span style={{ fontSize: '12px', color: '#666' }}>2025-06-28</span> */}
            <input
              type="date"
              style={{
                padding: "4px 8px",
                border: "1px solid #d9d9d9",
                borderRadius: "4px",
                fontSize: "12px",
              }}
            />
            <span style={{ margin: "0 4px", color: "#888" }}>to</span>
            <input
              type="date"
              style={{
                padding: "4px 8px",
                border: "1px solid #d9d9d9",
                borderRadius: "4px",
                fontSize: "12px",
              }}
            />

            <select
              style={{
                padding: "4px 8px",
                border: "1px solid #d9d9d9",
                borderRadius: "4px",
                fontSize: "12px",
              }}
            >
              <option>All Clinics</option>
            </select>
            <select
              style={{
                padding: "4px 8px",
                border: "1px solid #d9d9d9",
                borderRadius: "4px",
                fontSize: "12px",
              }}
            >
              <option>Last 7 Days</option>
            </select>
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={revenueData}
          pagination={false}
          style={{ backgroundColor: "white" }}
          rowKey="key"
        />

        <div
          style={{
            marginTop: "16px",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Pagination
            current={1}
            total={50}
            pageSize={10}
            showSizeChanger={false}
            showQuickJumper={false}
            simple={false}
          />
        </div>
      </Card>
    </div>
  );
};

export default RevenueList;
