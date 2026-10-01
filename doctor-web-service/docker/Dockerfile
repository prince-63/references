# Base image for building the application
FROM node:18-alpine AS builder

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package.json package-lock.json ./
RUN npm ci
COPY . .

# Development stage
FROM builder AS dev
RUN NODE_OPTIONS="--max_old_space_size=4096" npm run build:development
CMD ["node", "server.js"]

# Staging stage
FROM builder AS stage
RUN NODE_OPTIONS="--max_old_space_size=5096" npm run build:staging
CMD ["node", "server.js"]

# Production stage
FROM builder AS prod
RUN NODE_OPTIONS="--max_old_space_size=4096" npm run build:production
CMD ["node", "server.js"]