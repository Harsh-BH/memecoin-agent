/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
        roboto: ['Roboto Mono', 'monospace'],
      },
      keyframes: {
        fadeInDown: {
          '0%': { opacity: 0, transform: 'translateY(-20px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        fadeInUp: {
          '0%': { opacity: 0, transform: 'translateY(20px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        neonGlow: {
          '0%, 100%': {
            textShadow: '0 0 10px #fff, 0 0 20px #ff00de, 0 0 30px #ff00de',
          },
          '50%': {
            textShadow: '0 0 20px #fff, 0 0 30px #ff00de, 0 0 40px #ff00de',
          },
        },
        fadeOut: {
          '0%': { opacity: 0.7, transform: 'scale(1)' },
          '100%': { opacity: 0, transform: 'scale(2)' },
        },
        slide: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-200px)' },
        },
      },
      animation: {
        fadeInDown: 'fadeInDown 1s ease-out',
        fadeInUp: 'fadeInUp 1s ease-out',
        neonGlow: 'neonGlow 2s ease-in-out infinite',
        spinSlow: 'spinSlow 20s linear infinite',
        fadeOut: 'fadeOut 0.8s ease-out forwards',
        slide: 'slide 30s linear infinite',
      },
    },
  },
  plugins: [],
};
