import React from 'react';

const LoginForm = ({
  otpSent,
  phone,
  otp,
  isLoading,
  otpTimer,
  userTypeDisplay,
  onPhoneChange,
  onOtpChange,
  onSendOTP,
  onVerifyOTP,
  onReset,
}) => {
  return (
    <div className="login-form">
      <div className="form-header">
        <img
          src="/images/vydh_logo.png"
          alt="Login"
          className="form-image"
          style={{ width: 200, height: 160, marginBottom: 0, marginTop: -40}}
        />
        <h1 className="form-title">{otpSent ? 'Enter OTP' : ''}</h1>
        {!otpSent && <p className="form-subtitle">Enter your registered mobile number to continue</p>}
      </div>
      {/* {phone.length === 10 && (
        <div className="user-type">
          <span>User Type: {userTypeDisplay.slice(2, -1)}</span>
        </div>
      )} */}
      {!otpSent ? (
        <div className="form-content">
          <div className="input-group">
            <label className="input-label">Mobile Number</label>
            <input
              type="text"
              placeholder="Enter your 10-digit mobile number"
              value={phone}
              onChange={onPhoneChange}
              className="input-field"
            />
          </div>
          <div className="form-actions">
            <button className="text-button">Login with OTP</button>
          </div>
          <button
            onClick={onSendOTP}
            disabled={!phone || phone.length !== 10 || isLoading}
            className="action-button"
          >
            {isLoading ? 'Sending OTP...' : 'Send OTP'}
          </button>
        </div>
      ) : (
        <div className="form-content">
          <div className="otp-info">
            <p>OTP sent to +91 {phone}{userTypeDisplay}</p>
            <button onClick={onReset} className="text-button">
              ← Change number
            </button>
          </div>
          <div className="input-group">
            <label className="input-label">Enter OTP</label>
            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={onOtpChange}
              className="input-field otp-input"
            />
          </div>
          <div className="form-actions">
            <span>{otpTimer > 0 ? `Resend OTP in ${otpTimer}s` : "Didn't receive OTP?"}</span>
            {otpTimer === 0 && (
              <button onClick={onSendOTP} disabled={isLoading} className="text-button">
                {isLoading ? 'Sending...' : 'Resend OTP'}
              </button>
            )}
          </div>
          <button
            onClick={onVerifyOTP}
            disabled={!otp || otp.length !== 6 || isLoading}
            className="action-button"
          >
            {isLoading ? 'Verifying...' : 'Verify & Sign In'}
          </button>
        </div>
      )}
      <div className="form-footer">
        By continuing, you agree to our{' '}
        <a href="#" className="link">
          Terms of Service
        </a>{' '}
        and{' '}
        <a href="#" className="link">
          Privacy Policy
        </a>
      </div>
    </div>
  );
};

export default LoginForm;