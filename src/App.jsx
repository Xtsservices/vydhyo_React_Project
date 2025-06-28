import AppRoutes from "./Routing";
import "./App.css";
import { useEffect, useRef } from "react";
import { apiGet } from "./components/api";
import { useDispatch, useSelector } from "react-redux";

const App = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.currentUserData);
  const hasFetchedUser = useRef(false); 

  const getCurrentUserData = async () => {
    try {
      const response = await apiGet("/users/getUser");
      const userData = response.data?.data;
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
    if (!user && !hasFetchedUser.current) {
      hasFetchedUser.current = true; // ✅ Prevent future fetch attempts
      getCurrentUserData();
    }
  }, [user]); 

  return <AppRoutes />;
};

export default App;
