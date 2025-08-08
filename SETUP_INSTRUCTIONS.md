# Rider App Setup Instructions

## 🎵 Local Music Server Setup

### Step 1: Install Dependencies
```bash
# Navigate to the RiderApp directory
cd RiderApp

# Install music server dependencies
npm install express cors multer
# or if you have the package.json file:
npm install
```

### Step 2: Start the Music Server

**Option A: Using the Batch File (Windows)**
```bash
# Double-click the batch file or run from command prompt
start-music-server.bat
```

**Option B: Using PowerShell (Windows)**
```powershell
# Run PowerShell script
.\start-music-server.ps1

# Or install dependencies and start
.\start-music-server.ps1 -Install

# Or show help
.\start-music-server.ps1 -Help
```

**Option C: Manual Start**
```bash
# Start the music server manually
node music-server.js
```

### Step 3: Find Your PC's IP Address
- **Windows**: Run `ipconfig` in Command Prompt
- **Mac/Linux**: Run `ifconfig` or `ip addr` in Terminal
- Look for your local IP (usually starts with 192.168.x.x or 10.0.x.x)

### Step 4: Update the Mobile App
In `RiderApp/src/components/MusicPlayer.tsx`, change line 25:
```javascript
const SERVER_URL = 'http://YOUR_PC_IP:3001'; // Replace YOUR_PC_IP with your actual IP
```

### Step 5: Add Music Files
1. Create a `music` folder in the RiderApp directory
2. Copy your MP3, WAV, M4A, FLAC, or OGG files into this folder
3. The server will automatically detect and serve these files

### Step 6: Test the Connection
1. Start the music server
2. Open your mobile app
3. The music player should show "Connected to PC Music Server"
4. Your songs should appear in the player

## 🚨 Emergency Notifications Setup

### Option 1: SendGrid (Recommended for Email)

1. **Sign up for SendGrid**:
   - Go to https://sendgrid.com
   - Create a free account (100 emails/day free)
   - Verify your sender email address

2. **Get your API Key**:
   - Go to Settings > API Keys
   - Create a new API Key with "Mail Send" permissions
   - Copy the API key

3. **Update the EmergencyManager**:
   In `RiderApp/src/utils/EmergencyManager.ts`, update lines 15-18:
   ```javascript
   sendgrid: {
     apiKey: 'YOUR_SENDGRID_API_KEY', // Replace with your actual API key
     fromEmail: 'your-verified-email@gmail.com' // Replace with your verified email
   }
   ```

### Option 2: Twilio (For SMS)

1. **Sign up for Twilio**:
   - Go to https://twilio.com
   - Create a free account
   - Get a Twilio phone number

2. **Get your credentials**:
   - Find your Account SID and Auth Token in the Twilio Console
   - Note your Twilio phone number

3. **Update the EmergencyManager**:
   In `RiderApp/src/utils/EmergencyManager.ts`, update lines 25-29:
   ```javascript
   twilio: {
     accountSid: 'YOUR_TWILIO_ACCOUNT_SID', // Replace with your Account SID
     authToken: 'YOUR_TWILIO_AUTH_TOKEN', // Replace with your Auth Token
     fromNumber: '+1234567890' // Replace with your Twilio phone number
   }
   ```

### Option 3: Gmail SMTP (Alternative for Email)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Security > 2-Step Verification > App passwords
   - Generate a password for "Mail"

3. **Update the EmergencyManager**:
   In `RiderApp/src/utils/EmergencyManager.ts`, update lines 8-14:
   ```javascript
   smtp: {
     host: 'smtp.gmail.com',
     port: 587,
     secure: false,
     auth: {
       user: 'your-email@gmail.com', // Replace with your Gmail
       pass: 'your-app-password' // Replace with your app password
     }
   }
   ```

## 🧪 Testing the Setup

### Test Music Server
1. Start the music server: `node music-server.js`
2. Open your mobile app
3. The music player should connect and show your songs
4. Try playing/pausing songs

### Test Emergency Notifications
1. Add an emergency contact in the app
2. Tap the warning icon (⚠️) next to the contact
3. Choose "Send Test" to send a test notification
4. Check your email/SMS for the test message

## 🔧 Troubleshooting

### Music Server Issues
- **Can't connect**: Make sure your PC and phone are on the same WiFi network
- **No songs showing**: Check that the `music` folder exists and contains audio files
- **Server not starting**: Make sure port 3001 is not in use by another application

### Emergency Notification Issues
- **Email not sending**: Check your SendGrid API key and sender email verification
- **SMS not sending**: Verify your Twilio credentials and phone number
- **Test fails**: Check the console logs for detailed error messages

## 📱 Mobile App Configuration

### Network Permissions
Make sure your app has internet permissions in `app.json`:
```json
{
  "expo": {
    "android": {
      "permissions": ["INTERNET", "ACCESS_NETWORK_STATE"]
    }
  }
}
```

### Server URL Configuration
Update the server URL in the MusicPlayer component to match your PC's IP address. The app will automatically fall back to demo mode if the server is not available.

## 🚀 Production Deployment

For production use:
1. Use a proper email service (SendGrid, AWS SES)
2. Use a proper SMS service (Twilio, AWS SNS)
3. Host the music server on a cloud service
4. Add proper error handling and retry logic
5. Implement rate limiting for notifications 