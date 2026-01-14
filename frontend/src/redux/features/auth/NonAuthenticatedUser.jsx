import { Navigate, Outlet } from "react-router";
import { useSelector } from "react-redux";

const NonAuthenticatedUser = () => {
  const { userInfo } = useSelector((state) => state.auth);

  
  return userInfo ? <Navigate to="/" replace /> : <Outlet />;
};

export default NonAuthenticatedUser;
