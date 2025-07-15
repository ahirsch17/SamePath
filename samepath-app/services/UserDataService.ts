export interface User {
  name: string;
  vtEmail: string;
  crn1?: string;
  crn2?: string;
  crn3?: string;
  crn4?: string;
  crn5?: string;
  crn6?: string;
  crn7?: string;
  crn8?: string;
  password: string;
  activated: boolean;
  matchList?: string[];
  location?: string;
  // New database columns for efficiency
  lastScheduleUpdate?: number; // Timestamp of last schedule change
  courseDataCache?: string; // JSON string of cached course data
  friendsInCoursesCache?: string; // JSON string of cached friend matches
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
  private users: User[] = [];

  // Current user session
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
            existingUser.password = password;
            existingUser.activated = true;
            this.currentUser = existingUser;
            return existingUser;
          }
        }

        // Create new user
        const newUser: User = {
          name: "", // Will be filled later
          vtEmail,
          password,
          activated: false,
          matchList: [],
          location: ""
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
        const user = this.users.find(u => u.vtEmail === vtPid && u.password === code && !u.activated);
        if (user) {
          user.activated = true;
          user.password = newPassword;
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
        const user = this.users.find(u => u.vtEmail === vtEmail && u.password === password);
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

  async loginByPassword(password: string): Promise<User | null> {
    const user = this.users.find(u => u.password === password);
    if (user && user.activated) {
      this.currentUser = user;
      return user;
    }
    return null;
  }

  // User data methods
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

  async updateUserProfile(name: string, location?: string): Promise<boolean> {
    if (this.currentUser) {
      try {
        if (this.databaseService) {
          // Use API to update user profile
          const updateData = { name, ...(location && { location }) };
          const updatedUser = await this.databaseService.updateUser(this.currentUser.vtEmail, updateData);
          this.currentUser = updatedUser;
        } else {
          // Fallback to hardcoded data
          this.currentUser.name = name;
          if (location) {
            this.currentUser.location = location;
          }
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
          const updateData = {
            crn1: crns[0] || undefined,
            crn2: crns[1] || undefined,
            crn3: crns[2] || undefined,
            crn4: crns[3] || undefined,
            crn5: crns[4] || undefined,
            crn6: crns[5] || undefined,
            crn7: crns[6] || undefined,
            crn8: crns[7] || undefined
          };
          
          const updatedUser = await this.databaseService.updateUser(this.currentUser!.vtEmail, updateData);
          this.currentUser = updatedUser;
        } else {
          // Fallback to hardcoded data
          this.currentUser.crn1 = crns[0] || undefined;
          this.currentUser.crn2 = crns[1] || undefined;
          this.currentUser.crn3 = crns[2] || undefined;
          this.currentUser.crn4 = crns[3] || undefined;
          this.currentUser.crn5 = crns[4] || undefined;
          this.currentUser.crn6 = crns[5] || undefined;
          this.currentUser.crn7 = crns[6] || undefined;
          this.currentUser.crn8 = crns[7] || undefined;
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
          crns: [user.crn1, user.crn2, user.crn3, user.crn4, user.crn5, user.crn6, user.crn7, user.crn8]
            .filter((crn): crn is string => Boolean(crn))
        }));
    } catch (error) {
      console.error('Error getting friends:', error);
      return [];
    }
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
        const currentUserCrns = [
          this.currentUser.crn1, this.currentUser.crn2, this.currentUser.crn3, this.currentUser.crn4,
          this.currentUser.crn5, this.currentUser.crn6, this.currentUser.crn7, this.currentUser.crn8
        ].filter(Boolean);

        return this.users.filter(user => {
          if (user.vtEmail === this.currentUser?.vtEmail) return false;
          if (!user.activated) return false;

          const userCrns = [
            user.crn1, user.crn2, user.crn3, user.crn4,
            user.crn5, user.crn6, user.crn7, user.crn8
          ].filter(Boolean);

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

  // Contact methods
  async getContacts(): Promise<Contact[]> {
    // For now, return hardcoded contacts
    // Later this will fetch from phone contacts
    return [
      { name: 'David Bolivar', selected: 'yes', starred: true },
      { name: 'Elise Richards', selected: 'yes', starred: false },
      { name: 'Jake Mitchell', selected: 'yes', starred: true },
      { name: 'Ian Hedstrom', selected: 'no', starred: false },
      { name: 'Gaby Moretti', selected: 'yes', starred: true },
      { name: 'Isaac Gutierrez', selected: 'no', starred: false },
    ];
  }

  // Utility methods
  async logout(): Promise<void> {
    this.currentUser = null;
  }

  async isUserActivated(vtEmail: string): Promise<boolean> {
    const user = this.users.find(u => u.vtEmail === vtEmail);
    return user?.activated || false;
  }
}

// Export singleton instance
export const userDataService = new UserDataService(); 