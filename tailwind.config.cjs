/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        surface: '#faf8ff',
        'surface-dim': '#d2d9f4',
        'surface-bright': '#faf8ff',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#f2f3ff',
        'surface-container': '#eaedff',
        'surface-container-high': '#e2e7ff',
        'surface-container-highest': '#dae2fd',
        'on-surface': '#131b2e',
        'on-surface-variant': '#414845',
        'inverse-surface': '#283044',
        'inverse-on-surface': '#eef0ff',
        outline: '#717975',
        'outline-variant': '#c1c8c4',
        'surface-tint': '#44655b',
        primary: '#44655b',
        'on-primary': '#ffffff',
        'primary-container': '#d1f5e8',
        'on-primary-container': '#517167',
        secondary: '#625f4f',
        'on-secondary': '#ffffff',
        tertiary: '#5e5c6e',
        error: '#ba1a1a',
        'ink-black': '#131b2e',
        background: '#faf8ff',
        'on-background': '#131b2e',

        'secondary-container': '#e5e0cc',
        'on-secondary-container': '#666353',

        'tertiary-container': '#efebff',
        'on-tertiary-container': '#6b697b',

        'primary-fixed': '#c6eadd',
        'primary-fixed-dim': '#abcec2',
      },
      borderRadius: {
        xl: '1.5rem'
      },
      fontFamily: {
  display: ["Plus Jakarta Sans"],
  body: ["Plus Jakarta Sans"],
  reading: ["Literata"]
},

fontSize: {
  display: ["32px", {
    lineHeight: "40px",
    fontWeight: "800"
  }],

  h1: ["24px", {
    lineHeight: "32px",
    fontWeight: "700"
  }],

  h2: ["20px", {
    lineHeight: "28px",
    fontWeight: "700"
  }],

  body: ["16px", {
    lineHeight: "24px",
    fontWeight: "500"
  }],

  small: ["14px", {
    lineHeight: "20px",
    fontWeight: "600"
  }]
}
    },
  },
  plugins: [],
}
