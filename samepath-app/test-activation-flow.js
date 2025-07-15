// Test the complete VT activation flow
// This simulates: VT Import → Email → User Activation

const API_URL = 'https://your-vercel-api-url.vercel.app'; // Replace with your actual URL

// Test user data (simulating VT sending this)
const testUser = {
  vtEmail: "alexishirsch", // PID only
  name: "Alexis Hirsch",
  crns: ["83534", "83484", "87290", "83339"]
};

async function testVTFlow() {
  console.log('🧪 Testing complete VT activation flow...\n');

  // Step 1: VT imports user data
  console.log('📤 Step 1: VT importing user data...');
  try {
    const importResponse = await fetch(`${API_URL}/vt-import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });

    if (importResponse.ok) {
      const importResult = await importResponse.json();
      const activationCode = importResult.user.activationCode;
      console.log(`✅ User imported successfully!`);
      console.log(`   PID: ${importResult.user.vtEmail}`);
      console.log(`   Full Email: ${importResult.user.fullEmail}`);
      console.log(`   Activation Code: ${activationCode}\n`);

      // Step 2: User enters activation code (verification)
      console.log('🔐 Step 2: User entering activation code...');
      const verifyResponse = await fetch(`${API_URL}/vt-activate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vtEmail: testUser.vtEmail,
          activationCode: activationCode
        })
      });

      if (verifyResponse.ok) {
        const verifyResult = await verifyResponse.json();
        console.log(`✅ Activation code verified!`);
        console.log(`   User: ${verifyResult.user.name}`);
        console.log(`   Activated: ${verifyResult.user.activated}\n`);

        // Step 3: User sets new password and completes activation
        console.log('🔑 Step 3: User setting new password...');
        const activateResponse = await fetch(`${API_URL}/vt-activate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            vtEmail: testUser.vtEmail,
            activationCode: activationCode,
            newPassword: "MyNewPassword123"
          })
        });

        if (activateResponse.ok) {
          const activateResult = await activateResponse.json();
          console.log(`✅ User activated successfully!`);
          console.log(`   User: ${activateResult.user.name}`);
          console.log(`   Activated: ${activateResult.user.activated}`);
          console.log(`   Password: Updated to user's choice\n`);
        } else {
          const error = await activateResponse.json();
          console.log(`❌ Activation failed: ${error.error}\n`);
        }
      } else {
        const error = await verifyResponse.json();
        console.log(`❌ Code verification failed: ${error.error}\n`);
      }
    } else {
      const error = await importResponse.json();
      console.log(`❌ Import failed: ${error.error}\n`);
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}\n`);
  }

  console.log('🎉 VT activation flow test complete!');
}

// Run the test
testVTFlow(); 