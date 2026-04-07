/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#22d3ee',
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0c4a6e',
          800: '#075985',
          900: '#0c4a6e',
        },
      },
      animation: {
        'role-spin': 'role-spin 12s infinite',
      },
      keyframes: {
        'role-spin': {
          '0%, 14%': { transform: 'translateY(0%)' },
          '16%, 31%': { transform: 'translateY(-14.28%)' },
          '33%, 48%': { transform: 'translateY(-28.57%)' },
          '50%, 65%': { transform: 'translateY(-42.85%)' },
          '66%, 81%': { transform: 'translateY(-57.14%)' },
          '83%, 98%': { transform: 'translateY(-71.42%)' },
          '100%': { transform: 'translateY(-85.71%)' },
        }
      }
    },
  },
  plugins: [],
}
