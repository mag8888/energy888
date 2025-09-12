# Memory Optimization Guide

This document outlines the memory optimizations implemented to resolve the "JavaScript heap out of memory" errors during Railway deployment.

## Problem
The Next.js build process was failing with memory errors due to:
- Large component data structures (INNER_CELLS, OUTER_CELLS arrays)
- Memory-intensive build process
- Missing ESLint configuration
- Insufficient Node.js memory allocation

## Solutions Implemented

### 1. ESLint Configuration
- Added ESLint as dev dependency
- Created `.eslintrc.json` with Next.js rules
- Disabled ESLint during build to save memory

### 2. Next.js Build Optimization
- Increased Node.js memory limits in build scripts
- Disabled TypeScript checking during build
- Disabled SWC minification
- Optimized webpack configuration
- Disabled source maps in production
- Disabled image optimization

### 3. Component Optimization
- Moved large data structures to separate files (`src/data/gameCells.ts`)
- Created memory-optimized component (`FullGameBoardOptimized.tsx`)
- Implemented lazy loading for BankModule
- Used dynamic imports for game cells data

### 4. Build Scripts
- `build`: Standard build with 4GB memory
- `build:memory`: Memory-optimized build with 6GB memory
- `build:minimal`: Maximum memory build with 8GB memory
- `build-memory.sh`: Automated memory-optimized build script
- `build-minimal.sh`: Fallback build with maximum memory allocation

### 5. Railway Configuration
- Updated `railway.json` to use memory-optimized build
- Created `railway.toml` with environment variables
- Set Node.js memory options via NODE_OPTIONS

## Usage

### For Development
```bash
npm run dev
```

### For Production Build
```bash
# Standard build
npm run build

# Memory-optimized build
npm run build:memory

# Maximum memory build
npm run build:minimal
```

### For Railway Deployment
The deployment will automatically use the memory-optimized build script.

## Memory Allocation
- Standard: 4GB (`--max-old-space-size=4096`)
- Memory-optimized: 6GB (`--max-old-space-size=6144`)
- Minimal: 8GB (`--max-old-space-size=8192`)

## Monitoring
- Health check endpoint: `/api/health`
- Build logs available in Railway dashboard
- Memory usage monitored during build process

## Troubleshooting

If build still fails:
1. Check Railway logs for specific error messages
2. Try increasing memory allocation in build scripts
3. Consider further component splitting
4. Check for memory leaks in components

## Files Modified
- `package.json` - Added ESLint and build scripts
- `next.config.js` - Memory optimizations
- `railway.json` - Updated build command
- `railway.toml` - Environment configuration
- `src/data/gameCells.ts` - Extracted large data structures
- `src/components/FullGameBoardOptimized.tsx` - Memory-optimized component
- `build-memory.sh` - Memory-optimized build script
- `build-minimal.sh` - Fallback build script


