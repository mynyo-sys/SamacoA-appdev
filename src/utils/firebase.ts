import {
  GoogleSignin,
  GoogleSigninButton,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from '@react-native-google-signin/google-signin';


GoogleSignin.configure({
  webClientId: '673892684199-evepoqt3sjv3bjl1gpmaemc5mcrn6ueb.apps.googleusercontent.com',
  offlineAccess: true,
});

export const _signInWithGoogle = async () => {
  console.log('[GOOGLE_SIGNIN] Starting Google Sign-in...');
  try {
    console.log('[GOOGLE_SIGNIN] Checking Play Services...');
    await GoogleSignin.hasPlayServices();
    console.log('[GOOGLE_SIGNIN] Play Services OK, launching sign-in...');

    const response = await GoogleSignin.signIn();
    console.log('[GOOGLE_SIGNIN] Sign-in response:', response);

    if (isSuccessResponse(response)) {
      console.log('[GOOGLE_SIGNIN] Success! User:', response.data);
      return { userInfo: response.data };
    } else {
      console.log('[GOOGLE_SIGNIN] No user data returned');
      return { userInfo: null };
    }
  } catch (error: any) {
    console.log('[GOOGLE_SIGNIN] Error:', error);
    if (isErrorWithCode(error)) {
      switch (error.code) {
        case statusCodes.IN_PROGRESS:
          console.log('[GOOGLE_SIGNIN] Sign-in already in progress');
          break;
        case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
          console.log('[GOOGLE_SIGNIN] Play Services not available');
          break;
        case statusCodes.SIGN_IN_CANCELLED:
          console.log('[GOOGLE_SIGNIN] User cancelled sign-in');
          break;
        default:
          console.log('[GOOGLE_SIGNIN] Unknown error code:', error.code);
      }
    } else {
      console.log('[GOOGLE_SIGNIN] Non-Google error:', error.message);
    }
    return { userInfo: null, error: error.message };
  }
}

