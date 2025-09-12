# Use Node.js 18 Alpine for smaller image size
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json first for better caching
COPY package*.json ./

# Install root dependencies
RUN npm install --omit=dev --no-audit --no-fund

# Copy all files from game-ssr directory
COPY game-ssr/ .

# Install game-ssr dependencies
RUN cd game-ssr && npm install --omit=dev --no-audit --no-fund

# Build the application
RUN cd game-ssr && npm run build:minimal

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "server.js"]
