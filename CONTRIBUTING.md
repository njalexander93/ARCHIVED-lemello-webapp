# Contributing to Lemello Web App

This repository contains the Next.js frontend for Lemello. Contributions must follow the guidelines below to ensure consistency and quality.

---

## Linear as Source of Truth

All work is tracked in Linear. Branch names, pull requests, and commits must reference Linear ticket IDs.

---

## Branch Naming

All feature branches must reference a Linear ticket ID:

```text
LMLO-123/short-description
```

Examples:

```text
LMLO-456/add-recipe-card-component
LMLO-789/fix-mobile-navigation
```

---

## Pull Request Policy

All changes to this repository must be made through pull requests.

Direct commits to the `main` branch are not permitted.

---

## Pull Request Guidelines

### Keep PRs Small and Focused

- One logical change per pull request
- Frontend-only changes (no backend logic)
- Single feature, fix, or refactor per PR

### Required Information

Every pull request must include:

- Link to the Linear ticket
- Summary of UI/UX changes
- Screenshots or screen recordings (highly encouraged)
- Manual test checklist

Use the pull request template when creating PRs.

---

## Code Style

Code formatting and linting are enforced by tooling:

- ESLint for code quality
- Prettier for formatting
- TypeScript for type safety

Run checks before committing:

```bash
npm run lint
npm run type-check
```

Do not manually adjust formatting or style rules.

---

## Testing Changes

Before submitting a pull request:

- Test your changes locally in development mode
- Verify the production build works correctly
- Test responsive behavior on mobile, tablet, and desktop
- Ensure no console errors or warnings
- Verify accessibility for new UI components

---

## Commit Messages

Use clear, descriptive commit messages:

```text
[LMLO-123] Add recipe card component

- Implement RecipeCard with image and title
- Add responsive layout for mobile and desktop
- Connect to backend API for recipe data
```

Reference the Linear ticket ID in square brackets at the start of the message.

---

## Questions and Support

If you have questions about contributing:

- Review the README.md for architecture and setup details
- Check the Linear ticket for context and requirements
- Reach out to the repository maintainer for clarification

---

## License

All contributions are subject to the repository license. By submitting a pull request, you agree that your contributions will be licensed under the same terms.
