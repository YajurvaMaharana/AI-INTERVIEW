# CI/CD Documentation

## Overview

This project uses GitHub Actions to automatically check the Backend, Web, and Mobile applications.

The CI workflows run linting and TypeScript typechecking to help ensure that changes do not introduce errors.

## CI Workflows

### Backend CI

Workflow: `Backend Lint & Typecheck`

File:

`.github/workflows/ci-backend.yml`

The workflow:

1. Checks out the repository.
2. Sets up pnpm 11.18.0.
3. Uses Node.js 24.
4. Installs dependencies using the frozen lockfile.
5. Builds shared types.
6. Runs backend lint.
7. Runs backend typecheck.

### Web CI

Workflow: `Web Lint & Typecheck`

File:

`.github/workflows/ci-web.yml`

The workflow:

1. Checks out the repository.
2. Sets up pnpm 11.18.0.
3. Uses Node.js 24.
4. Installs dependencies using the frozen lockfile.
5. Builds shared types.
6. Runs web lint.
7. Runs web typecheck.

### Mobile CI

Workflow: `Mobile Lint & Typecheck`

File:

`.github/workflows/ci-mobile.yml`

The workflow:

1. Checks out the repository.
2. Sets up pnpm 11.18.0.
3. Uses Node.js 24.
4. Installs dependencies using the frozen lockfile.
5. Builds shared types.
6. Runs mobile lint.
7. Runs mobile typecheck.

## Workflow Triggers

The workflows support:

- Pull requests targeting `main`
- Pull requests targeting `Issue-4`
- Manual execution using `workflow_dispatch`

Manual testing can be performed from:

**GitHub → Actions → Select workflow → Run workflow**

## Branch Protection

The `main` branch should be protected so that important CI checks can be required before merging pull requests.

Recommended protection includes:

- Require pull requests before merging.
- Require CI checks to pass.
- Require branches to be up to date before merging.
- Prevent direct pushes where appropriate.

## Deployment

CI verifies code quality and type safety.

Deployment is handled separately according to the project's hosting configuration:

- Web: Vercel
- Backend: Vercel
- Database: Supabase
- Mobile: Expo/EAS

CI does not perform production deployment unless deployment steps are explicitly added to the workflows.

## Testing CI Workflows

Each workflow can be tested manually using the `workflow_dispatch` trigger.

Successful CI verification should show:

- Backend Lint & Typecheck — Success
- Web Lint & Typecheck — Success
- Mobile Lint & Typecheck — Success

## Dependency and Build Configuration

The repository uses pnpm workspaces.

The lockfile must remain synchronized with the package configuration because CI uses:

```bash
pnpm install --frozen-lockfile
