/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': 'var(--bg-primary)',
        'bg-secondary': 'var(--bg-secondary)',
        'bg-card': 'var(--bg-card)',
        'bg-card-hover': 'var(--bg-card-hover)',
        'bg-glass': 'var(--bg-glass)',
        'bg-input': 'var(--bg-input)',
        
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
        
        'accent-blue': 'var(--accent-blue)',
        'accent-blue-light': 'var(--accent-blue-light)',
        'accent-red': 'var(--accent-red)',
        'accent-red-light': 'var(--accent-red-light)',
        'accent-green': 'var(--accent-green)',
        'accent-yellow': 'var(--accent-yellow)',
        'accent-purple': 'var(--accent-purple)',
        'accent-indigo': 'var(--accent-indigo)',
        
        'border': 'var(--border)',
        'border-hover': 'var(--border-hover)',
      },
      borderRadius: {
        'sm': 'var(--radius-sm)',
        'md': 'var(--radius-md)',
        'lg': 'var(--radius-lg)',
        'xl': 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
      },
      boxShadow: {
        'sm': 'var(--shadow-sm)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
        'blue': 'var(--shadow-blue)',
        'glow': 'var(--shadow-glow)',
      },
      fontFamily: {
        'cairo': ['Cairo', 'sans-serif'],
        'ibm': ['IBM Plex Sans Arabic', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
