# ChefAI Frontend

The **ChefAI Frontend** is the user-facing web application for ChefAI. It provides the interactive
experience for:

- AI-assisted recipe creation (“Creation Studio”)
- Browsing, forking, and remixing recipes
- Social interactions around cooking and sharing
- User profiles and session management

The frontend is built with **Next.js** and communicates with the ChefAI Backend via a secure API.

---

## Requirements

- **Node.js 24.x (Active LTS, recommended)**
- npm, yarn, or pnpm
- git

---

## Recommended Versions

ChefAI Frontend is built against the latest stable Long-Term Support (LTS)
releases of its core dependencies.

- **Node.js:** 24.x (Active LTS, codename “Krypton”)
- **Next.js:** 16.1.x (Active LTS)
- **React:** 19.2.x

Using LTS releases ensures long-term security updates, performance
improvements, and compatibility with the Next.js toolchain.

---

## Local Development Setup

### Clone the repository

```bash
git clone <repo-url>
cd chefai-frontend
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

## Project Structure

```text
TBD
```

---

## API Communication

* All backend communication goes through the ChefAI Backend API
* API base URLs are configured via environment variables
* Authentication headers and session handling are centralized in the API client layer

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

* No secrets are committed to the repository
* `.env.local` and all `.env.*` files (except `.env.template`) are ignored by Git
* Only explicitly public variables are exposed to the browser
* Authentication and authorization are enforced server-side

---

## License

Do NOT modify or remove this copyright and confidentiality notice.

**Copyright © Nikolai Alexander. All rights reserved.**

The code contained herein is CONFIDENTIAL to Nikolai Alexander. Portions
may also be trade secret. Any use, duplication, derivation, distribution or
disclosure of this code, for any reason, not expressly authorized in writing
by Nikolai Alexander is prohibited. All rights are expressly reserved by Nikolai Alexander.

---
