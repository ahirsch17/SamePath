import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { courseDataService, CourseInfo } from '../services/CourseDataService';

interface CRNLookupScreenNavigationProp {
  navigate: (screen: string) => void;
  goBack: () => void;
}

export default function CRNLookupScreen() {
  const navigation = useNavigation<CRNLookupScreenNavigationProp>();
  const [searchType, setSearchType] = useState<'crn' | 'subject'>('crn');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CourseInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<CourseInfo | null>(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      Alert.alert('Error', 'Please enter a search term');
      return;
    }

    setIsLoading(true);
    setSearchResults([]);

    try {
      if (searchType === 'crn') {
        if (!courseDataService.isValidCRN(searchQuery)) {
          Alert.alert('Invalid CRN', 'Please enter a valid 5-digit CRN');
          setIsLoading(false);
          return;
        }

        const course = await courseDataService.getCourseByCRN(searchQuery);
        if (course) {
          setSearchResults([course]);
        } else {
          Alert.alert('Not Found', 'No course found with this CRN');
        }
      } else {
        const results = await courseDataService.searchCourses(searchQuery);
        setSearchResults(results);
        
        if (results.length === 0) {
          Alert.alert('No Results', 'No courses found matching your search');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to search courses. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCourseSelect = (course: CourseInfo) => {
    setSelectedCourse(course);
    Alert.alert(
      'Course Information',
      `${course.subject} ${course.courseNumber}: ${course.courseName}\n\nCRN: ${course.crn}\nTime: ${course.time}\nDays: ${course.days}\nLocation: ${course.location}\nInstructor: ${course.instructor}\nCredits: ${course.credits}`,
      [
        { text: 'Close', style: 'default' }
      ]
    );
  };

  const renderCourseItem = (course: CourseInfo) => (
    <TouchableOpacity
      key={course.crn}
      style={styles.courseItem}
      onPress={() => handleCourseSelect(course)}
    >
      <View style={styles.courseHeader}>
        <Text style={styles.courseTitle}>
          {course.subject} {course.courseNumber}: {course.courseName}
        </Text>
        <Text style={styles.crnText}>CRN: {course.crn}</Text>
      </View>
      
      <View style={styles.courseDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={14} color="#666" />
          <Text style={styles.detailText}>{course.time}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={14} color="#666" />
          <Text style={styles.detailText}>{course.days}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={14} color="#666" />
          <Text style={styles.detailText}>{course.location}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Ionicons name="person-outline" size={14} color="#666" />
          <Text style={styles.detailText}>{course.instructor}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Ionicons name="school-outline" size={14} color="#666" />
          <Text style={styles.detailText}>{course.credits} credits • {course.campus}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Ionicons name="layers-outline" size={14} color="#666" />
          <Text style={styles.detailText}>{course.scheduleType} • {course.modality}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Ionicons name="people-outline" size={14} color="#666" />
          <Text style={styles.detailText}>Capacity: {course.capacity} students</Text>
        </View>
        
        {course.examCode && (
          <View style={styles.detailRow}>
            <Ionicons name="document-text-outline" size={14} color="#666" />
            <Text style={styles.detailText}>Exam Code: {course.examCode}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Course Lookup</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search Type Toggle */}
        <View style={styles.searchTypeContainer}>
          <TouchableOpacity
            style={[styles.searchTypeButton, searchType === 'crn' && styles.activeSearchType]}
            onPress={() => setSearchType('crn')}
          >
            <Text style={[styles.searchTypeText, searchType === 'crn' && styles.activeSearchTypeText]}>
              Search by CRN
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.searchTypeButton, searchType === 'subject' && styles.activeSearchType]}
            onPress={() => setSearchType('subject')}
          >
            <Text style={[styles.searchTypeText, searchType === 'subject' && styles.activeSearchTypeText]}>
              Search by Subject
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search Input */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder={searchType === 'crn' ? 'Enter 5-digit CRN' : 'Enter subject (e.g., CS, MATH)'}
            value={searchQuery}
            onChangeText={setSearchQuery}
            keyboardType={searchType === 'crn' ? 'numeric' : 'default'}
            maxLength={searchType === 'crn' ? 5 : 50}
            autoCapitalize="characters"
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Ionicons name="search" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Loading State */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#d67b32" />
            <Text style={styles.loadingText}>Searching courses...</Text>
          </View>
        )}

        {/* Search Results */}
        {searchResults.length > 0 && !isLoading && (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>
              Found {searchResults.length} course{searchResults.length !== 1 ? 's' : ''}
            </Text>
            {searchResults.map(renderCourseItem)}
          </View>
        )}

        {/* Instructions */}
        {searchResults.length === 0 && !isLoading && (
          <View style={styles.instructionsContainer}>
            <Ionicons name="search-outline" size={48} color="#ccc" />
            <Text style={styles.instructionsTitle}>Search for Courses</Text>
            <Text style={styles.instructionsText}>
              {searchType === 'crn' 
                ? 'Enter a 5-digit CRN to find specific course sections'
                : 'Enter a subject code to browse available courses'
              }
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  searchTypeContainer: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 4,
    marginVertical: 20,
  },
  searchTypeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeSearchType: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchTypeText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeSearchTypeText: {
    color: '#d67b32',
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginRight: 12,
  },
  searchButton: {
    backgroundColor: '#d67b32',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  resultsContainer: {
    marginTop: 20,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginBottom: 16,
  },
  courseItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#d67b32',
  },
  courseHeader: {
    marginBottom: 12,
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginBottom: 4,
  },
  crnText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  courseDetails: {
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  instructionsContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
    marginTop: 16,
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
}); 