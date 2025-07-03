import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter, Download, MoreVertical } from "lucide-react";
import { message, Modal, Select, Button } from "antd";

const { Option } = Select;
import moment from "moment";

const MyPatients = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [sortBy, setSortBy] = useState("Name");
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [patients, setPatients] = useState([]);
  const [totalPatients, setTotalPatients] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const pageSize = 10;

  // API base URL
  const API_BASE_URL = "http://192.168.0.100:3000";

  // Calculate age from DOB (if available)
  const calculateAge = (dob) => {
    if (!dob) return "N/A";
    return moment().diff(moment(dob, "DD-MM-YYYY"), "years");
  };

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        message.error("No authentication token found. Please login again.");
        return;
      }

      const doctorId = localStorage.getItem("doctorId") || "patients";
      const response = await fetch(
        `${API_BASE_URL}/appointment/getAppointmentsByDoctorID/${"patients"}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("response===============", response);
      
      if (!response.ok) {
        if (response.status === 401) {
          message.error("Session expired. Please login again.");
          navigate("/login");
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      let patientsData = [];

      if (data.status === "success" && data.data) {
        const appointmentsData = Array.isArray(data.data) ? data.data : [data.data];
        
        const patientMap = new Map();
        
        appointmentsData.forEach((appointment) => {
          const uniqueKey = `${appointment.userId || 'unknown'}_${appointment.patientName?.toLowerCase().replace(/\s+/g, '') || 'unnamed'}`;
          
          if (!patientMap.has(uniqueKey)) {
            patientMap.set(uniqueKey, {
              id: appointment.userId || `P-${Math.random().toString(36).substr(2, 6)}`,
              name: appointment.patientName || "N/A",
              gender: "N/A", 
              age: "N/A", 
              phone: "N/A", 
              lastVisit: appointment.appointmentDate
                ? moment(appointment.appointmentDate).format("DD MMMM YYYY")
                : "N/A",
              appointmentType: appointment.appointmentType || "N/A",
              status: appointment.appointmentType === "New-Walkin" || appointment.appointmentType === "new-walkin" 
                ? "New Patient" : "Follow-up",
              department: appointment.appointmentDepartment || "N/A",
              appointmentTime: appointment.appointmentTime || "N/A",
              appointmentStatus: appointment.appointmentStatus || "N/A",
              appointmentReason: appointment.appointmentReason || "N/A",
              appointmentCount: 1,
              allAppointments: [appointment]
            });
          } else {
            const existingPatient = patientMap.get(uniqueKey);
            const currentAppointmentDate = moment(appointment.appointmentDate);
            const existingAppointmentDate = moment(existingPatient.lastVisit, "DD MMMM YYYY");
            
            existingPatient.appointmentCount += 1;
            existingPatient.allAppointments.push(appointment);
            
            if (currentAppointmentDate.isAfter(existingAppointmentDate)) {
              existingPatient.lastVisit = currentAppointmentDate.format("DD MMMM YYYY");
              existingPatient.appointmentType = appointment.appointmentType || "N/A";
              existingPatient.appointmentTime = appointment.appointmentTime || "N/A";
              existingPatient.appointmentStatus = appointment.appointmentStatus || "N/A";
              existingPatient.appointmentReason = appointment.appointmentReason || "N/A";
              existingPatient.department = appointment.appointmentDepartment || "N/A";
            }
          }
        });
        
        patientsData = Array.from(patientMap.values());
        
        console.log("Processed patients:", patientsData);
        console.log("Total unique patients:", patientsData.length);
      } else {
        patientsData = [];
      }

      setPatients(patientsData);
      setFilteredPatients(patientsData);
      setTotalPatients(patientsData.length);
    } catch (error) {
      console.error("Error fetching patients:", error);
      message.error("Failed to fetch patients data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  // Handle search
  const handleSearch = useCallback(
    (e) => {
      const value = e.target.value.toLowerCase();
      setSearchText(value);
      setCurrentPage(1);
      setFilteredPatients(
        patients.filter(
          (patient) =>
            patient.name.toLowerCase().includes(value) ||
            patient.id.toLowerCase().includes(value) ||
            patient.phone.includes(value) ||
            patient.department.toLowerCase().includes(value)
        )
      );
    },
    [patients]
  );

  // Handle sorting
  const handleSort = useCallback(
    (value) => {
      setSortBy(value);
      setCurrentPage(1);
      const sortedPatients = [...filteredPatients].sort((a, b) => {
        if (value === "Name") {
          return a.name.localeCompare(b.name);
        } else if (value === "Date") {
          const dateA = moment(a.lastVisit, "DD MMMM YYYY");
          const dateB = moment(b.lastVisit, "DD MMMM YYYY");
          return dateB.isBefore(dateA) ? -1 : dateB.isAfter(dateA) ? 1 : 0;
        } else if (value === "ID") {
          return a.id.localeCompare(b.id);
        }
        return 0;
      });
      setFilteredPatients(sortedPatients);
    },
    [filteredPatients]
  );

  // Handle filter
  const showFilterModal = () => {
    setIsFilterModalVisible(true);
  };

  const handleFilterOk = () => {
    setCurrentPage(1);
    let filtered = [...patients];

    if (filterStatus) {
      filtered = filtered.filter((patient) => patient.status === filterStatus);
    }

    if (filterDepartment) {
      filtered = filtered.filter((patient) =>
        patient.department.toLowerCase().includes(filterDepartment.toLowerCase())
      );
    }

    setFilteredPatients(filtered);
    setIsFilterModalVisible(false);
  };

  const handleFilterCancel = () => {
    setIsFilterModalVisible(false);
  };

  const resetFilters = () => {
    setFilterStatus("");
    setFilterDepartment("");
    setFilteredPatients(patients);
    setIsFilterModalVisible(false);
  };

  // Handle export
  const handleExport = () => {
    if (filteredPatients.length === 0) {
      message.warning("No data to export");
      return;
    }

    const csvHeaders = ["Patient ID", "Name", "Gender", "Age", "Phone", "Last Visit", "Status", "Department"];
    const csvRows = filteredPatients.map((patient) => [
      patient.id,
      patient.name,
      patient.gender,
      patient.age,
      patient.phone,
      patient.lastVisit,
      patient.status,
      patient.department,
    ]);

    const csvContent = [
      csvHeaders.join(","),
      ...csvRows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `patients_export_${moment().format("YYYYMMDD")}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    message.success("Patients data exported successfully");
  };

  // Handle view patient profile
  const handleViewProfile = useCallback(
    (patientId) => {
      navigate(`/SuperAdmin/patientView?id=${patientId}`);
    },
    [navigate]
  );

  // Status badge rendering
  const getStatusBadge = (status) => {
    if (status === "New Patient") {
      return <span style={styles.statusBadgeGreen}>New Patient</span>;
    }
    if (status === "Follow-up") {
      return <span style={styles.statusBadgeOrange}>Follow-up</span>;
    }
    return null;
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredPatients.length / pageSize);
  const paginatedPatients = filteredPatients.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Styles
  const styles = {
    container: {
      minHeight: "100vh",
      backgroundColor: "#f8fafc",
      padding: "clamp(16px, 3vw, 24px)",
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    header: {
      marginBottom: "clamp(24px, 4vw, 32px)",
    },
    title: {
      fontSize: "clamp(24px, 4vw, 28px)",
      fontWeight: "700",
      color: "#1e293b",
      marginBottom: "8px",
    },
    subtitle: {
      fontSize: "clamp(14px, 2vw, 16px)",
      color: "#64748b",
    },
    controls: {
      marginBottom: "clamp(16px, 3vw, 24px)",
      display: "flex",
      flexDirection: "column",
      gap: "16px",
    },
    controlsRow: {
      display: "flex",
      gap: "12px",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
    },
    leftControls: {
      display: "flex",
      gap: "12px",
      alignItems: "center",
      flex: "1",
    },
    searchContainer: {
      position: "relative",
      flex: "1",
      maxWidth: "clamp(300px, 50vw, 400px)",
    },
    searchInput: {
      width: "100%",
      padding: "12px 12px 12px 40px",
      border: "1px solid #d1d5db",
      borderRadius: "8px",
      fontSize: "clamp(12px, 1.8vw, 14px)",
      outline: "none",
      transition: "all 0.2s",
      backgroundColor: "white",
    },
    searchIcon: {
      position: "absolute",
      left: "12px",
      top: "50%",
      transform: "translateY(-50%)",
      color: "#9ca3af",
      width: "16px",
      height: "16px",
    },
    filterButton: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      padding: "12px 16px",
      border: "1px solid #d1d5db",
      borderRadius: "8px",
      backgroundColor: "white",
      cursor: "pointer",
      fontSize: "clamp(12px, 1.8vw, 14px)",
      color: "#374151",
      transition: "all 0.2s",
    },
    sortSelect: {
      padding: "12px 32px 12px 16px",
      border: "1px solid #d1d5db",
      borderRadius: "8px",
      backgroundColor: "white",
      fontSize: "clamp(12px, 1.8vw, 14px)",
      color: "#374151",
      outline: "none",
      cursor: "pointer",
      appearance: "none",
      backgroundImage:
        'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e")',
      backgroundPosition: "right 12px center",
      backgroundRepeat: "no-repeat",
      backgroundSize: "16px",
    },
    exportButton: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      padding: "12px 20px",
      backgroundColor: "#16a34a",
      color: "white",
      border: "none",
      borderRadius: "8px",
      fontSize: "clamp(12px, 1.8vw, 14px)",
      fontWeight: "500",
      cursor: "pointer",
      transition: "all 0.2s",
    },
    tableContainer: {
      backgroundColor: "white",
      borderRadius: "12px",
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
      border: "1px solid #e2e8f0",
      overflow: "hidden",
      overflowX: "auto",
    },
    tableHeader: {
      display: "grid",
      gridTemplateColumns:
        "minmax(100px, 120px) minmax(200px, 2fr) minmax(80px, 1fr) minmax(60px, 80px) minmax(120px, 140px) minmax(100px, 120px) minmax(60px, 80px)",
      gap: "16px",
      padding: "16px",
      backgroundColor: "#f8fafc",
      borderBottom: "1px solid #e2e8f0",
      fontSize: "clamp(12px, 1.8vw, 14px)",
      fontWeight: "600",
      color: "#475569",
      minWidth: "800px",
    },
    tableBody: {
      borderTop: "1px solid #e2e8f0",
      minWidth: "800px",
    },
    tableRow: {
      display: "grid",
      gridTemplateColumns:
        "minmax(100px, 120px) minmax(200px, 2fr) minmax(80px, 1fr) minmax(60px, 80px) minmax(120px, 140px) minmax(100px, 120px) minmax(60px, 80px)",
      gap: "16px",
      padding: "16px",
      alignItems: "center",
      borderBottom: "1px solid #f1f5f9",
      transition: "all 0.2s",
    },
    patientId: {
      fontSize: "clamp(12px, 1.8vw, 14px)",
      fontWeight: "600",
      color: "#1e293b",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },
    patientInfo: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
    },
    patientDetails: {
      display: "flex",
      flexDirection: "column",
      gap: "4px",
      minWidth: 0,
    },
    patientName: {
      fontSize: "clamp(12px, 1.8vw, 14px)",
      fontWeight: "600",
      color: "#1e293b",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },
    appointmentType: {
      fontSize: "clamp(10px, 1.5vw, 12px)",
      color: "#64748b",
      fontWeight: "500",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },
    statusBadgeGreen: {
      display: "inline-flex",
      alignItems: "center",
      padding: "4px 8px",
      borderRadius: "20px",
      fontSize: "clamp(10px, 1.5vw, 12px)",
      fontWeight: "500",
      backgroundColor: "#dcfce7",
      color: "#166534",
    },
    statusBadgeOrange: {
      display: "inline-flex",
      alignItems: "center",
      padding: "4px 8px",
      borderRadius: "20px",
      fontSize: "clamp(10px, 1.5vw, 12px)",
      fontWeight: "500",
      backgroundColor: "#fed7aa",
      color: "#9a3412",
    },
    tableCell: {
      fontSize: "clamp(12px, 1.8vw, 14px)",
      color: "#64748b",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },
    actionButton: {
      padding: "8px",
      border: "none",
      backgroundColor: "transparent",
      cursor: "pointer",
      borderRadius: "4px",
      transition: "all 0.2s",
    },
    pagination: {
      marginTop: "clamp(16px, 3vw, 24px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: "16px",
    },
    paginationInfo: {
      fontSize: "clamp(12px, 1.8vw, 14px)",
      color: "#64748b",
    },
    paginationControls: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },
    paginationButton: {
      padding: "8px 12px",
      fontSize: "clamp(12px, 1.8vw, 14px)",
      border: "none",
      backgroundColor: "transparent",
      color: "#64748b",
      cursor: "pointer",
      borderRadius: "6px",
      transition: "all 0.2s",
    },
    paginationButtonActive: {
      padding: "8px 12px",
      fontSize: "clamp(12px, 1.8vw, 14px)",
      border: "none",
      backgroundColor: "#3b82f6",
      color: "white",
      cursor: "pointer",
      borderRadius: "6px",
      fontWeight: "500",
    },
    filterModalContent: {
      display: "flex",
      flexDirection: "column",
      gap: "16px",
      padding: "16px",
    },
    filterField: {
      display: "flex",
      flexDirection: "column",
      gap: "8px",
    },
    filterLabel: {
      fontSize: "14px",
      fontWeight: "500",
      color: "#374151",
    },
  };

  // Get unique departments for filter dropdown
  const uniqueDepartments = [...new Set(patients.map((patient) => patient.department))];

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>My Patients</h1>
        <p style={styles.subtitle}>Manage and view all registered patients</p>
      </div>

      {/* Controls */}
      <div style={styles.controls}>
        <div style={styles.controlsRow}>
          <div style={styles.leftControls}>
            {/* Search */}
            <div style={styles.searchContainer}>
              <Search style={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search by Patient ID, Name or Department"
                value={searchText}
                onChange={handleSearch}
                style={styles.searchInput}
                onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
              />
            </div>

            {/* Filter */}
            <button
              style={styles.filterButton}
              onClick={showFilterModal}
              onMouseEnter={(e) => (e.target.style.backgroundColor = "#f9fafb")}
              onMouseLeave={(e) => (e.target.style.backgroundColor = "white")}
            >
              <Filter style={{ width: "16px", height: "16px" }} />
              Filter
            </button>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => handleSort(e.target.value)}
              style={styles.sortSelect}
            >
              <option value="Name">Sort by Name</option>
              <option value="Date">Sort by Date</option>
              <option value="ID">Sort by ID</option>
            </select>
          </div>

          {/* Export */}
          <button
            style={styles.exportButton}
            onClick={handleExport}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#15803d")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = "#16a34a")}
          >
            <Download style={{ width: "16px", height: "16px" }} />
            Export
          </button>
        </div>
      </div>

      {/* Filter Modal */}
      <Modal
        title="Filter Patients"
        visible={isFilterModalVisible}
        onOk={handleFilterOk}
        onCancel={handleFilterCancel}
        footer={[
          <Button key="reset" onClick={resetFilters}>
            Reset
          </Button>,
          <Button key="cancel" onClick={handleFilterCancel}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={handleFilterOk}>
            Apply Filters
          </Button>,
        ]}
      >
        <div style={styles.filterModalContent}>
          <div style={styles.filterField}>
            <label style={styles.filterLabel}>Status</label>
            <Select
              value={filterStatus}
              onChange={(value) => setFilterStatus(value)}
              style={{ width: "100%" }}
              placeholder="Select status"
              allowClear
            >
              <Option value="New Patient">New Patient</Option>
              <Option value="Follow-up">Follow-up</Option>
            </Select>
          </div>
          <div style={styles.filterField}>
            <label style={styles.filterLabel}>Department</label>
            <Select
              value={filterDepartment}
              onChange={(value) => setFilterDepartment(value)}
              style={{ width: "100%" }}
              placeholder="Select department"
              allowClear
            >
              {uniqueDepartments.map((dept) => (
                <Option key={dept} value={dept}>
                  {dept}
                </Option>
              ))}
            </Select>
          </div>
        </div>
      </Modal>

      {/* Table */}
      <div style={styles.tableContainer}>
        {/* Table Header */}
        <div style={styles.tableHeader}>
          <div>Patient ID</div>
          <div>Patient</div>
          <div>Gender</div>
          <div>Age</div>
          <div>Phone</div>
          <div>Last Visit</div>
          <div>Action</div>
        </div>

        {/* Table Body */}
        <div style={styles.tableBody}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "24px" }}>
              Loading...
            </div>
          ) : paginatedPatients.length === 0 ? (
            <div style={{ textAlign: "center", padding: "24px" }}>
              No patients found.
            </div>
          ) : (
            paginatedPatients.map((patient) => (
              <div
                key={patient.id}
                style={styles.tableRow}
                onMouseEnter={(e) => (e.target.style.backgroundColor = "#f8fafc")}
                onMouseLeave={(e) => (e.target.style.backgroundColor = "white")}
              >
                <div style={styles.patientId}>{patient.id}</div>

                <div style={styles.patientInfo}>
                  <div style={styles.patientDetails}>
                    <div style={styles.patientName}>{patient.name}</div>
                    <div style={styles.appointmentType}>
                      {patient.appointmentType}
                    </div>
                    {patient.status && (
                      <div style={{ marginTop: "4px" }}>
                        {getStatusBadge(patient.status)}
                      </div>
                    )}
                  </div>
                </div>

                <div style={styles.tableCell}>{patient.gender}</div>
                <div style={styles.tableCell}>{patient.age}</div>
                <div style={styles.tableCell}>{patient.phone}</div>
                <div style={styles.tableCell}>{patient.lastVisit}</div>

                <div>
                  <button
                    style={styles.actionButton}
                    onClick={() => handleViewProfile(patient.id)}
                    onMouseEnter={(e) =>
                      (e.target.style.backgroundColor = "#f3f4f6")
                    }
                    onMouseLeave={(e) =>
                      (e.target.style.backgroundColor = "transparent")
                    }
                  >
                    <MoreVertical
                      style={{ width: "16px", height: "16px", color: "#9ca3af" }}
                    />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Pagination */}
      <div style={styles.pagination}>
        <div style={styles.paginationInfo}>
          Showing {(currentPage - 1) * pageSize + 1} to{" "}
          {Math.min(currentPage * pageSize, filteredPatients.length)} of {filteredPatients.length}{" "}
          results
        </div>

        <div style={styles.paginationControls}>
          <button
            style={styles.paginationButton}
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
            onMouseEnter={(e) =>
              !e.target.disabled && (e.target.style.color = "#1e293b")
            }
            onMouseLeave={(e) =>
              !e.target.disabled && (e.target.style.color = "#64748b")
            }
          >
            Previous
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              style={
                page === currentPage
                  ? styles.paginationButtonActive
                  : styles.paginationButton
              }
              onClick={() => setCurrentPage(page)}
              onMouseEnter={(e) =>
                page !== currentPage && (e.target.style.color = "#1e293b")
              }
              onMouseLeave={(e) =>
                page !== currentPage && (e.target.style.color = "#64748b")
              }
            >
              {page}
            </button>
          ))}

          <button
            style={styles.paginationButton}
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
            onMouseEnter={(e) =>
              !e.target.disabled && (e.target.style.color = "#1e293b")
            }
            onMouseLeave={(e) =>
              !e.target.disabled && (e.target.style.color = "#64748b")
            }
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyPatients;