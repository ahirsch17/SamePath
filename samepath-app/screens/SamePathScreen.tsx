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
  const [pendingRequests, setPendingRequests] = useState(0);

  useEffect(() => {
    const fetchSchedule = async () => {
      setLoading(true);
      let user_id = await AsyncStorage.getItem('user_id');
      
      // If no user_id, show error
      if (!user_id) {
        Alert.alert('Error', 'User not logged in properly. Please log in again.');
        setLoading(false);
        return;
      }
      
      try {
        const response = await ApiService.getSchedule(Number(user_id));
        // Handle the new API response format
        if (response.data && response.data.schedule) {
          setSchedule(response.data.schedule || []);
        } else if (response.data && Array.isArray(response.data)) {
          setSchedule(response.data);
        } else {
          setSchedule([]);
        }
      } catch (error) {
        console.log('Error fetching schedule:', error);
        Alert.alert('Error', 'Failed to fetch schedule.');
      }
      setLoading(false);
    };
    fetchSchedule();
  }, []);

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const user_id = await AsyncStorage.getItem('user_id');
        if (!user_id) return;
        const resp = await ApiService.getFriendsList(Number(user_id));
        const items = Array.isArray(resp.data?.friends) ? resp.data.friends : [];
        const count = items.filter((f: any) => f.status === 'pending_received').length;
        setPendingRequests(count);
      } catch (e) {
        // ignore badge errors
      }
    };
    fetchPending();
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
      {/* Modern Header with Gradient */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.logoContainer}>
            <Image source={require('../assets/SamePathLogo.png')} style={styles.logo} resizeMode="contain" />
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => navigation.navigate('Notifications' as never)}
            >
              <View style={styles.notificationContainer}>
                <Ionicons name="notifications" size={24} color="#fff" />
                {pendingRequests > 0 && (
                  <View style={styles.notificationBadge}>
                    <Text style={styles.notificationBadgeText}>
                      {pendingRequests > 9 ? '9+' : String(pendingRequests)}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => navigation.navigate('Network' as never)}
            >
              <Ionicons name="people" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => navigation.navigate('Preferences' as never)}
            >
              <Ionicons name="settings" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Welcome back!</Text>
          <Text style={styles.welcomeSubtext}>Ready to make the most of your day?</Text>
        </View>

        {/* Next Class Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="time" size={20} color="#6366f1" />
            <Text style={styles.sectionTitle}>Next Class</Text>
          </View>
          {loading ? (
            <View style={styles.loadingCard}>
              <Ionicons name="refresh" size={24} color="#6366f1" />
              <Text style={styles.loadingText}>Loading your schedule...</Text>
            </View>
          ) : nextClass ? (
            <View style={styles.nextClassCard}>
              <View style={styles.classHeader}>
                <View style={styles.classIcon}>
                  <Ionicons name="school" size={20} color="#fff" />
                </View>
                <View style={styles.classInfo}>
                  <Text style={styles.nextClassTitle}>
                    {nextClass.courseName || nextClass.name || nextClass.title || 'Course'}
                  </Text>
                  <Text style={styles.nextClassTime}>
                    {nextClass.time} • {nextClass.days || nextClass.day || 'TBD'}
                  </Text>
                </View>
              </View>
              <View style={styles.classLocation}>
                <Ionicons name="location" size={16} color="#6366f1" />
                <Text style={styles.nextClassLocation}>
                  {nextClass.location || nextClass.room || 'Location TBD'}
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.noClassCard}>
              <View style={styles.noClassIcon}>
                <Ionicons name="checkmark-circle" size={48} color="#10b981" />
              </View>
              <Text style={styles.noClassText}>No more classes today!</Text>
              <Text style={styles.noClassSubtext}>You have free time! Explore campus or connect with friends.</Text>
            </View>
          )}
        </View>

        {/* Quick Actions Grid */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="grid" size={20} color="#6366f1" />
            <Text style={styles.sectionTitle}>Quick Actions</Text>
          </View>
          <View style={styles.actionGrid}>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => navigation.navigate('Schedule' as never)}
            >
              <View style={styles.actionIcon}>
                <Ionicons name="calendar" size={28} color="#6366f1" />
              </View>
              <Text style={styles.actionTitle}>Schedule</Text>
              <Text style={styles.actionSubtitle}>View your classes</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => navigation.navigate('FreeTime' as never)}
            >
              <View style={styles.actionIcon}>
                <Ionicons name="time" size={28} color="#f59e0b" />
              </View>
              <Text style={styles.actionTitle}>Free Time</Text>
              <Text style={styles.actionSubtitle}>Find activities</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => navigation.navigate('CRNLookup' as never)}
            >
              <View style={styles.actionIcon}>
                <Ionicons name="search" size={28} color="#ef4444" />
              </View>
              <Text style={styles.actionTitle}>Course Lookup</Text>
              <Text style={styles.actionSubtitle}>Find classes</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => navigation.navigate('Network' as never)}
            >
              <View style={styles.actionIcon}>
                <Ionicons name="people" size={28} color="#8b5cf6" />
              </View>
              <Text style={styles.actionTitle}>Network</Text>
              <Text style={styles.actionSubtitle}>Connect with friends</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Suggested Activities */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="bulb" size={20} color="#6366f1" />
            <Text style={styles.sectionTitle}>Suggested Activities</Text>
          </View>
          <View style={styles.activityList}>
            <TouchableOpacity style={styles.activityCard}>
              <View style={styles.activityIcon}>
                <Ionicons name="fitness" size={20} color="#fff" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Hit the gym</Text>
                <Text style={styles.activityLocation}>McComas Hall</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.activityCard}>
              <View style={styles.activityIcon}>
                <Ionicons name="library" size={20} color="#fff" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Study session</Text>
                <Text style={styles.activityLocation}>Newman Library</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.activityCard}>
              <View style={styles.activityIcon}>
                <Ionicons name="restaurant" size={20} color="#fff" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Grab lunch</Text>
                <Text style={styles.activityLocation}>D2 Dining Hall</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoContainer: {
    flex: 1,
  },
  logo: {
    width: 120,
    height: 40,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  welcomeSection: {
    marginBottom: 30,
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  welcomeSubtext: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginLeft: 8,
  },
  loadingCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 8,
  },
  nextClassCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  classHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  classIcon: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  classInfo: {
    flex: 1,
  },
  nextClassTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  nextClassTime: {
    fontSize: 14,
    color: '#64748b',
  },
  classLocation: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nextClassLocation: {
    fontSize: 14,
    color: '#6366f1',
    marginLeft: 4,
    fontWeight: '500',
  },
  noClassCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  noClassIcon: {
    marginBottom: 12,
  },
  noClassText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  noClassSubtext: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '48%',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  activityList: {
    gap: 12,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  activityLocation: {
    fontSize: 14,
    color: '#64748b',
  },
  notificationContainer: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -6,
    right: -8,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 3,
    borderRadius: 8,
    backgroundColor: '#FF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
}); 