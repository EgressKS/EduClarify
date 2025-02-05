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
 * Store PKCE data in sessionStorage
 */
export function storePKCEData(codeVerifier: string, state: string): void {
  sessionStorage.setItem('pkce_code_verifier', codeVerifier);
  sessionStorage.setItem('pkce_state', state);
}

/**
 * Retrieve and clear PKCE data from sessionStorage
 */
export function retrievePKCEData(): { codeVerifier: string | null; state: string | null } {
  const codeVerifier = sessionStorage.getItem('pkce_code_verifier');
  const state = sessionStorage.getItem('pkce_state');
  
  // Clear after retrieval for security
  sessionStorage.removeItem('pkce_code_verifier');
  sessionStorage.removeItem('pkce_state');
  
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
