import { CourseInfo } from './CourseDataService';

export interface VTWebsiteConfig {
  baseUrl: string;
  searchEndpoint: string;
  term: string;
  campus: string;
}

class VTDataFetchService {
  private config: VTWebsiteConfig = {
    baseUrl: 'https://selfservice.banner.vt.edu',
    searchEndpoint: '/ssb/HZSKVTSC.P_DispRequest',
    term: '202508', // Fall 2025
    campus: 'BL' // Blacksburg
  };

  // Fetch course data from VT website
  async fetchCourseByCRN(crn: string): Promise<CourseInfo | null> {
    try {
      console.log(`Fetching course data for CRN: ${crn} from VT website...`);
      
      // Make actual HTTP request to VT website
      const response = await fetch(`${this.config.baseUrl}${this.config.searchEndpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        body: new URLSearchParams({
          'term_in': this.config.term,
          'sel_subj': '',
          'sel_day': '',
          'sel_schd': '',
          'sel_insm': '',
          'sel_camp': this.config.campus,
          'sel_levl': '',
          'sel_sess': '',
          'sel_instr': '',
          'sel_ptrm': '',
          'sel_attr': '',
          'sel_crse': '',
          'sel_title': '',
          'sel_from_cred': '',
          'sel_to_cred': '',
          'sel_crn': crn
        })
      });

      if (!response.ok) {
        console.log(`VT website returned ${response.status} for CRN: ${crn}`);
        return null;
      }

      const html = await response.text();
      
      // Parse the HTML response to extract course information
      const courseInfo = this.parseCourseFromHTML(html, crn);
      
      if (courseInfo) {
        console.log(`Successfully fetched course data for CRN: ${crn}`);
        return courseInfo;
      } else {
        console.log(`Could not parse course data for CRN: ${crn}`);
        return null;
      }
      
    } catch (error) {
      console.error('Error fetching course data from VT:', error);
      return null;
    }
  }

  // Parse course information from VT website HTML
  private parseCourseFromHTML(html: string, crn: string): CourseInfo | null {
    try {
      // Check if the page contains course information
      if (html.includes('No courses found') || html.includes('No classes found') || html.includes('No records found')) {
        return null;
      }

      // Try multiple parsing strategies for different HTML structures
      
      // Strategy 1: Look for table rows with course data
      const tableRowMatch = html.match(/<tr[^>]*>.*?<td[^>]*>(\d{5})<\/td>.*?<td[^>]*>([A-Z]{2,4})<\/td>.*?<td[^>]*>(\d{4})<\/td>.*?<td[^>]*>([^<]+)<\/td>/s);
      
      if (tableRowMatch) {
        const [, foundCRN, subject, courseNumber, courseName] = tableRowMatch;
        
        // Extract time and days
        const timeMatch = html.match(/(\d{1,2}:\d{2}\s*[AP]M\s*-\s*\d{1,2}:\d{2}\s*[AP]M)/);
        const daysMatch = html.match(/([MTWRF\s]+)/);
        const locationMatch = html.match(/([A-Z]+\s+\d+)/);
        const instructorMatch = html.match(/<td[^>]*>([^<]+)<\/td>/g);
        const creditsMatch = html.match(/(\d+)/);

        const time = timeMatch ? timeMatch[1] : 'TBD';
        const days = daysMatch ? daysMatch[1].trim() : 'TBD';
        const location = locationMatch ? locationMatch[1] : 'TBD';
        const instructor = instructorMatch ? instructorMatch[0].replace(/<[^>]*>/g, '').trim() : 'TBD';
        const credits = creditsMatch ? parseInt(creditsMatch[1]) : 3;

        return {
          crn: foundCRN,
          subject,
          courseNumber,
          courseName: courseName.trim(),
          credits,
          time,
          days,
          location,
          instructor,
          campus: 'Blacksburg',
          term: 'Fall 2025',
          scheduleType: 'L',
          modality: 'Face-to-Face Instruction',
          capacity: 0,
          beginTime: time.split(' - ')[0] || 'TBD',
          endTime: time.split(' - ')[1] || 'TBD'
        };
      }

      // Strategy 2: Look for individual elements
      const subjectMatch = html.match(/<td[^>]*>([A-Z]{2,4})<\/td>/);
      const courseNumberMatch = html.match(/<td[^>]*>(\d{4})<\/td>/);
      
      if (subjectMatch && courseNumberMatch) {
        const subject = subjectMatch[1];
        const courseNumber = courseNumberMatch[1];
        
        // Try to find course name in various formats
        let courseName = 'Course Information';
        const courseNameMatches = html.match(/<td[^>]*>([^<]{10,50})<\/td>/g);
        if (courseNameMatches) {
          for (const match of courseNameMatches) {
            const text = match.replace(/<[^>]*>/g, '').trim();
            if (text.length > 10 && !text.match(/^\d+$/) && !text.match(/^[A-Z]{2,4}$/)) {
              courseName = text;
              break;
            }
          }
        }

        // Extract other information
        const timeMatch = html.match(/(\d{1,2}:\d{2}\s*[AP]M\s*-\s*\d{1,2}:\d{2}\s*[AP]M)/);
        const daysMatch = html.match(/([MTWRF\s]+)/);
        const locationMatch = html.match(/([A-Z]+\s+\d+)/);
        const instructorMatch = html.match(/<td[^>]*>([^<]+)<\/td>/g);
        const creditsMatch = html.match(/(\d+)/);

        const time = timeMatch ? timeMatch[1] : 'TBD';
        const days = daysMatch ? daysMatch[1].trim() : 'TBD';
        const location = locationMatch ? locationMatch[1] : 'TBD';
        const instructor = instructorMatch ? instructorMatch[0].replace(/<[^>]*>/g, '').trim() : 'TBD';
        const credits = creditsMatch ? parseInt(creditsMatch[1]) : 3;

        return {
          crn,
          subject,
          courseNumber,
          courseName,
          credits,
          time,
          days,
          location,
          instructor,
          campus: 'Blacksburg',
          term: 'Fall 2025',
          scheduleType: 'L',
          modality: 'Face-to-Face Instruction',
          capacity: 0,
          beginTime: time.split(' - ')[0] || 'TBD',
          endTime: time.split(' - ')[1] || 'TBD'
        };
      }

      // Strategy 3: Fallback - create basic course info from CRN
      
      // Try to extract subject from the HTML
      const allText = html.replace(/<[^>]*>/g, ' ');
      const subjectPattern = /\b([A-Z]{2,4})\s+\d{4}\b/;
      const subjectExtract = allText.match(subjectPattern);
      
      let subject = 'UNKNOWN';
      let courseNumber = '0000';
      
      if (subjectExtract) {
        const parts = subjectExtract[1].split(/\s+/);
        subject = parts[0];
        courseNumber = parts[1];
      }

      return {
        crn,
        subject,
        courseNumber,
        courseName: 'Course Information Retrieved',
        credits: 3,
        time: 'TBD',
        days: 'TBD',
        location: 'TBD',
        instructor: 'TBD',
        campus: 'Blacksburg',
        term: 'Fall 2025',
        scheduleType: 'L',
        modality: 'Face-to-Face Instruction',
        capacity: 0,
        beginTime: 'TBD',
        endTime: 'TBD'
      };

    } catch (error) {
      console.error('Error parsing course HTML:', error);
      return null;
    }
  }

  // Search courses by subject
  async searchCoursesBySubject(subject: string): Promise<CourseInfo[]> {
    try {

      
      // Make actual HTTP request to VT website
      const response = await fetch(`${this.config.baseUrl}${this.config.searchEndpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        body: new URLSearchParams({
          'term_in': this.config.term,
          'sel_subj': subject,
          'sel_day': '',
          'sel_schd': '',
          'sel_insm': '',
          'sel_camp': this.config.campus,
          'sel_levl': '',
          'sel_sess': '',
          'sel_instr': '',
          'sel_ptrm': '',
          'sel_attr': '',
          'sel_crse': '',
          'sel_title': '',
          'sel_from_cred': '',
          'sel_to_cred': '',
          'sel_crn': ''
        })
      });

      if (!response.ok) {
        return [];
      }

      const html = await response.text();
      
      // Parse multiple courses from HTML
      const courses = this.parseMultipleCoursesFromHTML(html);
      
      return courses;
      
    } catch (error) {
      console.error('Error searching courses by subject:', error);
      return [];
    }
  }

