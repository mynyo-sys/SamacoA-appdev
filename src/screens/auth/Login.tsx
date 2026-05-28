import React, { useState, useEffect } from 'react';
import {
  Text, TouchableOpacity, View, ActivityIndicator,
  StyleSheet, Image, ScrollView, TextInput, KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LOGIN_REQUEST, LOGIN_SUCCESS, GET_USER_REQUEST } from '../../app/reducers/authReducer';
import type { RootState } from '../../app/reducers';
import { _signInWithGoogle } from '../../utils/firebase';
import { ROUTES, type AuthStackParamList } from '../../types';
import { storeCustomerId } from '../../app/api/auth';

type LoginScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

const Login: React.FC = () => {
  const [emailAdd, setEmailAdd] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const navigation = useNavigation<LoginScreenNavigationProp>();
  const dispatch = useDispatch();

  const { isLoading, error, isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (error) {
      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: error,
        position: 'top',
        visibilityTime: 3000,
      });
    }
  }, [error]);

  const handleCatchError = (err: any) => {
    console.error('Auth error:', err);
  };

  useEffect(() => {
    if (isAuthenticated) {
      Toast.show({
        type: 'success',
        text1: 'Welcome Back!',
        text2: 'You have successfully signed in',
        position: 'top',
        visibilityTime: 2000,
      });
      navigation.goBack();
    }
  }, [isAuthenticated, navigation]);

  const handleLogin = (): void => {
    if (emailAdd === '' || password === '') {
      Toast.show({
        type: 'error',
        text1: 'Invalid Credentials',
        text2: 'Please enter valid email address and password',
        position: 'top',
        visibilityTime: 3000,
      });
      return;
    }

    dispatch({
      type: LOGIN_REQUEST,
      payload: { email: emailAdd, password },
    });
  };

  const handleRegisterPress = (): void => {
    navigation.navigate(ROUTES.REGISTER);
  };

  const handleGoogleSignIn = async (): Promise<void> => {
    try {
      const result = await _signInWithGoogle();
      
      if (!result.success || !result.token) {
        Toast.show({
          type: 'error',
          text1: 'Google Sign-in Failed',
          text2: result.error || 'No token received from server',
          position: 'top',
          visibilityTime: 3000,
        });
        return;
      }

      Toast.show({
        type: 'success',
        text1: 'Signed in Successfully',
        text2: `Welcome, ${(result.user as { email?: string })?.email || 'User'}`,
        position: 'top',
        visibilityTime: 2000,
      });

      await AsyncStorage.setItem('userToken', result.token);

      const googleUser = result.user as {
        id?: number;
        email?: string;
        fullName?: string;
        firstName?: string;
        lastName?: string;
        customerId?: number;
      } | null;

      if (googleUser?.customerId) {
        await storeCustomerId(googleUser.customerId);
      }

      dispatch({
        type: LOGIN_SUCCESS,
        payload: {
          token: result.token,
          user: {
            email: googleUser?.email || 'Unknown',
            fullName:
              googleUser?.fullName ||
              `${googleUser?.firstName || ''} ${googleUser?.lastName || ''}`.trim() ||
              'User',
            id: googleUser?.id ? String(googleUser.id) : undefined,
          },
        },
      });

      dispatch({ type: GET_USER_REQUEST });
    } catch (authError: any) {
      handleCatchError(authError);
      Toast.show({
        type: 'error',
        text1: 'Authentication Failed',
        text2: authError.message || 'Could not authenticate with backend',
        position: 'top',
        visibilityTime: 3000,
      });
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.logoWrapper}>
            <View style={styles.logoContainer}>
              <Image source={require('../../../assets/images/logo.png')} style={styles.logoImage} />
            </View>
          </View>
          <Text style={styles.title}>Samaco Brewery</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputIcon}>✉️</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter your email"
                placeholderTextColor="#6B7280"
                value={emailAdd}
                onChangeText={setEmailAdd}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputIcon}>🔒</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter your password"
                placeholderTextColor="#6B7280"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={true}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.signInButton, isLoading && styles.signInButtonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#0a0a0a" size="small" />
            ) : (
              <Text style={styles.signInButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogleSignIn}
            disabled={isLoading}
          >
            <View style={styles.googleIconContainer}>
              <Text style={styles.googleIcon}>G</Text>
            </View>
            <Text style={styles.googleButtonText}>Continue with Google</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account?</Text>
          <TouchableOpacity onPress={handleRegisterPress}>
            <Text style={styles.signUpLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoWrapper: {
    marginBottom: 24,
  },
  logoContainer: {
    backgroundColor: '#FFD700',
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  logoImage: {
    width: 70,
    height: 70,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 8,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  formContainer: {
    width: '100%',
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D1D5DB',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#374151',
    paddingHorizontal: 16,
  },
  inputIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    paddingVertical: 14,
  },
  signInButton: {
    backgroundColor: '#FFD700',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  signInButtonDisabled: {
    opacity: 0.7,
  },
  signInButtonText: {
    color: '#0a0a0a',
    fontSize: 16,
    fontWeight: 'bold',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#374151',
  },
  dividerText: {
    color: '#6B7280',
    paddingHorizontal: 16,
    fontSize: 12,
  },
  googleButton: {
    flexDirection: 'row',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  googleIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#4285F4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  googleIcon: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  googleButtonText: {
    color: '#D1D5DB',
    fontSize: 15,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  footerText: {
    color: '#9CA3AF',
    fontSize: 14,
    marginRight: 8,
  },
  signUpLink: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default Login;