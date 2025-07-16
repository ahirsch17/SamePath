export interface VTUserData {
  vtEmail: string;
  name: string;
  crns: string[];
<<<<<<< HEAD
  phone: string; // Added phone field
  matchList: string[]; // Changed from crn1-crn8 to matchList
=======
>>>>>>> 0be5101354353b476f2562f6b92527ca7904d7f9
  // Add other VT-specific data as needed
}

export interface RegistrationFlow {
  vtEmail: string;
  uniqueCode: string;
  activated: boolean;
  password?: string; // Set when user first logs in
}

class VTIntegrationService {
  private databaseService: any = null;

  async initialize(): Promise<void> {
    try {
      const { databaseService } = await import('./DatabaseService');
      this.databaseService = databaseService;
      console.log('✅ VTIntegrationService initialized');
    } catch (error) {
      console.error('❌ Failed to initialize VTIntegrationService:', error);
    }
  }

  // 🔄 **VT Website Integration Flow**
  
  /**
   * Step 1: VT website sends user data to your database
   * This would be called by VT's system when a student registers for classes
   */
  async importVTUserData(vtUserData: VTUserData): Promise<boolean> {
    try {
      if (!this.databaseService) {
        throw new Error('Database service not initialized');
      }

      // Generate unique activation code
      const uniqueCode = this.generateUniqueCode();
      
      // Create user in database with VT data
      const userData = {
        vtEmail: vtUserData.vtEmail,
        name: vtUserData.name,
<<<<<<< HEAD
        phone: vtUserData.phone,
        crns: vtUserData.crns,
        matchList: vtUserData.matchList || []
=======
        crn1: vtUserData.crns[0] || undefined,
        crn2: vtUserData.crns[1] || undefined,
        crn3: vtUserData.crns[2] || undefined,
        crn4: vtUserData.crns[3] || undefined,
        crn5: vtUserData.crns[4] || undefined,
        crn6: vtUserData.crns[5] || undefined,
        crn7: vtUserData.crns[6] || undefined,
        crn8: vtUserData.crns[7] || undefined,
        password: uniqueCode, // Temporary password
        activated: false,
        matchList: [],
        location: ""
>>>>>>> 0be5101354353b476f2562f6b92527ca7904d7f9
      };

      await this.databaseService.createUser(userData);
      
      // Send activation email to user
      await this.sendActivationEmail(vtUserData.vtEmail, uniqueCode);
      
      console.log(`✅ Imported VT user: ${vtUserData.vtEmail} with code: ${uniqueCode}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to import VT user data:', error);
      return false;
    }
  }

  /**
   * Step 2: User enters their unique code to activate account
   */
  async activateWithCode(vtEmail: string, uniqueCode: string): Promise<boolean> {
    try {
      if (!this.databaseService) {
        throw new Error('Database service not initialized');
      }

      // Get user from database
      const user = await this.databaseService.getUserByEmail(vtEmail);
      
      if (!user) {
        console.log(`❌ User not found: ${vtEmail}`);
        return false;
      }

      if (user.activated) {
        console.log(`❌ User already activated: ${vtEmail}`);
        return false;
      }

      if (user.password !== uniqueCode) {
        console.log(`❌ Invalid activation code for: ${vtEmail}`);
        return false;
      }

      // User is valid, but not activated yet
      // They need to set their own password
      console.log(`✅ Valid activation code for: ${vtEmail}`);
      return true;
    } catch (error) {
      console.error('❌ Error activating with code:', error);
      return false;
    }
  }

  /**
   * Step 3: User sets their own password and activates account
   */
  async completeActivation(vtEmail: string, newPassword: string): Promise<boolean> {
    try {
      if (!this.databaseService) {
        throw new Error('Database service not initialized');
      }

      // Update user with new password and activate
      const updateData = {
        password: newPassword,
        activated: true
      };

      await this.databaseService.updateUser(vtEmail, updateData);
      
      console.log(`✅ User activated: ${vtEmail}`);
      return true;
    } catch (error) {
      console.error('❌ Error completing activation:', error);
      return false;
    }
  }

  // 🔧 **Utility Methods**

  private generateUniqueCode(): string {
    // Generate a 6-digit unique code
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private async sendActivationEmail(vtEmail: string, uniqueCode: string): Promise<void> {
    // TODO: Implement email sending
    // This would integrate with an email service like SendGrid
    console.log(`📧 Sending activation email to ${vtEmail} with code: ${uniqueCode}`);
    
    // For now, just log the email
    console.log(`
    ===== ACTIVATION EMAIL =====
    To: ${vtEmail}
    Subject: Welcome to SamePath - Activate Your Account
    
    Hello!
    
    Your SamePath account has been created with your VT schedule.
    Your unique activation code is: ${uniqueCode}
    
    Please download the SamePath app and enter this code to activate your account.
    
    Best regards,
    SamePath Team
    ============================
    `);
  }

  // 📊 **VT Data Management**

  /**
   * Batch import multiple VT users
   */
  async batchImportVTUsers(vtUsers: VTUserData[]): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const vtUser of vtUsers) {
      const result = await this.importVTUserData(vtUser);
      if (result) {
        success++;
      } else {
        failed++;
      }
    }

    console.log(`📊 Batch import complete: ${success} successful, ${failed} failed`);
    return { success, failed };
  }

  /**
   * Get all pending activations (users with codes but not activated)
   */
  async getPendingActivations(): Promise<RegistrationFlow[]> {
    try {
      if (!this.databaseService) {
        throw new Error('Database service not initialized');
      }

      const allUsers = await this.databaseService.getAllUsers();
      return allUsers
        .filter((user: any) => !user.activated)
        .map((user: any) => ({
          vtEmail: user.vtEmail,
          uniqueCode: user.password,
          activated: user.activated
        }));
    } catch (error) {
      console.error('❌ Error getting pending activations:', error);
      return [];
    }
  }
}

// Export singleton instance
export const vtIntegrationService = new VTIntegrationService(); 