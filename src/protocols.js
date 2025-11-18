/**
 * Protocol Plugin Architecture for Digital Credentials API
 * Handles protocol-specific request formatting and response parsing
 */

/**
 * Base Protocol Plugin Interface
 * All protocol plugins must implement these methods
 */
class ProtocolPlugin {
  /**
   * Get the protocol identifier
   * @returns {string} Protocol identifier (e.g., 'openid4vp', 'mdoc-openid4vp')
   */
  getProtocolId() {
    throw new Error('getProtocolId() must be implemented');
  }
  
  /**
   * Validate and prepare request data for this protocol
   * @param {Object} requestData - Raw request data from navigator.credentials.get
   * @returns {Object} Validated and formatted request data
   */
  prepareRequest(requestData) {
    throw new Error('prepareRequest() must be implemented');
  }
  
  /**
   * Validate response data from wallet
   * @param {Object} responseData - Response data from wallet
   * @returns {Object} Validated response data
   */
  validateResponse(responseData) {
    throw new Error('validateResponse() must be implemented');
  }
  
  /**
   * Format the request for transmission to the wallet
   * @param {Object} preparedRequest - Output from prepareRequest()
   * @param {string} walletUrl - Target wallet URL
   * @returns {Object} Request ready for transmission
   */
  formatForWallet(preparedRequest, walletUrl) {
    // Default implementation - can be overridden
    return {
      protocol: this.getProtocolId(),
      data: preparedRequest,
      walletUrl: walletUrl
    };
  }
}

/**
 * OpenID4VP Protocol Plugin
 * Implements OpenID for Verifiable Presentations
 */
class OpenID4VPPlugin extends ProtocolPlugin {
  getProtocolId() {
    return 'openid4vp';
  }
  
  prepareRequest(requestData) {
    // Validate OpenID4VP request structure
    if (!requestData || typeof requestData !== 'object') {
      throw new Error('OpenID4VP request data must be an object');
    }
    
    // OpenID4VP typically includes presentation_definition
    if (!requestData.presentation_definition && !requestData.request_uri) {
      throw new Error('OpenID4VP request must include presentation_definition or request_uri');
    }
    
    return {
      ...requestData,
      timestamp: new Date().toISOString()
    };
  }
  
  validateResponse(responseData) {
    if (!responseData || typeof responseData !== 'object') {
      throw new Error('Invalid OpenID4VP response');
    }
    
    // OpenID4VP responses typically include vp_token
    if (!responseData.vp_token && !responseData.id_token) {
      throw new Error('OpenID4VP response must include vp_token or id_token');
    }
    
    return responseData;
  }
}

/**
 * mDL (Mobile Driver's License) over OpenID4VP Plugin
 */
class MDocOpenID4VPPlugin extends ProtocolPlugin {
  getProtocolId() {
    return 'mdoc-openid4vp';
  }
  
  prepareRequest(requestData) {
    if (!requestData || typeof requestData !== 'object') {
      throw new Error('mDoc OpenID4VP request data must be an object');
    }
    
    // mDoc requests should specify the document type
    if (!requestData.doctype && !requestData.presentation_definition) {
      throw new Error('mDoc request must include doctype or presentation_definition');
    }
    
    return {
      ...requestData,
      format: 'mdoc',
      timestamp: new Date().toISOString()
    };
  }
  
  validateResponse(responseData) {
    if (!responseData || typeof responseData !== 'object') {
      throw new Error('Invalid mDoc response');
    }
    
    if (!responseData.vp_token) {
      throw new Error('mDoc response must include vp_token');
    }
    
    return responseData;
  }
}

/**
 * W3C Verifiable Credentials API Plugin
 */
class W3CVCPlugin extends ProtocolPlugin {
  getProtocolId() {
    return 'w3c-vc';
  }
  
  prepareRequest(requestData) {
    if (!requestData || typeof requestData !== 'object') {
      throw new Error('W3C VC request data must be an object');
    }
    
    // W3C VC requests typically include credential type requirements
    if (!requestData.type && !requestData.credentialSubject) {
      throw new Error('W3C VC request must include type or credentialSubject');
    }
    
    return {
      ...requestData,
      timestamp: new Date().toISOString()
    };
  }
  
