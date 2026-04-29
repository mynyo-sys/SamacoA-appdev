import React, { useState, useEffect } from 'react';
import { Alert, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';
import { GoogleSigninButton } from '@react-native-google-signin/google-signin';
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

  // Show error alert when error changes
  useEffect(() => {
    if (error) {
      console.log(`[ERROR] Login failed: ${error}`);
      Alert.alert('Login Failed', error);
    }
  }, [error]);

  // Log when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      console.log('[SUCCESS] User authenticated successfully');
    }
  }, [isAuthenticated]);

  const handleLogin = (): void => {
    // Log button press with final values
    console.log('[ACTION] Login button pressed');
    console.log(`[DATA] Email: ${emailAdd}, Password entered: ${password ? 'Yes' : 'No'}`);

    if (emailAdd === '' || password === '') {
      console.log('[VALIDATION] Empty fields detected');
      Alert.alert(
        'Invalid Credentials',
        'Please enter valid email address and password',
      );
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
    <View
      style={{
        flex: 1,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View style={{ width: '100%' }}>
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
        label={isLoading ? 'LOGGING IN...' : 'LOGIN'}
        containerStyle={{
          backgroundColor: isLoading ? 'gray' : 'blue',
          borderRadius: 10,
          marginVertical: 20,
          width: '80%',
        }}
        textStyle={{
          color: 'white',
          fontWeight: 'bold',
        }}
        onPress={handleLogin}
        disabled={isLoading}
      >
        {isLoading && <ActivityIndicator color="white" />}
      </CustomButton>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text>Create an account?</Text>
        <TouchableOpacity onPress={handleRegisterPress}>
          <Text style={{ color: 'red', marginLeft: 10, fontWeight: 'bold' }}>
            Register
          </Text>
        </TouchableOpacity>
      </View>

      <GoogleSigninButton
        size={GoogleSigninButton.Size.Wide}
        color={GoogleSigninButton.Color.Dark}
        onPress={async () => {
          console.log('[ACTION] Google Sign-in button pressed');
          const result = await _signInWithGoogle();
          if (result.error) {
            Alert.alert('Google Sign-in Failed', result.error);
          } else if (result.userInfo) {
            console.log('[SUCCESS] Google Sign-in successful:', result.userInfo);
            const userEmail = result.userInfo.user?.email || 'Unknown';
            const userName = result.userInfo.user?.name || 'Unknown';
            Alert.alert('Success', `Signed in as ${userEmail}`);
            
            // Dispatch LOGIN_SUCCESS to automatically redirect to Home
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
            Alert.alert('Sign-in Cancelled', 'No user information received');
          }
        }}
        disabled={isLoading}
      />
    </View>
  );
};

export default Login;
