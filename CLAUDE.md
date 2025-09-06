# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

XCPCIO is a comprehensive platform for ICPC/CCPC competitive programming contests. It provides ranking systems and scoreboard visualization for programming competitions.

## Architecture

This is a pnpm monorepo with the following structure:

- **packages/libs/types**: TypeScript type definitions for the entire project
- **packages/libs/core**: Core business logic, utilities, and algorithms for contest processing
- **packages/apps/board**: Vue 3 frontend application for displaying contest leaderboards

The project follows a layered architecture where:

- `@xcpcio/types` provides shared type definitions
- `@xcpcio/core` contains contest logic, ranking algorithms, and data processing
- `@xcpcio/board-app` is the main Vue application consuming the core libraries

## Development Commands

### Root Level Commands

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Build only libraries (types and core)
pnpm build:libs

# Start development servers for all packages
pnpm dev

# Start production servers
pnpm start

# Run tests
pnpm test
vitest

# Lint all code
pnpm lint

# Format code
pnpm format

# Release new version
pnpm release
```

### Package-Specific Commands

#### Board App (packages/apps/board)

```bash
# Development server on port 3333
pnpm dev

# Build for production
pnpm build

# Type checking
pnpm typecheck

# Run unit tests
pnpm test:unit

# Run E2E tests
pnpm test:e2e

# Bundle analysis
pnpm sizecheck
```

#### Core Library (packages/libs/core)

```bash
# Build library
pnpm build

# Development mode with stub
pnpm dev

# Run directly with esmo
pnpm start
```

#### Types Library (packages/libs/types)

```bash
# Build library
pnpm build

# Development mode with stub
pnpm dev
```

## Technology Stack

- **Frontend**: Vue 3, TypeScript, Vite, UnoCSS, Pinia for state management
- **Build System**: Vite for apps, unbuild for libraries
- **Testing**: Vitest for unit tests, Cypress for E2E
- **Linting**: ESLint with @antfu/eslint-config
- **Package Management**: pnpm with workspace configuration

## Key Concepts

### Contest Data Structure

The core revolves around contest data represented by the `Contest` interface in `packages/libs/types/src/contest.ts`. This includes:

- Contest metadata (name, times, organization)
- Problems and balloon colors
- Team rankings and submissions
- Medal configurations and groupings

### Ranking System

The ranking logic in `packages/libs/core/src/rank.ts` handles:

- ICPC-style scoring with penalties
- Real-time leaderboard updates
- Frozen standings during contest end
- Medal allocation based on presets or custom rules

### Vue Application

The board app uses:

- Vue Router with auto-generated routes
- Vite SSG for static site generation
- Vue Query for data fetching
- Floating Vue for tooltips and popovers
- UnoCSS for styling

## Build Process

The monorepo uses a two-phase build:

1. Libraries (`types` and `core`) are built first using unbuild
2. Applications consume the built libraries

Libraries export both ESM and CommonJS formats with proper TypeScript declarations.

## Testing Strategy

- Unit tests with Vitest for core logic
- Component tests for Vue components
- E2E tests with Cypress for user workflows
- Type checking with vue-tsc

## Development Workflow

1. Install dependencies: `pnpm install`
2. Start development: `pnpm dev` (starts all packages in parallel)
3. Make changes to libraries first, then applications
4. Run tests: `pnpm test`
5. Lint before committing: `pnpm lint`
6. Build for production: `pnpm build`
