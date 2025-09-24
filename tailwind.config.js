/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      keyframes: {
        'slide-in-from-right': { '0%': { transform: 'translateX(100%)' }, '100%': { transform: 'translateX(0)' } },
        'slide-out-to-right': { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(100%)' } },
        'slide-in-from-left': { '0%': { transform: 'translateX(-100%)' }, '100%': { transform: 'translateX(0)' } },
        'slide-out-to-left': { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-100%)' } },
        'slide-in-from-bottom': { '0%': { transform: 'translateY(100%)' }, '100%': { transform: 'translateY(0)' } },
        'slide-out-to-bottom': { '0%': { transform: 'translateY(0)' }, '100%': { transform: 'translateY(100%)' } },
        'slide-in-from-top': { '0%': { transform: 'translateY(-100%)' }, '100%': { transform: 'translateY(0)' } },
        'slide-out-to-top': { '0%': { transform: 'translateY(0)' }, '100%': { transform: 'translateY(-100%)' } },
        'fade-in': { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        'fade-out': { '0%': { opacity: '1' }, '100%': { opacity: '0' } },
      },
      animation: {
        'slide-in-from-right': 'slide-in-from-right 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-out-to-right': 'slide-out-to-right 0.3s cubic-bezier(0.4, 0, 1, 1)',
        'slide-in-from-left': 'slide-in-from-left 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-out-to-left': 'slide-out-to-left 0.3s cubic-bezier(0.4, 0, 1, 1)',
        'slide-in-from-bottom': 'slide-in-from-bottom 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-out-to-bottom': 'slide-out-to-bottom 0.3s cubic-bezier(0.4, 0, 1, 1)',
        'slide-in-from-top': 'slide-in-from-top 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-out-to-top': 'slide-out-to-top 0.3s cubic-bezier(0.4, 0, 1, 1)',
        'fade-in': 'fade-in 0.2s ease-out',
        'fade-out': 'fade-out 0.2s ease-in',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
