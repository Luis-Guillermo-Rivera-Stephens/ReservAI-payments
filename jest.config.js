/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  clearMocks: true,
  restoreMocks: true,
  setupFiles: ['<rootDir>/tests/setupEnv.js'],
  testMatch: ['**/tests/**/*.test.js'],
  verbose: true,
  moduleNameMapper: {
    '^uuid$': '<rootDir>/tests/helpers/uuidMock.js',
  },
};
