import AppRoutes from "./Routing";
import "./App.css";
import { useEffect, useRef } from "react";
import { apiGet } from "./components/api";
import { useDispatch, useSelector } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const App = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.currentUserData);
  const hasFetchedUser = useRef(false);
const getToken = () => localStorage.getItem("accessToken");


  const getCurrentUserData = async () => {
    try {
      const response = await apiGet("/users/getUser");
      const userData = response.data?.data;
      console.log("userDatafrom app.jsx",userData)
      if (userData) {
        dispatch({
          type: "currentUserData",
          payload: userData,
        });
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
