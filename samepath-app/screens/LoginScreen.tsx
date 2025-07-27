import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  Image,
  StatusBar,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ApiService from '../services/ApiService';

export default function LoginScreen() {
  const navigation = useNavigation<NavigationProp<any>>();
  const logo = require('../assets/SamePathLogo.png');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Please enter both email and password.');
      return;
    }
    try {
      const response = await ApiService.login(email.trim(), password);
      console.log('Login response:', JSON.stringify(response.data, null, 2));
      console.log('Response status:', response.status);
      
      // Check if login was successful based on the new API response format
      if (response.data && response.data.success) {
        // Store both user_id and email
        if (response.data.user_id) {
          await AsyncStorage.setItem('user_id', String(response.data.user_id));
          console.log('Login successful, stored user_id:', response.data.user_id);
        }
        await AsyncStorage.setItem('user_email', email.trim());
        console.log('Login successful, stored email:', email.trim());
        navigation.reset({ index: 0, routes: [{ name: 'SamePath' }] });
      } else {
        // Handle login failure
        const errorMessage = response.data?.error || 'Incorrect email or password.';
        Alert.alert('Login failed', errorMessage);
      }
    } catch (error: any) {
      console.log('Login error:', error);
      let errorMessage = 'Something went wrong. Please try again.';
      if (error.response && error.response.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else {
          errorMessage = JSON.stringify(error.response.data);
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      Alert.alert('Error', errorMessage);
    }
  };

  return (
    <View style={styles.container}>
      {/* Back button */}
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>

      <Image source={logo} style={styles.logo} resizeMode="contain" />

      <Text style={styles.title}>Welcome Back</Text>
      <Text style={styles.subtitle}>
        Enter your email and password to sign in to SamePath.
      </Text>

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., alexishirsch@vt.edu"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoCorrect={false}
      />

      <Text style={styles.label}>Password</Text>
      <TextInput
        style={styles.input}
        secureTextEntry
        placeholder="Enter your password"
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity
        style={[styles.button, (!email.trim() || !password.trim()) && styles.disabledButton]}
        onPress={handleLogin}
        disabled={!email.trim() || !password.trim()}
      >
        <Text style={styles.buttonText}>Sign In</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.forgotPassword}
        onPress={() => Alert.alert('Forgot Password', 'Password reset functionality coming soon.')}
      >
        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 60,
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 25,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 20 : 80,
    left: 25,
    zIndex: 1,
  },
  logo: {
    width: 250,
    height: 80,
    alignSelf: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
    color: '#222',
  },
  subtitle: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
  },
  input: {
    height: 45,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#d67b32',
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  forgotPassword: {
    alignItems: 'center',
    marginTop: 20,
  },
  forgotPasswordText: {
    color: '#007aff',
    fontSize: 14,
  },
}); 