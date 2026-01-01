process.env.LOG_LEVEL = 'silent';

// Silence console.log during tests
global.console.log = jest.fn();

