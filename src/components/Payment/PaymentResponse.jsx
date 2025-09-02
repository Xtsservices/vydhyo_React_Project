import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { apiPost } from "../api";
import "./PaymentResponse.css";

const PaymentResponse = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  // const linkId = params.get("link_id");
  const linkId = "live_02092025_VYDAPMT900";
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  async function updatePaymentStatus() {
    try {
      setIsLoading(true);
      const response = await apiPost("/whatsappbooking/CashfreePaymentLinkDetails", { linkId });
      console.log(response, "paymentresp");
      console.log(response?.data?.data?.cashfreeDetails?.link_status, "response?.data?.data?.cashfreeDetails?.link_status");
      if (response?.data?.data?.cashfreeDetails?.link_status) {
        setPaymentStatus(response.data.data.cashfreeDetails.link_status);
        //after 5 seconds navigate to / path
        setTimeout(() => {
          window.location.href = "/";
        }, 3000);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Error updating payment status:", error);
      setError("Failed to fetch payment status. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (linkId) {
      updatePaymentStatus();
    } else {
      setIsLoading(false);
      setError("No payment link ID provided.");
    }
  }, [linkId]);

  const isSuccess = paymentStatus === "PAID";

  return (
    <div className="payment-container">
      <div className="payment-card">
        {isLoading ? (
          <div className="loading-container">
            <div className="loading-spinner">
              <div className="spinner-base"></div>
              <div className="spinner-accent"></div>
            </div>
            <p className="loading-title">Processing your payment...</p>
            <p className="loading-subtitle">Please wait while we verify your transaction</p>
          </div>
        ) : error ? (
          <div className="content-section">
            <div className="icon-container error-icon-container">
              <svg
                className="error-icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h2 className="main-heading error-heading">Something went wrong</h2>
            <p className="error-message">{error}</p>
            <button
              onClick={updatePaymentStatus}
              className="btn btn-danger"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="content-section">
            {/* Success State */}
            {isSuccess ? (
              <>
                <div className="icon-container success-icon-container">
                  <svg
                    className="success-icon"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="3"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div className="progress-bar"></div>
                
                <h2 className="main-heading success-heading">Payment Successful!</h2>
                
                <div className="message-box success-message">
                  <p className="message-title">
                    🎉 Thank you! Your payment has been successfully processed.
                  </p>
                  <p className="message-subtitle">
                    You should receive a confirmation email shortly.
                  </p>
                </div>
                
                <div className="transaction-info">
                  <p className="transaction-label">Transaction ID</p>
                  <p className="transaction-id">{linkId || "N/A"}</p>
                </div>
                
                <a href="/" className="btn btn-success">
                  Continue
                </a>
              </>
            ) : (
              /* Failure State */
              <>
                <div className="icon-container failure-icon-container">
                  <svg
                    className="failure-icon"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
                
                <h2 className="main-heading failure-heading">Payment Failed</h2>
                
                <div className="message-box failure-message">
                  <p className="message-title">
                    Sorry, your payment could not be processed.
                  </p>
                  <p className="message-subtitle">
                    This could be due to insufficient funds, network issues, or other technical problems.
                  </p>
                </div>
                
                <div className="transaction-info">
                  <p className="transaction-label">Reference ID</p>
                  <p className="transaction-id">{linkId || "N/A"}</p>
                </div>
                
                <div className="button-group">
                  <a href="/" className="btn btn-secondary">
                    Back to Home
                  </a>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentResponse;