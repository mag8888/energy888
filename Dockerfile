# Use Node.js 18 Alpine for smaller image size
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy only the bot-render.js file (всё встроено в него)
COPY bot-render.js ./

# Expose port
EXPOSE 3000

# Start the bot-render.js
CMD ["node", "bot-render.js"]
