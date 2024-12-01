import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    screens: {
      ti: "360px",
      sm: "480px",
      md: "740px",
      lg: "1280px",
    },
    extend: {
      transitionProperty: {
        height: "height",
      },
      height: {
        default: "36px",
      },
      colors: {
        darkText: {
          1: "#a1a1a1",
          2: "#ededed",
        },
        lightText: {
          1: "#666666",
          2: "#171717",
        },
        darkBorder: {
          1: "#333333",
        },
        lightBorder: {
          1: "#eaeaea",
        },
        darkBtn: {
          1: "#242424",
        },
        lightBtn: {
          1: "#f2f2f2",
        },
      },
      keyframes: {
        "fade-in": {
          from: {
            opacity: "1",
          },
          to: {
            opacity: "0",
          },
        },
      },
      animation: {
        "fade-in": "fade-in 1.5s ease-out ",
      },
    },
  },
  plugins: [
    require("flowbite/plugin"),
    require("tailwind-scrollbar-hide"),
    require("tailwindcss-animated"),
  ],
};
export default config;
