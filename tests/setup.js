/**
 * Jest setup file for browser extension testing
 */

// Mock browser/chrome APIs
global.chrome = {
  runtime: {
    id: 'test-extension-id',
    getURL: (path) => `chrome-extension://test-extension-id/${path}`,
    sendMessage: jest.fn((message, callback) => {
      if (callback) callback({ success: true });
      return Promise.resolve({ success: true });
    }),
    onMessage: {
      addListener: jest.fn(),
      removeListener: jest.fn()
    },
    onInstalled: {
      addListener: jest.fn()
    },
    onStartup: {
      addListener: jest.fn()
    },
    openOptionsPage: jest.fn()
  },
  storage: {
    local: {
      get: jest.fn((keys) => Promise.resolve({})),
      set: jest.fn(() => Promise.resolve()),
      remove: jest.fn(() => Promise.resolve()),
      clear: jest.fn(() => Promise.resolve())
    }
  },
  tabs: {
    executeScript: jest.fn(() => Promise.resolve()),
    query: jest.fn(() => Promise.resolve([]))
  }
};

// Also expose as browser for Firefox compatibility
global.browser = global.chrome;

// Mock window.location
delete window.location;
window.location = {
  href: 'https://example.com',
  origin: 'https://example.com',
  protocol: 'https:',
  host: 'example.com',
  hostname: 'example.com',
  port: '',
  pathname: '/',
  search: '',
  hash: ''
};

// Mock navigator.credentials
global.navigator.credentials = {
  get: jest.fn(() => Promise.resolve(null)),
  create: jest.fn(() => Promise.resolve(null)),
  store: jest.fn(() => Promise.resolve())
};

// Mock console methods to reduce test output noise
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};

// Mock DOM methods
document.createElement = jest.fn((tag) => {
  const element = {
    tagName: tag.toUpperCase(),
    appendChild: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    setAttribute: jest.fn(),
    getAttribute: jest.fn(),
    remove: jest.fn(),
    src: '',
    onload: null,
    style: {},
    classList: {
      add: jest.fn(),
      remove: jest.fn(),
      toggle: jest.fn(),
      contains: jest.fn()
    }
  };
  return element;
});

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});
