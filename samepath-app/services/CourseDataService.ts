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
  campus: string;
  term: string;
  scheduleType: string;
  modality: string;
  capacity: number;
  beginTime: string;
  endTime: string;
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

  // In-memory fallback course data
  private fallbackCourses: CourseInfo[] = [
    {
      crn: '83534', subject: 'CS', courseNumber: '3114', courseName: 'Data Structures', credits: 3, time: '9:00-9:50', days: 'M W F', location: 'McBryde 100', instructor: 'Dr. Smith', campus: 'Blacksburg', term: 'Fall 2025', scheduleType: 'L', modality: 'Face-to-Face Instruction', capacity: 30, beginTime: '', endTime: ''
    },
    {
      crn: '83484', subject: 'MATH', courseNumber: '1225', courseName: 'Calculus of a Single Variable', credits: 4, time: '10:00-10:50', days: 'M W F', location: 'Hahn 120', instructor: 'Dr. Jones', campus: 'Blacksburg', term: 'Fall 2025', scheduleType: 'L', modality: 'Face-to-Face Instruction', capacity: 30, beginTime: '', endTime: ''
    },
    {
      crn: '87290', subject: 'ENGL', courseNumber: '1106', courseName: 'First-Year Writing', credits: 3, time: '11:00-11:50', days: 'T TH', location: 'Shanks 180', instructor: 'Dr. Lee', campus: 'Blacksburg', term: 'Fall 2025', scheduleType: 'L', modality: 'Face-to-Face Instruction', capacity: 30, beginTime: '', endTime: ''
    },
    {
      crn: '83339', subject: 'CS', courseNumber: '2505', courseName: 'Intro to Comp Org', credits: 3, time: '2:00-2:50', days: 'M W F', location: 'Goodwin 195', instructor: 'Dr. Kim', campus: 'Blacksburg', term: 'Fall 2025', scheduleType: 'L', modality: 'Face-to-Face Instruction', capacity: 30, beginTime: '', endTime: ''
    },
    {
      crn: '12479', subject: 'CS', courseNumber: '2114', courseName: 'Software Design', credits: 3, time: '1:00-1:50', days: 'M W F', location: 'McBryde 200', instructor: 'Dr. Patel', campus: 'Blacksburg', term: 'Fall 2025', scheduleType: 'L', modality: 'Face-to-Face Instruction', capacity: 30, beginTime: '', endTime: ''
    },
    {
      crn: '44444', subject: 'MATH', courseNumber: '2204', courseName: 'Multivariable Calculus', credits: 3, time: '3:00-3:50', days: 'T TH', location: 'Hahn 130', instructor: 'Dr. White', campus: 'Blacksburg', term: 'Fall 2025', scheduleType: 'L', modality: 'Face-to-Face Instruction', capacity: 30, beginTime: '', endTime: ''
    },
    {
      crn: '33333', subject: 'PHYS', courseNumber: '2305', courseName: 'Physics I', credits: 4, time: '8:00-8:50', days: 'M W F', location: 'Randolph 210', instructor: 'Dr. Black', campus: 'Blacksburg', term: 'Fall 2025', scheduleType: 'L', modality: 'Face-to-Face Instruction', capacity: 30, beginTime: '', endTime: ''
    },
    {
      crn: '83351', subject: 'CS', courseNumber: '1944', courseName: 'Freshman Seminar', credits: 1, time: '4:00-4:50', days: 'F', location: 'McBryde 300', instructor: 'Dr. Green', campus: 'Blacksburg', term: 'Fall 2025', scheduleType: 'L', modality: 'Face-to-Face Instruction', capacity: 30, beginTime: '', endTime: ''
    },
    {
      crn: '83535', subject: 'CS', courseNumber: '3114', courseName: 'Data Structures', credits: 3, time: '9:00-9:50', days: 'M W F', location: 'McBryde 100', instructor: 'Dr. Smith', campus: 'Blacksburg', term: 'Fall 2025', scheduleType: 'L', modality: 'Face-to-Face Instruction', capacity: 30, beginTime: '', endTime: ''
    },
    {
      crn: '23452', subject: 'MATH', courseNumber: '2214', courseName: 'Intro to Differential Equations', credits: 3, time: '12:00-12:50', days: 'M W F', location: 'Hahn 140', instructor: 'Dr. Brown', campus: 'Blacksburg', term: 'Fall 2025', scheduleType: 'L', modality: 'Face-to-Face Instruction', capacity: 30, beginTime: '', endTime: ''
    },
    {
      crn: '91578', subject: 'STAT', courseNumber: '3604', courseName: 'Statistics for Engineers', credits: 3, time: '1:00-1:50', days: 'T TH', location: 'McBryde 210', instructor: 'Dr. Blue', campus: 'Blacksburg', term: 'Fall 2025', scheduleType: 'L', modality: 'Face-to-Face Instruction', capacity: 30, beginTime: '', endTime: ''
    },
    {
      crn: '22222', subject: 'ENGL', courseNumber: '1105', courseName: 'First-Year Writing', credits: 3, time: '11:00-11:50', days: 'T TH', location: 'Shanks 180', instructor: 'Dr. Lee', campus: 'Blacksburg', term: 'Fall 2025', scheduleType: 'L', modality: 'Face-to-Face Instruction', capacity: 30, beginTime: '', endTime: ''
    }
  ];

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

  // Public method to get all available courses
  async getAllCourses(): Promise<CourseInfo[]> {
    return this.fallbackCourses;
  }
}

// Export singleton instance
export const courseDataService = new CourseDataService(); 