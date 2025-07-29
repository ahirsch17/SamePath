import React, { useState, useEffect } from 'react';
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
  Modal,
  ScrollView,
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
  const [phoneNumber, setPhoneNumber] = useState('');
  const [school, setSchool] = useState('');
  const [password, setPassword] = useState('');
  const [schools, setSchools] = useState<Array<{display_name: string, internal_name: string}>>([]);
  const [showSchoolPicker, setShowSchoolPicker] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const isPhoneValid = () => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phoneNumber.replace(/\s/g, ''));
  };

  const isPasswordValid = () =>
    password.length >= 8 && /[A-Z]/.test(password) && /[^A-Za-z0-9]/.test(password);

  const isFormValid = () =>
    firstName.length > 0 && lastName.length > 0 && email.length > 0 && phoneNumber.length > 0 && school.length > 0 && isPasswordValid() && isPhoneValid() && agreed;

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const response = await ApiService.schools();
        if (response.data && response.data.schools) {
          setSchools(response.data.schools);
        }
      } catch (error) {
        console.log('Error fetching schools:', error);
      }
    };
    fetchSchools();
  }, []);

  const handleSubmit = async () => {
    if (!isFormValid()) {
      return;
    }
    try {
      const response = await ApiService.signup(firstName, lastName, email, password, phoneNumber, school);
      console.log('Signup response:', JSON.stringify(response.data, null, 2));
      console.log('Response status:', response.status);
      
      // Check if signup was successful based on the new API response format
      if (response.data && response.data.success) {
        // Store user_id and email
        if (response.data.user_id) {
          await AsyncStorage.setItem('user_id', String(response.data.user_id));
          console.log('Signup successful, stored user_id:', response.data.user_id);
        }
        await AsyncStorage.setItem('user_email', email.trim());
        console.log('Signup successful, stored email:', email.trim());
        // Navigate to contact matching instead of main app
        navigation.navigate('ContactMatch' as never);
      } else {
        // Handle signup failure
        const errorMessage = response.data?.error_message || response.data?.error || 'Please check your info and try again.';
        Alert.alert('Signup failed', errorMessage);
      }
    } catch (error: any) {
      let errorMessage = 'Something went wrong. Please try again.';
      if (error.response && error.response.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.error_message) {
          errorMessage = error.response.data.error_message;
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

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <Image source={logo} style={styles.logo} resizeMode="contain" />

        <Text style={styles.subtext}>
          Enter your info and choose a secure password.
        </Text>

        {/* Name Row */}
        <View style={styles.nameRow}>
          <View style={styles.nameField}>
            <Text style={styles.label}>First Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Alexis"
              value={firstName}
              onChangeText={setFirstName}
              autoCapitalize="words"
            />
          </View>
          <View style={styles.nameField}>
            <Text style={styles.label}>Last Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Hirsch"
              value={lastName}
              onChangeText={setLastName}
              autoCapitalize="words"
            />
          </View>
        </View>

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., alexishirsch@vt.edu"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., +1 (555) 123-4567"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>School</Text>
        <TouchableOpacity
          style={styles.input}
          onPress={() => setShowSchoolPicker(true)}
        >
          <Text style={[styles.inputText, !school && styles.placeholderText]}>
            {school || "Select your school"}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#666" style={styles.chevron} />
        </TouchableOpacity>

        <Text style={styles.label}>Choose a Password</Text>
        <TextInput
          style={styles.input}
          secureTextEntry
          placeholder="length > 8, include capital letter and special character"
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
          {phoneNumber.length === 0 && (
            <Text style={styles.validationText}>❌ Please enter your phone number</Text>
          )}
          {phoneNumber.length > 0 && !isPhoneValid() && (
            <Text style={styles.validationText}>
              ❌ Please enter a valid phone number
            </Text>
          )}
          {school.length === 0 && (
            <Text style={styles.validationText}>❌ Please select your school</Text>
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
      </ScrollView>

      {/* School Picker Modal */}
      <Modal
        visible={showSchoolPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSchoolPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Your School</Text>
              <TouchableOpacity onPress={() => setShowSchoolPicker(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              {schools.map((schoolData, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.schoolItem}
                  onPress={() => {
                    setSchool(schoolData.display_name);
                    setShowSchoolPicker(false);
                  }}
                >
                  <Text style={styles.schoolName}>{schoolData.display_name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 60,
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flex: 1,
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
  inputText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  placeholderText: {
    color: '#999',
  },
  chevron: {
    position: 'absolute',
    right: 10,
    top: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
  },
  modalBody: {
    padding: 20,
  },
  schoolItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  schoolName: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  nameField: {
    width: '48%',
  },
});
