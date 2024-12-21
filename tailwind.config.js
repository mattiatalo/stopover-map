/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      boxShadow: {
        'round': '0px 0px 8px rgba(0, 0, 0, 0.2)',
      }
    },
  },
  plugins: [],
}