# CI/CD Documentation

## Overview

This project uses GitHub Actions to automatically validate the Backend, Web, and Mobile applications before they are merged into the `main` branch.

The CI pipelines run linting and TypeScript type checking for each application.

## CI Workflows

The following workflows are located in `.github/workflows/`:

### Backend CI

File: `.github/workflows/ci-backend.yml`

The Backend workflow:

- Runs when a Pull Request targets `main`.
- Uses Node.js 20.
- Uses pnpm 11.18.0.
- Installs workspace dependencies using the frozen lockfile.
- Builds the shared types package.
- Runs Backend ESLint.
- Runs Backend TypeScript type checking.

Commands:

pnpm --filter @ai-platform/shared-types build
pnpm --filter @ai-platform/backend lint
pnpm --filter @ai-platform/backend typecheck


### Web CI

File: .github/workflows/ci-web.yml

The Web workflow:

- Runs when a Pull Request targets main.
- Uses Node.js 20.
- Uses pnpm 11.18.0.
- Installs workspace dependencies using the frozen lockfile.
- Builds the shared types package.
- Runs Web ESLint.
- Runs Web TypeScript type checking.

Commands:

pnpm --filter @ai-platform/shared-types build
pnpm --filter @ai-platform/web lint
pnpm --filter @ai-platform/web typecheck


### Mobile CI

File: .github/workflows/ci-mobile.yml

The Mobile workflow:

- Runs when a Pull Request targets main.
- Uses Node.js 20.
- Uses pnpm 11.18.0.
- Installs workspace dependencies using the frozen lockfile.
- Builds the shared types package.
- Runs Mobile ESLint.
- Runs Mobile TypeScript type checking.

Commands:

pnpm --filter @ai-platform/shared-types build
pnpm --filter @ai-platform/mobile lint
pnpm --filter @ai-platform/mobile typecheck


## Dependency Installation

The repository is a pnpm workspace.

CI uses:

pnpm install --frozen-lockfile

This ensures that the dependency versions installed in CI match the committed pnpm-lock.yaml.


## Pull Request Checks

Opening a Pull Request targeting main automatically starts all three workflows:

- Backend Lint & Typecheck
- Web Lint & Typecheck
- Mobile Lint & Typecheck

A workflow fails when linting or TypeScript type checking returns a non-zero exit code.


## Branch Protection

The `main` branch should require all three CI checks to pass before a Pull Request can be merged.

Required status checks:

- Backend Lint & Typecheck
- Web Lint & Typecheck
- Mobile Lint & Typecheck

Branch protection should also prevent direct pushes to `main` according to the team's repository policy.


## Vercel Deployment

The Web and Backend applications may be deployed through Vercel's GitHub integration.

Deployment configuration is managed separately from the CI workflows.

After a deployment is configured, verify it by checking:

1. The deployment starts after the configured GitHub event.
2. The deployment completes successfully.
3. No build errors are reported.
4. The generated deployment URL is accessible.


## Testing the CI Pipeline

### Testing a TypeScript Failure

To verify that TypeScript errors fail CI:

1. Create a temporary branch from the CI branch.
2. Introduce an intentional TypeScript error in one application.
3. Commit and push the change.
4. Open a Pull Request targeting main.
5. Confirm that the corresponding Typecheck job fails.
6. Fix the error.
7. Push the fix and confirm that the workflow passes.

### Testing a Lint Failure

To verify that lint errors fail CI:

1. Create a temporary branch from the CI branch.
2. Introduce an intentional ESLint violation.
3. Commit and push the change.
4. Open a Pull Request targeting main.
5. Confirm that the corresponding Lint job fails.
6. Fix the violation.
7. Push the fix and confirm that the workflow passes.

## Local Verification

Before pushing changes, the same checks can be run locally.

### Backend

pnpm --filter @ai-platform/shared-types build
pnpm --filter @ai-platform/backend lint
pnpm --filter @ai-platform/backend typecheck

### Web

pnpm --filter @ai-platform/shared-types build
pnpm --filter @ai-platform/web lint
pnpm --filter @ai-platform/web typecheck

### Mobile

pnpm --filter @ai-platform/shared-types build
pnpm --filter @ai-platform/mobile lint
pnpm --filter @ai-platform/mobile typecheck

All CI checks should pass locally before creating the Pull Request.
