/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ["./index.html","./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#040814', 900: '#070C1A', 800: '#0B132B',
          700: '#1C2541', 600: '#2A3B66', 500: '#3A5080',
        },
        gold: {
          300: '#FDE68A', 400: '#FBBF24', 500: '#F59E0B',
          600: '#D97706', 700: '#B45309',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        body:  ['Lora', 'Georgia', 'serif'],
        sans:  ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
