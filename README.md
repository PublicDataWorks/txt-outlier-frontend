# Outlier TXT Frontends

## Set up localy

Run this command to copy `.env` file from `.env.example`:
```sh
cp ./.env.example ./.env
```

Install dependencies:
```sh
npm i
```

Start app in dev mode:
```sh
npm run dev
```

In order to have https to work with Missive, we need Caddy:
```sh
caddy run
```
