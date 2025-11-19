# Digital Credentials Wallet Selector - Cross-Browser Extension

A cross-browser extension that intercepts W3C Digital Credentials API calls (`navigator.credentials.get`) and provides users with the ability to choose between pre-configured digital identity wallets, or fall back to the browser's native implementation.

## 🎯 What It Does

This extension solves a key problem in the digital identity ecosystem: **wallet selection**. When a website requests credentials using the W3C Digital Credentials API, this extension:

1. **Intercepts the API call** - Captures calls to `navigator.credentials.get` for digital identity requests
2. **Protocol-aware routing** - Filters wallets by supported protocols (OpenID4VP, mDoc, W3C VC)
3. **Presents a modal dialog** - Shows users a list of compatible wallet providers
4. **Allows wallet selection** - Users choose which wallet to use for the credential request
5. **OpenID4VP support** - Full implementation with JAR, Presentation Exchange, and DCQL
6. **JWT verification callbacks** - Wallets can provide their own signature verification
7. **Provides fallback** - Users can opt to use the browser's native digital credentials implementation
8. **Works across browsers** - Compatible with Chrome, Firefox, and Safari
9. **Manages multiple wallets** - Comprehensive wallet management with wwWallet integration

## 🔐 Use Case

The W3C Digital Credentials API allows websites to request verifiable credentials from digital identity wallets. However, browsers may not natively support multiple wallet providers, or users may want to use specific third-party wallets. This extension bridges that gap by:

- Enabling users to configure multiple wallet providers
- Giving users choice and control over which wallet handles each request
- Supporting wallet providers that might not be natively integrated with the browser
- Providing a consistent user experience across different browsers
- Implementing protocol-aware wallet filtering (OpenID4VP, mDoc, W3C VC)

## 🎯 Quick Reference for Developers

### For Verifiers (Websites Requesting Credentials)

Use the standard W3C Digital Credentials API with OpenID4VP protocol:

```javascript
const credential = await navigator.credentials.get({
  digital: {
    providers: [{
      protocol: "openid4vp",
      request: {
        client_id: "https://verifier.example.com",
        response_type: "vp_token",
        presentation_definition: { /* Presentation Exchange v2 */ }
      }
    }]
  }
});
```

### For Wallets (Self-Registration)

Register your wallet and JWT verifier:

```javascript
// Check extension is installed
if (window.DCWS?.isInstalled()) {
  // Register wallet
  await window.DCWS.registerWallet({
    name: 'MyWallet',
    url: 'https://wallet.example.com',
    protocols: ['openid4vp'],
    icon: '🔐',
    color: '#3b82f6'
  });
  
  // Register JWT verifier
  window.DCWS.registerJWTVerifier(
    'https://wallet.example.com',
    async (jwt, options) => {
      // Your crypto library verification
      return { valid: true, payload: decoded };
    }
  );
}
```

