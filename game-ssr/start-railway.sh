#!/bin/bash

# Railway deployment script for Energy of Money
echo "🚀 Starting Railway deployment..."

# Set environment variables
export NODE_ENV=production
export NODE_OPTIONS="--max-old-space-size=8192"

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --omit=dev --no-audit --no-fund

# Build the project
echo "🔨 Building project..."
npm run build:minimal

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully!"
    echo "🚀 Starting server..."
    npm start
else
    echo "❌ Build failed!"
    exit 1
fi
