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
  Modal,
} from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ApiService from '../services/ApiService';

export default function ScheduleScreen() {
  const navigation = useNavigation();
  const [schedule, setSchedule] = useState<any[]>([]);
  const [clubEvents, setClubEvents] = useState<any[]>([]); // TODO: Replace with real API data if available
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [showFriendModal, setShowFriendModal] = useState(false);

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
        // Handle the new API response format
        if (response.data && response.data.schedule) {
          setSchedule(response.data.schedule || []);
        } else if (response.data && Array.isArray(response.data)) {
          setSchedule(response.data);
        } else {
          setSchedule([]);
        }
        // TODO: Fetch club/events from API if available
      } catch (error) {
        console.log('Error fetching schedule:', error);
        Alert.alert('Error', 'Failed to fetch schedule.');
      }
      setLoading(false);
    };
    fetchSchedule();
  }, []);

  const openCRNLookup = () => {
    navigation.navigate('CRNLookup' as never);
  };

  const showFriendSections = (course: any) => {
    setSelectedCourse(course);
    setShowFriendModal(true);
  };

  const renderScheduleItem = (item: any) => (
    <View key={item.crn || item.CRN || item.id} style={styles.scheduleItem}>
      <View style={styles.itemHeader}>
        <View style={[styles.typeBadge, styles.classBadge]}>
          <Text style={styles.typeText}>CLASS</Text>
        </View>
        <TouchableOpacity 
          style={styles.friendButton}
          onPress={() => showFriendSections(item)}
        >
          <Ionicons name="people" size={16} color="#007AFF" />
        </TouchableOpacity>
      </View>
      <Text style={styles.itemTitle}>
        {item.courseName || item.name || item.title || 'Course'}
      </Text>
      <Text style={styles.courseCode}>
        {item.subject || item.department} {item.courseNumber || item.number} • {item.credits || 'N/A'} credits • CRN: {item.crn || item.CRN}
      </Text>
      <View style={styles.itemDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={14} color="#666" />
          <Text style={styles.detailText}>{item.time || 'TBD'}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={14} color="#666" />
          <Text style={styles.detailText}>{item.days || item.day || 'TBD'}</Text>
        </View>
        {(item.location || item.room) && (
          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={14} color="#666" />
            <Text style={styles.detailText}>{item.location || item.room}</Text>
          </View>
        )}
        {item.instructor && (
          <View style={styles.detailRow}>
            <Ionicons name="person-outline" size={14} color="#666" />
            <Text style={styles.detailText}>{item.instructor}</Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ width: 24 }} />
        <Text style={styles.headerTitle}>Regularly Scheduled Events</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Content */}
      <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Classes</Text>
        {loading ? (
          <Text>Loading...</Text>
        ) : schedule.length > 0 ? (
          schedule.map(item => renderScheduleItem(item))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="school-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No classes scheduled</Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>Clubs & Events</Text>
        {clubEvents.length > 0 ? (
          clubEvents.map(item => renderScheduleItem(item))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No clubs or events</Text>
          </View>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={[styles.addButton, { backgroundColor: '#007AFF' }]} onPress={openCRNLookup}>
            <Ionicons name="search" size={24} color="#fff" />
            <Text style={styles.addButtonText}>Lookup Course by CRN</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Friend Sections Modal */}
      <Modal
        visible={showFriendModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFriendModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
                          <Text style={styles.modalTitle}>
              {selectedCourse?.subject || selectedCourse?.department} {selectedCourse?.courseNumber || selectedCourse?.number} - Friends
            </Text>
              <TouchableOpacity onPress={() => setShowFriendModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              {/* TODO: Populate with real friends data from API if available */}
              <View style={styles.emptyModalState}>
                <Ionicons name="people-outline" size={48} color="#ccc" />
                <Text style={styles.emptyModalText}>No friends in this course</Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
    marginBottom: 15,
    marginTop: 20,
  },
  scheduleItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#d67b32',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  classBadge: {
    backgroundColor: '#e3f2fd',
  },
  clubBadge: {
    backgroundColor: '#f3e5f5',
  },
  freeTimeBadge: {
    backgroundColor: '#e8f5e8',
  },
  typeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#333',
  },
  friendButton: {
    padding: 8,
    backgroundColor: '#f0f8ff',
    borderRadius: 20,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
    marginBottom: 8,
  },
  courseCode: {
    fontSize: 12,
    color: '#888',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  itemDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  friendsSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  friendGroup: {
    marginBottom: 12,
  },
  friendLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
    fontWeight: '600',
  },
  friendAvatars: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  friendAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  friendInitial: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    marginTop: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
    fontWeight: '500',
  },
  samepathIcon: {
    width: 48,
    height: 48,
    marginBottom: 8,
  },
  buttonContainer: {
    gap: 12,
    marginTop: 20,
    marginBottom: 30,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#d67b32',
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  footerItem: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  activeFooterItem: {
    backgroundColor: '#f8f9fa',
  },
  footerText: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
    fontWeight: '500',
  },
  activeFooterText: {
    color: '#d67b32',
    fontWeight: '600',
  },
  footerIcon: {
    width: 28,
    height: 28,
    opacity: 0.6,
  },
  activeFooterIcon: {
    opacity: 1,
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
  modalSection: {
    marginBottom: 24,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  friendName: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
    fontWeight: '500',
  },
  emptyModalState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyModalText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
    fontWeight: '500',
  },
  centerFooterItem: {
    marginTop: -18,
    zIndex: 2,
  },
  centerFooterIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
    borderColor: '#fff',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
});
