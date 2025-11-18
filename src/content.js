/**
 * Content script for W3C Digital Credentials API interceptor
 * Intercepts navigator.credentials.get calls and provides wallet selection
 */

(function() {
  'use strict';

  console.log('W3C Digital Credentials API Interceptor loaded');

  // Inject the protocol plugins script first
  const protocolsScript = document.createElement('script');
  protocolsScript.src = chrome.runtime.getURL('protocols.js');
  protocolsScript.onload = function() {
    // After protocols are loaded, inject the interception script
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('inject.js');
    script.onload = function() {
      this.remove();
    };
    (document.head || document.documentElement).appendChild(script);
    this.remove();
  };
  (document.head || document.documentElement).appendChild(protocolsScript);

  // Listen for credential requests from the injected script
  window.addEventListener('DC_CREDENTIALS_REQUEST', async function(event) {
    console.log('Digital Credentials API call intercepted:', event.detail);
    
    const { requestId, requests, options } = event.detail;
    
    try {
      // Get configured wallets from background script
      const runtime = typeof browser !== 'undefined' ? browser.runtime : chrome.runtime;
      
      // Request wallet selector (pass the processed requests with protocols)
      const response = await runtime.sendMessage({
        type: 'SHOW_WALLET_SELECTOR',
        requestId: requestId,
        requests: requests,
        options: options,
        origin: window.location.origin
      });

      if (response.useNative) {
        // Extension disabled or no matching wallets, use native API
        window.dispatchEvent(new CustomEvent('DC_CREDENTIALS_RESPONSE', {
          detail: {
            requestId: requestId,
            useNative: true
          }
        }));
        return;
      }

      // Show wallet selection modal
      if (typeof window.showWalletSelector === 'function') {
        window.showWalletSelector(
          response.wallets,
          requests,
          // On wallet selected
          async (wallet, selectedRequest) => {
            console.log('Wallet selected:', wallet.name, 'for protocol:', selectedRequest.protocol);
            
            // Notify background script
            await runtime.sendMessage({
              type: 'WALLET_SELECTED',
              walletId: wallet.id,
              requestId: requestId,
              protocol: selectedRequest.protocol
            });

            // TODO: Communicate with the actual wallet endpoint
            // For now, simulate a credential response
            const credential = {
              id: 'credential-' + Date.now(),
              type: 'digital',
              protocol: selectedRequest.protocol,
              data: {
                // Wallet would return actual credential data here
                vp_token: 'simulated_vp_token',
                presentation_submission: {
                  id: 'submission-' + Date.now(),
                  definition_id: 'definition-1'
                }
              },
              wallet: wallet.name,
            };

            window.dispatchEvent(new CustomEvent('DC_CREDENTIALS_RESPONSE', {
              detail: {
                requestId: requestId,
                response: credential.data,
                protocol: credential.protocol
              }
            }));
          },
          // On native browser wallet chosen
          () => {
            console.log('Using native browser wallet');
            window.dispatchEvent(new CustomEvent('DC_CREDENTIALS_RESPONSE', {
              detail: {
                requestId: requestId,
                useNative: true
              }
            }));
          },
          // On cancel
          () => {
            console.log('Wallet selection cancelled');
            window.dispatchEvent(new CustomEvent('DC_CREDENTIALS_RESPONSE', {
              detail: {
                requestId: requestId,
                error: 'User cancelled the request'
              }
            }));
          }
        );
      } else {
        throw new Error('Wallet selector not loaded');
      }
    } catch (error) {
      console.error('Error handling credential request:', error);
      
      // Dispatch error back to the page
      window.dispatchEvent(new CustomEvent('DC_CREDENTIALS_RESPONSE', {
        detail: {
          requestId: requestId,
          error: error.message
        }
      }));
    }
  });

  // Listen for wallet registration requests
  window.addEventListener('DC_WALLET_REGISTRATION_REQUEST', async function(event) {
    console.log('Wallet registration request:', event.detail);
    
    const { registrationId, wallet } = event.detail;
    
    try {
      const runtime = typeof browser !== 'undefined' ? browser.runtime : chrome.runtime;
      
      // Send registration to background script
      const response = await runtime.sendMessage({
        type: 'REGISTER_WALLET',
        wallet: wallet,
        origin: window.location.origin
      });
      
      // Send response back to page
      window.dispatchEvent(new CustomEvent('DC_WALLET_REGISTRATION_RESPONSE', {
        detail: {
          registrationId: registrationId,
          success: response.success,
          alreadyRegistered: response.alreadyRegistered,
          wallet: response.wallet,
          error: response.error
        }
      }));
    } catch (error) {
      console.error('Error handling wallet registration:', error);
      
      window.dispatchEvent(new CustomEvent('DC_WALLET_REGISTRATION_RESPONSE', {
        detail: {
          registrationId: registrationId,
          success: false,
          error: error.message
        }
      }));
    }
  });

  // Listen for wallet check requests
  window.addEventListener('DC_WALLET_CHECK_REQUEST', async function(event) {
    console.log('Wallet check request:', event.detail);
    
    const { checkId, url } = event.detail;
    
    try {
      const runtime = typeof browser !== 'undefined' ? browser.runtime : chrome.runtime;
      
      const response = await runtime.sendMessage({
        type: 'CHECK_WALLET',
        url: url
      });
      
      window.dispatchEvent(new CustomEvent('DC_WALLET_CHECK_RESPONSE', {
        detail: {
          checkId: checkId,
          isRegistered: response.isRegistered
        }
      }));
    } catch (error) {
      console.error('Error checking wallet:', error);
      
      window.dispatchEvent(new CustomEvent('DC_WALLET_CHECK_RESPONSE', {
        detail: {
          checkId: checkId,
          isRegistered: false
        }
      }));
    }
  });

  // Listen for protocol update requests
  window.addEventListener('DC_PROTOCOLS_UPDATE_REQUEST', async function(event) {
    console.log('Protocols update request:', event.detail);
    
    const { updateId } = event.detail;
    
    try {
      const runtime = typeof browser !== 'undefined' ? browser.runtime : chrome.runtime;
      
      const response = await runtime.sendMessage({
        type: 'GET_SUPPORTED_PROTOCOLS'
      });
      
      window.dispatchEvent(new CustomEvent('DC_PROTOCOLS_UPDATE_RESPONSE', {
        detail: {
          updateId: updateId,
          protocols: response.protocols
        }
      }));
    } catch (error) {
      console.error('Error getting supported protocols:', error);
      
      window.dispatchEvent(new CustomEvent('DC_PROTOCOLS_UPDATE_RESPONSE', {
        detail: {
          updateId: updateId,
          protocols: []
        }
      }));
    }
  });

  // Notify extension that content script is ready
  const runtime = typeof browser !== 'undefined' ? browser.runtime : chrome.runtime;
  runtime.sendMessage({
    type: 'CONTENT_SCRIPT_READY',
    origin: window.location.origin,
    timestamp: Date.now()
  }).catch(err => {
    // Ignore errors if background script isn't ready
  });

})();
