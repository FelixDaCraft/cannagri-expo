import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Couleurs primaires Cann'Agri Expo
        forest: {
          DEFAULT: '#2E4A33',
          50: '#E8EDE9',
          100: '#D1DBD3',
          200: '#A3B7A7',
          300: '#75937B',
          400: '#476F4F',
          500: '#2E4A33',
          600: '#253C2A',
          700: '#1C2D20',
          800: '#131F16',
          900: '#0A100B',
        },
        sage: {
          DEFAULT: '#A4B494',
          50: '#F5F7F3',
          100: '#EBEFE7',
          200: '#D7DFCF',
          300: '#C3CFB7',
          400: '#AFbF9F',
          500: '#A4B494',
          600: '#8A9D7A',
          700: '#6F8260',
          800: '#556648',
          900: '#3C4933',
        },
        cream: {
          DEFAULT: '#F4F1E8',
          50: '#FFFFFF',
          100: '#FAF9F6',
          200: '#F4F1E8',
          300: '#E8E2D1',
          400: '#DCD3BA',
          500: '#D0C4A3',
          600: '#C4B58C',
          700: '#B8A675',
          800: '#9C8D5E',
          900: '#7F7349',
        },
        // Textes
        body: '#333333',
        heading: '#2E4A33',
      },
      fontFamily: {
        heading: ['var(--font-roboto-slab)', 'Roboto Slab', 'serif'],
        body: ['var(--font-open-sans)', 'Open Sans', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
export default config
