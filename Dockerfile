# syntax=docker/dockerfile:1
# Lemello Web App - Multi-stage Docker build for Next.js with Fast Refresh

# -----------------------------------------------------------------------------
# Stage 1: Dependencies - Install packages
# -----------------------------------------------------------------------------
FROM node:24-alpine AS deps

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci

# -----------------------------------------------------------------------------
# Stage 2: Builder - Build Next.js application
# -----------------------------------------------------------------------------
FROM node:24-alpine AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application code
COPY . .

# Set environment variables for build
ENV NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=production

# Build the application
RUN npm run build

# -----------------------------------------------------------------------------
# Stage 3: Development - Hot reload with Fast Refresh
# -----------------------------------------------------------------------------
FROM node:24-alpine AS development

WORKDIR /app

# Copy package files and install all dependencies (including dev)
COPY package.json package-lock.json* ./
RUN npm ci

# Copy Next.js configuration
COPY next.config.ts tsconfig.json tailwind.config.ts postcss.config.mjs ./
COPY .eslintrc.json ./

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=development \
    NEXT_TELEMETRY_DISABLED=1

# Run development server with Fast Refresh
CMD ["npm", "run", "dev"]

# -----------------------------------------------------------------------------
# Stage 4: Production - Standalone runtime
# -----------------------------------------------------------------------------
FROM node:24-alpine AS production

WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone output from builder
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Change ownership to non-root user
RUN chown -R nextjs:nodejs /app

USER nextjs

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME="0.0.0.0" \
    NEXT_TELEMETRY_DISABLED=1

# Run the standalone server
CMD ["node", "server.js"]
