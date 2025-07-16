<<<<<<< HEAD
import { userDataService, Course as UserCourse } from './UserDataService';

=======
>>>>>>> 0be5101354353b476f2562f6b92527ca7904d7f9
export interface CourseInfo {
  crn: string;
  subject: string;
  courseNumber: string;
  courseName: string;
  credits: number;
  time: string;
  days: string;
  location: string;
  instructor: string;
<<<<<<< HEAD
  campus?: string;
  term?: string;
  scheduleType?: string;
  modality?: string;
  capacity?: number;
  beginTime?: string;
  endTime?: string;
=======
  campus: string;
  term: string;
  scheduleType: string;
  modality: string;
  capacity: number;
  beginTime: string;
  endTime: string;
>>>>>>> 0be5101354353b476f2562f6b92527ca7904d7f9
  examCode?: string;
}

export interface CourseMatch {
  course: CourseInfo;
  friendsInSameSection: string[];
  friendsInOtherSections: string[];
}

export interface CourseCRNMapping {
  subject: string;
  courseNumber: string;
  courseName: string;
  crns: string[];
  lastUpdated: number;
}

class CourseDataService {
<<<<<<< HEAD
  private courses: CourseInfo[] = [];

  constructor() {
    // Populate courses from UserDataService's in-memory courses
    this.courses = userDataService['courses'].map((c: UserCourse) => ({
      ...c,
      campus: 'Blacksburg',
      term: 'Fall 2025',
      scheduleType: 'L',
      modality: 'Face-to-Face Instruction',
      capacity: 30,
      beginTime: '',
      endTime: '',
    }));
  }

  async getCourseByCRN(crn: string): Promise<CourseInfo | null> {
    return this.courses.find(course => course.crn === crn) || null;
  }

  async searchCourses(subject: string, courseNumber?: string): Promise<CourseInfo[]> {
    return this.courses.filter(course => {
      const subjectMatch = course.subject.toLowerCase().includes(subject.toLowerCase());
      const numberMatch = !courseNumber || course.courseNumber.includes(courseNumber);
      return subjectMatch && numberMatch;
    });
  }

  async getCoursesBySubject(subject: string): Promise<CourseInfo[]> {
    return this.courses.filter(course => course.subject.toLowerCase() === subject.toLowerCase());
  }

  isValidCRN(crn: string): boolean {
    return /^\d{5}$/.test(crn);
  }
}

