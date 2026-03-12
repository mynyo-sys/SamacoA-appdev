import { createStackNavigator } from '@react-navigation/stack';
import { ROUTES } from '../utils';

// screens
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createStackNavigator();

const MainNavigation = () => {
  return (
    <Stack.Navigator initialRouteName={ROUTES.HOME}>
      <Stack.Screen 
        name={ROUTES.HOME} 
        component={HomeScreen} 
        options={{ headerShown: true, title: 'Home' }}
      />
      <Stack.Screen 
        name={ROUTES.PROFILE} 
        component={ProfileScreen} 
        options={{ headerShown: true, title: 'Profile' }}
      />
    </Stack.Navigator>
  );
};

export default MainNavigation;