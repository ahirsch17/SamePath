import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { userDataService } from '../services/UserDataService';
import { courseDataService } from '../services/CourseDataService';

interface GroupMembership {
  [groupId: string]: string[]; // groupId -> array of vtEmails
}

export default function NetworkScreen() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userCRNs, setUserCRNs] = useState<string[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [groupMembership, setGroupMembership] = useState<GroupMembership>({});

  useEffect(() => {
    (async () => {
      const user = await userDataService.getCurrentUser();
      setCurrentUser(user);
      if (user) {
        const crns = await userDataService.getUserCRNs(user.vtEmail);
        setUserCRNs(crns);
        const courseObjs = await Promise.all(crns.map(crn => courseDataService.getCourseByCRN(crn)));
        setCourses(courseObjs.filter(Boolean));
      }
    })();
  }, []);

  // Simulate in-memory group membership (per session)
  const joinGroup = (groupId: string) => {
    if (!currentUser) return;
    setGroupMembership(prev => {
      const members = prev[groupId] || [];
      if (!members.includes(currentUser.vtEmail)) {
        return { ...prev, [groupId]: [...members, currentUser.vtEmail] };
      }
      return prev;
    });
  };
  const leaveGroup = (groupId: string) => {
    if (!currentUser) return;
    setGroupMembership(prev => {
      const members = prev[groupId] || [];
      return { ...prev, [groupId]: members.filter(vtEmail => vtEmail !== currentUser.vtEmail) };
    });
  };

  // Get all users for a group
  const getUsersForGroup = (groupId: string) => {
    const members = groupMembership[groupId] || [];
    return userDataService.getAllUsersSync().filter(u => members.includes(u.vtEmail));
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Network Groups</Text>
      {courses.map(course => {
        const classGroupId = `${course.subject}-${course.courseNumber}`;
        const crnGroupId = `${course.subject}-${course.courseNumber}-${course.crn}`;
        return (
          <View key={crnGroupId} style={styles.courseBlock}>
            <Text style={styles.courseTitle}>{course.subject} {course.courseNumber}: {course.courseName}</Text>
            {/* CRN group */}
            <View style={styles.groupBlock}>
              <Text style={styles.groupLabel}>Section Group (CRN {course.crn})</Text>
              <View style={styles.membersRow}>
                {getUsersForGroup(crnGroupId).map(u => (
                  <Text key={u.vtEmail} style={styles.memberName}>{u.name}</Text>
                ))}
              </View>
              {groupMembership[crnGroupId]?.includes(currentUser?.vtEmail) ? (
                <TouchableOpacity style={styles.leaveBtn} onPress={() => leaveGroup(crnGroupId)}>
                  <Text style={styles.leaveBtnText}>Leave</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.joinBtn} onPress={() => joinGroup(crnGroupId)}>
                  <Text style={styles.joinBtnText}>Join</Text>
                </TouchableOpacity>
              )}
            </View>
            {/* Class group */}
            <View style={styles.groupBlock}>
              <Text style={styles.groupLabel}>Class Group ({course.subject} {course.courseNumber})</Text>
              <View style={styles.membersRow}>
                {getUsersForGroup(classGroupId).map(u => (
                  <Text key={u.vtEmail} style={styles.memberName}>{u.name}</Text>
                ))}
              </View>
              {groupMembership[classGroupId]?.includes(currentUser?.vtEmail) ? (
                <TouchableOpacity style={styles.leaveBtn} onPress={() => leaveGroup(classGroupId)}>
                  <Text style={styles.leaveBtnText}>Leave</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.joinBtn} onPress={() => joinGroup(classGroupId)}>
                  <Text style={styles.joinBtnText}>Join</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, color: '#d67b32' },
  courseBlock: { marginBottom: 28, padding: 16, backgroundColor: '#f8f9fa', borderRadius: 12, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 2, shadowOffset: { width: 0, height: 1 } },
  courseTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, color: '#333' },
  groupBlock: { marginBottom: 12, padding: 12, backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#eee' },
  groupLabel: { fontSize: 14, fontWeight: '600', marginBottom: 6, color: '#d67b32' },
  membersRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 },
  memberName: { backgroundColor: '#e3e3e3', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2, marginRight: 6, marginBottom: 4, fontSize: 13 },
  joinBtn: { backgroundColor: '#d67b32', borderRadius: 6, paddingVertical: 6, paddingHorizontal: 18, alignSelf: 'flex-start' },
  joinBtnText: { color: '#fff', fontWeight: 'bold' },
  leaveBtn: { backgroundColor: '#fff', borderRadius: 6, paddingVertical: 6, paddingHorizontal: 18, borderWidth: 1, borderColor: '#d67b32', alignSelf: 'flex-start' },
  leaveBtnText: { color: '#d67b32', fontWeight: 'bold' },
});

// Add getAllUsersSync to UserDataService for synchronous access 