/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        aira: {
          snow: "#F4FAFF",
          frost: "#E4EEF8",
          ice: "#C5DDF0",
          iceLight: "#EAF3FB",
          navy: "#0F2744",
          navySoft: "#1A3A5C",
        },
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "system-ui", "sans-serif"],
        display: ["var(--font-jakarta)", "system-ui", "sans-serif"],
        elegant: ["var(--font-elegant)", "Times New Roman", "serif"],
      },
    },
  },
  plugins: [],
};
