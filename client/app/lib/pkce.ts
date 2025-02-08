// PKCE (Proof Key for Code Exchange) utilities for OAuth 2.0

/**
 * Generate a random string for code verifier
 * Must be between 43-128 characters, using unreserved characters
 */
export function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64UrlEncode(array);
}

/**
 * Generate code challenge from code verifier using SHA-256
 */
export async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return base64UrlEncode(new Uint8Array(digest));
}

/**
 * Base64 URL encode (RFC 4648)
 */
function base64UrlEncode(buffer: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < buffer.length; i++) {
    binary += String.fromCharCode(buffer[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Generate a random state parameter for CSRF protection
 */
export function generateState(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return base64UrlEncode(array);
}

/**
 * Store PKCE data in multiple storage locations for maximum reliability
 */
export function storePKCEData(codeVerifier: string, state: string): void {
  const data = {
    codeVerifier,
    state,
    timestamp: Date.now()
  };
  
  try {
    // Store in localStorage (primary - persists across page loads)
    localStorage.setItem('pkce_data', JSON.stringify(data));
    localStorage.setItem('pkce_state_only', state);
    console.log('✓ PKCE data stored in localStorage');
  } catch (e) {
    console.warn('✗ localStorage unavailable:', e);
  }
  
  try {
    // ALSO store in sessionStorage (backup)
    sessionStorage.setItem('pkce_code_verifier', codeVerifier);
    sessionStorage.setItem('pkce_state', state);
    sessionStorage.setItem('pkce_timestamp', Date.now().toString());
    console.log('✓ PKCE data stored in sessionStorage');
  } catch (e) {
    console.warn('✗ sessionStorage unavailable:', e);
  }
}

/**
 * Retrieve and clear PKCE data from storage
 */
export function retrievePKCEData(): { codeVerifier: string | null; state: string | null } {
  console.log('Retrieving PKCE data...');
  
  try {
    // Try localStorage first
    const stored = localStorage.getItem('pkce_data');
    console.log('localStorage data found:', !!stored);
    
    if (stored) {
      const data = JSON.parse(stored);
      
      // Check if data is not older than 10 minutes
      const age = Date.now() - data.timestamp;
      const isExpired = age > 10 * 60 * 1000;
      
      console.log('PKCE data age (seconds):', Math.floor(age / 1000), 'expired:', isExpired);
      
      if (!isExpired) {
        // Clear after retrieval for security
        localStorage.removeItem('pkce_data');
        console.log('Retrieved from localStorage:', { hasVerifier: !!data.codeVerifier, hasState: !!data.state });
        return { codeVerifier: data.codeVerifier, state: data.state };
      }
      
      // Clear expired data
      localStorage.removeItem('pkce_data');
      console.warn('PKCE data expired and cleared');
    }
  } catch (e) {
    console.error('Error retrieving from localStorage:', e);
  }
  
  // Fallback to sessionStorage
  console.log('Falling back to sessionStorage');
  const codeVerifier = sessionStorage.getItem('pkce_code_verifier');
  const state = sessionStorage.getItem('pkce_state');
  const timestamp = sessionStorage.getItem('pkce_timestamp');
  
  console.log('sessionStorage data:', { hasVerifier: !!codeVerifier, hasState: !!state, timestamp });
  
  // Check expiry for sessionStorage too
  if (timestamp) {
    const age = Date.now() - parseInt(timestamp);
    const isExpired = age > 10 * 60 * 1000;
    if (isExpired) {
      console.warn('sessionStorage PKCE data expired');
      sessionStorage.removeItem('pkce_code_verifier');
      sessionStorage.removeItem('pkce_state');
      sessionStorage.removeItem('pkce_timestamp');
      return { codeVerifier: null, state: null };
    }
  }
  
  // Clear after retrieval for security
  sessionStorage.removeItem('pkce_code_verifier');
  sessionStorage.removeItem('pkce_state');
  sessionStorage.removeItem('pkce_timestamp');
  
  return { codeVerifier, state };
}

/**
 * Google OAuth configuration
 */
export const GOOGLE_OAUTH_CONFIG = {
  clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
  redirectUri: typeof window !== 'undefined' 
    ? `${window.location.origin}/api/auth/callback/google`
    : '',
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  scope: 'openid email profile',
};

/**
 * Build Google OAuth authorization URL with PKCE
 */
export async function buildGoogleAuthUrl(): Promise<string> {
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  const state = generateState();
  
  // Store for later verification
  storePKCEData(codeVerifier, state);
  
  const params = new URLSearchParams({
    client_id: GOOGLE_OAUTH_CONFIG.clientId,
    redirect_uri: GOOGLE_OAUTH_CONFIG.redirectUri,
    response_type: 'code',
    scope: GOOGLE_OAUTH_CONFIG.scope,
    state: state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    access_type: 'offline',
    prompt: 'consent',
  });
  
  return `${GOOGLE_OAUTH_CONFIG.authorizationEndpoint}?${params.toString()}`;
}
