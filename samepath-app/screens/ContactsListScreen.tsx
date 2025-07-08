import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { userDataService, Contact } from '../services/UserDataService';

export default function ContactsListScreen() {
  const navigation = useNavigation();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [search, setSearch] = useState('');

  // Load contacts from service
  React.useEffect(() => {
    const loadContacts = async () => {
      const loadedContacts = await userDataService.getContacts();
      setContacts(loadedContacts);
    };
    loadContacts();
  }, []);

  const toggleSelection = (index: number, type: 'yes' | 'no' | 'star') => {
    setContacts(prev => {
      return prev.map((contact, i) => {
        if (i !== index) return contact;

        if (type === 'yes') return { ...contact, selected: 'yes' };
        if (type === 'no') return { ...contact, selected: 'no', starred: false };
        if (type === 'star' && contact.selected === 'yes') {
          return { ...contact, starred: !contact.starred };
        }
        return contact;
      });
    });
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Header with back button and logo */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Contacts</Text>
        <View style={{ width: 24 }} />
      </View>

      <Image source={require('../assets/SamePathLogo.png')} style={styles.logo} resizeMode="contain" />

      <Text style={styles.description}>
        Choose which contacts you'd like to connect with on SamePath. Star your closest friends for priority matching.
      </Text>

      {/* Legend */}
      <View style={styles.legendContainer}>
        <View style={styles.legendRow}>
          <FontAwesome name="check-circle" size={16} color="#4B3F2F" />
          <Text style={styles.legendText}>Connect</Text>
          <FontAwesome name="circle-o" size={16} color="#4B3F2F" style={{ marginLeft: 20 }} />
          <Text style={styles.legendText}>Skip</Text>
          <FontAwesome name="star" size={16} color="#d67b32" style={{ marginLeft: 20 }} />
          <Text style={styles.legendText}>Star</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          placeholder="Search contacts..."
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Contacts List */}
      <FlatList
        data={filteredContacts}
        keyExtractor={(_, i) => i.toString()}
        style={styles.contactsList}
        renderItem={({ item, index }) => (
          <View style={styles.contactRow}>
            <Image
              source={require('../assets/avatar_placeholder.png')}
              style={styles.avatar}
            />
            <Text style={styles.contactName}>{item.name}</Text>

            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => toggleSelection(index, 'yes')}
              >
                <FontAwesome
                  name={item.selected === 'yes' ? 'check-circle' : 'circle-o'}
                  size={24}
                  color={item.selected === 'yes' ? '#4CAF50' : '#666'}
                />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => toggleSelection(index, 'no')}
              >
                <FontAwesome
                  name={item.selected === 'no' ? 'times-circle' : 'circle-o'}
                  size={24}
                  color={item.selected === 'no' ? '#f44336' : '#666'}
                />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => toggleSelection(index, 'star')}
              >
                <FontAwesome
                  name={item.starred ? 'star' : 'star-o'}
                  size={24}
                  color={item.starred ? '#d67b32' : '#666'}
                />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Continue Button */}
      <TouchableOpacity style={styles.continueButton}>
        <Text style={styles.continueButtonText}>Continue (2/2)</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 60,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
  },
  logo: {
    width: 200,
    height: 60,
    alignSelf: 'center',
    marginBottom: 15,
  },
  description: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    paddingHorizontal: 25,
    marginBottom: 20,
  },
  legendContainer: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginHorizontal: 20,
    marginBottom: 15,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  contactsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  contactName: {
    flex: 1,
    fontSize: 16,
    color: '#222',
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
  },
  continueButton: {
    backgroundColor: '#222e36',
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  continueButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
