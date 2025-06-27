import { Routes, Route } from "react-router-dom";
import LayoutWrapper from "./components/LayoutWrapper";
import DoctorLayoutWrapper from "./components/DoctorLayoutWrapper"; // Import DoctorLayoutWrapper
import SuperAdminDashboard from "./components/superAdmin/superAdminDashboard/SuperAdminDashboard";
import Login from "./components/Auth/Login";
import ProtectedRoute from "./components/ProtectedRoute";

// doctor components
import Appointments from "./components/doctor/doctorPages/Appointments"; 
import Patients from "./components/doctor/doctorPages/Patients"; 
import DoctorDashboard from "./components/doctor/doctorDashboard/DoctorDashboard";
import Walkin from "./components/doctor/doctorPages/Walkin"; 
import StaffManagement from "./components/doctor/doctorPages/staffManagement"; 
import Availability from "./components/doctor/doctorPages/Availability";
import Accounts from "./components/doctor/doctorPages/Accounts"; 
import Invoices from "./components/doctor/doctorPages/Invoices"; 
import Messages from "./components/doctor/doctorPages/Messages"; 

import NotFound from "./components/NotFound ";
const AppRoutes = () => {
  return (
    <Routes>
      {/* Login Route */}
      <Route path="/" element={<Login />} />

      {/* SuperAdmin Routes under LayoutWrapper */}
      <Route element={<LayoutWrapper />}>
        <Route
          path="/SuperAdmin/dashboard"
          element={
            <ProtectedRoute>
              <SuperAdminDashboard />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Doctor Routes under DoctorLayoutWrapper */}
      <Route element={<DoctorLayoutWrapper />}>
        <Route
          path="/Doctor/dashboard"
          element={
            <ProtectedRoute>
              <DoctorDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/doctor/doctorPages/Appointments"
          element={
            <ProtectedRoute>
              <Appointments />
            </ProtectedRoute>
          }
        />

        <Route
          path="/doctor/doctorPages/Patients"
          element={
            <ProtectedRoute>
              <Patients />
            </ProtectedRoute>
          }
        />

        <Route
          path="/doctor/doctorPages/Walkin"
          element={
            <ProtectedRoute>
              <Walkin/>
            </ProtectedRoute>
          }
        />

        <Route
          path="/doctor/doctorPages/staffManagement"
          element={
            <ProtectedRoute>
              <StaffManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/doctor/doctorPages/Availability"
          element={
            <ProtectedRoute>
              <Availability />
            </ProtectedRoute>
          }
        />

        <Route
          path="/doctor/doctorPages/Accounts"
          element={
            <ProtectedRoute>
              <Accounts />
            </ProtectedRoute>
          }
        />

        <Route
          path="/doctor/doctorPages/Invoices"
          element={
            <ProtectedRoute>
              <Invoices />
            </ProtectedRoute>
          }
        />

        <Route
          path="/doctor/doctorPages/Messages"
          element={
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          }
        />

      </Route>

      

      {/* Catch all unmatched routes */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;