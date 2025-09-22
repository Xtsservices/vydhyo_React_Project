import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Card,
  Table,
  Tag,
  Space,
  Typography,
  Row,
  Col,
  Button,
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
  PlusOutlined,
} from "@ant-design/icons";
import { apiGet, apiPost } from "../../../components/api";
import "../../stylings/Accounts.css";
import dayjs from "dayjs";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import moment from 'moment';

const { Title, Text } = Typography;
const { Option } = Select;

const AccountsPage = () => {
  // Get user data from Redux
  const user = useSelector((state) => state.currentUserData);
  const doctorId = user?.role === "doctor" ? user?.userId : user?.createdBy;
  const datePickerRef = useRef(null);

  // State for filters
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [filterService, setFilterService] = useState();
  const [filterStatus, setFilterStatus] = useState("");
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

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

  // Function to format display date
  const formatDisplayDate = () => {
    if (startDate && endDate) {
      return `${moment(startDate).format('MMM D, YYYY')} - ${moment(endDate).format('MMM D, YYYY')}`;
    }
    return 'Select a date range';
  };

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
      grouped[key].totalAmount += txn.finalAmount !== undefined ? txn.finalAmount : txn.actualAmount || 0;
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
 // Compute count by grouping on Service + paidAt rounded to the minute
 const computeGroupedCount = (txns = []) => {
   const groupMap = new Map();
   txns.forEach((t) => {
     const service = getServiceName(t.paymentFrom);
     const minuteKey = t?.paidAt ? dayjs(t.paidAt).format("YYYY-MM-DD HH:mm") : "Unknown";
     groupMap.set(`${service}__${minuteKey}`, true);
   });
   return groupMap.size;
 };

  // Memoized function to map transactions
 const mappedTransactions = groupTransactions(transactions).map((txn) => {
   const allTxns = txn.allTransactions || [txn];
   const groupedCountForView = computeGroupedCount(allTxns);
   return {
     id: txn.paymentId || txn._id,
     patient: txn.patientName,
     date: txn.paidAt ? dayjs(txn.paidAt).format("DD-MMM-YYYY") : "-",
     service: txn.services || getServiceName(txn.paymentFrom),
     amount:
       (txn.groupedCount > 1 ? txn.groupedAmount : (txn.finalAmount !== undefined ? txn.finalAmount : txn.actualAmount || 0)),
     status: txn.paymentStatus !== "refund_pending" ? txn.statuses || txn.paymentStatus || "-" : "Refunded",
     paymentMethod:
       txn.paymentMethods ||
       (txn.paymentMethod ? txn.paymentMethod.charAt(0).toUpperCase() + txn.paymentMethod.slice(1) : "-"),
     raw: txn,
     count: groupedCountForView || 1,
     allTransactions: allTxns,
   };
 });

 function getServiceName(paymentFrom) {
  const v = (paymentFrom || "").toString().trim().toLowerCase();
  if (v === "appointment" ) return "Appointments";
  if (v === "lab") return "Lab";
  if (v === "pharmacy") return "Pharmacy";
  return paymentFrom || "-";
}

const isAppointmentService = (paymentFrom) => {
  const v = (paymentFrom || "").toString().trim().toLowerCase();
  return v === "appointment" || v === "appointments";
};


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
        toast.error("Error fetching revenue data:", error?.message);
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

    if (startDate && endDate) {
      payload.startDate = moment(startDate).format("YYYY-MM-DD");
      payload.endDate = moment(endDate).format("YYYY-MM-DD");
    }

    try {
      const response = await apiPost("/finance/getTransactionHistory", payload);
      const data = response.data;

      setTransactions(data.data || []);
      setTotalItems(data.totalResults || 0);
    } catch (err) {
      toast.error("Error fetching transactions:", err?.message);
    } finally {
      setLoading(false);
    }
  }, [doctorId, startDate, endDate, filterService, filterStatus, searchText, currentPage]);

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


  const toNum = (val) => {
  const n = Number(val);
  return Number.isFinite(n) ? n : 0;
};

const getPlatformFee = (txn) => {
  // Check common locations / keys; extend if you have other shapes
  const candidates = [
    txn?.platformFee,
    txn?.platform_fee,
    txn?.feeDetails?.platformFee,
    txn?.feeDetails?.platform_fee,
    txn?.charges?.platformFee,
    txn?.charges?.platform_fee,
  ];
  for (const c of candidates) {
    const n = toNum(c);
    if (n !== 0) return n; // return first non-zero
  }
  // If explicitly zero in any place, still return 0 (so it shows ₹0 for appointments)
  return candidates.some((c) => toNum(c) === 0) ? 0 : 0;
};



