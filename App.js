import { StatusBar } from 'expo-status-bar';
import { StyleSheet, LogBox} from 'react-native';
import orders from './assets/data/orders.json';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {NavigationContainer} from '@react-navigation/native';
import Navigation from './src/navigation';
import { Amplify } from 'aws-amplify';
import { withAuthenticator} from 'aws-amplify-react-native';
import awsconfig from './src/aws-exports';
import AuthContextProvider from './src/contexts/AuthContext';
import OrderContextProvider from './src/contexts/OrderContext';

LogBox.ignoreLogs(["Setting a timer"]);


Amplify.configure({
  ...awsconfig,
  Analytics: {
    disabled: true,
  }
});

function App() {
  return (
    <NavigationContainer>
      <GestureHandlerRootView style={styles.container}>
          <AuthContextProvider>
            <OrderContextProvider>
              <Navigation />
            </OrderContextProvider>
          </AuthContextProvider>
        <StatusBar style="auto" />
      </GestureHandlerRootView>
    </NavigationContainer>
  );
}

export default withAuthenticator(App);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    /* alignItems: 'center', */
   justifyContent: 'center',
   paddingTop: 50,
  },
});

// AIzaSyDYj8QLP7gEVH2SchTLYZ0VkjQzC9teRBY
