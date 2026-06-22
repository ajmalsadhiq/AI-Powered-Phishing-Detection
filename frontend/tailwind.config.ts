import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0f172a',
        paper: '#f8fafc',
        alert: '#ef4444',
        safe: '#16a34a',
      },
      boxShadow: {
        halo: '0 20px 80px rgba(15, 23, 42, 0.18)',
      },
      backgroundImage: {
        'aurora': 'radial-gradient(circle at top left, rgba(59,130,246,0.25), transparent 30%), radial-gradient(circle at top right, rgba(34,197,94,0.18), transparent 28%), linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)',
      },
    },
  },
  plugins: [],
};

export default config;
