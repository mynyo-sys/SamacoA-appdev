import React, { useState, useEffect } from 'react';
import { Alert, Text, TouchableOpacity, View, ActivityIndicator, StyleSheet, ScrollView, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';
import Toast from 'react-native-toast-message';

import CustomButton from '../../components/CustomButton';
import CustomTextInput from '../../components/CustomTextInput';
import { ROUTES, type AuthStackParamList } from '../../types';
import { REGISTER_REQUEST } from '../../app/reducers/authReducer';
import type { RootState } from '../../app/reducers';

type RegisterScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

const Register: React.FC = () => {
  const [emailAdd, setEmailAdd] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const dispatch = useDispatch();
  const { isLoading, error, registerSuccess } = useSelector((state: RootState) => state.auth);

  // Log when Register screen loads
  console.log('[SCREEN] Register screen loaded');

  // Handle registration success
  useEffect(() => {
    if (registerSuccess) {
      console.log('[SUCCESS] Registration successful, redirecting to login');
      Toast.show({
        type: 'success',
        text1: 'Registration Successful!',
        text2: 'Please login to continue',
        position: 'top',
        visibilityTime: 2000,
      });
      navigation.navigate(ROUTES.LOGIN);
    }
  }, [registerSuccess, navigation]);

  // Handle registration error
  useEffect(() => {
    if (error) {
      console.log(`[ERROR] Registration failed: ${error}`);
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
    // Log button press with final values
    console.log('[ACTION] Register button pressed');
    console.log(`[DATA] Email: ${emailAdd}, Password entered: ${password ? 'Yes' : 'No'}`);

    // Validate inputs
    if (emailAdd === '' || password === '' || confirmPassword === '') {
      console.log('[VALIDATION] Empty fields detected');
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
      console.log('[VALIDATION] Passwords do not match');
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Passwords do not match',
        position: 'top',
        visibilityTime: 3000,
      });
      return;
    }

    console.log('[VALIDATION] All fields valid, dispatching REGISTER_REQUEST');

    // Dispatch Redux action
    dispatch({
      type: REGISTER_REQUEST,
      payload: { email: emailAdd, password },
    });
  };

  const handleLoginPress = (): void => {
    console.log('[ACTION] Login link pressed');
    navigation.navigate(ROUTES.LOGIN);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          {/* Replace with actual logo image: <Image source={require('../../assets/logo.png')} style={styles.logoImage} /> */}
          <Image source={require('../../../assets/images/logo.png')} style={styles.logoImage} />
        </View>
        <Text style={styles.title}>Samaco Brewery</Text>
        <Text style={styles.subtitle}>Create an account</Text>
      </View>

      <View style={styles.inputContainer}>
        <CustomTextInput
          label={'Email address'}
          placeholder={'Enter your email'}
          value={emailAdd}
          onChangeText={setEmailAdd}
          keyboardType="email-address"
          autoCapitalize="none"
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
        <CustomTextInput
          label={'Confirm Password'}
          placeholder={'Confirm your password'}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
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
        style={styles.createAccountButton}
        onPress={handleRegister}
        disabled={isLoading}
      >
        <View style={styles.buttonContent}>
          {isLoading ? (
            <ActivityIndicator color="#0a0a0a" />
          ) : (
            <>
              <Text style={styles.createAccountButtonText}>Create account</Text>
              <Text style={styles.createAccountButtonIcon}>+</Text>
            </>
          )}
        </View>
      </TouchableOpacity>

      <Text style={styles.alreadyAccountText}>Already have an account?</Text>

      <TouchableOpacity
        style={styles.loginButton}
        onPress={handleLoginPress}
      >
        <View style={styles.buttonContent}>
          <Text style={styles.loginIcon}>👤</Text>
          <Text style={styles.loginButtonText}>Login</Text>
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
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  createAccountButton: {
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
  createAccountButtonText: {
    color: '#0a0a0a',
    fontSize: 16,
    fontWeight: 'bold' as const,
    marginRight: 8,
  },
  createAccountButtonIcon: {
    color: '#0a0a0a',
    fontSize: 24,
    fontWeight: 'bold' as const,
  },
  alreadyAccountText: {
    color: '#888',
    fontSize: 14,
    marginBottom: 16,
  },
  loginButton: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    width: '100%',
    borderWidth: 1,
    borderColor: '#333',
  },
  loginIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  loginButtonText: {
    color: '#888',
    fontSize: 16,
    fontWeight: '600' as const,
  },
});

export default Register;
