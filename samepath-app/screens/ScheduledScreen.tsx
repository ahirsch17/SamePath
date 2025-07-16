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

interface FreeTime {
  id: string;
  activity: string;
  time: string;
  days: string;
  location?: string;
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
  const [activeTab, setActiveTab] = useState<'schedule' | 'freeTime' | 'samepath' | 'network' | 'preferences'>('schedule');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [schedule, setSchedule] = useState<ClassSchedule[]>([]);
  const [freeTime, setFreeTime] = useState<FreeTime[]>([]);
  const [clubEvents, setClubEvents] = useState<ClubEvent[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<ClassSchedule | null>(null);
  const [showFriendModal, setShowFriendModal] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<{ day: number; hour: number } | null>(null);
  const [blockActivities, setBlockActivities] = useState<{ [key: string]: string[] }>({});

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
      setFreeTime([
        {
          id: '1',
          activity: 'Gym',
          time: '2:00 PM - 3:30 PM',
          days: 'M W F',
          location: 'McComas Hall'
        },
        {
          id: '2',
          activity: 'Study',
          time: '4:00 PM - 6:00 PM',
          days: 'T TH',
          location: 'Newman Library'
        },
        {
          id: '3',
          activity: 'Lunch',
          time: '12:00 PM - 1:00 PM',
          days: 'M T W TH F',
          location: 'D2 Dining Hall'
        }
      ]);
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

  const renderScheduleItem = (item: ClassSchedule | FreeTime | ClubEvent, type: 'class' | 'freeTime' | 'clubEvent') => (
    <View key={type === 'class' ? (item as ClassSchedule).crn : (item as FreeTime | ClubEvent).id} style={styles.scheduleItem}>
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
         type === 'freeTime' ? (item as FreeTime).activity : 
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
    switch (activeTab) {
      case 'schedule':
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
      case 'freeTime':
        return (
          <>
            <Text style={styles.sectionTitle}>Free Time</Text>
            {renderFreeTimeGrid()}
            {renderActivityModal()}
          </>
        );
      case 'samepath':
        // Home screen: show next event and suggestions
        const now = new Date();
        // Find next class
        const nextClass = schedule
          .map(event => {
            // Parse event time to get start hour
            const match = event.time.match(/(\d{1,2}):(\d{2})/);
            let startHour = 0;
            if (match) startHour = parseInt(match[1], 10);
            return { ...event, startHour };
          })
          .sort((a, b) => a.startHour - b.startHour)
          .find(event => {
            // Check if today and time is in the future
            const todayIdx = now.getDay();
            const dayMap: Record<number, string> = { 0: 'S', 1: 'M', 2: 'T', 3: 'W', 4: 'TH', 5: 'F', 6: 'SA' };
            const todayKey = dayMap[todayIdx];
            return todayKey && event.days.includes(todayKey) && event.startHour > now.getHours();
          });
        // Find friends free now
        const freeNow = freeTime.filter(f => {
          // Parse time and days
          const match = f.time.match(/(\d{1,2}):(\d{2})/);
          let startHour = 0;
          if (match) startHour = parseInt(match[1], 10);
          const todayIdx = now.getDay();
          const dayMap: Record<number, string> = { 0: 'S', 1: 'M', 2: 'T', 3: 'W', 4: 'TH', 5: 'F', 6: 'SA' };
          const todayKey = dayMap[todayIdx];
          return todayKey && f.days.includes(todayKey) && startHour <= now.getHours();
        });
        return (
          <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1, paddingTop: 40 }}>
            <Image source={require('../assets/icon.png')} style={{ width: 80, height: 80, marginBottom: 16 }} />
            {nextClass ? (
              <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>
                Next: {nextClass.courseName} in {nextClass.startHour - now.getHours()} hrs with {nextClass.friendsInSameSection.join(', ')}
              </Text>
            ) : (
              <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>
                No more classes today!
              </Text>
            )}
            {freeNow.length > 0 ? (
              <Text style={{ fontSize: 16, color: '#d67b32', marginTop: 12 }}>
                {freeNow[0].activity} is available now. Would you like to join?
              </Text>
            ) : (
              <Text style={{ fontSize: 16, color: '#888', marginTop: 12 }}>
                You have free time! Explore campus or connect with friends.
              </Text>
            )}
          </View>
        );
      case 'network':
        return (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>Network Features Coming Soon</Text>
          </View>
        );
      case 'preferences':
        return (
          <View style={styles.emptyState}>
            <Ionicons name="settings-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>Preferences Coming Soon</Text>
          </View>
        );
      default:
        return null;
    }
  };

  const getHeaderTitle = () => {
    switch (activeTab) {
      case 'schedule': return 'Regularly Scheduled Events';
      case 'freeTime': return 'Free Time';
      case 'samepath': return 'SamePath';
      case 'network': return 'Network';
      case 'preferences': return 'Preferences';
      default: return 'Schedule';
    }
  };

  // Add constants for days and hours
  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const HOURS = Array.from({ length: 18 }, (_, i) => 6 + i); // 6am to 11pm
  const ACTIVITIES = ['Gym', 'Rest/Nap', 'Eat', 'Study', 'Read', 'Religion', 'Social', 'Other'];

  // Calculate scheduled events as a set of (day, hour) pairs
  const scheduledBlocks = new Set<string>();
  schedule.forEach(event => {
    // Parse event.days and event.time to fill scheduledBlocks
    // For simplicity, assume event.days is like 'M W F' and event.time is '14:00-15:15'
    const dayMap: { [key: string]: number } = { S: 0, M: 1, T: 2, W: 3, TH: 4, F: 5, SA: 6 };
    const daysArr = event.days.split(' ').map(d => d.trim()).filter(Boolean);
    let startHour = 0, endHour = 0;
    if (event.time) {
      const match = event.time.match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/);
      if (match) {
        startHour = parseInt(match[1], 10);
        endHour = parseInt(match[3], 10);
      }
    }
    daysArr.forEach(dayStr => {
      let dayIdx = dayMap[dayStr] ?? -1;
      if (dayIdx >= 0) {
        for (let h = startHour; h < endHour; h++) {
          scheduledBlocks.add(getBlockKey(dayIdx, h));
        }
      }
    });
  });

  // Helper to get key for block
  const getBlockKey = (day: number, hour: number) => `${day}-${hour}`;

  // Render the weekly grid
  const renderFreeTimeGrid = () => (
    <View style={{ flexDirection: 'row', marginTop: 16 }}>
      {/* Days column */}
      <View style={{ width: 80 }}>
        {DAYS.map((day, i) => (
          <View key={day} style={{ height: 32, justifyContent: 'center' }}>
            <Text style={{ fontWeight: 'bold' }}>{day.slice(0, 3)}</Text>
          </View>
        ))}
      </View>
      {/* Hours grid */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          {/* Hour labels */}
          <View style={{ flexDirection: 'row' }}>
            {HOURS.map(hour => (
              <View key={hour} style={{ width: 40, alignItems: 'center' }}>
                <Text style={{ fontSize: 10 }}>{hour}:00</Text>
              </View>
            ))}
          </View>
          {/* Grid blocks */}
          {DAYS.map((_, dayIdx) => (
            <View key={dayIdx} style={{ flexDirection: 'row' }}>
              {HOURS.map(hour => {
                const blockKey = getBlockKey(dayIdx, hour);
                const isFree = !scheduledBlocks.has(blockKey);
                return (
                  <TouchableOpacity
                    key={blockKey}
                    style={{
                      width: 40,
                      height: 32,
                      margin: 1,
                      backgroundColor: isFree ? '#FFA500' : '#eee',
                      borderRadius: 4,
                      borderWidth: selectedBlock && selectedBlock.day === dayIdx && selectedBlock.hour === hour ? 2 : 0,
                      borderColor: '#d67b32',
                    }}
                    disabled={!isFree}
                    onPress={() => setSelectedBlock({ day: dayIdx, hour })}
                  />
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );

  // Modal for activity selection
  const renderActivityModal = () => {
    if (!selectedBlock) return null;
    const blockKey = getBlockKey(selectedBlock.day, selectedBlock.hour);
    const selectedActivities = blockActivities[blockKey] || ACTIVITIES;
    const toggleActivity = (activity: string) => {
      setBlockActivities(prev => {
        const current = prev[blockKey] || ACTIVITIES;
        const next = current.includes(activity)
          ? current.filter(a => a !== activity)
          : [...current, activity];
        return { ...prev, [blockKey]: next };
      });
    };
    return (
      <RNModal
        visible={!!selectedBlock}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedBlock(null)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 24, width: 300 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 12 }}>Select Activities</Text>
            {ACTIVITIES.map(activity => (
              <TouchableOpacity
                key={activity}
                style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}
                onPress={() => toggleActivity(activity)}
              >
                <View style={{
                  width: 20,
                  height: 20,
                  borderRadius: 4,
                  borderWidth: 1,
                  borderColor: '#d67b32',
                  backgroundColor: selectedActivities.includes(activity) ? '#d67b32' : '#fff',
                  marginRight: 8,
                }} />
                <Text>{activity}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={{ marginTop: 16, backgroundColor: '#d67b32', borderRadius: 6, padding: 10, alignItems: 'center' }}
              onPress={() => setSelectedBlock(null)}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </RNModal>
    );
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

      {/* Footer Navigation */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.footerItem, activeTab === 'schedule' && styles.activeFooterItem]}
          onPress={() => setActiveTab('schedule')}
        >
          <Ionicons 
            name="calendar-outline" 
            size={24} 
            color={activeTab === 'schedule' ? '#d67b32' : '#666'} 
          />
          <Text style={[styles.footerText, activeTab === 'schedule' && styles.activeFooterText]}>
            Schedule
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.footerItem, activeTab === 'freeTime' && styles.activeFooterItem]}
          onPress={() => setActiveTab('freeTime')}
        >
          <Ionicons 
            name="time-outline" 
            size={24} 
            color={activeTab === 'freeTime' ? '#d67b32' : '#666'} 
          />
          <Text style={[styles.footerText, activeTab === 'freeTime' && styles.activeFooterText]}>
            Free Time
          </Text>
        </TouchableOpacity>

        {/* Center SamePath Icon - larger, pops out, no label */}
        <TouchableOpacity 
          style={[styles.footerItem, styles.centerFooterItem, activeTab === 'samepath' && styles.activeFooterItem]}
          onPress={() => setActiveTab('samepath')}
        >
          <Image 
            source={require('../assets/icon.png')} 
            style={[styles.footerIcon, styles.centerFooterIcon, activeTab === 'samepath' && styles.activeFooterIcon]} 
          />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.footerItem, activeTab === 'network' && styles.activeFooterItem]}
          onPress={() => setActiveTab('network')}
        >
          <Ionicons 
            name="people-outline" 
            size={24} 
            color={activeTab === 'network' ? '#d67b32' : '#666'} 
          />
          <Text style={[styles.footerText, activeTab === 'network' && styles.activeFooterText]}>
            Network
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.footerItem, activeTab === 'preferences' && styles.activeFooterItem]}
          onPress={() => setActiveTab('preferences')}
        >
          <Ionicons 
            name="settings-outline" 
            size={24} 
            color={activeTab === 'preferences' ? '#d67b32' : '#666'} 
          />
          <Text style={[styles.footerText, activeTab === 'preferences' && styles.activeFooterText]}>
            Preferences
          </Text>
        </TouchableOpacity>
      </View>

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
