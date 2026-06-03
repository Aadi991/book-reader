# Book Reader — Monorepo Scaffold

Bootstrap the workspace (requires pnpm):

```bash
pnpm -w install
pnpm -w run format
```

Structure:

- apps/mobile — React Native (scaffold placeholder)
- apps/desktop — Electron (scaffold placeholder)
- src/features — feature-first application code (auth, library, reader, settings)

Notes:
# This scaffold uses a feature-first structure inside `src/features`. To run the web app in this repo, use the existing `dev` script (Vite) at the root.
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, strong linting and formatting are recommended. This repo is intentionally JavaScript-only; no TypeScript is configured.
# book-reader
