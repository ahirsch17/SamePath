// Purely in-memory fake database for users, courses, and user_courses. No external API or database logic remains.

export interface User {
  name: string;
  vtEmail: string;
  phone: string;
  activated: boolean;
  matchList?: string[];
  lastScheduleUpdate?: number;
  courseDataCache?: string;
  friendsInCoursesCache?: string;
}

export interface Course {
  crn: string;
  subject: string;
  courseNumber: string;
  courseName: string;
  credits: number;
  time: string;
  days: string;
  location: string;
  instructor: string;
}

export interface UserCourse {
  vtEmail: string;
  crn: string;
}

export interface Contact {
  name: string;
  selected: 'yes' | 'no';
  starred: boolean;
}

//should be able to stay logged in
class UserDataService {
  // Database service for user operations
  private databaseService: any = null;

  // Initialize database connection
  async initialize(): Promise<void> {
    try {
      // Import services dynamically to avoid circular dependencies
      const { databaseService } = await import('./DatabaseService');
      
      this.databaseService = databaseService;

      // Initialize with your Vercel API URL
      await databaseService.initialize({
        apiUrl: 'https://samepath-dzdue4twj-alexis-hirschs-projects.vercel.app',
        apiKey: undefined // No API key needed for now
      });

      console.log('✅ UserDataService initialized with Vercel API');
    } catch (error) {
      console.error('❌ Failed to initialize UserDataService:', error);
      // Fallback to hardcoded data if database fails
      this.initializeHardcodedData();
    }
  }

  // Fallback to hardcoded data
  private initializeHardcodedData(): void {
    console.log('⚠️ No hardcoded data - all data should come from database');
    // No hardcoded users - everything comes from VT → Database → API
    this.users = [];
  }

  // Hardcoded user data - replace with database calls later
  private users: User[] = [
    {
      name: 'Alexis Hirsch',
      vtEmail: 'alexishirsch',
      phone: '555-0001',
      activated: true, // Set to true so classes always show up
      matchList: ['saarthak', 'jjohn', 'emilyt', 'brianw', 'sophiaz'] // Alexis adds them, but they don't add her back
    },
    {
      name: 'Saarthak Sangwan',
      vtEmail: 'saarthak',
      phone: '555-0002',
      activated: false,
      matchList: ['alexishirsch', 'jjohn']
    },
    {
      name: 'Jake Johnson',
      vtEmail: 'jjohn',
      phone: '555-0003',
      activated: false,
      matchList: ['alexishirsch', 'saarthak']
    },
    // New fake users
    {
      name: 'Emily Tran',
      vtEmail: 'emilyt',
      phone: '555-0004',
      activated: true,
      matchList: []
    },
    {
      name: 'Brian Wu',
      vtEmail: 'brianw',
      phone: '555-0005',
      activated: true,
      matchList: []
    },
    {
      name: 'Sophia Zhang',
      vtEmail: 'sophiaz',
      phone: '555-0006',
      activated: true,
      matchList: []
    },
  ];

  private userCourses: UserCourse[] = [
    // Alexis
    { vtEmail: 'alexishirsch', crn: '83534' }, // CS 3114 (Alexis)
    { vtEmail: 'alexishirsch', crn: '83484' }, // MATH 1225
    { vtEmail: 'alexishirsch', crn: '87290' }, // ENGL 1106
    { vtEmail: 'alexishirsch', crn: '83339' }, // CS 2505
    // Saarthak (same section as Alexis for CS 3114 and MATH 1225)
    { vtEmail: 'saarthak', crn: '83534' }, // CS 3114 (same as Alexis)
    { vtEmail: 'saarthak', crn: '12479' },
    { vtEmail: 'saarthak', crn: '83484' }, // MATH 1225 (same as Alexis)
    { vtEmail: 'saarthak', crn: '44444' },
    { vtEmail: 'saarthak', crn: '33333' },
    { vtEmail: 'saarthak', crn: '83351' },
    // Jake: different section for CS 3114, same section for MATH 1225 and ENGL 1106
    { vtEmail: 'jjohn', crn: '83535' }, // CS 3114 (other section)
    { vtEmail: 'jjohn', crn: '83484' }, // MATH 1225 (same as Alexis)
    { vtEmail: 'jjohn', crn: '87290' }, // ENGL 1106 (same as Alexis)
    { vtEmail: 'jjohn', crn: '23452' },
    { vtEmail: 'jjohn', crn: '91578' },
    { vtEmail: 'jjohn', crn: '22222' },
    // New fake users
    { vtEmail: 'emilyt', crn: '83534' }, // CS 3114 (same as Alexis)
    { vtEmail: 'brianw', crn: '83484' }, // MATH 1225 (same as Alexis)
    { vtEmail: 'sophiaz', crn: '87290' }, // ENGL 1106 (same as Alexis)
  ];

