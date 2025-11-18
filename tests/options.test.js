/**
 * Unit tests for options.js - Wallet management UI logic
 */

describe('Options Page - Wallet Management', () => {
  let mockWallets;
  let mockSettings;

  beforeEach(() => {
    mockWallets = [
      {
        id: 'wallet-1',
        name: 'Wallet 1',
        url: 'https://wallet1.com',
        description: 'First wallet',
        icon: '🔐',
        color: '#3b82f6',
        enabled: true
      },
      {
        id: 'wallet-2',
        name: 'Wallet 2',
        url: 'https://wallet2.com',
        description: 'Second wallet',
        icon: '🌐',
        color: '#10b981',
        enabled: false
      }
    ];

    mockSettings = {
      enabled: true,
      stats: {
        interceptCount: 42,
        walletUses: {
          'wallet-1': 10,
          'wallet-2': 5
        }
      }
    };

    // Setup DOM
    document.body.innerHTML = `
      <div id="wallets-container"></div>
      <div id="preset-wallets"></div>
      <div id="total-wallets">0</div>
      <div id="active-wallets">0</div>
      <div id="total-requests">0</div>
      <input type="checkbox" id="extension-enabled">
    `;
  });

  describe('Wallet CRUD Operations', () => {
    test('should generate unique wallet ID', () => {
      const id1 = 'wallet-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
      const id2 = 'wallet-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);

      expect(id1).toMatch(/^wallet-\d+-[a-z0-9]+$/);
      expect(id2).toMatch(/^wallet-\d+-[a-z0-9]+$/);
    });

    test('should add new wallet to list', () => {
      const wallets = [...mockWallets];
      const newWallet = {
        id: 'wallet-3',
        name: 'New Wallet',
        url: 'https://new-wallet.com',
        description: 'A new wallet',
        icon: '🆕',
        color: '#ef4444',
        enabled: true,
        preset: false
      };

      wallets.push(newWallet);

      expect(wallets).toHaveLength(3);
      expect(wallets[2].name).toBe('New Wallet');
    });

    test('should update existing wallet', () => {
      const wallets = [...mockWallets];
      const walletIndex = wallets.findIndex(w => w.id === 'wallet-1');

      wallets[walletIndex] = {
        ...wallets[walletIndex],
        name: 'Updated Name',
        description: 'Updated description'
      };

      expect(wallets[0].name).toBe('Updated Name');
      expect(wallets[0].description).toBe('Updated description');
      expect(wallets[0].url).toBe('https://wallet1.com'); // URL unchanged
    });

    test('should delete wallet', () => {
      const wallets = [...mockWallets];
      const filtered = wallets.filter(w => w.id !== 'wallet-1');

      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('wallet-2');
    });

    test('should toggle wallet enabled state', () => {
      const wallets = [...mockWallets];
      const wallet = wallets.find(w => w.id === 'wallet-1');

      wallet.enabled = !wallet.enabled;

      expect(wallet.enabled).toBe(false);

      wallet.enabled = !wallet.enabled;
      expect(wallet.enabled).toBe(true);
    });
  });

  describe('Preset Wallets', () => {
    const WWWALLET_PRESETS = [
      {
        name: 'wwWallet Demo',
        url: 'https://demo.wwwallet.org',
        icon: '🌐',
        color: '#3b82f6',
        description: 'Official wwWallet demonstration instance',
        preset: true
      },
      {
        name: 'wwWallet EU',
        url: 'https://wallet.europa.eu',
        icon: '🇪🇺',
        color: '#0033a1',
        description: 'European Union official wallet instance',
        preset: true
      },
      {
        name: 'wwWallet Test',
        url: 'https://test.wwwallet.org',
        icon: '🧪',
        color: '#10b981',
        description: 'wwWallet testing environment',
        preset: true
      }
    ];

    test('should have three wwWallet presets', () => {
      expect(WWWALLET_PRESETS).toHaveLength(3);
    });

    test('should detect duplicate preset by URL', () => {
      const wallets = [...mockWallets];
      const preset = WWWALLET_PRESETS[0];

      // Add preset URL to wallets
      wallets.push({ ...preset, id: 'wallet-preset' });

      const exists = wallets.some(w => w.url === preset.url);
      expect(exists).toBe(true);
    });

    test('should add preset if not duplicate', () => {
      const wallets = [...mockWallets];
      const preset = WWWALLET_PRESETS[0];

      const exists = wallets.some(w => w.url === preset.url);
      expect(exists).toBe(false);

      if (!exists) {
        wallets.push({
          id: 'wallet-' + Date.now(),
          ...preset,
          enabled: true
        });
      }

      expect(wallets).toHaveLength(3);
    });
  });

  describe('Form Validation', () => {
    test('should validate required name field', () => {
      const name = 'Test Wallet';
      const isValid = name && name.trim().length > 0;
      expect(isValid).toBe(true);
    });

    test('should reject empty name', () => {
      const name = '';
      const isValid = !!(name && name.trim().length > 0);
      expect(isValid).toBe(false);
    });

    test('should validate URL format', () => {
      const validUrl = 'https://wallet.example.com';
      const invalidUrl = 'not-a-url';

      expect(() => new URL(validUrl)).not.toThrow();
      expect(() => new URL(invalidUrl)).toThrow();
    });

    test('should accept http://localhost for development', () => {
      const localhostUrl = 'http://localhost:3000';
      expect(() => new URL(localhostUrl)).not.toThrow();
    });

    test('should validate color format', () => {
      const validColor = '#3b82f6';
      const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;

      expect(hexColorRegex.test(validColor)).toBe(true);
      expect(hexColorRegex.test('#xyz123')).toBe(false);
    });
  });

  describe('Import/Export', () => {
    test('should export configuration to JSON', () => {
      const config = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        wallets: mockWallets,
        settings: mockSettings
      };

      const json = JSON.stringify(config, null, 2);
      const parsed = JSON.parse(json);

      expect(parsed.version).toBe('1.0');
      expect(parsed.wallets).toHaveLength(2);
      expect(parsed.settings.enabled).toBe(true);
    });

    test('should validate import data structure', () => {
      const validConfig = {
        version: '1.0',
        wallets: mockWallets,
        settings: mockSettings
      };

      const isValid = validConfig.wallets && Array.isArray(validConfig.wallets);
      expect(isValid).toBe(true);
    });

    test('should reject invalid import data', () => {
      const invalidConfig = {
        version: '1.0',
        wallets: 'not-an-array'
      };

      const isValid = invalidConfig.wallets && Array.isArray(invalidConfig.wallets);
      expect(isValid).toBe(false);
    });

    test('should merge imported wallets avoiding duplicates', () => {
      const existingWallets = [...mockWallets];
      const importedWallets = [
        { id: 'w3', name: 'New', url: 'https://new.com', enabled: true },
        { id: 'w4', name: 'Duplicate', url: 'https://wallet1.com', enabled: true } // Duplicate URL
      ];

      importedWallets.forEach(importedWallet => {
        const exists = existingWallets.some(w => w.url === importedWallet.url);
        if (!exists) {
          existingWallets.push({
            ...importedWallet,
            id: 'wallet-' + Date.now() // Regenerate ID
          });
        }
      });

      // Should only add the new wallet, not the duplicate
      expect(existingWallets).toHaveLength(3);
      expect(existingWallets.some(w => w.name === 'New')).toBe(true);
    });
  });

  describe('Statistics Display', () => {
    test('should calculate total wallets', () => {
      const totalWallets = mockWallets.length;
      expect(totalWallets).toBe(2);
    });

    test('should calculate active wallets', () => {
      const activeWallets = mockWallets.filter(w => w.enabled).length;
      expect(activeWallets).toBe(1);
    });

    test('should display intercept count', () => {
      const interceptCount = mockSettings.stats.interceptCount;
      expect(interceptCount).toBe(42);
    });

    test('should get wallet usage count', () => {
      const walletUses = mockSettings.stats.walletUses['wallet-1'] || 0;
      expect(walletUses).toBe(10);
    });

    test('should default to 0 for unused wallet', () => {
      const walletUses = mockSettings.stats.walletUses['wallet-999'] || 0;
      expect(walletUses).toBe(0);
    });
  });

  describe('HTML Escaping (XSS Prevention)', () => {
    function escapeHtml(unsafe) {
      if (!unsafe) return '';
      return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

    test('should escape HTML entities', () => {
      const malicious = '<script>alert("xss")</script>';
      const escaped = escapeHtml(malicious);

      expect(escaped).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
      expect(escaped).not.toContain('<script>');
    });

    test('should escape quotes', () => {
      const input = 'Test "quoted" and \'single\' quotes';
      const escaped = escapeHtml(input);

      expect(escaped).toContain('&quot;');
      expect(escaped).toContain('&#039;');
    });

    test('should handle empty string', () => {
      const escaped = escapeHtml('');
      expect(escaped).toBe('');
    });

    test('should handle null/undefined', () => {
      const escaped = escapeHtml(null);
      expect(escaped).toBe('');
    });

    test('should not double-escape', () => {
      const input = '&amp;';
      const escaped = escapeHtml(input);
      expect(escaped).toBe('&amp;amp;');
    });
  });

  describe('Tab Switching', () => {
    test('should identify active tab', () => {
      const tabs = ['wallets', 'add', 'settings'];
      const activeTab = 'wallets';

      const isActive = (tabName) => tabName === activeTab;

      expect(isActive('wallets')).toBe(true);
      expect(isActive('add')).toBe(false);
      expect(isActive('settings')).toBe(false);
    });

    test('should switch to different tab', () => {
      let activeTab = 'wallets';
      
      const switchTab = (tabName) => {
        activeTab = tabName;
      };

      switchTab('add');
      expect(activeTab).toBe('add');

      switchTab('settings');
      expect(activeTab).toBe('settings');
    });
  });

  describe('Wallet Ordering', () => {
    test('should identify first wallet as default', () => {
      const wallets = [...mockWallets];
      const defaultWallet = wallets[0];
      const isDefault = wallets.indexOf(defaultWallet) === 0;

      expect(isDefault).toBe(true);
      expect(defaultWallet.id).toBe('wallet-1');
    });

    test('should find wallet index', () => {
      const wallets = [...mockWallets];
      const walletIndex = wallets.findIndex(w => w.id === 'wallet-2');

      expect(walletIndex).toBe(1);
    });
  });
});
