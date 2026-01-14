import { useForm } from "react-hook-form";
import Input from "../components/Input";
import Button from "../components/Button";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { setCredentials } from "../redux/features/auth/authSlice";
import { useDispatch } from "react-redux";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import OAuth from "../components/OAuth";
import { useTranslation } from "react-i18next";

const baseURL = import.meta.env.VITE_BACKEND_BASE_URL;

const createUser = async (userData) => {
  const { data } = await axios.post(`${baseURL}/api/v1/user/signup`, userData);
  return data;
};

function Signup() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const signupSchema = z
    .object({
      firstname: z.string().min(1, t("validation.firstNameRequired")),
      lastname: z.string().min(1, t("validation.lastNameRequired")),
      email: z.string().email(t("validation.invalidEmail")),
      password: z.string().min(8, t("validation.passwordMin8")),
      confirmPassword: z.string().min(8, t("validation.confirmPasswordMin8")),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("validation.passwordsDontMatch"),
      path: ["confirmPassword"],
    });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      firstname: "",
      lastname: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    resolver: zodResolver(signupSchema),
  });

  const mutation = useMutation({
    mutationFn: createUser,
    onSuccess: (data) => {
      dispatch(setCredentials(data));
      queryClient.setQueryData(["user"], data);
      toast.success(t("auth.signupSuccess"));
      navigate("/");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || t("messages.signupError"));
    },
  });

  const signup = (data) => mutation.mutate(data);

  return (
    <div className="flex items-center justify-center">
      <div className="mx-auto w-full max-w-lg rounded-xl p-10">
        <h2 className="text-2xl font-bold m-2 text-blue-600">
          {t("auth.signup")}
        </h2>

        <div className="border border-blue-600 rounded-md">
          <form onSubmit={handleSubmit(signup)}>
            <div className="p-4 space-y-3">
              <div>
                <Input
                  placeholder={t("common.firstName")}
                  {...register("firstname")}
                />
                {errors.firstname && (
                  <p className="text-red-500">{errors.firstname.message}</p>
                )}
              </div>

              <div>
                <Input
                  placeholder={t("common.lastName")}
                  {...register("lastname")}
                />
                {errors.lastname && (
                  <p className="text-red-500">{errors.lastname.message}</p>
                )}
              </div>

              <div>
                <Input
                  placeholder={t("common.email")}
                  type="email"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div>
                <Input
                  type="password"
                  placeholder={t("common.password")}
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-red-500">{errors.password.message}</p>
                )}
              </div>

              <div>
                <Input
                  type="password"
                  placeholder={t("common.confirmPassword")}
                  {...register("confirmPassword")}
                />
                {errors.confirmPassword && (
                  <p className="text-red-500">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <Button
                textColor="text-white"
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? t("auth.signingUp") : t("auth.signup")}
              </Button>
            </div>

            <p className="m-1 text-center text-black">
              {t("auth.alreadyHaveAccount")}&nbsp;
              <Link to="/login" className="text-blue-600">
                {t("auth.login")}
              </Link>
            </p>

            <OAuth title={t("auth.signupWithGoogle")} />
          </form>
        </div>
      </div>
    </div>
  );
}

export default Signup;
