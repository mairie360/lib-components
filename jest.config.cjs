/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jest-environment-jsdom',
  maxWorkers: 1,
  // src/kit is tested by `npm run test:kit` on the built entries (MAIR-126).
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.stories.*', '!src/kit/**'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@mairie360/lib-components/(react|shared|theme)$': '<rootDir>/src/kit/$1',
    '\\.(css|scss|sass)$': 'identity-obj-proxy',
    '\\.(png|jpg|jpeg|gif|webp|avif|svg)$': '<rootDir>/src/__mocks__/fileMock.ts',
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: './tsconfig.jest.json' }],
  },
  testPathIgnorePatterns: ['/node_modules/', '/.next/', '/tests/kit/'],
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60,
    },
  },
};
