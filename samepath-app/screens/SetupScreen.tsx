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

export default function SetupScreen() {
  const navigation = useNavigation<NavigationProp<any>>();
  const logo = require('../assets/SamePathLogo.png');

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [school, setSchool] = useState('');
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(false);

  const isPasswordValid = () =>
    password.length >= 8 && /[A-Z]/.test(password) && /[^A-Za-z0-9]/.test(password);

  const isFormValid = () =>
    firstName.length > 0 && lastName.length > 0 && email.length > 0 && school.length > 0 && isPasswordValid() && agreed;

  const handleSubmit = async () => {
    if (!isFormValid()) {
      return;
    }
    try {
      const response = await ApiService.signup(firstName, lastName, email, password, school);
      if (response.data && response.data.user_id) {
        await AsyncStorage.setItem('user_id', String(response.data.user_id));
        navigation.reset({ index: 0, routes: [{ name: 'SamePath' }] });
      } else {
        const message = response.data?.message || 'Please check your info and try again.';
        Alert.alert('Signup failed', message);
      }
    } catch (error: any) {
      let errorMessage = 'Something went wrong. Please try again.';
      if (error.response && error.response.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
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

      <Text style={styles.subtext}>
        Enter your info and choose a secure password.
      </Text>

      <Text style={styles.label}>First Name</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., Alexis"
        value={firstName}
        onChangeText={setFirstName}
        autoCapitalize="words"
      />

      <Text style={styles.label}>Last Name</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., Hirsch"
        value={lastName}
        onChangeText={setLastName}
        autoCapitalize="words"
      />

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., alexishirsch@vt.edu"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoCorrect={false}
      />

      <Text style={styles.label}>School</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., Virginia Tech"
        value={school}
        onChangeText={setSchool}
        autoCapitalize="words"
      />

      <Text style={styles.label}>Choose a Password</Text>
      <TextInput
        style={styles.input}
        secureTextEntry
        placeholder="length > 8, include capital letter and special character "
        value={password}
        onChangeText={setPassword}
      />

      <View style={styles.agreeRow}>
        <TouchableOpacity
          style={styles.checkbox}
          onPress={() => setAgreed(!agreed)}
        >
          {agreed && <View style={styles.checkboxChecked} />}
        </TouchableOpacity>
        <Text style={styles.agreeText}>
          I agree to the{' '}
          <Text
            style={styles.termsLink}
            onPress={() => navigation.navigate('Terms' as never)}
          >
            Terms of Use
          </Text>
        </Text>
      </View>

      {/* Validation messages */}
      <View style={styles.validationContainer}>
        {firstName.length === 0 && (
          <Text style={styles.validationText}>❌ Please enter your first name</Text>
        )}
        {lastName.length === 0 && (
          <Text style={styles.validationText}>❌ Please enter your last name</Text>
        )}
        {email.length === 0 && (
          <Text style={styles.validationText}>❌ Please enter your email</Text>
        )}
        {school.length === 0 && (
          <Text style={styles.validationText}>❌ Please enter your school</Text>
        )}
        {password.length === 0 && (
          <Text style={styles.validationText}>❌ Please enter a password</Text>
        )}
        {password.length > 0 && !isPasswordValid() && (
          <Text style={styles.validationText}>
            ❌ Password must be at least 8 characters with uppercase and special character
          </Text>
        )}
        {!agreed && (
          <Text style={styles.validationText}>❌ Please agree to Terms of Use</Text>
        )}
      </View>

      <TouchableOpacity
        style={[styles.button, !isFormValid() && styles.disabledButton]}
        onPress={handleSubmit}
        disabled={!isFormValid()}
      >
        <Text style={styles.buttonText}>Sign Up</Text>
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
  subtext: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginBottom: 25,
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
  agreeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 1.5,
    borderColor: '#333',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    width: 12,
    height: 12,
    backgroundColor: '#4CAF50',
  },
  agreeText: {
    fontSize: 14,
    color: '#555',
  },
  termsLink: {
    color: '#007aff',
    textDecorationLine: 'underline',
  },
  validationContainer: {
    marginBottom: 10,
  },
  validationText: {
    color: '#d67b32',
    fontSize: 13,
    marginBottom: 2,
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
});
