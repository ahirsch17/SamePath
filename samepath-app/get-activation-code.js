// Get activation code for testing
const API_URL = 'https://samepath-dzdue4twj-alexis-hirschs-projects.vercel.app';

async function getActivationCode() {
  console.log('🔍 Getting activation code for Alexis...\n');
  
  try {
    // Use the new API endpoint to generate a real activation code
    const response = await fetch(`${API_URL}/users/alexishirsch/new-activation-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const result = await response.json();
      console.log(`✅ Success! New activation code generated`);
      console.log(`📧 Activation Code: ${result.user.activationCode}`);
      console.log(`📧 VT Email: ${result.user.vtEmail}@vt.edu`);
      console.log(`📧 Name: ${result.user.name}`);
      console.log('\n📱 You can now test the login flow with this code');
      console.log('\n🔍 To test the complete flow:');
      console.log('1. Open the app in Expo Go');
      console.log('2. Enter activation code: ' + result.user.activationCode);
      console.log('3. Set a new password');
      console.log('4. Complete setup and select contacts');
      console.log('5. Check that match_list gets populated in database');
    } else {
      const error = await response.json();
      console.log(`❌ Failed: ${error.error}`);
    }
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
}

getActivationCode(); 