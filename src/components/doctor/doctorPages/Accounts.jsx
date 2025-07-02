import React, { useState } from "react";
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
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const AccountsPage = () => {
  const [filterDate, setFilterDate] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  
  const [searchText, setSearchText] = useState("");

  // Mock data for transactions
  const transactions = [
    {
      id: "TX1001",
      date: "2023-06-15",
      patient: "John Smith",
      service: "Consultation",
      amount: 120,
      status: "paid",
      paymentMethod: "Credit Card",
    },
    {
      id: "TX1002",
      date: "2023-06-14",
      patient: "Sarah Johnson",
      service: "Follow-up",
      amount: 80,
      status: "paid",
      paymentMethod: "Insurance",
    },
    {
      id: "TX1003",
      date: "2023-06-12",
      patient: "Michael Brown",
      service: "Procedure",
      amount: 350,
      status: "pending",
      paymentMethod: "Bank Transfer",
    },
    {
      id: "TX1004",
      date: "2023-06-10",
      patient: "Emily Davis",
      service: "Annual Checkup",
      amount: 150,
      status: "paid",
      paymentMethod: "Cash",
    },
    {
      id: "TX1005",
      date: "2023-06-08",
      patient: "Robert Wilson",
      service: "Vaccination",
      amount: 65,
      status: "refunded",
      paymentMethod: "Credit Card",
    },
  ];

  // Mock data for account summary
  const accountSummary = {
    totalEarnings: 765,
    pendingPayments: 350,
    lastPayment: 120,
    recentTransactions: 5,
  };

  const columns = [
    {
      title: "Transaction ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      sorter: (a, b) => new Date(a.date) - new Date(b.date),
    },
    {
      title: "Patient",
      dataIndex: "patient",
      key: "patient",
    },
    {
      title: "Service",
      dataIndex: "service",
      key: "service",
    },
    {
      title: "Amount ($)",
      dataIndex: "amount",
      key: "amount",
      render: (amount) => `$${amount}`,
      sorter: (a, b) => a.amount - b.amount,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = "";
        switch (status) {
          case "paid":
            color = "green";
            break;
          case "pending":
            color = "orange";
            break;
          case "refunded":
            color = "red";
            break;
          default:
            color = "gray";
        }
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
      filters: [
        { text: "Paid", value: "paid" },
        { text: "Pending", value: "pending" },
        { text: "Refunded", value: "refunded" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Payment Method",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button type="link">View</Button>
          <Button type="link">Print</Button>
        </Space>
      ),
    },
  ];

  const filteredTransactions = transactions.filter((transaction) => {
    // Filter by status
    if (filterStatus !== "all" && transaction.status !== filterStatus) {
      return false;
    }

    // Filter by search text
    if (
      searchText &&
      !transaction.patient.toLowerCase().includes(searchText.toLowerCase())
    ) {
      return false;
    }

    // Filter by date (if date filter is applied)
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
    <div style={{ padding: "24px" }}>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Title level={3}>Accounts Overview</Title>
          <Text type="secondary">
            Manage your financial transactions and earnings
          </Text>
        </Col>
      </Row>

      <Divider />

      {/* Summary Cards */}
      <Row gutter={16} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Earnings"
              value={accountSummary.totalEarnings}
              prefix={<DollarOutlined />}
              valueStyle={{ color: "#3f8600" }}
              suffix="$"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Pending Payments"
              value={accountSummary.pendingPayments}
              prefix={<DollarOutlined />}
              valueStyle={{ color: "#faad14" }}
              suffix="$"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Last Payment"
              value={accountSummary.lastPayment}
              prefix={<DollarOutlined />}
              valueStyle={{ color: "#3f8600" }}
              suffix="$"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Recent Transactions"
              value={accountSummary.recentTransactions}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: "24px" }}>
        <Row gutter={16} align="middle">
          <Col xs={24} sm={12} md={6}>
            <Text strong style={{ display: "block", marginBottom: "8px" }}>
              Date Range
            </Text>
            <RangePicker style={{ width: "100%" }} onChange={setFilterDate} />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Text strong style={{ display: "block", marginBottom: "8px" }}>
              Status
            </Text>
            <Select
              style={{ width: "100%" }}
              defaultValue="all"
              onChange={setFilterStatus}
            >
              <Option value="all">All Statuses</Option>
              <Option value="paid">Paid</Option>
              <Option value="pending">Pending</Option>
              <Option value="refunded">Refunded</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Text strong style={{ display: "block", marginBottom: "8px" }}>
              Search Patient
            </Text>
            <Input
              placeholder="Search by patient name"
              prefix={<SearchOutlined />}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Col>
          <Col
            xs={24}
            sm={12}
            md={6}
            style={{ display: "flex", alignItems: "flex-end" }}
          >
            <Space>
              <Button icon={<FilterOutlined />}>Apply Filters</Button>
              <Button icon={<DownloadOutlined />}>Export</Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Transactions Table */}
      <Card
        title="Transaction History"
        extra={
          <Space>
            <Button>Print Statement</Button>
            <Button type="primary">Request Payout</Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={filteredTransactions}
          rowKey="id"
          pagination={{ pageSize: 5 }}
        />
      </Card>

      {/* Recent Activity */}
      <Card title="Recent Activity" style={{ marginTop: "24px" }}>
        <div style={{ padding: "16px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "16px",
            }}
          >
            <div>
              <Text strong>Payment Received</Text>
              <Text type="secondary" style={{ display: "block" }}>
                From John Smith - Consultation
              </Text>
              <Text type="secondary">June 15, 2023</Text>
            </div>
            <div style={{ textAlign: "right" }}>
              <Text strong style={{ color: "#3f8600" }}>
                +$120.00
              </Text>
              <Text type="secondary" style={{ display: "block" }}>
                Credit Card
              </Text>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "16px",
            }}
          >
            <div>
              <Text strong>Payment Pending</Text>
              <Text type="secondary" style={{ display: "block" }}>
                From Michael Brown - Procedure
              </Text>
              <Text type="secondary">June 12, 2023</Text>
            </div>
            <div style={{ textAlign: "right" }}>
              <Text strong style={{ color: "#faad14" }}>
                +$350.00
              </Text>
              <Text type="secondary" style={{ display: "block" }}>
                Bank Transfer
              </Text>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <Text strong>Refund Processed</Text>
              <Text type="secondary" style={{ display: "block" }}>
                To Robert Wilson - Vaccination
              </Text>
              <Text type="secondary">June 8, 2023</Text>
            </div>
            <div style={{ textAlign: "right" }}>
              <Text strong style={{ color: "#ff4d4f" }}>
                -$65.00
              </Text>
              <Text type="secondary" style={{ display: "block" }}>
                Credit Card
              </Text>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AccountsPage;
