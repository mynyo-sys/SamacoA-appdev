import {
  GoogleSignin,
  isSuccessResponse,
} from '@react-native-google-signin/google-signin';
import { API_BASE_URL } from '../app/api/config';

GoogleSignin.configure({
  webClientId: '317197442052-0vlbmcdmgl429o8hvsi5i1hlphujl23a.apps.googleusercontent.com',
});

export const _signInWithGoogle = async () => {
  try {
    console.log('[GOOGLE_SIGNIN] Starting Google Sign-in...');

    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

    // Clear cached account so the user can pick a different Gmail address
    try {
      await GoogleSignin.signOut();
    } catch {
      // ignore if not signed in
    }

    const response = await GoogleSignin.signIn();
    console.log('[GOOGLE_SIGNIN] Sign-in response received');

    if (!isSuccessResponse(response)) {
      return {
        success: false,
        user: null,
        token: null,
        error: 'Sign in was cancelled',
      };
    }

    const { user } = response.data;
    let idToken = response.data.idToken;

    if (!idToken) {
      const tokens = await GoogleSignin.getTokens();
      idToken = tokens.idToken;
    }

    if (!idToken) {
      return {
        success: false,
        user: null,
        token: null,
        error: 'Could not obtain Google ID token',
      };
    }

    const backendResponse = await fetch(`${API_BASE_URL}/auth/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        idToken,
      }),
    });

    const responseText = await backendResponse.text();
    let data: {
      success?: boolean;
      token?: string;
      user?: Record<string, unknown>;
      error?: string;
    } = {};

    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch {
      return {
        success: false,
        user: null,
        token: null,
        error: `Invalid server response: ${responseText.slice(0, 120)}`,
      };
    }

    console.log('[GOOGLE_SIGNIN] Backend status:', backendResponse.status);

    if (!backendResponse.ok || !data.success || !data.token) {
      return {
        success: false,
        user: null,
        token: null,
        error: data.error || `Authentication failed (${backendResponse.status})`,
      };
    }

    return {
      success: true,
      user: data.user,
      token: data.token,
      error: null,
    };
  } catch (error: any) {
    console.log('[GOOGLE_SIGNIN] Error:', error);
    return {
      success: false,
      user: null,
      token: null,
      error: error?.message || 'Google sign in failed',
    };
  }
};
