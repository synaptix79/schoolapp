import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        // Paleta de marca extendida (tokens centralizados, sin colores sueltos en componentes)
        canaan: {
          primary: 'rgb(var(--azul-primario-rgb) / <alpha-value>)',
          celeste: 'rgb(var(--celeste-rgb) / <alpha-value>)',
          'celeste-claro': 'rgb(var(--celeste-claro-rgb) / <alpha-value>)',
          'celeste-suave': 'rgb(var(--celeste-suave-rgb) / <alpha-value>)',
          blanco: 'rgb(var(--blanco-rgb) / <alpha-value>)',
          fondo: 'rgb(var(--fondo-rgb) / <alpha-value>)',
          texto: 'rgb(var(--texto-rgb) / <alpha-value>)',
          'texto-suave': 'rgb(var(--texto-suave-rgb) / <alpha-value>)',
          borde: 'rgb(var(--borde-rgb) / <alpha-value>)',
          alerta: 'rgb(var(--alerta-rgb) / <alpha-value>)',
          'alerta-suave': 'rgb(var(--alerta-suave-rgb) / <alpha-value>)'
        }
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        xl: 'calc(var(--radius) + 4px)',
        '2xl': 'calc(var(--radius) + 8px)',
        '3xl': 'calc(var(--radius) + 16px)'
      },
      boxShadow: {
        soft: 'var(--shadow-soft)',
        panel: 'var(--shadow-panel)'
      }
    }
  },
  plugins: []
};

export default config;
