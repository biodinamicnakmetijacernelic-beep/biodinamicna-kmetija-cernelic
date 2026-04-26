/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./pages/**/*.{ts,tsx}",
    "./utils/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        olive: {
          DEFAULT: '#3A4D39',
          light: '#4F6F4E',
          dark: '#1A2619',
        },
        cream: {
          DEFAULT: '#F5F5F7',
          light: '#FFFFFF',
          dark: '#E5E5E5',
        },
        terracotta: '#Cca43b',
      },
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
      borderRadius: {
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
  ],
}
