/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        app: {
          bg: "#f8fafc",
          surface: "#ffffff",
          text: "#0f172a",
          muted: "#64748b",
          border: "#e5e7eb",

          primary: "#2563eb",
          primaryHover: "#1d4ed8",

          success: "#22c55e",
          warning: "#f59e0b",
          danger: "#ef4444",
        },
      },
      boxShadow: {
        soft: "0 8px 30px rgba(0,0,0,0.06)",
        card: "0 4px 20px rgba(0,0,0,0.06)",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
      },
    },
  },
  plugins: [],
};
