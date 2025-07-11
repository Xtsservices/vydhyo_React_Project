import { Routes, Route } from "react-router-dom";

import LayoutWrapper from "./components/LayoutWrapper";
import DoctorLayoutWrapper from "./components/DoctorLayoutWrapper"; // Import DoctorLayoutWrapper
import SuperAdminDashboard from "./components/superAdmin/superAdminDashboard/SuperAdminDashboard";
import Login from "./components/auth/Login";
import ProtectedRoute from "./components/ProtectedRoute";

// doctor components
import Appointments from "./components/doctor/doctorPages/Appointments"; 
import Patients from "./components/doctor/doctorPages/Patients"; 
import DoctorDashboard from "./components/doctor/doctorDashboard/DoctorDashboard";
import Walkin from "./components/doctor/doctorPages/Walkin"; 
import StaffManagement from "./components/doctor/doctorPages/staffManagement"; 
import Availability from "./components/doctor/doctorPages/Availability";
import Accounts from "./components/doctor/doctorPages/Accounts"; 
import Reviews from "./components/doctor/doctorPages/Reviews";
import Invoices from "./components/doctor/doctorPages/Invoices"; 
import Messages from "./components/doctor/doctorPages/Messages"; 
import Pharmacy from "./components/doctor/doctorPages/Pharmacy";
import Labs from "./components/doctor/doctorPages/Labs";
import ClinicManagement from "./components/doctor/doctorPages/ClinicManagement"
import NotFound from "./components/NotFound ";
import Billing from "./components/doctor/doctorPages/Billing";
import Header from "./components/landingPage/Header";
import DoctorProfileView from "./components/doctor/doctorPages/DoctorProfileView";
import EPrescription from "./components/doctor/doctorPages/EPrescription";
import TotalExpenditureScreen from "./components/doctor/doctorPages/TotalExpenditure";
import PendingTransactionsScreen from "./components/doctor/doctorPages/PendingTransactions";

// import AdvertisingDoctorsPage from "./components/landingPage/AdvertisingDoctorsPage";
import AdvertisingDoctorsPage from "./components/landingPage/AdvertisingPage"; 




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
import SuperAdminProfileView from "./components/superAdmin/superAdminPages/SuperAdminProfileView";


const AppRoutes = () => {
  return (
    <Routes>
      {/* Login Route */}
      <Route path="/login" element={<Login />} />

      {/* landingPage Route */}
      <Route path="/" element={<Header />} />
      <Route path="/landingPage" element={<AdvertisingDoctorsPage />} />    
      

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

        <Route
          path="/SuperAdmin/profileView"
          element={
            <ProtectedRoute>
              <SuperAdminProfileView />
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
          path="/doctor/doctorPages/Labs"
          element={
            <ProtectedRoute>
              <Labs />
            </ProtectedRoute>
          }
        />

        <Route
          path="/doctor/doctorPages/EPrescription"
          element={
            <ProtectedRoute>
              <EPrescription/>
            </ProtectedRoute>
          }
        />

        <Route
          path="/doctor/doctorPages/ClinicManagement"
          element={
            <ProtectedRoute>
              <ClinicManagement />
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
          path="/doctor/doctorPages/DoctorProfileView"
          element={
            <ProtectedRoute>
              <DoctorProfileView />
            </ProtectedRoute>
          }
        />

        <Route
          path="/doctor/doctorPages/Pharmacy"
          element={
            <ProtectedRoute>
              <Pharmacy />
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
          path="/doctor/doctorPages/Billing"
          element={
            <ProtectedRoute>
              <Billing />
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
          path="/doctor/doctorPages/TotalExpenditure"
          element={
            <ProtectedRoute>
              <TotalExpenditureScreen />
            </ProtectedRoute>
          }
        />

        <Route
          path="/doctor/doctorPages/PendingTransactions"
          element={
            <ProtectedRoute>
              <PendingTransactionsScreen />
            </ProtectedRoute>
          }
        />

        <Route
          path="/doctor/doctorPages/Reviews"
          element={
            <ProtectedRoute>
              <Reviews />
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
