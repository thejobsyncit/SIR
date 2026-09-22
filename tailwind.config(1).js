/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#060d19',
          900: '#0a192f',
          800: '#0f2744',
          700: '#15365e',
          600: '#1d487c',
          500: '#2b5f9e',
        },
        liteblue: {
          50: '#f4f9ff',
          100: '#e8f3ff',
          200: '#d5e8ff',
          300: '#b2d7ff',
          400: '#80bdff',
          500: '#4a9cff',
        },
        gold: {
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#d4af37',
          600: '#b89228',
          700: '#8f6f19',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        serif: ['Playfair Display', 'Merriweather', 'serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(15, 23, 42, 0.08)',
        'glass-gold': '0 8px 32px 0 rgba(212, 175, 55, 0.15)',
        'luxury': '0 20px 50px rgba(10, 25, 47, 0.12)',
        'gold-glow': '0 0 20px rgba(212, 175, 55, 0.4)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gold-shimmer': 'linear-gradient(135deg, #d4af37 0%, #fef08a 50%, #b89228 100%)',
        'navy-gradient': 'linear-gradient(135deg, #0a192f 0%, #0f2744 100%)',
        'emerald-gradient': 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      }
    },
  },
  plugins: [],
}
