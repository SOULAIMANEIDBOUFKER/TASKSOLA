import axios from "axios";
import Button from "./Button";
import { BiTask } from "react-icons/bi";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logout } from "../redux/features/auth/authSlice";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";

const baseURL = import.meta.env.VITE_BACKEND_BASE_URL;

axios.defaults.withCredentials = true;

const logoutUser = async () => {
  const { data } = await axios.post(`${baseURL}/api/v1/user/logout`);
  return data;
};

const Header = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const userinfo = useSelector((state) => state.auth.userInfo);
  const isLoginPage = location.pathname === "/login";
  const isSignupPage = location.pathname === "/signup";

  const mutation = useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      dispatch(logout());
      queryClient.setQueryData(["user"], null);
      toast.success(t("auth.logoutSuccess"));
      navigate("/login");
    },
    onError: () => {
      toast.error(t("common.error", { error: "Logout failed" }));
    },
  });

  return (
    <header className="sticky top-0 z-50 border-b border-app-border bg-white">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex items-center justify-between py-3">
          <Link to="/" className="inline-flex items-center gap-2">
            <BiTask className="text-2xl text-app-primary" />
            <span className="text-base md:text-lg font-semibold text-app-text">
              {t("common.appName")}
            </span>
          </Link>

          <div className="flex items-center gap-2 md:gap-3">
            <LanguageSwitcher />

            {!userinfo?.email ? (
              <>
                <Link to="/login">
                  <Button
                    bgColor={isLoginPage ? "bg-app-primary" : "bg-white"}
                    textColor={isLoginPage ? "text-white" : "text-app-text"}
                    className={`rounded-md border ${
                      isLoginPage
                        ? "border-app-primary"
                        : "border-app-border hover:bg-gray-50"
                    }`}
                  >
                    {t("auth.login")}
                  </Button>
                </Link>

                <Link to="/signup">
                  <Button
                    bgColor={isSignupPage ? "bg-app-primary" : "bg-white"}
                    textColor={isSignupPage ? "text-white" : "text-app-text"}
                    className={`rounded-md border ${
                      isSignupPage
                        ? "border-app-primary"
                        : "border-app-border hover:bg-gray-50"
                    }`}
                  >
                    {t("auth.signup")}
                  </Button>
                </Link>
              </>
            ) : (
              <Button
                onClick={() => mutation.mutate()}
                bgColor="bg-white"
                textColor="text-app-danger"
                className="rounded-md border border-app-border hover:bg-red-50"
              >
                {t("auth.logout")}
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
