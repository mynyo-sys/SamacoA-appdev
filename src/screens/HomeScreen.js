import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { LOGOUT } from '../app/reducers/authReducer';

const HomeScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { user } = useSelector(state => state.auth);

  console.log('[SCREEN] Home screen loaded');

  const handleLogout = () => {
    console.log('[ACTION] Logout button pressed');
    console.log(`[USER] Logging out: ${user?.email || 'unknown'}`);
    dispatch({ type: LOGOUT });
  };

  const handleProfilePress = () => {
    console.log('[ACTION] Profile button pressed');
    navigation.navigate('Profile');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home Screen</Text>
      
      {user && (
        <View style={styles.userInfo}>
          <Text style={styles.welcome}>Welcome, {user.fullName || user.email}!</Text>
          <Text style={styles.email}>Email: {user.email}</Text>
        </View>
      )}
    

      <TouchableOpacity 
        style={styles.profileButton}
        onPress={handleProfilePress}
      >
        <Text style={styles.buttonText}>GO TO PROFILE</Text>
      </TouchableOpacity>



      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Text style={styles.buttonText}>LOGOUT</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  userInfo: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 30,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  welcome: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#007AFF',
  },
  email: {
    fontSize: 16,
    color: '#666',
  },
  profileButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginBottom: 15,
    width: '80%',
    alignItems: 'center',
  },
  //   errorButton: {  // ADD THIS STYLE
  //   backgroundColor: '#FF3B30',
  //   paddingVertical: 12,
  //   paddingHorizontal: 30,
  //   borderRadius: 8,
  //   marginBottom: 15,
  //   width: '80%',
  //   alignItems: 'center',
  // },
  logoutButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HomeScreen;