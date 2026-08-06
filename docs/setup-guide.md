# AI Interview Platform - Setup Guide

## Prerequisites

Install the following:

- Node.js
- pnpm
- Docker Desktop (for Supabase local development)

## Installation

Clone the repository and install dependencies:

git clone <repository-url>

cd my-monorepo

pnpm install

## Workspace Structure

my-monorepo

apps/
- backend - Express backend API
- web - Next.js web application
- mobile - Expo React Native application

packages/
- shared-types - Shared TypeScript interfaces

supabase/
- Local Supabase configuration

## Development Commands

Run web application:

pnpm --filter @ai-platform/web dev

Run backend:

pnpm --filter @ai-platform/backend dev

Run mobile application:

pnpm --filter @ai-platform/mobile dev

## Root Commands

Install dependencies:

pnpm install

Build all workspaces:

pnpm build

Run lint:

pnpm lint

Run TypeScript checks:

pnpm typecheck

## Shared Types

Shared interfaces are stored in:

packages/shared-types/src/index.ts

Applications import shared types using:

@ai-platform/shared-types

This avoids duplicate type definitions between applications.

## Environment Setup

Create environment files from:

apps/backend/.env.example

apps/web/.env.example

apps/mobile/.env.example

## Supabase

Start local Supabase:

supabase start

Stop local Supabase:

supabase stop

## Verification

Run:

pnpm install

pnpm typecheck

pnpm build

Successful completion confirms the workspace is configured correctly.

