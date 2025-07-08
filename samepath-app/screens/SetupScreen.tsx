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

interface SetupScreenNavigationProp {
  navigate: (screen: string) => void;
  goBack: () => void;
}

export default function SetupScreen() {
  const navigation = useNavigation<SetupScreenNavigationProp>();
  const logo = require('../assets/SamePathLogo.png');

  const [vtCode, setVtCode] = useState('');
  const [vtEmail, setVtEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(false);

  const isPasswordValid = () =>
    password.length >= 8 && /[A-Z]/.test(password) && /[^A-Za-z0-9]/.test(password);

  const isFormValid = () =>
    vtCode.length > 0 && vtEmail.length > 0 && isPasswordValid() && agreed;

  const handleSubmit = async () => {
    if (!isFormValid()) {
      return;
    }

    // Verify code using the service
    const isValidCode = await userDataService.verifyCode(vtCode);
    if (!isValidCode) {
      Alert.alert('Invalid verification code.');
      return;
    }

    // Check if user already exists and is activated
    const isActivated = await userDataService.isUserActivated(vtEmail.trim());
    if (isActivated) {
      Alert.alert('Account already exists', 'This account has already been activated. Please use the returning user login.');
      return;
    }

    // Create or activate user
    const user = await userDataService.createUser(vtEmail.trim(), password);
    if (user) {
      await userDataService.activateUser(vtEmail.trim());
      navigation.navigate('Connections');
    } else {
      Alert.alert('Error creating account. Please try again.');
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
        Enter the code sent to your @vt.edu email and choose a secure password.
      </Text>

      <Text style={styles.label}>VT Email Verification Code</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., 123456"
        value={vtCode}
        onChangeText={setVtCode}
        keyboardType="number-pad"
      />

      <Text style={styles.label}>VT Email (PID)</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., alexishirsch"
        value={vtEmail}
        onChangeText={setVtEmail}
        autoCapitalize="none"
        autoCorrect={false}
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
            onPress={() => navigation.navigate('Terms')}
          >
            Terms of Use
          </Text>
        </Text>
      </View>

      {/* Validation messages */}
      {!isFormValid() && (
        <View style={styles.validationContainer}>
          {vtCode.length === 0 && (
            <Text style={styles.validationText}>❌ Please enter verification code</Text>
          )}
          {vtEmail.length === 0 && (
            <Text style={styles.validationText}>❌ Please enter VT email (PID)</Text>
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
      )}

      <TouchableOpacity
        style={[styles.button, !isFormValid() && styles.disabledButton]}
        onPress={handleSubmit}
        disabled={!isFormValid()}
      >
        <Text style={styles.buttonText}>Activate</Text>
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
    color: '#333',
  },
  termsLink: {
    color: '#007aff',
    textDecorationLine: 'underline',
  },
  button: {
    backgroundColor: '#d67b32',
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 15,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  validationContainer: {
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  validationText: {
    color: '#d32f2f',
    fontSize: 12,
    marginBottom: 5,
  },
});
