import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Card,
  Row,
  Col,
  Typography,
  Table,
  Divider,
  Button,
  Descriptions,
  Tag,
} from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import moment from "moment";

const { Title, Text } = Typography;

const PreviousPrescriptions = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { prescriptions, patientName } = location.state || {};

  const medicationColumns = [
    {
      title: "Medicine Name",
      dataIndex: ["medName"],
      key: "medName",
    },
    {
      title: "Type",
      dataIndex: ["medicineType"],
      key: "medicineType",
    },
    {
      title: "Dosage",
      dataIndex: ["dosage"],
      key: "dosage",
    },
    {
      title: "Duration (days)",
      dataIndex: ["duration"],
      key: "duration",
    },
    {
      title: "Frequency",
      dataIndex: ["frequency"],
      key: "frequency",
    },
    {
      title: "Timings",
      dataIndex: ["timings"],
      key: "timings",
      render: (timings) => (
        <div>
          {timings?.map((time, index) => (
            <Tag key={index}>{time}</Tag>
          ))}
        </div>
      ),
    },
    {
      title: "Quantity",
      dataIndex: ["quantity"],
      key: "quantity",
    },
  ];

  const testColumns = [
    {
      title: "Test Name",
      dataIndex: ["testName"],
      key: "testName",
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(-1)}
        style={{ marginBottom: 16 }}
      >
        Back to Appointments
      </Button>

      <Title level={2} style={{ marginBottom: 24 }}>
        Previous Prescriptions for {patientName}
      </Title>

      {prescriptions?.length > 0 ? (
        prescriptions.map((prescription, index) => (
          <Card
            key={prescription._id}
            style={{ marginBottom: 24 }}
            title={
              <div>
                <Text strong>Prescription ID: {prescription.prescriptionId}</Text>
                <br />
                <Text type="secondary">
                  Date:{" "}
                  {moment(prescription.createdAt).format("MMMM Do YYYY, h:mm a")}
                </Text>
              </div>
            }
            extra={
              <Tag color="blue">
                Appointment: {prescription.appointmentId}
              </Tag>
            }
          >
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Patient Information">
                <div>
                  <Text strong>Name: </Text>
                  {prescription.patientInfo.patientName}
                  <br />
                  <Text strong>Age: </Text>
                  {prescription.patientInfo.age}
                  <br />
                  <Text strong>Gender: </Text>
                  {prescription.patientInfo.gender}
                  <br />
                  <Text strong>Mobile: </Text>
                  {prescription.patientInfo.mobileNumber}
                </div>
              </Descriptions.Item>

              <Descriptions.Item label="Chief Comaplaint">
                {prescription.patientInfo.chiefComplaint || "N/A"}
              </Descriptions.Item>

              {prescription.vitals && (
                <Descriptions.Item label="Vitals">
                  <Row gutter={16}>
                    <Col span={8}>
                      <Text strong>BP: </Text>
                      {prescription.vitals.bp || "N/A"}
                    </Col>
                    <Col span={8}>
                      <Text strong>Pulse: </Text>
                      {prescription.vitals.pulseRate || "N/A"}
                    </Col>
                    <Col span={8}>
                      <Text strong>Temp: </Text>
                      {prescription.vitals.temperature || "N/A"}°F
                    </Col>
                    <Col span={8}>
                      <Text strong>SpO2: </Text>
                      {prescription.vitals.spo2 || "N/A"}%
                    </Col>
                    <Col span={8}>
                      <Text strong>Height: </Text>
                      {prescription.vitals.height || "N/A"} cm
                    </Col>
                    <Col span={8}>
                      <Text strong>Weight: </Text>
                      {prescription.vitals.weight || "N/A"} kg
                    </Col>
                    <Col span={8}>
                      <Text strong>BMI: </Text>
                      {prescription.vitals.bmi || "N/A"}
                    </Col>
                  </Row>
                </Descriptions.Item>
              )}

              <Descriptions.Item label="Diagnosis">
                {prescription.diagnosis.diagnosisNote || "N/A"}
              </Descriptions.Item>

              {prescription.diagnosis?.selectedTests?.length > 0 && (
                <Descriptions.Item label="Recommended Tests">
                  <Table
                    columns={testColumns}
                    dataSource={prescription.diagnosis.selectedTests}
                    rowKey="testInventoryId"
                    pagination={false}
                    size="small"
                  />
                </Descriptions.Item>
              )}

              {prescription.diagnosis?.medications?.length > 0 && (
                <Descriptions.Item label="Medications">
                  <Table
                    columns={medicationColumns}
                    dataSource={prescription.diagnosis.medications}
                    rowKey="medInventoryId"
                    pagination={false}
                  />
                </Descriptions.Item>
              )}

              <Descriptions.Item label="Advice">
                {prescription.advice.advice || "N/A"}
              </Descriptions.Item>

              {prescription.advice.followUpDate && (
                <Descriptions.Item label="Follow Up Date">
                  {moment(prescription.advice.followUpDate).format("MMMM Do YYYY")}
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>
        ))
      ) : (
        <Card>
          <Text>No previous prescriptions found for this patient.</Text>
        </Card>
      )}
    </div>
  );
};

export default PreviousPrescriptions;