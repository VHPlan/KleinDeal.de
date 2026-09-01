/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'var(--font-inter)',
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
      },
      colors: {
        ge: {
          bg: '#FFFFFF',
          surface: '#F6F7F4',
          surfaceSec: '#F1F3EE',
          primary: '#171A17',
          primaryHover: '#292E29',
          accent: '#17A673',
          accentHover: '#12835B',
          accentLight: '#E9F7F1',
          textPrimary: '#151815',
          textSecondary: '#68716A',
          border: '#DEE3DE',
          sale: '#D94C3D',
          warning: '#D99A24',
        },
        brand: {
          50: '#e9f7f1',
          100: '#cbeee0',
          500: '#17A673',
          600: '#17A673', // Emerald
          700: '#12835B',
        },
        graphite: {
          800: '#292E29',
          900: '#171A17',
        }
      },
      borderRadius: {
        'lg': '8px',
        'xl': '10px',
        '2xl': '12px',
      },
      boxShadow: {
        'subtle': '0 1px 3px rgba(21, 24, 21, 0.05)',
        'restrained': '0 4px 16px rgba(21, 24, 21, 0.06)',
      }
    },
  },
  plugins: [],
}
