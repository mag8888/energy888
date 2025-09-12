#!/bin/bash

# Minimal build script for Railway - most aggressive memory optimization
echo "Starting minimal build with maximum memory optimization..."

# Set maximum Node.js memory options
export NODE_OPTIONS="--max-old-space-size=8192 --max-semi-space-size=2048"

# Clean everything
echo "Cleaning all build artifacts..."
rm -rf .next
rm -rf out
rm -rf node_modules/.cache

# Install only production dependencies
echo "Installing production dependencies only..."
npm ci --omit=dev --no-audit --no-fund

# Build with minimal configuration
echo "Building with minimal configuration..."
NODE_OPTIONS="--max-old-space-size=8192" npm run build

# If still failing, try with even more memory
if [ $? -ne 0 ]; then
    echo "Standard build failed, trying with maximum memory allocation..."
    NODE_OPTIONS="--max-old-space-size=12288" npm run build
fi

# Check build result
if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully!"
    echo "📊 Build size:"
    du -sh .next 2>/dev/null || echo "No .next directory"
    du -sh out 2>/dev/null || echo "No out directory"
    echo "🚀 Starting server with serve..."
    npx serve@latest out -p $PORT
else
    echo "❌ Build failed even with maximum memory allocation"
    echo "💡 Consider reducing component complexity or splitting the build"
    exit 1
fi
