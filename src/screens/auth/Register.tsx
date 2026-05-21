import React, { useState, useEffect } from 'react';
import { Alert, Text, TouchableOpacity, View, ActivityIndicator, StyleSheet } from 'react-native';
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
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>🍺</Text>
        </View>
        <Text style={styles.title}>Samaco Brewery</Text>
        <Text style={styles.subtitle}>Create an account</Text>
      </View>

      <View style={styles.inputContainer}>
        <CustomTextInput
          label={'Email Address'}
          placeholder={'Enter Email Address'}
          value={emailAdd}
          onChangeText={setEmailAdd}
          keyboardType="email-address"
          autoCapitalize="none"
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
        <CustomTextInput
          label={'Confirm Password'}
          placeholder={'Confirm Password'}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
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
        label={isLoading ? 'REGISTERING...' : 'CREATE ACCOUNT'}
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
          fontWeight: 'bold' as const,
          fontSize: 16,
        }}
        onPress={handleRegister}
        disabled={isLoading}
      >
        {isLoading && <ActivityIndicator color="#0a0a0a" />}
      </CustomButton>

      <View style={styles.dividerContainer}>
        <View style={styles.divider} />
        <Text style={styles.dividerText}>Already have an account?</Text>
        <View style={styles.divider} />
      </View>

      <TouchableOpacity
        style={styles.loginButton}
        onPress={handleLoginPress}
      >
        <Text style={styles.loginButtonText}>Login</Text>
      </TouchableOpacity>
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
  inputContainer: {
    width: '100%',
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
  loginButton: {
    borderWidth: 2,
    borderColor: '#444',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center' as const,
  },
  loginButtonText: {
    color: '#888',
    fontSize: 14,
    fontWeight: '600' as const,
  },
});

export default Register;