=======
  // Cache for course data - in production this would be a database table
  private courseCache: Map<string, CourseInfo> = new Map();
  
  // Course to CRN mappings - in production this would be a database table
  private courseCRNMappings: Map<string, CourseCRNMapping> = new Map();
  
  // User course data cache - in production this would be a database table
  private userCourseData: Map<string, {
    courses: CourseInfo[];
    lastUpdated: number;
    friendsInCourses: Map<string, string[]>; // courseKey -> friend names
  }> = new Map();

  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  // No hardcoded course data - everything fetched from VT website
  private fallbackCourses: CourseInfo[] = [];

  // Get course information by CRN (cached)
  async getCourseByCRN(crn: string): Promise<CourseInfo | null> {
    // Check cache first
    if (this.courseCache.has(crn)) {
      return this.courseCache.get(crn)!;
    }

    // Try to fetch from VT website
    const vtCourse = await this.fetchCourseDataFromVT(crn);
    if (vtCourse) {
      this.courseCache.set(crn, vtCourse);
      return vtCourse;
    }

    // Fallback to sample data
    const fallbackCourse = this.fallbackCourses.find(course => course.crn === crn);
    if (fallbackCourse) {
      this.courseCache.set(crn, fallbackCourse);
      return fallbackCourse;
    }

    // Return better default course info for unknown CRNs
    const defaultCourse: CourseInfo = {
      crn,
      subject: "COURSE",
      courseNumber: crn.substring(0, 4),
      courseName: `Course ${crn} - Information Pending`,
      credits: 3,
      time: "TBD",
      days: "TBD",
      location: "TBD",
      instructor: "TBD",
      campus: "Blacksburg",
      term: "Fall 2025",
      scheduleType: "L",
      modality: "Face-to-Face Instruction",
      capacity: 0,
      beginTime: "TBD",
      endTime: "TBD"
    };

    this.courseCache.set(crn, defaultCourse);
    return defaultCourse;
  }

  // Fetch course data from Virginia Tech website
  private async fetchCourseDataFromVT(crn: string): Promise<CourseInfo | null> {
    try {
      // Import VTDataFetchService dynamically to avoid circular dependencies
      const { vtDataFetchService } = await import('./VTDataFetchService');
      
      console.log(`Fetching course data for CRN: ${crn} from VT website...`);
      
      // Use the VT data fetch service
      const courseData = await vtDataFetchService.fetchCourseByCRN(crn);
      
      if (courseData && courseData.subject !== 'UNKNOWN') {
        return courseData;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching course data from VT:', error);
      return null;
    }
  }

  // Get user's course data with friend matches (EFFICIENT VERSION)
  async getUserCourseData(userEmail: string, userCRNs: string[], matchList: string[]): Promise<{
    courses: CourseInfo[];
    friendsInCourses: Map<string, string[]>;
  }> {
    // Check if we have cached data for this user
    const userData = this.userCourseData.get(userEmail);
    const currentTime = Date.now();
    
    if (userData && (currentTime - userData.lastUpdated) < this.CACHE_DURATION) {
      console.log(`Using cached course data for ${userEmail}`);
      return {
        courses: userData.courses,
        friendsInCourses: userData.friendsInCourses
      };
    }

    console.log(`Fetching fresh course data for ${userEmail}`);
    
    // Get course data for user's CRNs
    const courses: CourseInfo[] = [];
    for (const crn of userCRNs) {
      if (crn) {
        const course = await this.getCourseByCRN(crn);
        if (course) {
          courses.push(course);
        }
      }
    }

    // Find friends in same courses (OPTIMIZED - use efficient friend lookup)
    const friendsInCourses = new Map<string, string[]>();
    
    if (matchList.length > 0) {
      // Import UserDataService to get optimized friend data
      const { userDataService } = await import('./UserDataService');
      const friends = await userDataService.getFriendsForUser(userEmail);
      
      for (const course of courses) {
        const courseKey = `${course.subject}-${course.courseNumber}`;
        const friendsInThisCourse: string[] = [];
        
        // Get all CRNs for this course
        const allCRNsForCourse = await this.getAllCRNsForCourse(course.subject, course.courseNumber);
        
        // Check friends for this course
        for (const friend of friends) {
          if (friend.crns.some(crn => allCRNsForCourse.includes(crn))) {
            friendsInThisCourse.push(friend.name);
          }
        }
        
        if (friendsInThisCourse.length > 0) {
          friendsInCourses.set(courseKey, friendsInThisCourse);
        }
      }
    }

    // Cache the results
    this.userCourseData.set(userEmail, {
      courses,
      lastUpdated: currentTime,
      friendsInCourses
    });

    return {
      courses,
      friendsInCourses
    };
  }

  // Get all CRNs for a specific course (cached)
  async getAllCRNsForCourse(subject: string, courseNumber: string): Promise<string[]> {
    const courseKey = `${subject}-${courseNumber}`;
    
    // Check cache first
    if (this.courseCRNMappings.has(courseKey)) {
      const mapping = this.courseCRNMappings.get(courseKey)!;
      if ((Date.now() - mapping.lastUpdated) < this.CACHE_DURATION) {
        return mapping.crns;
      }
    }

    // Fetch from VT website and cache
    const crns = await this.fetchAllCRNsForCourse(subject, courseNumber);
    
    this.courseCRNMappings.set(courseKey, {
      subject,
      courseNumber,
      courseName: '', // Will be filled when we get the first CRN
      crns,
      lastUpdated: Date.now()
    });

    return crns;
  }

  // Fetch all CRNs for a course from VT website
  private async fetchAllCRNsForCourse(subject: string, courseNumber: string): Promise<string[]> {
    try {
      // Import VTDataFetchService dynamically
      const { vtDataFetchService } = await import('./VTDataFetchService');
      
      console.log(`Fetching all CRNs for ${subject} ${courseNumber} from VT website...`);
      
      // Use the VT data fetch service
      const crns = await vtDataFetchService.fetchAllCRNsForCourse(subject, courseNumber);
      
      if (crns.length > 0) {
        return crns;
      }
      
      // Fallback to sample data if VT website fails
      const sampleCRNs: { [key: string]: string[] } = {
        'CS-3114': ['83534', '83535', '83536'],
        'CS-2114': ['12479', '12480', '12481'],
        'MATH-1225': ['56433', '56434', '56435'],
        'ENGL-1106': ['23453', '23454', '23455']
      };
      
      const key = `${subject}-${courseNumber}`;
      return sampleCRNs[key] || [];
      
    } catch (error) {
      console.error('Error fetching CRNs for course:', error);
      return [];
    }
  }

  // Clear user cache when schedule changes
  async clearUserCache(userEmail: string): Promise<void> {
    this.userCourseData.delete(userEmail);
    console.log(`Cleared cache for user: ${userEmail}`);
  }

  // Clear all caches (useful for testing or when data becomes stale)
  clearAllCaches(): void {
    this.courseCache.clear();
    this.courseCRNMappings.clear();
    this.userCourseData.clear();
    console.log('Cleared all caches');
  }

  // Get cache statistics
  getCacheStats(): { 
    courseCacheSize: number; 
    courseCRNMappingsSize: number;
    userCourseDataSize: number;
  } {
    return {
      courseCacheSize: this.courseCache.size,
      courseCRNMappingsSize: this.courseCRNMappings.size,
      userCourseDataSize: this.userCourseData.size
    };
  }

  // Search courses by subject and course number
  async searchCourses(subject: string, courseNumber?: string): Promise<CourseInfo[]> {
    try {
      // Import VTDataFetchService dynamically to avoid circular dependencies
      const { vtDataFetchService } = await import('./VTDataFetchService');
      
      // Try to get real data from VT website first
      const vtCourses = await vtDataFetchService.searchCoursesBySubject(subject);
      
      if (vtCourses.length > 0) {
        // Filter by course number if specified
        if (courseNumber) {
          return vtCourses.filter(course => 
            course.courseNumber.includes(courseNumber)
          );
        }
        return vtCourses;
      }
      
      // Fallback to sample data
      return this.fallbackCourses.filter(course => {
        const subjectMatch = course.subject.toLowerCase().includes(subject.toLowerCase());
        const numberMatch = !courseNumber || course.courseNumber.includes(courseNumber);
        return subjectMatch && numberMatch;
      });
    } catch (error) {
      console.error('Error searching courses:', error);
      
      // Fallback to sample data on error
      return this.fallbackCourses.filter(course => {
        const subjectMatch = course.subject.toLowerCase().includes(subject.toLowerCase());
        const numberMatch = !courseNumber || course.courseNumber.includes(courseNumber);
        return subjectMatch && numberMatch;
      });
    }
  }

  // Get all courses for a subject
  async getCoursesBySubject(subject: string): Promise<CourseInfo[]> {
    try {
      // Import VTDataFetchService dynamically to avoid circular dependencies
      const { vtDataFetchService } = await import('./VTDataFetchService');
      
      // Try to get real data from VT website first
      const vtCourses = await vtDataFetchService.searchCoursesBySubject(subject);
      
      if (vtCourses.length > 0) {
        return vtCourses;
      }
      
      // Fallback to sample data
      return this.fallbackCourses.filter(course => 
        course.subject.toLowerCase() === subject.toLowerCase()
      );
    } catch (error) {
      console.error('Error getting courses by subject:', error);
      
      // Fallback to sample data on error
      return this.fallbackCourses.filter(course => 
        course.subject.toLowerCase() === subject.toLowerCase()
      );
    }
  }

  // Validate CRN format (VT CRNs are typically 5 digits)
  isValidCRN(crn: string): boolean {
    return /^\d{5}$/.test(crn);
  }

  // Get course schedule for a specific day
  getCoursesForDay(courses: CourseInfo[], day: string): CourseInfo[] {
    const dayMap: { [key: string]: string } = {
      'Monday': 'M',
      'Tuesday': 'T',
      'Wednesday': 'W',
      'Thursday': 'Th',
      'Friday': 'F'
    };
    
    const dayCode = dayMap[day];
    return courses.filter(course => course.days.includes(dayCode));
  }
}

// Export singleton instance
>>>>>>> 0be5101354353b476f2562f6b92527ca7904d7f9
export const courseDataService = new CourseDataService(); 