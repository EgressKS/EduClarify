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
      const state = generateState();

      // Store PKCE data for later verification
      storePKCEData(codeVerifier, state);

      // Build authorization URL
      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: getRedirectUri(),
        response_type: 'code',
        scope: 'openid email profile',
        state: state,
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
      // Retrieve stored PKCE data
      const { codeVerifier, state: storedState } = retrievePKCEData();

      // Verify state to prevent CSRF
      if (!storedState || storedState !== state) {
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
      const response = await apiClient.post('/oauth/google/callback', {
        code,
        codeVerifier,
        redirectUri: getRedirectUri(),
      });

      if (response.data.success) {
        const { user, token } = response.data.data;
        
        // Store in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        setIsLoading(false);
        return { user, token };
      } else {
        setError(response.data.message || 'Authentication failed');
        setIsLoading(false);
        return null;
      }
    } catch (err: any) {
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
