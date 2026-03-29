/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0A1628',
          50: '#E8EDF5',
          100: '#D1DBEB',
          200: '#A3B7D7',
          300: '#7593C3',
          400: '#476FAF',
          500: '#1A3A6B',
          600: '#152F56',
          700: '#102441',
          800: '#0A1628',
          900: '#050B14',
        },
        accent: {
          DEFAULT: '#00C896',
          50: '#E6FFF7',
          100: '#CCFFEF',
          200: '#99FFE0',
          300: '#66FFD0',
          400: '#33FFC1',
          500: '#00C896',
          600: '#00A87E',
          700: '#008866',
          800: '#00684E',
          900: '#004836',
        },
        blue: {
          DEFAULT: '#1A3A6B',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-gradient': 'linear-gradient(135deg, #0A1628 0%, #1A3A6B 50%, #0A1628 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(0, 200, 150, 0.3)' },
          '50%': { boxShadow: '0 0 20px rgba(0, 200, 150, 0.6)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}
