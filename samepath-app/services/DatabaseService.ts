export interface DatabaseConfig {
  apiUrl: string;
  apiKey?: string;
}

class DatabaseService {
  private config: DatabaseConfig | null = null;
  private isConnected: boolean = false;

  // Initialize database connection
  async initialize(config: DatabaseConfig): Promise<void> {
    this.config = config;
    
    try {
      // Test connection by making a simple API call
      const response = await fetch(`${config.apiUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(config.apiKey && { 'Authorization': `Bearer ${config.apiKey}` })
        }
      });

      if (response.ok) {
        this.isConnected = true;
        console.log('✅ Database API connected successfully');
      } else {
        throw new Error(`API health check failed: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Database API connection failed:', error);
      throw error;
    }
  }

  // Execute query via API
  async query(endpoint: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET', data?: any): Promise<any> {
    if (!this.config || !this.isConnected) {
      throw new Error('Database not initialized');
    }

    const response = await fetch(`${this.config.apiUrl}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
      },
      ...(data && { body: JSON.stringify(data) })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  // User operations
  async createUser(userData: any): Promise<any> {
    return await this.query('/users', 'POST', userData);
  }

  async getUserByEmail(vtEmail: string): Promise<any> {
    return await this.query(`/users/${encodeURIComponent(vtEmail)}`);
  }

  async updateUser(vtEmail: string, userData: any): Promise<any> {
    return await this.query(`/users/${encodeURIComponent(vtEmail)}`, 'PUT', userData);
  }

  async getAllUsers(): Promise<any[]> {
    const result = await this.query('/users');
    return result.users || [];
  }

  // Course operations
  async createCourse(courseData: any): Promise<any> {
    return await this.query('/courses', 'POST', courseData);
  }

  async getCourseByCRN(crn: string): Promise<any> {
    return await this.query(`/courses/${crn}`);
  }

  async updateCourse(crn: string, courseData: any): Promise<any> {
    return await this.query(`/courses/${crn}`, 'PUT', courseData);
  }

  // Match operations
  async createMatch(matchData: any): Promise<any> {
    return await this.query('/matches', 'POST', matchData);
  }

  async getMatchesForUser(vtEmail: string): Promise<any[]> {
    const result = await this.query(`/matches/user/${encodeURIComponent(vtEmail)}`);
    return result.matches || [];
  }

  // Batch operations for efficiency
  async batchUpdateUsers(users: any[]): Promise<any> {
    return await this.query('/users/batch', 'PUT', { users });
  }

  async batchUpdateCourses(courses: any[]): Promise<any> {
    return await this.query('/courses/batch', 'PUT', { courses });
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const result = await this.query('/health');
      return result.status === 'ok';
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }

  // Close connection (no-op for API)
  async close(): Promise<void> {
    this.isConnected = false;
    console.log('Database API connection closed');
  }
}

// Export singleton instance
export const databaseService = new DatabaseService(); 