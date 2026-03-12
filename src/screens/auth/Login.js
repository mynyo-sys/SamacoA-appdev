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

  // Show error alert when error changes
  useEffect(() => {
    if (error) {
      Alert.alert('Login Failed', error);
    }
  }, [error]);

  //log when authenticated
  useEffect(() => {
      if (isAuthenticated) {
        console.log('User authenticated successfully!');
      }
    }, [isAuthenticated]);

    const handleLogin = () => {
      if (emailAdd === '' || password === '') {
        Alert.alert(
          'Invalid Credentials',
          'Please enter valid email address and password',
        );
        return;
      }
    
    // Dispatch login action
    dispatch({ 
      type: LOGIN_REQUEST, 
      payload: { email: emailAdd, password } 
    });
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
        <TouchableOpacity onPress={() => navigation.navigate(ROUTES.REGISTER)}>
          <Text style={{ color: 'red', marginLeft: 10, fontWeight: 'bold' }}>
            Register
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Login;