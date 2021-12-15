// dependencies
import { AppRegistry, View, Text, Button } from 'react-native';
import { NavigationContainer }        from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// screens
import Electricity from './src/index';

const Home = ({ navigation: { navigate } }) => (
  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
    <Button title="电费" onPress={() => navigate('Electricity')} />
  </View>
);

/*
const Toolbar = () => (
  <View>
    <Button title="☰" onPress={() => {}} />
    <Text>Title</Text>
  </View>
)
*/

const { Navigator, Screen } = createNativeStackNavigator();

const Kite = () => (
  <NavigationContainer>
    <Navigator>
      <Screen name="Home"        component={Home} />
      <Screen name="Electricity" component={Electricity} />
    </Navigator>
  </NavigationContainer>
);

AppRegistry.registerComponent('Kite', () => Kite);
