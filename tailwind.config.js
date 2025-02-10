/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['selector', '[data-theme="dark"]'],
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        'missive-border-radius': 'var(--missive-border-radius)',
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          1: 'hsl(var(--chart-1))',
          2: 'hsl(var(--chart-2))',
          3: 'hsl(var(--chart-3))',
          4: 'hsl(var(--chart-4))',
          5: 'hsl(var(--chart-5))',
        },
        'missive-background-color': 'var(--missive-background-color)',
        'missive-blue-color': 'var(--missive-blue-color)',
        'rgba-missive-blue-color': 'rgba(var(--blueColorRGB), 0.1)',
        'rgba-missive-no-bg-color': 'rgba(0, 0, 0, 0.1)',
        'missive-light-border-color': 'var(--missive-light-border-color)',
        'missive-conversation-list-background-color':
          'var(--missive-conversation-list-background-color)',
        'missive-text-color-a': 'var(--missive-text-color-a)',
        'missive-text-color-b': 'var(--missive-text-color-b)',
        'missive-text-color-d': 'var(--missive-text-color-d)',
        'missive-text-color-e': 'var(--missive-text-color-e)',
        'rgba-missive-text-color-a': 'rgba(var(--missive-text-color-a), 0.05)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
