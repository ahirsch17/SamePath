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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { userDataService } from '../services/UserDataService';
import { courseDataService } from '../services/CourseDataService';

interface NetworkScreenNavigationProp {
  navigate: (screen: string) => void;
  goBack: () => void;
}

interface ClassGroup {
  crn: string;
  subject: string;
  courseNumber: string;
  courseName: string;
  memberCount: number;
  isJoined: boolean;
}

export default function NetworkScreen() {
  const navigation = useNavigation<NetworkScreenNavigationProp>();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [classGroups, setClassGroups] = useState<ClassGroup[]>([]);

  useEffect(() => {
    loadClassGroups();
  }, []);

  const loadClassGroups = async () => {
    const user = await userDataService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      
      // Get all available courses and create groups
      const allCourses = await courseDataService.getAllCourses();
      const userCRNs = userDataService.getUserCRNs(user.vtEmail);
      
      const groups: ClassGroup[] = allCourses.map((course: any) => ({
        crn: course.crn,
        subject: course.subject,
        courseNumber: course.courseNumber,
        courseName: course.courseName,
        memberCount: Math.floor(Math.random() * 15) + 1, // Random member count for demo
        isJoined: userCRNs.includes(course.crn)
      }));
      
      setClassGroups(groups);
    }
  };

  const toggleGroupMembership = (crn: string) => {
    setClassGroups(prev => 
      prev.map(group => 
        group.crn === crn 
          ? { ...group, isJoined: !group.isJoined, memberCount: group.isJoined ? group.memberCount - 1 : group.memberCount + 1 }
          : group
      )
    );
    
    // In a real app, you'd update the backend here
    Alert.alert(
      'Group Updated', 
      `You ${classGroups.find(g => g.crn === crn)?.isJoined ? 'left' : 'joined'} the group!`
    );
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
        <Text style={styles.headerTitle}>Network</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Content */}
      <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Available Class Groups</Text>
        
        {classGroups.map((group) => (
          <View key={group.crn} style={styles.groupCard}>
            <View style={styles.groupInfo}>
              <Text style={styles.courseCode}>{group.subject} {group.courseNumber}</Text>
              <Text style={styles.courseName}>{group.courseName}</Text>
              <Text style={styles.crnText}>CRN: {group.crn}</Text>
              <View style={styles.memberInfo}>
                <Ionicons name="people-outline" size={16} color="#666" />
                <Text style={styles.memberCount}>{group.memberCount} members</Text>
              </View>
            </View>
            
            <TouchableOpacity
              style={[
                styles.joinButton,
                group.isJoined ? styles.leaveButton : styles.joinButton
              ]}
              onPress={() => toggleGroupMembership(group.crn)}
            >
              <Text style={[
                styles.joinButtonText,
                group.isJoined ? styles.leaveButtonText : styles.joinButtonText
              ]}>
                {group.isJoined ? 'Leave' : 'Join'}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
        
        {classGroups.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No class groups available</Text>
          </View>
        )}
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
    marginBottom: 15,
    marginTop: 20,
  },
  groupCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#d67b32',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  groupInfo: {
    flex: 1,
  },
  courseCode: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
    marginBottom: 4,
  },
  courseName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  crnText: {
    fontSize: 12,
    color: '#888',
    marginBottom: 8,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberCount: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  joinButton: {
    backgroundColor: '#d67b32',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  leaveButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#d67b32',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  joinButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  leaveButtonText: {
    color: '#d67b32',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#ccc',
    marginTop: 16,
  },
}); 