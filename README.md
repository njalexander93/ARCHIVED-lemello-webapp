<h1><img src=".github/assets/lemello-horizontal-yellow.svg" alt="Lemello" height="28px"> Web App</h1>

The user-facing Progressive Web Application for Lemello — an AI-powered cooking platform that transforms nervous recipe-followers into confident recipe-creators.

---

## Features

- **Creation Studio** — AI-assisted recipe creation with an encouraging Sous-Chef that teaches as you cook
- **Recipe Discovery** — Browse, fork, and remix recipes from the community
- **Social Cooking** — Share creations, build your cookbook, and create recipes worth passing down
- **Cross-Device Experience** — Works seamlessly on desktop, tablet, and mobile as a PWA

---

## Related Repositories

| Repository | Description |
|------------|-------------|
| [lemello-app/backend](https://github.com/lemello-app/backend) | FastAPI backend and AI services |
| [lemello-app/infra](https://github.com/lemello-app/infra) | Terraform, Docker, and deployment configs |

---

## Requirements

- **Node.js 24.x (Active LTS)**
- npm, yarn, or pnpm
- Docker (for containerized deployment)
- git

---

## Technology Stack

| Component | Version | Classification | Rationale |
|-----------|---------|----------------|-----------|
| **Node.js** | 24.x LTS | Stable | Secure, long-term support foundation for the application server |
| **Next.js** | 16.x | Bleeding Edge | Partial Prerendering (PPR) delivers "Instant Load" UX; Turbopack optimizes builds |
| **React** | 19.x | Stable | Latest stable React with concurrent features |

---

## Deployment Target

Lemello Web App is deployed on **DigitalOcean App Platform** using containerized deployments.

### Infrastructure Overview

- **Compute:** DigitalOcean App Platform (Pro tier for Production, Basic for Staging)
- **Container Registry:** DigitalOcean Container Registry (DOCR)
- **CDN/Static Assets:** DigitalOcean Spaces (optional, for offloading static assets)

### Build Once, Deploy Twice

The webapp follows an immutable deployment strategy:

1. Docker images are built once and pushed to DOCR
2. The same image digest is deployed to both Staging and Production
3. Environment-specific configuration is injected via environment variables

---

## Why Next.js 16?

Next.js 16 introduces critical features for the Lemello user experience:

### Partial Prerendering (PPR)

PPR enables a hybrid rendering model ideal for the Creation Studio:

- **Static Shell:** Sidebar, navigation, and chrome are pre-rendered at build time
- **Dynamic Stream:** Chat interface and AI responses are streamed dynamically

This delivers an "instant load" experience while maintaining real-time interactivity.

### Turbopack

Turbopack is the production-ready bundler in Next.js 16, providing:

- Faster build times compared to Webpack
- Optimized development server hot reloading
- Better tree-shaking for smaller production bundles

### Configuration

Enable PPR in `next.config.ts`:

```typescript
const nextConfig = {
  experimental: {
    ppr: true,
  },
  output: 'standalone',
};

export default nextConfig;
```

---

## Local Development Setup

### Clone the repository

```bash
git clone git@github.com:lemello-app/webapp.git
cd webapp
```

### Install dependencies

Using npm:

```bash
npm install
```

Or yarn:

```bash
yarn install
```

Or pnpm:

```bash
pnpm install
```

---

## Environment Configuration

Frontend configuration is provided via environment variables.

Copy the template and adjust values as needed:

```bash
cp .env.template .env.local
```

Example variables:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_ENV=local
```

⚠️ Only variables prefixed with `NEXT_PUBLIC_` are exposed to the browser.

---

## Running the Development Server

```bash
npm run dev
```

The application will be available at:

```
http://localhost:3000
```

---

## Containerization

The webapp uses a multi-stage Docker build with Next.js "standalone" output mode for lean, production-ready images.

### Why Standalone Mode?

Next.js `output: 'standalone'` uses Output File Tracing to create a minimal deployment:

| Build Type | Typical Size | Includes |
|------------|--------------|----------|
| Standard | >1 GB | Full `node_modules`, dev dependencies |
| Standalone | <200 MB | Only production files + minimal `server.js` |

This reduction is vital for fast deployment times and staying within registry limits.

### Dockerfile Architecture

```dockerfile
# Stage 1: Dependencies
FROM node:24-alpine AS deps
# Install production dependencies only

# Stage 2: Builder
FROM node:24-alpine AS builder
# Build the Next.js application with standalone output

# Stage 3: Runner
FROM node:24-alpine AS runner
# Copy only standalone output, public assets, and static files
# Runs as non-root user for security
```

### Building the Container

```bash
docker build -t lemello-webapp:latest .
```

### Running Locally with Docker

```bash
docker run -p 3000:3000 --env-file .env.local lemello-webapp:latest
```

---

## App Platform Considerations

When deploying to DigitalOcean App Platform, keep these constraints in mind:

### Middleware and Proxy Headers

DigitalOcean App Platform load balancers handle SSL termination. The container receives traffic on HTTP (typically port 8080). This can cause issues with Next.js Middleware that relies on protocol detection.

**The Issue:** Middleware may incorrectly infer `http` instead of `https`, causing:

- Infinite redirect loops
- Cookie security flags to fail
- `NextResponse.redirect()` returning status 200 instead of 3xx

**The Fix:** Trust the proxy headers. In your middleware or custom server:

```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Trust X-Forwarded-Proto from DigitalOcean load balancer
  const proto = request.headers.get('x-forwarded-proto') || 'http';
  const isSecure = proto === 'https';

  // Your middleware logic here, using isSecure for protocol checks
}
```

### Ephemeral Filesystem

App Platform containers have ephemeral file systems. Do not write persistent data to disk. Use external storage (DigitalOcean Spaces) for user uploads or generated content.

### Environment Variables

Environment-specific configuration is injected via App Platform:

- Staging and Production use different `NEXT_PUBLIC_API_URL` values
- Sensitive values (API keys) are stored securely in App Platform settings
- Build-time variables must be set during the Docker build or in the App Spec

---

## API Communication

- All backend communication goes through the [Lemello Backend API](https://github.com/lemello-app/backend)
- API base URLs are configured via environment variables
- Authentication headers and session handling are centralized in the API client layer

---

## Build

To create a production build:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run start
```

---

## Security Notes

- No secrets are committed to the repository
- `.env.local` and all `.env.*` files (except `.env.template`) are ignored by Git
- Only explicitly public variables are exposed to the browser
- Authentication and authorization are enforced server-side

---

## License

**Copyright © Lemello, LLC. All rights reserved.**

The code contained herein is CONFIDENTIAL to Lemello, LLC. Portions
may also be trade secret. Any use, duplication, derivation, distribution or
disclosure of this code, for any reason, not expressly authorized in writing
by Lemello, LLC is prohibited. All rights are expressly reserved by Lemello, LLC.