  validateResponse(responseData) {
    if (!responseData || typeof responseData !== 'object') {
      throw new Error('Invalid W3C VC response');
    }
    
    // W3C VCs must have specific fields
    if (!responseData['@context'] || !responseData.type) {
      throw new Error('W3C VC response must include @context and type');
    }
    
    return responseData;
  }
}

/**
 * Protocol Plugin Registry
 * Manages registration and retrieval of protocol plugins
 */
class ProtocolPluginRegistry {
  constructor() {
    this.plugins = new Map();
    
    // Register built-in plugins
    this.register(new OpenID4VPPlugin());
    this.register(new MDocOpenID4VPPlugin());
    this.register(new W3CVCPlugin());
  }
  
  /**
   * Register a protocol plugin
   * @param {ProtocolPlugin} plugin - Plugin instance
   */
  register(plugin) {
    if (!(plugin instanceof ProtocolPlugin)) {
      throw new Error('Plugin must extend ProtocolPlugin');
    }
    
    const protocolId = plugin.getProtocolId();
    if (this.plugins.has(protocolId)) {
      console.warn(`Protocol plugin for '${protocolId}' is being replaced`);
    }
    
    this.plugins.set(protocolId, plugin);
    console.log(`Registered protocol plugin: ${protocolId}`);
  }
  
  /**
   * Get a protocol plugin by ID
   * @param {string} protocolId - Protocol identifier
   * @returns {ProtocolPlugin|null} Plugin instance or null
   */
  getPlugin(protocolId) {
    return this.plugins.get(protocolId) || null;
  }
  
  /**
   * Check if a protocol is supported
   * @param {string} protocolId - Protocol identifier
   * @returns {boolean} True if protocol is supported
   */
  isSupported(protocolId) {
    return this.plugins.has(protocolId);
  }
  
  /**
   * Get all supported protocol IDs
   * @returns {string[]} Array of protocol IDs
   */
  getSupportedProtocols() {
    return Array.from(this.plugins.keys());
  }
  
  /**
   * Process a request using the appropriate plugin
   * @param {string} protocolId - Protocol identifier
   * @param {Object} requestData - Request data
   * @returns {Object} Prepared request
   */
  prepareRequest(protocolId, requestData) {
    const plugin = this.getPlugin(protocolId);
    if (!plugin) {
      throw new Error(`No plugin registered for protocol: ${protocolId}`);
    }
    
    return plugin.prepareRequest(requestData);
  }
  
  /**
   * Validate a response using the appropriate plugin
   * @param {string} protocolId - Protocol identifier
   * @param {Object} responseData - Response data
   * @returns {Object} Validated response
   */
  validateResponse(protocolId, responseData) {
    const plugin = this.getPlugin(protocolId);
    if (!plugin) {
      throw new Error(`No plugin registered for protocol: ${protocolId}`);
    }
    
    return plugin.validateResponse(responseData);
  }
  
  /**
   * Format a request for wallet transmission
   * @param {string} protocolId - Protocol identifier
   * @param {Object} preparedRequest - Prepared request data
   * @param {string} walletUrl - Wallet URL
   * @returns {Object} Formatted request
   */
  formatForWallet(protocolId, preparedRequest, walletUrl) {
    const plugin = this.getPlugin(protocolId);
    if (!plugin) {
      throw new Error(`No plugin registered for protocol: ${protocolId}`);
    }
    
    return plugin.formatForWallet(preparedRequest, walletUrl);
  }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  // Node.js environment (for testing)
  module.exports = {
    ProtocolPlugin,
    OpenID4VPPlugin,
    MDocOpenID4VPPlugin,
    W3CVCPlugin,
    ProtocolPluginRegistry
  };
}

// Make available globally for browser extension
if (typeof window !== 'undefined') {
  window.ProtocolPluginRegistry = ProtocolPluginRegistry;
  window.ProtocolPlugin = ProtocolPlugin;
}
