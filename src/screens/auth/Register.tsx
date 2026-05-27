import React, { useState, useEffect } from 'react';
import {
  Text, TouchableOpacity, View, ActivityIndicator, StyleSheet,
  ScrollView, Image, TextInput, KeyboardAvoidingView, Platform, Dimensions
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';
import Toast from 'react-native-toast-message';
import { REGISTER_REQUEST } from '../../app/reducers/authReducer';
import type { RootState } from '../../app/reducers';
import { ROUTES, type AuthStackParamList } from '../../types';
import { resendVerification } from '../../app/api/auth';

const { width, height } = Dimensions.get('window');

type RegisterScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

const Register: React.FC = () => {
  const [emailAdd, setEmailAdd] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [showVerificationMessage, setShowVerificationMessage] = useState<boolean>(false);
  const [isResending, setIsResending] = useState<boolean>(false);

  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const dispatch = useDispatch();
  const { isLoading, error, registerSuccess } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (registerSuccess) {
      setShowVerificationMessage(true);
      Toast.show({
        type: 'success',
        text1: 'Registration Successful!',
        text2: 'Please check your email to verify your account',
        position: 'top',
        visibilityTime: 3000,
      });
    }
  }, [registerSuccess]);

  useEffect(() => {
    if (error) {
      Toast.show({
        type: 'error',
        text1: 'Registration Failed',
        text2: error,
        position: 'top',
        visibilityTime: 3000,
      });
    }
  }, [error]);

  const handleRegister = (): void => {
    if (emailAdd === '' || password === '' || confirmPassword === '' || firstName === '' || lastName === '') {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please fill in all fields',
        position: 'top',
        visibilityTime: 3000,
      });
      return;
    }

    if (password !== confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Passwords do not match',
        position: 'top',
        visibilityTime: 3000,
      });
      return;
    }

    dispatch({
      type: REGISTER_REQUEST,
      payload: { email: emailAdd, password, firstName: firstName, lastName: lastName },
    });
  };

  const handleLoginPress = (): void => {
    navigation.navigate(ROUTES.LOGIN);
  };

  const handleResendVerification = async (): Promise<void> => {
    setIsResending(true);
    try {
      await resendVerification(emailAdd);
      Toast.show({
        type: 'success',
        text1: 'Verification Email Sent',
        text2: 'Please check your inbox',
        position: 'top',
        visibilityTime: 3000,
      });
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Failed to Resend',
        text2: err.message || 'Please try again later',
        position: 'top',
        visibilityTime: 3000,
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleGoToLogin = (): void => {
    setShowVerificationMessage(false);
    navigation.navigate(ROUTES.LOGIN);
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
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join Samaco Brewery today</Text>
        </View>

        <View style={styles.formContainer}>
          {showVerificationMessage ? (
            <View style={styles.verificationContainer}>
              <Text style={styles.verificationTitle}>📧 Verify Your Email</Text>
              <Text style={styles.verificationText}>
                We've sent a verification email to:
              </Text>
              <Text style={styles.verificationEmail}>{emailAdd}</Text>
              <Text style={styles.verificationText}>
                Please check your inbox and click the verification link to activate your account.
              </Text>

              <TouchableOpacity
                style={[styles.resendButton, isResending && styles.resendButtonDisabled]}
                onPress={handleResendVerification}
                disabled={isResending}
              >
                {isResending ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.resendButtonText}>Resend Verification Email</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity style={styles.goToLoginButton} onPress={handleGoToLogin}>
                <Text style={styles.goToLoginButtonText}>Go to Login</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>First Name</Text>
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputIcon}>👤</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter your first name"
                    placeholderTextColor="#6B7280"
                    value={firstName}
                    onChangeText={setFirstName}
                    autoCapitalize="words"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Last Name</Text>
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputIcon}>👤</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter your last name"
                    placeholderTextColor="#6B7280"
                    value={lastName}
                    onChangeText={setLastName}
                    autoCapitalize="words"
                  />
                </View>
              </View>

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
                    placeholder="Create a password"
                    placeholderTextColor="#6B7280"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={true}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Confirm Password</Text>
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputIcon}>✓</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Confirm your password"
                    placeholderTextColor="#6B7280"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={true}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[styles.createButton, isLoading && styles.createButtonDisabled]}
                onPress={handleRegister}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#0a0a0a" size="small" />
                ) : (
                  <Text style={styles.createButtonText}>Create Account</Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <TouchableOpacity onPress={handleLoginPress}>
            <Text style={styles.signInLink}>Sign In</Text>
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
  createButton: {
    backgroundColor: '#FFD700',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  createButtonDisabled: {
    opacity: 0.7,
  },
  createButtonText: {
    color: '#0a0a0a',
    fontSize: 16,
    fontWeight: 'bold',
  },
  verificationContainer: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  verificationTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 16,
    textAlign: 'center',
  },
  verificationText: {
    fontSize: 14,
    color: '#D1D5DB',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 20,
  },
  verificationEmail: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  resendButton: {
    backgroundColor: '#FFD700',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginTop: 16,
    minWidth: 200,
  },
  resendButtonDisabled: {
    opacity: 0.7,
  },
  resendButtonText: {
    color: '#0a0a0a',
    fontSize: 16,
    fontWeight: 'bold',
  },
  goToLoginButton: {
    marginTop: 12,
  },
  goToLoginButtonText: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: '#9CA3AF',
    fontSize: 14,
    marginRight: 8,
  },
  signInLink: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default Register;