/**
 * Tests for Protocol Plugin System
 */

const {
  ProtocolPlugin,
  OpenID4VPPlugin,
  MDocOpenID4VPPlugin,
  W3CVCPlugin,
  ProtocolPluginRegistry
} = require('../src/protocols.js');

describe('Protocol Plugin System', () => {
  describe('Base ProtocolPlugin', () => {
    it('should throw error when abstract methods are called', () => {
      const plugin = new ProtocolPlugin();
      
      expect(() => plugin.getProtocolId()).toThrow('getProtocolId() must be implemented');
      expect(() => plugin.prepareRequest({})).toThrow('prepareRequest() must be implemented');
      expect(() => plugin.validateResponse({})).toThrow('validateResponse() must be implemented');
    });
    
    it('should have default formatForWallet implementation', () => {
      const plugin = new ProtocolPlugin();
      plugin.getProtocolId = () => 'test-protocol';
      
      const formatted = plugin.formatForWallet({ foo: 'bar' }, 'https://wallet.example.com');
      
      expect(formatted).toEqual({
        protocol: 'test-protocol',
        data: { foo: 'bar' },
        walletUrl: 'https://wallet.example.com'
      });
    });
  });
  
  describe('OpenID4VPPlugin', () => {
    let plugin;
    
    beforeEach(() => {
      plugin = new OpenID4VPPlugin();
    });
    
    it('should have correct protocol ID', () => {
      expect(plugin.getProtocolId()).toBe('openid4vp');
    });
    
    it('should prepare valid request with presentation_definition', () => {
      const requestData = {
        presentation_definition: {
          id: 'test-def',
          input_descriptors: []
        }
      };
      
      const prepared = plugin.prepareRequest(requestData);
      
      expect(prepared).toHaveProperty('presentation_definition');
      expect(prepared).toHaveProperty('timestamp');
      expect(prepared.presentation_definition).toEqual(requestData.presentation_definition);
    });
    
    it('should prepare valid request with request_uri', () => {
      const requestData = {
        request_uri: 'https://example.com/request/123'
      };
      
      const prepared = plugin.prepareRequest(requestData);
      
      expect(prepared).toHaveProperty('request_uri');
      expect(prepared).toHaveProperty('timestamp');
    });
    
    it('should reject invalid request data', () => {
      expect(() => plugin.prepareRequest(null)).toThrow('OpenID4VP request data must be an object');
      expect(() => plugin.prepareRequest('string')).toThrow('OpenID4VP request data must be an object');
    });
    
    it('should reject request without presentation_definition or request_uri', () => {
      const invalidRequest = {
        some_other_field: 'value'
      };
      
      expect(() => plugin.prepareRequest(invalidRequest)).toThrow(
        'OpenID4VP request must include presentation_definition or request_uri'
      );
    });
    
    it('should validate response with vp_token', () => {
      const responseData = {
        vp_token: 'eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9...',
        presentation_submission: {
          id: 'submission-123',
          definition_id: 'definition-123'
        }
      };
      
      const validated = plugin.validateResponse(responseData);
      
      expect(validated).toEqual(responseData);
    });
    
    it('should validate response with id_token', () => {
      const responseData = {
        id_token: 'eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9...'
      };
      
      const validated = plugin.validateResponse(responseData);
      
      expect(validated).toEqual(responseData);
    });
    
    it('should reject invalid response data', () => {
      expect(() => plugin.validateResponse(null)).toThrow('Invalid OpenID4VP response');
      expect(() => plugin.validateResponse({})).toThrow(
        'OpenID4VP response must include vp_token or id_token'
      );
    });
  });
  
  describe('MDocOpenID4VPPlugin', () => {
    let plugin;
    
    beforeEach(() => {
      plugin = new MDocOpenID4VPPlugin();
    });
    
    it('should have correct protocol ID', () => {
      expect(plugin.getProtocolId()).toBe('mdoc-openid4vp');
    });
    
    it('should prepare request with doctype', () => {
      const requestData = {
        doctype: 'org.iso.18013.5.1.mDL'
      };
      
      const prepared = plugin.prepareRequest(requestData);
      
      expect(prepared).toHaveProperty('doctype', 'org.iso.18013.5.1.mDL');
      expect(prepared).toHaveProperty('format', 'mdoc');
      expect(prepared).toHaveProperty('timestamp');
    });
    
    it('should prepare request with presentation_definition', () => {
      const requestData = {
        presentation_definition: {
          id: 'mdoc-request',
          input_descriptors: [{
            id: 'mdl',
            format: { mso_mdoc: { alg: ['ES256'] } }
          }]
        }
      };
      
      const prepared = plugin.prepareRequest(requestData);
      
      expect(prepared).toHaveProperty('presentation_definition');
      expect(prepared).toHaveProperty('format', 'mdoc');
    });
    
    it('should reject request without doctype or presentation_definition', () => {
      expect(() => plugin.prepareRequest({})).toThrow(
        'mDoc request must include doctype or presentation_definition'
      );
    });
    
    it('should validate response with vp_token', () => {
      const responseData = {
        vp_token: 'base64_encoded_mdoc_data'
      };
      
      const validated = plugin.validateResponse(responseData);
      
      expect(validated).toEqual(responseData);
    });
    
    it('should reject response without vp_token', () => {
      expect(() => plugin.validateResponse({})).toThrow('mDoc response must include vp_token');
    });
  });
  
  describe('W3CVCPlugin', () => {
    let plugin;
    
    beforeEach(() => {
      plugin = new W3CVCPlugin();
    });
    
    it('should have correct protocol ID', () => {
      expect(plugin.getProtocolId()).toBe('w3c-vc');
    });
    
    it('should prepare request with type', () => {
      const requestData = {
        type: ['VerifiableCredential', 'UniversityDegreeCredential']
      };
      
      const prepared = plugin.prepareRequest(requestData);
      
      expect(prepared).toHaveProperty('type');
      expect(prepared).toHaveProperty('timestamp');
    });
    
    it('should prepare request with credentialSubject', () => {
      const requestData = {
        credentialSubject: {
          degree: {
            type: 'BachelorDegree'
          }
        }
      };
      
      const prepared = plugin.prepareRequest(requestData);
      
      expect(prepared).toHaveProperty('credentialSubject');
      expect(prepared).toHaveProperty('timestamp');
    });
    
    it('should reject request without type or credentialSubject', () => {
      expect(() => plugin.prepareRequest({})).toThrow(
        'W3C VC request must include type or credentialSubject'
      );
    });
    
    it('should validate proper W3C VC response', () => {
      const responseData = {
        '@context': [
          'https://www.w3.org/2018/credentials/v1',
          'https://www.w3.org/2018/credentials/examples/v1'
        ],
        type: ['VerifiableCredential', 'UniversityDegreeCredential'],
        credentialSubject: {
          id: 'did:example:123',
          degree: {
            type: 'BachelorDegree',
            name: 'Bachelor of Science'
          }
        },
        proof: {
          type: 'Ed25519Signature2018',
          created: '2023-01-01T00:00:00Z',
          proofPurpose: 'assertionMethod',
          verificationMethod: 'did:example:issuer#key-1',
          jws: 'eyJhbGciOiJFZERTQSJ9...'
        }
      };
      
      const validated = plugin.validateResponse(responseData);
      
      expect(validated).toEqual(responseData);
    });
    
    it('should reject response without @context', () => {
      const invalidResponse = {
        type: ['VerifiableCredential']
      };
      
      expect(() => plugin.validateResponse(invalidResponse)).toThrow(
        'W3C VC response must include @context and type'
      );
    });
    
    it('should reject response without type', () => {
      const invalidResponse = {
        '@context': ['https://www.w3.org/2018/credentials/v1']
      };
      
      expect(() => plugin.validateResponse(invalidResponse)).toThrow(
        'W3C VC response must include @context and type'
      );
    });
  });
  
  describe('ProtocolPluginRegistry', () => {
    let registry;
    
    beforeEach(() => {
      registry = new ProtocolPluginRegistry();
    });
    
    it('should register built-in plugins on construction', () => {
      expect(registry.isSupported('openid4vp')).toBe(true);
      expect(registry.isSupported('mdoc-openid4vp')).toBe(true);
      expect(registry.isSupported('w3c-vc')).toBe(true);
    });
    
    it('should return all supported protocols', () => {
      const protocols = registry.getSupportedProtocols();
      
      expect(protocols).toContain('openid4vp');
      expect(protocols).toContain('mdoc-openid4vp');
      expect(protocols).toContain('w3c-vc');
      expect(protocols.length).toBe(3);
    });
    
    it('should register custom plugin', () => {
      class CustomPlugin extends ProtocolPlugin {
        getProtocolId() { return 'custom-protocol'; }
        prepareRequest(data) { return data; }
        validateResponse(data) { return data; }
      }
      
      const customPlugin = new CustomPlugin();
      registry.register(customPlugin);
      
      expect(registry.isSupported('custom-protocol')).toBe(true);
      expect(registry.getSupportedProtocols()).toContain('custom-protocol');
    });
    
    it('should throw error when registering non-plugin', () => {
      expect(() => registry.register({})).toThrow('Plugin must extend ProtocolPlugin');
      expect(() => registry.register(null)).toThrow('Plugin must extend ProtocolPlugin');
    });
    
    it('should get plugin by protocol ID', () => {
      const plugin = registry.getPlugin('openid4vp');
      
      expect(plugin).toBeInstanceOf(OpenID4VPPlugin);
    });
    
    it('should return null for unknown protocol', () => {
      const plugin = registry.getPlugin('unknown-protocol');
      
      expect(plugin).toBeNull();
    });
    
    it('should prepare request using correct plugin', () => {
      const requestData = {
        presentation_definition: {
          id: 'test-def',
          input_descriptors: []
        }
      };
      
      const prepared = registry.prepareRequest('openid4vp', requestData);
      
      expect(prepared).toHaveProperty('presentation_definition');
      expect(prepared).toHaveProperty('timestamp');
    });
    
    it('should throw error when preparing request for unknown protocol', () => {
      expect(() => registry.prepareRequest('unknown-protocol', {})).toThrow(
        'No plugin registered for protocol: unknown-protocol'
      );
    });
    
    it('should validate response using correct plugin', () => {
      const responseData = {
        vp_token: 'token',
        presentation_submission: {}
      };
      
      const validated = registry.validateResponse('openid4vp', responseData);
      
      expect(validated).toEqual(responseData);
    });
    
    it('should throw error when validating response for unknown protocol', () => {
      expect(() => registry.validateResponse('unknown-protocol', {})).toThrow(
        'No plugin registered for protocol: unknown-protocol'
      );
    });
    
    it('should format request for wallet using correct plugin', () => {
      const preparedRequest = {
        presentation_definition: {
          id: 'test-def',
          input_descriptors: []
        },
        timestamp: '2023-01-01T00:00:00Z'
      };
      
      const formatted = registry.formatForWallet('openid4vp', preparedRequest, 'https://wallet.example.com');
      
      expect(formatted).toEqual({
        protocol: 'openid4vp',
        data: preparedRequest,
        walletUrl: 'https://wallet.example.com'
      });
    });
    
    it('should throw error when formatting for unknown protocol', () => {
      expect(() => registry.formatForWallet('unknown-protocol', {}, 'https://wallet.example.com')).toThrow(
        'No plugin registered for protocol: unknown-protocol'
      );
    });
    
    it('should replace existing plugin when re-registering', () => {
      class CustomOpenID4VP extends ProtocolPlugin {
        getProtocolId() { return 'openid4vp'; }
        prepareRequest(data) { return { ...data, custom: true }; }
        validateResponse(data) { return data; }
      }
      
      const spy = jest.spyOn(console, 'warn').mockImplementation();
      
      const customPlugin = new CustomOpenID4VP();
      registry.register(customPlugin);
      
      expect(spy).toHaveBeenCalledWith("Protocol plugin for 'openid4vp' is being replaced");
      
      const prepared = registry.prepareRequest('openid4vp', { test: 'data' });
      expect(prepared).toHaveProperty('custom', true);
      
      spy.mockRestore();
    });
  });
});
