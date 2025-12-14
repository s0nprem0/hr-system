module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testTimeout: 20000,
  setupFilesAfterEnv: ['./tests/jest.setup.ts'],
};
