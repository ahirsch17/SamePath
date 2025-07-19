import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  StatusBar,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ApiService from '../services/ApiService';

export default function SamePathScreen() {
  const navigation = useNavigation();
  const [schedule, setSchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchedule = async () => {
      setLoading(true);
      const user_id = await AsyncStorage.getItem('user_id');
      if (!user_id) {
        Alert.alert('Error', 'User not logged in.');
        setLoading(false);
        return;
      }
      try {
        const response = await ApiService.getSchedule(Number(user_id));
        setSchedule(response.data.schedule || []);
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch schedule.');
      }
      setLoading(false);
    };
    fetchSchedule();
  }, []);

  const getNextClass = () => {
    if (!schedule.length) return null;
    // Assume schedule is sorted by time, or sort if needed
    // For demo, just return the first class
    return schedule[0];
  };

  const nextClass = getNextClass();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }} />
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => navigation.navigate('Network' as never)}
        >
          <Ionicons name="people-outline" size={24} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => navigation.navigate('Preferences' as never)}
        >
          <Ionicons name="settings-outline" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <View style={{ alignItems: 'center', justifyContent: 'center', paddingTop: 20 }}>
          <Image source={require('../assets/icon.png')} style={{ width: 100, height: 100, marginBottom: 20 }} />

          {/* Next Class Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Next Class</Text>
            {loading ? (
              <Text>Loading...</Text>
            ) : nextClass ? (
              <View style={styles.nextClassCard}>
                <Text style={styles.nextClassTitle}>{nextClass.courseName || nextClass.title}</Text>
                <Text style={styles.nextClassTime}>{nextClass.time} • {nextClass.days}</Text>
                <Text style={styles.nextClassLocation}>{nextClass.location}</Text>
                {/* Add friends in class if available */}
              </View>
            ) : (
              <View style={styles.noClassCard}>
                <Text style={styles.noClassText}>No more classes today!</Text>
                <Text style={styles.noClassSubtext}>You have free time! Explore campus or connect with friends.</Text>
              </View>
            )}
          </View>

          {/* Suggested Activities */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Suggested Activities</Text>
            <View style={styles.activityCard}>
              <Ionicons name="fitness-outline" size={24} color="#d67b32" />
              <Text style={styles.activityText}>Hit the gym at McComas Hall</Text>
            </View>
            <View style={styles.activityCard}>
              <Ionicons name="library-outline" size={24} color="#d67b32" />
              <Text style={styles.activityText}>Study at Newman Library</Text>
            </View>
            <View style={styles.activityCard}>
              <Ionicons name="restaurant-outline" size={24} color="#d67b32" />
              <Text style={styles.activityText}>Grab lunch at D2 Dining Hall</Text>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => navigation.navigate('Schedule' as never)}
              >
                <Ionicons name="calendar-outline" size={24} color="#fff" />
                <Text style={styles.actionButtonText}>View Schedule</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => navigation.navigate('FreeTime' as never)}
              >
                <Ionicons name="time-outline" size={24} color="#fff" />
                <Text style={styles.actionButtonText}>Free Time</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
  },
  headerButton: {
    padding: 8,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 30,
    width: '100%',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
    marginBottom: 15,
  },
  nextClassCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#d67b32',
  },
  nextClassTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
    marginBottom: 8,
  },
  nextClassTime: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  nextClassLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  friendsText: {
    fontSize: 12,
    color: '#d67b32',
    fontStyle: 'italic',
  },
  noClassCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  noClassText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
    marginBottom: 8,
  },
  noClassSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  activityText: {
    fontSize: 14,
    color: '#222',
    marginLeft: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#d67b32',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginTop: 8,
  },
}); 