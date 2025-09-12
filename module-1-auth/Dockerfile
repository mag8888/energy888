FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install --omit=dev --no-audit --no-fund

# Copy source code
COPY server.js ./

# Expose port
EXPOSE 3000

# Start the server
CMD ["node", "server.js"]
