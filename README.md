# Outlier TXT Frontends

## Set up locally

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

Test app:
```sh
npm run test
```

In order to have https to work with Missive, we need Caddy:
```sh
caddy run
```

## Deployment
The app is auto-deployed to S3 with Github action. More detail could be found on `.github/` directory.
