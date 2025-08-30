"use client";

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Result } from "antd";
import { HomeOutlined } from "@ant-design/icons";

const Unauthorized = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Clear user data from localStorage
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userID");
    localStorage.removeItem("role");
  }, []);

  const handleGoHome = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white p-6">
      <div className="bg-white rounded-2xl shadow-xl p-10 max-w-lg w-full transform transition-all duration-300 hover:shadow-2xl">
        <Result
          status="403"
          title={<h1 className="text-5xl font-extrabold text-gray-900">403</h1>}
          subTitle={
            <p className="text-xl text-gray-700 mt-4">
              Sorry, you are not authorized to access this portal.
            </p>
          }
          extra={
            <Button
              type="primary"
              icon={<HomeOutlined />}
              onClick={handleGoHome}
              className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200 transform hover:scale-105"
            >
              Back to Login
            </Button>
          }
        />
      </div>
    </div>
  );
};

export default Unauthorized;