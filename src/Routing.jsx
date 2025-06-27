import { Routes, Route } from "react-router-dom";
import LayoutWrapper from "./components/LayoutWrapper";
import DoctorLayoutWrapper from "./components/DoctorLayoutWrapper"; // Import DoctorLayoutWrapper
import SuperAdminDashboard from "./components/superAdmin/superAdminDashboard/SuperAdminDashboard";
import Login from "./components/Auth/Login";
import ProtectedRoute from "./components/ProtectedRoute";
// Import DoctorDashboard component
import DoctorDashboard from "./components/doctor/doctorDashboard/DoctorDashboard";
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
      </Route>

      {/* Catch all unmatched routes */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;