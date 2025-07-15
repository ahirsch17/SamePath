// Populate database with sample users for testing
// This simulates VT sending student data to your database

const API_URL = 'https://samepath-cngzt0g16-alexis-hirschs-projects.vercel.app'; 

// Sample users that will be imported to database
const sampleUsers = [
  {
    vtEmail: "alexishirsch", // PID only (before @vt.edu)
    name: "Alexis Hirsch",
    phone: "555-0001",
    crns: ["83534", "83484", "87290", "83339"],
    matchList: [] // Can see Saarthak and Jake's schedules
  },
  {
    vtEmail: "saarthak", // PID only
    name: "Saarthak Sangwan", 
    phone: "555-0002",
    crns: ["83534", "12479", "83484", "44444", "33333", "83351"],
    matchList: ["alexishirsch", "jjohn"] // Can see Alexis and Jake's schedules
  },
  {
    vtEmail: "jjohn", // PID only
    name: "Jake Johnson",
    phone: "555-0003",
    crns: ["83535", "23452", "91578", "87290", "22222"],
    matchList: ["alexishirsch", "saarthak"] // Can see Alexis and Saarthak's schedules
  }
];

async function populateSampleUsers() {
  console.log('🚀 Populating database with sample users...\n');

  for (const userData of sampleUsers) {
    try {
      console.log(`📤 Importing ${userData.name} (${userData.vtEmail})...`);
      
      const response = await fetch(`${API_URL}/vt-import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`✅ Success! User: ${result.user.name}`);
        console.log(`   PID: ${result.user.vtEmail}`);
        console.log(`   Full Email: ${result.user.fullEmail}`);
        console.log(`   Activation Code: ${result.user.activationCode}`);
        console.log(`   CRNs: ${userData.crns.join(', ')}`);
        console.log(`   Match List: ${userData.matchList.join(', ')}`);
        console.log(`   Activated: ${result.user.activated}\n`);
      } else {
        const error = await response.json();
        if (error.error === 'User already exists') {
          console.log(`⚠️ User ${userData.name} already exists in database\n`);
        } else {
          console.log(`❌ Failed: ${error.error}\n`);
        }
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}\n`);
    }
  }

  console.log('🎉 Sample users populated!');
  console.log('\n📧 Activation codes are shown above');
  console.log('📱 Users can now activate their accounts with these codes');
  console.log('\n🔍 To verify, check your database or run:');
  console.log(`   GET ${API_URL}/users`);
}

// Run the population
populateSampleUsers(); 