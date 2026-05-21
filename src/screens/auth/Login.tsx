import React, { useState, useEffect } from 'react';
import { Alert, Text, TouchableOpacity, View, ActivityIndicator, StyleSheet, Image, ScrollView } from 'react-native';
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
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          {/* Replace with actual logo image: <Image source={require('../../assets/logo.png')} style={styles.logoImage} /> */}
          <Image source={require('../../../assets/images/logo.png')} style={styles.logoImage} />
        </View>
        <Text style={styles.title}>Samaco Brewery</Text>
        <Text style={styles.subtitle}>Sign in to your account</Text>
      </View>

      <View style={styles.inputContainer}>
        <CustomTextInput
          label={'Email address'}
          placeholder={'Enter your email'}
          value={emailAdd}
          onChangeText={setEmailAdd}
          containerStyle={{
            marginBottom: 16,
          }}
          textStyle={{
            backgroundColor: '#1F2937',
            borderRadius: 12,
            borderWidth: 1,
            borderColor: '#374151',
            color: '#fff',
            paddingHorizontal: 16,
            paddingVertical: 12,
            fontSize: 16,
          }}
        />
        <CustomTextInput
          label={'Password'}
          placeholder={'Enter your password'}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={true}
          containerStyle={{
            marginBottom: 16,
          }}
          textStyle={{
            backgroundColor: '#1F2937',
            borderRadius: 12,
            borderWidth: 1,
            borderColor: '#374151',
            color: '#fff',
            paddingHorizontal: 16,
            paddingVertical: 12,
            fontSize: 16,
          }}
        />
      </View>

      <TouchableOpacity
        style={styles.signInButton}
        onPress={handleLogin}
        disabled={isLoading}
      >
        <View style={styles.buttonContent}>
          {isLoading ? (
            <ActivityIndicator color="#0a0a0a" />
          ) : (
            <>
              <Text style={styles.signInButtonText}>Sign in</Text>
              <Text style={styles.signInButtonIcon}>→</Text>
            </>
          )}
        </View>
      </TouchableOpacity>

      <Text style={styles.newAccountText}>New to Samaco Brewery?</Text>

      <TouchableOpacity
        style={styles.createAccountButton}
        onPress={handleRegisterPress}
      >
        <View style={styles.buttonContent}>
          <Text style={styles.createAccountIcon}>👤</Text>
          <Text style={styles.createAccountButtonText}>Create an account</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.googleButton}
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
      >
        <View style={styles.buttonContent}>
          <Text style={styles.googleIcon}>G</Text>
          <Text style={styles.googleButtonText}>Login with Google</Text>
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  scrollContent: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
  },
  header: {
    width: '100%',
    marginBottom: 40,
    alignItems: 'center',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  logoContainer: {
    backgroundColor: '#FFD700',
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoImage: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
  },
  logoText: {
    fontSize: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold' as const,
    color: '#FFD700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
  },
  signInButton: {
    backgroundColor: '#FFD700',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    width: '100%',
    marginBottom: 20,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonContent: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  signInButtonText: {
    color: '#0a0a0a',
    fontSize: 16,
    fontWeight: 'bold' as const,
    marginRight: 8,
  },
  signInButtonIcon: {
    color: '#0a0a0a',
    fontSize: 20,
    fontWeight: 'bold' as const,
  },
  newAccountText: {
    color: '#888',
    fontSize: 14,
    marginBottom: 16,
  },
  createAccountButton: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    width: '100%',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  createAccountIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  createAccountButtonText: {
    color: '#888',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  googleButton: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    width: '100%',
    borderWidth: 1,
    borderColor: '#333',
  },
  googleIcon: {
    color: '#4285F4',
    fontSize: 20,
    fontWeight: 'bold' as const,
    marginRight: 8,
  },
  googleButtonText: {
    color: '#888',
    fontSize: 16,
    fontWeight: '600' as const,
  },
});

export default Login;