  private courses: Course[] = [
    { crn: '83534', subject: 'CS', courseNumber: '3114', courseName: 'Data Structures', credits: 3, time: '9:00-9:50', days: 'M W F', location: 'McBryde 100', instructor: 'Dr. Smith' },
    { crn: '83484', subject: 'MATH', courseNumber: '1225', courseName: 'Calculus of a Single Variable', credits: 4, time: '10:00-10:50', days: 'M W F', location: 'Hahn 120', instructor: 'Dr. Jones' },
    { crn: '87290', subject: 'ENGL', courseNumber: '1106', courseName: 'First-Year Writing', credits: 3, time: '11:00-11:50', days: 'T TH', location: 'Shanks 180', instructor: 'Dr. Lee' },
    { crn: '83339', subject: 'CS', courseNumber: '2505', courseName: 'Intro to Comp Org', credits: 3, time: '2:00-2:50', days: 'M W F', location: 'Goodwin 195', instructor: 'Dr. Kim' },
    { crn: '12479', subject: 'CS', courseNumber: '2114', courseName: 'Software Design', credits: 3, time: '1:00-1:50', days: 'M W F', location: 'McBryde 200', instructor: 'Dr. Patel' },
    { crn: '44444', subject: 'MATH', courseNumber: '2204', courseName: 'Multivariable Calculus', credits: 3, time: '3:00-3:50', days: 'T TH', location: 'Hahn 130', instructor: 'Dr. White' },
    { crn: '33333', subject: 'PHYS', courseNumber: '2305', courseName: 'Physics I', credits: 4, time: '8:00-8:50', days: 'M W F', location: 'Randolph 210', instructor: 'Dr. Black' },
    { crn: '83351', subject: 'CS', courseNumber: '1944', courseName: 'Freshman Seminar', credits: 1, time: '4:00-4:50', days: 'F', location: 'McBryde 300', instructor: 'Dr. Green' },
    { crn: '83535', subject: 'CS', courseNumber: '3114', courseName: 'Data Structures', credits: 3, time: '9:00-9:50', days: 'M W F', location: 'McBryde 100', instructor: 'Dr. Smith' },
    { crn: '23452', subject: 'MATH', courseNumber: '2214', courseName: 'Intro to Differential Equations', credits: 3, time: '12:00-12:50', days: 'M W F', location: 'Hahn 140', instructor: 'Dr. Brown' },
    { crn: '91578', subject: 'STAT', courseNumber: '3604', courseName: 'Statistics for Engineers', credits: 3, time: '1:00-1:50', days: 'T TH', location: 'McBryde 210', instructor: 'Dr. Blue' },
    { crn: '22222', subject: 'ENGL', courseNumber: '1105', courseName: 'First-Year Writing', credits: 3, time: '11:00-11:50', days: 'T TH', location: 'Shanks 180', instructor: 'Dr. Lee' }
  ];

  private currentUser: User | null = null;

