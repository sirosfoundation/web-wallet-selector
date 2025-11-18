/**
 * Options page script for Digital Wallet Configuration
 */

// Cross-browser compatibility
const storage = typeof browser !== 'undefined' ? browser.storage : chrome.storage;
const runtime = typeof browser !== 'undefined' ? browser.runtime : chrome.runtime;

// wwWallet preset providers
const WWWALLET_PRESETS = [
  {
    name: 'wwWallet Demo',
    url: 'https://demo.wwwallet.org',
    icon: '🌐',
    color: '#1C4587',
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

let wallets = [];
let settings = { enabled: true, stats: { interceptCount: 0, walletUses: {} } };

// Initialize
document.addEventListener('DOMContentLoaded', async function() {
  await loadData();
  setupEventListeners();
  renderAll();
});

/**
 * Load wallets and settings from storage
 */
async function loadData() {
  try {
    const walletsResponse = await runtime.sendMessage({ type: 'GET_WALLETS' });
    const settingsResponse = await runtime.sendMessage({ type: 'GET_SETTINGS' });
    
    wallets = walletsResponse.wallets || [];
    settings = settingsResponse || { enabled: true, stats: { interceptCount: 0, walletUses: {} } };
  } catch (error) {
    console.error('Failed to load data:', error);
    showNotification('Failed to load data', 'error');
  }
}

/**
 * Setup all event listeners
 */
function setupEventListeners() {
  // Tab switching
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', function() {
      switchTab(this.dataset.tab);
    });
  });

  // Add wallet button
  document.getElementById('add-wallet-btn').addEventListener('click', function() {
    switchTab('add');
  });

  // Add wallet form
  document.getElementById('add-wallet-form').addEventListener('submit', handleAddWallet);

  // Edit modal
  document.getElementById('cancel-edit').addEventListener('click', closeEditModal);
  document.getElementById('save-edit').addEventListener('click', handleSaveEdit);

  // Settings
  document.getElementById('extension-enabled').addEventListener('change', handleToggleEnabled);
  document.getElementById('clear-stats').addEventListener('click', handleClearStats);
  document.getElementById('export-config').addEventListener('click', handleExportConfig);
  document.getElementById('import-config').addEventListener('change', handleImportConfig);

  // Close modal on outside click
  document.getElementById('edit-modal').addEventListener('click', function(e) {
    if (e.target === this) {
      closeEditModal();
    }
  });
}

/**
 * Switch between tabs
 */
function switchTab(tabName) {
  // Update tab buttons
  document.querySelectorAll('.tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.tab === tabName);
  });

  // Update tab content
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.toggle('active', content.id === `${tabName}-tab`);
  });
}

/**
 * Render all content
 */
function renderAll() {
  renderWallets();
  renderPresets();
  renderStats();
  renderSettings();
}

/**
 * Render wallets list
 */
