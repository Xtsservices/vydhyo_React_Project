import React, { useState } from "react";
import { Table, Input, Button, Tag, Space, Avatar, Row, Col, Typography } from "antd";
import { SearchOutlined, FilterOutlined } from "@ant-design/icons";

const { Title } = Typography;

const reviews = [
  {
    key: "1",
    patientName: "Sarah Johnson",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616c654e85b?w=40&h=40&fit=crop&crop=face",
    rating: 5,
    comment: "Excellent service and friendly staff!",
    date: "2024-06-01",
    status: "Visible",
  },
  {
    key: "2",
    patientName: "Michael Chen",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
    rating: 4,
    comment: "Very satisfied, quick consultation.",
    date: "2024-06-02",
    status: "Visible",
  },
  {
    key: "3",
    patientName: "Emily Rodriguez",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
    rating: 2,
    comment: "Wait time was too long.",
    date: "2024-06-03",
    status: "Hidden",
  },
  {
    key: "4",
    patientName: "David Thompson",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
    rating: 3,
    comment: "Average experience.",
    date: "2024-06-04",
    status: "Visible",
  },
  {
    key: "5",
    patientName: "Lisa Anderson",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=40&h=40&fit=crop&crop=face",
    rating: 5,
    comment: "Highly recommend!",
    date: "2024-06-05",
    status: "Visible",
  },
];

const ReviewsList = () => {
  const [searchText, setSearchText] = useState("");

  const filteredData = reviews.filter((r) =>
    r.patientName.toLowerCase().includes(searchText.toLowerCase()) ||
    r.comment.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: "Patient",
      dataIndex: "patientName",
      key: "patientName",
      render: (_, record) => (
        <Space>
          <Avatar src={record.avatar} />
          <span style={{ fontWeight: 500 }}>{record.patientName}</span>
        </Space>
      ),
    },
    {
      title: "Rating",
      dataIndex: "rating",
      key: "rating",
      render: (rating) => (
        <Tag color={rating >= 4 ? "green" : rating === 3 ? "orange" : "red"}>
          {rating} ★
        </Tag>
      ),
    },
    {
      title: "Comment",
      dataIndex: "comment",
      key: "comment",
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
        <Tag color={status === "Visible" ? "blue" : "default"}>{status}</Tag>
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
            {/* Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "24px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Title level={4} style={{ margin: 0 }}>
                  Reviews & Feedback
                </Title>
                <span
                  style={{
                    color: "#1890ff",
                    fontSize: "14px",
                    fontWeight: 500,
                  }}
                >
                  {filteredData.length} total
                </span>
              </div>

              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <Input
                  placeholder="Search by name or comment"
                  prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{ width: 300, borderRadius: "6px" }}
                />
                <Button icon={<FilterOutlined />}>Filter</Button>
              </div>
            </div>

            <Table
              columns={columns}
              dataSource={filteredData}
              pagination={false}
              rowKey="key"
              scroll={{ x: 800 }}
            />
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default ReviewsList;