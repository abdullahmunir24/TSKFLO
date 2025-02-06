/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      animation: {
        background: 'moveBackground 10s infinite linear',  // Adding the background animation
      },
      keyframes: {
        moveBackground: {
          '0%': { backgroundPosition: '0 0' },   // Starting position of the background
          '100%': { backgroundPosition: '100% 100%' },  // Ending position of the background
        },
      },
    },
  },
  plugins: [],
};
