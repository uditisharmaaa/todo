/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        baraka: {
          bg: "#000000",
          panel: "rgba(255,255,255,0.04)",
          panelHover: "rgba(255,255,255,0.06)",
          border: "rgba(255,255,255,0.10)",
          borderStrong: "rgba(255,255,255,0.16)",
          text: "rgba(255,255,255,0.92)",
          muted: "rgba(255,255,255,0.60)",
          dim: "rgba(255,255,255,0.45)",
          success: "#22c55e",
          danger: "#fb7185",
        },
      },
      boxShadow: {
        panel: "0 20px 70px rgba(0,0,0,0.75)",
      },
      borderRadius: {
        xl2: "22px",
      },
    },
  },
  plugins: [],
};