const renderTransactionDetails = () => {
  if (!selectedTransaction) return <Text>No details available</Text>;

  const allTxns = selectedTransaction.allTransactions?.length
    ? selectedTransaction.allTransactions
    : [selectedTransaction];

  // Group by Service + paidAt rounded to the minute (ignore seconds)
  const groupMap = new Map();
  allTxns.forEach((txn) => {
    const service = getServiceName(txn.paymentFrom);
    const minuteKey = txn?.paidAt
      ? dayjs(txn.paidAt).format("YYYY-MM-DD HH:mm")
      : "Unknown";
    const key = `${service}__${minuteKey}`;

    const baseAmount = toNum(txn.finalAmount ?? txn.actualAmount ?? 0);
    const pf = getPlatformFee(txn); // robust read

    const prev = groupMap.get(key) || {
      service,
      minuteKey,
      sortTime: txn?.paidAt
        ? dayjs(txn.paidAt).startOf("minute").valueOf()
        : Number.POSITIVE_INFINITY,
      ids: [],
      amount: 0,
      platformFee: 0,
    };

    prev.ids.push(txn.paymentId || txn._id);
    prev.amount += baseAmount;
    if (isAppointmentService(txn.paymentFrom)) {
      prev.platformFee += pf; // sum only for appointments
    }

    groupMap.set(key, prev);
  });

  const rows = Array.from(groupMap.values())
    .sort((a, b) => {
      if (a.service !== b.service) return a.service.localeCompare(b.service);
      return a.sortTime - b.sortTime;
    })
    .map((g, idx) => ({
      key: `${g.service}-${g.minuteKey}-${idx}`,
      id: g.ids?.[0] || "-",
      date:
        g.minuteKey === "Unknown"
          ? "-"
          : dayjs(g.minuteKey, "YYYY-MM-DD HH:mm").format("DD-MMM-YYYY hh:mm A"),
      service: g.service,
      amount: g.amount,
      platformFee: g.service === "Appointments" ? g.platformFee : null, // “–” for non-appointments
    }));

  const columns = [
    { title: "Transaction ID", dataIndex: "id", key: "id" },
    { title: "Date", dataIndex: "date", key: "date" },
    { title: "Service", dataIndex: "service", key: "service" },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (v) => `₹${toNum(v)}`,
    },
    {
      title: "Platform Fee",
      dataIndex: "platformFee",
      key: "platformFee",
      render: (v, record) =>
        record.service === "Appointments" ? `₹${toNum(v)}` : "–",
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={rows}
      pagination={false}
      size="small"
      bordered
      tableLayout="auto"
    />
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
            <Card className="summary-card" style={{ height: "100%" }}>
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
                navigate("/doctor/doctorPages/TotalExpenditure");
              }}
              style={{ height: "100%" }}
            >
              <Card className="summary-card clickable" style={{ height: "100%" }}>
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

          <Col xs={24} sm={12} md={8}>
            <Card className="summary-card" style={{ height: "100%" }}>
              <div className="card-icon-container">
                <div className="card-icon blue">
                  <SyncOutlined className="card-icon-inner" />
                </div>
              </div>
              <div>
                <Text className="card-title">Recent Transactions</Text>
                <div className="recent-transactions" style={{ maxHeight: "80px", overflow: "auto" }}>
                  {accountSummary.recentTransactions.length > 0 ? (
                    accountSummary.recentTransactions.map(
                      (transaction, index) => (
                        <div key={index} className="transaction-item">
                          <Text className="transaction-name" ellipsis={{ tooltip: transaction.name }}>
                            {transaction.name}
                          </Text>
                          <Text className="transaction-amount">
                            ₹{transaction.amount}
                          </Text>
                        </div>
                      )
                    )
                  ) : (
                    <div className="transaction-item">
                      <Text className="transaction-name" type="secondary">
                        No recent transactions
                      </Text>
                    </div>
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
                  placeholder="Search by Patient Name "
                  prefix={<SearchOutlined className="search-icon" />}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="search-input"
                  allowClear
                />
              </Col>
              <Col>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <CalendarTodayIcon style={{ marginRight: '8px', color: '#1977f3' }} />
                  <DatePicker
                    ref={datePickerRef}
                    selected={startDate}
                    onChange={(dates) => {
                      const [start, end] = dates;
                      setStartDate(start);
                      setEndDate(end);
                    }}
                    startDate={startDate}
                    endDate={endDate}
                    selectsRange
                    isClearable
                    placeholderText="Select a date range"
                    className="custom-datepicker"
                    maxDate={new Date()}
                    customInput={
                      <Button
                        style={{
                          borderRadius: '8px',
                          border: '1px solid #d9d9d9',
                          padding: '8px 16px',
                          width: '250px',
                          textAlign: 'left',
                          backgroundColor: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        <span>{formatDisplayDate()}</span>
                      </Button>
                    }
                  />
                </div>
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