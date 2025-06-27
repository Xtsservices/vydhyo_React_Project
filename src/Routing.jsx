import { Routes, Route } from "react-router-dom";
import LayoutWrapper from "./components/LayoutWrapper";
import DoctorLayoutWrapper from "./components/DoctorLayoutWrapper"; // Import DoctorLayoutWrapper
import SuperAdminDashboard from "./components/superAdmin/superAdminDashboard/SuperAdminDashboard";
import Login from "./components/Auth/Login";
import ProtectedRoute from "./components/ProtectedRoute";
// Import DoctorDashboard component
import DoctorDashboard from "./components/doctor/doctorDashboard/DoctorDashboard";
import NotFound from "./components/NotFound ";
import SuperAdminAppointments from "./components/superAdmin/superAdminPages/SuperAdminAppointments";
import SuperAdminPatients from "./components/superAdmin/superAdminPages/SuperAdminPatients";
import SuperAdminServices from "./components/superAdmin/superAdminPages/SuperAdminServices";
import SuperAdminDoctors from "./components/superAdmin/superAdminPages/SuperAdminDoctors";
import SuperAdminRevenue from "./components/superAdmin/superAdminPages/SuperAdminRevenue";
import SuperAdminBillingStatus from "./components/superAdmin/superAdminPages/SuperAdminBillingStatus";
import SuperAdminSpecialities from "./components/superAdmin/superAdminPages/SuperAdminSpecialities";
import SuperAdminReviews from "./components/superAdmin/superAdminPages/SuperAdminReviews";
import SuperAdminReports from "./components/superAdmin/superAdminPages/SuperAdminReports";
import SuperAdminProfile from "./components/superAdmin/superAdminPages/SuperAdminProfile";
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
        <Route
          path="/SuperAdmin/doctors"
          element={
            <ProtectedRoute>
              <SuperAdminDoctors />
            </ProtectedRoute>
          }
        />

        <Route
          path="/SuperAdmin/patients"
          element={
            <ProtectedRoute>
              <SuperAdminPatients />
            </ProtectedRoute>
          }
        />

        <Route
          path="/SuperAdmin/services"
          element={
            <ProtectedRoute>
              <SuperAdminServices />
            </ProtectedRoute>
          }
        />

        <Route
          path="/SuperAdmin/appointments"
          element={
            <ProtectedRoute>
              <SuperAdminAppointments />
            </ProtectedRoute>
          }
        />

        <Route
          path="/SuperAdmin/revenue"
          element={
            <ProtectedRoute>
              <SuperAdminRevenue />
            </ProtectedRoute>
          }
        />

        <Route
          path="/SuperAdmin/billing-status"
          element={
            <ProtectedRoute>
              <SuperAdminBillingStatus />
            </ProtectedRoute>
          }
        />

        <Route
          path="/SuperAdmin/specialities"
          element={
            <ProtectedRoute>
              <SuperAdminSpecialities />
            </ProtectedRoute>
          }
        />

        <Route
          path="/SuperAdmin/reviews"
          element={
            <ProtectedRoute>
              <SuperAdminReviews />
            </ProtectedRoute>
          }
        />

        <Route
          path="/SuperAdmin/reports"
          element={
            <ProtectedRoute>
              <SuperAdminReports />
            </ProtectedRoute>
          }
        />

        <Route
          path="/SuperAdmin/profile"
          element={
            <ProtectedRoute>
              <SuperAdminProfile />
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
