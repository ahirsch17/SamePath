import { userDataService, Course as UserCourse } from './UserDataService';

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
  campus?: string;
  term?: string;
  scheduleType?: string;
  modality?: string;
  capacity?: number;
  beginTime?: string;
  endTime?: string;
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

export const courseDataService = new CourseDataService(); 