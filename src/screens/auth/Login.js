import { useState, useEffect } from 'react';
import { Alert, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';

import CustomButton from '../../components/CustomButton';
import CustomTextInput from '../../components/CustomTextInput';
import { ROUTES } from '../../utils';
import { LOGIN_REQUEST } from '../../app/reducers/authReducer';

const Login = () => {
  const [emailAdd, setEmailAdd] = useState('');
  const [password, setPassword] = useState('');

  const navigation = useNavigation();
  const dispatch = useDispatch();
  
  // Get loading, error, and auth state from Redux
  const { isLoading, error, isAuthenticated } = useSelector(state => state.auth);

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

  const handleLogin = () => {
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
      payload: { email: emailAdd, password } 
    });
  };

  const handleRegisterPress = () => {
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
          onChangeText={setEmailAdd}  // Back to original
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
          onChangeText={setPassword}  // Back to original
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
        label={isLoading ? "LOGGING IN..." : "LOGIN"}
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
    </View>
  );
};

export default Login;