import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Tag,
  Space,
  Typography,
  Row,
  Col,
  Statistic,
  Button,
  DatePicker,
  Select,
  Input,
  Divider,
} from "antd";
import {
  DollarOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  SearchOutlined,
  DownloadOutlined,
  FilterOutlined,
  CreditCardOutlined,
  ClockCircleOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import {apiGet} from "../../../components/api"; // Adjust the import path as necessary
const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const AccountsPage = () => {
  const [filterDate, setFilterDate] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchText, setSearchText] = useState("");

  // Mock data for transactions matching the image
  const transactions = [
    {
      id: "TXN00123",
      date: "01-Jul-2025",
      patient: "John Doe",
      service: "Appointments",
      amount: 500,
      status: "paid",
      paymentMethod: "UPI",
    },
    {
      id: "TXN00124",
      date: "30-Jun-2025",
      patient: "Anita Rao",
      service: "Lab",
      amount: 1500,
      status: "pending",
      paymentMethod: "Cash",
    },
    {
      id: "TXN00125",
      date: "29-Jun-2025",
      patient: "Mike Johnson",
      service: "Pharmacy",
      amount: 750,
      status: "paid",
      paymentMethod: "Card",
    },
  ];

  // Mock data for account summary matching the image
  const [accountSummary, setAccountSummary] = useState({
    totalReceived: 0,
    totalExpenditure: 0,
    pendingTransactions: 0,
    recentTransactions: [],
  });

  useEffect(() => {
  const fetchRevenueData = async () => {
    try {
        const response = await apiGet("/finance/getDoctorRevenue");
        console.log("Revenue Data:", response.data);
      const apiData = response.data.data;

      setAccountSummary((prev) => ({
        ...prev,
        totalReceived: apiData.totalRevenue,
        recentTransactions: apiData.lastThreeTransactions.map((txn) => ({
          name: txn.username,
          amount: txn.finalAmount,
        })),
      }));
    } catch (error) {
      console.error("Failed to fetch revenue data:", error);
    }
  };

  fetchRevenueData();
}, []);

  const columns = [
    {
      title: "Transaction ID",
      dataIndex: "id",
      key: "id",
      width: 120,
    },
    {
      title: "Patient Name",
      dataIndex: "patient",
      key: "patient",
      width: 140,
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      width: 120,
      sorter: (a, b) => new Date(a.date) - new Date(b.date),
    },
    {
      title: "Service",
      dataIndex: "service",
      key: "service",
      width: 120,
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      width: 100,
      render: (amount) => `₹${amount}`,
      sorter: (a, b) => a.amount - b.amount,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status) => {
        let backgroundColor = "";
        let textColor = "";
        let borderColor = "";

        switch (status) {
          case "paid":
            backgroundColor = "#DCFCE7"; // light green background
            textColor = "#15803D"; // dark green text
            borderColor = "#BBF7D0"; // border color
            break;
          case "pending":
            backgroundColor = "#FFEDD5"; // light orange background
            textColor = "#9A3412"; // dark orange text
            borderColor = "#FDBA74"; // border color
            break;
          case "refunded":
            backgroundColor = "#FEE2E2"; // light red background
            textColor = "#B91C1C"; // dark red text
            borderColor = "#FCA5A5"; // border color
            break;
          default:
            backgroundColor = "#F3F4F6"; // light gray background
            textColor = "#6B7280"; // dark gray text
            borderColor = "#D1D5DB"; // border color
        }

        return (
          <Tag
            style={{
              backgroundColor: backgroundColor,
              color: textColor,
              borderColor: borderColor,
              borderRadius: "12px",
              padding: "0 8px",
              fontWeight: 500,
              borderWidth: "1px",
              borderStyle: "solid",
            }}
          >
            {status === "paid"
              ? "Paid"
              : status === "pending"
              ? "Pending"
              : "Refunded"}
          </Tag>
        );
      },
    },
    {
      title: "Payment Method",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      width: 120,
    },
    {
      title: "Action",
      key: "action",
      width: 80,
      render: (_, record) => (
        <Button type="link" size="small" style={{ color: "#1890ff" }}>
          👁
        </Button>
      ),
    },
  ];

  const filteredTransactions = transactions.filter((transaction) => {
    if (filterStatus !== "all" && transaction.status !== filterStatus) {
      return false;
    }

    if (
      searchText &&
      !transaction.patient.toLowerCase().includes(searchText.toLowerCase())
    ) {
      return false;
    }

    if (filterDate) {
      const transactionDate = new Date(transaction.date);
      const startDate = new Date(filterDate[0]);
      const endDate = new Date(filterDate[1]);

      if (transactionDate < startDate || transactionDate > endDate) {
        return false;
      }
    }

    return true;
  });

  return (
    <div
      style={{
        padding: "24px",
        backgroundColor: "#F3FFFD",
        minHeight: "100vh",
      }}
    >
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Title level={2} style={{ margin: 0, fontWeight: 600 }}>
            Accounts
          </Title>
          <Text type="secondary" style={{ fontSize: "14px" }}>
            View and manage your account activity and transactions
          </Text>
        </Col>
      </Row>

      <div style={{ marginTop: "24px" }}>
        {/* Summary Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
          <Col xs={24} sm={12} md={6}>
            <Card
              style={{
                borderRadius: "8px",
                border: "1px solid #e8e8e8",
                boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "8px",
                }}
              >
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    backgroundColor: "#52c41a",
                    borderRadius: "4px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: "12px",
                  }}
                >
                  <CreditCardOutlined
                    style={{ color: "white", fontSize: "16px" }}
                  />
                </div>
              </div>
              <div>
                <Text
                  style={{ fontSize: "24px", fontWeight: "600", color: "#000" }}
                >
                  ₹{accountSummary.totalReceived.toLocaleString()}
                </Text>
                <div
                  style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}
                >
                  Total Amount Received
                </div>
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Card
              style={{
                borderRadius: "8px",
                border: "1px solid #e8e8e8",
                boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "8px",
                }}
              >
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    backgroundColor: "#ff4d4f",
                    borderRadius: "4px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: "12px",
                  }}
                >
                  <CreditCardOutlined
                    style={{ color: "white", fontSize: "16px" }}
                  />
                </div>
              </div>
              <div>
                <Text
                  style={{ fontSize: "24px", fontWeight: "600", color: "#000" }}
                >
                  ₹{accountSummary.totalExpenditure.toLocaleString()}
                </Text>
                <div
                  style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}
                >
                  Total Expenditure
                </div>
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Card
              style={{
                borderRadius: "8px",
                border: "1px solid #e8e8e8",
                boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "8px",
                }}
              >
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    backgroundColor: "#faad14",
                    borderRadius: "4px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: "12px",
                  }}
                >
                  <ClockCircleOutlined
                    style={{ color: "white", fontSize: "16px" }}
                  />
                </div>
              </div>
              <div>
                <Text
                  style={{ fontSize: "24px", fontWeight: "600", color: "#000" }}
                >
                  {accountSummary.pendingTransactions}
                </Text>
                <div
                  style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}
                >
                  Pending Transactions
                </div>
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Card
              style={{
                borderRadius: "8px",
                border: "1px solid #e8e8e8",
                boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "8px",
                }}
              >
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    backgroundColor: "#1890ff",
                    borderRadius: "4px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: "12px",
                  }}
                >
                  <SyncOutlined style={{ color: "white", fontSize: "16px" }} />
                </div>
              </div>
              <div>
                <Text
                  style={{ fontSize: "14px", fontWeight: "600", color: "#000" }}
                >
                  Recent Transactions
                </Text>
                <div style={{ marginTop: "8px" }}>
                  {accountSummary.recentTransactions.map(
                    (transaction, index) => (
                      <div
                        key={index}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          fontSize: "12px",
                          marginBottom: "4px",
                        }}
                      >
                        <Text style={{ fontSize: "12px", color: "#666" }}>
                          {transaction.name}
                        </Text>
                        <Text style={{ fontSize: "12px", fontWeight: "500" }}>
                          ₹{transaction.amount}
                        </Text>
                      </div>
                    )
                  )}
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Transaction History */}
        <Card
          style={{
            borderRadius: "8px",
            border: "1px solid #e8e8e8",
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
          }}
        >
          <div style={{ marginBottom: "24px" }}>
            <Title level={4} style={{ margin: 0, fontWeight: 600 }}>
              Transaction History
            </Title>
          </div>

          {/* Search and Filter Bar */}
          <div
            style={{
              backgroundColor: "#f8f9fa",
              padding: "16px",
              borderRadius: "8px",
              marginBottom: "24px",
            }}
          >
            <Row gutter={16} align="middle">
              <Col flex="1" style={{ minWidth: "280px" }}>
                <Input
                  placeholder="Search by Patient Name or Transaction ID"
                  prefix={<SearchOutlined style={{ color: "#8c8c8c" }} />}
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{
                    borderRadius: "6px",
                    border: "1px solid #d9d9d9",
                    backgroundColor: "white",
                  }}
                />
              </Col>
              <Col>
                <RangePicker
                  placeholder={["Start Date", "End Date"]}
                  style={{
                    width: "220px",
                    borderRadius: "6px",
                    border: "1px solid #d9d9d9",
                  }}
                  onChange={(dates) => setFilterDate(dates)}
                  value={filterDate}
                  allowClear
                />
              </Col>
              <Col>
                <Select
                  style={{
                    width: "140px",
                    borderRadius: "6px",
                  }}
                  defaultValue="all"
                  onChange={setFilterStatus}
                >
                  <Option value="all">All Services</Option>
                  <Option value="appointments">Appointments</Option>
                  <Option value="lab">Lab</Option>
                  <Option value="pharmacy">Pharmacy</Option>
                </Select>
              </Col>
              <Col>
                <Select
                  style={{
                    width: "120px",
                    borderRadius: "16px",
                  }}
                  defaultValue="all"
                >
                  <Option value="all">All Status</Option>
                  <Option value="paid">Paid</Option>
                  <Option value="pending">Pending</Option>
                  <Option value="refunded">Refunded</Option>
                </Select>
              </Col>
              <Col>
                <Button
                  type="primary"
                  icon={<DownloadOutlined />}
                  style={{
                    backgroundColor: "#52c41a",
                    borderColor: "#52c41a",
                    borderRadius: "6px",
                    boxShadow: "none",
                  }}
                >
                  Export
                </Button>
              </Col>
            </Row>
          </div>

          <Table
            columns={columns}
            dataSource={filteredTransactions}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: false,
              showQuickJumper: false,
              style: { marginTop: "16px" },
            }}
            style={{
              backgroundColor: "white",
              borderRadius: "8px",
            }}
          />

          <div
            style={{
              marginTop: "16px",
              fontSize: "12px",
              color: "#666",
              textAlign: "left",
            }}
          >
            Showing 1 to 3 of 97 results
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AccountsPage;
