/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],

  // --- THIS IS THE NEW PART THAT FIXES YOUR COLORS ---
  safelist: [
    'bg-gradient-to-r',
    'from-blue-500',
    'to-indigo-500',
    'from-orange-500',
    'to-amber-500',
    'from-yellow-400',
    'to-yellow-600',
    'from-purple-500',
    'to-fuchsia-500',
    'from-lime-500',
    'to-green-500',
    'from-rose-500',
    'to-red-500',
    // Also adding the hardcoded ones from your FeaturedProducts page to be safe
    'from-green-500',
    'to-emerald-500',
    'from-luxury-gold',
    'to-luxury-gold-light',
    'from-red-500',
    'to-rose-500',
    'from-luxury-sage',
    'to-luxury-sage-dark',
  ],
  // ----------------------------------------------------

  theme: {
    extend: {
      // ✅ MERGED Keyframes
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },

      // ✅ MERGED Animations
      animation: {
        shimmer: 'shimmer 10s linear infinite',
        float: 'float 3s ease-in-out infinite',
        'slide-up': 'slideUp 0.5s ease-out',
        'fade-in': 'fade-in 0.5s ease-out forwards',
      },

      // Font families
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'], // Luxury Dry Fruits
        display: ['Poppins', 'sans-serif', 'Cinzel', 'serif'], // Premium
        tamoor: ['Inter', 'sans-serif', 'Playfair Display', 'serif'], // TAMOOR

        // Decorative / Premium Fonts
        pacifico: ['Pacifico', 'cursive'],
        dancing: ['Dancing Script', 'cursive'],
        satisfy: ['Satisfy', 'cursive'],
        vibes: ['Great Vibes', 'cursive'],
        allura: ['Allura', 'cursive'],
        lobster: ['Lobster', 'cursive'],
        cookie: ['Cookie', 'cursive'],
        eagle: ['Eagle Lake', 'cursive'],
        shizuru: ['Shizuru', 'cursive'],
        kablammo: ['Kablammo', 'cursive'],
        rubikdirt: ['Rubik Dirt', 'cursive'],
        rubikpuddles: ['Rubik Puddles', 'cursive'],
        butcherman: ['Butcherman', 'cursive'],
        chokokutai: ['Chokokutai', 'cursive'],
        hennypenny: ['Henny Penny', 'cursive'],
        fontdiner: ['Fontdiner Swanky', 'cursive'],
        chicle: ['Chicle', 'cursive'],
        tradewinds: ['Trade Winds', 'cursive'],
        ribeye: ['Ribeye', 'cursive'],
        federant: ['Federant', 'cursive'],
        michroma: ['Michroma', 'sans-serif'],
        indie: ['Indie Flower', 'cursive'],
        marker: ['Permanent Marker', 'cursive'],
        rye: ['Rye', 'cursive'],
        mashan: ['Ma Shan Zheng', 'cursive'],
        calligrafitti: ['Calligrafitti', 'cursive'],
        fleur: ['Fleur De Leah', 'cursive'],
        imperial: ['Imperial Script', 'cursive'],
      },

      // Colors
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
          red: '#ff4d4d',
          'red-mid': '#ff1a1a',
          'red-dark': '#b30000',
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
        },
      },

      // Backdrop blur
      backdropBlur: {
        xs: '2px',
      },

      // Box shadows
      boxShadow: {
        luxury: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'luxury-lg': '0 35px 60px -12px rgba(0, 0, 0, 0.3)',
        neomorphism: '20px 20px 60px #d1d4d4, -20px -20px 60px #ffffff',
        'neomorphism-inset': 'inset 20px 20px 60px #d1d4d4, inset -20px -20px 60px #ffffff',
      },
    },
  },
  plugins: [],
};