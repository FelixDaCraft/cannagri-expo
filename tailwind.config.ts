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
        // Nouvelle charte graphique Cann'Agri Expo 2026
        // Basée sur l'affiche officielle

        // Vert menthe/sage du fond de l'affiche
        mint: {
          DEFAULT: '#8FB58B',
          50: '#F2F6F1',
          100: '#E5EDE4',
          200: '#CBDBC8',
          300: '#B1C9AD',
          400: '#97B791',
          500: '#8FB58B',
          600: '#739A6E',
          700: '#5A7956',
          800: '#42593F',
          900: '#2A3928',
        },
        // Vert forêt foncé des feuilles
        forest: {
          DEFAULT: '#3D5A45',
          50: '#E9EDEA',
          100: '#D3DBD5',
          200: '#A7B7AB',
          300: '#7B9381',
          400: '#4F6F57',
          500: '#3D5A45',
          600: '#314938',
          700: '#25382A',
          800: '#19261D',
          900: '#0D150F',
        },
        // Crème/beige clair
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
        // Terracotta/marron du pot
        terracotta: {
          DEFAULT: '#C4784A',
          50: '#F8F0EB',
          100: '#F1E1D7',
          200: '#E3C3AF',
          300: '#D5A587',
          400: '#C7875F',
          500: '#C4784A',
          600: '#A6623B',
          700: '#834D2E',
          800: '#603922',
          900: '#3D2415',
        },
        // Bois/marron des panneaux
        wood: {
          DEFAULT: '#8B7355',
          50: '#F3F0ED',
          100: '#E7E1DB',
          200: '#CFC3B7',
          300: '#B7A593',
          400: '#9F876F',
          500: '#8B7355',
          600: '#6F5C44',
          700: '#534533',
          800: '#372E22',
          900: '#1B1711',
        },
        // Alias sage pour rétrocompatibilité (= mint)
        sage: {
          DEFAULT: '#8FB58B',
          50: '#F2F6F1',
          100: '#E5EDE4',
          200: '#CBDBC8',
          300: '#B1C9AD',
          400: '#97B791',
          500: '#8FB58B',
          600: '#739A6E',
          700: '#5A7956',
          800: '#42593F',
          900: '#2A3928',
        },
        // Textes
        body: '#333333',
        heading: '#3D5A45',
      },
      fontFamily: {
        heading: ['var(--font-roboto-slab)', 'Roboto Slab', 'serif'],
        body: ['var(--font-open-sans)', 'Open Sans', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
        'bounce-slow': 'bounce 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
export default config
