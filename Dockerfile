# Simple Dockerfile for Railway deployment
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json first for better caching
COPY package.json ./

# Install dependencies
RUN npm install

# Copy the simple server file
COPY server-simple.js ./

# Expose port
EXPOSE 3000

# Start the server
CMD ["node", "server-simple.js"]
