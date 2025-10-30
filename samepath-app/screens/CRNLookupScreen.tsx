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
        // Handle the new API response format
        if (response.data && Array.isArray(response.data)) {
          setCourses(response.data);
        } else if (response.data && response.data.courses) {
          setCourses(response.data.courses);
        } else {
          setCourses([]);
        }
      } catch (error) {
        console.log('Error fetching courses:', error);
        Alert.alert('Error', 'Failed to fetch courses.');
      }
      setLoading(false);
    };
    fetchCourses();
  }, []);

  const filteredCourses = courses.filter(course => {
    const searchLower = search.toLowerCase();
    return (
      String(course.crn || course.CRN).includes(search) ||
      (course.courseName || course.name || '').toLowerCase().includes(searchLower) ||
      (course.subject || course.department || '').toLowerCase().includes(searchLower) ||
      (course.number || '').toString().includes(search)
    );
  });

  const handleRegister = async (crn: string | number) => {
    const user_id = await AsyncStorage.getItem('user_id');
    if (!user_id) {
      Alert.alert('Error', 'User not logged in.');
      return;
    }

    try {
      const response = await ApiService.registerCourses(Number(user_id), [Number(crn)]);
      console.log('Registration response:', response.data);
      Alert.alert('Success', `Successfully registered for CRN ${crn}!`);
    } catch (error: any) {
      console.log('Registration error:', error);
      let errorMessage = 'Failed to register for course.';
      if (error.response && error.response.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      }
      Alert.alert('Registration Failed', errorMessage);
    }
  };

  return (
    <View style={styles.container}>
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
            key={course.crn || course.CRN}
            style={styles.courseItem}
            onPress={() => handleRegister(course.crn || course.CRN)}
          >
            <Ionicons name="book-outline" size={24} color="#d67b32" style={{ marginRight: 12 }} />
            <View>
              <Text style={styles.courseTitle}>
                {course.subject || course.department} {course.courseNumber || course.number}: {course.courseName || course.name}
              </Text>
              <Text style={styles.courseDetails}>
                CRN: {course.crn || course.CRN} | {course.time} | {course.days || course.day}
              </Text>
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