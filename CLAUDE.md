# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**XCPCIO** is "The ICPC Series Competition Leaderboard Visualization Engine" - a comprehensive platform for ICPC competitive programming contests. It provides professional ranking systems, real-time leaderboard visualization, and hosting services for programming competitions.

## Architecture

This is a pnpm monorepo with the following structure:

- **packages/libs/types**: TypeScript type definitions for the entire project
- **packages/libs/core**: Core business logic, utilities, and algorithms for contest processing
- **packages/apps/board**: Vue 3 frontend application for displaying contest leaderboards
- **python/**: Python library providing the same type definitions and data models as the TypeScript packages

The project follows a layered architecture where:

### npm

- `@xcpcio/types` provides shared type definitions
- `@xcpcio/core` contains contest logic, ranking algorithms, and data processing
- `@xcpcio/board-app` is the main Vue application consuming the core libraries

### python

- `xcpcio` (Python) provides equivalent type definitions and data models for Python environments

## Development Commands

### Root Level Commands

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Build only libraries (types and core)
pnpm build:libs

# Build docs app
pnpm build:docs

# Build board app
pnpm build:board

# Run tests
pnpm test

# Update test snapshots
pnpm test:update

# Run full CI pipeline (build, lint, test)
pnpm test:ci

# Lint all code
pnpm lint

# Fix lint issues automatically
pnpm lint:fix

# Start docs development server
pnpm docs

# Start board development server
pnpm board

# Release new version (bumps version, commits, tags, pushes)
pnpm release

# Publish to npm (requires build first)
pnpm publish:npm

# Build and publish to npm
pnpm publish:npm_with_build
```

### Package-Specific Commands

#### Board App (packages/apps/board)

```bash
# Development server on port 3333
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Preview with HTTPS
pnpm preview-https

# Start production server
pnpm start

# Run E2E tests with Cypress
pnpm test:e2e

# Bundle size analysis
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

#### Python Library (python/)

```bash
# Install dependencies with uv
uv install

# Run tests
uv run pytest

# Run specific test file
uv run pytest tests/test_types.py

# Run with coverage
uv run pytest --cov=xcpcio

# Format code with ruff
uv run ruff format

# Lint code with ruff
uv run ruff check
```

## Technology Stack

- **Frontend**: Vue 3, TypeScript, Vite, UnoCSS, Pinia for state management
- **UI Components**: Floating Vue for tooltips, Flowbite for components, Vue Search Select
- **Data Visualization**: Highcharts with Vue integration, GSAP for animations
- **State Management**: Pinia, Vue Query (@tanstack/vue-query) for server state
- **Utilities**: VueUse composables, Day.js for dates, Lodash for utilities
- **Build System**: Vite for apps, unbuild for libraries, Vite SSG for static generation
- **Testing**: Vitest for unit tests, Cypress for E2E, pytest for Python
- **Linting**: ESLint with @antfu/eslint-config, Ruff for Python
- **Package Management**: pnpm with workspace configuration and catalog, uv for Python
- **Python**: Pydantic for data validation and serialization
- **Documentation**: VitePress for documentation site

## Key Concepts

### Contest Data Structure

The core revolves around contest data represented by the `Contest` interface in `packages/libs/types/src/contest.ts` and the equivalent Pydantic model in `python/xcpcio/types.py`. This includes:

- Contest metadata (name, times, organization)
- Problems and balloon colors
- Team rankings and submissions
- Medal configurations and groupings

### Python Library

The Python library (`python/xcpcio/`) provides:

- **Type Definitions**: Pydantic models mirroring the TypeScript types for contests, teams, submissions
- **Constants**: Shared constants for submission statuses, time units, penalty calculations
- **Data Validation**: Built-in validation and serialization using Pydantic
- **Cross-Language Compatibility**: Ensures data consistency between Python and TypeScript environments

Key models include:

- `Contest`: Contest configuration and metadata
- `Team`: Team information with groups, tags, and extra fields
- `Submission`: Individual submission data with status and timing

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
2. Start development:
   - All packages: `pnpm dev` (not available - use specific commands below)
   - Board app: `pnpm board` (runs on port 3333)
   - Documentation: `pnpm docs`
3. Make changes to libraries first, then applications
4. Build libraries before testing apps: `pnpm build:libs`
5. Run tests: `pnpm test` or `pnpm test:ci` for full pipeline
6. Lint before committing: `pnpm lint` or `pnpm lint:fix`
7. Build for production: `pnpm build`

### Package Development Order

Due to dependencies, develop in this order:

1. **types** package first (base types)
2. **core** package second (uses types)
3. **board** app last (uses both types and core)
4. **python** package (independent, mirrors TypeScript types)

## Git Workflow

### Standard Development Workflow

```bash
# Create appropriate branch based on task type
git checkout -b <type>/<description>
# Examples:
# feat/add-dark-mode-support
# fix/search-filter-bug
# chore/update-dependencies
# docs/api-documentation

# Make changes, format, and commit with proper format and signoff
pnpm run format
git add .
git commit --signoff -m "<type>: <description>"
# Examples:
# feat: add dark mode support for search components
# fix: resolve search filter not working with special characters
# chore: bump @types/node to latest version
# docs: add API documentation for ranking system

# Push branch and create PR
git push --set-upstream origin <branch-name>
gh pr create --title "<type>: <description>" --body "Brief summary of changes"

# Merge and cleanup
gh pr merge <pr-number> --squash
git checkout main && git pull origin main
git branch -d <branch-name>
```

### Commit Types

- `feat`: New features or enhancements
- `fix`: Bug fixes
- `chore`: Maintenance tasks, dependency updates
- `docs`: Documentation changes
- `refactor`: Code refactoring without functional changes
- `test`: Adding or updating tests
- `style`: Code formatting, white-space fixes
- `perf`: Performance improvements
- `ci`: Changes to CI configuration files and scripts

## Additional Information

### Package Manager Configuration

- Uses pnpm with catalog feature for centralized dependency management
- Workspace configuration in `pnpm-workspace.yaml`
- Node.js version requirement: >=20
- Package manager version: pnpm@10.16.0

### Key Development Tools

- **@antfu/ni**: Smart package manager command shortcuts
- **bumpp**: Version bumping utility for releases
- **unbuild**: Zero-config build tool for libraries
- **taze**: Keep dependencies up-to-date
- **esmo**: TypeScript/ESM execution engine
