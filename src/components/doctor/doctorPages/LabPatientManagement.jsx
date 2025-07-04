import React, { useEffect } from "react";
import { Table, Card, Typography, Row, Col } from "antd";
import { apiGet } from "../../api";
import { useSelector } from "react-redux";

const { Title } = Typography;

const LabPatientManagement = () => {
  // Mock patient data (replace with API call when available)
  const user = useSelector((state) => state.currentUserData);
  const doctorId = user?.role === "doctor" ? user?.userId : user?.createdBy;

  const patients = [
    {
      patientId: "pat001",
      patientName: "John Doe",
      testName: "Blood Test",
      testPrice: 500,
    },
    {
      patientId: "pat002",
      patientName: "Jane Smith",
      testName: "Urine Analysis",
      testPrice: 300,
    },
    {
      patientId: "pat003",
      patientName: "Alice Johnson",
      testName: "X-Ray",
      testPrice: 1000,
    },
  ];

  const columns = [
    {
      title: "Patient ID",
      dataIndex: "patientId",
      key: "patientId",
    },
    {
      title: "Patient Name",
      dataIndex: "patientName",
      key: "patientName",
    },
    {
      title: "Test Name",
      dataIndex: "testName",
      key: "testName",
    },
    {
      title: "Test Price (₹)",
      dataIndex: "testPrice",
      key: "testPrice",
      render: (price) => `₹${price.toLocaleString("en-IN")}`,
    },
  ];

  async function getAllTestsPatientsByDoctorID() {
    try {
      const response = await apiGet(
        `lab/getAllTestsPatientsByDoctorID${doctorId}`
      );
      console.log("getAllTestsPatientsByDoctorID", response);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    if (doctorId && user) {
      getAllTestsPatientsByDoctorID();
    }
  }, [user, doctorId]);

  return (
    <Card style={{ borderRadius: "8px", marginBottom: "24px" }}>
      <Row
        justify="space-between"
        align="middle"
        style={{ marginBottom: "16px" }}
      >
        <Col>
          <Title level={4} style={{ margin: 0 }}>
            Patients
          </Title>
        </Col>
      </Row>
      <Table
        columns={columns}
        dataSource={patients}
        rowKey="patientId"
        pagination={false}
      />
    </Card>
  );
};

export default LabPatientManagement;
