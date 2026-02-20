import { Text, View, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ROUTES } from '../utils';

const HomeScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Home Screen</Text>
      <Button
        title="Go to Profile"
        onPress={() => navigation.navigate(ROUTES.PROFILE)}
      />
    </View>
  );
};

export default HomeScreen;