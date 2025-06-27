import React from "react";
import { Table, Card, Row, Col, Typography } from "antd";
import { Pie } from "@ant-design/charts";
import { Tag, Space } from "antd";

const { Title } = Typography;

const revenueData = [
  {
    key: "1",
    type: "Home Visit",
    patientName: "Sarah Johnson",
    amount: 1200,
    date: "2024-06-01",
    status: "Success",
  },
  {
    key: "2",
    type: "Video",
    patientName: "Michael Chen",
    amount: 900,
    date: "2024-06-02",
    status: "Success",
  },
  {
    key: "3",
    type: "Walk-In",
    patientName: "Emily Rodriguez",
    amount: 700,
    date: "2024-06-03",
    status: "Failed",
  },
  {
    key: "4",
    type: "Home Visit",
    patientName: "David Thompson",
    amount: 1500,
    date: "2024-06-04",
    status: "Success",
  },
  {
    key: "5",
    type: "Walk-In",
    patientName: "Lisa Anderson",
    amount: 1000,
    date: "2024-06-05",
    status: "Success",
  },
];

const RevenueList = () => {
  const totalRevenue = {
    "Home Visit": revenueData
      .filter((r) => r.type === "Home Visit" && r.status === "Success")
      .reduce((sum, r) => sum + r.amount, 0),
    Video: revenueData
      .filter((r) => r.type === "Video" && r.status === "Success")
      .reduce((sum, r) => sum + r.amount, 0),
    "Walk-In": revenueData
      .filter((r) => r.type === "Walk-In" && r.status === "Success")
      .reduce((sum, r) => sum + r.amount, 0),
  };

  const pieData = Object.entries(totalRevenue).map(([type, value]) => ({
    type,
    value,
  }));

  const pieConfig = {
    appendPadding: 10,
    data: pieData,
    angleField: "value",
    colorField: "type",
    radius: 1,
    label: {
      type: "inner",
      offset: "-30%",
      content: "{value}",
      style: {
        fontSize: 14,
        textAlign: "center",
      },
    },
    interactions: [{ type: "element-active" }],
  };

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
      render: (amt) => `₹${amt}`,
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
        <Tag color={status === "Success" ? "green" : "red"}>{status}</Tag>
      ),
    },
  ];

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <div
            style={{
              backgroundColor: "white",
              padding: "24px",
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            <Title level={3} style={{ marginBottom: 24 }}>
              Revenue Summary
            </Title>

            <Row gutter={16} style={{ marginBottom: 32 }}>
              {Object.entries(totalRevenue).map(([key, value]) => (
                <Col xs={24} sm={8} key={key}>
                  <Card bordered={false}>
                    <Title level={4}>{key}</Title>
                    <Title level={2} style={{ color: "#3f8600" }}>
                      ₹{value.toLocaleString()}
                    </Title>
                  </Card>
                </Col>
              ))}
            </Row>

            <Row gutter={24}>
              <Col xs={24} lg={12}>
                <Table
                  columns={columns}
                  dataSource={revenueData}
                  pagination={false}
                  style={{ backgroundColor: "white" }}
                />
              </Col>

              <Col xs={24} lg={12}>
                <Title level={4} style={{ marginTop: 0, marginBottom: 24 }}>
                  Revenue Distribution
                </Title>
                <Pie {...pieConfig} />
              </Col>
            </Row>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default RevenueList;