# Test Fixtures

This directory contains test fixtures for integration testing.

## Mock Wallet (`mock-wallet.html`)

A programmable mock wallet for integration testing the extension's wallet auto-registration API and JWT verification callbacks.

### Purpose

The mock wallet simulates a digital identity wallet without requiring a real wallet implementation. It provides a JavaScript interface that can be controlled from Puppeteer tests.

### Features

- ✅ **Auto-registration** - Automatically registers with extension on load
- ✅ **Programmable** - Test can inject custom behavior via `page.evaluate()`
- ✅ **Observable** - Exposes state for test assertions
- ✅ **Error Simulation** - Can simulate various error scenarios
- ✅ **Call History** - Tracks all API calls for verification
- ✅ **JWT Verification** - Provides mock JWT verifier callback

### API Interface

The mock wallet exposes `window.mockWallet` with the following interface:

#### State

```javascript
window.mockWallet.state = {
  extensionInstalled: boolean,  // Whether extension is detected
  registered: boolean,          // Whether wallet is registered
  walletInfo: Object | null,    // Registered wallet information
  verifierRegistered: boolean,  // Whether JWT verifier is registered
  lastError: string | null,     // Last error message
  callHistory: Array            // History of all API calls
}
```

#### Methods

**Configuration:**
- `initialize(customConfig)` - Initialize with custom configuration
- `reset()` - Reset state to initial values

**Registration:**
- `register(customInfo)` - Register wallet with extension
- `isRegistered(url)` - Check if wallet is registered

**JWT Verification:**
- `registerVerifier(customCallback)` - Register JWT verifier
- `unregisterVerifier()` - Unregister JWT verifier
- `getRegisteredVerifiers()` - Get list of registered verifiers

**Simulation:**
- `simulateOpenID4VPRequest(request)` - Simulate OpenID4VP flow
- `simulateError(errorType)` - Simulate error scenarios

**Introspection:**
- `getState()` - Get current state
- `getCallHistory()` - Get history of all calls

### Error Simulation

The mock wallet can simulate various error scenarios:

```javascript
// Invalid URL
await mockWallet.simulateError('invalid_url');

// Missing protocols
await mockWallet.simulateError('missing_protocols');

// Invalid protocol identifier
await mockWallet.simulateError('invalid_protocol');

// Registration timeout
await mockWallet.simulateError('registration_timeout');

// Non-function verifier
await mockWallet.simulateError('verifier_not_function');
```

### Usage in Tests

```javascript
const page = await browser.newPage();
const mockWalletPath = path.join(__dirname, 'fixtures', 'mock-wallet.html');

// Load with auto-registration disabled
await page.goto(`file://${mockWalletPath}?auto-register=false`);
await new Promise(resolve => setTimeout(resolve, 1000));

// Reset state
await page.evaluate(() => window.mockWallet.reset());

// Register with custom config
const result = await page.evaluate(async () => {
  return await window.mockWallet.register({
    name: 'Test Wallet',
    url: 'https://test.local',
    protocols: ['openid4vp']
  });
});

// Verify state
const state = await page.evaluate(() => window.mockWallet.getState());
expect(state.registered).toBe(true);

// Register JWT verifier
await page.evaluate(async () => {
  return await window.mockWallet.registerVerifier();
});

// Check call history
const history = await page.evaluate(() => window.mockWallet.getCallHistory());
expect(history.length).toBeGreaterThan(0);
```

### Query Parameters

- `auto-register=false` - Disable automatic registration on load

### Default Configuration

```javascript
{
  name: 'Mock Wallet',
  url: 'https://mock-wallet.test.local',
  protocols: ['openid4vp', 'w3c-vc'],
  description: 'Mock wallet for integration testing',
  icon: '🧪',
  color: '#10b981'
}
```

### Call History Format

Each entry in the call history includes:

```javascript
{
  action: string,        // Action name (e.g., 'register', 'registerVerifier')
  data: Object,          // Request/response data
  timestamp: string      // ISO timestamp
}
```

### Debugging

The mock wallet logs to the browser console:

```javascript
[Mock Wallet] Initializing mock wallet...
[Mock Wallet] Registering wallet...
[Mock Wallet] JWT verifier called { jwt: '...', options: {...} }
```

Access the mock wallet interface in the browser console:

```javascript
window.mockWallet.getState()
window.mockWallet.getCallHistory()
```

## Future Fixtures

- `mock-verifier.html` - Mock verifier page for OpenID4VP requests
- `test-credentials.json` - Sample credential data for testing
