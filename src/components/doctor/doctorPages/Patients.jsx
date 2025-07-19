import React, { useState, useEffect, useCallback, useMemo } from "react";
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

  const pageSize = 10;

  const calculateAge = (dob) => {
    if (!dob) return "N/A";
    return moment().diff(moment(dob, "DD-MM-YYYY"), "years").toString();
  };

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        message.error("No authentication token found. Please login again.");
        return;
      }

      const response = await apiGet(
        `/appointment/getAppointmentsByDoctorID/patients?doctorId=${doctorId}`
      );
      const data = response.data;

      console.log(response.data, "response.data from patients.jsx");

      let patientsData = [];


     if (response.status === 200 && data.data) {
  const appointmentsData = Array.isArray(data.data)
    ? data.data
    : [data.data];

  const patientsDataUnsorted = appointmentsData.map((appointment) => ({
    id: appointment.userId || `P-${Math.random().toString(36).substr(2, 6)}`,
    appointmentId: appointment.appointmentId || "N/A",
    name: appointment.patientName || "N/A",
    gender: appointment.patientDetails?.gender || "N/A",
    age: appointment.patientDetails?.dob
      ? calculateAge(appointment.patientDetails.dob)
      : "N/A",
    phone: appointment.patientDetails?.mobile || "N/A",
    lastVisit: appointment.appointmentDate
      ? moment(appointment.appointmentDate).format("DD MMMM YYYY")
      : "N/A",
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
  }));

  // 🔽 Sorting by date (desc) then by userId (desc)
  patientsDataUnsorted.sort((a, b) => {

    const getNumericId = (id) => parseInt(id.replace(/\D/g, ''), 10);

  const numA = getNumericId(a.id);
  const numB = getNumericId(b.id);

  return numB - numA;
    // const dateA = moment(a.lastVisit, "DD MMMM YYYY");
    // const dateB = moment(b.lastVisit, "DD MMMM YYYY");

    // if (dateA.isBefore(dateB)) return 1;
    // if (dateA.isAfter(dateB)) return -1;

    // // Dates are same, now compare ID (assuming alphanumeric)
    // return b.id.localeCompare(a.id); // latest (higher) id first
  });


          if (dateA.isBefore(dateB)) return 1;
          if (dateA.isAfter(dateB)) return -1;

          // Dates are same, now compare ID (assuming alphanumeric)
          return b.id.localeCompare(a.id); // latest (higher) id first
        });

        patientsData = patientsDataUnsorted;

        setPatients(patientsData);
        setFilteredPatients(patientsData);
      }
    } catch (error) {
      console.error("Error fetching patients:", error);
      message.error("Failed to fetch patients data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [doctorId]);

  useEffect(() => {
    if (user && doctorId) {
      fetchPatients();
    }
  }, [user, doctorId, fetchPatients]);

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

  const handleSort = useCallback((value) => {
    setSortBy(value);
    setCurrentPage(1);
    setFilteredPatients((prev) =>
      [...prev].sort((a, b) => {
        if (value === "Name") return a.name.localeCompare(b.name);
        if (value === "Date") {
          const dateA = moment(a.lastVisit, "DD MMMM YYYY");
          const dateB = moment(b.lastVisit, "DD MMMM YYYY");
          return dateB.isBefore(dateA) ? -1 : dateB.isAfter(dateA) ? 1 : 0;
        }
        if (value === "ID") return a.id.localeCompare(b.id);
        return 0;
      })
    );
  }, []);

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

  const totalPages = Math.ceil(filteredPatients.length / pageSize);
  const paginatedPatients = useMemo(
    () =>
      filteredPatients.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
      ),
    [filteredPatients, currentPage]
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
  useEffect(() => {
    let filtered = [...patients];
    if (searchText) {
      filtered = filtered.filter((patient) => {
        if (searchField === "all") {
          return (
            patient.name.toLowerCase().includes(searchText) ||
            patient.id.toLowerCase().includes(searchText) ||
            patient.department.toLowerCase().includes(searchText) ||
            patient.phone.includes(searchText)
          );
        } else if (searchField === "name") {
          return patient.name.toLowerCase().includes(searchText);
        } else if (searchField === "id") {
          return patient.id.toLowerCase().includes(searchText);
        } else if (searchField === "department") {
          return patient.department.toLowerCase().includes(searchText);
        }
        return true;
      });
    }
    if (sortBy && sortBy !== "all") {
      filtered = filtered.filter(
        (patient) =>
          (patient.appointmentType || "")
            .replace(/\s+/g, "")
            .replace(/-/g, "")
            .toLowerCase() ===
          sortBy.replace(/\s+/g, "").replace(/-/g, "").toLowerCase()
      );
    }
    setFilteredPatients(filtered);
    setCurrentPage(1);
  }, [patients, searchText, searchField, sortBy]);

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
                placeholder={`Search by ${
                  searchField === "all" ? "Patient ID, Name " : searchField
                }`}
                value={searchText.toUpperCase()}
                onChange={handleSearch}
                style={styles.searchInput}
                onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
              />
            </div>
            <select
              value={sortBy}
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
        footer={[
          <Button
            key="close"
            onClick={() => setIsPrescriptionModalVisible(false)}
          >
            Close
          </Button>,
        ]}
        style={{
          top: "5px",
          right: "100px",
          left: "auto", // This ensures it doesn't stick to the left
          transform: "none", // Remove default centering transform
          position: "absolute",
        }}
        bodyStyle={{
          maxHeight: "calc(100vh - 150px)",
          overflowY: "auto",
          padding: "16px",
        }}
      >
        {selectedPatient && (
          <div style={{ padding: "12px 0" }}>
            {/* Patient Information Section - Now in a single row */}
            <div style={styles.prescriptionSection}>
              <h3 style={styles.sectionTitle}>Patient Information</h3>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "16px",
                  alignItems: "center",
                }}
              >
                {selectedPatient.id &&
                  selectedPatient.id !== "N/A" &&
                  selectedPatient.id !== null &&
                  selectedPatient.id !== undefined &&
                  selectedPatient.id !== "" && (
                    <div style={styles.infoItem}>
                      <strong>Patient ID:</strong> {selectedPatient.id}
                    </div>
                  )}
                {selectedPatient.name &&
                  selectedPatient.name !== "N/A" &&
                  selectedPatient.name !== null &&
                  selectedPatient.name !== undefined &&
                  selectedPatient.name !== "" && (
                    <div style={styles.infoItem}>
                      <strong>Name:</strong> {selectedPatient.name}
                    </div>
                  )}
                {selectedPatient.gender &&
                  selectedPatient.gender !== "N/A" &&
                  selectedPatient.gender !== null &&
                  selectedPatient.gender !== undefined &&
                  selectedPatient.gender !== "" && (
                    <div style={styles.infoItem}>
                      <strong>Gender:</strong> {selectedPatient.gender}
                    </div>
                  )}
                {selectedPatient.phone &&
                  selectedPatient.phone !== "N/A" &&
                  selectedPatient.phone !== null &&
                  selectedPatient.phone !== undefined &&
                  selectedPatient.phone !== "" && (
                    <div style={styles.infoItem}>
                      <strong>Phone:</strong> {selectedPatient.phone}
                    </div>
                  )}
                {selectedPatient.lastVisit &&
                  selectedPatient.lastVisit !== "N/A" &&
                  selectedPatient.lastVisit !== null &&
                  selectedPatient.lastVisit !== undefined &&
                  selectedPatient.lastVisit !== "" && (
                    <div style={styles.infoItem}>
                      <strong>Last Visit:</strong> {selectedPatient.lastVisit}
                    </div>
                  )}
                {selectedPatient.department &&
                  selectedPatient.department !== "N/A" &&
                  selectedPatient.department !== null &&
                  selectedPatient.department !== undefined &&
                  selectedPatient.department !== "" && (
                    <div style={styles.infoItem}>
                      <strong>Department:</strong> {selectedPatient.department}
                    </div>
                  )}
                {selectedPatient.status &&
                  selectedPatient.status !== "N/A" &&
                  selectedPatient.status !== null &&
                  selectedPatient.status !== undefined &&
                  selectedPatient.status !== "" && (
                    <div style={styles.infoItem}>
                      <strong>Status:</strong> {selectedPatient.status}
                    </div>
                  )}
              </div>
            </div>

            {/* ePrescription Section */}
            {ePrescriptionData && (
              <>
                {/* Patient Info Section */}
                <div style={styles.prescriptionSection}>
                  <br/>
                  <h3 style={styles.sectionTitle}>ePrescription Details</h3>
                  <div style={styles.subSection}>
                    <h4 style={styles.subSectionTitle}>Patient Info</h4>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "16px",
                        alignItems: "center",
                      }}
                    >
                      {ePrescriptionData.patientInfo?.age &&
                        ePrescriptionData.patientInfo.age !== "N/A" &&
                        ePrescriptionData.patientInfo.age !== null &&
                        ePrescriptionData.patientInfo.age !== undefined &&
                        ePrescriptionData.patientInfo.age !== "" && (
                          <div style={styles.infoItem}>
                            <strong>Age:</strong>{" "}
                            {ePrescriptionData.patientInfo.age}
                          </div>
                        )}
                      {ePrescriptionData.patientInfo?.chiefComplaint &&
                        ePrescriptionData.patientInfo.chiefComplaint !==
                          "N/A" &&
                        ePrescriptionData.patientInfo.chiefComplaint !== null &&
                        ePrescriptionData.patientInfo.chiefComplaint !==
                          undefined &&
                        ePrescriptionData.patientInfo.chiefComplaint !== "" && (
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
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "16px",
                        alignItems: "center",
                      }}
                    >
                      {ePrescriptionData.vitals?.bp &&
                        ePrescriptionData.vitals.bp !== "N/A" &&
                        ePrescriptionData.vitals.bp !== null &&
                        ePrescriptionData.vitals.bp !== undefined &&
                        ePrescriptionData.vitals.bp !== "undefined" &&
                        ePrescriptionData.vitals.bp !== "" && (
                          <div style={styles.infoItem}>
                            <strong>BP:</strong> {ePrescriptionData.vitals.bp}
                          </div>
                        )}
                      {ePrescriptionData.vitals?.pulseRate &&
                        ePrescriptionData.vitals.pulseRate !== "N/A" &&
                        ePrescriptionData.vitals.pulseRate !== null &&
                        ePrescriptionData.vitals.pulseRate !== undefined &&
                        ePrescriptionData.vitals.pulseRate !== "undefined" &&
                        ePrescriptionData.vitals.pulseRate !== "" && (
                          <div style={styles.infoItem}>
                            <strong>Pulse Rate:</strong>{" "}
                            {ePrescriptionData.vitals.pulseRate}
                          </div>
                        )}
                      {ePrescriptionData.vitals?.respiratoryRate &&
                        ePrescriptionData.vitals.respiratoryRate !== "N/A" &&
                        ePrescriptionData.vitals.respiratoryRate !== null &&
                        ePrescriptionData.vitals.respiratoryRate !==
                          undefined &&
                        ePrescriptionData.vitals.respiratoryRate !== "" && (
                          <div style={styles.infoItem}>
                            <strong>Respiratory Rate:</strong>{" "}
                            {ePrescriptionData.vitals.respiratoryRate}
                          </div>
                        )}
                      {ePrescriptionData.vitals?.temperature &&
                        ePrescriptionData.vitals.temperature !== "N/A" &&
                        ePrescriptionData.vitals.temperature !== null &&
                        ePrescriptionData.vitals.temperature !== undefined &&
                        ePrescriptionData.vitals.temperature !== "" && (
                          <div style={styles.infoItem}>
                            <strong>Temperature:</strong>{" "}
                            {ePrescriptionData.vitals.temperature}
                          </div>
                        )}
                      {ePrescriptionData.vitals?.spo2 &&
                        ePrescriptionData.vitals.spo2 !== "N/A" &&
                        ePrescriptionData.vitals.spo2 !== null &&
                        ePrescriptionData.vitals.spo2 !== undefined &&
                        ePrescriptionData.vitals.spo2 !== "" && (
                          <div style={styles.infoItem}>
                            <strong>SPO2:</strong>{" "}
                            {ePrescriptionData.vitals.spo2}
                          </div>
                        )}
                      {ePrescriptionData.vitals?.height &&
                        ePrescriptionData.vitals.height !== "N/A" &&
                        ePrescriptionData.vitals.height !== null &&
                        ePrescriptionData.vitals.height !== undefined &&
                        ePrescriptionData.vitals.height !== "" && (
                          <div style={styles.infoItem}>
                            <strong>Height:</strong>{" "}
                            {ePrescriptionData.vitals.height}
                          </div>
                        )}
                      {ePrescriptionData.vitals?.weight &&
                        ePrescriptionData.vitals.weight !== "N/A" &&
                        ePrescriptionData.vitals.weight !== null &&
                        ePrescriptionData.vitals.weight !== undefined &&
                        ePrescriptionData.vitals.weight !== "" && (
                          <div style={styles.infoItem}>
                            <strong>Weight:</strong>{" "}
                            {ePrescriptionData.vitals.weight}
                          </div>
                        )}
                      {ePrescriptionData.vitals?.bmi &&
                        ePrescriptionData.vitals.bmi !== "N/A" &&
                        ePrescriptionData.vitals.bmi !== null &&
                        ePrescriptionData.vitals.bmi !== undefined &&
                        ePrescriptionData.vitals.bmi !== "" && (
                          <div style={styles.infoItem}>
                            <strong>BMI:</strong> {ePrescriptionData.vitals.bmi}
                          </div>
                        )}
                    </div>
                  </div>

                  {/* Diagnosis Section */}
                  {ePrescriptionData.diagnosis?.diagnosisNote &&
                    ePrescriptionData.diagnosis.diagnosisNote !== "N/A" &&
                    ePrescriptionData.diagnosis.diagnosisNote !== null &&
                    ePrescriptionData.diagnosis.diagnosisNote !== undefined &&
                    ePrescriptionData.diagnosis.diagnosisNote !== "" && (
                      <div style={styles.subSection}>
                        <h4 style={styles.subSectionTitle}>Diagnosis</h4>
                        <div style={styles.infoItem}>
                          <strong>Diagnosis Note:</strong>{" "}
                          {ePrescriptionData.diagnosis.diagnosisNote}
                        </div>
                      </div>
                    )}

                  {/* Advice Section */}
                  {(ePrescriptionData.advice?.followUpDate ||
                    ePrescriptionData.advice?.advice) && (
                    <div style={styles.subSection}>
                      <h4 style={styles.subSectionTitle}>Advice</h4>
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "16px",
                          alignItems: "center",
                        }}
                      >
                        {ePrescriptionData.advice?.followUpDate &&
                          ePrescriptionData.advice.followUpDate !== "N/A" &&
                          ePrescriptionData.advice.followUpDate !== null &&
                          ePrescriptionData.advice.followUpDate !== undefined &&
                          ePrescriptionData.advice.followUpDate !== "" && (
                            <div style={styles.infoItem}>
                              <strong>Follow-up Date:</strong>{" "}
                              {moment(
                                ePrescriptionData.advice.followUpDate
                              ).format("DD MMMM YYYY")}
                            </div>
                          )}
                        {ePrescriptionData.advice?.advice &&
                          ePrescriptionData.advice.advice !== "N/A" &&
                          ePrescriptionData.advice.advice !== null &&
                          ePrescriptionData.advice.advice !== undefined &&
                          ePrescriptionData.advice.advice !== "" && (
                            <div style={styles.infoItem}>
                              <strong>Advice:</strong>{" "}
                              {ePrescriptionData.advice.advice}
                            </div>
                          )}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
            <br />

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
                      style={{
                        marginTop: "16px",
                        maxWidth: "100%",
                        overflowX: "auto",
                      }}
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
          ) : paginatedPatients.length === 0 ? (
            <div style={{ textAlign: "center", padding: "24px" }}>
              No patients found.
            </div>
          ) : (
            paginatedPatients.map((patient) => (
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
          Showing {(currentPage - 1) * pageSize + 1} to{" "}
          {Math.min(currentPage * pageSize, filteredPatients.length)} of{" "}
          {filteredPatients.length} results
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
