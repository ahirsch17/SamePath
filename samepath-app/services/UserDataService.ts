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

class UserDataService {
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
    }
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

  async initialize(): Promise<void> {}

  async createUser(vtEmail: string, name: string, phone: string): Promise<User> {
    const user: User = { name, vtEmail, phone, activated: false, matchList: [] };
    this.users.push(user);
    return user;
  }

  async activateUserWithCodeAndPid(vtPid: string, code: string, newPassword: string): Promise<User | null> {
    const user = this.users.find(u => u.vtEmail === vtPid);
    if (user) {
      user.activated = true;
      return user;
    }
    return null;
  }

  async login(vtEmail: string, password: string): Promise<User | null> {
    const user = this.users.find(u => u.vtEmail === vtEmail && u.activated);
    if (user) {
      this.currentUser = user;
      return user;
    }
    return null;
  }

  async getCurrentUser(): Promise<User | null> {
    return this.currentUser;
  }

  async getAllUsers(): Promise<User[]> {
    return this.users;
  }

  getAllUsersSync(): User[] {
    return this.users;
  }

  async getUserCRNs(vtEmail: string): Promise<string[]> {
    return this.userCourses.filter(uc => uc.vtEmail === vtEmail).map(uc => uc.crn);
  }

  async getCourses(): Promise<Course[]> {
    return this.courses;
  }

  async getCourseByCRN(crn: string): Promise<Course | undefined> {
    return this.courses.find(c => c.crn === crn);
  }

  async getFriendsForUser(vtEmail: string): Promise<{ vtEmail: string; name: string; crns: string[] }[]> {
    const user = this.users.find(u => u.vtEmail === vtEmail);
    if (!user || !user.matchList) return [];
    return this.users
      .filter(u => user.matchList!.includes(u.vtEmail))
      .map(u => ({ vtEmail: u.vtEmail, name: u.name, crns: this.userCourses.filter(uc => uc.vtEmail === u.vtEmail).map(uc => uc.crn) }));
  }

  async findMatches(): Promise<User[]> {
    if (!this.currentUser) return [];
    return this.users.filter(u => this.currentUser!.matchList?.includes(u.vtEmail));
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