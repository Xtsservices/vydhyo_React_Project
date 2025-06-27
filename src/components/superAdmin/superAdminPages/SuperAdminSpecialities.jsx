import React, { useState } from "react";
import { Table, Input, Button, Space, Avatar, Row, Col } from "antd";
import { SearchOutlined, FilterOutlined } from "@ant-design/icons";

const SpecialitiesList = () => {
  const [searchText, setSearchText] = useState("");

  const specialities = [
    {
      key: "1",
      name: "Cardiology",
      department: "Heart & Vascular",
      icon: "https://cdn-icons-png.flaticon.com/512/3448/3448590.png",
    },
    {
      key: "2",
      name: "Dermatology",
      department: "Skin Care",
      icon: "https://cdn-icons-png.flaticon.com/512/1087/1087924.png",
    },
    {
      key: "3",
      name: "Neurology",
      department: "Brain & Nervous System",
      icon: "https://cdn-icons-png.flaticon.com/512/2965/2965567.png",
    },
    {
      key: "4",
      name: "Orthopedics",
      department: "Bones & Muscles",
      icon: "https://cdn-icons-png.flaticon.com/512/1995/1995507.png",
    },
    {
      key: "5",
      name: "Pediatrics",
      department: "Child Care",
      icon: "https://cdn-icons-png.flaticon.com/512/4210/4210915.png",
    },
  ];

  const columns = [
    {
      title: "Speciality Name",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <Space>
          <Avatar size={32} src={record.icon} />
          <span style={{ fontWeight: 500 }}>{text}</span>
        </Space>
      ),
      width: 250,
    },
    {
      title: "Department",
      dataIndex: "department",
      key: "department",
      width: 200,
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
                <h2
                  style={{
                    margin: 0,
                    fontSize: "20px",
                    fontWeight: 600,
                    color: "#262626",
                  }}
                >
                  Specialities
                </h2>
                <span
                  style={{
                    color: "#1890ff",
                    fontSize: "14px",
                    fontWeight: 500,
                  }}
                >
                  {specialities.length} total
                </span>
              </div>
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <Input
                  placeholder="Search by name or department"
                  prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{ width: 300, borderRadius: "6px" }}
                />
                <Button
                  icon={<FilterOutlined />}
                  style={{ display: "flex", alignItems: "center", gap: "4px" }}
                >
                  Filter
                </Button>
              </div>
            </div>

            {/* Table */}
            <Table
              columns={columns}
              dataSource={specialities.filter((item) =>
                item.name.toLowerCase().includes(searchText.toLowerCase()) ||
                item.department.toLowerCase().includes(searchText.toLowerCase())
              )}
              scroll={{ x: 800 }}
              size="middle"
              style={{ backgroundColor: "white" }}
            />
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default SpecialitiesList;