"use client";
import React, { useState, useCallback, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  Input,
  Select,
  Button,
  Row,
  Col,
  Typography,
  message,
  Card,
  Grid,
  DatePicker,
  Modal
} from "antd";
import {
  SearchOutlined,
  UserOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import moment from "moment";
import { apiGet, apiPost } from "../../api";

import { toast } from "react-toastify";


import { useNavigate } from "react-router-dom";


const { useBreakpoint } = Grid;
const { Title, Text } = Typography;
const { Option } = Select;


const AddWalkInPatient = () => {
  const screens = useBreakpoint();
  const navigate = useNavigate()
  const user = useSelector((state) => state.currentUserData);
  console.log("user=====",user)
  const [patientData, setPatientData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    dateOfBirth: "",
    gender: "",
    appointmentType: "",
     clinic: "", 
    department: "",
    visitReason: "",
    selectedTimeSlot: "",
    age: "",
  });

    const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  
  const formattedDate = `${year}-${month}-${day}`;
  

  const [date, setDate] = useState(formattedDate);
  const [paymentStatus, setPaymentStatus] = useState("paid");
  const [consultationFee, setConsultationFee] = useState(undefined);
  const [discount, setDiscount] = useState(10);
  const [discountType, setDiscountType] = useState("percentage");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isCreatingPatient, setIsCreatingPatient] = useState(false);
  const [isCreatingAppointment, setIsCreatingAppointment] = useState(false);
  const [apiError, setApiError] = useState("");
  const [patientCreated, setPatientCreated] = useState(false);
  const [userFound, setUserFound] = useState(false);
  const [createdPatientId, setCreatedPatientId] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUserIndex, setSelectedUserIndex] = useState(null);
   const [clinics, setClinics] = useState([]);
   const [timeSlots, setTimeSlots] = useState([]);
  const [isFetchingSlots, setIsFetchingSlots] = useState(false);
  const [isClinicModalVisible, setIsClinicModalVisible] = useState(false);
  const [slotAvailability, setSlotAvailability] = useState(true);
const [doctorData, setDoctorData] = useState(null);

  const getAuthToken = () => localStorage.getItem("accessToken") || "";
  const currentUserID = localStorage.getItem("userID");
 const doctorId = user?.role !== 'doctor' ? user?.createdBy || '' : currentUserID;

 // Map appointment types to consultation modes
  const appointmentTypeToMode = {
    "new-walkin": "In-Person",
    "followup-walkin": "In-Person",
    "new-homecare": "Home Visit",
    "followup-homecare": "Home Visit",
    "followup-video": "Video",
  };

  // Update consultation fee based on appointment type
  useEffect(() => {
    const sourceData = user?.role === "doctor" ? user : doctorData;
    if (patientData.appointmentType && sourceData?.consultationModeFee) {
      const consultationMode = appointmentTypeToMode[patientData.appointmentType];
      const feeEntry = sourceData.consultationModeFee.find(
        (mode) => mode.type === consultationMode
      );
      if (feeEntry) {
        setConsultationFee(feeEntry.fee);
      } else {
        setConsultationFee(undefined); // Allow manual entry if no fee found
      }
    } else {
      setConsultationFee(undefined); // Allow manual entry if no appointment type
    }
  }, [patientData.appointmentType, user?.consultationModeFee]);

  // Update department once user is available
