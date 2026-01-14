import { useTranslation } from "react-i18next";

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLang = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("i18nextLng", lang);
  };

  const current = (i18n.language || "en").slice(0, 2);

  const btn = (active) =>
    `px-3 py-1 rounded-md text-sm font-medium border transition
     ${active
       ? "bg-app-primary text-white border-app-primary"
       : "bg-white text-app-text border-app-border hover:bg-gray-50"}`;

  return (
    <div className="flex items-center gap-2">
      <button onClick={() => changeLang("en")} className={btn(current === "en")}>
        EN
      </button>
      <button onClick={() => changeLang("de")} className={btn(current === "de")}>
        DE
      </button>
    </div>
  );
}
