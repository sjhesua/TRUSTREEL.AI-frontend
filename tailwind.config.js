/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
     'node_modules/flowbite-react/lib/esm/**/*.js',
  ],
  theme: {
    extend: {
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
      colors: {
        primary: {
          50: '#f5faff',
          100: '#e0f2ff',
          200: '#b3e1ff',
          300: '#80ccff',
          400: '#4db8ff',
          500: '#1aa3ff',
          600: '#008ae6',
          700: '#006bb3',
          800: '#004d80',
          900: '#002e4d',
        },
      },
    },
  },
  plugins: [require('flowbite/plugin')],
}