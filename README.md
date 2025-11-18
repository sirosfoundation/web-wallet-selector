# Digital Credentials Wallet Selector - Cross-Browser Extension

A cross-browser extension that intercepts W3C Digital Credentials API calls (`navigator.credentials.get`) and provides users with the ability to choose between pre-configured digital identity wallets, or fall back to the browser's native implementation.

## 🎯 What It Does

This extension solves a key problem in the digital identity ecosystem: **wallet selection**. When a website requests credentials using the W3C Digital Credentials API, this extension:

1. **Intercepts the API call** - Captures calls to `navigator.credentials.get` for digital identity requests
2. **Presents a modal dialog** - Shows users a list of their configured wallet providers
3. **Allows wallet selection** - Users choose which wallet to use for the credential request
4. **Provides fallback** - Users can opt to use the browser's native digital credentials implementation
5. **Works across browsers** - Compatible with Chrome, Firefox, and Safari
6. **Manages multiple wallets** - Comprehensive wallet management with wwWallet integration

## 🔐 Use Case

The W3C Digital Credentials API allows websites to request verifiable credentials from digital identity wallets. However, browsers may not natively support multiple wallet providers, or users may want to use specific third-party wallets. This extension bridges that gap by:

- Enabling users to configure multiple wallet providers
- Giving users choice and control over which wallet handles each request
- Supporting wallet providers that might not be natively integrated with the browser
- Providing a consistent user experience across different browsers

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

Open `test-page.html` in your browser with the extension installed:

```bash
# Open the test page
open test-page.html  # macOS
xdg-open test-page.html  # Linux
start test-page.html  # Windows
```

The test page demonstrates:
- Basic digital identity credential requests
- Requests with specific claims
- Difference between digital identity and regular credential requests

## � Documentation

Comprehensive documentation is available in the [`docs/`](docs/) directory:

### Design Documents
- **[Protocol Support](docs/design/PROTOCOL_SUPPORT.md)** - Protocol-aware business logic, plugin architecture, and W3C Digital Credentials API implementation
  - Protocol filtering and request handling
  - Plugin system for custom protocols (OpenID4VP, mDoc, W3C VC)
  - `userAgentAllowsProtocol()` override implementation
  - Wallet registration with protocol support

### Brand Guidelines
- **[Branding Guide](docs/BRANDING.md)** - Logo usage, color palette, typography, and UI components
- **[Branding Updates](docs/BRANDING_UPDATE.md)** - Recent branding changes and asset generation

### Additional Resources
- Test coverage: 105/105 tests passing
- Built-in protocol support: OpenID4VP, mDoc OpenID4VP, W3C Verifiable Credentials
- Extensible plugin architecture for custom protocols

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
