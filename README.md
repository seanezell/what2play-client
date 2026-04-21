# What 2 Play Client

React single-page app for the What 2 Play experience: games, friends, groups, and picks, backed by the services API and Cognito authentication.

## Project Breadcrumbs

What 2 Play is split across multiple repos with distinct responsibilities:

- [`what2play`](https://github.com/seanezell/what2play): pseudo-parent repo for high-level docs and portfolio entrypoint
- [`what2play-infrastructure`](https://github.com/seanezell/what2play-infrastructure): Terraform-managed shared AWS infrastructure (hosting edge, auth, DNS, post-confirmation Lambda, deploy access)
- [`what2play-services`](https://github.com/seanezell/what2play-services): API Gateway + application Lambdas + service data resources
- [`what2play-client`](https://github.com/seanezell/what2play-client) (this repo): React web app

## What This Repo Owns

- Vite + React + Tailwind UI for signed-in flows (dashboard, games, friends, groups) and Cognito-hosted login redirect
- API access via `src/api.js` (`apiCall`) and route constants in `src/constants.js`
- Production build artifacts deployed to S3 with CloudFront cache invalidation via GitHub Actions

## Repository Structure

- `src/` — application entry (`index.jsx`, `App.jsx`), auth (`auth.js`), API client (`api.js`), constants, `components/`, `utils/`, `hooks/`, tests under `src/**/*.test.js`
- `vite.config.js` — Vite + React plugin; Vitest test config
- `tailwind.config.js`, `postcss.config.js` — styling
- `.github/workflows/deploy.yml` — deploy on push to `main`
- `.github/workflows/ci.yml` — unit tests on pull requests
- `.cursor/rules/` — Cursor agent rules for this repo
- `working-instructions/` — review notes and cross-repo convention snippets

## Deployment and CI

**Deploy** ([`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)):

- Triggers on push to `main`
- Node.js 22, `npm install`, `npm run build`
- AWS OIDC credentials, `aws s3 sync` of `dist/` to the configured bucket, CloudFront invalidation `/*`

Configure repository secrets: `AWS_ROLE_ARN`, `S3_BUCKET_NAME`, `CLOUDFRONT_DISTRIBUTION_ID` (aligned with outputs from [`what2play-infrastructure`](https://github.com/seanezell/what2play-infrastructure)).

**CI** ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)):

- Runs `npm ci` and `npm run test:run` on pull requests that touch client source or config

## Local Development

```bash
npm install
npm run dev
```

**Environment variables** (e.g. `.env.local`; prefix `VITE_` for Vite exposure):

| Variable | Purpose |
|----------|---------|
| `VITE_COGNITO_DOMAIN` | Cognito hosted UI domain (no `https://`) |
| `VITE_COGNITO_CLIENT_ID` | Cognito app client ID |
| `VITE_COGNITO_REDIRECT_URI` | OAuth redirect URL registered on the app client |

The API base URL is defined in [`src/constants.js`](src/constants.js); overriding via env is a possible follow-up.

**Tests:**

```bash
npm run test      # watch mode
npm run test:run  # single run (CI)
```

## Notes

- API behavior and DynamoDB modeling live in [`what2play-services`](https://github.com/seanezell/what2play-services).
- Cognito User Pool, hosted UI, and static hosting foundation are described in [`what2play-infrastructure`](https://github.com/seanezell/what2play-infrastructure).
- Cursor / AI: project rules are in [`.cursor/rules/`](.cursor/rules/). Cross-repo bullets: [`working-instructions/PORTFOLIO_CLIENT.md`](working-instructions/PORTFOLIO_CLIENT.md).

## License

Private portfolio project. Sharing details privately for interviews is welcome.
