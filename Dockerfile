# Use Node.js 18 Alpine for smaller image size
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json first for better caching
COPY package.json ./

# Install dependencies
RUN npm install

# Copy the bot-render-advanced.js file
COPY bot-render-advanced.js ./

# Expose port
EXPOSE 3000

# Start the bot-render-advanced.js
CMD ["node", "bot-render-advanced.js"]
