/**
 * @fileoverview Jest configuration for the Lemello webapp.
 * Uses Next.js presets and customizes test environment defaults.
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
  // Resolve @/ imports to the project root.
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  // Ignore generated and vendor directories during test discovery.
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  // Prevent haste map collisions from build output.
  modulePathIgnorePatterns: ['<rootDir>/.next/'],
};

module.exports = createJestConfig(customJestConfig);
