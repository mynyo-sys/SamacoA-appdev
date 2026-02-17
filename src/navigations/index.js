import { createStackNavigator } from "@react-navigation/stack";

//screens
import HomeScreen from "../screens/HomeScreen";
import ProfileScreen from "../screens/ProfileScreen";

//utils
import { NavigationContainer } from "@react-navigation/native";

const Stack = createStackNavigator();

const MainNavigation = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      setIsLoggedIn(!!token);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <Stack.Navigator initialRouteName={ROUTES.HOME}>
      <Stack.Screen name={ROUTES.HOME} component={HomeScreen} />
      <Stack.Screen name={ROUTES.PROFILE} component={ProfileScreen} />
    </Stack.Navigator>
  );
}

export default () => {
  return (
    <NavigationContainer>
      <MainNavigation />
    </NavigationContainer>
  );
}