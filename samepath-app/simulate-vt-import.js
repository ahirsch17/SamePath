// Simulate VT sending user data to your database
// This simulates what would happen when VT's system sends student data

const API_URL = 'https://your-vercel-api-url.vercel.app'; // Replace with your actual URL

// Simulated VT data - this is what VT would send
const vtUserData = [
  {
    vtEmail: "alexishirsch", // PID only (before @vt.edu)
    name: "Alexis Hirsch",
    crns: ["83534", "83484", "87290", "83339"]
  },
  {
    vtEmail: "saarthak", // PID only
    name: "Saarthak Sangwan", 
    crns: ["83534", "12479", "83484", "44444", "33333", "83351"]
  },
  {
    vtEmail: "jjohn", // PID only
    name: "Jake Johnson",
    crns: ["83535", "23452", "91578", "87290", "22222"]
  }
];

async function simulateVTImport() {
  console.log('🚀 Simulating VT sending user data to your database...\n');

  for (const userData of vtUserData) {
    try {
      console.log(`📤 Sending data for ${userData.name} (${userData.vtEmail})...`);
      
      const response = await fetch(`${API_URL}/vt-import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`✅ Success! Activation code: ${result.user.activationCode}`);
        console.log(`   CRNs: ${userData.crns.join(', ')}\n`);
      } else {
        const error = await response.json();
        console.log(`❌ Failed: ${error.error}\n`);
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}\n`);
    }
  }

  console.log('🎉 VT import simulation complete!');
  console.log('\n📧 Check your console logs for the activation codes');
  console.log('📱 Users can now activate their accounts with these codes');
}

// Run the simulation
simulateVTImport(); 