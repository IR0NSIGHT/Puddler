module.exports = {
    preset: 'ts-jest',
    verbose: true,
    testEnvironment: 'node',
    // ... other Jest configuration options
    collectCoverage: true,
    coverageDirectory: 'coverage',
    coverageReporters: ["json", "html"],
};