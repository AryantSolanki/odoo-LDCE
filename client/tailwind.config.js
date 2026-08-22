/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        travel: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        brand: {
          50: '#F9F8F6', // Warm ivory
          100: '#F2EFE9', // Soft cream
          200: '#E6E0D4',
          300: '#D9CFC0',
          400: '#C7B7A3', // Accent neutral
          500: '#B09E86',
          600: '#8A7B66',
          700: '#665A4B',
          800: '#40382E',
          900: '#26211C', // Almost black editorial text
          950: '#14120F',
        },
        surface: {
          ground: '#FDFBF7', // Very light warm background
          card: '#FFFFFF',
          sidebar: '#14120F',
          border: '#E6E0D4',
          hover: '#F2EFE9',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
        editorial: ['"Playfair Display"', 'Georgia', 'serif'], // Luxury editorial font
      },
      borderRadius: {
        'sm': '0.5rem',     // 8px
        'md': '0.875rem',   // 14px (small controls)
        'lg': '1.125rem',   // 18px (standard cards)
        'xl': '1.5rem',     // 24px (standard cards)
        '2xl': '2rem',      // 32px (large feature cards)
        '3xl': '2.5rem',    // 40px (hero sections)
        '4xl': '3rem',      // 48px
      },
      boxShadow: {
        'subtle': '0 4px 20px -2px rgba(20, 18, 15, 0.05)',
        'card': '0 8px 30px -4px rgba(20, 18, 15, 0.08)',
        'card-hover': '0 20px 40px -4px rgba(20, 18, 15, 0.12)',
        'dropdown': '0 10px 15px -3px rgba(20, 18, 15, 0.1)',
        'modal': '0 25px 50px -12px rgba(20, 18, 15, 0.25)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-down': 'slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-subtle': 'pulseSubtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        }
      }
    },
  },
  plugins: [],
};
