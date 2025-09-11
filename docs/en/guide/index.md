# Getting Started

XCPCIO is a comprehensive platform for ICPC/CCPC competitive programming contests. It provides ranking systems and scoreboard visualization for programming competitions.

## What is XCPCIO?

XCPCIO offers:

- **Contest Management**: Handle contest metadata, team information, and submission data
- **Ranking System**: ICPC-style scoring with penalty calculations and real-time updates
- **Board Hosting**: Professional scoreboard hosting with synchronization services
- **Cross-Platform**: TypeScript and Python libraries for consistent data handling

## Architecture

This is a pnpm monorepo with the following structure:

- **packages/libs/types**: TypeScript type definitions for the entire project
- **packages/libs/core**: Core business logic, utilities, and algorithms for contest processing
- **packages/apps/board**: Vue 3 frontend application for displaying contest leaderboards
- **python/**: Python library providing the same type definitions and data models as the TypeScript packages

## Quick Start

### Installation

```bash
# Install the TypeScript packages
npm install @xcpcio/types @xcpcio/core

# Or use the Python library
pip install xcpcio
```

### Basic Usage

```typescript
import { calculateRanking } from "@xcpcio/core";
import { Contest, Submission, Team } from "@xcpcio/types";

// Define contest data
const contest: Contest = {
  // contest configuration
};

// Calculate rankings
const rankings = calculateRanking(contest);
```
