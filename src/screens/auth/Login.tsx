import React, { useState, useEffect } from 'react';
import { Alert, Text, TouchableOpacity, View, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';
import { GoogleSigninButton } from '@react-native-google-signin/google-signin';
import Toast from 'react-native-toast-message';
import CustomButton from '../../components/CustomButton';
import CustomTextInput from '../../components/CustomTextInput';
import { ROUTES, type AuthStackParamList } from '../../types';
import { LOGIN_REQUEST, LOGIN_SUCCESS } from '../../app/reducers/authReducer';
import type { RootState } from '../../app/reducers';
import { _signInWithGoogle } from '../../utils/firebase';

type LoginScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

const Login: React.FC = () => {
  const [emailAdd, setEmailAdd] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const navigation = useNavigation<LoginScreenNavigationProp>();
  const dispatch = useDispatch();

  // Get loading, error, and auth state from Redux
  const { isLoading, error, isAuthenticated } = useSelector((state: RootState) => state.auth);

  // Log when Login screen loads
  console.log('[SCREEN] Login screen loaded');

  // Show error toast when error changes
  useEffect(() => {
    if (error) {
      console.log(`[ERROR] Login failed: ${error}`);
      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: error,
        position: 'top',
        visibilityTime: 3000,
      });
    }
  }, [error]);

  // Log when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      console.log('[SUCCESS] User authenticated successfully');
      Toast.show({
        type: 'success',
        text1: 'Welcome Back!',
        text2: 'You have successfully signed in',
        position: 'top',
        visibilityTime: 2000,
      });
    }
  }, [isAuthenticated]);

  const handleLogin = (): void => {
    // Log button press with final values
    console.log('[ACTION] Login button pressed');
    console.log(`[DATA] Email: ${emailAdd}, Password entered: ${password ? 'Yes' : 'No'}`);

    if (emailAdd === '' || password === '') {
      console.log('[VALIDATION] Empty fields detected');
      Toast.show({
        type: 'error',
        text1: 'Invalid Credentials',
        text2: 'Please enter valid email address and password',
        position: 'top',
        visibilityTime: 3000,
      });
      return;
    }

    console.log('[VALIDATION] All fields filled, dispatching LOGIN_REQUEST');

    // Dispatch login action
    dispatch({
      type: LOGIN_REQUEST,
      payload: { email: emailAdd, password },
    });
  };

  const handleRegisterPress = (): void => {
    console.log('[ACTION] Register link pressed');
    navigation.navigate(ROUTES.REGISTER);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>🍺</Text>
        </View>
        <Text style={styles.title}>Samaco Brewery</Text>
        <Text style={styles.subtitle}>Sign in to your account</Text>
      </View>

      <View style={styles.inputContainer}>
        <CustomTextInput
          label={'Email Address'}
          placeholder={'Enter Email Address'}
          value={emailAdd}
          onChangeText={setEmailAdd}
          containerStyle={{
            padding: 5,
          }}
          textStyle={{
            borderRadius: 10,
            color: 'black',
            marginLeft: 10,
            fontWeight: 'bold',
          }}
        />
        <CustomTextInput
          label={'Password'}
          placeholder={'Enter Password'}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={true}
          containerStyle={{
            padding: 5,
          }}
          textStyle={{
            borderRadius: 10,
            color: 'black',
            marginLeft: 10,
          }}
        />
      </View>

      <CustomButton
        label={isLoading ? 'LOGGING IN...' : 'SIGN IN'}
        containerStyle={{
          backgroundColor: '#FFD700',
          borderRadius: 12,
          marginVertical: 24,
          width: '100%',
          shadowColor: '#FFD700',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
        textStyle={{
          color: '#0a0a0a',
          fontWeight: 'bold',
          fontSize: 16,
        }}
        onPress={handleLogin}
        disabled={isLoading}
      >
        {isLoading && <ActivityIndicator color="#0a0a0a" />}
      </CustomButton>

      <View style={styles.dividerContainer}>
        <View style={styles.divider} />
        <Text style={styles.dividerText}>New to Samaco Brewery?</Text>
        <View style={styles.divider} />
      </View>

      <TouchableOpacity
        style={styles.registerButton}
        onPress={handleRegisterPress}
      >
        <Text style={styles.registerButtonText}>Create an account</Text>
      </TouchableOpacity>

      <View style={{ marginTop: 24, width: '100%' }}>
        <GoogleSigninButton
          size={GoogleSigninButton.Size.Wide}
          color={GoogleSigninButton.Color.Dark}
          onPress={async () => {
            console.log('[ACTION] Google Sign-in button pressed');
            const result = await _signInWithGoogle();
            if (result.error) {
              Toast.show({
                type: 'error',
                text1: 'Google Sign-in Failed',
                text2: result.error,
                position: 'top',
                visibilityTime: 3000,
              });
            } else if (result.userInfo) {
              console.log('[SUCCESS] Google Sign-in successful:', result.userInfo);
              const userEmail = result.userInfo.user?.email || 'Unknown';
              const userName = result.userInfo.user?.name || 'Unknown';
              Toast.show({
                type: 'success',
                text1: 'Signed in Successfully',
                text2: `Welcome, ${userEmail}`,
                position: 'top',
                visibilityTime: 2000,
              });

              dispatch({
                type: LOGIN_SUCCESS,
                payload: {
                  token: result.userInfo.idToken || 'google-token',
                  user: {
                    email: userEmail,
                    fullName: userName,
                    id: result.userInfo.user?.id,
                  },
                },
              });
            } else {
              Toast.show({
                type: 'info',
                text1: 'Sign-in Cancelled',
                text2: 'No user information received',
                position: 'top',
                visibilityTime: 3000,
              });
            }
          }}
          disabled={isLoading}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0a0a0a',
  },
  header: {
    width: '100%',
    marginBottom: 40,
    alignItems: 'center',
  },
  inputContainer: {
    width: '100%',
  },
  logoContainer: {
    backgroundColor: '#FFD700',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    color: '#FFD700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
  },
  dividerContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#333',
  },
  dividerText: {
    paddingHorizontal: 12,
    color: '#666',
    fontSize: 12,
  },
  registerButton: {
    borderWidth: 2,
    borderColor: '#444',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center' as const,
  },
  registerButtonText: {
    color: '#888',
    fontSize: 14,
    fontWeight: '600' as const,
  },
});

export default Login;
