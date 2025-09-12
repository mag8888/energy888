#!/bin/bash

# Memory-optimized build script for Railway
echo "Starting memory-optimized build..."

# Set Node.js memory options
export NODE_OPTIONS="--max-old-space-size=6144 --max-semi-space-size=1024"

# Clean previous builds
echo "Cleaning previous builds..."
rm -rf .next
rm -rf out

# Install dependencies
echo "Installing dependencies..."
npm ci --omit=dev

# Build with memory optimizations
echo "Building with memory optimizations..."
npm run build:memory

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "Build completed successfully!"
    echo "Build size:"
    du -sh .next
    du -sh out
else
    echo "Build failed, trying with even more memory..."
    export NODE_OPTIONS="--max-old-space-size=8192 --max-semi-space-size=2048"
    npm run build:memory
fi
