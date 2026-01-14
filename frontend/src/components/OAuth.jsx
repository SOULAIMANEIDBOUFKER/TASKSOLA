import { auth } from "../firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useDispatch } from "react-redux";
import { setCredentials } from "../redux/features/auth/authSlice";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useState } from "react";

const baseUrl = import.meta.env.VITE_BACKEND_BASE_URL;

const OAuth = ({ title }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleClick = async () => {
    if (isLoading) return;
    setIsLoading(true);

    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });

    try {
      console.log("Starting Google sign-in...");
      const resultsFromGoogle = await signInWithPopup(auth, provider);
      console.log("Google success:", resultsFromGoogle.user.email);

      const payload = {
        name:
          resultsFromGoogle.user.displayName ||
          resultsFromGoogle.user.email.split("@")[0],
        email: resultsFromGoogle.user.email,
        googlePhotoUrl: resultsFromGoogle.user.photoURL || "",
      };

      console.log(
        "Sending to backend:",
        `${baseUrl}/api/v1/user/google`,
        payload
      );

      const res = await fetch(`${baseUrl}/api/v1/user/google`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Backend response failed:", res.status, errorText);
        throw new Error(`Backend error: ${res.status} - ${errorText}`);
      }

      const data = await res.json();
      console.log("Backend success:", data);

      dispatch(setCredentials(data));
      toast.success("Signed in successfully");
      navigate("/");
    } catch (error) {
      console.error("Google full error:", error);

      let msg = "Google sign-in failed";
      if (error.code === "auth/cancelled-popup-request") {
        msg = "Google sign-in was cancelled";
      } else if (error.code === "auth/popup-blocked") {
        msg = "Popup blocked by the browser";
      } else if (error.message?.includes("404")) {
        msg = "Backend not reachable (404)";
      }

      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      className="bg-blue-600 text-white mx-auto block rounded-md p-2 m-4 justify-center disabled:opacity-50"
      onClick={handleGoogleClick}
      disabled={isLoading}
    >
      {isLoading ? "Loading..." : title}
    </button>
  );
};

export default OAuth;
