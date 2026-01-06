FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy source code
COPY . .

# Expose port (Fly.io sets PORT env var, but we default to 8087)
ENV PORT=8080
EXPOSE 8080

# Start command
CMD ["node", "dev-server.js"]
