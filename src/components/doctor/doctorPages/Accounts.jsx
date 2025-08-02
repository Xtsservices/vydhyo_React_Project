import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  Table,
  Tag,
  Space,
  Typography,
  Row,
  Col,
  Button,
  DatePicker,
  Select,
  Input,
  Divider,
  Modal,
  Descriptions,
  Spin,
  message,
} from "antd";
import {
  CreditCardOutlined,
  ClockCircleOutlined,
  SyncOutlined,
  SearchOutlined,
  DownloadOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { apiGet, apiPost } from "../../../components/api";
import "../../stylings/Accounts.css";
import dayjs from "dayjs";
import { useSelector } from "react-redux";

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const AccountsPage = () => {
  // Get user data from Redux
  const user = useSelector((state) => state.currentUserData);
  const doctorId = user?.role === "doctor" ? user?.userId : user?.createdBy;

  // State for filters
  const [filterDate, setFilterDate] = useState([]);
  const [filterService, setFilterService] = useState();
  const [filterStatus, setFilterStatus] = useState("");
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Data state
  const [transactions, setTransactions] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);

  // Modal state
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [transactionDetails, setTransactionDetails] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Summary data
  const [accountSummary, setAccountSummary] = useState({
    totalReceived: 0,
    totalExpenditure: 0,
    pendingTransactions: 0,
    recentTransactions: [],
  });

  // Function to group transactions by patient name
  const groupTransactions = (transactions) => {
    const grouped = {};
    
    transactions.forEach((txn) => {
      const patientName = txn.userDetails 
        ? `${txn.userDetails.firstname || ''} ${txn.userDetails.lastname || ''}`.trim()
        : txn.patientName || "unknown";
      
      const key = patientName;
      
      if (!grouped[key]) {
        grouped[key] = {
          count: 0,
          totalAmount: 0,
          latestTxn: txn,
          allTxns: [],
          patientName: patientName,
          services: new Set(),
          paymentMethods: new Set(),
          statuses: new Set(),
        };
      }
      
      grouped[key].count++;
      grouped[key].totalAmount += txn.finalAmount || txn.actualAmount || 0;
      grouped[key].allTxns.push(txn);
      
      // Track unique services, payment methods, and statuses
      if (txn.paymentFrom) grouped[key].services.add(txn.paymentFrom);
      if (txn.paymentMethod) grouped[key].paymentMethods.add(txn.paymentMethod);
      if (txn.paymentStatus) grouped[key].statuses.add(txn.paymentStatus);
      
      // Keep the latest transaction
      const currentDate = txn.paidAt ? new Date(txn.paidAt) : new Date(0);
      const latestDate = grouped[key].latestTxn.paidAt ? new Date(grouped[key].latestTxn.paidAt) : new Date(0);
      
      if (currentDate > latestDate) {
        grouped[key].latestTxn = txn;
      }
    });
    
    return Object.values(grouped).map((group) => ({
      ...group.latestTxn,
      groupedCount: group.count,
      groupedAmount: group.totalAmount,
      allTransactions: group.allTxns,
      patientName: group.patientName,
      services: Array.from(group.services).join(", "),
      paymentMethods: Array.from(group.paymentMethods).join(", "),
      statuses: Array.from(group.statuses).join(", "),
    }));
  };

  // Memoized function to map transactions
  const mappedTransactions = groupTransactions(transactions).map((txn) => ({
    id: txn.paymentId || txn._id,
    patient: txn.patientName,
    date: txn.paidAt ? dayjs(txn.paidAt).format("DD-MMM-YYYY") : "-",
    service: txn.services || getServiceName(txn.paymentFrom),
    amount: txn.groupedAmount || txn.finalAmount || txn.actualAmount || 0,
    status: txn.statuses || txn.paymentStatus || "-",
    paymentMethod: txn.paymentMethods || (txn.paymentMethod
      ? txn.paymentMethod.charAt(0).toUpperCase() + txn.paymentMethod.slice(1)
      : "-"),
    raw: txn,
    count: txn.groupedCount || 1,
    allTransactions: txn.allTransactions || [txn],
  }));

  function getServiceName(paymentFrom) {
    switch (paymentFrom) {
      case "appointments":
        return "Appointments";
      case "lab":
        return "Lab";
      case "pharmacy":
        return "Pharmacy";
      default:
        return paymentFrom || "-";
    }
  }

  // Fetch revenue data
  useEffect(() => {
    const fetchRevenueData = async () => {
      if (!doctorId) return;
      
      try {
        const response = await apiGet(`/finance/getDoctorRevenue?doctorId=${doctorId}`);
        const apiData = response.data.data;

        setAccountSummary((prev) => ({
          ...prev,
          totalReceived: apiData.totalRevenue,
          totalExpenditure: apiData.totalExpenditure,
          recentTransactions: apiData.lastThreeTransactions.map((txn) => ({
            name: txn.username,
            amount: txn.finalAmount,
          })),
        }));
      } catch (error) {
        console.error("Error fetching revenue data:", error);
      }
    };

    fetchRevenueData();
  }, [doctorId]);

  // Fetch transactions with optimized API calls
  const fetchTransactions = useCallback(async () => {
    if (!doctorId) return;
    
    setLoading(true);

    const payload = {
      service: filterService,
      status: filterStatus,
      search: searchText,
      page: currentPage,
      limit: 100,
      doctorId: doctorId,
    };

    if (filterDate && filterDate.length === 2) {
      payload.startDate = dayjs(filterDate[0]).format("YYYY-MM-DD");
      payload.endDate = dayjs(filterDate[1]).format("YYYY-MM-DD");
    }

    try {
      const response = await apiPost("/finance/getTransactionHistory", payload);
      const data = response.data;

      setTransactions(data.data || []);
      setTotalItems(data.totalResults || 0);
    } catch (err) {
      console.error("Error fetching transactions:", err);
    } finally {
      setLoading(false);
    }
  }, [doctorId, filterDate, filterService, filterStatus, searchText, currentPage]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Fetch transaction details for all transactions in the group
  const fetchTransactionDetails = useCallback(async () => {
    if (!selectedTransaction || !doctorId) return;

    setLoadingDetails(true);
    try {
      const paymentIds = selectedTransaction.allTransactions.map(
        (txn) => txn.paymentId || txn._id
      );
      
      const response = await Promise.all(
        paymentIds.map((paymentId) =>
          apiGet(`/finance/getPatientHistory?paymentId=${paymentId}&doctorId=${doctorId}`)
        )
      );
      
      const details = response.map((res) => res.data.data);
      setTransactionDetails(details);
    } catch (error) {
      console.error("Error fetching transaction details:", error);
      setTransactionDetails([]);
    } finally {
      setLoadingDetails(false);
    }
  }, [selectedTransaction, doctorId]);

  useEffect(() => {
    if (viewModalVisible) {
      fetchTransactionDetails();
    }
  }, [viewModalVisible, fetchTransactionDetails]);

  const handleExport = async () => {
    try {
      const exportData = mappedTransactions.map((txn) => ({
        "Transaction ID": txn.id,
        "Patient Name": txn.patient,
        "Date": txn.date,
        "Service": txn.service,
        "Amount": txn.amount,
        "Status": txn.status === "paid" ? "Paid" : txn.status === "pending" ? "Pending" : "Refunded",
        "Payment Method": txn.paymentMethod,
        "Transactions Count": txn.count,
      }));

      const headers = Object.keys(exportData[0]).join(",");
      const rows = exportData
        .map((obj) =>
          Object.values(obj)
            .map((value) => {
              const stringValue = String(value || "");
              return `"${stringValue.replace(/"/g, '""')}"`;
            })
            .join(",")
        )
        .join("\r\n");
      
      const csvContent = "\uFEFF" + `${headers}\r\n${rows}`;

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `transactions_${dayjs().format("YYYYMMDD_HHmmss")}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      message.success("Export completed successfully");
    } catch (error) {
      message.error("Failed to export transactions");
    }
  };

  // Columns configuration
  const columns = [
    {
      title: "Transaction ID",
      dataIndex: "id",
      key: "id",
      width: 120,
      render: (id, record) => (
        <div>
          {id}
          {record.count > 1 && (
            <Tag style={{ marginLeft: 5 }}>{record.count} transactions</Tag>
          )}
        </div>
      ),
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
      render: (amount) => <div>₹{amount}</div>,
      sorter: (a, b) => a.amount - b.amount,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status) => {
        const statuses = status.split(", ");
        const primaryStatus = statuses[0]; // Show the first status as primary
        
        let color = "";
        switch (primaryStatus) {
          case "paid":
            color = "green";
            break;
          case "pending":
            color = "orange";
            break;
          default:
            color = "default";
        }
        
        return (
          <Space>
            <Tag color={color}>
              {primaryStatus === "paid"
                ? "Paid"
                : primaryStatus === "pending"
                ? "Pending"
                : "Refunded"}
            </Tag>
            {statuses.length > 1 && (
              <Tag>+{statuses.length - 1}</Tag>
            )}
          </Space>
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
          icon={<EyeOutlined />}
          onClick={() => {
            setSelectedTransaction(record.raw);
            setViewModalVisible(true);
          }}
        />
      ),
    },
  ];

  // Render transaction details based on service type
  const renderTransactionDetails = () => {
    if (!selectedTransaction || !transactionDetails.length) {
      return <Text>No details available</Text>;
    }

    const groupedTransactions = selectedTransaction.allTransactions || [selectedTransaction.raw];

    return (
      <div>
        <Descriptions bordered column={1} size="small">
          <Descriptions.Item label="Patient Name">
            {selectedTransaction.patientName || 
             (selectedTransaction.userDetails 
              ? `${selectedTransaction.userDetails.firstname || ''} ${selectedTransaction.userDetails.lastname || ''}`.trim()
              : "-")}
          </Descriptions.Item>
          <Descriptions.Item label="Services">
            {selectedTransaction.services || getServiceName(selectedTransaction.paymentFrom)}
          </Descriptions.Item>
          <Descriptions.Item label="Total Amount">
            ₹{selectedTransaction.groupedAmount || selectedTransaction.finalAmount || selectedTransaction.actualAmount}
          </Descriptions.Item>
          <Descriptions.Item label="Number of Transactions">
            {selectedTransaction.count || 1}
          </Descriptions.Item>
          <Descriptions.Item label="Statuses">
            {selectedTransaction.statuses || selectedTransaction.paymentStatus}
          </Descriptions.Item>
          <Descriptions.Item label="Payment Methods">
            {selectedTransaction.paymentMethods || selectedTransaction.paymentMethod}
          </Descriptions.Item>
        </Descriptions>

        <Divider orientation="left" style={{ marginTop: 20 }}>
          Individual Transactions
        </Divider>

        {groupedTransactions.map((txn, index) => {
          const txnDetails = transactionDetails[index] || {};

          return (
            <Descriptions
              key={index}
              bordered
              column={1}
              size="small"
              style={{ marginBottom: 16 }}
            >
              <Descriptions.Item label="Transaction ID">
                {txn.paymentId || txn._id}
              </Descriptions.Item>
              <Descriptions.Item label="Date">
                {txn.paidAt ? dayjs(txn.paidAt).format("DD-MMM-YYYY") : "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Service">
                {getServiceName(txn.paymentFrom)}
              </Descriptions.Item>
              <Descriptions.Item label="Actual Amount">
                ₹{txn.actualAmount || 0}
              </Descriptions.Item>
              <Descriptions.Item label="Discount">
                {txn.discount || 0} {txn.discountType === "percentage" ? "%" : "₹"}
              </Descriptions.Item>
              <Descriptions.Item label="Final Amount">
                ₹{txn.finalAmount || 0}
              </Descriptions.Item>
              <Descriptions.Item label="Currency">
                {txn.currency || "INR"}
              </Descriptions.Item>
              <Descriptions.Item label="Paid At">
                {txn.paidAt
                  ? dayjs(txn.paidAt).format("DD-MMM-YYYY HH:mm")
                  : "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                {txn.paymentStatus}
              </Descriptions.Item>
              <Descriptions.Item label="Payment Method">
                {txn.paymentMethod
                  ? txn.paymentMethod.charAt(0).toUpperCase() + txn.paymentMethod.slice(1)
                  : "-"}
              </Descriptions.Item>

              {/* Service-specific details */}
              {txn.paymentFrom === "appointments" && (
                <>
                  <Descriptions.Item label="Appointment Type">
                    {txnDetails.appointmentDetails?.appointmentType || "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Department">
                    {txnDetails.appointmentDetails?.appointmentDepartment || "N/A"}
                  </Descriptions.Item>
                </>
              )}

              {txn.paymentFrom === "lab" && (
                <Descriptions.Item label="Test Name">
                  {txnDetails.labDetails?.testName || "N/A"}
                </Descriptions.Item>
              )}

              {txn.paymentFrom === "pharmacy" && (
                <>
                  <Descriptions.Item label="Medicine Name">
                    {txnDetails.pharmacyDetails?.medName || "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Quantity">
                    {txnDetails.pharmacyDetails?.quantity || "N/A"}
                  </Descriptions.Item>
                </>
              )}
            </Descriptions>
          );
        })}
      </div>
    );
  };

  return (
    <div className="accounts-container">
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Title level={2} className="page-title">
            Accounts
          </Title>
          <Text type="secondary" className="page-subtitle">
            View and manage your account activity and transactions
          </Text>
        </Col>
      </Row>

      <div className="content-section">
        {/* Summary Cards */}
        <Row gutter={[16, 16]} className="summary-row">
          <Col xs={24} sm={12} md={8}>
            <Card className="summary-card">
              <div className="card-icon-container">
                <div className="card-icon green">
                  <CreditCardOutlined className="card-icon-inner" />
                </div>
              </div>
              <div>
                <Text className="card-amount">
                  ₹{accountSummary.totalReceived.toLocaleString()}
                </Text>
                <div className="card-label">Total Amount Received</div>
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <div
              className="clickable-card-container"
              onClick={() => {
                window.location.href = "/doctor/doctorPages/TotalExpenditure";
              }}
            >
              <Card className="summary-card clickable">
                <div className="card-icon-container">
                  <div className="card-icon red">
                    <CreditCardOutlined className="card-icon-inner" />
                  </div>
                </div>
                <div>
                  <Text className="card-amount">
                    ₹{accountSummary?.totalExpenditure?.toLocaleString()}
                  </Text>
                  <div className="card-label">Total Expenditure</div>
                </div>
              </Card>
            </div>
          </Col>

          {/* <Col xs={24} sm={12} md={6}>
            <div
              className="clickable-card-container"
              onClick={() => {
                window.location.href =
                  "/doctor/doctorPages/PendingTransactions";
              }}
            >
              <Card className="summary-card clickable">
                <div className="card-icon-container">
                  <div className="card-icon orange">
                    <ClockCircleOutlined className="card-icon-inner" />
                  </div>
                </div>
                <div>
                  <Text className="card-amount">
                    {accountSummary.pendingTransactions}
                  </Text>
                  <div className="card-label">Pending Transactions</div>
                </div>
              </Card>
            </div>
          </Col> */}

          <Col xs={24} sm={12} md={8}>
            <Card className="summary-card">
              <div className="card-icon-container">
                <div className="card-icon blue">
                  <SyncOutlined className="card-icon-inner" />
                </div>
              </div>
              <div>
                <Text className="card-title">Recent Transactions</Text>
                <div className="recent-transactions">
                  {accountSummary.recentTransactions.map(
                    (transaction, index) => (
                      <div key={index} className="transaction-item">
                        <Text className="transaction-name">
                          {transaction.name}
                        </Text>
                        <Text className="transaction-amount">
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
        <Card className="transaction-card">
          <div className="transaction-header">
            <Title level={4} className="transaction-title">
              Transaction History
            </Title>
          </div>

          {/* Search and Filter Bar */}
          <div className="search-filter-bar">
            <Row gutter={16} align="middle">
              <Col flex="1" className="search-col">
                <Input
                  placeholder="Search by Patient Name or Transaction ID"
                  prefix={<SearchOutlined className="search-icon" />}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="search-input"
                  allowClear
                />
              </Col>
              <Col>
                <RangePicker
                  placeholder={["Start Date", "End Date"]}
                  className="date-picker"
                  onChange={setFilterDate}
                  value={filterDate}
                  allowClear
                />
              </Col>
              <Col>
                <Select
                  className="filter-select"
                  value={filterService}
                  onChange={(value) =>
                    setFilterService(value === "all" ? undefined : value)
                  }
                  placeholder="Service"
                  allowClear
                >
                  <Option value="all">All</Option>
                  <Option value="appointment">Appointments</Option>
                  <Option value="lab">Lab</Option>
                  <Option value="pharmacy">Pharmacy</Option>
                </Select>
              </Col>
              <Col>
                <Button
                  type="primary"
                  icon={<DownloadOutlined />}
                  className="export-button"
                  onClick={handleExport}
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
            loading={loading}
            pagination={{
              current: currentPage,
              pageSize: 15,
              total: totalItems,
              onChange: setCurrentPage,
              showSizeChanger: false,
            }}
          />

          <div className="pagination-info">
            Showing {(currentPage - 1) * 10 + 1} to{" "}
            {Math.min(currentPage * 10, totalItems)} of {totalItems} results
          </div>
        </Card>

        {/* Transaction Details Modal */}
        <Modal
          open={viewModalVisible}
          title="Transaction Details"
          onCancel={() => {
            setViewModalVisible(false);
            setTransactionDetails([]);
          }}
          footer={null}
          width={800}
          className="transaction-modal"
        >
          {loadingDetails ? (
            <div style={{ textAlign: "center", padding: "24px" }}>
              <Spin />
            </div>
          ) : (
            renderTransactionDetails()
          )}
        </Modal>
      </div>
    </div>
  );
};

export default AccountsPage;