function renderWallets() {
  const container = document.getElementById('wallets-container');
  
  if (wallets.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🔐</div>
        <div class="empty-state-title">No wallets configured</div>
        <div class="empty-state-text">Add your first digital wallet to get started</div>
        <button class="btn" onclick="switchTab('add')">Add Your First Wallet</button>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="wallet-grid">
      ${wallets.map(wallet => renderWalletCard(wallet)).join('')}
    </div>
  `;

  // Attach event listeners to wallet actions
  wallets.forEach((wallet, index) => {
    const card = container.querySelector(`[data-wallet-id="${wallet.id}"]`);
    if (card) {
      card.querySelector('.btn-edit').addEventListener('click', () => openEditModal(wallet));
      card.querySelector('.btn-delete').addEventListener('click', () => handleDeleteWallet(wallet.id));
      card.querySelector('.btn-toggle').addEventListener('click', () => handleToggleWallet(wallet.id));
    }
  });
}

/**
 * Render a single wallet card
 */
function renderWalletCard(wallet) {
  const uses = settings.stats.walletUses[wallet.id] || 0;
  const isDefault = wallets.findIndex(w => w.id === wallet.id) === 0;
  
  return `
    <div class="wallet-card ${wallet.enabled ? '' : 'disabled'}" data-wallet-id="${wallet.id}">
      <div class="wallet-header">
        <div class="wallet-icon" style="background-color: ${wallet.color || '#1C4587'}">
          ${wallet.icon || '🔐'}
        </div>
        <div class="wallet-info">
          <div class="wallet-name">${escapeHtml(wallet.name)}</div>
          <div class="wallet-url">${escapeHtml(wallet.url)}</div>
        </div>
      </div>
      
      ${wallet.description ? `<div class="wallet-description">${escapeHtml(wallet.description)}</div>` : ''}
      
      <div class="wallet-meta">
        ${wallet.enabled ? '<span class="badge badge-success">Active</span>' : '<span class="badge badge-warning">Disabled</span>'}
        ${isDefault ? '<span class="badge badge-info">Default</span>' : ''}
        ${wallet.preset ? '<span class="badge badge-info">wwWallet</span>' : ''}
        ${uses > 0 ? `<span class="badge badge-info">Used ${uses}x</span>` : ''}
      </div>
      
      <div class="wallet-actions">
        <button class="btn btn-small btn-secondary btn-edit">Edit</button>
        <button class="btn btn-small btn-secondary btn-toggle">${wallet.enabled ? 'Disable' : 'Enable'}</button>
        <button class="btn btn-small btn-danger btn-delete">Delete</button>
      </div>
    </div>
  `;
}

/**
 * Render preset wallets
 */
function renderPresets() {
  const container = document.getElementById('preset-wallets');
  
  container.innerHTML = WWWALLET_PRESETS.map(preset => `
    <div class="preset-card" data-preset='${JSON.stringify(preset)}'>
      <div class="preset-icon">${preset.icon}</div>
      <div class="preset-name">${escapeHtml(preset.name)}</div>
    </div>
  `).join('');

  // Attach click handlers
  container.querySelectorAll('.preset-card').forEach(card => {
    card.addEventListener('click', function() {
      const preset = JSON.parse(this.dataset.preset);
      addPresetWallet(preset);
    });
  });
}

/**
 * Render statistics
 */
function renderStats() {
  document.getElementById('total-wallets').textContent = wallets.length;
  document.getElementById('active-wallets').textContent = wallets.filter(w => w.enabled).length;
  document.getElementById('total-requests').textContent = settings.stats.interceptCount || 0;
}

/**
 * Render settings
 */
function renderSettings() {
  document.getElementById('extension-enabled').checked = settings.enabled !== false;
}

/**
 * Add preset wallet
 */
async function addPresetWallet(preset) {
  // Check if this preset already exists
  const exists = wallets.some(w => w.url === preset.url);
  if (exists) {
    showNotification(`${preset.name} is already configured`, 'warning');
    return;
  }

  const wallet = {
    id: generateId(),
    name: preset.name,
    url: preset.url,
    icon: preset.icon,
    color: preset.color,
    description: preset.description,
    enabled: true,
    preset: true
  };

  wallets.push(wallet);
  await saveWallets();
  renderAll();
  showNotification(`${preset.name} added successfully`, 'success');
  switchTab('wallets');
}

/**
 * Handle add wallet form submission
 */
async function handleAddWallet(e) {
  e.preventDefault();

  const wallet = {
    id: generateId(),
    name: document.getElementById('wallet-name').value,
    url: document.getElementById('wallet-url').value,
    description: document.getElementById('wallet-description').value,
    icon: document.getElementById('wallet-icon').value || '🔐',
    color: document.getElementById('wallet-color').value,
    enabled: document.getElementById('wallet-enabled').checked,
    preset: false
  };

  wallets.push(wallet);
  await saveWallets();
  
  e.target.reset();
  renderAll();
  showNotification(`${wallet.name} added successfully`, 'success');
  switchTab('wallets');
}

/**
 * Open edit modal
 */
function openEditModal(wallet) {
  document.getElementById('edit-wallet-id').value = wallet.id;
  document.getElementById('edit-wallet-name').value = wallet.name;
  document.getElementById('edit-wallet-url').value = wallet.url;
  document.getElementById('edit-wallet-description').value = wallet.description || '';
  document.getElementById('edit-wallet-icon').value = wallet.icon || '';
  document.getElementById('edit-wallet-color').value = wallet.color || '#1C4587';
  document.getElementById('edit-wallet-enabled').checked = wallet.enabled;
  
  document.getElementById('edit-modal').classList.add('active');
}

/**
 * Close edit modal
 */
function closeEditModal() {
  document.getElementById('edit-modal').classList.remove('active');
}

/**
 * Handle save edit
 */
async function handleSaveEdit() {
  const walletId = document.getElementById('edit-wallet-id').value;
  const walletIndex = wallets.findIndex(w => w.id === walletId);
  
  if (walletIndex === -1) return;

  wallets[walletIndex] = {
    ...wallets[walletIndex],
    name: document.getElementById('edit-wallet-name').value,
    url: document.getElementById('edit-wallet-url').value,
    description: document.getElementById('edit-wallet-description').value,
    icon: document.getElementById('edit-wallet-icon').value,
    color: document.getElementById('edit-wallet-color').value,
    enabled: document.getElementById('edit-wallet-enabled').checked
  };

  await saveWallets();
  closeEditModal();
  renderAll();
  showNotification('Wallet updated successfully', 'success');
}

/**
 * Handle delete wallet
 */
async function handleDeleteWallet(walletId) {
  if (!confirm('Are you sure you want to delete this wallet?')) {
    return;
  }

  wallets = wallets.filter(w => w.id !== walletId);
  await saveWallets();
  renderAll();
  showNotification('Wallet deleted successfully', 'success');
}

/**
 * Handle toggle wallet
 */
async function handleToggleWallet(walletId) {
  const wallet = wallets.find(w => w.id === walletId);
  if (!wallet) return;

  wallet.enabled = !wallet.enabled;
  await saveWallets();
  renderAll();
  showNotification(`Wallet ${wallet.enabled ? 'enabled' : 'disabled'}`, 'success');
}

/**
 * Handle toggle extension enabled
 */
async function handleToggleEnabled(e) {
  try {
    await runtime.sendMessage({ type: 'TOGGLE_ENABLED', enabled: e.target.checked });
    showNotification(`Extension ${e.target.checked ? 'enabled' : 'disabled'}`, 'success');
  } catch (error) {
    console.error('Failed to toggle extension:', error);
    showNotification('Failed to update settings', 'error');
  }
}

/**
 * Handle clear stats
 */
async function handleClearStats() {
  if (!confirm('Are you sure you want to clear all statistics?')) {
    return;
  }

  try {
    await storage.local.set({ usage_stats: { interceptCount: 0, walletUses: {} } });
    await loadData();
    renderStats();
    showNotification('Statistics cleared', 'success');
  } catch (error) {
    console.error('Failed to clear stats:', error);
    showNotification('Failed to clear statistics', 'error');
  }
}

/**
 * Handle export configuration
 */
function handleExportConfig() {
  const config = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    wallets: wallets,
    settings: settings
  };

  const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `wallet-config-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  
  showNotification('Configuration exported', 'success');
}

/**
 * Handle import configuration
 */
async function handleImportConfig(e) {
  const file = e.target.files[0];
  if (!file) return;

  try {
    const text = await file.text();
    const config = JSON.parse(text);

    if (!config.wallets || !Array.isArray(config.wallets)) {
      throw new Error('Invalid configuration format');
    }

    if (!confirm(`This will import ${config.wallets.length} wallet(s). Continue?`)) {
      return;
    }

    // Merge with existing wallets, avoiding duplicates
    config.wallets.forEach(importedWallet => {
      const exists = wallets.some(w => w.url === importedWallet.url);
      if (!exists) {
        wallets.push({
          ...importedWallet,
          id: generateId() // Regenerate ID to avoid conflicts
        });
      }
    });

    await saveWallets();
    renderAll();
    showNotification(`Imported ${config.wallets.length} wallet(s)`, 'success');
  } catch (error) {
    console.error('Failed to import config:', error);
    showNotification('Failed to import configuration', 'error');
  }

  e.target.value = ''; // Reset file input
}

/**
 * Save wallets to storage
 */
async function saveWallets() {
  try {
    await runtime.sendMessage({ type: 'SAVE_WALLETS', wallets: wallets });
  } catch (error) {
    console.error('Failed to save wallets:', error);
    showNotification('Failed to save changes', 'error');
  }
}

/**
 * Generate unique ID
 */
function generateId() {
  return 'wallet-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(unsafe) {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Show notification
 */
function showNotification(message, type = 'info') {
  // Create a simple toast notification
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    padding: 16px 24px;
    background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#1C4587'};
    color: white;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    z-index: 10000;
    font-size: 14px;
    font-weight: 500;
    animation: slideIn 0.3s ease;
  `;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(400px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(400px); opacity: 0; }
  }
`;
document.head.appendChild(style);