  // Authentication methods
  // Verify code using only the activation code (no email)
  async verifyCode(code: string): Promise<boolean> {
    try {
      if (this.databaseService) {
        // Use API to verify activation code
        const response = await fetch(`${this.databaseService.config.apiUrl}/verify-code`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ activationCode: code })
        });
        if (response.ok) {
          const result = await response.json();
          return result.success;
        }
        return false;
      } else {
        // Fallback to hardcoded verification code
        return code === '123456';
      }
    } catch (error) {
      console.error('Error verifying code:', error);
      return false;
    }
  }

  async createUser(vtEmail: string, password: string): Promise<User | null> {
    try {
      if (this.databaseService) {
        // Use API to create user
        const userData = await this.databaseService.createUser({
          vtEmail,
          name: "", // Will be filled later
          password,
          activated: false
        });
        
        this.currentUser = userData;
        return userData;
      } else {
        // Fallback to hardcoded data
        const existingUser = this.users.find(user => user.vtEmail === vtEmail);
        if (existingUser) {
          if (existingUser.activated) {
            return null; // User already exists and is activated
          } else {
            // User exists but not activated, update password and activate
            existingUser.activated = true;
            this.currentUser = existingUser;
            return existingUser;
          }
        }

        // Create new user
        const newUser: User = {
          name: "", // Will be filled later
          vtEmail,
          activated: false,
          matchList: [],
          phone: "" // Added missing property
        };

        this.users.push(newUser);
        this.currentUser = newUser;
        return newUser;
      }
    } catch (error) {
      console.error('Error creating user:', error);
      return null;
    }
  }

  // Activate user by VT PID, verification code, and new password
  async activateUserWithCodeAndPid(vtPid: string, code: string, newPassword: string): Promise<User | null> {
    try {
      if (this.databaseService) {
        // Use API to activate user with VT PID, code, and new password
        const response = await fetch(`${this.databaseService.config.apiUrl}/vt-activate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            vtEmail: vtPid,
            activationCode: code,
            newPassword
          })
        });
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.user && result.user.vtEmail) {
            const userData = await this.databaseService.getUserByEmail(vtPid);
            this.currentUser = userData;
            return userData;
          }
        }
        return null;
      } else {
        // Fallback to hardcoded data
        const user = this.users.find(u => u.vtEmail === vtPid && !u.activated);
        if (user) {
          user.activated = true;
          this.currentUser = user;
          return user;
        }
        return null;
      }
    } catch (error) {
      console.error('Error activating user by PID and code:', error);
      return null;
    }
  }

  async login(vtEmail: string, password: string): Promise<User | null> {
    try {
      if (this.databaseService) {
        // Use API to verify login with bcrypt comparison
        const response = await fetch(`${this.databaseService.config.apiUrl}/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            vtEmail: vtEmail.trim(),
            password: password
          })
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            this.currentUser = result.user;
            return result.user;
          }
        }
        return null;
      } else {
        // Fallback to hardcoded data
        const user = this.users.find(u => u.vtEmail === vtEmail);
        if (user && user.activated) {
          this.currentUser = user;
          return user;
        }
        return null;
      }
    } catch (error) {
      console.error('Error logging in:', error);
      return null;
    }
  }

  async getCurrentUser(): Promise<User | null> {
    return this.currentUser;
  }

  async getAllUsers(): Promise<User[]> {
    try {
      if (this.databaseService) {
        // Use API to get all users
        return await this.databaseService.getAllUsers();
      } else {
        // Fallback to hardcoded data
        return this.users;
      }
    } catch (error) {
      console.error('Error getting all users:', error);
      return this.users; // Fallback to hardcoded data
    }
  }

  // Synchronous method to get all users (for NetworkScreen compatibility)
  getAllUsersSync(): User[] {
    return this.users;
  }

  async updateUserProfile(name: string, location?: string): Promise<boolean> {
    if (this.currentUser) {
      try {
        if (this.databaseService) {
          // Use API to update user profile
          const updateData = { name };
          const updatedUser = await this.databaseService.updateUser(this.currentUser.vtEmail, updateData);
          this.currentUser = updatedUser;
        } else {
          // Fallback to hardcoded data
          this.currentUser.name = name;
        }
        return true;
      } catch (error) {
        console.error('Error updating user profile:', error);
        return false;
      }
    }
    return false;
  }

  async updateUserSchedule(crns: string[]): Promise<boolean> {
    if (this.currentUser) {
      try {
        if (this.databaseService) {
          // Use API to update user schedule
          const updateData = { crns };
          const updatedUser = await this.databaseService.updateUser(this.currentUser!.vtEmail, updateData);
          this.currentUser = updatedUser;
        } else {
          // Fallback to hardcoded data: update userCourses array
          // Remove old courses for this user
          this.userCourses = this.userCourses.filter(uc => uc.vtEmail !== this.currentUser!.vtEmail);
          // Add new courses
          for (const crn of crns) {
            this.userCourses.push({ vtEmail: this.currentUser!.vtEmail, crn });
          }
        }
        // Clear user cache when schedule changes (EFFICIENT)
        if (this.currentUser?.vtEmail) {
          try {
            const { courseDataService } = await import('./CourseDataService');
            await courseDataService.clearUserCache(this.currentUser.vtEmail);
          } catch (error) {
            console.error('Failed to clear user cache:', error);
          }
        }
        return true;
      } catch (error) {
        console.error('Error updating user schedule:', error);
        return false;
      }
    }
    return false;
  }

  async updateContacts(contacts: Contact[]): Promise<boolean> {
    // For now, just store the selected contacts
    // Later this will sync with actual phone contacts
    if (this.currentUser) {
      try {
        const selectedContacts = contacts
          .filter(contact => contact.selected === 'yes')
          .map(contact => contact.name);
        
        if (this.databaseService) {
          // Use dedicated API endpoint for updating match list
          const response = await fetch(`${this.databaseService.config.apiUrl}/users/${this.currentUser.vtEmail}/match-list`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ matchList: selectedContacts })
          });
          
          if (response.ok) {
            const updatedUser = await response.json();
            this.currentUser = updatedUser;
            return true;
          } else {
            console.error('Failed to update match list');
            return false;
          }
        } else {
          // Fallback to hardcoded data
          this.currentUser.matchList = selectedContacts;
        }
        return true;
      } catch (error) {
        console.error('Error updating contacts:', error);
        return false;
      }
    }
    return false;
  }

  // Optimized method to get friends data for schedule matching
  async getFriendsForUser(vtEmail: string): Promise<{ vtEmail: string; name: string; crns: string[] }[]> {
    try {
      if (this.databaseService) {
        // Use optimized API endpoint for getting friends
        const response = await fetch(`${this.databaseService.config.apiUrl}/users/${vtEmail}/friends`);
        if (response.ok) {
          const result = await response.json();
          return result.friends;
        }
      }
      // Fallback to hardcoded data
      const allUsers = await this.getAllUsers();
      const currentUser = allUsers.find(u => u.vtEmail === vtEmail);
      if (!currentUser?.matchList) return [];
      return allUsers
        .filter(user => currentUser.matchList?.includes(user.vtEmail))
        .map(user => ({
          vtEmail: user.vtEmail,
          name: user.name,
          crns: this.getUserCRNs(user.vtEmail)
        }));
    } catch (error) {
      console.error('Error getting friends:', error);
      return [];
    }
  }

  // Returns all CRNs for a given user
  getUserCRNs(vtEmail: string): string[] {
    return this.userCourses.filter(uc => uc.vtEmail === vtEmail).map(uc => uc.crn);
  }

  // Matching methods
  async findMatches(): Promise<User[]> {
    if (!this.currentUser) return [];
    try {
      if (this.databaseService) {
        // Use API to find matches
        const matches = await this.databaseService.getMatchesForUser(this.currentUser.vtEmail);
        return matches;
      } else {
        // Fallback to hardcoded data
        const currentUserCrns = this.getUserCRNs(this.currentUser.vtEmail);
        return this.users.filter(user => {
          if (user.vtEmail === this.currentUser?.vtEmail) return false;
          if (!user.activated) return false;
          const userCrns = this.getUserCRNs(user.vtEmail);
          // Check for CRN overlaps
          const hasOverlap = currentUserCrns.some(crn => userCrns.includes(crn));
          // Check if in each other's match lists
          const inMatchList = this.currentUser?.matchList?.includes(user.vtEmail) || 
                             user.matchList?.includes(this.currentUser?.vtEmail || '');
          return hasOverlap && inMatchList;
        });
      }
    } catch (error) {
      console.error('Error finding matches:', error);
      return [];
    }
  }

  async getContacts(): Promise<Contact[]> {
    return [
      { name: 'David Bolivar', selected: 'yes', starred: true },
      { name: 'Elise Richards', selected: 'yes', starred: false },
      { name: 'Jake Mitchell', selected: 'yes', starred: true },
      { name: 'Ian Hedstrom', selected: 'no', starred: false },
      { name: 'Gaby Moretti', selected: 'yes', starred: true },
      { name: 'Isaac Gutierrez', selected: 'no', starred: false },
    ];
  }

  async logout(): Promise<void> {
    this.currentUser = null;
  }

  async isUserActivated(vtEmail: string): Promise<boolean> {
    const user = this.users.find(u => u.vtEmail === vtEmail);
    return user?.activated || false;
  }
}

export const userDataService = new UserDataService(); 