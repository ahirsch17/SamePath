# 🎓 VT Integration Guide - SamePath

## 🔄 **Proper Flow (What You Want)**

### **Step 1: VT Website → Your Database**
```
VT Scheduling Website
    ↓ (sends user data)
Your Vercel API
    ↓ (stores in database)
Neon PostgreSQL Database
```

**VT sends this data when students register for classes:**
```json
{
  "vtEmail": "alexishirsch@vt.edu",
  "name": "Alexis Hirsch", 
  "crns": ["83534", "83484", "87290", "83339"]
}
```

### **Step 2: Generate Unique Code & Send Email**
```
Database creates user with:
- vtEmail: "alexishirsch@vt.edu"
- password: "123456" (unique 6-digit code)
- activated: false
- schedule: [CRNs from VT]

↓

Send email to alexishirsch@vt.edu:
"Your SamePath activation code is: 123456"
```

### **Step 3: User Activates Account**
```
User downloads app
    ↓
Enters email: "alexishirsch@vt.edu"
    ↓  
Enters code: "123456"
    ↓
Sets new password: "MyNewPassword123"
    ↓
Account activated! ✅
```

## 🛠️ **Implementation**

### **1. VT Integration Service** ✅
- `VTIntegrationService.ts` handles the flow
- `importVTUserData()` - VT sends data here
- `activateWithCode()` - User enters code
- `completeActivation()` - User sets password

### **2. Database Schema** ✅
```sql
CREATE TABLE users (
  vtEmail VARCHAR PRIMARY KEY,
  name VARCHAR,
  password VARCHAR, -- starts as unique code, then user's password
  activated BOOLEAN DEFAULT false,
  crn1 VARCHAR,
  crn2 VARCHAR,
  -- ... crn8
  matchList TEXT[], -- JSON array
  location VARCHAR
);
```

### **3. Email Integration** 🔄
**Option A: SendGrid (Recommended)**
```typescript
// In VTIntegrationService.ts
private async sendActivationEmail(vtEmail: string, code: string) {
  // Integrate with SendGrid API
  await sendGrid.send({
    to: vtEmail,
    subject: "Welcome to SamePath",
    text: `Your activation code is: ${code}`
  });
}
```

**Option B: VT Email System**
- VT could send the email directly
- Your API just provides the code

## 🚀 **Deployment Steps**

### **1. Deploy Your API**
```bash
cd api
vercel --prod
```

### **2. Set Up Email Service**
- Sign up for SendGrid (free tier)
- Add `SENDGRID_API_KEY` to Vercel environment variables

### **3. VT Integration**
- VT needs to call your API endpoint: `POST /api/vt-import`
- Send user data in the format above
- Your API will generate code and send email

### **4. Update App**
- Replace hardcoded data with API calls
- Add email collection in login flow
- Test activation flow

## 📱 **App Flow**

### **Login Screen:**
```
1. Enter VT Email: [alexishirsch@vt.edu]
2. Enter Code: [123456] 
3. Set Password: [MyNewPassword123]
4. Activate Account ✅
```

### **Database State:**
```
Before: password="123456", activated=false
After:  password="MyNewPassword123", activated=true
```

## 🎯 **Benefits**

✅ **No hardcoded data** - Everything comes from VT  
✅ **Secure activation** - Unique codes per user  
✅ **Real-time sync** - VT schedule updates automatically  
✅ **Scalable** - Handles 40k+ users  
✅ **User control** - Users set their own passwords  

## 🔧 **Next Steps**

1. **Deploy your API** (follow deployment guide)
2. **Set up SendGrid** for email sending
3. **Work with VT** to integrate their system
4. **Test the flow** with sample data
5. **Remove all hardcoded data** from UserDataService

Your vision is perfect! This creates a seamless VT → SamePath integration. 🎉 