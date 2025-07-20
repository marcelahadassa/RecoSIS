/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Inter', 'sans-serif'],
        'display': ['Lilita One', 'cursive'],
      },
      colors: {
        'main': '#C54273',
        // 'secondary': '#E18AAA', // Descomente se ainda estiver a usar
      },
      // --- ADICIONE ESTE BLOCO ---
      // Dentro de theme: { extend: { ... } }
      keyframes: {
        fall: {
          '0%': { transform: 'translateY(-200px)', opacity: '1' }, // Começa BEM ACIMA do ecrã
          '100%': { transform: 'translateY(calc(100vh + 200px))', opacity: '0' }, // Termina BEM EMBAIXO do ecrã
        }
      },
      animation: {
        fall: 'fall linear infinite',
      }
      // --- FIM DO BLOCO ---
    },
  },
  plugins: [],
}