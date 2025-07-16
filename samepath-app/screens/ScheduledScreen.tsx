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
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { userDataService } from '../services/UserDataService';
import { courseDataService, CourseInfo, CourseMatch } from '../services/CourseDataService';
import { Modal as RNModal } from 'react-native';

interface ScheduleScreenNavigationProp {
  navigate: (screen: string) => void;
  goBack: () => void;
}

interface ClassSchedule {
  crn: string;
  courseName: string;
  time: string;
  days: string;
  location: string;
  subject: string;
  courseNumber: string;
  credits: number;
  instructor: string;
  friendsInSameSection: string[];
  friendsInOtherSections: string[];
}

interface ClubEvent {
  id: string;
  name: string;
  time: string;
  days: string;
  location?: string;
  type: 'club' | 'event';
  description?: string;
}

export default function ScheduleScreen() {
  const navigation = useNavigation<ScheduleScreenNavigationProp>();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [schedule, setSchedule] = useState<ClassSchedule[]>([]);
  const [clubEvents, setClubEvents] = useState<ClubEvent[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<ClassSchedule | null>(null);
  const [showFriendModal, setShowFriendModal] = useState(false);

  useEffect(() => {
    loadUserSchedule();
  }, []);

  const loadUserSchedule = async () => {
    const user = await userDataService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      
      // Get user's CRNs from the new in-memory mapping
      const crns = userDataService.getUserCRNs(user.vtEmail);
      
      // Use efficient course data service (only checks matchlist, not all users)
      const { courses, friendsInCourses } = await courseDataService.getUserCourseData(
        user.vtEmail,
        crns,
        user.matchList || []
      );
      
      // Convert to ClassSchedule format
      const classSchedule: ClassSchedule[] = courses.map(course => {
        const courseKey = `${course.subject}-${course.courseNumber}`;
        const friendsInThisCourse = friendsInCourses.get(courseKey) || [];
        
        return {
          crn: course.crn,
          courseName: course.courseName,
          time: course.time,
          days: course.days,
          location: course.location,
          subject: course.subject,
          courseNumber: course.courseNumber,
          credits: course.credits,
          instructor: course.instructor,
          friendsInSameSection: friendsInThisCourse, // All friends in this course (same or different sections)
          friendsInOtherSections: [] // We'll handle this differently if needed
        };
      });
      
      setSchedule(classSchedule);
      
      // Sample free time activities
      // setFreeTime([
      //   {
      //     id: '1',
      //     activity: 'Gym',
      //     time: '2:00 PM - 3:30 PM',
      //     days: 'M W F',
      //     location: 'McComas Hall'
      //   },
      //   {
      //     id: '2',
      //     activity: 'Study',
      //     time: '4:00 PM - 6:00 PM',
      //     days: 'T TH',
      //     location: 'Newman Library'
      //   },
      //   {
      //     id: '3',
      //     activity: 'Lunch',
      //     time: '12:00 PM - 1:00 PM',
      //     days: 'M T W TH F',
      //     location: 'D2 Dining Hall'
      //   }
      // ]);
    }
  };

  const addFreeTime = () => {
    Alert.alert('Add Free Time', 'Free time management coming soon!');
  };

  const addClubEvent = () => {
    setShowAddModal(true);
  };

  const openCRNLookup = () => {
    navigation.navigate('CRNLookup');
  };

  const showFriendSections = (course: ClassSchedule) => {
    setSelectedCourse(course);
    setShowFriendModal(true);
  };

  const formatDays = (days: string): string => {
    // Convert VT format to readable format
    return days
      .replace('TTh', 'T TH')
      .replace('MWF', 'M W F')
      .replace('MW', 'M W')
      .replace('TTh', 'T TH')
      .replace('TR', 'T R')
      .replace('MTWThF', 'M T W TH F')
      .replace('MTWTh', 'M T W TH')
      .replace('TThF', 'T TH F')
      .replace('MWTh', 'M W TH')
      .replace('MTTh', 'M T TH')
      .replace('WF', 'W F')
      .replace('MF', 'M F')
      .replace('TF', 'T F')
      .replace('ThF', 'TH F')
      .replace('MTh', 'M TH')
      .replace('WTh', 'W TH');
  };

  const renderScheduleItem = (item: ClassSchedule | ClubEvent, type: 'class' | 'clubEvent') => (
    <View key={type === 'class' ? (item as ClassSchedule).crn : (item as ClubEvent).id} style={styles.scheduleItem}>
      <View style={styles.itemHeader}>
        <View style={[styles.typeBadge, 
          type === 'class' ? styles.classBadge : 
          type === 'clubEvent' ? styles.clubBadge : styles.freeTimeBadge
        ]}>
          <Text style={styles.typeText}>
            {type === 'class' ? 'CLASS' : type === 'clubEvent' ? 'CLUB' : 'FREE TIME'}
          </Text>
        </View>
        {type === 'class' && (
          <TouchableOpacity 
            style={styles.friendButton}
            onPress={() => showFriendSections(item as ClassSchedule)}
          >
            <Ionicons name="people" size={16} color="#007AFF" />
          </TouchableOpacity>
        )}
      </View>
      
      <Text style={styles.itemTitle}>
        {type === 'class' ? (item as ClassSchedule).courseName : 
         (item as ClubEvent).name}
      </Text>
      
      {type === 'class' && (
        <Text style={styles.courseCode}>
          {(item as ClassSchedule).subject} {(item as ClassSchedule).courseNumber} • {(item as ClassSchedule).credits} credits • CRN: {(item as ClassSchedule).crn}
        </Text>
      )}
      
      <View style={styles.itemDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={14} color="#666" />
          <Text style={styles.detailText}>{item.time}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={14} color="#666" />
          <Text style={styles.detailText}>{formatDays(item.days)}</Text>
        </View>
        
        {item.location && (
          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={14} color="#666" />
            <Text style={styles.detailText}>{item.location}</Text>
          </View>
        )}
        
        {type === 'class' && (item as ClassSchedule).instructor && (
          <View style={styles.detailRow}>
            <Ionicons name="person-outline" size={14} color="#666" />
            <Text style={styles.detailText}>{(item as ClassSchedule).instructor}</Text>
          </View>
        )}
      </View>
      
      {/* Friend matches for classes */}
      {type === 'class' && ((item as ClassSchedule).friendsInSameSection.length > 0 || (item as ClassSchedule).friendsInOtherSections.length > 0) && (
        <View style={styles.friendsSection}>
          {(item as ClassSchedule).friendsInSameSection.length > 0 && (
            <View style={styles.friendGroup}>
              <Text style={styles.friendLabel}>Same Section:</Text>
              <View style={styles.friendAvatars}>
                {(item as ClassSchedule).friendsInSameSection.map((friend, index) => (
                  <View key={index} style={styles.friendAvatar}>
                    <Text style={styles.friendInitial}>{friend.charAt(0)}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
          
          {(item as ClassSchedule).friendsInOtherSections.length > 0 && (
            <View style={styles.friendGroup}>
              <Text style={styles.friendLabel}>Other Sections:</Text>
              <View style={styles.friendAvatars}>
                {(item as ClassSchedule).friendsInOtherSections.map((friend, index) => (
                  <View key={index} style={styles.friendAvatar}>
                    <Text style={styles.friendInitial}>{friend.charAt(0)}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );

  const renderContent = () => {
    return (
      <>
        <Text style={styles.sectionTitle}>Classes</Text>
        {schedule.length > 0 ? (
          schedule.map(item => renderScheduleItem(item, 'class'))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="school-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No classes scheduled</Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>Clubs & Events</Text>
        {clubEvents.length > 0 ? (
          clubEvents.map(item => renderScheduleItem(item, 'clubEvent'))
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

          <TouchableOpacity style={[styles.addButton, { backgroundColor: '#28a745' }]} onPress={addClubEvent}>
            <Ionicons name="add" size={24} color="#fff" />
            <Text style={styles.addButtonText}>Add Club/Event</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  };

  const getHeaderTitle = () => {
    return 'Regularly Scheduled Events';
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ width: 24 }} />
        <Text style={styles.headerTitle}>{getHeaderTitle()}</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Content */}
      <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {renderContent()}
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
                {selectedCourse?.subject} {selectedCourse?.courseNumber} - Friends
              </Text>
              <TouchableOpacity onPress={() => setShowFriendModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              {selectedCourse && selectedCourse.friendsInSameSection.length > 0 && (
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Same Section (CRN: {selectedCourse.crn})</Text>
                  {selectedCourse.friendsInSameSection.map((friend, index) => (
                    <View key={index} style={styles.friendItem}>
                      <View style={styles.friendAvatar}>
                        <Text style={styles.friendInitial}>{friend.charAt(0)}</Text>
                      </View>
                      <Text style={styles.friendName}>{friend}</Text>
                    </View>
                  ))}
                </View>
              )}
              
              {selectedCourse && selectedCourse.friendsInOtherSections.length > 0 && (
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Other Sections</Text>
                  {selectedCourse.friendsInOtherSections.map((friend, index) => (
                    <View key={index} style={styles.friendItem}>
                      <View style={styles.friendAvatar}>
                        <Text style={styles.friendInitial}>{friend.charAt(0)}</Text>
                      </View>
                      <Text style={styles.friendName}>{friend}</Text>
                    </View>
                  ))}
                </View>
              )}
              
              {(!selectedCourse?.friendsInSameSection.length && !selectedCourse?.friendsInOtherSections.length) && (
                <View style={styles.emptyModalState}>
                  <Ionicons name="people-outline" size={48} color="#ccc" />
                  <Text style={styles.emptyModalText}>No friends in this course</Text>
                </View>
              )}
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
