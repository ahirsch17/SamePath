  // File: App.tsx
  import React from 'react';
  import { NavigationContainer } from '@react-navigation/native';
  import { createStackNavigator } from '@react-navigation/stack';
  import WelcomeScreen from './screens/WelcomeScreen';
import SetupScreen from './screens/SetupScreen';
import LoginScreen from './screens/LoginScreen';
import TermsScreen from './screens/TermsScreen';
import ConnectionsScreen from './screens/ConnectionsScreen';
import ContactsListScreen from './screens/ContactsListScreen';



  const Stack = createStackNavigator();

  export default function App() {
  return (
    <NavigationContainer>
  <Stack.Navigator initialRouteName="Welcome">
    <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
    <Stack.Screen name="Setup" component={SetupScreen} options={{ headerShown: false }} />
    <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
    <Stack.Screen name="Terms" component={TermsScreen} options={{ headerShown: false }} />
    <Stack.Screen name="Connections" component={ConnectionsScreen} options={{ headerShown: false }} />
    <Stack.Screen name="Contacts" component={ContactsListScreen} options={{ headerShown: false }} />
  </Stack.Navigator>
  </NavigationContainer>

  );
  }
