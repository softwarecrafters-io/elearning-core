/** @type {import('jest').Config} */
const config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js'],
  verbose: false,
  clearMocks: true,
  collectCoverageFrom: ['src/**/*.ts'],
  coverageDirectory: 'coverage',
};

module.exports = config;

