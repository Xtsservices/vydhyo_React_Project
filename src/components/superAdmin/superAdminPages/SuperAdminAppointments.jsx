import React, { useState } from "react";
import { Table, Button, Input, Select, Tag, Space, Row, Col, Radio } from "antd";
import { SearchOutlined, FilterOutlined } from "@ant-design/icons";

const { Option } = Select;

const AppointmentsTable = () => {
  const [searchText, setSearchText] = useState("");

  const columns = [
    {
      title: "Appointment ID",
      dataIndex: "appointmentId",
      key: "appointmentId",
      width: 120,
    },
    {
      title: "Patient",
      dataIndex: "patient",
      key: "patient",
      width: 150,
      render: (patient) => (
        <div>
          <div style={{ fontWeight: 500 }}>{patient.name}</div>
          <div style={{ fontSize: "12px", color: "#666" }}>ID: {patient.id}</div>
        </div>
      ),
    },
    {
      title: "Doctor",
      dataIndex: "doctor",
      key: "doctor",
      width: 150,
      render: (doctor) => (
        <div>
          <div style={{ fontWeight: 500 }}>{doctor.name}</div>
          <div style={{ fontSize: "12px", color: "#666" }}>{doctor.specialty}</div>
        </div>
      ),
    },
    {
      title: "Clinic",
      dataIndex: "clinic",
      key: "clinic",
      width: 120,
    },
    {
      title: "Date & Time",
      dataIndex: "dateTime",
      key: "dateTime",
      width: 130,
      render: (dateTime) => (
        <div>
          <div>{dateTime.date}</div>
          <div style={{ fontSize: "12px", color: "#666" }}>{dateTime.time}</div>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status) => {
        let color = "green";
        if (status === "Completed") color = "orange";
        if (status === "Cancelled") color = "red";
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Action",
      key: "action",
      width: 80,
      render: () => (
        <Button type="link" size="small">
          View
        </Button>
      ),
    },
  ];

  const data = [
    {
      key: "1",
      appointmentId: "APT001",
      patient: {
        name: "Dr. Sarah Johnson",
        id: "12345",
      },
      doctor: {
        name: "Dr. Sarah Johnson",
        specialty: "Cardiology",
      },
      clinic: "Downtown Clinic",
      dateTime: {
        date: "Dec 15, 2024",
        time: "10:30 AM",
      },
      status: "Pending",
    },
    {
      key: "2",
      appointmentId: "APT002",
      patient: {
        name: "Michael Rodriguez",
        id: "67890",
      },
      doctor: {
        name: "Dr. Michael Rodriguez",
        specialty: "Neurology",
      },
      clinic: "Central Medical",
      dateTime: {
        date: "Dec 14, 2024",
        time: "2:15 PM",
      },
      status: "Completed",
    },
    {
      key: "3",
      appointmentId: "APT003",
      patient: {
        name: "Robert Brown",
        id: "54321",
      },
      doctor: {
        name: "Dr. Emily Davis",
        specialty: "Dermatology",
      },
      clinic: "Uptown Office",
      dateTime: {
        date: "Dec 13, 2024",
        time: "9:00 AM",
      },
      status: "Cancelled",
    },
  ];

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <div style={{ backgroundColor: "white", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", overflow: "hidden" }}>
            {/* Service Type Selection or RADIO BUTTONS */}
            <Space style={{ padding: "10px 20px", borderBottom: "1px solid #f0f0f0", display: "flex", alignItems: "center" }}>
              <span style={{ marginRight: 20, fontWeight: 500 }}>Service Type:</span>
              <Radio.Group defaultValue="online" buttonStyle="solid">
                <Radio.Button value="online">Online</Radio.Button>
                <Radio.Button value="walkin">Walk-in</Radio.Button>
                <Radio.Button value="home">Home</Radio.Button>
              </Radio.Group>
            </Space>

            {/* Header */}
            <div style={{ padding: "15px 20px", borderBottom: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ margin: 0, fontSize: "25px", color: "#262626" }}>Appointments</h2>
              <Space>
                <Input
                  placeholder="Search by Patient, Doctor, or Clinic"
                  prefix={<SearchOutlined />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{ width: 300 }}
                />
                <Select
                  defaultValue="all"
                  style={{ width: 120 }}
                  suffixIcon={<FilterOutlined />}
                >
                  <Option value="all">All</Option>
                  <Option value="weekly">Weekly</Option>
                  <Option value="monthly">Monthly</Option>
                </Select>
              </Space>
            </div>

            {/* Table */}
            <Table
              columns={columns}
              dataSource={data.filter((item) =>
                `${item.patient.name} ${item.doctor.name} ${item.clinic}`
                  .toLowerCase()
                  .includes(searchText.toLowerCase())
              )}
              pagination={{
                current: 1,
                pageSize: 10,
                total: 3,
                showSizeChanger: false,
                showQuickJumper: false,
                style: { padding: "16px 24px" },
              }}
              size="middle"
              scroll={{ x: 1000 }}
            />
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default AppointmentsTable;