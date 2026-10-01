FROM node:20-alpine

WORKDIR /app

# Copy dependency manifests first for better layer caching
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy the rest of the source code
COPY . .

# NEXT_PUBLIC_* vars must be present at build time to be baked into the JS bundle
ARG NEXT_PUBLIC_ENABLE_DEV
ARG NEXT_PUBLIC_ENABLE_STAGE
ARG NEXT_PUBLIC_ENABLE_PROD
ENV NEXT_PUBLIC_ENABLE_DEV=$NEXT_PUBLIC_ENABLE_DEV
ENV NEXT_PUBLIC_ENABLE_STAGE=$NEXT_PUBLIC_ENABLE_STAGE
ENV NEXT_PUBLIC_ENABLE_PROD=$NEXT_PUBLIC_ENABLE_PROD

# Build the Next.js app
RUN npm run build

# Expose the default Next.js port
EXPOSE 3000

# Start the production server
CMD ["npm", "run", "start"]
