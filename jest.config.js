/**
 * @fileoverview Jest configuration for the Lemello webapp.
 */

const nextJest = require('next/jest');

// Use Next.js defaults for Jest configuration.
const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  // Simulate a browser-like DOM for React component tests.
  testEnvironment: 'jsdom',
  // Load test helpers and mocks before running tests.
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  // Transform selected ESM dependencies for Jest.
  transformIgnorePatterns: ['/node_modules/(?!uuid)/'],
  // Resolve @/ imports to the project root.
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^uuid$': '<rootDir>/tests/__mocks__/uuid.ts',
  },
  // Ignore generated and vendor directories during test discovery.
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/tests/e2e/',
  ],
  // Prevent haste map collisions from build output.
  modulePathIgnorePatterns: ['<rootDir>/.next/'],
};

module.exports = createJestConfig(customJestConfig);
