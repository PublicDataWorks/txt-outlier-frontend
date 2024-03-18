const defaultConfig = require('tailwindcss/defaultConfig')

/** @type {import('tailwindcss/types').Config} */
const config = {
  content: ['index.html', 'src/**/*.tsx'],
  theme: {
    fontFamily: {
      sans: ['Inter', ...defaultConfig.theme.fontFamily.sans]
    },
    extend: {
      colors: {
        'missive-background-color': 'var(--missive-background-color)',
        'missive-blue-color': 'var(--missive-blue-color)',
        'rgba-missive-blue-color': 'rgba(var(--blueColorRGB), 0.1)',
        'rgba-missive-no-bg-color': 'rgba(0, 0, 0, 0.1)',
        'missive-light-border-color': 'var(--missive-light-border-color)',
        'missive-border-radius': 'var(--missive-border-radius)',
        'missive-conversation-list-background-color': 'var(--missive-conversation-list-background-color)',
        'missive-text-color-a': 'var(--missive-text-color-a)',
        'rgba-missive-text-color-a': 'rgba(var(--missive-text-color-a), 0.05)',
        'missive-text-color-d': 'var(--missive-text-color-d)',
        'missive-text-color-e': 'var(--missive-text-color-e)'
      }
    }
  }
}
module.exports = config
