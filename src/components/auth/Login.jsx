"use client";

import { useState, useEffect, use } from "react";
import { useNavigate } from "react-router-dom";
import { message ,Spin } from "antd";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Illustration from "./Illustration";
import LoginForm from "./LoginForm";
import "../../components/stylings/Login.css";
import { apiGet, apiPostWithoutToken } from "../api";
import { useDispatch, useSelector } from "react-redux";

const Login = () => {
  const user = useSelector((state) => state.currentUserData);
const [isCheckingAuth, setIsCheckingAuth] = useState(true);


  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [userId, setUserId] = useState("");
  const [currentUserType, setCurrentUserType] = useState("");
  
  const dispatch = useDispatch();
  useEffect(() => {
    message.config({
      top: 20,
      duration: 3,
      maxCount: 1,
    });

    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    let interval;
    if (otpTimer > 0) {
      interval = setInterval(() => setOtpTimer((timer) => timer - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  const validatePhone = (phoneNumber) => /^[0-9]{10}$/.test(phoneNumber);

  const getRouteFromUserType = (role) => {
    if (role === "superadmin") return "/SuperAdmin/dashboard";
    if (role === "doctor") return "/Doctor/dashboard";
    if (role === "reception") return "/Doctor/dashboard";
    if (role === "patient") return "/unauthorized";
    return "/Doctor/dashboard";
    return "/SuperAdmin/dashboard";
    return "/Admin/app/dashboard"; // Default route if role is unknown
  };

  const handleSendOTP = async () => {
    if (!validatePhone(phone)) {
      message.error("Please enter a valid 10-digit mobile number");
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }
    setIsLoading(true);
    try {
      const data = await apiPostWithoutToken("/auth/login", {
        mobile: phone,
        language: "tel",
      });

      if (data.data.userId || data.data.success !== false) {
        setUserId(data.data.userId || `temp-${Date.now()}`);

        setCurrentUserType(data.data.role || "");
        setOtpSent(true);
        setOtpTimer(60);
        message.success(data.data.message || "OTP sent successfully!");
        toast.success(data.data.message || "OTP sent successfully!");
      } else {
        message.error(data.data.message || "Failed to send OTP.");
        toast.error(data.data.message || "Failed to send OTP.");
      }
    } catch (error) {
      const errorMsg =
        error.response?.status === 401
          ? "Authentication failed."
          : error.message?.includes("Network Error")
          ? "Network Error: Unable to connect to server."
          : error.response?.status === 400
          ? "Invalid request."
          : error.response?.status === 500
          ? "Server error."
          : "Failed to send OTP.";
      message.error(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPVerification = async () => {
    if (!otp || otp.length !== 6) {
      message.error("Please enter the complete 6-digit OTP");
      toast.error("Please enter the complete 6-digit OTP");
      return;
    }
    if (!userId) {
      message.error("Session expired. Please request OTP again.");
      toast.error("Session expired. Please request OTP again.");
      resetPhoneLogin();
      return;
    }
    setIsLoading(true);
    try {
      const data = await apiPostWithoutToken("/auth/validateOtp", {
        userId,
        OTP: otp,
        mobile: phone,
      });
      console.log("OTP Verification Response:=============", data);
      if (data?.data?.userData?.role === "doctor") {
        console.log("Doctor:", data);

        const isValidUser =
          !data.data?.userData?.isDeleted &&
          data.data?.userData?.status === "approved";
        // Additional checks or actions for doctor role can be added here
        if (!isValidUser) {
          toast.error("You are not authorized to login as a doctor.");
          return;
        }
      }
      
      console.log("User Data:otp", data.data);

      if (data.data.accessToken) {
        const userData = data.data.userData;
        console.log("User Data:", userData);

        if (userData) {
          dispatch({
            type: "currentUserData",
            payload: userData,
          });
        }

        localStorage.setItem("accessToken", data.data.accessToken);
        localStorage.setItem("userID", userId);
        localStorage.setItem(
          "role",
          data.data.userData.role || currentUserType
        );

        const redirectRoute = getRouteFromUserType(
          data.data.userData.role || currentUserType
        );
        message.success(
          `Login successful! Redirecting to ${
            data.data.role || currentUserType
          } dashboard...`
        );
        toast.success(
          `Login successful! Redirecting to ${
            data.data.role || currentUserType
          } dashboard...`
        );
        setTimeout(() => navigate(redirectRoute), 1500);
      }
    } catch (error) {
      console.log("loginerror",error)
      const errorMsg =
        error.response?.status === 401
          ? "Invalid OTP."
          : error.message?.includes("Network Error")
          ? "Network Error: Unable to connect to server."
          : "Verification failed.========";
      message.error(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const resetPhoneLogin = () => {
    setOtpSent(false);
    setOtpTimer(0);
    setPhone("");
    setOtp("");
    setUserId("");
    setCurrentUserType("");
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 10);
    setPhone(value);
  };

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setOtp(value);
  };

  const getUserTypeDisplay = () => {
    if (!currentUserType) return "";
    return ` (${
      currentUserType.charAt(0).toUpperCase() + currentUserType.slice(1)
    })`;
  };

const getToken = () => localStorage.getItem("accessToken");


  const getCurrentUserData = async () => {
    try {

      console.log("Fetching user data from API");
      const response = await apiGet("/users/getUser");
      const userData = response.data?.data;
      console.log("userDatafrom app.jsx",userData)
      if (userData) {
         if (userData.role === "patient") {
        navigate("/unauthorized");
        return;
      }
      
        //fetch current DoctorData
  const doctorId = userData?.role === "doctor" ? userData?.userId : userData?.createdBy;

         const response = await apiGet(`/users/getUser?userId=${doctorId}`);
                const docData = response.data?.data;
          console.log(docData, "userdetais")
           const redirectRoute = getRouteFromUserType(
          userData?.role 
        );

           dispatch({
          type: "doctorData",
          payload: docData,
        });

        dispatch({
          type: "currentUserData",
          payload: userData,
        });
        navigate(redirectRoute)
         
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

useEffect(() => {
  const checkAuth = async () => {
    // Skip auth check if on the unauthorized page
    if (window.location.pathname === "/unauthorized") {
      setIsCheckingAuth(false);
      return;
    }

    if (!getToken()) {
      setIsCheckingAuth(false); // no token → show login form
      navigate("/login");
    } else {
      try {
        await getCurrentUserData(); // fetch user details
      } catch (error) {
        console.error("Auth check failed:", error);
        // localStorage.clear();
        setIsCheckingAuth(false); // fallback → show login form
      }
    }
  };

  checkAuth();
}, [user]);



//   useEffect(() => {
//     if(!getToken()) {
// navigate("/login");
//     }
    
//     else if (getToken()) {
//       getCurrentUserData();
//     }
//   }, [user]);

  const getDoctorDa = async () => {
    try {
const doctorId = user?.role === "doctor" ? user?.userId : user?.createdBy;

         const response = await apiGet(`/users/getUser?userId=${doctorId}`);
                const docData = response.data?.data;
          console.log(docData, "docData")
          

           dispatch({
          type: "doctorData",
          payload: docData,
        });
    }catch (error) {
      console.error("Error fetching doctor data:", error);
    }
    
  }

  useEffect(() => {
if(user){
  getDoctorDa()
}
  },[user])

  return isCheckingAuth ? (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontSize: "1.2rem",
      }}
    >
      <Spin size="large" />
    </div>
  ) : (
    <div
      className="login-container"
      style={{
        fontSize: "0.8rem",
        minHeight: "100vh",
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        alignItems: "center",
        justifyContent: "center",
        padding: isMobile ? "20px 10px" : "0px 50px",
        // background: '#f8f9fa',
      }}
    >
      <img
        src="/images/image.png"
        alt="Login Visual"
        className="login-image"
        style={{
          maxWidth: isMobile ? "90vw" : "550px",
          maxHeight: isMobile ? "400px" : "640px",
          borderRadius: "40px",
          width: isMobile ? "100%" : "100%",
          marginTop: isMobile ? "20px" : "0px",
          marginLeft: isMobile ? "0" : "50px",
          marginRight: isMobile ? "0" : "20px",
          display: "block",
          objectFit: "cover",
        }}
      />
      <div
        className="login-form-container"
        style={{
          width: isMobile ? "100%" : "350px",
          margin: isMobile ? "20px 0 0 0" : "50",
          padding: isMobile ? "10px" : "52px",
          background: "#fff",
          borderRadius: "24px",
          boxShadow: isMobile ? "none" : "0 2px 16px rgba(0,0,0,0.07)",
        }}
      >
        <LoginForm
          otpSent={otpSent}
          phone={phone}
          otp={otp}
          isLoading={isLoading}
          otpTimer={otpTimer}
          userTypeDisplay={getUserTypeDisplay()}
          onPhoneChange={handlePhoneChange}
          onOtpChange={handleOtpChange}
          onSendOTP={handleSendOTP}
          onVerifyOTP={handleOTPVerification}
          onReset={resetPhoneLogin}
        />
      </div>
    </div>
  );
};


export default Login;
