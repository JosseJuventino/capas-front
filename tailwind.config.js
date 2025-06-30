import { heroui } from "@heroui/react";

const config = {
  darkMode: "class", // Activa el modo oscuro basado en una clase
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        blue_principal: "#003C71",
        beige_secondary: "#CC9E13",
      },
    },
  },
  darkMode: "class",
  plugins: [ heroui() ],
};

export default config;