**📖 See [API Overview](#-quick-start-api-overview) for complete documentation.**



## ✨ Key Features

### Wallet Management
- **Multiple Wallet Support**: Configure unlimited wallet providers
- **wwWallet Integration**: Pre-configured presets for wwWallet (Demo, EU, Test)
- **Custom Wallets**: Add any web-based digital identity wallet
- **Auto-Registration API**: Wallets can register themselves automatically
- **Visual Organization**: Wallet cards with icons, colors, and descriptions
- **Enable/Disable**: Temporarily disable wallets without deletion
- **Usage Statistics**: Track wallet usage and credential requests
- **Import/Export**: Backup or share wallet configurations

### User Experience
- **Beautiful Modal UI**: Clean, modern wallet selection interface
- **Instant Setup**: One-click preset installation for wwWallet
- **Browser Integration**: Works seamlessly across Chrome, Firefox, and Safari
- **Fallback Support**: Option to use browser's native DC API implementation
- **Real-time Stats**: Track interception counts and wallet usage

### Developer Friendly
- **Auto-Registration API**: JavaScript API for wallets to self-register
- **Easy Testing**: Included test pages for DC API and wallet registration
- **Comprehensive Docs**: Detailed documentation for all features
- **Build Automation**: Makefile and npm scripts for all workflows
- **Watch Mode**: Auto-rebuild during development
- **Cross-browser**: Single codebase for all platforms

## 📋 Implementation Status

### ✅ Completed Features

**Core Infrastructure:**
- ✅ W3C Digital Credentials API interception (`navigator.credentials.get`)
- ✅ Cross-browser support (Chrome, Firefox, Safari)
- ✅ Protocol plugin architecture for extensible protocol support
- ✅ Wallet selection modal UI with filtering
- ✅ Protocol-aware wallet filtering

**OpenID4VP Protocol (Full Implementation):**
- ✅ **Request Parsing**: URL parameters, JAR (JWT-secured Authorization Request), Presentation Exchange, DCQL
- ✅ **Client ID Schemes**: `x509_san_dns`, `https` URLs with validation
- ✅ **Response Modes**: `direct_post`, `direct_post.jwt` (encrypted)
- ✅ **JAR Support**: `request_uri` fetching and JWT verification
- ✅ **Presentation Exchange**: v2.0 with descriptor maps and input descriptors
- ✅ **DCQL**: Query language support for credential requests
- ✅ **Response Validation**: `vp_token` and `presentation_submission` structure validation
- ✅ **JWT Verification Callbacks**: Wallets can provide signature verification functions

**Wallet Management:**
- ✅ Auto-registration API for wallets (`window.DCWS.registerWallet()`)
- ✅ JWT verification callback registration (`window.DCWS.registerJWTVerifier()`)
- ✅ Protocol support declaration per wallet
- ✅ Wallet enable/disable without deletion
- ✅ Pre-configured wwWallet instances (Demo, EU, Test)
- ✅ Import/Export wallet configurations
- ✅ Usage statistics tracking

**Testing & Documentation:**
- ✅ 146 passing unit tests (Jest)
- ✅ OpenID4VP: 36 comprehensive tests
- ✅ JWT verification: 21 callback tests
- ✅ Integration tests with Puppeteer
- ✅ Complete API documentation
- ✅ Implementation guides and examples

### 🚧 Future Enhancements

**Additional Protocols:**
- ⏭️ mDoc OpenID4VP protocol plugin
- ⏭️ W3C Verifiable Credentials protocol plugin
- ⏭️ ISO/IEC 18013-5 mDoc protocol
- ⏭️ Custom protocol plugin templates

**Advanced Features:**
- ⏭️ Response encryption/decryption callbacks
- ⏭️ Credential caching and management
- ⏭️ Multi-credential presentation flows
- ⏭️ Protocol negotiation and fallbacks

## 🚀 Quick Start: API Overview

### Digital Credentials API (Website/Verifier Side)

The extension intercepts standard W3C Digital Credentials API calls. Websites request credentials using the native browser API:

```javascript
// Basic credential request
const credential = await navigator.credentials.get({
  digital: {
    providers: [{
      protocol: "openid4vp",
      request: {
        // OpenID4VP authorization request
        client_id: "https://verifier.example.com",
        client_id_scheme: "https",
        response_type: "vp_token",
        response_mode: "direct_post",
        response_uri: "https://verifier.example.com/callback",
        nonce: "n-0S6_WzA2Mj",
        presentation_definition: {
          id: "example-request",
          input_descriptors: [{
            id: "id_credential",
            format: { jwt_vp: { alg: ["ES256"] } },
            constraints: {
              fields: [{
                path: ["$.vc.type"],
                filter: { type: "string", const: "IdentityCredential" }
              }]
            }
          }]
        }
      }
    }]
  }
});
```

**Supported Protocol Features:**

#### OpenID4VP Protocol

**Request Formats:**
```javascript
// 1. Direct parameters (inline)
const credential = await navigator.credentials.get({
  digital: {
    providers: [{
      protocol: "openid4vp",
      request: {
        client_id: "https://verifier.example.com",
        response_type: "vp_token",
        presentation_definition: { /* ... */ }
      }
    }]
  }
});

// 2. JAR - JWT-secured Authorization Request (by reference)
const credential = await navigator.credentials.get({
  digital: {
    providers: [{
      protocol: "openid4vp",
      request: {
        client_id: "https://verifier.example.com",
        request_uri: "https://verifier.example.com/request/abc123"
      }
    }]
  }
});

// 3. DCQL - Digital Credentials Query Language
const credential = await navigator.credentials.get({
  digital: {
    providers: [{
      protocol: "openid4vp",
      request: {
        client_id: "https://verifier.example.com",
        dcql_query: {
          credentials: [{
            id: "org.example.driver_license",
            claims: [
              { path: ["document_number"] },
              { path: ["driving_privileges"] }
            ]
          }]
        }
      }
    }]
  }
});
```

**Client ID Schemes:**
- `x509_san_dns` - X.509 certificate with DNS SAN (preferred for production)
- `https` - HTTPS URL (must match request origin)
- `redirect_uri` - OAuth 2.0 redirect URI (legacy support)

**Response Modes:**
- `direct_post` - HTTP POST to response_uri
- `direct_post.jwt` - Encrypted JWT POST to response_uri
- `fragment` - URL fragment (limited support)

### Wallet Registration API

Wallets can auto-register themselves with the extension using the `window.DCWS` (Digital Credentials Wallet Selector) API.

#### Basic Registration

```javascript
// Check if extension is installed
if (window.DCWS?.isInstalled()) {
  // Register your wallet
  const result = await window.DCWS.registerWallet({
    name: 'MyWallet',
    url: 'https://wallet.example.com',
    protocols: ['openid4vp', 'w3c-vc'],  // Required: supported protocols
    description: 'My digital identity wallet',
    icon: '🔐',  // Emoji or URL to icon
    color: '#3b82f6'  // Brand color
  });
  
  if (result.success) {
    console.log('Wallet registered successfully');
  }
}
```

#### JWT Verification Callbacks

Wallets can provide their own JWT signature verification to avoid bundling crypto libraries in the extension:

```javascript
// Register a JWT verification callback
window.DCWS.registerJWTVerifier(
  'https://wallet.example.com',
  async (jwt, options) => {
    try {
      // Use your wallet's crypto library to verify the JWT
      const result = await myWalletCrypto.verifyJWT(jwt, options);
      
      return {
        valid: true,
        payload: result.payload,
        header: result.header
      };
    } catch (error) {
      return {
        valid: false,
        error: error.message
      };
    }
  }
);
```

**JWT Verification Options:**

The `options` parameter passed to your verifier includes:

```typescript
{
  publicKey?: string;      // PEM-formatted public key
  certificate?: string;    // PEM-formatted X.509 certificate
  algorithm?: string;      // Expected algorithm (e.g., 'ES256', 'RS256')
  issuer?: string;        // Expected issuer
  audience?: string;      // Expected audience
}
```

**Using JWT Verifier with OpenID4VP:**

When the extension fetches a JAR (JWT Authorization Request), it will automatically use the registered verifier:

```javascript
// Extension code internally does:
const plugin = new OpenID4VPPlugin();
const request = await plugin.handleRequestUri(
  'https://verifier.example.com/request/abc123',
  {
    jwtVerifier: walletProvidedVerifier  // Uses your callback
  }
);
```

### Complete Wallet API Reference

```javascript
window.DCWS = {
  /**
   * Check if extension is installed
   * @returns {boolean}
   */
  isInstalled: function() { /* ... */ },
  
  /**
   * Register a wallet with the extension
   * @param {Object} walletInfo
   * @param {string} walletInfo.name - Display name
   * @param {string} walletInfo.url - Wallet endpoint URL
   * @param {string[]} walletInfo.protocols - Supported protocols (e.g., ['openid4vp'])
   * @param {string} [walletInfo.description] - Optional description
   * @param {string} [walletInfo.icon] - Optional icon (emoji or URL)
   * @param {string} [walletInfo.color] - Optional brand color (hex)
   * @returns {Promise<{success: boolean, alreadyRegistered: boolean, wallet: Object}>}
   */
  registerWallet: async function(walletInfo) { /* ... */ },
  
  /**
   * Check if a wallet is already registered
   * @param {string} url - Wallet URL to check
   * @returns {Promise<boolean>}
   */
  isWalletRegistered: async function(url) { /* ... */ },
  
  /**
   * Register a JWT verification callback
   * @param {string} walletUrl - Wallet URL
   * @param {Function} verifyCallback - async (jwt, options) => {valid, payload?, error?}
   * @returns {boolean} Success
   */
  registerJWTVerifier: function(walletUrl, verifyCallback) { /* ... */ },
  
  /**
   * Unregister a JWT verification callback
   * @param {string} walletUrl - Wallet URL
   * @returns {boolean} True if removed
   */
  unregisterJWTVerifier: function(walletUrl) { /* ... */ },
  
  /**
   * Get list of wallets with registered JWT verifiers
   * @returns {string[]} Array of wallet URLs
   */
  getRegisteredJWTVerifiers: function() { /* ... */ }
};
```

### Wallet Integration Example

Complete example of wallet integrating with the extension:

```javascript
// wallet-integration.js
(async function() {
  // Wait for extension to be ready
  if (!window.DCWS?.isInstalled()) {
    console.log('Extension not installed');
    return;
  }
  
  // Check if already registered
  const walletUrl = 'https://wallet.example.com';
  const isRegistered = await window.DCWS.isWalletRegistered(walletUrl);
  
  if (!isRegistered) {
    // Register the wallet
    await window.DCWS.registerWallet({
      name: 'Example Wallet',
      url: walletUrl,
      protocols: ['openid4vp', 'w3c-vc'],
      description: 'Secure digital identity wallet with biometric support',
      icon: 'https://wallet.example.com/icon.png',
      color: '#1a73e8'
    });
  }
  
  // Register JWT verifier using wallet's crypto library
  window.DCWS.registerJWTVerifier(walletUrl, async (jwt, options) => {
    // Import your wallet's crypto functions
    const { verifyJWT } = await import('./crypto.js');
    
    try {
      const result = await verifyJWT(jwt, {
        publicKey: options.publicKey,
        certificate: options.certificate,
        algorithm: options.algorithm || 'ES256'
      });
      
      return {
        valid: true,
        payload: result.payload,
        header: result.header
      };
    } catch (error) {
      return {
        valid: false,
        error: error.message
      };
    }
  });
  
  console.log('Wallet integration complete');
})();
```

### OpenID4VP Implementation Details

The extension provides comprehensive OpenID4VP support based on the wwWallet reference implementation:

**Features:**
- ✅ **Multiple Request Formats**: Direct parameters, JAR (request_uri), Presentation Exchange, DCQL
- ✅ **Client Authentication**: X.509 certificates (x509_san_dns), HTTPS URLs
- ✅ **JAR Validation**: Automatic JWT fetching and verification (with wallet callbacks)
- ✅ **Presentation Exchange v2.0**: Full support for input descriptors and descriptor maps
- ✅ **Response Validation**: Validates vp_token format and presentation_submission structure
- ✅ **Security**: Client ID validation, nonce support, state parameter handling

**Request Flow:**
1. Website calls `navigator.credentials.get()` with `protocol: "openid4vp"`
2. Extension detects OpenID4VP protocol
3. Extension filters wallets supporting `openid4vp`
4. User selects wallet from filtered list
5. Extension prepares and validates the authorization request
6. If using JAR (`request_uri`), fetches and verifies JWT
7. Extension formats request as authorization URL
8. Wallet processes request and returns credential

**For detailed OpenID4VP documentation, see:**
- [OpenID4VP Implementation Guide](docs/design/OPENID4VP_IMPLEMENTATION.md)
- [OpenID4VP Summary](docs/design/OPENID4VP_SUMMARY.md)
- [JWT Verification Callbacks](docs/design/JWT_VERIFICATION_CALLBACKS.md)



## 📁 Project Structure

```
browser-extensions/
├── src/                    # Shared source code
│   ├── background.js       # Background script (service worker)
│   ├── content.js          # Content script (bridge)
│   ├── inject.js           # Page context (DC API interception)
│   ├── protocols.js        # Protocol plugin system
│   ├── modal.js            # Wallet selection modal UI
│   ├── popup.html/js       # Extension popup and stats
│   ├── options.html/js     # Wallet management options page
│   └── icons/              # Source icons and logos (SVG)
├── chrome/                 # Chrome extension (built)
├── firefox/                # Firefox extension (built)
├── safari/                 # Safari extension (built)
├── scripts/                # Build and development scripts
│   ├── build.js            # Build automation
│   ├── watch.js            # Development watch mode
│   └── generate-icons.js   # Icon generation from SVG
├── tests/                  # Test suites
│   ├── *.test.js           # Unit tests (Jest)
│   └── integration.test.js # Integration tests (Puppeteer)
├── docs/                   # Documentation
│   ├── design/             # Design documents
│   │   └── PROTOCOL_SUPPORT.md  # Protocol architecture
│   ├── BRANDING.md         # Brand guidelines
│   └── BRANDING_UPDATE.md  # Branding changelog
├── test-page.html          # DC API test page
├── test-wallet-api.html    # Wallet registration test
├── Makefile                # Build automation
├── package.json            # Dependencies and scripts
└── README.md               # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Browser-specific requirements:
  - **Chrome**: Chrome browser with Developer mode enabled
  - **Firefox**: Firefox browser
  - **Safari**: macOS with Xcode (for Safari Web Extension conversion)

### Installation

1. Clone the repository:
   ```bash
   cd /home/leifj/work/siros.org/browser-extensions
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build for your target browser:
   ```bash
   # Build for all browsers
   npm run build

   # Or build for specific browser
   npm run build:chrome
   npm run build:firefox
   npm run build:safari
   ```

## 🔧 Development

### Chrome

1. Build the extension:
   ```bash
   npm run build:chrome
   ```

2. Load in Chrome:
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `chrome` directory

3. Watch mode (auto-rebuild on changes):
   ```bash
   npm run watch:chrome
   ```

### Firefox

1. Build the extension:
   ```bash
   npm run build:firefox
   ```

2. Load in Firefox:
   - Open `about:debugging#/runtime/this-firefox`
   - Click "Load Temporary Add-on"
   - Select `manifest.json` from the `firefox` directory

3. Or use web-ext for development:
   ```bash
   npm run dev:firefox
   ```

4. Watch mode:
   ```bash
   npm run watch:firefox
   ```

### Safari

1. Build the extension:
   ```bash
   npm run build:safari
   ```

2. Convert to Safari Web Extension (first time only):
   ```bash
   xcrun safari-web-extension-converter safari/ --app-name "DC API Interceptor"
   ```

3. Open the generated Xcode project and run it

4. Enable in Safari:
   - Safari → Preferences → Extensions
   - Enable "DC API Interceptor"

## 📦 Building for Production

You can use either `make` commands or `npm` scripts:

### Using Make (Recommended)

```bash
# Build all extensions
make build

# Build specific browser
make build-chrome
make build-firefox
make build-safari

# Package for distribution
make package              # Package Chrome and Firefox
make package-chrome       # Chrome only
make package-firefox      # Firefox only

# Build and package everything
make all
```

### Using npm

```bash
# Build
npm run build:chrome
npm run build:firefox
npm run build:safari

# Package
npm run package:chrome    # Creates chrome-extension.zip
npm run package:firefox   # Creates firefox-extension.xpi
```

### Chrome

```bash
make package-chrome
```

Creates a `chrome-extension.zip` file in the `dist/` directory ready for Chrome Web Store submission.

### Firefox

```bash
make package-firefox
```

Creates a `firefox-extension.xpi` file in the `dist/` directory ready for Firefox Add-ons submission.

### Safari

Use Xcode to archive and export the app for Mac App Store or direct distribution.

## 🛠️ Customization

### Configure Digital Wallet Providers

The extension includes a comprehensive wallet management system with a dedicated options page. Users can easily configure multiple wallet providers through an intuitive interface.

**Quick Access:**
1. Click the extension icon in your browser
2. Click "Configure Wallets" button
3. Or right-click the extension → Options

**Features:**
- ✅ **Pre-configured wwWallet instances** (Demo, EU, Test)
- ✅ **Custom wallet configuration** with full details
- ✅ **Wallet enable/disable** without deletion
- ✅ **Usage statistics** per wallet
- ✅ **Import/Export** configuration for backup or sharing
- ✅ **Visual wallet cards** with icons and colors

**Options Page Tabs:**
1. **My Wallets**: View and manage all configured wallets
2. **Add Wallet**: Quick-add wwWallet presets or create custom wallets
3. **Settings**: Extension status, statistics, import/export

**For wwWallet Users:**

The extension comes with three pre-configured wwWallet instances ready to use:
- **wwWallet Demo**: `https://demo.wwwallet.org` - Official demonstration
- **wwWallet EU**: `https://wallet.europa.eu` - European Union instance
- **wwWallet Test**: `https://test.wwwallet.org` - Testing environment

Simply click any preset to add it instantly, or add your own custom wwWallet instance.

**For Developers:**

You can also programmatically configure default wallets by editing `src/background.js`:

```javascript
const DEFAULT_WALLETS = [
  {
    id: 'my-wallet',
    name: 'My Digital Wallet',
    url: 'https://wallet.example.com',
    icon: '🔐',
    color: '#3b82f6',
    description: 'My preferred digital identity wallet',
    enabled: true
  }
];
```

**Detailed Guide:**

For complete wallet management documentation, see [WALLET_MANAGEMENT.md](WALLET_MANAGEMENT.md).

### Wallet Auto-Registration API

Digital wallet providers can automatically register themselves with the extension using a JavaScript API. This enables seamless integration without requiring users to manually configure wallets.

**Quick Example:**
```javascript
// Check if extension is installed
if (window.DCWS?.isInstalled()) {
  // Register your wallet
  await window.DCWS.registerWallet({
    name: 'MyWallet',
    url: 'https://wallet.example.com',
    description: 'My digital identity wallet',
    icon: '🔐',
    color: '#3b82f6'
  });
}
```

**Key Features:**
- ✅ Auto-detect extension presence
- ✅ Register wallet with name, URL, logo, and branding
- ✅ Duplicate prevention (by URL)
- ✅ User retains full control (can disable/delete auto-registered wallets)

**For Wallet Developers:**

See [WALLET_API.md](WALLET_API.md) for complete API documentation including:
- Detection methods
- Registration API reference
- Integration examples (vanilla JS, React)
- Best practices and security considerations
- wwWallet integration guide

**Test the API:**

Open `test-wallet-api.html` to test the auto-registration flow:
```bash
open test-wallet-api.html  # macOS
xdg-open test-wallet-api.html  # Linux
start test-wallet-api.html  # Windows
```

### Testing the Extension

#### Interactive Test Pages

**1. Digital Credentials API Test (`test-page.html`)**

Test basic DC API interception and wallet selection:

```bash
# Open the test page
open test-page.html  # macOS
xdg-open test-page.html  # Linux
start test-page.html  # Windows
```

Features demonstrated:
- Basic digital identity credential requests
- Requests with specific claims
- Protocol-specific requests (OpenID4VP)
- Difference between digital identity and regular credential requests

**2. Wallet Auto-Registration Test (`test-wallet-api.html`)**

Test the wallet registration API:

```bash
open test-wallet-api.html  # macOS
xdg-open test-wallet-api.html  # Linux
start test-wallet-api.html  # Windows
```

Features demonstrated:
- Extension detection (`DCWS.isInstalled()`)
- Wallet registration with protocols
- JWT verifier registration
- API error handling

#### Unit Tests

Run the complete test suite:

```bash
# Run all tests
npm test

# Run specific test suites
npm test -- tests/openid4vp.test.js       # 36 OpenID4VP tests
npm test -- tests/jwt-verification.test.js # 21 JWT callback tests

# Run with coverage
npm run test:coverage
```

**Test Coverage:**
- ✅ 146/146 tests passing (100% success rate)
- ✅ OpenID4VP: Request parsing, JAR handling, response validation
- ✅ JWT Verification: Registration, callback execution, integration
- ✅ Protocol plugins: Registration, filtering, request processing
- ✅ Wallet management: Registration, protocol matching, auto-registration

## 📚 Documentation

Comprehensive documentation is available in the [`docs/`](docs/) directory:

### API Documentation

- **[Wallet API Guide](WALLET_API.md)** - Complete wallet auto-registration API reference
- **[Wallet Management Guide](WALLET_MANAGEMENT.md)** - User guide for managing wallets in the extension

### OpenID4VP Protocol

- **[OpenID4VP Implementation](docs/design/OPENID4VP_IMPLEMENTATION.md)** - Complete technical documentation
  - Architecture and request/response flows
  - Parameter reference and validation rules
  - JAR (JWT Authorization Request) handling
  - Presentation Exchange v2.0 support
  - DCQL (Digital Credentials Query Language)
  - Security considerations and best practices
  - Testing guide with examples
  
- **[OpenID4VP Summary](docs/design/OPENID4VP_SUMMARY.md)** - Executive summary
  - Problem statement and solution overview
  - Key features and capabilities
  - Usage examples
  - Test coverage (36 tests)

### JWT Verification System

- **[JWT Verification Callbacks](docs/design/JWT_VERIFICATION_CALLBACKS.md)** - Complete callback API documentation
  - Architecture and security model
  - API reference with callback signatures
  - Wallet implementation examples
  - Certificate validation patterns
  - Performance optimization tips
  - Troubleshooting guide
  
- **[JWT Verification Summary](docs/design/JWT_VERIFICATION_SUMMARY.md)** - Executive summary
  - Problem and solution overview
  - API quick reference
  - Integration examples
  - Benefits and security considerations

### Design Documents

- **[Protocol Support Architecture](docs/design/PROTOCOL_SUPPORT.md)** - Protocol plugin system
  - Plugin architecture and interfaces
  - Protocol filtering and wallet matching
  - W3C Digital Credentials API implementation
  - Custom protocol development guide

- **[Auto-Registration Summary](docs/design/AUTO_REGISTRATION_SUMMARY.md)** - Wallet auto-registration system
  - API design and security
  - Integration patterns
  - Best practices

### Brand Guidelines

- **[Branding Guide](docs/BRANDING.md)** - Logo usage, color palette, typography, and UI components
- **[Branding Updates](docs/BRANDING_UPDATE.md)** - Recent branding changes and asset generation

### Testing

- **Test Coverage**: 146/146 tests passing (100% success rate)
  - Protocol tests: 36 OpenID4VP tests
  - JWT verification: 21 callback tests
  - Integration tests: 89 core tests
- **Test Files**: All tests in `tests/` directory with Jest framework
- **Test Pages**: `test-page.html` (DC API), `test-wallet-api.html` (wallet registration)

## �📝 Configuration

Each browser has its own `manifest.json` with browser-specific configurations:

- **Chrome**: Uses Manifest V3 with service workers
- **Firefox**: Uses Manifest V2 with background scripts
- **Safari**: Uses Manifest V2 compatible with Safari Web Extensions

## 🔍 Debugging

- **Chrome**: Use DevTools → Extensions → Inspect views
- **Firefox**: Use `about:debugging` → Inspect
- **Safari**: Use Develop menu → Show Extension Background Page

## 📄 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📚 Resources

- [Chrome Extension Documentation](https://developer.chrome.com/docs/extensions/)
- [Firefox Extension Workshop](https://extensionworkshop.com/)
- [Safari Web Extensions](https://developer.apple.com/documentation/safariservices/safari_web_extensions)

## ⚠️ Important Notes

1. **Permissions**: The extension requests broad permissions to intercept API calls. Review and adjust permissions based on your needs.

2. **DC API URL Patterns**: Update the URL patterns in the source code to match your actual DC API endpoints.

3. **Icons**: Add your own extension icons to the `icons/` directories for each browser.

4. **Extension ID**: Update the Firefox extension ID in `firefox/manifest.json` to your own.

5. **Privacy**: Ensure your extension complies with browser store policies and privacy regulations.

## 🐛 Troubleshooting

### Extension not loading
- Ensure all files are built (run `npm run build`)
- Check browser console for errors
- Verify manifest.json syntax

### API calls not intercepted
- Check URL patterns in `isDCApiCall()` functions
- Verify permissions in manifest.json
- Check content script injection timing

### Changes not reflected
- Reload the extension in browser
- Use watch mode for automatic rebuilds
- Clear browser cache if needed