  // Parse multiple courses from HTML
  private parseMultipleCoursesFromHTML(html: string): CourseInfo[] {
    const courses: CourseInfo[] = [];
    
    try {
      // Split HTML into course sections
      const courseSections = html.split('<tr class="odd">').concat(html.split('<tr class="even">'));
      
      for (const section of courseSections) {
        if (section.includes('CRN')) {
          const crnMatch = section.match(/(\d{5})/);
          if (crnMatch) {
            const courseInfo = this.parseCourseFromHTML(section, crnMatch[1]);
            if (courseInfo) {
              courses.push(courseInfo);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error parsing multiple courses:', error);
    }
    
    return courses;
  }

  // Fetch all CRNs for a course from VT website
  async fetchAllCRNsForCourse(subject: string, courseNumber: string): Promise<string[]> {
    try {

      
      // Search for the course by subject and number
      const courses = await this.searchCoursesBySubject(subject);
      
      // Filter by course number and extract CRNs
      const matchingCourses = courses.filter(course => 
        course.courseNumber === courseNumber
      );
      
      const crns = matchingCourses.map(course => course.crn);
      
      return crns;
      
    } catch (error) {
      console.error('Error fetching CRNs for course:', error);
      return [];
    }
  }

  // Update configuration
  updateConfig(newConfig: Partial<VTWebsiteConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // Get current configuration
  getConfig(): VTWebsiteConfig {
    return { ...this.config };
  }

  // Validate CRN format
  isValidCRN(crn: string): boolean {
    return /^\d{5}$/.test(crn);
  }

  // Get available terms
  getAvailableTerms(): string[] {
    return [
      '202508', // Fall 2025
      '202505', // Summer 2025
      '202501', // Spring 2025
      '202408', // Fall 2024
    ];
  }

  // Get available campuses
  getAvailableCampuses(): { code: string; name: string }[] {
    return [
      { code: 'BL', name: 'Blacksburg' },
      { code: 'VIRTUAL', name: 'Virtual' },
      { code: 'VTCSOM', name: 'VTCSOM' },
      { code: 'WESTERN', name: 'Western Valley' },
      { code: 'NCR', name: 'National Capital Region' },
      { code: 'CENTRAL', name: 'Central' },
      { code: 'HAMPTON', name: 'Hampton Roads Center' },
      { code: 'CAPITAL', name: 'Capital' }
    ];
  }


}

// Export singleton instance
export const vtDataFetchService = new VTDataFetchService(); 