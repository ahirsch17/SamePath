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
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { userDataService } from '../services/UserDataService';

interface LoginScreenNavigationProp {
  navigate: (screen: string) => void;
  goBack: () => void;
}

export default function LoginScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const logo = require('../assets/SamePathLogo.png');

  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!password.trim()) {
      Alert.alert('Please enter your password.');
      return;
    }

    try {
      const user = await userDataService.loginByPassword(password);
      if (user) {
        // Navigate to main app (you can add a main screen later)
        Alert.alert('Login successful!', `Welcome back, ${user.name}!`);
        // For now, go back to welcome screen
        navigation.goBack();
      } else {
        Alert.alert('Login failed', 'Incorrect password or account not found. Please try again or use the setup screen for new accounts.');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
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
        Enter your password to sign in to SamePath.
      </Text>

      <Text style={styles.label}>Password</Text>
      <TextInput
        style={styles.input}
        secureTextEntry
        placeholder="Enter your password"
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity
        style={[styles.button, !password.trim() && styles.disabledButton]}
        onPress={handleLogin}
        disabled={!password.trim()}
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