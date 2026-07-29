# Production Node.js Alpine Container
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package metadata
COPY package.json ./

# Copy application source code
COPY . .

# Set environment
ENV NODE_ENV=production
ENV PORT=8080

# Expose port
EXPOSE 8080

# Run production server
CMD ["node", "server.js"]
