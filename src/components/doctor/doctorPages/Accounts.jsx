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
  ArrowUpOutlined,
  ArrowDownOutlined,
  SearchOutlined,
  DownloadOutlined,
  CreditCardOutlined,
  ClockCircleOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import {apiGet, apiPost} from "../../../components/api"; // Adjust the import path as necessary
import { Modal, Descriptions } from "antd";

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
import dayjs from "dayjs";

const AccountsPage = () => {
  const [filterDate, setFilterDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [searchText, setSearchText] = useState("");

  const [transactions, setTransactions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [filterService, setFilterService] = useState("");
  const [filterStatusAPI, setFilterStatusAPI] = useState("");

  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const [patientHistory, setPatientHistory] = useState(null);
 const [loadingHistory, setLoadingHistory] = useState(false);



  // const transactions = [
  //   {
  //     id: "TXN00123",
  //     date: "01-Jul-2025",
  //     patient: "John Doe",
  //     service: "Appointments",
  //     amount: 500,
  //     status: "paid",
  //     paymentMethod: "UPI",
  //   },
  //   {
  //     id: "TXN00124",
  //     date: "30-Jun-2025",
  //     patient: "Anita Rao",
  //     service: "Lab",
  //     amount: 1500,
  //     status: "pending",
  //     paymentMethod: "Cash",
  //   },
  //   {
  //     id: "TXN00125",
  //     date: "29-Jun-2025",
  //     patient: "Mike Johnson",
  //     service: "Pharmacy",
  //     amount: 750,
  //     status: "paid",
  //     paymentMethod: "Card",
  //   },
  // ];

 // Map API response to table data format
  const mappedTransactions = transactions.map((txn) => ({
    id: txn.paymentId || txn._id,
    patient: txn.patientName || "-",
    date: txn.paidAt ? dayjs(txn.paidAt).format("DD-MMM-YYYY") : "-",
    startDate: txn.startDate ? dayjs(txn.startDate).format("DD-MMM-YYYY") : undefined,
    endDate: txn.endDate ? dayjs(txn.endDate).format("DD-MMM-YYYY") : undefined,
    service:
      txn.paymentFrom === "appointments"
        ? "Appointments"
        : txn.paymentFrom === "lab"
        ? "Lab"
        : txn.paymentFrom === "pharmacy"
        ? "Pharmacy"
        : txn.paymentFrom || "-",
    amount: txn.finalAmount || txn.actualAmount || 0,
    status: txn.paymentStatus || "-",
    paymentMethod: txn.paymentMethod
      ? txn.paymentMethod.charAt(0).toUpperCase() + txn.paymentMethod.slice(1)
      : "-",
    raw: txn,
  }));
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

 useEffect(() => {
  const fetchTransactions = async () => {
    const startDate = filterDate?.[0]
      ? dayjs(filterDate[0]).format("YYYY-MM-DD")
      : undefined;
    const endDate = filterDate?.[1]
      ? dayjs(filterDate[1]).format("YYYY-MM-DD")
      : null;

    const payload = {
      service: filterService,
      status: filterStatusAPI,
      startDate,
      endDate,
      search: searchText || "",
      page: currentPage,
      limit: 10,
    };
   

    try {
      const response = await apiPost("/finance/getTransactionHistory", payload);
      const data = response.data;
      console.log("Transaction History Data:", data.data);
      

  setTransactions(data.data || []); // API response has .data inside .data
  setTotalItems(data.totalResults || 0);

      // setTransactions(data || []);
      // setTotalItems(data.total || 0);
    } catch (err) {
      console.error("Error fetching transaction history", err);
    }
  };

  fetchTransactions();
}, [filterDate, filterService, filterStatusAPI, searchText, currentPage]);

useEffect(() => {
  const fetchPatientHistory = async () => {
    if (!selectedTransaction?.paymentId && !selectedTransaction?._id) return;

    const paymentId = selectedTransaction.paymentId || selectedTransaction._id;

    setLoadingHistory(true);
    try {
      const response = await apiGet(`/finance/getPatientHistory?paymentId=${paymentId}`);
      console.log("Patient History:", response.data);
      setPatientHistory(response.data.data); // adjust based on API response structure
    } catch (error) {
      console.error("Failed to fetch patient history", error);
      setPatientHistory(null);
    } finally {
      setLoadingHistory(false);
    }
  };

  if (viewModalVisible) {
    fetchPatientHistory();
  }
}, [viewModalVisible, selectedTransaction]);



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
        <Button
      type="link"
      size="small"
      style={{ color: "#1890ff" }}
      onClick={() => {
        setSelectedTransaction(record.raw);
        setViewModalVisible(true);
      }}
    >
      👁
    </Button>
      ),
    },
  ];

  //   if (filterStatus !== "all" && transaction.status !== filterStatus) {
  //     return false;
  //   }

  //   if (
  //     searchText &&
  //     !transaction.patient.toLowerCase().includes(searchText.toLowerCase())
  //   ) {
  //     return false;
  //   }

  //   if (filterDate) {
  //     const transactionDate = new Date(transaction.date);
  //     const startDate = new Date(filterDate[0]);
  //     const endDate = new Date(filterDate[1]);

  //     if (transactionDate < startDate || transactionDate > endDate) {
  //       return false;
  //     }
  //   }

  //   return true;
  // });

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
            <div
              style={{
                cursor: "pointer",
                transition: "box-shadow 0.2s, transform 0.2s",
                borderRadius: "8px",
              }}
              onClick={() => {
                // Replace with your navigation logic, e.g. react-router-dom's useNavigate
                window.location.href = "/doctor/doctorPages/TotalExpenditure";
              }}
              onMouseOver={e => {
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(255,77,79,0.15)";
                e.currentTarget.style.transform = "translateY(-2px) scale(1.03)";
              }}
              onMouseOut={e => {
                e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.05)";
                e.currentTarget.style.transform = "none";
                }}
              >
                <Card
                style={{
                  borderRadius: "8px",
                  // border: "1px solid #e8e8e8",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                }}
                bodyStyle={{ cursor: "pointer" }}
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
              </div>
              </Col>

              <Col xs={24} sm={12} md={6}>
              <div
                style={{
                cursor: "pointer",
                transition: "box-shadow 0.2s, transform 0.2s",
                borderRadius: "8px",
                }}
                onClick={() => {
                // Navigate to pending transactions page
                window.location.href = "/doctor/doctorPages/PendingTransactions";
                }}
                onMouseOver={e => {
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(250,173,20,0.15)";
                e.currentTarget.style.transform = "translateY(-2px) scale(1.03)";
                }}
                onMouseOut={e => {
                e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.05)";
                e.currentTarget.style.transform = "none";
                }}
              >
                <Card
                style={{
                  borderRadius: "8px",
                  // border: "1px solid #e8e8e8",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                }}
                bodyStyle={{ cursor: "pointer" }}
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
              </div>
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
                  onChange={(dates) => {
                    setFilterDate(dates);
                    console.log("Selected dates:", dates);
                    }}
                  value={filterDate}
                  allowClear
                />
              </Col>
              <Col>
                <Select
                  style={{ width: "140px", borderRadius: "6px" }}
                  value={filterService}
                  onChange={setFilterService}
                >
                  <Option value="">All Services</Option>
                  <Option value="appointment">Appointments</Option>
                  <Option value="lab">Lab</Option>
                  <Option value="pharmacy">Pharmacy</Option>
                </Select>

                <Select
                  style={{ width: "120px", borderRadius: "16px" }}
                  value={filterStatusAPI}
                  onChange={setFilterStatusAPI}
                >
                  placeholder="Select Status"
                  <Option value="">All Status</Option>
                  <Option value="paid">Paid</Option>
                  <Option value="pending">Pending</Option>
                  <Option value="refund">Refunded</Option>
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
                    marginLeft: "800%",
                    marginTop: "8px",
                  }}
                >
                  Export
                </Button>
              </Col>
            </Row>
          </div>

          <Table
            columns={columns}
            dataSource={mappedTransactions}
            rowKey="id"
            pagination={{
              current: currentPage,
              pageSize: 10,
              total: totalItems,
              onChange: (page) => setCurrentPage(page),
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
            Showing {mappedTransactions.length > 0 ? ((currentPage - 1) * 10 + 1) : 0} to{" "}
            {Math.min(currentPage * 10, totalItems)} of {totalItems} results
          </div>
        </Card>

        {/* View Transaction Modal */}
        <Modal
          open={viewModalVisible}
          title="Transaction Details"
          onCancel={() => {
            setViewModalVisible(false);
            setPatientHistory(null);
          }}
          footer={null}
          width={600}
        >
          {selectedTransaction && (
            <Descriptions bordered column={1} size="small" style={{ marginBottom: 24 }}>
              <Descriptions.Item label="Transaction ID">
                {selectedTransaction.paymentId || selectedTransaction._id}
              </Descriptions.Item>
              <Descriptions.Item label="Patient Name">
                {selectedTransaction.patientName || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Service">
                {selectedTransaction.paymentFrom}
              </Descriptions.Item>
              <Descriptions.Item label="Amount">
                ₹{selectedTransaction.finalAmount || selectedTransaction.actualAmount}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                {selectedTransaction.paymentStatus}
              </Descriptions.Item>
              <Descriptions.Item label="Payment Method">
                {selectedTransaction.paymentMethod}
              </Descriptions.Item>
              <Descriptions.Item label="Paid At">
                {selectedTransaction.paidAt
                  ? dayjs(selectedTransaction.paidAt).format("DD-MMM-YYYY")
                  : "-"}
              </Descriptions.Item>
              
            </Descriptions>
          )}

          <Divider>Patient History</Divider>

          {loadingHistory ? (
            <div style={{ textAlign: "center" }}>
              <SyncOutlined spin style={{ fontSize: 24 }} />
            </div>
          ) : patientHistory ? (
            <>
              <Descriptions column={1} size="small" bordered title="Patient Details">
                <Descriptions.Item label="Full Name">
                  {patientHistory.userDetails?.firstname} {patientHistory.userDetails?.lastname}
                </Descriptions.Item>
                <Descriptions.Item label="Patien Id">
                  {patientHistory.userDetails?.patientId || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Gender">
                  {patientHistory.userDetails?.gender || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Date of Birth">
                  {patientHistory.userDetails?.DOB || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Contact Number">
                  {patientHistory.userDetails?.mobile || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Relationship">
                  {patientHistory.userDetails?.relationship || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  {patientHistory.userDetails?.status || "N/A"}
                </Descriptions.Item>
              </Descriptions>

              <Divider />

              <Descriptions column={1} size="small" bordered title="Details">
                <Descriptions.Item label="Doctor ID">
                {selectedTransaction.doctorID || selectedTransaction.doctorId || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Pharmacy Med ID">
                {selectedTransaction.pharmacyMedID || selectedTransaction.pharmacyMedId || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Medicine Name">
                {selectedTransaction.medName || selectedTransaction.medName || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Payment Status">
                {selectedTransaction.paymentStatus || "N/A"}
              </Descriptions.Item>
                <Descriptions.Item label="Department">
                  {patientHistory.appointmentDetails?.appointmentDepartment || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Type">
                  {patientHistory.appointmentDetails?.appointmentType || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Date & Time">
                  {dayjs(patientHistory.appointmentDetails?.appointmentDate).format("DD-MMM-YYYY")} at{" "}
                  {patientHistory.appointmentDetails?.appointmentTime}
                </Descriptions.Item>
                <Descriptions.Item label="Reason">
                  {patientHistory.appointmentDetails?.appointmentReason || "N/A"}
                </Descriptions.Item>
              </Descriptions>
            </>
          ) : (
            <div style={{ textAlign: "center", color: "#999" }}>
              No patient history found.
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default AccountsPage;
