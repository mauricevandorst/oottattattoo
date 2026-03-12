/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#ffffff",
        accent: "#C6A45A",
        surface: "#F4F4F2",
        muted: "#D6D6D6",
        charcoal: "#2B2B2B",
        wood: "#A6855E",
      },
      fontFamily: {
        display: ['"Bebas Neue"', "sans-serif"],
        sans: ['"Montserrat"', "sans-serif"],
        montserrat: ['"Montserrat"', "sans-serif"],
      },
      keyframes: {
        fadeInUp: {
          "0%": { opacity: "0", transform: "translate3d(0, 12px, 0)" },
          "100%": { opacity: "1", transform: "translate3d(0, 0, 0)" },
        },
        fadeInDown: {
          "0%": { opacity: "0", transform: "translate3d(0, -8px, 0)" },
          "100%": { opacity: "1", transform: "translate3d(0, 0, 0)" },
        },
        marquee: {
          from: { transform: "translateX(0%)" },
          to: { transform: "translateX(-50%)" },
        },
        spinSlow: {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        logoSwapA: {
          "0%": { transform: "translateX(0)" },
          "50%": { transform: "translateX(0)" },
          "56%": { transform: "translateX(-100%)" },
          "62.25%": { transform: "translateX(-100%)" },
          "68.25%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(0)" },
        },
        logoSwapB: {
          "0%": { transform: "translateX(100%)" },
          "50%": { transform: "translateX(100%)" },
          "56%": { transform: "translateX(0)" },
          "62.25%": { transform: "translateX(0)" },
          "68.25%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        logoEdgeLeft: {
          "0%": { opacity: "0" },
          "50%": { opacity: "0" },
          "53%": { opacity: "1" },
          "58%": { opacity: "0" },
          "100%": { opacity: "0" },
        },
        logoEdgeRight: {
          "0%": { opacity: "0" },
          "62.25%": { opacity: "0" },
          "64.75%": { opacity: "1" },
          "69.75%": { opacity: "0" },
          "100%": { opacity: "0" },
        },
      },
      animation: {
        fadeInUp: "fadeInUp 0.9s ease-out both",
        fadeInUp200: "fadeInUp 0.9s ease-out 0.2s both",
        fadeInUp400: "fadeInUp 0.9s ease-out 0.4s both",
        fadeInUp600: "fadeInUp 0.9s ease-out 0.6s both",
        fadeInUp700: "fadeInUp 0.9s ease-out 0.7s both",
        fadeInUp800: "fadeInUp 0.9s ease-out 0.8s both",
        fadeInUp900: "fadeInUp 0.9s ease-out 0.9s both",
        fadeInUp1100: "fadeInUp 0.9s ease-out 0.9s both",
        fadeInDown: "fadeInDown 0.6s ease-out both",
        marquee: "marquee 30s linear infinite",
        spinSlow: "spinSlow 60s linear infinite",
        logoSwapA: "logoSwapA 16s ease-in-out infinite",
        logoSwapB: "logoSwapB 16s ease-in-out infinite",
        logoEdgeLeft: "logoEdgeLeft 16s ease-in-out infinite",
        logoEdgeRight: "logoEdgeRight 16s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
