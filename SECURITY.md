# Security Policy

This document outlines the security policy for the Lemello Web App repository.

---

## Supported Versions

Lemello is currently in MVP development. Only the latest code on the `main` branch is actively maintained and supported.

---

## Reporting Security Vulnerabilities

If you discover a security vulnerability in this repository, report it privately.

**Do not open public issues for security vulnerabilities.**

Security issues include, but are not limited to:

- Cross-site scripting (XSS) vulnerabilities
- Authentication or authorization bypass
- Exposed API keys or credentials in client code
- Insecure data handling or storage in browser context
- Middleware misconfigurations that could expose sensitive routes
- Dependency vulnerabilities with known exploits

---

## Reporting Process

To report a security vulnerability:

1. Do not open a public issue or pull request
2. Contact the repository maintainer directly through private channels
3. Provide a detailed description of the vulnerability, including:
   - The affected component or page
   - Steps to reproduce the issue
   - Potential impact of the vulnerability
   - Any suggested remediation steps

---

## Response Timeline

Upon receiving a security report:

- Initial acknowledgment within 48 hours
- Assessment of the issue within 7 days
- Resolution and disclosure timeline determined based on severity

---

## Security Best Practices

When contributing to this repository:

- Never commit credentials, API keys, or secrets
- Only expose environment variables with the `NEXT_PUBLIC_` prefix when necessary
- Sanitize all user inputs before rendering
- Use secure HTTP headers and middleware configurations
- Follow React security best practices for preventing XSS
- Review dependency updates for known vulnerabilities

---

## Scope

This security policy applies to:

- All frontend code and components
- Next.js configuration and middleware
- Client-side data handling and storage
- Authentication and session management
- API client implementations

---

## Out of Scope

Backend security issues should be reported to the appropriate repository:

- Backend API security: lemello-app/backend
- Infrastructure security: lemello-app/infra
