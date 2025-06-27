"use client";
import React, { useState, useEffect } from "react";
import {
  Table,
  Input,
  Select,
  Button,
  DatePicker,
  TimePicker,
  Tag,
  Row,
  Col,
  Typography,
  Modal,
  message,
  Card,
  Grid,
} from "antd";
import {
  SearchOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  UserOutlined,
  BellOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import moment from "moment";

const { useBreakpoint } = Grid;
const { Title, Text } = Typography;
const { Option } = Select;

const AddWalkInPatient = () => {
  const screens = useBreakpoint();
  const [patientData, setPatientData] = useState({
    doctorId: "",
    firstName: "",
    lastName: "",
    age: "",
    gender: "",
    appointmentType: "",
    department: "",
    date: "",
    time: "",
    visitReason: "",
    selectedDate: new Date(),
    selectedTimeSlot: "",
    phoneNumber: "",
    dateOfBirth: "",
  });
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [paymentStatus, setPaymentStatus] = useState("paid");
  const [isCreatingPatient, setIsCreatingPatient] = useState(false);
  const [isCreatingAppointment, setIsCreatingAppointment] = useState(false);
  const [apiError, setApiError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [userFound, setUserFound] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [createdPatientId, setCreatedPatientId] = useState("");
  const [patientCreated, setPatientCreated] = useState(false);
  const [consultationFee, setConsultationFee] = useState(undefined);
  const [discount, setDiscount] = useState(10);
  const [discountType, setDiscountType] = useState("percentage");
  const [fieldErrors, setFieldErrors] = useState({});
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUserIndex, setSelectedUserIndex] = useState(null);

  const calculateTotalAmount = () => {
    const fee = consultationFee ?? 0;
    if (discountType === "percentage") {
      return fee - (fee * discount) / 100;
    } else {
      return fee - discount;
    }
  };

  const totalAmount = calculateTotalAmount();

  const API_BASE_URL = "http://192.168.1.42:3000";
  const getAuthToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("accessToken") || "your-token-here";
    }
    return "your-token-here";
  };

  useEffect(() => {
    fetchMyDoctors();
  }, []);

  const fetchMyDoctors = async () => {
    setIsLoadingDoctors(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/receptionist/fetchMyDoctors`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.status || `HTTP error! status: ${response.status}`
        );
      }

      if (data.status === "success" && data.data) {
        setDoctors(data.data);
        if (data.data.length > 0) {
          setSelectedDoctor(data.data[0]);
          setPatientData((prev) => ({
            ...prev,
            doctorId: data.data[0].doctorId,
          }));
        }
      }
    } catch (error) {
      console.error("Fetch Doctors API Error:", error);
      setApiError("Failed to load doctors list. Please refresh the page.");
    } finally {
      setIsLoadingDoctors(false);
    }
  };

  const searchUser = async (mobile) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/doctor/searchUser?mobile=${mobile}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || `HTTP error! status: ${response.status}`
        );
      }

      if (Array.isArray(data.data)) {
        return {
          success: true,
          message: data.message || "User(s) found successfully",
          data: data.data,
        };
      }

      return {
        success: true,
        message: data.message || "User found successfully",
        data: data.data || data,
      };
    } catch (error) {
      console.error("Search User API Error:", error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to search user",
      };
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setApiError("Please enter a mobile number to search");
      return;
    }

    if (!validatePhoneNumber(searchQuery)) {
      setApiError(
        "Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9"
      );
      return;
    }

    setIsSearching(true);
    setApiError("");
    setUserFound(false);
    setPatientCreated(false);
    setSearchResults([]);
    setSelectedUserIndex(null);

    try {
      const searchResult = await searchUser(searchQuery);

      if (
        searchResult.success &&
        Array.isArray(searchResult.data) &&
        searchResult.data.length > 0
      ) {
        setSearchResults(searchResult.data);

        if (searchResult.data.length === 1) {
          const userData = searchResult.data[0];
          setSelectedUserIndex(0);
          setPatientData((prev) => ({
            ...prev,
            phoneNumber: userData.mobile || searchQuery,
            firstName: userData.firstname || "",
            lastName: userData.lastname || "",
            gender: userData.gender || "",
            age: userData.DOB
              ? `${
                  new Date().getFullYear() -
                  parseInt(userData.DOB.split("-")[2])
                }`
              : "",
            dateOfBirth: userData.DOB
              ? `${userData.DOB.split("-")[2]}-${userData.DOB.split("-")[1]}-${
                  userData.DOB.split("-")[0]
                }`
              : "",
          }));
          setUserFound(true);
          setPatientCreated(true);
          setCreatedPatientId(userData.userId || "");
          setApiError("");
        } else {
          setApiError(
            "Multiple patients found with this mobile number. Please select one."
          );
        }
      } else if (
        searchResult.success &&
        searchResult.data &&
        !Array.isArray(searchResult.data)
      ) {
        const userData = searchResult.data;
        setPatientData((prev) => ({
          ...prev,
          phoneNumber: userData.mobile || searchQuery,
          firstName: userData.firstname || "",
          lastName: userData.lastname || "",
          gender: userData.gender || "",
          age: userData.DOB
            ? `${
                new Date().getFullYear() - parseInt(userData.DOB.split("-")[2])
              }`
            : "",
          dateOfBirth: userData.DOB
            ? `${userData.DOB.split("-")[2]}-${userData.DOB.split("-")[1]}-${
                userData.DOB.split("-")[0]
              }`
            : "",
        }));
        setUserFound(true);
        setPatientCreated(true);
        setCreatedPatientId(userData.userId || "");
        setApiError("");
      } else {
        setPatientData((prev) => ({
          ...prev,
          phoneNumber: searchQuery,
          firstName: "",
          lastName: "",
          gender: "",
          age: "",
          dateOfBirth: "",
        }));
        setUserFound(false);
        setPatientCreated(false);
        setCreatedPatientId("");
        setApiError(
          "User not found. Please enter patient details to create a new patient."
        );
      }
    } catch (error) {
      console.error("Search error:", error);
      setApiError("An error occurred while searching. Please try again.");
      setUserFound(false);
      setPatientCreated(false);
    } finally {
      setIsSearching(false);
    }
  };

  const handleUserSelect = (index) => {
    const userData = searchResults[index];
    setSelectedUserIndex(index);
    setPatientData((prev) => ({
      ...prev,
      phoneNumber: userData.mobile || searchQuery,
      firstName: userData.firstname || "",
      lastName: userData.lastname || "",
      gender: userData.gender || "",
      age: userData.DOB
        ? `${new Date().getFullYear() - parseInt(userData.DOB.split("-")[2])}`
        : "",
      dateOfBirth: userData.DOB
        ? `${userData.DOB.split("-")[2]}-${userData.DOB.split("-")[1]}-${
            userData.DOB.split("-")[0]
          }`
        : "",
    }));
    setUserFound(true);
    setPatientCreated(true);
    setCreatedPatientId(userData.userId || "");
    setApiError("");
  };

  const validateName = (name) => {
    const nameRegex = /^[a-zA-Z\s\-'.]+$/;
    return nameRegex.test(name);
  };

  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^[6-9][0-9]{9}$/;
    return phoneRegex.test(phone);
  };

  const validateAge = (age) => {
    const ageNum = parseInt(age);
    return !isNaN(ageNum) && ageNum >= 1 && ageNum <= 120;
  };

  const validateDOB = (dob) => {
    if (!dob) return false;
    const dobDate = new Date(dob);
    const today = new Date();
    return dobDate <= today;
  };

  const handleInputChange = (field, value) => {
    setFieldErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });

    let validatedValue = value;
    let error = "";

    switch (field) {
      case "firstName":
      case "lastName":
        if (value && !validateName(value)) {
          error = "Only letters, spaces, hyphens, and apostrophes are allowed";
        }
        break;

      case "phoneNumber":
        validatedValue = value.replace(/\D/g, "");
        if (validatedValue && !validatePhoneNumber(validatedValue)) {
          error =
            "Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9";
        }
        break;

      case "age":
        validatedValue = value.replace(/\D/g, "");
        if (validatedValue && !validateAge(validatedValue)) {
          error = "Please enter a valid age between 1 and 120";
        }
        break;

      case "dateOfBirth":
        if (value && !validateDOB(value)) {
          error = "Date of birth cannot be in the future";
        }
        break;

      case "visitReason":
        if (value.length > 500) {
          validatedValue = value.substring(0, 500);
        }
        break;
    }

    if (error) {
      setFieldErrors((prev) => ({
        ...prev,
        [field]: error,
      }));
    }

    setPatientData((prev) => ({
      ...prev,
      [field]: validatedValue,
    }));
  };

  const formatDateForAPI = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatTimeForAPI = (timeSlot) => {
    const [time, period] = timeSlot.split(" ");
    let [hours, minutes] = time.split(":");

    if (period === "PM" && hours !== "12") {
      hours = String(Number(hours) + 12);
    } else if (period === "AM" && hours === "12") {
      hours = "00";
    }

    return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;
  };

  const createAppointment = async (appointmentRequest) => {
    return {
      success: true,
      data: { appointmentId: "dummyAppointmentId" },
      message: "Appointment created",
    };
  };

  const createPatient = async (patientRequest) => {
    return {
      success: true,
      data: { patientId: "dummyId" },
      message: "Patient created",
    };
  };

  const handleContinueToPayment = async () => {
    if (!patientCreated) {
      setApiError("Please create or find a patient first");
      return;
    }

    if (!validateAppointmentData()) {
      return;
    }

    setIsCreatingAppointment(true);
    setApiError("");

    try {
      const appointmentRequest = {
        userId: createdPatientId,
        doctorId: patientData.doctorId,
        patientName: `${patientData.firstName} ${patientData.lastName}`,
        doctorName: selectedDoctor?.doctor?.name || "Doctor",
        appointmentType: patientData.appointmentType,
        appointmentDepartment: patientData.department,
        appointmentDate: formatDateForAPI(patientData.selectedDate),
        appointmentTime: formatTimeForAPI(patientData.selectedTimeSlot),
        appointmentReason: patientData.visitReason || "Not specified",
        amount: totalAmount,
        discount: discount,
        discountType: discountType,
        paymentStatus: paymentStatus,
      };

      console.log("Appointment Request:", appointmentRequest);

      const appointmentResult = await createAppointment(appointmentRequest);

      if (appointmentResult.success) {
        alert(`Appointment created successfully! ${appointmentResult.message}`);
        console.log("Appointment created:", appointmentResult.data);

        if (paymentStatus === "pending") {
          console.log("Redirecting to payment gateway...");
        }

        resetForm();
      } else {
        setApiError(appointmentResult.message);
      }
    } catch (error) {
      console.error("Appointment creation error:", error);
      setApiError(
        "An unexpected error occurred while creating appointment. Please try again."
      );
    } finally {
      setIsCreatingAppointment(false);
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const afternoonSlots = [
    "1:00 PM",
    "1:30 PM",
    "2:00 PM",
    "2:30 PM",
    "3:00 PM",
    "3:30 PM",
    "4:00 PM",
  ];

  const eveningSlots = ["5:00 PM", "5:30 PM", "6:00 PM", "6:30 PM", "7:00 PM"];

  const handleDateSelect = (day) => {
    if (day) {
      const newDate = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        day
      );
      setPatientData((prev) => ({
        ...prev,
        selectedDate: newDate,
      }));
    }
  };

  const handleTimeSlotSelect = (timeSlot) => {
    setPatientData((prev) => ({
      ...prev,
      selectedTimeSlot: timeSlot,
    }));
  };

  const resetForm = () => {
    setPatientData({
      doctorId: doctors.length > 0 ? doctors[0].doctorId : "",
      firstName: "",
      lastName: "",
      age: "",
      gender: "",
      appointmentType: "",
      department: "",
      date: "",
      time: "",
      visitReason: "",
      selectedDate: new Date(),
      selectedTimeSlot: "",
      phoneNumber: "",
      dateOfBirth: "",
    });
    setPaymentStatus("paid");
    setApiError("");
    setSearchQuery("");
    setUserFound(false);
    setPatientCreated(false);
    setCreatedPatientId("");
    setConsultationFee(undefined);
    setDiscount(10);
    setDiscountType("percentage");
    setFieldErrors({});
    setSearchResults([]);
    setSelectedUserIndex(null);

    if (doctors.length > 0) {
      setSelectedDoctor(doctors[0]);
    }
  };

  const days = getDaysInMonth(currentMonth);
  const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const handleSearchKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleCreatePatient = (event) => {
    setIsCreatingPatient(true);
    setTimeout(() => {
      setPatientCreated(true);
      setUserFound(false);
      setCreatedPatientId("dummyId");
      setIsCreatingPatient(false);
      setApiError("");
    }, 1000);
  };

  return (
    <div
      style={{
        minHeight: "calc(100vh - 64px)",
        background: "#f0f2f5",
        padding: screens.xs ? "16px" : "24px",
      }}
    >
      {/* Header Placeholder */}
      <div
        style={{
          width: "100%",
          height: 64,
          background: "#fff",
          boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
          borderBottom: "1px solid #e8e8e8",
          marginBottom: 24,
        }}
      >
        <Row
          justify="space-between"
          align="middle"
          style={{ height: "100%", padding: "0 24px" }}
        >
          <Col>
            <Title level={4} style={{ margin: 0, color: "#262626" }}>
              Hospital Management System
            </Title>
          </Col>
          <Col>
            <Row gutter={16}>
              <Col>
                <BellOutlined style={{ fontSize: 24, color: "#666" }} />
              </Col>
              <Col>
                <UserOutlined style={{ fontSize: 24, color: "#666" }} />
              </Col>
            </Row>
          </Col>
        </Row>
      </div>

      {/* Sidebar Placeholder */}
      <div
        style={{
          width: 64,
          background: "#fff",
          boxShadow: "1px 0 4px rgba(0,0,0,0.1)",
          borderRight: "1px solid #e8e8e8",
          minHeight: "calc(100vh - 64px)",
          position: "absolute",
          left: 0,
        }}
      >
        <Row justify="center" style={{ padding: "24px 0" }}>
          <Col>
            <UserOutlined style={{ fontSize: 40, color: "#1890ff" }} />
          </Col>
        </Row>
      </div>

      {/* Main Content */}
      <div style={{ marginLeft: 64, padding: "0 24px" }}>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Title level={2} style={{ marginBottom: 8, color: "#262626" }}>
              Add Walk-in Patient
            </Title>
            <Text type="secondary" style={{ marginBottom: 24 }}>
              Search for existing patient or enter new patient details for
              walk-in consultation
            </Text>
          </Col>

          {apiError && (
            <Col span={24}>
              <div
                style={{
                  background: "#fff1f0",
                  border: "1px solid #ffa39e",
                  borderRadius: 4,
                  padding: 12,
                }}
              >
                <Text type="danger">{apiError}</Text>
              </div>
            </Col>
          )}

          {userFound && (
            <Col span={24}>
              <div
                style={{
                  background: "#f6ffed",
                  border: "1px solid #b7eb8f",
                  borderRadius: 4,
                  padding: 12,
                }}
              >
                <Text type="success">
                  Patient found! Details have been pre-filled. You can proceed
                  to create appointment.
                </Text>
              </div>
            </Col>
          )}

          {patientCreated && !userFound && (
            <Col span={24}>
              <div
                style={{
                  background: "#e6f7ff",
                  border: "1px solid #91d5ff",
                  borderRadius: 4,
                  padding: 12,
                }}
              >
                <Text type="info">
                  Patient created successfully! You can now proceed to create
                  appointment.
                </Text>
              </div>
            </Col>
          )}

          <Col xs={24} lg={16}>
            <Card style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Input
                    prefix={<SearchOutlined />}
                    placeholder="Mobile Number"
                    value={searchQuery}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      setSearchQuery(value);
                    }}
                    onKeyPress={(e) => {
                      if (!/[0-9]/.test(e.key)) e.preventDefault();
                      else handleSearchKeyPress(e);
                    }}
                    disabled={isSearching}
                    maxLength={10}
                  />
                  {fieldErrors.phoneNumber && (
                    <Text type="danger" style={{ fontSize: 12, marginTop: 4 }}>
                      {fieldErrors.phoneNumber}
                    </Text>
                  )}
                </Col>
                {searchResults.length > 1 && (
                  <Col xs={24} sm={8}>
                    <Select
                      value={
                        selectedUserIndex !== null
                          ? selectedUserIndex
                          : undefined
                      }
                      onChange={handleUserSelect}
                      placeholder="Select Patient"
                      style={{ width: "100%" }}
                    >
                      {searchResults.map((user, idx) => (
                        <Option key={user.userId || idx} value={idx}>
                          {user.firstname} {user.lastname}
                        </Option>
                      ))}
                    </Select>
                  </Col>
                )}
                <Col xs={24} sm={4}>
                  <Button
                    type="primary"
                    onClick={handleSearch}
                    loading={isSearching}
                    disabled={isSearching || searchQuery.length !== 10}
                    style={{ width: "100%" }}
                  >
                    {isSearching ? "..." : "Search"}
                  </Button>
                </Col>
              </Row>
              {isLoadingDoctors && (
                <Text type="info" style={{ marginTop: 8 }}>
                  Loading doctors...
                </Text>
              )}
            </Card>

            <Card
              title={
                <>
                  <UserOutlined /> Basic Information
                </>
              }
              style={{ marginBottom: 16 }}
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={8}>
                  <Input
                    placeholder="Enter First Name *"
                    value={patientData.firstName}
                    onChange={(e) =>
                      handleInputChange("firstName", e.target.value)
                    }
                    disabled={isCreatingPatient || userFound}
                  />
                  {fieldErrors.firstName && (
                    <Text type="danger" style={{ fontSize: 12, marginTop: 4 }}>
                      {fieldErrors.firstName}
                    </Text>
                  )}
                </Col>
                <Col xs={24} sm={8}>
                  <Input
                    placeholder="Enter Last Name *"
                    value={patientData.lastName}
                    onChange={(e) =>
                      handleInputChange("lastName", e.target.value)
                    }
                    disabled={isCreatingPatient || userFound}
                  />
                  {fieldErrors.lastName && (
                    <Text type="danger" style={{ fontSize: 12, marginTop: 4 }}>
                      {fieldErrors.lastName}
                    </Text>
                  )}
                </Col>
                <Col xs={24} sm={8}>
                  <Input
                    placeholder="Enter Phone Number *"
                    value={patientData.phoneNumber}
                    onChange={(e) =>
                      handleInputChange("phoneNumber", e.target.value)
                    }
                    maxLength={10}
                    disabled={isCreatingPatient || userFound}
                  />
                  {fieldErrors.phoneNumber && (
                    <Text type="danger" style={{ fontSize: 12, marginTop: 4 }}>
                      {fieldErrors.phoneNumber}
                    </Text>
                  )}
                </Col>
                <Col xs={24} sm={8}>
                  <Input
                    placeholder="Age *"
                    value={patientData.age}
                    onChange={(e) => handleInputChange("age", e.target.value)}
                    type="number"
                    min={1}
                    max={120}
                    disabled={isCreatingPatient || userFound}
                  />
                  {fieldErrors.age && (
                    <Text type="danger" style={{ fontSize: 12, marginTop: 4 }}>
                      {fieldErrors.age}
                    </Text>
                  )}
                </Col>
                <Col xs={24} sm={8}>
                  <Select
                    value={patientData.gender}
                    onChange={(value) => handleInputChange("gender", value)}
                    placeholder="Gender *"
                    disabled={isCreatingPatient || userFound}
                    style={{ width: "100%" }}
                  >
                    <Option value="">Gender</Option>
                    <Option value="Male">Male</Option>
                    <Option value="Female">Female</Option>
                    <Option value="Other">Other</Option>
                  </Select>
                  {fieldErrors.gender && (
                    <Text type="danger" style={{ fontSize: 12, marginTop: 4 }}>
                      {fieldErrors.gender}
                    </Text>
                  )}
                </Col>
                <Col xs={24} sm={8}>
                  <DatePicker
                    value={
                      patientData.dateOfBirth
                        ? moment(patientData.dateOfBirth, "DD-MM-YYYY")
                        : null
                    }
                    onChange={(date) =>
                      handleInputChange(
                        "dateOfBirth",
                        date ? date.format("DD-MM-YYYY") : ""
                      )
                    }
                    disabled={isCreatingPatient || userFound}
                    style={{ width: "100%" }}
                    maxDate={moment()}
                  />
                  {fieldErrors.dateOfBirth && (
                    <Text type="danger" style={{ fontSize: 12, marginTop: 4 }}>
                      {fieldErrors.dateOfBirth}
                    </Text>
                  )}
                </Col>
              </Row>
              {!userFound && !patientCreated && (
                <Row justify="end" style={{ marginTop: 16 }}>
                  <Button
                    type="primary"
                    onClick={handleCreatePatient}
                    loading={isCreatingPatient}
                    disabled={isCreatingPatient}
                  >
                    {isCreatingPatient
                      ? "Creating Patient..."
                      : "Create Patient"}
                  </Button>
                </Row>
              )}
            </Card>

            <Card
              title={
                <>
                  <CalendarOutlined /> Appointment Details
                </>
              }
              style={{ marginBottom: 16 }}
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <Select
                    value={patientData.appointmentType}
                    onChange={(value) =>
                      handleInputChange("appointmentType", value)
                    }
                    placeholder="Appointment Type *"
                    disabled={!patientCreated && !userFound}
                    style={{ width: "100%" }}
                  >
                    <Option value="">Select Type</Option>
                    <Option value="consultation">Consultation</Option>
                    <Option value="follow-up">Follow-up</Option>
                    <Option value="emergency">Emergency</Option>
                    <Option value="home-visit">Home Visit</Option>
                  </Select>
                  {fieldErrors.appointmentType && (
                    <Text type="danger" style={{ fontSize: 12, marginTop: 4 }}>
                      {fieldErrors.appointmentType}
                    </Text>
                  )}
                </Col>
                <Col xs={24} sm={12}>
                  <Input
                    value={formatDate(patientData.selectedDate)}
                    readOnly
                    prefix={<CalendarOutlined />}
                    style={{ background: "#f0f0f0" }}
                  />
                </Col>
                <Col xs={24} sm={12}>
                  <Select
                    value={patientData.department}
                    onChange={(value) => handleInputChange("department", value)}
                    placeholder="Department *"
                    disabled={!patientCreated && !userFound}
                    style={{ width: "100%" }}
                  >
                    <Option value="">Select Department</Option>
                    <Option value="cardiology">Cardiology</Option>
                    <Option value="neurology">Neurology</Option>
                    <Option value="orthopedics">Orthopedics</Option>
                    <Option value="General Physician">General Physician</Option>
                  </Select>
                  {fieldErrors.department && (
                    <Text type="danger" style={{ fontSize: 12, marginTop: 4 }}>
                      {fieldErrors.department}
                    </Text>
                  )}
                </Col>
                <Col xs={24} sm={12}>
                  <Input
                    value={patientData.selectedTimeSlot}
                    readOnly
                    prefix={<ClockCircleOutlined />}
                    style={{ background: "#f0f0f0" }}
                  />
                  {fieldErrors.selectedTimeSlot && (
                    <Text type="danger" style={{ fontSize: 12, marginTop: 4 }}>
                      {fieldErrors.selectedTimeSlot}
                    </Text>
                  )}
                </Col>
              </Row>
              <Row style={{ marginTop: 16 }}>
                <Col span={24}>
                  <Text strong style={{ marginBottom: 8, display: "block" }}>
                    <PlusOutlined /> Visit Reason / Symptoms
                  </Text>
                  <Input.TextArea
                    value={patientData.visitReason}
                    onChange={(e) =>
                      handleInputChange("visitReason", e.target.value)
                    }
                    placeholder="Describe the reason for visit and symptoms..."
                    autoSize={{ minRows: 3, maxRows: 6 }}
                    disabled={!patientCreated && !userFound}
                  />
                  <Text
                    type="secondary"
                    style={{
                      fontSize: 12,
                      textAlign: "right",
                      display: "block",
                      marginTop: 4,
                    }}
                  >
                    {patientData.visitReason.length}/500 characters
                  </Text>
                </Col>
              </Row>
            </Card>

            <Card title="Select Date" style={{ marginBottom: 16 }}>
              <Row gutter={[8, 8]}>
                {dayNames.map((day) => (
                  <Col key={day} span={24 / 7}>
                    <Text
                      type="secondary"
                      style={{ textAlign: "center", display: "block" }}
                    >
                      {day}
                    </Text>
                  </Col>
                ))}
                {days.map((day, index) => (
                  <Col key={index} span={24 / 7}>
                    <Button
                      type={
                        day === patientData.selectedDate.getDate()
                          ? "primary"
                          : "default"
                      }
                      onClick={() => handleDateSelect(day)}
                      disabled={!day || (!patientCreated && !userFound)}
                      style={{ width: "100%" }}
                    >
                      {day}
                    </Button>
                  </Col>
                ))}
              </Row>
            </Card>

            <Card title="Time Slots">
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Title level={4} style={{ marginBottom: 8 }}>
                    Afternoon 7 slots
                  </Title>
                  <Row gutter={[8, 8]}>
                    {afternoonSlots.map((slot, index) => (
                      <Col key={index} xs={12} sm={8} md={6} lg={4}>
                        <Button
                          type={
                            patientData.selectedTimeSlot === slot
                              ? "primary"
                              : "default"
                          }
                          onClick={() => handleTimeSlotSelect(slot)}
                          disabled={!patientCreated && !userFound}
                          style={{ width: "100%" }}
                        >
                          {slot}
                        </Button>
                      </Col>
                    ))}
                  </Row>
                </Col>
                <Col span={24}>
                  <Title level={4} style={{ marginBottom: 8 }}>
                    Evening 5 slots
                  </Title>
                  <Row gutter={[8, 8]}>
                    {eveningSlots.map((slot, index) => (
                      <Col key={index} xs={12} sm={8} md={6} lg={4}>
                        <Button
                          type={
                            patientData.selectedTimeSlot === slot
                              ? "primary"
                              : "default"
                          }
                          onClick={() => handleTimeSlotSelect(slot)}
                          disabled={!patientCreated && !userFound}
                          style={{ width: "100%" }}
                        >
                          {slot}
                        </Button>
                      </Col>
                    ))}
                  </Row>
                </Col>
              </Row>
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card
              title={
                <>
                  <Text type="success">₹</Text> Payment Summary
                </>
              }
              style={{ marginBottom: 16 }}
            >
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Input
                    placeholder="Enter Consultation Fee (₹)*"
                    value={consultationFee ?? ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      setConsultationFee(value ? parseFloat(value) : undefined);
                      if (fieldErrors.consultationFee) {
                        setFieldErrors((prev) => {
                          const newErrors = { ...prev };
                          delete newErrors.consultationFee;
                          return newErrors;
                        });
                      }
                    }}
                    type="number"
                    min={0}
                    step={0.01}
                  />
                </Col>
                <Col span={24}>
                  <Select
                    value={discountType}
                    onChange={(value) => {
                      setDiscountType(value);
                      if (fieldErrors.discount) {
                        setFieldErrors((prev) => {
                          const newErrors = { ...prev };
                          delete newErrors.discount;
                          return newErrors;
                        });
                      }
                    }}
                    style={{ width: "100%" }}
                  >
                    <Option value="percentage">Percentage (%)</Option>
                    <Option value="flat">Flat Amount</Option>
                  </Select>
                </Col>
                <Col span={24}>
                  <Input
                    value={discount}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      if (!isNaN(value)) {
                        setDiscount(value);
                        if (fieldErrors.discount) {
                          setFieldErrors((prev) => {
                            const newErrors = { ...prev };
                            delete newErrors.discount;
                            return newErrors;
                          });
                        }
                      }
                    }}
                    type="number"
                    min={0}
                    max={discountType === "percentage" ? 100 : undefined}
                    step={0.01}
                  />
                  {fieldErrors.discount && (
                    <Text type="danger" style={{ fontSize: 12, marginTop: 4 }}>
                      {fieldErrors.discount}
                    </Text>
                  )}
                </Col>
                <Col span={24}>
                  <Row gutter={[8, 8]}>
                    <Col span={12}>
                      <Text strong>Subtotal</Text>
                    </Col>
                    <Col span={12} style={{ textAlign: "right" }}>
                      <Text>₹{consultationFee?.toFixed(2) || "0.00"}</Text>
                    </Col>
                    <Col span={12}>
                      <Text strong>Discount</Text>
                    </Col>
                    <Col span={12} style={{ textAlign: "right" }}>
                      <Text type="danger">
                        {discountType === "percentage"
                          ? `${discount}%`
                          : `₹${discount.toFixed(2)}`}
                      </Text>
                    </Col>
                    <Col span={12}>
                      <Title level={5}>Total Amount</Title>
                    </Col>
                    <Col span={12} style={{ textAlign: "right" }}>
                      <Title level={5} style={{ color: "#52c41a" }}>
                        ₹{totalAmount.toFixed(2)}
                      </Title>
                    </Col>
                  </Row>
                </Col>
                <Col span={24}>
                  <Row gutter={16}>
                    <Col>
                      <Button
                        type={paymentStatus === "paid" ? "primary" : "default"}
                        onClick={() => setPaymentStatus("paid")}
                      >
                        Paid
                      </Button>
                    </Col>
                    <Col>
                      <Button
                        type={
                          paymentStatus === "pending" ? "primary" : "default"
                        }
                        onClick={() => setPaymentStatus("pending")}
                      >
                        Pending
                      </Button>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Card>
            <Button
              type="primary"
              onClick={handleContinueToPayment}
              loading={isCreatingAppointment}
              disabled={isCreatingAppointment || !patientCreated}
              style={{ width: "100%" }}
            >
              {isCreatingAppointment ? "Processing..." : "Continue to Payment"}
            </Button>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default AddWalkInPatient;

function validateAppointmentData() {
  return true;
}

function getDaysInMonth(currentMonth) {
  const firstDay = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  );
  const lastDay = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  );
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  const days = [];

  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }

  return days;
}
