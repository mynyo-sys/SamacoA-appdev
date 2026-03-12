import { useState, useEffect } from 'react';
import { Alert, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';

import CustomButton from '../../components/CustomButton';
import CustomTextInput from '../../components/CustomTextInput';
import { ROUTES } from '../../utils';
import { REGISTER_REQUEST } from '../../app/reducers/authReducer';

const Register = () => {
  const [emailAdd, setEmailAdd] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { isLoading, error, registerSuccess } = useSelector(state => state.auth || {});

  // Log when Register screen loads
  console.log('[SCREEN] Register screen loaded');

  // Handle registration success
  useEffect(() => {
    if (registerSuccess) {
      console.log('[SUCCESS] Registration successful, redirecting to login');
      Alert.alert('Success', 'Registration successful! Please login.');
      navigation.navigate(ROUTES.LOGIN);
    }
  }, [registerSuccess, navigation]);

  // Handle registration error
  useEffect(() => {
    if (error) {
      console.log(`[ERROR] Registration failed: ${error}`);
      Alert.alert('Registration Failed', error);
    }
  }, [error]);

  const handleRegister = () => {
    // Log button press with final values
    console.log('[ACTION] Register button pressed');
    console.log(`[DATA] Email: ${emailAdd}, Password entered: ${password ? 'Yes' : 'No'}`);

    // Validate inputs
    if (emailAdd === '' || password === '' || confirmPassword === '') {
      console.log('[VALIDATION] Empty fields detected');
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      console.log('[VALIDATION] Passwords do not match');
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    console.log('[VALIDATION] All fields valid, dispatching REGISTER_REQUEST');
    
    // Dispatch Redux action
    dispatch({ 
      type: REGISTER_REQUEST, 
      payload: { email: emailAdd, password } 
    });
  };

  const handleLoginPress = () => {
    console.log('[ACTION] Login link pressed');
    navigation.navigate(ROUTES.LOGIN);
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
        label={isLoading ? "REGISTERING..." : "REGISTER"}
        containerStyle={{
          backgroundColor: isLoading ? 'gray' : 'green',
          borderRadius: 10,
          marginVertical: 20,
          width: '80%',
        }}
        textStyle={{
          color: 'white',
          fontWeight: 'bold',
        }}
        onPress={handleRegister}
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
        <Text>Already have an account?</Text>
        <TouchableOpacity onPress={handleLoginPress}>
          <Text style={{ color: 'blue', marginLeft: 10, fontWeight: 'bold' }}>
            Login
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Register;