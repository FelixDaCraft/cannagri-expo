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
        // Charte graphique Cann'Agri Expo 2027, reprise de l'affiche des 5 ans
        // (bleu nuit, crème, or du trophée, vert de la mascotte)

        // Or du trophée de l'affiche 2027 (accent ; noms historiques mint/sage conservés)
        mint: {
          DEFAULT: '#C9A04A',
          50: '#FBF7F1',
          100: '#F6F0E2',
          200: '#EDDFC1',
          300: '#E3CEA1',
          400: '#D6B775',
          500: '#C9A04A',
          600: '#A5833D',
          700: '#81662F',
          800: '#5C4A22',
          900: '#382D15',
        },
        // Bleu nuit du fond de l'affiche 2027 (nom historique forest conservé)
        forest: {
          DEFAULT: '#1D2B3A',
          50: '#EDEEEF',
          100: '#DBDDDF',
          200: '#B2B7BC',
          300: '#899199',
          400: '#535E69',
          500: '#1D2B3A',
          600: '#182330',
          700: '#131C25',
          800: '#0D141B',
          900: '#080C10',
        },
        // Crème du texte de l'affiche 2027
        cream: {
          DEFAULT: '#F4EAD5',
          50: '#FFFFFF',
          100: '#FBF7EE',
          200: '#F4EAD5',
          300: '#E9DCC0',
          400: '#DECDAA',
          500: '#D3BF95',
          600: '#C8B080',
          700: '#BDA26B',
          800: '#9E8653',
          900: '#7F6B42',
        },
        // Vert de la mascotte, accent secondaire (nom historique terracotta conservé)
        terracotta: {
          DEFAULT: '#5E8F62',
          50: '#F2F6F2',
          100: '#E5EDE6',
          200: '#C8D9CA',
          300: '#ABC5AD',
          400: '#85AA88',
          500: '#5E8F62',
          600: '#4D7550',
          700: '#3C5C3F',
          800: '#2B422D',
          900: '#1A281B',
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
          DEFAULT: '#C9A04A',
          50: '#FBF7F1',
          100: '#F6F0E2',
          200: '#EDDFC1',
          300: '#E3CEA1',
          400: '#D6B775',
          500: '#C9A04A',
          600: '#A5833D',
          700: '#81662F',
          800: '#5C4A22',
          900: '#382D15',
        },
        // Textes
        body: '#333333',
        heading: '#1D2B3A',
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
