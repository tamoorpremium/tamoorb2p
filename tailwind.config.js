/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Inter', 'sans-serif'],
        'display': ['Poppins', 'sans-serif'],
      },
      colors: {
        luxury: {
          gold: '#d4af37',
          'gold-light': '#ffd700',
          'gold-dark': '#b8860b',
          cream: '#faf8f3',
          'cream-dark': '#f5f2ed',
          sage: '#87a96b',
          'sage-dark': '#6b8e4e',
          charcoal: '#2c2c2c',
          'charcoal-light': '#404040',
        },
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          150: '#f0f0f0',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        }
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite',
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'luxury': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'luxury-lg': '0 35px 60px -12px rgba(0, 0, 0, 0.3)',
        'neomorphism': '20px 20px 60px #d1d1d4, -20px -20px 60px #ffffff',
        'neomorphism-inset': 'inset 20px 20px 60px #d1d1d4, inset -20px -20px 60px #ffffff',
      }
    },
  },
  plugins: [],
};