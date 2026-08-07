# AI Interview Platform - Setup Guide

## Prerequisites

Install the following:

- Node.js 24.x
- pnpm 11.x
- Docker Desktop (for Supabase local development)
- Supabase CLI

Verify your installation:

node -v

pnpm -v

supabase --version

## Installation

Clone the repository and install dependencies:

git clone https://github.com/YajurvaMaharana/AI-INTERVIEW.git

cd AI-INTERVIEW

pnpm install

## Quick Start

1. Install all dependencies:

pnpm install

2. Start Supabase:

supabase start

3. Start the backend:

pnpm --filter @ai-platform/backend dev

4. Start the web application:

pnpm --filter @ai-platform/web dev

5. Start the mobile application:

pnpm --filter @ai-platform/mobile dev
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

