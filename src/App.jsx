import AppRoutes from "./Routing";
import "./App.css";
import { useEffect, useRef } from "react";
import { apiGet } from "./components/api";
import { useDispatch, useSelector } from "react-redux";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
const App = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.currentUserData);
  const hasFetchedUser = useRef(false);
  const getToken = () => localStorage.getItem("accessToken");
  const navigate = useNavigate();

  const getRouteFromUserType = (role) => {
    if (role === "superadmin") return "/SuperAdmin/dashboard";
    if (role === "doctor") return "/Doctor/dashboard";
    if (role === "reception") return "/Doctor/dashboard";
    if (role === "patient") return "/unauthorized";

    return "/Doctor/dashboard";
  };


  const getCurrentUserData = async () => {
    try {

      console.log("Fetching user data from API");
      const response = await apiGet("/users/getUser");
      const userData = response.data?.data;
      console.log("userDatafrom app.jsx", userData)
      if (userData) {
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
    if (getToken() && !user && !hasFetchedUser.current) {
      hasFetchedUser.current = true; // ✅ Prevent future fetch attempts
      getCurrentUserData();
    }
  }, [user]);

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
    } catch (error) {
      console.error("Error fetching doctor data:", error);
    }

  }

  useEffect(() => {
    if (user) {
      getDoctorDa()
    }
  }, [user])

  return (
    <>
      <AppRoutes />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
};

export default App;
