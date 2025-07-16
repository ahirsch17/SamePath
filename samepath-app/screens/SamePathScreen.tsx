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
import { userDataService } from '../services/UserDataService';
import { courseDataService } from '../services/CourseDataService';

interface SamePathScreenNavigationProp {
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

export default function SamePathScreen() {
  const navigation = useNavigation<SamePathScreenNavigationProp>();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [schedule, setSchedule] = useState<ClassSchedule[]>([]);

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
          friendsInSameSection: friendsInThisCourse,
          friendsInOtherSections: []
        };
      });
      
      setSchedule(classSchedule);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ width: 24 }} />
        <View style={{ flex: 1 }} />
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => navigation.navigate('Network')}
        >
          <Ionicons name="people-outline" size={24} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => navigation.navigate('Preferences')}
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
            {(() => {
              const now = new Date();
              const nextClass = schedule
                .map(event => {
                  const match = event.time.match(/(\d{1,2}):(\d{2})/);
                  let startHour = 0;
                  if (match) startHour = parseInt(match[1], 10);
                  return { ...event, startHour };
                })
                .sort((a, b) => a.startHour - b.startHour)
                .find(event => {
                  const todayIdx = now.getDay();
                  const dayMap: Record<number, string> = { 0: 'S', 1: 'M', 2: 'T', 3: 'W', 4: 'TH', 5: 'F', 6: 'SA' };
                  const todayKey = dayMap[todayIdx];
                  return todayKey && event.days.includes(todayKey) && event.startHour > now.getHours();
                });

              if (nextClass) {
                return (
                  <View style={styles.nextClassCard}>
                    <Text style={styles.nextClassTitle}>{nextClass.courseName}</Text>
                    <Text style={styles.nextClassTime}>{nextClass.time} • {nextClass.days}</Text>
                    <Text style={styles.nextClassLocation}>{nextClass.location}</Text>
                    {nextClass.friendsInSameSection.length > 0 && (
                      <Text style={styles.friendsText}>
                        Friends in class: {nextClass.friendsInSameSection.join(', ')}
                      </Text>
                    )}
                  </View>
                );
              } else {
                return (
                  <View style={styles.noClassCard}>
                    <Text style={styles.noClassText}>No more classes today!</Text>
                    <Text style={styles.noClassSubtext}>You have free time! Explore campus or connect with friends.</Text>
                  </View>
                );
              }
            })()}
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
                onPress={() => navigation.navigate('Schedule')}
              >
                <Ionicons name="calendar-outline" size={24} color="#fff" />
                <Text style={styles.actionButtonText}>View Schedule</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => navigation.navigate('FreeTime')}
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