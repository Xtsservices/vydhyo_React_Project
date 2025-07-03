"use client";

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import Illustration from './Illustration';
import LoginForm from './LoginForm';
import '../../components/stylings/Login.css';
import { apiPostWithoutToken } from '../api';


const Login = ()=> {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [userId, setUserId] = useState('');
  const [currentUserType, setCurrentUserType] = useState('');

  useEffect(() => {
    message.config({
      top: 20,
      duration: 3,
      maxCount: 1,
    });

    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
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

    if (role === 'superadmin') return '/SuperAdmin/dashboard';
    if (role === 'doctor') return '/Doctor/dashboard';
    // return '/SuperAdmin/dashboard';
    return '/Doctor/dashboard';
    return '/Admin/app/dashboard'; // Default route if role is unknown
  };

  const handleSendOTP = async () => {
    if (!validatePhone(phone)) {
      message.error('Please enter a valid 10-digit mobile number');
      return;
    }
    setIsLoading(true);
    try {
      const data = await apiPostWithoutToken('/auth/login', {
        mobile: phone,
        language: 'tel',
      });
      if (data.data.userId || data.data.success !== false) {
        setUserId(data.data.userId || `temp-${Date.now()}`);
        setCurrentUserType(data.data.role || ''); // Store role from API response
        setOtpSent(true);
        setOtpTimer(60);
        message.success(data.data.message || 'OTP sent successfully!');
      } else {
        message.error(data.data.message || 'Failed to send OTP.');
      }
    } catch (error) {
      message.error(
        error.response?.status === 401
          ? 'Authentication failed.'
          : error.message?.includes('Network Error')
          ? 'Network Error: Unable to connect to server.'
          : error.response?.status === 400
          ? 'Invalid request.'
          : error.response?.status === 500
          ? 'Server error.'
          : 'Failed to send OTP.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPVerification = async () => {
    if (!otp || otp.length !== 6) {
      message.error('Please enter the complete 6-digit OTP');
      return;
    }
    if (!userId) {
      message.error('Session expired. Please request OTP again.');
      resetPhoneLogin();
      return;
    }
    setIsLoading(true);
    try {
      const data = await apiPostWithoutToken('/auth/validateOtp', {
        userId,
        OTP: otp,
        mobile: phone,
      });

      console.log("logindatadata:", data);
      console.log("logindatadata:", data.data.userData.role);
      if (data.data.accessToken) {
        localStorage.setItem('accessToken', data.data.accessToken);
        localStorage.setItem('userID', userId);
        localStorage.setItem('role', data.data.userData.role || currentUserType);
        
        const redirectRoute = getRouteFromUserType(data.data.userData.role || currentUserType);
        message.success(`Login successful! Redirecting to ${data.data.role || currentUserType} dashboard...`);
        setTimeout(() => navigate(redirectRoute), 1500);
      }
    } catch (error) {
      message.error(
        error.response?.status === 401
          ? 'Invalid OTP.'
          : error.message?.includes('Network Error')
          ? 'Network Error: Unable to connect to server.'
          : 'Verification failed.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const resetPhoneLogin = () => {
    setOtpSent(false);
    setOtpTimer(0);
    setPhone('');
    setOtp('');
    setUserId('');
    setCurrentUserType('');
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhone(value);
  };

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
  };

  const getUserTypeDisplay = () => {
    if (!currentUserType) return '';
    return ` (${currentUserType.charAt(0).toUpperCase() + currentUserType.slice(1)})`;
  };

  return (
    <div
      className="login-container"
      style={{
        fontSize: '0.8rem',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isMobile ? '20px 10px' : '0px 50px',
        // background: '#f8f9fa',
      }}
    >
      <img
        src="/images/image.png"
        alt="Login Visual"
        className="login-image"
        style={{
          maxWidth: isMobile ? '90vw' : '550px',
          maxHeight: isMobile ? '400px' : '640px',
          borderRadius: '40px',
          width: isMobile ? '100%' : '100%',
          marginTop: isMobile ? '20px' : '0px',
          marginLeft: isMobile ? '0' : '50px',
          marginRight: isMobile ? '0' : '20px',
          display: 'block',
          objectFit: 'cover',
        }}
      />
      <div
        className="login-form-container"
        style={{
          width: isMobile ? '100%' : '350px',
          margin: isMobile ? '20px 0 0 0' : '50',
          padding: isMobile ? '10px' : '52px',
          background: '#fff',
          borderRadius: '24px',
          boxShadow: isMobile ? 'none' : '0 2px 16px rgba(0,0,0,0.07)',
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
}

export default Login;