import { Outlet } from "react-router";
import Header from "./components/Header";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Notification from "./components/Notification/Notification";
import { useState } from "react";
import { useTranslation } from "react-i18next";

function App() {
  const { t } = useTranslation();
  const [showNotification, setShowNotification] = useState(true);

  const handleClose = () => setShowNotification(false);
  const message = t("messages.freeHostingNotice", { defaultValue: "" });

  return (
    <div className="min-h-screen flex flex-col bg-app-bg text-app-text">
      {showNotification && message && (
        <Notification message={message} onClose={handleClose} />
      )}

      <ToastContainer position="top-right" autoClose={2500} />

     
      <Header />

    
      <main className="flex-1">
        <div className="mx-auto w-full max-w-6xl px-4 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default App;
