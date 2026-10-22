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
      // Typography system — Inter for body copy, Manrope for headings / nav / buttons.
      // `serif` is retained as a legacy alias that now resolves to Manrope, so every
      // existing `font-serif` heading adopts the new heading face automatically.
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        body: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        heading: ['Manrope', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        serif: ['Manrope', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      letterSpacing: {
        heading: '-0.02em',
        display: '-0.035em',
      },
      // Comfortable line-heights for large display sizes (Tailwind defaults these to 1).
      fontSize: {
        '4xl': ['2.25rem', { lineHeight: '1.15' }],
        '5xl': ['3rem', { lineHeight: '1.1' }],
        '6xl': ['3.75rem', { lineHeight: '1.08' }],
        '7xl': ['4.5rem', { lineHeight: '1.05' }],
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
