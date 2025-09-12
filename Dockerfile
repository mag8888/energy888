# Use Node.js 18 Alpine for smaller image size
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy only the test files
COPY index.html ./
COPY simple-server.js ./
COPY bot-render.js ./

# Expose port
EXPOSE 3000

# Start the bot-render.js (который перенаправляет на simple-server.js)
CMD ["node", "bot-render.js"]
