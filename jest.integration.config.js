module.exports = {
  testEnvironment: 'node', // Use Node environment for Puppeteer
  testMatch: ['**/tests/integration.test.js', '**/tests/wallet-integration.test.js'],
  testTimeout: 30000, // 30 seconds for integration tests
  verbose: true,
  // Don't use the setup file for integration tests
  setupFilesAfterEnv: [],
};
