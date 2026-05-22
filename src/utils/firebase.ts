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
  forceCodeForRefreshToken: true,
});

export const _signInWithGoogle = async () => {
  try {
    console.log('[GOOGLE_SIGNIN] Starting Google Sign-in...');
    
    // Check if Play Services are available
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    console.log('[GOOGLE_SIGNIN] Play Services OK');
    
    // Get current user to check if already signed in
    const currentUser = await GoogleSignin.getCurrentUser();
    if (currentUser) {
      console.log('[GOOGLE_SIGNIN] Already signed in:', currentUser);
      await GoogleSignin.signOut();
      console.log('[GOOGLE_SIGNIN] Signed out previous account');
    }
    
    // Start sign-in
    const response = await GoogleSignin.signIn();
    console.log('[GOOGLE_SIGNIN] Sign-in response:', response);

    if (isSuccessResponse(response)) {
      console.log('[GOOGLE_SIGNIN] Success! User:', response.data);
      
      // Get the tokens
      const tokens = await GoogleSignin.getTokens();
      console.log('[GOOGLE_SIGNIN] Tokens received');
      
      // ***** NEW CODE: Send to your Symfony backend *****
      console.log('[GOOGLE_SIGNIN] Sending to backend...');
      
      const backendResponse = await fetch('https://webdev2-staging.up.railway.app/api/google-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idToken: tokens.idToken,
          email: response.data.user.email,
          name: response.data.user.name,
        }),
      });
      
      const data = await backendResponse.json();
      console.log('[GOOGLE_SIGNIN] Backend response:', data);
      
      if (data.success) {
        // Store the token for future API calls
        // You'll need AsyncStorage for this
        // await AsyncStorage.setItem('userToken', data.token);
        
        return { 
          success: true,
          user: data.user,
          token: data.token,
          error: null 
        };
      } else {
        console.error('[GOOGLE_SIGNIN] Backend error:', data.error);
        return { 
          success: false, 
          user: null,
          token: null,
          error: data.error 
        };
      }
      // ***** END NEW CODE *****
      
    } else {
      console.log('[GOOGLE_SIGNIN] No user data returned');
      return { success: false, user: null, token: null, error: 'No user data returned' };
    }
  } catch (error: any) {
    console.log('[GOOGLE_SIGNIN] Error:', error);
    return { success: false, user: null, token: null, error: error.message };
  }
}