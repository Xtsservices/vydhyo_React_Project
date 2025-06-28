import React from "react";
import { Card, Row, Col, Typography, Table } from "antd";
import { Tag } from "antd";

const { Title, Text } = Typography;

const billingData = [
  { name: "Insurance Claims", value: 45000, color: "#3B82F6", percentage: 53 },
  { name: "Direct Pay", value: 28000, color: "#10B981", percentage: 33 },
  { name: "Pending", value: 12000, color: "#F59E0B", percentage: 14 },
];

const recentBills = [
  { patientName: "Sarah Johnson", type: "Insurance Claim", amount: "₹3,500", date: "2024-06-01", status: "Paid" },
  { patientName: "Michael Chen", type: "Direct Pay", amount: "₹2,800", date: "2024-06-02", status: "Paid" },
  { patientName: "Emily Rodriguez", type: "Insurance Claim", amount: "₹4,200", date: "2024-06-03", status: "Pending" },
  { patientName: "David Thompson", type: "Direct Pay", amount: "₹1,900", date: "2024-06-04", status: "Paid" },
  { patientName: "Lisa Anderson", type: "Insurance Claim", amount: "₹3,800", date: "2024-06-05", status: "Processing" },
];

// Simple pie chart component
const PieChart = ({ data }) => {
  const size = 200;
  const center = size / 2;
  const radius = 80;
  let cumulativePercentage = 0;

  const createPath = (percentage, startAngle) => {
    const angle = (percentage / 100) * 360;
    const endAngle = startAngle + angle;

    const x1 = center + radius * Math.cos((startAngle * Math.PI) / 180);
    const y1 = center + radius * Math.sin((startAngle * Math.PI) / 180);
    const x2 = center + radius * Math.cos((endAngle * Math.PI) / 180);
    const y2 = center + radius * Math.sin((endAngle * Math.PI) / 180);

    const largeArc = angle > 180 ? 1 : 0;

    return `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <svg width={size} height={size} style={{ marginBottom: "16px" }}>
        {data.map((item, index) => {
          const startAngle = cumulativePercentage * 3.6 - 90;
          const path = createPath(item.percentage, startAngle);
          cumulativePercentage += item.percentage;

          return (
            <path
              key={index}
              d={path}
              fill={item.color}
              stroke="#fff"
              strokeWidth="2"
            />
          );
        })}
      </svg>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {data.map((item, index) => (
          <div key={index} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: item.color }}></div>
            <span style={{ fontSize: "14px", color: "#666" }}>{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const BillingPage = () => {
  const columns = [
    {
      title: "Patient Name",
      dataIndex: "patientName",
      key: "patientName",
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
    },
    {
      title: "Amount (₹)",
      dataIndex: "amount",
      key: "amount",
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag
          color={
            status === "Paid"
              ? "green"
              : status === "Pending"
              ? "yellow"
              : "blue"
          }
        >
          {status}
        </Tag>
      ),
    },
  ];

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <div style={{ maxWidth: "7xl", margin: "0 auto" }}>
            <Title level={2} style={{ marginBottom: "32px", fontWeight: "bold", color: "#1F2937" }}>
              Billing Summary
            </Title>

            {/* Billing Overview Cards */}
            <Row gutter={[16, 16]} style={{ marginBottom: "32px" }}>
              <Col xs={24} md={8}>
                <Card bordered={false} style={{ padding: "24px", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                  <Text style={{ fontSize: "18px", color: "#6B7280", marginBottom: "8px" }}>Insurance Claims</Text>
                  <Title level={3} style={{ color: "#3B82F6" }}>₹45,000</Title>
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card bordered={false} style={{ padding: "24px", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                  <Text style={{ fontSize: "18px", color: "#6B7280", marginBottom: "8px" }}>Direct Pay</Text>
                  <Title level={3} style={{ color: "#10B981" }}>₹28,000</Title>
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card bordered={false} style={{ padding: "24px", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                  <Text style={{ fontSize: "18px", color: "#6B7280", marginBottom: "8px" }}>Pending</Text>
                  <Title level={3} style={{ color: "#F59E0B" }}>₹12,000</Title>
                </Card>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              {/* Recent Bills Table */}
              <Col xs={24} lg={12}>
                <Card bordered={false} style={{ padding: "24px", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                  <Title level={4} style={{ marginBottom: "16px", fontWeight: "semibold", color: "#1F2937" }}>
                    Recent Bills
                  </Title>
                  <Table
                    columns={columns}
                    dataSource={recentBills}
                    pagination={false}
                    style={{ backgroundColor: "white" }}
                  />
                </Card>
              </Col>

              {/* Billing Distribution Chart */}
              <Col xs={24} lg={12}>
                <Card bordered={false} style={{ padding: "24px", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                  <Title level={4} style={{ marginBottom: "16px", fontWeight: "semibold", color: "#1F2937" }}>
                    Billing Distribution
                  </Title>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <PieChart data={billingData} />
                  </div>
                </Card>
              </Col>
            </Row>

            {/* Additional Billing Information */}
            <Row gutter={[16, 16]} style={{ marginTop: "32px" }}>
              <Col xs={24} md={12}>
                <Card bordered={false} style={{ padding: "24px", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                  <Title level={4} style={{ marginBottom: "16px", fontWeight: "semibold", color: "#1F2937" }}>
                    Payment Methods
                  </Title>
                  <div style={{ gap: "16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #E5E7EB" }}>
                      <Text style={{ color: "#6B7280" }}>Credit Card Payments</Text>
                      <Text style={{ fontWeight: "medium", color: "#1F2937" }}>65%</Text>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #E5E7EB" }}>
                      <Text style={{ color: "#6B7280" }}>Bank Transfers</Text>
                      <Text style={{ fontWeight: "medium", color: "#1F2937" }}>25%</Text>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}>
                      <Text style={{ color: "#6B7280" }}>Cash Payments</Text>
                      <Text style={{ fontWeight: "medium", color: "#1F2937" }}>10%</Text>
                    </div>
                  </div>
                </Card>
              </Col>

              <Col xs={24} md={12}>
                <Card bordered={false} style={{ padding: "24px", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                  <Title level={4} style={{ marginBottom: "16px", fontWeight: "semibold", color: "#1F2937" }}>
                    Quick Actions
                  </Title>
                  <div style={{ gap: "16px" }}>
                    <div
                      style={{
                        padding: "12px",
                        backgroundColor: "#EFF6FF",
                        borderRadius: "8px",
                        cursor: "pointer",
                        transition: "background-color 0.3s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#DBEAFE")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#EFF6FF")}
                    >
                      <Text style={{ fontWeight: "medium", color: "#1D4ED8" }}>Generate Invoice</Text>
                      <Text style={{ fontSize: "12px", color: "#3B82F6", marginTop: "4px" }}>Create a new patient invoice</Text>
                    </div>
                    <div
                      style={{
                        padding: "12px",
                        backgroundColor: "#F0FDF4",
                        borderRadius: "8px",
                        cursor: "pointer",
                        transition: "background-color 0.3s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#DCFCE7")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#F0FDF4")}
                    >
                      <Text style={{ fontWeight: "medium", color: "#065F46" }}>Process Payment</Text>
                      <Text style={{ fontSize: "12px", color: "#10B981", marginTop: "4px" }}>Record a patient payment</Text>
                    </div>
                    <div
                      style={{
                        padding: "12px",
                        backgroundColor: "#FEF3C7",
                        borderRadius: "8px",
                        cursor: "pointer",
                        transition: "background-color 0.3s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#FDE68A")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#FEF3C7")}
                    >
                      <Text style={{ fontWeight: "medium", color: "#92400E" }}>Send Reminder</Text>
                      <Text style={{ fontSize: "12px", color: "#F59E0B", marginTop: "4px" }}>Send payment reminder to patients</Text>
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default BillingPage;