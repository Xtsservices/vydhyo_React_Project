import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  Download,
  MoreVertical,
  Plus,
  Trash2,
} from "lucide-react";
import { message, Modal, Select, Button, Input, Table } from "antd";
import { EyeOutlined } from "@ant-design/icons";

import moment from "moment";
import { apiGet } from "../../api";
import styles from "../../stylings/MyPatientsStyles";
import { useSelector } from "react-redux";

const { Option } = Select;

const MyPatients = () => {
  const navigate = useNavigate();
  const hasfetchPatients = useRef(false);

  const user = useSelector((state) => state.currentUserData);

  const doctorId = user?.role === "doctor" ? user?.userId : user?.createdBy;

  const [searchText, setSearchText] = useState("");
  const [searchField, setSearchField] = useState("all");
  const [sortBy, setSortBy] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterAppointmentStatus, setFilterAppointmentStatus] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");

  // Prescription Modal States
  const [isPrescriptionModalVisible, setIsPrescriptionModalVisible] =
    useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [prescriptionData, setPrescriptionData] = useState({
    medicines: [],
    tests: [],
  });
  const [prescriptionLoading, setPrescriptionLoading] = useState(false);
  const [ePrescriptionData, setEPrescriptionData] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0,
  });
  const [filters, setFilters] = useState({
    type: "all",
    // other filters if needed
  });


  const totalPages = Math.ceil(pagination.total / pagination.pageSize);

  const pageSize = 10;

  const calculateAge = (dob) => {
    if (!dob) return "N/A";
    return moment().diff(moment(dob, "DD-MM-YYYY"), "years").toString();
  };
  const fetchPatients = async (page = 1, limit = 5) => {
    setLoading(true);
    try {

      const token = localStorage.getItem("accessToken");
      if (!token) {
        message.error("No authentication token found. Please login again.");
        navigate('/Login')
        return;
      }

      const queryParams = new URLSearchParams({
        doctorId,
        ...(searchText && { searchText }),
        ...(filters.type !== "all" && { appointmentType: filters.type }),
        page: pagination.current,
        limit: pagination.pageSize,
      });

      console.log('Fetching appointments with params:', queryParams.toString()); // Debug log
      const response = await apiGet(
        `/appointment/getAppointmentsByDoctorID/patients?${queryParams.toString()}`
      );

      const data = response.data;

      console.log(response, "response.data from patients.jsx");

      let patientsData = [];

      if (response.status === 200 && data.data) {
        const { appointments, pagination } = response.data.data;
        function formatDate(dateStr) {
          const d = new Date(dateStr);
          return d.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }).replace(/ /g, "-");
        }
        const formattedAppointments = appointments.map((item) => {
          const formattedDate = item.appointmentDate
            ? formatDate(item.appointmentDate)
            : "N/A";

          return { ...item, appointmentDate: formattedDate };
        });
        console.log(formattedAppointments, "Formatted Appointments");
        const appointmentsData = Array.isArray(data.data)
          ? data.data
          : [data.data];

        console.log(appointments)

        const patientsDataUnsorted = formattedAppointments.map((appointment) => ({
          id:
            appointment.userId,
          appointmentId: appointment.appointmentId || "N/A",
          name: appointment.patientName || "N/A",
          gender: appointment.patientDetails?.gender || "N/A",
          age: appointment.patientDetails?.dob
            ? calculateAge(appointment.patientDetails.dob)
            : appointment?.patientDetails?.age,
          phone: appointment.patientDetails?.mobile || "N/A",
          lastVisit: appointment.appointmentDate || "N/A",
          appointmentType: appointment.appointmentType || "N/A",
          status:
            appointment.appointmentType === "New-Walkin" ||
              appointment.appointmentType === "new-walkin"
              ? "New Patient"
              : "Follow-up",
          department: appointment.appointmentDepartment || "N/A",
          appointmentTime: appointment.appointmentTime || "N/A",
          appointmentStatus: appointment.appointmentStatus || "N/A",
          appointmentReason: appointment.appointmentReason || "N/A",
          appointmentCount: 1,
          allAppointments: [appointment],
          ePrescription: appointment.ePrescription || null,
        }));
        setPatients(patientsDataUnsorted);

        setPagination({
          current: pagination.currentPage,
          pageSize: pagination.pageSize,
          total: pagination.totalItems
        });
      }
    } catch (error) {
      console.error("Error fetching patients:", error);
      message.error("Failed to fetch patients data. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user && doctorId) {
      fetchPatients();
    }
  }, [user, doctorId, searchText, pagination.current, pagination.pageSize, filters]);



  const fetchPrescriptionDetails = useCallback(async (patientId) => {
    setPrescriptionLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        message.error("No authentication token found. Please login again.");
        return;
      }

      const response = await apiGet(
        `/pharmacy/getPatientPrescriptionDetails/${patientId}`
      );
      const data = response.data;

      if (response.status === 200 && data.success) {
        setPrescriptionData({
          medicines: data.data.medicines || [],
          tests:
            data.data.tests.map((test) => ({
              id: test.id,
              name: test.testName,
              labTestID: test.labTestID,
              status: test.status,
            })) || [],
        });
      } else {
        throw new Error("Failed to fetch prescription details");
      }
    } catch (error) {
      console.error("Error fetching prescription details:", error);
      message.error("Failed to fetch prescription details. Please try again.");
      setPrescriptionData({ medicines: [], tests: [] });
    } finally {
      setPrescriptionLoading(false);
    }
  }, []);

  const handleSearch = useCallback(
    (e) => {
      const value = e.target.value.toLowerCase();
      setSearchText(value);
      setCurrentPage(1);
      setFilteredPatients(
        patients.filter((patient) => {
          if (searchField === "all") {
            return (
              patient.name.toLowerCase().includes(value) ||
              patient.id.toLowerCase().includes(value) ||
              patient.department.toLowerCase().includes(value) ||
              patient.phone.includes(value)
            );
          } else if (searchField === "name") {
            return patient.name.toLowerCase().includes(value);
          } else if (searchField === "id") {
            return patient.id.toLowerCase().includes(value);
          } else if (searchField === "department") {
            return patient.department.toLowerCase().includes(value);
          }
          return true;
        })
      );
    },
    [patients, searchField]
  );

  const handleSort = (value) => {
    setFilters((prev) => ({
      ...prev,
      type: value,
    }));
  };


  const handleExport = useCallback(() => {
    if (!patients.length) {
      message.warning("No data to export");
      return;
    }

    const csvHeaders = [
      "Patient ID",
      "Name",
      "Gender",
      "Age",
      "Phone",
      "Last Visit",
      "Status",
      "Department",
      "Appointment Status",
    ];
    const csvRows = patients.map((patient) => [
      patient.id,
      patient.name,
      patient.gender,
      patient.age,
      patient.phone,
      patient.lastVisit,
      patient.status,
      patient.department,
      patient.appointmentStatus,
    ]);

    const csvContent = [
      csvHeaders.join(","),
      ...csvRows.map((row) => row.join(",")),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `patients_export_${moment().format("YYYYMMDD")}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    message.success("Patients data exported successfully");
  }, [patients]);

  const handleViewPrescription = useCallback(
    (patient) => {
      setSelectedPatient(patient);
      setPrescriptionData({ medicines: [], tests: [] });
      setEPrescriptionData(patient.ePrescription || null);
      fetchPrescriptionDetails(patient.id);
      setIsPrescriptionModalVisible(true);
    },
    [fetchPrescriptionDetails]
  );

  const getStatusBadge = (status) => {
    const badgeStyle =
      status === "New Patient"
        ? styles.statusBadgeGreen
        : styles.statusBadgeOrange;
    return <span style={badgeStyle}>{status}</span>;
  };

  const uniqueDepartments = useMemo(
    () => [...new Set(patients.map((patient) => patient.department))],
    [patients]
  );

  const uniqueAppointmentStatuses = useMemo(
    () => [...new Set(patients.map((patient) => patient.appointmentStatus))],
    [patients]
  );

  const medicineColumns = [
    {
      title: "Medicine Name",
      dataIndex: "medName",
      key: "medName",
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Dosage",
      dataIndex: "dosage",
      key: "dosage",
    },
    {
      title: "Duration",
      dataIndex: "duration",
      key: "duration",
    },
    {
      title: "Frequency",
      dataIndex: "frequency",
      key: "frequency",
    },
  ];

  const testColumns = [
    {
      title: "Test Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Lab Test ID",
      dataIndex: "labTestID",
      key: "labTestID",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
    },
  ];

  // Filtering logic for search and dropdown
  // useEffect(() => {
  //   let filtered = [...patients];
  //   if (searchText) {
  //     filtered = filtered.filter((patient) => {
  //       if (searchField === "all") {
  //         return (
  //           patient.name.toLowerCase().includes(searchText) ||
  //           patient.id.toLowerCase().includes(searchText) ||
  //           patient.department.toLowerCase().includes(searchText) ||
  //           patient.phone.includes(searchText)
  //         );
  //       } else if (searchField === "name") {
  //         return patient.name.toLowerCase().includes(searchText);
  //       } else if (searchField === "id") {
  //         return patient.id.toLowerCase().includes(searchText);
  //       } else if (searchField === "department") {
  //         return patient.department.toLowerCase().includes(searchText);
  //       }
  //       return true;
  //     });
  //   }
  //   if (sortBy && sortBy !== "all") {
  //     filtered = filtered.filter(
  //       (patient) =>
  //         (patient.appointmentType || "")
  //           .replace(/\s+/g, "")
  //           .replace(/-/g, "")
  //           .toLowerCase() ===
  //         sortBy.replace(/\s+/g, "").replace(/-/g, "").toLowerCase()
  //     );
  //   }
  //   setFilteredPatients(filtered);
  //   setCurrentPage(1);
  // }, [patients, searchText, searchField, sortBy]);

  // Helper function to check if a value should be displayed
  const shouldDisplayValue = (value) => {
    return (
      value && value !== "N/A" && value !== "undefined" && value !== undefined
    );
  };



  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>My Patients</h1>
        <p style={styles.subtitle}>Manage and view all registered patients</p>
      </div>

      <div style={styles.controls}>
        <div style={styles.controlsRow}>
          <div style={styles.leftControls}>
            <div style={styles.searchContainer}>
              <Search style={styles.searchIcon} />
              <input
                type="text"
                placeholder={`Search by ${searchField === "all" ? "Patient ID, Name " : searchField
                  }`}
                value={searchText.toUpperCase()}
                onChange={(e) => setSearchText(e.target.value.toLowerCase())}
                style={styles.searchInput}
                onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
              />
            </div>
            <select
              value={filters.type}
              onChange={(e) => handleSort(e.target.value)}
              style={styles.sortSelect}
            >
              <option value="all">All Types</option>
              <option value="new-walkin">New Walkin</option>
              <option value="new-homecare">New HomeCare</option>
              <option value="new-patient-walkthrough">
                New Patient Walkthrough
              </option>
              <option value="followup-walkin">Followup Walkin</option>
              <option value="followup-video">Followup Video</option>
              <option value="followup-homecare">Followup Homecare</option>
            </select>
          </div>
        </div>
      </div>

      {/* Prescription Modal */}
      <Modal
        title="Patient Prescription Details"
        open={isPrescriptionModalVisible}
        onCancel={() => setIsPrescriptionModalVisible(false)}
        width={800}
        className="prescription-modal"
        footer={[
          <Button
            key="close"
            onClick={() => setIsPrescriptionModalVisible(false)}
          >
            Close
          </Button>,
        ]}
        style={{ transform: "translateX(90px)" }}
      >
        {selectedPatient && (
          <div style={{ padding: "20px 0" }}>
            {/* Patient Information Section */}
            <div style={styles.prescriptionSection}>
              <h3 style={styles.sectionTitle}>Patient Information</h3>
              <div style={styles.infoGrid}>
                <div style={styles.infoItem}>
                  <strong>Patient ID:</strong> {selectedPatient.id}
                </div>
                <div style={styles.infoItem}>
                  <strong>Name:</strong> {selectedPatient.name}
                </div>
                <div style={styles.infoItem}>
                  <strong>Gender:</strong> {selectedPatient.gender}
                </div>
                <div style={styles.infoItem}>
                  <strong>Phone:</strong> {selectedPatient.phone}
                </div>
                <div style={styles.infoItem}>
                  <strong>Last Visit:</strong> {selectedPatient.lastVisit}
                </div>
                <div style={styles.infoItem}>
                  <strong>Department:</strong> {selectedPatient.department}
                </div>
                <div style={styles.infoItem}>
                  <strong>Status:</strong> {selectedPatient.status}
                </div>
              </div>
            </div>

            {/* ePrescription Section */}
            {ePrescriptionData && (
              <>
                {/* Patient Info Section */}
                <div style={styles.prescriptionSection}>
                  <h3 style={styles.sectionTitle}>ePrescription Details</h3>

                  <div style={styles.subSection}>
                    <h4 style={styles.subSectionTitle}>Patient Info</h4>
                    <div style={styles.infoGrid}>
                      {shouldDisplayValue(ePrescriptionData.patientInfo?.age) && (
                        <div style={styles.infoItem}>
                          <strong>Age:</strong> {ePrescriptionData.patientInfo.age}
                        </div>
                      )}
                      {shouldDisplayValue(
                        ePrescriptionData.patientInfo?.chiefComplaint
                      ) && (
                          <div style={styles.infoItem}>
                            <strong>Chief Complaint:</strong>{" "}
                            {ePrescriptionData.patientInfo.chiefComplaint}
                          </div>
                        )}
                    </div>
                  </div>

                  {/* Vitals Section */}
                  <div style={styles.subSection}>
                    <h4 style={styles.subSectionTitle}>Vitals</h4>
                    <div style={styles.infoGrid}>
                      {shouldDisplayValue(ePrescriptionData.vitals?.bp) && (
                        <div style={styles.infoItem}>
                          <strong>BP:</strong> {ePrescriptionData.vitals.bp}
                        </div>
                      )}
                      {shouldDisplayValue(
                        ePrescriptionData.vitals?.pulseRate
                      ) && (
                          <div style={styles.infoItem}>
                            <strong>Pulse Rate:</strong>{" "}
                            {ePrescriptionData.vitals.pulseRate}
                          </div>
                        )}
                      {shouldDisplayValue(
                        ePrescriptionData.vitals?.respiratoryRate
                      ) && (
                          <div style={styles.infoItem}>
                            <strong>Respiratory Rate:</strong>{" "}
                            {ePrescriptionData.vitals.respiratoryRate}
                          </div>
                        )}
                      {shouldDisplayValue(
                        ePrescriptionData.vitals?.temperature
                      ) && (
                          <div style={styles.infoItem}>
                            <strong>Temperature:</strong>{" "}
                            {ePrescriptionData.vitals.temperature}
                          </div>
                        )}
                      {shouldDisplayValue(ePrescriptionData.vitals?.spo2) && (
                        <div style={styles.infoItem}>
                          <strong>SPO2:</strong> {ePrescriptionData.vitals.spo2}
                        </div>
                      )}
                      {shouldDisplayValue(ePrescriptionData.vitals?.height) && (
                        <div style={styles.infoItem}>
                          <strong>Height:</strong>{" "}
                          {ePrescriptionData.vitals.height}
                        </div>
                      )}
                      {shouldDisplayValue(ePrescriptionData.vitals?.weight) && (
                        <div style={styles.infoItem}>
                          <strong>Weight:</strong>{" "}
                          {ePrescriptionData.vitals.weight}
                        </div>
                      )}
                      {shouldDisplayValue(ePrescriptionData.vitals?.bmi) && (
                        <div style={styles.infoItem}>
                          <strong>BMI:</strong> {ePrescriptionData.vitals.bmi}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Diagnosis Section */}
                  {shouldDisplayValue(
                    ePrescriptionData.diagnosis?.diagnosisNote
                  ) && (
                      <div style={styles.subSection}>
                        <h4 style={styles.subSectionTitle}>Diagnosis</h4>
                        <div style={styles.infoItem}>
                          <strong>Diagnosis Note:</strong>{" "}
                          {ePrescriptionData.diagnosis.diagnosisNote}
                        </div>
                      </div>
                    )}

                  {/* Advice Section */}
                  <div style={styles.subSection}>
                    <h4 style={styles.subSectionTitle}>Advice</h4>
                    <div style={styles.infoGrid}>
                      {shouldDisplayValue(
                        ePrescriptionData.advice?.followUpDate
                      ) && (
                          <div style={styles.infoItem}>
                            <strong>Follow-up Date:</strong>{" "}
                            {moment(ePrescriptionData.advice.followUpDate).format(
                              "DD MMMM YYYY"
                            )}
                          </div>
                        )}
                      {shouldDisplayValue(ePrescriptionData.advice?.advice) && (
                        <div style={styles.infoItem}>
                          <strong>Advice:</strong>{" "}
                          {ePrescriptionData.advice.advice}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Prescribed Medicines Section */}
            <div style={styles.prescriptionSection}>
              <h3 style={styles.sectionTitle}>Prescribed Medicines</h3>
              {prescriptionLoading ? (
                <div style={styles.loadingMessage}>
                  Loading prescription details...
                </div>
              ) : (
                <>
                  {ePrescriptionData?.diagnosis?.medications?.length > 0 ? (
                    <Table
                      dataSource={ePrescriptionData.diagnosis.medications.map(
                        (med) => ({
                          ...med,
                          key: med.medInventoryId,
                        })
                      )}
                      columns={medicineColumns}
                      pagination={false}
                      size="small"
                      style={{ marginTop: "16px" }}
                    />
                  ) : prescriptionData.medicines.length > 0 ? (
                    <Table
                      dataSource={prescriptionData.medicines}
                      columns={medicineColumns}
                      rowKey="id"
                      pagination={false}
                      size="small"
                      style={{ marginTop: "16px" }}
                    />
                  ) : (
                    <div style={styles.noDataMessage}>
                      No medicines prescribed for this patient.
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Prescribed Tests Section */}
            <div style={styles.prescriptionSection}>
              <h3 style={styles.sectionTitle}>Prescribed Tests</h3>
              {prescriptionLoading ? (
                <div style={styles.loadingMessage}>
                  Loading prescription details...
                </div>
              ) : (
                <>
                  {ePrescriptionData?.diagnosis?.selectedTests?.length > 0 ? (
                    <Table
                      dataSource={ePrescriptionData.diagnosis.selectedTests.map(
                        (test) => ({
                          name: test.testName,
                          labTestID: test.testInventoryId,
                          status: "Prescribed",
                          key: test.testInventoryId || test.testName,
                        })
                      )}
                      columns={testColumns}
                      pagination={false}
                      size="small"
                      style={{ marginTop: "16px" }}
                    />
                  ) : prescriptionData.tests.length > 0 ? (
                    <Table
                      dataSource={prescriptionData.tests}
                      columns={testColumns}
                      rowKey="id"
                      pagination={false}
                      size="small"
                      style={{ marginTop: "16px" }}
                    />
                  ) : (
                    <div style={styles.noDataMessage}>
                      No tests prescribed for this patient.
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </Modal>

      <div style={styles.tableContainer}>
        <div style={styles.tableHeader}>
          <div>Patient ID</div>
          <div>Patient</div>
          <div>Gender</div>
          <div>Age</div>
          <div>Phone</div>
          <div>Last Visit</div>
          <div>Action</div>
        </div>

        <div style={styles.tableBody}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "24px" }}>
              Loading...
            </div>
          ) : patients.length === 0 ? (
            <div style={{ textAlign: "center", padding: "24px" }}>
              No patients found.
            </div>
          ) : (
            patients.map((patient) => (
              <div
                key={patient.appointmentId}
                style={styles.tableRow}
                onMouseEnter={(e) =>
                  (e.target.style.backgroundColor = "#f8fafc")
                }
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
                    onClick={() => handleViewPrescription(patient)}
                    onMouseEnter={(e) =>
                      (e.target.style.backgroundColor = "#f3f4f6")
                    }
                    onMouseLeave={(e) =>
                      (e.target.style.backgroundColor = "transparent")
                    }
                  >
                    <EyeOutlined
                      style={{
                        fontSize: "16px",
                        color: "#9ca3af",
                      }}
                    />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div style={styles.pagination}>
        <div style={styles.paginationInfo}>
          {/* Showing {(currentPage - 1) * pageSize + 1} to{" "}
          {Math.min(currentPage * pageSize, filteredPatients.length)} of{" "}
          {filteredPatients.length} results */}
        </div>

        <div style={styles.paginationControls}>
          <button
            disabled={pagination.current === 1}
            onClick={() =>
              setPagination((prev) => ({
                ...prev,
                current: prev.current - 1,
              }))
            }
          >
            Previous
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              style={
                page === pagination.current
                  ? styles.paginationButtonActive
                  : styles.paginationButton
              }
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  current: page,
                }))
              }
            >
              {page}
            </button>
          ))}

          <button
            disabled={pagination.current === totalPages}
            onClick={() =>
              setPagination((prev) => ({
                ...prev,
                current: prev.current + 1,
              }))
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