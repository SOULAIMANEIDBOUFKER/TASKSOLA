import { useForm } from "react-hook-form";
import Input from "../components/Input";
import Button from "../components/Button";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { setCredentials } from "../redux/features/auth/authSlice";
import { useDispatch } from "react-redux";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import OAuth from "../components/OAuth";
import { useTranslation } from "react-i18next";

const baseURL = import.meta.env.VITE_BACKEND_BASE_URL;

const loginUser = async (userData) => {
  const { data } = await axios.post(`${baseURL}/api/v1/user/login`, userData);
  return data;
};

function Login() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const loginSchema = z.object({
    email: z.string().email(t("validation.invalidEmail")),
    password: z.string().min(8, t("validation.passwordMin8")),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    resolver: zodResolver(loginSchema),
  });

  const mutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      dispatch(setCredentials(data));
      queryClient.setQueryData(["user"], data);
      toast.success(t("auth.loginSuccess"));
      navigate("/");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || t("messages.loginError"));
    },
  });

  const login = (data) => mutation.mutate(data);

  return (
    <div className="flex items-center justify-center">
      <div className="mx-auto w-full max-w-lg rounded-xl p-10">
        <h2 className="text-2xl font-bold m-2 text-blue-600">
          {t("auth.login")}
        </h2>

        <div className="border border-blue-600 rounded-md">
          <form onSubmit={handleSubmit(login)}>
            <div className="space-y-4 p-4">
              <div>
                <Input
                  placeholder={t("common.email")}
                  type="email"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <Input
                  type="password"
                  placeholder={t("common.password")}
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <Button
                textColor="text-white"
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? t("auth.loggingIn") : t("auth.login")}
              </Button>
            </div>

            <p className="text-center text-black my-4">
              {t("auth.dontHaveAccount")}{" "}
              <Link to="/signup" className="text-blue-600 hover:underline">
                {t("auth.signup")}
              </Link>
            </p>

            <OAuth title={t("auth.loginWithGoogle")} />
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
