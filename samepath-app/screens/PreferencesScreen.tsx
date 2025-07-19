import React, { useState } from 'react';
import { View, Text, Switch, StyleSheet, TouchableOpacity, Platform, StatusBar, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ApiService from '../services/ApiService';

interface PreferencesScreenNavigationProp {
  navigate: (screen: string) => void;
  goBack: () => void;
}

export default function PreferencesScreen() {
  const navigation = useNavigation<PreferencesScreenNavigationProp>();
  const [shareSchedule, setShareSchedule] = useState(true);
  const [shareFreeTime, setShareFreeTime] = useState(true);
  const [showActivityPrefs, setShowActivityPrefs] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  // Example handler for saving preferences
  const handleToggle = async (setter: (v: boolean) => void, value: boolean, key: string) => {
    setter(value);
    // TODO: Save preference to backend
    // const user_id = await AsyncStorage.getItem('user_id');
    // await ApiService.savePreference(user_id, key, value);
    Alert.alert('Preference Updated', `Preference '${key}' set to ${value}`);
  };

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
        <Text style={styles.headerTitle}>Preferences</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Content */}
      <View style={styles.contentContainer}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy</Text>
          
          <View style={styles.prefRow}>
            <View style={styles.prefInfo}>
              <Text style={styles.prefLabel}>Share my schedule with friends</Text>
              <Text style={styles.prefDescription}>Allow others to see your class schedule</Text>
            </View>
            <Switch 
              value={shareSchedule} 
              onValueChange={v => handleToggle(setShareSchedule, v, 'shareSchedule')}
              trackColor={{ false: '#e0e0e0', true: '#d67b32' }}
              thumbColor={shareSchedule ? '#fff' : '#f4f3f4'}
            />
          </View>

          <View style={styles.prefRow}>
            <View style={styles.prefInfo}>
              <Text style={styles.prefLabel}>Allow others to see my free time</Text>
              <Text style={styles.prefDescription}>Show when you're available to hang out</Text>
            </View>
            <Switch 
              value={shareFreeTime} 
              onValueChange={v => handleToggle(setShareFreeTime, v, 'shareFreeTime')}
              trackColor={{ false: '#e0e0e0', true: '#d67b32' }}
              thumbColor={shareFreeTime ? '#fff' : '#f4f3f4'}
            />
          </View>

          <View style={styles.prefRow}>
            <View style={styles.prefInfo}>
              <Text style={styles.prefLabel}>Show my activity preferences</Text>
              <Text style={styles.prefDescription}>Display your preferred activities</Text>
            </View>
            <Switch 
              value={showActivityPrefs} 
              onValueChange={v => handleToggle(setShowActivityPrefs, v, 'showActivityPrefs')}
              trackColor={{ false: '#e0e0e0', true: '#d67b32' }}
              thumbColor={showActivityPrefs ? '#fff' : '#f4f3f4'}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          
          <View style={styles.prefRow}>
            <View style={styles.prefInfo}>
              <Text style={styles.prefLabel}>Push notifications</Text>
              <Text style={styles.prefDescription}>Get notified about new matches and events</Text>
            </View>
            <Switch 
              value={notifications} 
              onValueChange={v => handleToggle(setNotifications, v, 'notifications')}
              trackColor={{ false: '#e0e0e0', true: '#d67b32' }}
              thumbColor={notifications ? '#fff' : '#f4f3f4'}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          
          <View style={styles.prefRow}>
            <View style={styles.prefInfo}>
              <Text style={styles.prefLabel}>Dark mode</Text>
              <Text style={styles.prefDescription}>Switch to dark theme</Text>
            </View>
            <Switch 
              value={darkMode} 
              onValueChange={v => handleToggle(setDarkMode, v, 'darkMode')}
              trackColor={{ false: '#e0e0e0', true: '#d67b32' }}
              thumbColor={darkMode ? '#fff' : '#f4f3f4'}
            />
          </View>
        </View>
      </View>
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
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
    marginBottom: 15,
    marginTop: 20,
  },
  prefRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  prefInfo: {
    flex: 1,
    marginRight: 16,
  },
  prefLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#222',
    marginBottom: 4,
  },
  prefDescription: {
    fontSize: 14,
    color: '#666',
  },
}); 