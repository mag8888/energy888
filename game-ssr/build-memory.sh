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
    echo "✅ Build completed successfully!"
    echo "📊 Build size:"
    du -sh .next 2>/dev/null || echo "No .next directory"
    du -sh out 2>/dev/null || echo "No out directory"
    echo "🚀 Starting server with serve..."
    npx serve@latest out -p $PORT
else
    echo "❌ Build failed, trying with even more memory..."
    export NODE_OPTIONS="--max-old-space-size=8192 --max-semi-space-size=2048"
    npm run build:memory
    if [ $? -eq 0 ]; then
        echo "✅ Build completed on retry!"
        npx serve@latest out -p $PORT
    fi
fi
