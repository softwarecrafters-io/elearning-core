/** @type {import('jest').Config} */
const baseConfig = require('./jest.config.cjs');

const config = {
  ...baseConfig,
  testEnvironment: 'node',
  testMatch: ['**/*.integration.test.ts'],
  testPathIgnorePatterns: [],
  globalSetup: '<rootDir>/src/shared/tests/integration/globalSetup.ts',
  globalTeardown: '<rootDir>/src/shared/tests/integration/globalTeardown.ts',
  setupFilesAfterEnv: ['<rootDir>/src/shared/tests/integration/setupTests.ts'],
  testTimeout: 20000,
};

module.exports = config;

