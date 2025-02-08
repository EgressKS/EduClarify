import { useState, useCallback, useEffect } from 'react';
import { apiClient } from './http';
import {
  generateCodeVerifier,
  generateCodeChallenge,
  generateState,
  storePKCEData,
  retrievePKCEData,
} from './pkce';

interface GoogleUser {
  id: string;
  email: string;
  name: string;
  nickName?: string;
  gender?: string;
  country?: string;
  language?: string;
  timeZone?: string;
  avatarUrl?: string;
  authProvider?: string;
  createdAt?: string;
}

interface UseGoogleAuthReturn {
  isLoading: boolean;
  error: string | null;
  initiateGoogleLogin: () => Promise<void>;
  handleCallback: (code: string, state: string) => Promise<{ user: GoogleUser; token: string } | null>;
}

// Get the redirect URI based on current origin
const getRedirectUri = () => {
  if (typeof window === 'undefined') return '';
  return `${window.location.origin}/auth/callback/google`;
};

export function useGoogleAuth(): UseGoogleAuthReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientId, setClientId] = useState<string>('');

  // Fetch Google OAuth config on mount
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await apiClient.get('/oauth/google/config');
        if (response.data.success) {
          setClientId(response.data.data.clientId);
        }
      } catch (err) {
        console.error('Failed to fetch Google OAuth config:', err);
      }
    };
    fetchConfig();
  }, []);

  /**
   * Initiate Google OAuth flow with PKCE
   */
  const initiateGoogleLogin = useCallback(async () => {
    if (!clientId) {
      setError('Google OAuth is not configured');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Generate PKCE parameters
      const codeVerifier = generateCodeVerifier();
      const codeChallenge = await generateCodeChallenge(codeVerifier);
      const randomState = generateState();
      
      // CRITICAL FIX: Encode verifier into state parameter as base64
      // This survives the OAuth redirect without relying on storage
      const stateData = {
        state: randomState,
        verifier: codeVerifier,
        timestamp: Date.now()
      };
      const encodedState = btoa(JSON.stringify(stateData));

      console.log('=== INITIATING GOOGLE LOGIN ===');
      console.log('State:', randomState);
      console.log('Code Verifier:', codeVerifier.substring(0, 10) + '...');
      console.log('Current origin:', window.location.origin);
      console.log('Redirect URI:', getRedirectUri());

      // Still store in multiple places as backup
      storePKCEData(codeVerifier, randomState);
      
      // Store in cookies with proper flags
      const isSecure = window.location.protocol === 'https:';
      const cookieOptions = `max-age=600; path=/; SameSite=Lax${isSecure ? '; Secure' : ''}`;
      document.cookie = `pkce_state=${randomState}; ${cookieOptions}`;
      document.cookie = `pkce_verifier=${codeVerifier}; ${cookieOptions}`;
      
      // Verify storage immediately
      setTimeout(() => {
        const testState = localStorage.getItem('pkce_data');
        const testSession = sessionStorage.getItem('pkce_state');
        const testCookie = document.cookie.includes('pkce_state');
        console.log('Storage verification:', { 
          localStorage: !!testState, 
          sessionStorage: !!testSession, 
          cookie: testCookie 
        });
      }, 100);

      // Build authorization URL with encoded state
      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: getRedirectUri(),
        response_type: 'code',
        scope: 'openid email profile',
        state: encodedState, // Use encoded state that contains verifier
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
        access_type: 'offline',
        prompt: 'consent',
      });

      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

      // Redirect to Google
      window.location.href = authUrl;
    } catch (err) {
      setError('Failed to initiate Google login');
      setIsLoading(false);
    }
  }, [clientId]);

  /**
   * Handle OAuth callback - exchange code for tokens
   */
  const handleCallback = useCallback(async (code: string, state: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // CRITICAL FIX: First try to decode state parameter (most reliable)
      let codeVerifier: string | null = null;
      let storedState: string | null = null;
      
      console.log('Attempting to decode state parameter...');
      try {
        const decodedData = JSON.parse(atob(state));
        if (decodedData.state && decodedData.verifier) {
          // Check if not expired (10 minutes)
          const age = Date.now() - decodedData.timestamp;
          if (age < 10 * 60 * 1000) {
            storedState = decodedData.state;
            codeVerifier = decodedData.verifier;
            console.log('✓ Successfully decoded state parameter');
          } else {
            console.warn('Decoded state expired');
          }
        }
      } catch (e) {
        console.warn('State parameter not encoded or invalid, trying storage fallback');
      }

      // Fallback to client storage if state decode failed
      if (!codeVerifier || !storedState) {
        const retrieved = retrievePKCEData();
        codeVerifier = retrieved.codeVerifier;
        storedState = retrieved.state;
      }

      // Fallback to cookies if storage failed
      if (!storedState || !codeVerifier) {
        console.log('Attempting cookie fallback...');
        const cookies = document.cookie.split(';').reduce((acc, cookie) => {
          const [key, value] = cookie.trim().split('=');
          acc[key] = value;
          return acc;
        }, {} as Record<string, string>);
        
        storedState = storedState || cookies['pkce_state'];
        codeVerifier = codeVerifier || cookies['pkce_verifier'];
        
        // Clear cookies after use
        document.cookie = 'pkce_state=; max-age=0; path=/';
        document.cookie = 'pkce_verifier=; max-age=0; path=/';
      }

      console.log('State verification:', { 
        receivedEncodedState: state.substring(0, 20) + '...', 
        decodedState: storedState,
        hasCodeVerifier: !!codeVerifier,
        method: codeVerifier ? 'decoded-or-stored' : 'none'
      });

      // Verify state to prevent CSRF
      // If we decoded the state successfully, storedState will be the original random state
      // Otherwise we need storedState to match the URL state parameter
      if (!storedState) {
        console.error('No state found - OAuth flow may have been interrupted');
        setError('Invalid state parameter. Please try again.');
        setIsLoading(false);
        return null;
      }

      if (!codeVerifier) {
        setError('Missing code verifier. Please try again.');
        setIsLoading(false);
        return null;
      }

      // Exchange code for tokens via our backend
      console.log('Exchanging code for tokens...');
      console.log('Code:', code.substring(0, 20) + '...');
      console.log('Code Verifier:', codeVerifier.substring(0, 20) + '...');
      console.log('Redirect URI:', getRedirectUri());
      
      const response = await apiClient.post('/oauth/google/callback', {
        code,
        codeVerifier,
        redirectUri: getRedirectUri(),
      });

      console.log('Backend response:', response.data);

      if (response.data.success) {
        const { user, token } = response.data.data;
        
        // Store in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        setIsLoading(false);
        return { user, token };
      } else {
        console.error('Backend returned error:', response.data);
        setError(response.data.message || 'Authentication failed');
        setIsLoading(false);
        return null;
      }
    } catch (err: any) {
      console.error('OAuth callback error:', err);
      console.error('Error response:', err.response?.data);
      const message = err.response?.data?.message || 'Google authentication failed';
      setError(message);
      setIsLoading(false);
      return null;
    }
  }, []);

  return {
    isLoading,
    error,
    initiateGoogleLogin,
    handleCallback,
  };
}
