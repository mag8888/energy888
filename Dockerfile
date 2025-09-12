# Use Node.js 18 Alpine for smaller image size
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files from game-ssr directory
COPY game-ssr/package*.json ./

# Install dependencies
RUN npm ci --omit=dev --no-audit --no-fund

# Copy source code from game-ssr directory
COPY game-ssr/ .

# Build the application
RUN npm run build:minimal

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
