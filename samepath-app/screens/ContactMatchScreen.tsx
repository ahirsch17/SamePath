import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  StatusBar,
  Alert,
  Image,
  PermissionsAndroid,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Note: expo-contacts needs to be installed: npx expo install expo-contacts
import * as Contacts from 'expo-contacts';
import * as ApiService from '../services/ApiService';

interface ContactMatch {
  id: string;
  name: string;
  email: string;
  phone?: string;
  matched: boolean;
  school?: string;
  courses?: string[];
  avatar?: string;
}

export default function ContactMatchScreen() {
  const navigation = useNavigation();
  const [contacts, setContacts] = useState<ContactMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    requestContactsPermission();
  }, []);

  const requestContactsPermission = async () => {
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status === 'granted') {
        setPermissionGranted(true);
        loadContacts();
      } else {
        Alert.alert(
          'Permission Required',
          'We need access to your contacts to find friends from your school.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Try Again', onPress: () => requestContactsPermission() }
          ]
        );
      }
    } catch (error) {
      console.log('Error requesting contacts permission:', error);
      Alert.alert('Error', 'Failed to request contacts permission.');
    }
  };

  const loadContacts = async () => {
    setLoading(true);
    try {
      // Get real contacts from device
      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.Emails, Contacts.Fields.PhoneNumbers, Contacts.Fields.Name],
      });

      if (data.length > 0) {
        // Process contacts and check for matches in school database
        const processedContacts = await processContactsForMatches(data);
        setContacts(processedContacts);
      } else {
        setContacts([]);
      }
    } catch (error) {
      console.log('Error loading contacts:', error);
      Alert.alert('Error', 'Failed to load contacts.');
    }
    setLoading(false);
  };

  const processContactsForMatches = async (contacts: any[]): Promise<ContactMatch[]> => {
    const processedContacts: ContactMatch[] = [];
    
    for (const contact of contacts) {
      if (contact.emails && contact.emails.length > 0) {
        const email = contact.emails[0].email;
        const phone = contact.phoneNumbers && contact.phoneNumbers.length > 0 
          ? contact.phoneNumbers[0].number 
          : undefined;
        
        // Check if this contact exists in our school database
        // For now, we'll simulate this check
        // In a real app, you'd make an API call to check if the email exists
        const isMatched = await checkIfContactExistsInSchool(email, phone);
        
        processedContacts.push({
          id: contact.id || Math.random().toString(),
          name: contact.name || 'Unknown',
          email: email,
          phone: phone,
          matched: isMatched,
          school: isMatched ? 'Virginia Tech' : undefined, // You'd get this from your API
          courses: isMatched ? ['Sample Course'] : [], // You'd get this from your API
          avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 10)}`
        });
      }
    }
    
    return processedContacts;
  };

  const checkIfContactExistsInSchool = async (email: string, phone?: string): Promise<boolean> => {
    // For now, we'll simulate this check
    // In a real app, you'd make an API call to your backend to check if the email/phone exists
    // and return user details if found
    
    // Simulate checking against your school database
    // You can modify this logic to match specific emails/phones for testing
    const testEmails = ['test@vt.edu', 'friend@vt.edu']; // Add test emails here
    const testPhones = ['+1234567890', '+1987654321']; // Add test phone numbers here
    
    return testEmails.includes(email) || (phone ? testPhones.includes(phone) : false);
  };

  const sendFriendRequest = async (contact: ContactMatch) => {
    const user_id = await AsyncStorage.getItem('user_id');
    if (!user_id) {
      Alert.alert('Error', 'User not logged in.');
      return;
    }

    try {
      // For demo purposes, we'll use a placeholder user ID
      // In a real app, you'd get the actual user ID from your database
      const targetUserId = parseInt(contact.id) + 10; // Placeholder
      await ApiService.sendFriendRequest(Number(user_id), targetUserId);
      Alert.alert('Success', `Friend request sent to ${contact.name}!`);
    } catch (error: any) {
      console.log('Send friend request error:', error);
      let errorMessage = 'Failed to send friend request.';
      if (error.response && error.response.data) {
        if (error.response.data.error) {
          errorMessage = error.response.data.error;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      }
      Alert.alert('Error', errorMessage);
    }
  };

  const getMatchedContacts = () => contacts.filter(contact => contact.matched);
  const getUnmatchedContacts = () => contacts.filter(contact => !contact.matched);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Find Friends</Text>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={loadContacts}
        >
          <Ionicons name="refresh" size={24} color="#d67b32" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {!permissionGranted ? (
          <View style={styles.permissionContainer}>
            <Ionicons name="people-circle" size={64} color="#d67b32" />
            <Text style={styles.permissionTitle}>Connect with Friends</Text>
            <Text style={styles.permissionText}>
              We'll check your contacts to see if anyone from your school is already on SamePath.
            </Text>
            <TouchableOpacity
              style={styles.permissionButton}
              onPress={requestContactsPermission}
            >
              <Text style={styles.permissionButtonText}>Allow Access</Text>
            </TouchableOpacity>
          </View>
        ) : loading ? (
          <View style={styles.loadingContainer}>
            <Ionicons name="refresh" size={32} color="#d67b32" />
            <Text style={styles.loadingText}>Finding your friends...</Text>
          </View>
        ) : (
          <>
            {/* Matched Contacts */}
            {getMatchedContacts().length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                  {' '}Friends on SamePath ({getMatchedContacts().length})
                </Text>
                {getMatchedContacts().map((contact) => (
                  <View key={contact.id} style={styles.contactCard}>
                    <View style={styles.contactInfo}>
                      <View style={styles.avatarContainer}>
                        <Image 
                          source={{ uri: contact.avatar }} 
                          style={styles.avatar}
                        />
                        <View style={styles.matchedBadge}>
                          <Ionicons name="checkmark" size={12} color="#fff" />
                        </View>
                      </View>
                      <View style={styles.contactDetails}>
                        <Text style={styles.contactName}>{contact.name}</Text>
                        <Text style={styles.contactEmail}>{contact.email}</Text>
                        <Text style={styles.contactSchool}>{contact.school}</Text>
                        {contact.courses && contact.courses.length > 0 && (
                          <Text style={styles.contactCourses}>
                            Classes: {contact.courses.join(', ')}
                          </Text>
                        )}
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.addButton}
                      onPress={() => sendFriendRequest(contact)}
                    >
                      <Ionicons name="person-add" size={20} color="#fff" />
                      <Text style={styles.addButtonText}>Add Friend</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {/* Unmatched Contacts */}
            {getUnmatchedContacts().length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  <Ionicons name="people" size={20} color="#666" />
                  {' '}Other Contacts ({getUnmatchedContacts().length})
                </Text>
                <Text style={styles.sectionSubtitle}>
                  These contacts aren't on SamePath yet. Invite them to join!
                </Text>
                {getUnmatchedContacts().map((contact) => (
                  <View key={contact.id} style={styles.contactCard}>
                    <View style={styles.contactInfo}>
                      <View style={styles.avatarContainer}>
                        <Image 
                          source={{ uri: contact.avatar }} 
                          style={styles.avatar}
                        />
                      </View>
                      <View style={styles.contactDetails}>
                        <Text style={styles.contactName}>{contact.name}</Text>
                        <Text style={styles.contactEmail}>{contact.email}</Text>
                        <Text style={styles.notOnSamePath}>Not on SamePath</Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.inviteButton}
                      onPress={() => Alert.alert('Invite', `Invite ${contact.name} to join SamePath!`)}
                    >
                      <Ionicons name="mail" size={20} color="#d67b32" />
                      <Text style={styles.inviteButtonText}>Invite</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {contacts.length === 0 && (
              <View style={styles.emptyState}>
                <Ionicons name="people-outline" size={64} color="#ccc" />
                <Text style={styles.emptyTitle}>No Contacts Found</Text>
                <Text style={styles.emptyText}>
                  We couldn't find any contacts that match users in your school database.
                </Text>
              </View>
            )}

            {/* Continue to App Button */}
            <View style={styles.continueSection}>
              <TouchableOpacity
                style={styles.continueButton}
                onPress={() => navigation.reset({ index: 0, routes: [{ name: 'SamePath' as never }] })}
              >
                <Text style={styles.continueButtonText}>Continue to App</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 60,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
  },
  refreshButton: {
    padding: 8,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  permissionContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#222',
    marginTop: 20,
    marginBottom: 12,
  },
  permissionText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  permissionButton: {
    backgroundColor: '#d67b32',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  contactCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  contactInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  matchedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactDetails: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginBottom: 2,
  },
  contactEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  contactSchool: {
    fontSize: 12,
    color: '#d67b32',
    fontWeight: '500',
    marginBottom: 2,
  },
  contactCourses: {
    fontSize: 12,
    color: '#888',
  },
  notOnSamePath: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  inviteButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d67b32',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  inviteButtonText: {
    color: '#d67b32',
    fontWeight: '600',
    fontSize: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 24,
  },
  continueSection: {
    marginTop: 30,
    paddingHorizontal: 20,
  },
  continueButton: {
    backgroundColor: '#d67b32',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
}); 