useEffect(() => {
  if (user?.specialization?.name) {
    setPatientData((prev) => ({
      ...prev,
      department: user.specialization.name,
    }));
  }
}, [user]);

  const validatePhoneNumber = useCallback(
    (phone) => /^[6-9][0-9]{9}$/.test(phone),
    []
  );
  const validateName = useCallback(
    (name) => /^[a-zA-Z\s\-'.]+$/.test(name),
    []
  );
  const validateDOB = useCallback((dob) => {
    if (!dob) return false;
    const dobDate = moment(dob, "DD-MM-YYYY").toDate();
    const today = new Date();
    return dobDate <= today;
  }, []);

  const calculateAge = useCallback(
    (dob) => {
      if (!dob || !validateDOB(dob)) return "";
      const dobDate = moment(dob, "DD-MM-YYYY").toDate();
      const today = new Date();
      const age = today.getFullYear() - dobDate.getFullYear();
      const monthDiff = today.getMonth() - dobDate.getMonth();
      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < dobDate.getDate())
      ) {
        return String(age - 1);
      }
      return String(age);
    },
    [validateDOB]
  );

  const formatTimeForAPI = useCallback((timeSlot) => {
    if (!timeSlot) return "";
    const [time, period] = timeSlot.split(" ");
    let [hours, minutes] = time.split(":");
    hours = parseInt(hours, 10);

    if (period === "PM" && hours !== 12) {
      hours += 12;
    } else if (period === "AM" && hours === 12) {
      hours = 0;
    }

    return `${hours.toString().padStart(2, "0")}:${minutes}`;
  }, []);

  const validateAppointmentData = useCallback(() => {
    const errors = {};
    let isValid = true;

    if (!patientCreated) {
      errors.patient = "Please create or find a patient first";
      isValid = false;
    }
    if (!patientData.firstName.trim() || !validateName(patientData.firstName)) {
      errors.firstName = "Valid first name is required";
      isValid = false;
    }
    // if (!patientData.lastName.trim() || !validateName(patientData.lastName)) {
    //   errors.lastName = "Valid last name is required";
    //   isValid = false;
    // }
    if (
      !patientData.phoneNumber ||
      !validatePhoneNumber(patientData.phoneNumber)
    ) {
      errors.phoneNumber = "Valid 10-digit mobile number is required";
      isValid = false;
    }
    // if (!patientData.dateOfBirth || !validateDOB(patientData.dateOfBirth)) {
    //   errors.dateOfBirth = "Valid date of birth is required";
    //   isValid = false;
    // }
    if (!patientData.gender) {
      errors.gender = "Gender is required";
      isValid = false;
    }
    if (!patientData.appointmentType) {
      errors.appointmentType = "Appointment type is required";
      isValid = false;
    }
    if (!patientData.department) {
      errors.department = "Department is required";
      isValid = false;
    }
     if (!patientData.clinic) {
      errors.clinic = "Clinic is required";
      isValid = false;
    }
    if (!date) {
      errors.date = "Appointment date is required";
      isValid = false;
    }
    if (!patientData.selectedTimeSlot) {
      errors.time = "Time slot is required";
      isValid = false;
    }
    if (consultationFee === undefined || consultationFee < 0) {
      errors.consultationFee = "Valid consultation fee is required";
      isValid = false;
    }
    if (discount < 0 || (discountType === "percentage" && discount > 100)) {
      errors.discount = "Invalid discount value";
      isValid = false;
    }

    setFieldErrors(errors);
    return isValid;
  }, [
    patientData,
    patientCreated,
    consultationFee,
    discount,
    discountType,
    date,
    validateDOB,
    validateName,
    validatePhoneNumber,
  ]);

  const searchUser = useCallback(async (mobile) => {

    console.log("Searching user with mobile:", mobile);
    try {
      const response = await apiGet(`/doctor/searchUser?mobile=${mobile}`);
      const data = response.data;
      console.log("userres", data);
      if (data.status !== "success")
        throw new Error(data.message || "Search failed");

      return {
        success: true,
        message: data.message || "User found",
        data: Array.isArray(data.data) ? data.data : [data.data],
      };
    } catch (error) {
      console.log(error, 'error======');
      return {
        success: false,
        message: error.message || "Failed to search user",
      };
    }
  }, []);

  const createPatient = useCallback(async () => {
    try {
      const body = JSON.stringify({
        firstname: patientData.firstName,
        lastname: patientData.lastName,
        gender: patientData.gender,
        mobile: patientData.phoneNumber,
        DOB: patientData.dateOfBirth
          ? moment(patientData.dateOfBirth, "DD-MM-YYYY").format("DD-MM-YYYY")
          : "",

          age: patientData?.age || calculateAge(patientData.dateOfBirth) || "0"

      });
      console.log("Creating patient with body:", body);

      const response = await apiPost("/doctor/createPatient", body);
      console.log("response", response);
      if (response.status !== 200)
        throw new Error(data.message || "Failed to create patient");

      if (response.status === 200) {
        const data = response.data;
//  toast.success(data.message || "Patient created successfully");
        return {
          success: true,
          data: data.data,
          message: data.message || "Patient created",
        };
       
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || "Failed to create patient",
      };
    }
  }, [patientData]);

  const createAppointment = useCallback(async (appointmentRequest) => {
    try {
      
      const body = JSON.stringify(appointmentRequest);



      console.log("Creating appointment with body:", body);
      const response = await apiPost("/appointment/createAppointment", body);

      const data = response.data;
      console.log("appointmentResponse", data);

      if (data?.status !== "success") {
        toast.error(data.message || "Failed to create appointment");
        // throw new Error(data.message || "Failed to create appointment");
      } else {
        // toast.success(data.message || "Appointment created successfully");
         return {
        success: true,
        data: data.data,
        message: data.message || "Appointment created",
      };

      }

     
    } catch (error) {
      
      const errorMessage = error?.response?.data
      toast.error(errorMessage?.message?.message || "Failed to create appointment");
      return {
        success: false,
        message: error.message || "Failed to create appointment",
      };
    }
  }, []);

  const handleSearch = useCallback(async () => {
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
      const { success, data, message: msg } = await searchUser(searchQuery);
      if (success && data.length > 0) {
        setSearchResults(data);
        if (data.length === 1) {
          const userData = data[0];
          const dob =
            userData.DOB &&
            moment(userData.DOB, ["DD-MM-YYYY", "YYYY-MM-DD"]).isValid()
              ? moment(userData.DOB, ["DD-MM-YYYY", "YYYY-MM-DD"]).format(
                  "DD-MM-YYYY"
                )
              : "";
          setPatientData({
            ...patientData,
            phoneNumber: userData.mobile || searchQuery,
            firstName: userData.firstname || "",
            lastName: userData.lastname || "",
            gender: userData.gender || "",
            dateOfBirth: dob,
          });
          setUserFound(true);
          setPatientCreated(true);
          setCreatedPatientId(userData.userId || "");
        } else {
            setApiError(<span style={{ color: "blue" }}>Multiple patients found. Please select one.</span>);
        }
      } else {
        setPatientData({
          ...patientData,
          phoneNumber: searchQuery,
          firstName: "",
          lastName: "",
          gender: "",
          dateOfBirth: "",
        });
        setApiError(
          "User not found. Please enter patient details to create a new patient."
        );
      }
    } catch (error) {
      setApiError("An error occurred while searching. Please try again.");
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery, patientData, validatePhoneNumber]);

  const handleUserSelect = useCallback(
    (index) => {
      const userData = searchResults[index];
      const dob =
        userData.DOB &&
        moment(userData.DOB, ["DD-MM-YYYY", "YYYY-MM-DD"]).isValid()
          ? moment(userData.DOB, ["DD-MM-YYYY", "YYYY-MM-DD"]).format(
              "DD-MM-YYYY"
            )
          : "";
      setSelectedUserIndex(index);
      setPatientData({
        ...patientData,
        phoneNumber: userData.mobile || searchQuery,
        firstName: userData.firstname || "",
        lastName: userData.lastname || "",
        gender: userData.gender || "",
        dateOfBirth: dob,
      });
      setUserFound(true);
      setPatientCreated(true);
      setCreatedPatientId(userData.userId || "");
      setApiError("");
    },
    [searchResults, patientData, searchQuery]
  );

  const handleInputChange = useCallback((field, value) => {
    console.log("Input Change:", field, value);
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    let validatedValue = value;
 if (field === "firstName" || field === "lastName") {
    const onlyAlphabets = value.replace(/[^A-Za-z ]/g, "");
    setPatientData((prev) => ({ ...prev, [field]: onlyAlphabets }));
    return
  }
    if (field === "phoneNumber") {
  let digitsOnly = value.replace(/\D/g, "");
  if (digitsOnly.length === 1 && !/^[6-9]/.test(digitsOnly)) {
    return;
  }
  if (digitsOnly.length > 10) {
    digitsOnly = digitsOnly.slice(0, 10);
  }
  validatedValue = digitsOnly;
}
if (field === "age") {
  validatedValue = value.replace(/\D/g, "");
  if (validatedValue.length > 3) {
    validatedValue = validatedValue.slice(0, 3);
  }
}
    if (field === "visitReason" && value.length > 500)
      validatedValue = value.substring(0, 500);

    setPatientData((prev) => ({ ...prev, [field]: validatedValue }));
  }, []);

  const handleCreatePatient = useCallback(async () => {
    setIsCreatingPatient(true);
    setApiError("");
    const requiredFields = [
      "firstName",
      // "lastName",
      "phoneNumber",
      // "dateOfBirth",
      "gender",
    ];
    const errors = {};

    requiredFields.forEach((field) => {
      if (!patientData[field]) errors[field] = "This field is required";
    });
    if (!validatePhoneNumber(patientData.phoneNumber))
      errors.phoneNumber = "Invalid phone number";
    // if (!validateDOB(patientData.dateOfBirth))
    //   errors.dateOfBirth = "Invalid date of birth";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setIsCreatingPatient(false);
      return;
    }

    try {
      const { success, data, message: msg } = await createPatient();
      console.log("newp", data);
      if (success) {
        setPatientCreated(true);
        setCreatedPatientId(data.userId || "");
        message.success(msg);
        toast.success(msg);
      } else {
        setApiError(msg);
        toast.error(msg);
      }
    } catch (error) {
      setApiError(error.message || "Failed to create patient");
      toast.error(error.message || "Failed to create patient");
    } finally {
      setIsCreatingPatient(false);
    }
  }, [patientData, validatePhoneNumber, validateDOB, createPatient]);

  const handleContinueToPayment = useCallback(async () => {
    if (!validateAppointmentData()) return;
    setIsCreatingAppointment(true);
    setApiError("");

    try {
      if (!patientCreated && !userFound) {
        setIsCreatingPatient(true);
        const patientResult = await createPatient();
        if (!patientResult.success) throw new Error(patientResult.message);
        setCreatedPatientId(patientResult.data.userId || "");
        setPatientCreated(true);
        setIsCreatingPatient(false);
      }

      console.log(patientData.role)

      const appointmentRequest = {
        userId: createdPatientId,
        doctorId: patientData.role === "doctor" ? currentUserID : user?.createdBy || "",
        patientName: `${patientData.firstName} ${patientData.lastName}`,
        doctorName: `${user.firstname} ${user.lastname}`,
        appointmentType: patientData.appointmentType,
        appointmentDepartment: patientData.department,
          addressId: patientData.clinic,
        appointmentDate: moment(date).format("YYYY-MM-DD"),
        appointmentTime: formatTimeForAPI(patientData.selectedTimeSlot),
        appointmentStatus: "scheduled",
        appointmentReason: patientData.visitReason || "Not specified",
        amount: consultationFee?.toFixed(2),
        discount,
        discountType,
        paymentStatus,
      };

      const { success, message: msg } = await createAppointment(
        appointmentRequest
      );
      console.log(success, message, "message success")
      if (success) {
      console.log(success, message, "message====== success")
       toast.success(`Appointment created successfully!`);
        message.success(`Appointment created successfully! ${msg}`);

       

    navigate("/Doctor/dashboard");

        resetForm();
      } else {
        setApiError(msg);
      }
    } catch (error) {
      setApiError(error.message || "An unexpected error occurred");
      toast.error(error.message || "An unexpected error occurred");
    } finally {
      setIsCreatingAppointment(false);
      setIsCreatingPatient(false);
    }
  }, [
    patientData,
    patientCreated,
    userFound,
    createdPatientId,
    date,
    consultationFee,
    discount,
    discountType,
    paymentStatus,
    currentUserID,
    user,
    createPatient,
    createAppointment,
    validateAppointmentData,
    formatTimeForAPI,
  ]);

  const resetForm = useCallback(() => {
    setPatientData({
      firstName: "",
      lastName: "",
      phoneNumber: "",
      dateOfBirth: "",
      gender: "",
      appointmentType: "",
      department: "",
        clinic: "",
      visitReason: "",
      selectedTimeSlot: "",
    });
    setDate(new Date().toISOString().split("T")[0]);
    setPaymentStatus("paid");
    setConsultationFee(undefined);
    setDiscount(10);
    setDiscountType("percentage");
    setSearchQuery("");
    setUserFound(false);
    setPatientCreated(false);
    setCreatedPatientId("");
    setFieldErrors({});
    setSearchResults([]);
    setSelectedUserIndex(null);
    setApiError("");
     setTimeSlots([]);
  }, []);

   const getCurrentUserData = async () => {
  try {
    const response = await apiGet("/users/getUser");
    console.log("Current User Data:", response.data);
    const userData = response.data?.data;
    let addresses = []

if (userData.role !== "doctor") {
  const doctorId = userData.createdBy || ""
 const response = await apiGet(`/users/getClinicAddress?doctorId=${doctorId}`, {});
 console.log("Clinic Addresses:", response?.data);
 if (response?.data.status ==="success") {
addresses = response?.data?.data || [];

const doctorDetails = await apiGet(`/users/getUser?userId=${doctorId}`);
 console.log("Doctor Details:", doctorDetails?.data?.data);
 const doctorData = doctorDetails?.data?.data;
 if (doctorDetails?.data?.status === "success") {
  setDoctorData(doctorData);
  setPatientData((prev) => ({
    ...prev,
    department: doctorData?.specialization?.name,
  }));
  }
 }else{
  toast.error("No clinics found for the doctor.");
 }
    }else if (userData.role === "doctor") {
      addresses = userData?.addresses || [];
    }else{
       
        setClinics([]);
        setIsClinicModalVisible(true);
      
    }

      // Filter only active clinics (case-insensitive comparison)
      const activeClinics = addresses
        .filter(address => 
          address.type === "Clinic" && 
          address.status?.toLowerCase() === "active"
        )
        .map((address) => ({
          label: address.clinicName,
          value: address.addressId,
          // Include additional clinic data if needed
          startTime: address.startTime,
          endTime: address.endTime,
          location: address.location
        }));
      setClinics(activeClinics);
      if (activeClinics.length === 0) {
        setIsClinicModalVisible(true);
      }
   
  } catch (error) {
    console.error("Error fetching user data:", error);
  }
};


    useEffect(() => {
      if (user && user.createdBy) {
        getCurrentUserData();
      }
    }, [user && user.createdBy]);


    const fetchTimeSlots = async (selectedDate, clinicId) => {

console.log("first")
      if (!selectedDate || !clinicId || !doctorId) return;
    setIsFetchingSlots(true);
console.log("first2")
    
    try {
      const response = await apiGet(
        `/appointment/getSlotsByDoctorIdAndDate?doctorId=${doctorId}&date=${selectedDate}&addressId=${clinicId}`
      );
      console.log("response122334",response)
      const data = response.data;

      if (data.status === "success" && data.data?.slots && data.data.addressId === clinicId) {
        const availableSlots = data.data.slots     
        .filter((slot) => slot.status === "available")
  .map((slot) => formatTimeForAPI(slot.time)) 
  .filter((formattedTime) => {
    const slotMoment = moment(`${selectedDate} ${formattedTime}`, 'YYYY-MM-DD HH:mm');
    return slotMoment.isAfter(moment());
  });
        setTimeSlots(availableSlots);
        if (!availableSlots.includes(patientData.selectedTimeSlot)) {
          setPatientData((prev) => ({ ...prev, selectedTimeSlot: "" }));
        }
        if (availableSlots.length === 0) {
          setIsClinicModalVisible(true);
          setSlotAvailability(false)
          setApiError("No available time slots found for the selected date and clinic.");
        }
         else {
    setApiError(""); // Clear error if slots found
  }
      } else {
        setTimeSlots([]);
        setPatientData((prev) => ({ ...prev, selectedTimeSlot: "" }));
         setIsClinicModalVisible(true);
          setSlotAvailability(false)
        setApiError("No available time slots found for the selected date and clinic.");
      }
    } catch (error) {
      console.error("Error fetching time slots:", error);
      setTimeSlots([]);
      setPatientData((prev) => ({ ...prev, selectedTimeSlot: "" }));
       setIsClinicModalVisible(true);
        setSlotAvailability(false)
      setApiError("No available time slots found for the selected date and clinic.");
    } finally {
      setIsFetchingSlots(false);
    }
  };

     useEffect(() => {
    if (date && patientData.clinic && doctorId) {
      console.log("patient", date , patientData.clinic , doctorId)
      fetchTimeSlots(date, patientData.clinic);
    } else {
      setTimeSlots([]);
      setPatientData((prev) => ({ ...prev, selectedTimeSlot: "" }));
    }
  }, [date, patientData.clinic, doctorId]);

  const renderSearchCard = () => (
    <Card style={{ marginBottom: 16 }}>
      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Text strong>Phone Number *</Text>
          <Input
            prefix={<SearchOutlined />}
            placeholder="Enter 10-digit mobile number"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value.replace(/\D/g, ""))}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            disabled={isSearching}
            maxLength={10}
            style={{ marginTop: 8 }}
          />
          {fieldErrors.phoneNumber && (
            <Text type="danger">{fieldErrors.phoneNumber}</Text>
          )}
        </Col>
        {searchResults.length > 1 && (
          <Col xs={24} sm={8}>
            <Text strong>Select Patient *</Text>
            <Select
              value={selectedUserIndex}
              onChange={handleUserSelect}
              placeholder="Select a patient"
              style={{ width: "100%", marginTop: 8 }}
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
            disabled={isSearching || searchQuery.length !== 10 || searchResults.length > 0}
            style={{ width: "100%", marginTop: 32 }}
          >
            Search
          </Button>
        </Col>
      </Row>
    </Card>
  );

  const renderBasicInfoCard = () => (
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
        <Text strong>First Name *</Text>
        <Input
          placeholder="Enter first name"
          value={patientData.firstName}
          onChange={(e) => handleInputChange("firstName", e.target.value)}
          disabled={isCreatingPatient || userFound}
          style={{ marginTop: 8 }}
        />
        {fieldErrors.firstName && (
          <Text type="danger">{fieldErrors.firstName}</Text>
        )}
      </Col>
      <Col xs={24} sm={8}>
        <Text strong>Last Name </Text>
        <Input
          placeholder="Enter last name"
          value={patientData.lastName}
          onChange={(e) => handleInputChange("lastName", e.target.value)}
          disabled={isCreatingPatient || userFound}
          style={{ marginTop: 8 }}
        />
        {fieldErrors.lastName && (
          <Text type="danger">{fieldErrors.lastName}</Text>
        )}
      </Col>
      <Col xs={24} sm={8}>
        <Text strong>Phone Number *</Text>
        <Input
          placeholder="Enter 10-digit mobile number"
          value={patientData.phoneNumber}
          onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
          maxLength={10}
          disabled={isCreatingPatient || userFound}
          style={{ marginTop: 8 }}
        />
        {fieldErrors.phoneNumber && (
          <Text type="danger">{fieldErrors.phoneNumber}</Text>
        )}
      </Col>
      <Col xs={24} sm={8}>
        <Text strong>Date of Birth </Text>
        <input  
          type="date"
          style={{
            alignSelf: "flex-end",
            borderRadius: "12px",
            background: "#F6F6F6",
            padding: "0.4rem",
            color: "#1977f3",
            width: "130px",
            border: "1px solid #d9d9d9",
            marginTop: 8,
          }}
          max={new Date().toISOString().split("T")[0]} // Prevent future dates
          value={
            patientData.dateOfBirth
              ? moment(patientData.dateOfBirth, "DD-MM-YYYY").format("YYYY-MM-DD")
              : ""
          }
          onChange={(e) =>
            handleInputChange(
              "dateOfBirth",
              e.target.value ? moment(e.target.value, "YYYY-MM-DD").format("DD-MM-YYYY") : ""
            )
          }
          disabled={isCreatingPatient || userFound}
        />
        {fieldErrors.dateOfBirth && (
          <Text type="danger">{fieldErrors.dateOfBirth}</Text>
        )}
      </Col>
      <Col xs={24} sm={8}>
        <Text strong>Age (Calculated)</Text>
        <Input
          placeholder="Age calculated from DOB"
          value={
            patientData.dateOfBirth
              ? calculateAge(patientData.dateOfBirth) || patientData.age
              : patientData.age
          }
          onChange={(e) => handleInputChange("age", e.target.value)}
          style={{ marginTop: 8 }}
          disabled={!!patientData.dateOfBirth} // Disable only if DOB is selected
        />
      </Col>
      <Col xs={24} sm={8}>
        <Text strong>Gender *</Text>
        <Select
          value={patientData.gender}
          onChange={(value) => handleInputChange("gender", value)}
          placeholder="Select gender"
          disabled={isCreatingPatient || userFound}
          style={{ width: "100%", marginTop: 8 }}
        >
          <Option value="Male">Male</Option>
          <Option value="Female">Female</Option>
          <Option value="Other">Other</Option>
        </Select>
        {fieldErrors.gender && (
          <Text type="danger">{fieldErrors.gender}</Text>
        )}
      </Col>
    </Row>
    {!userFound && !patientCreated && (
      <Row justify="end" style={{ marginTop: 16 }}>
        <Button
          type="primary"
          onClick={handleCreatePatient}
          loading={isCreatingPatient}
          disabled={isCreatingPatient || clinics.length === 0}
        >
          Create Patient
        </Button>
      </Row>
    )}
  </Card>
);

  const renderAppointmentDetailsCard = () => (
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
          <Text strong>Appointment Type *</Text>
          <Select
            value={patientData.appointmentType}
            onChange={(value) => handleInputChange("appointmentType", value)}
            placeholder="Select appointment type"
            disabled={!patientCreated && !userFound}
            style={{ width: "100%", marginTop: 8 }}
          >
            <Option value="new-walkin">New Walkin</Option>
            <Option value="new-homecare">New HomeCare</Option>
            <Option value="followup-walkin">Followup Walkin</Option>
            <Option value="followup-video">Followup Video</Option>
            <Option value="followup-homecare">Followup Homecare</Option>
          </Select>
          {fieldErrors.appointmentType && (
            <Text type="danger">{fieldErrors.appointmentType}</Text>
          )}
        </Col>
        <Col xs={24} sm={12}>
          <Text strong>Appointment Date *</Text>
          <input
            type="date"
            style={{
              alignSelf: "flex-end",
              borderRadius: "12px",
              background: "#F6F6F6",
              padding: "0.4rem",
              color: "#1977f3",
              width: "130px",
              border: "1px solid #d9d9d9",
              marginTop: 8,
            }}
            min={new Date().toISOString().split("T")[0]}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            // disabled={!patientCreated && !userFound}
          />
          {fieldErrors.date && <Text type="danger">{fieldErrors.date}</Text>}
        </Col>
        <Col xs={24} sm={12}>
          <Text strong>Department *</Text>
          <Select
            // value={user.specialization?.name}
            value={patientData.department}
            // onChange={(value) => handleInputChange("department", value)}
            placeholder="Select department"
            disabled={true}
            style={{ width: "100%", marginTop: 8 }}
          >
            <Option value="cardiology">Cardiology</Option>
            <Option value="neurology">Neurology</Option>
            <Option value="orthopedics">Orthopedics</Option>
            <Option value="General Physician">General Physician</Option>
          </Select>
          {fieldErrors.department && (
            <Text type="danger">{fieldErrors.department}</Text>
          )}
        </Col>
          <Col xs={24} sm={12}>
          <Text strong>Clinic *</Text>
          <Select
            value={patientData.clinic}
            onChange={(value) => handleInputChange("clinic", value)}
            placeholder="Select clinic"
            // disabled={!patientCreated && !userFound}
            style={{ width: "100%", marginTop: 8 }}
          >
            {clinics.map((clinic) => (
              <Option key={clinic.value} value={clinic.value}>
                {clinic.label}
              </Option>
            ))}
          </Select>
          {fieldErrors.clinic && (
            <Text type="danger">{fieldErrors.clinic}</Text>
          )}
        </Col>
        <Col xs={24} sm={12}>
          <Text strong>Time Slot *</Text>
          <Select
            value={patientData.selectedTimeSlot}
            onChange={(value) => handleInputChange("selectedTimeSlot", value)}
            placeholder="Select time slot"
            // disabled={!patientCreated && !userFound}
            style={{ width: "100%", marginTop: 8 }}
          >
            {timeSlots.map((slot) => (
              <Option key={slot} value={slot}>
                {slot}
              </Option>
            ))}
          </Select>
          {fieldErrors.time && <Text type="danger">{fieldErrors.time}</Text>}
        </Col>
        <Col span={24}>
          <Text strong>Visit Reason</Text>
          <Input.TextArea
            value={patientData.visitReason}
            onChange={(e) => handleInputChange("visitReason", e.target.value)}
            placeholder="Describe the reason for visit and symptoms"
            autoSize={{ minRows: 3, maxRows: 6 }}
            disabled={!patientCreated && !userFound}
            style={{ marginTop: 8 }}
          />
          <Text
            type="secondary"
            style={{ fontSize: 12, textAlign: "right", display: "block" }}
          >
            {patientData.visitReason.length}/500 characters
          </Text>
        </Col>
      </Row>
    </Card>
  );

  const renderPaymentSummaryCard = () => (
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
          <Text strong>Consultation Fee (₹) *</Text>
        {/* {consultationFee !== undefined ? (
    <Input
      value={consultationFee}
      disabled={true}
      style={{ marginTop: 8 }}
    />
  ) : ( */}
  <Input
            placeholder="Enter consultation fee"
            value={consultationFee ?? ""}
            // onChange={(e) =>
            //   setConsultationFee(
            //     e.target.value ? parseFloat(e.target.value) : undefined
            //   )
            // }
             onChange={(e) => {
    const value = e.target.value;
    // Only update if the value is empty, or a number between 0 and 9999
    if (value === "" || (Number(value) >= 0 && Number(value) <= 9999)) {
      setConsultationFee(value ? parseFloat(value) : undefined);
    }
  }}
            // type="number"
            min={0}
  max={9999}
          
              step={1}
            style={{ marginTop: 8 }}
          />
  {/* )

          } */}
        
          {fieldErrors.consultationFee && (
            <Text type="danger">{fieldErrors.consultationFee}</Text>
          )}
        </Col>
        {/* <Col span={24}>
          <Text strong>Discount Type</Text>
          <Select
            value={discountType}
            onChange={setDiscountType}
            style={{ width: "100%", marginTop: 8 }}
          >
            <Option value="percentage">Percentage (%)</Option>
            <Option value="flat">Flat Amount</Option>
          </Select>
        </Col> */}
        <Col span={24}>
          <Text strong>Discount(%)</Text>
          <Input
            placeholder="Enter discount value"
            value={discount}
            // onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
            onChange={(e) => {
      const value = e.target.value;
      // Only update if value is empty, 0, or a number between 0 and 100
      if (
        value === "" ||
        (Number(value) >= 0 && Number(value) <= 100)
      ) {
        setDiscount(value ? parseFloat(value) : 0);
      }
    }}
            // type="number"
            min={0}
            max={discountType === "percentage" ? 100 : undefined}
            step={1}
            style={{ marginTop: 8 }}
          />
          {fieldErrors.discount && (
            <Text type="danger">{fieldErrors.discount}</Text>
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
                ₹
                {(consultationFee && discountType === "percentage"
                  ? consultationFee - (consultationFee * discount) / 100
                  : consultationFee - discount
                )?.toFixed(2) || "0.00"}
              </Title>
            </Col>
          </Row>
        </Col>
      </Row>
    </Card>
  );

  console.log("patientData===",patientData)
  return (
    <div
      style={{
        minHeight: "calc(100vh - 64px)",
        background: "#f0f2f5",
        padding: screens.xs ? 16 : 24,
      }}
    >
      <div style={{ marginLeft: 64, padding: "0 24px" }}>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Title level={2}>Add Walk-in Patient</Title>
            <Text type="secondary">
              Search for existing patient or enter new patient details for
              walk-in consultation
            </Text>
          </Col>
          {apiError && (
            <Col span={24}>
              <Text type="danger">{apiError}</Text>
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
                  Patient found! Details pre-filled. Proceed to create
                  appointment.
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
                  Patient created successfully! Proceed to create appointment.
                </Text>
              </div>
            </Col>
          )}
          <Col xs={24} lg={16}>
            {renderSearchCard()}
            {renderBasicInfoCard()}
            {renderAppointmentDetailsCard()}
            
          </Col>
          <Col xs={24} lg={8}>
            {renderPaymentSummaryCard()}
            <Button
              type="primary"
              onClick={handleContinueToPayment}
              loading={isCreatingAppointment}
              disabled={isCreatingAppointment || !patientCreated || isClinicModalVisible}
              style={{ width: "100%" }}
            >
              Continue to Payment
            </Button>
          </Col>
        </Row>
      </div>
      <Modal
  open={isClinicModalVisible}
  title="No Clinic or Slots Found"
  closable={false}
  maskClosable={false}
  maskStyle={{ backdropFilter: "blur(4px)" }}
  okText={slotAvailability ? "Go To Clinic Management": "Go To Availability"} 
  cancelText="Cancel"
  onOk={() => {
    setIsClinicModalVisible(false);
    {slotAvailability ? navigate("/doctor/doctorPages/ClinicManagement") : navigate("/doctor/doctorPages/Availability")} ;
  }}
  onCancel={() => {
    setIsClinicModalVisible(false);
  }}
>

  {!slotAvailability ? (
    <p>No available slots for this clinic please add slots.</p>
  ) : (
    <p>No active clinic and availability found. Please add a clinic and add Availability to continue creating appointments.</p>
  )}
</Modal>

    </div>
  );
};

export default AddWalkInPatient;
