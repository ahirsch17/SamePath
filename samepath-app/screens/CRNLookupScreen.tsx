import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ApiService from '../services/ApiService';

export default function CRNLookupScreen() {
  const [search, setSearch] = useState('');
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      const user_id = await AsyncStorage.getItem('user_id');
      if (!user_id) {
        Alert.alert('Error', 'User not logged in.');
        setLoading(false);
        return;
      }
      try {
        const response = await ApiService.getAvailableCourses(Number(user_id));
        setCourses(response.data.courses || []);
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch courses.');
      }
      setLoading(false);
    };
    fetchCourses();
  }, []);

  const filteredCourses = courses.filter(course =>
    course.crn.includes(search) ||
    course.courseName?.toLowerCase().includes(search.toLowerCase()) ||
    course.subject?.toLowerCase().includes(search.toLowerCase())
  );

  const handleRegister = async (crn: string) => {
    // TODO: Call ApiService.registerCourses to register this CRN for the user
    Alert.alert('Register', `Register for CRN ${crn} (API integration coming soon)`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>CRN Lookup</Text>
      <TextInput
        style={styles.input}
        placeholder="Search by CRN, course name, or subject"
        value={search}
        onChangeText={setSearch}
      />
      <ScrollView style={styles.resultsContainer}>
        {loading ? (
          <Text>Loading...</Text>
        ) : filteredCourses.length === 0 ? (
          <Text style={styles.emptyText}>No courses found.</Text>
        ) : filteredCourses.map(course => (
          <TouchableOpacity
            key={course.crn}
            style={styles.courseItem}
            onPress={() => handleRegister(course.crn)}
          >
            <Ionicons name="book-outline" size={24} color="#d67b32" style={{ marginRight: 12 }} />
            <View>
              <Text style={styles.courseTitle}>{course.subject} {course.courseNumber}: {course.courseName}</Text>
              <Text style={styles.courseDetails}>CRN: {course.crn} | {course.time} | {course.days}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#d67b32',
  },
  input: {
    height: 45,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  resultsContainer: {
    flex: 1,
  },
  courseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
  },
  courseDetails: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  emptyText: {
    fontSize: 16,
    color: '#ccc',
    marginTop: 16,
    textAlign: 'center',
  },
}); 