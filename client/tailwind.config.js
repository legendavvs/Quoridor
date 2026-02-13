/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        board: '#1e293b', // Темний фон дошки
        cell: '#334155',  // Колір клітинки
        p1: '#06b6d4',    // Гравець 1 (Cyan)
        p2: '#f43f5e',    // Гравець 2 (Rose)
        wall: '#f59e0b',  // Стінка (Amber)
      }
    },
  },
  plugins: [],
}