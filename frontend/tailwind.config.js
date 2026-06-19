/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/hooks/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {
    extend: {
      colors: {
        primary: "#b8964e",
        primaryLight: "#d4ae6e",
        darkGreen: "#1e3a2f",
        green: "#2d5a42",
        cream: "#faf7f2",
        warmWhite: "#f5f1eb",
      },

      fontFamily: {
        heading: ["Cormorant Garamond", "serif"],
        body: ["Montserrat", "sans-serif"],
      },

      boxShadow: {
        luxury:
          "0 10px 30px rgba(0,0,0,0.08)",
      },
    },
  },

  plugins: [],
};