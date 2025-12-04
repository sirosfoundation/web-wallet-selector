# Firefox Extension - Web Wallet Selector

This is the Firefox version of the Web Wallet Selector extension.

## Installation

### Development Mode

1. Open Firefox and navigate to `about:debugging`
2. Click "This Firefox" in the left sidebar
3. Click "Load Temporary Add-on"
4. Navigate to the `firefox` directory and select the `manifest.json` file

### Building for Production

Run the build script from the root directory:

```bash
npm run build:firefox
```

To create a signed XPI for distribution:

```bash
npm run package:firefox
```

## Firefox-Specific Features

- Uses the `browser` namespace (standard WebExtension API)
- Supports Manifest V2 (Firefox has extended V2 support)
- Includes `browser_specific_settings` for Firefox Add-ons ID
- Full support for `webRequest` API with blocking

## Files

- `manifest.json`: Extension configuration (Manifest V2)
- `background.js`: Background script (symlinked from src/)
- `content.js`: Content script (symlinked from src/)
- `popup.html`: Extension popup UI (symlinked from src/)
- `popup.js`: Popup logic (symlinked from src/)
- `icons/`: Extension icons

## Development Tips

- Firefox uses the `browser` namespace with Promise-based APIs
- Better developer tools for WebExtensions debugging
- `about:debugging` provides excellent debugging capabilities
- Use `web-ext` tool for easier development workflow

## Testing

Use the `web-ext` command line tool:

```bash
npm install -g web-ext
cd firefox
web-ext run
```

## Distribution

1. **Firefox Add-ons (AMO):**
   - Create an account at [addons.mozilla.org](https://addons.mozilla.org)
   - Submit your extension for review
   - Get it signed and published

2. **Self-Distribution:**
   - Build and sign your extension
   - Distribute the XPI file directly

## Resources

- [Firefox Extension Workshop](https://extensionworkshop.com/)
- [WebExtensions API](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions)
- [web-ext Documentation](https://extensionworkshop.com/documentation/develop/web-ext-command-reference/)
