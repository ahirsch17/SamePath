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
}

export interface Contact {
  name: string;
  selected: 'yes' | 'no';
  starred: boolean;
}

class UserDataService {
  // Hardcoded user data - replace with database calls later
  private users: User[] = [
    {
      name: "Alexis Hirsch",
      vtEmail: "alexishirsch",
      crn1: "12479",
      crn2: "56433", 
      crn3: "23453",
      crn4: "23463",
      crn5: "34223",
      crn6: "43534",
      crn7: "34233",
      crn8: "45345",
      password: "123456",
      activated: false,
      matchList: [],
      location: ""
    },
    {
      name: "Saarthak Sangwan", 
      vtEmail: "saarthak",
      crn1: "43534",
      crn2: "12479",
      crn3: "77777",
      crn4: "44444", 
      crn5: "33333",
      crn6: "22222",
      password: "MySecretPa$$",
      activated: true,
      matchList: ["alexishirsch", "jjohn"],
      location: ""
    },
    {
      name: "Jake Johnson",
      vtEmail: "jjohn", 
      crn1: "32820",
      crn2: "23452",
      crn3: "23453",
      crn4: "33333",
      crn5: "22222",
      password: "BlahPass$a",
      activated: true,
      matchList: ["saarthak"],
      location: ""
    }
  ];

  // Current user session
  private currentUser: User | null = null;

  // Authentication methods
  async verifyCode(code: string): Promise<boolean> {
    // For now, hardcoded verification code
    return code === '123456';
  }

  async createUser(vtEmail: string, password: string): Promise<User | null> {
    // Check if user already exists
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

  async activateUser(vtEmail: string): Promise<boolean> {
    const user = this.users.find(u => u.vtEmail === vtEmail);
    if (user) {
      user.activated = true;
      this.currentUser = user;
      return true;
    }
    return false;
  }

  async login(vtEmail: string, password: string): Promise<User | null> {
    const user = this.users.find(u => u.vtEmail === vtEmail && u.password === password);
    if (user && user.activated) {
      this.currentUser = user;
      return user;
    }
    return null;
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

  async updateUserProfile(name: string, location?: string): Promise<boolean> {
    if (this.currentUser) {
      this.currentUser.name = name;
      if (location) {
        this.currentUser.location = location;
      }
      return true;
    }
    return false;
  }

  async updateUserSchedule(crns: string[]): Promise<boolean> {
    if (this.currentUser) {
      this.currentUser.crn1 = crns[0] || undefined;
      this.currentUser.crn2 = crns[1] || undefined;
      this.currentUser.crn3 = crns[2] || undefined;
      this.currentUser.crn4 = crns[3] || undefined;
      this.currentUser.crn5 = crns[4] || undefined;
      this.currentUser.crn6 = crns[5] || undefined;
      this.currentUser.crn7 = crns[6] || undefined;
      this.currentUser.crn8 = crns[7] || undefined;
      return true;
    }
    return false;
  }

  async updateContacts(contacts: Contact[]): Promise<boolean> {
    // For now, just store the selected contacts
    // Later this will sync with actual phone contacts
    if (this.currentUser) {
      const selectedContacts = contacts
        .filter(contact => contact.selected === 'yes')
        .map(contact => contact.name);
      
      // Update match list with selected contacts
      this.currentUser.matchList = selectedContacts;
      return true;
    }
    return false;
  }

  // Matching methods
  async findMatches(): Promise<User[]> {
    if (!this.currentUser) return [];

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