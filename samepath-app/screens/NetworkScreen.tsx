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
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ApiService from '../services/ApiService';

export default function NetworkScreen() {
  const navigation = useNavigation();
  const [classGroups, setClassGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGroups = async () => {
      setLoading(true);
      const user_id = await AsyncStorage.getItem('user_id');
      if (!user_id) {
        Alert.alert('Error', 'User not logged in.');
        setLoading(false);
        return;
      }
      try {
        const response = await ApiService.getClassGroups(Number(user_id));
        // Response format: {class_groups: [{department, number, groups: [{group_id, name, ...}]}]}
        const classGroupsList = response.data?.class_groups || [];
        const flattened: any[] = [];
        for (const classGroup of classGroupsList) {
          for (const group of (classGroup.groups || [])) {
            flattened.push({
              group_id: group.group_id,
              name: group.name,
              department: classGroup.department,
              course_number: classGroup.number,
              courseName: classGroup.display_name || `${classGroup.department} ${classGroup.number}`,
              member_count: group.member_count || 0,
              is_member: group.is_member || false,
              type: group.type
            });
          }
        }
        setClassGroups(flattened);
      } catch (error) {
        console.log('Error fetching class groups:', error);
        Alert.alert('Error', 'Failed to fetch class groups.');
        setClassGroups([]);
      }
      setLoading(false);
    };
    fetchGroups();
  }, []);

  const toggleGroupMembership = async (groupId: number, isMember: boolean) => {
    const user_id = await AsyncStorage.getItem('user_id');
    if (!user_id) {
      Alert.alert('Error', 'User not logged in.');
      return;
    }
    try {
      if (isMember) {
        await ApiService.leaveGroup(Number(user_id), groupId);
        Alert.alert('Success', 'Left group successfully.');
      } else {
        await ApiService.joinGroup(Number(user_id), groupId);
        Alert.alert('Success', 'Joined group successfully.');
      }
      // Refresh groups
      const user_id2 = await AsyncStorage.getItem('user_id');
      if (user_id2) {
        const response = await ApiService.getClassGroups(Number(user_id2));
        const classGroupsList = response.data?.class_groups || [];
        const flattened: any[] = [];
        for (const classGroup of classGroupsList) {
          for (const group of (classGroup.groups || [])) {
            flattened.push({
              group_id: group.group_id,
              name: group.name,
              department: classGroup.department,
              course_number: classGroup.number,
              courseName: classGroup.display_name || `${classGroup.department} ${classGroup.number}`,
              member_count: group.member_count || 0,
              is_member: group.is_member || false,
              type: group.type
            });
          }
        }
        setClassGroups(flattened);
      }
    } catch (error: any) {
      console.log('Toggle group membership error:', error);
      const msg = error.response?.data?.error || 'Failed to update group membership.';
      Alert.alert('Error', msg);
    }
  };

  const navigateToFriends = () => {
    navigation.navigate('Friends' as never);
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
        {/* Friends Section */}
        <View style={styles.friendsSection}>
          <Text style={styles.sectionTitle}>Friends</Text>
          <TouchableOpacity style={styles.friendsCard} onPress={navigateToFriends}>
            <View style={styles.friendsCardContent}>
              <Ionicons name="people" size={24} color="#d67b32" />
              <View style={styles.friendsCardText}>
                <Text style={styles.friendsCardTitle}>Manage Friends</Text>
                <Text style={styles.friendsCardSubtitle}>Send requests, accept friends, and more</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.friendsCard} onPress={() => navigation.navigate('ContactMatch' as never)}>
            <View style={styles.friendsCardContent}>
              <Ionicons name="people-circle" size={24} color="#2196F3" />
              <View style={styles.friendsCardText}>
                <Text style={styles.friendsCardTitle}>Find Friends</Text>
                <Text style={styles.friendsCardSubtitle}>Connect with contacts from your school</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </View>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Class Groups</Text>
        {loading ? (
          <Text>Loading...</Text>
        ) : classGroups.map((group) => (
          <View key={group.group_id} style={styles.groupCard}>
            <View style={styles.groupInfo}>
              <Text style={styles.courseCode}>
                {group.department} {group.course_number}
              </Text>
              <Text style={styles.courseName}>
                {group.name || group.courseName || 'Group'}
              </Text>
              <Text style={styles.crnText}>Type: {group.type || 'Study Group'}</Text>
              <View style={styles.memberInfo}>
                <Ionicons name="people-outline" size={16} color="#666" />
                <Text style={styles.memberCount}>{group.member_count || 0} members</Text>
              </View>
            </View>
            <TouchableOpacity
              style={group.is_member ? styles.leaveButton : styles.joinButton}
              onPress={() => toggleGroupMembership(group.group_id, group.is_member)}
            >
              <Text style={group.is_member ? styles.leaveButtonText : styles.joinButtonText}>
                {group.is_member ? 'Leave' : 'Join'}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
        {classGroups.length === 0 && !loading && (
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
  friendsSection: {
    marginBottom: 30,
  },
  friendsCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#d67b32',
  },
  friendsCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  friendsCardText: {
    flex: 1,
    marginLeft: 12,
  },
  friendsCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
    marginBottom: 4,
  },
  friendsCardSubtitle: {
    fontSize: 14,
    color: '#666',
  },
}); 