# Use Node.js 18 Alpine for smaller image size
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy only the test files
COPY index.html ./
COPY simple-server.js ./

# Expose port
EXPOSE 3000

# Start the simple server
CMD ["node", "simple-server.js"]
