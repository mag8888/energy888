# Use Node.js 18 Alpine for smaller image size
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json first for better caching
COPY package.json ./

# Install dependencies
RUN npm install

# Copy the secure bot files
COPY bot-render-secure.js ./
COPY config.js ./
COPY logger.js ./

# Expose port
EXPOSE 3000

# Start the secure bot
CMD ["node", "bot-render-secure.js"]
