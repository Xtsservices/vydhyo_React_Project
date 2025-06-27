import React, { useState } from "react";
import { Table, Input, Select, Tag, Row, Col, Typography, Grid } from "antd";
import { SearchOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;
const { Option } = Select;
const { useBreakpoint } = Grid;
const patients = [
  {
    key: "PT001",
    patientId: "PT001",
    fullName: "Sarah Johnson",
    gender: "Female",
    mobileNumber: "+91 98765 43210",
    email: "sarahjohnson@email.com",
    ageDob: "32 / Mar 15, 1992",
    registeredOn: "Jan 15, 2024",
    status: "Active",
  },
  {
    key: "PT002",
    patientId: "PT002",
    fullName: "Michael Chen",
    gender: "Male",
    mobileNumber: "+91 91234 56789",
    email: "michael.chen@email.com",
    ageDob: "28 / Jul 22, 1996",
    registeredOn: "Jan 18, 2024",
    status: "Active",
  },
  {
    key: "PT003",
    patientId: "PT003",
    fullName: "Emily Rodriguez",
    gender: "Female",
    mobileNumber: "+91 99887 76655",
    email: "emily.rodriguez@email.com",
    ageDob: "45 / Nov 08, 1979",
    registeredOn: "Jan 20, 2024",
    status: "Inactive",
  },
  {
    key: "PT004",
    patientId: "PT004",
    fullName: "David Thompson",
    gender: "Male",
    mobileNumber: "+91 90090 80808",
    email: "davidthompson@email.com",
    ageDob: "38 / Apr 12, 1986",
    registeredOn: "Jan 22, 2024",
    status: "Active",
  },
  {
    key: "PT005",
    patientId: "PT005",
    fullName: "Lisa Anderson",
    gender: "Female",
    mobileNumber: "+91 87654 12345",
    email: "lisa.anderson@email.com",
    ageDob: "29 / Sep 25, 1995",
    registeredOn: "Jan 25, 2024",
    status: "Active",
  },
];

const Patients = () => {
  const screens = useBreakpoint();
  const [searchText, setSearchText] = useState("");
  const [filteredPatients, setFilteredPatients] = useState(patients);

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchText(value);
    setFilteredPatients(
      patients.filter(
        (patient) =>
          patient.fullName.toLowerCase().includes(value) ||
          patient.email.toLowerCase().includes(value) ||
          patient.mobileNumber.includes(value)
      )
    );
  };

  const handleFilter = (value) => {
    if (value === "all") {
      setFilteredPatients(patients);
    } else {
      setFilteredPatients(
        patients.filter((patient) => patient.status === value)
      );
    }
  };

  const columns = [
    {
      title: "Patient ID",
      dataIndex: "patientId",
      key: "patientId",
    },
    {
      title: "Full Name",
      dataIndex: "fullName",
      key: "fullName",
      render: (text) => (
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: "50%",
              background: "#ccc",
              marginRight: 8,
            }}
          />
          {text}
        </div>
      ),
    },
    {
      title: "Gender",
      dataIndex: "gender",
      key: "gender",
    },
    {
      title: "Mobile Number",
      dataIndex: "mobileNumber",
      key: "mobileNumber",
    },
    {
      title: "Email ID",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Age / DOB",
      dataIndex: "ageDob",
      key: "ageDob",
    },
    {
      title: "Registered On",
      dataIndex: "registeredOn",
      key: "registeredOn",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (text) => (
        <Tag color={text === "Active" ? "green" : "red"}>{text}</Tag>
      ),
    },
  ];

  return (
    <div
      style={{
        padding: screens.xs ? "16px" : "24px",
        background: "#f0f2f5",
        minHeight: "calc(100vh - 64px)",
      }}
    >
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Title level={4} style={{ margin: 0, color: "#1890ff" }}>
            Patients <Text type="secondary">12,447 total</Text>
          </Title>
        </Col>
        <Col>
          <Row gutter={8}>
            <Col>
              <Input
                placeholder="Search by name, email or mobile number"
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={handleSearch}
                style={{ width: screens.xs ? 200 : 300 }}
              />
            </Col>
            <Col>
              <Select
                defaultValue="all"
                style={{ width: screens.xs ? 100 : 120 }}
                onChange={handleFilter}
              >
                <Option value="all">All</Option>
                <Option value="Active">Active</Option>
                <Option value="Inactive">Inactive</Option>
              </Select>
            </Col>
          </Row>
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <Table
            columns={columns}
            dataSource={filteredPatients}
            pagination={{ pageSize: 5 }}
            scroll={{ x: screens.xs ? 1000 : undefined }}
            bordered
          />
        </Col>
      </Row>
    </div>
  );
};

export default Patients;
