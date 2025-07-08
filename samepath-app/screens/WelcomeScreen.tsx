import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Platform, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  Welcome: undefined;
  Setup: undefined;
  Login: undefined;
  // add other screens here if needed
};

export default function WelcomeScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const logo = require('../assets/SamePathLogo.png'); // Make sure this logo exists in your assets folder

  return (
    <View style={styles.container}>
      <Image source={logo} style={styles.logo} resizeMode="contain" />

      <Text style={styles.title}>Welcome to SamePath</Text>
      <Text style={styles.subtitle}>
        Connecting students with shared paths, free time, and campus opportunities.
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Setup')}
      >
        <Text style={styles.buttonText}>I'm New</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.secondaryButton]}
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={styles.buttonText}>I'm Returning</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 60,
    paddingHorizontal: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 240,
    height: 80,
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 10,
    color: '#222',
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#d67b32',
    paddingVertical: 14,
    paddingHorizontal: 25,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 15,
    width: '80%',
  },
  secondaryButton: {
    backgroundColor: '#888',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
