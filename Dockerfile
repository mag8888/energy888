# Use Node.js 18 Alpine for smaller image size
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy all files from game-ssr directory
COPY game-ssr/ .

# Install dependencies
RUN npm install --omit=dev --no-audit --no-fund

# Build the application
RUN npm run build:minimal

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
