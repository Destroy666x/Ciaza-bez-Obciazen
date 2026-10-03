import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        birch: '#f4efe8',
        blush: '#f6dfe7',
        sage: '#dfeee0',
        plum: '#3a2b64',
        butter: '#f7d773',
        mint: '#72c7a9',
        coral: '#ea7d7d',
      },
      boxShadow: {
        soft: '0 18px 45px rgba(58, 43, 100, 0.12)',
      },
    },
  },
  plugins: [],
};

export default config;
