# Music Server Setup Guide

## 🎵 Quick Fix for Demo Mode

If your music player is still in demo mode, follow these steps:

### Step 1: Find Your PC's IP Address

**Windows:**
1. Open Command Prompt
2. Type: `ipconfig`
3. Look for "IPv4 Address" - it will look like `192.168.1.xxx`

**Mac/Linux:**
1. Open Terminal
2. Type: `ifconfig` or `ip addr`
3. Look for your local IP address

### Step 2: Update the IP Address

1. Open `RiderApp/src/config/serverConfig.ts`
2. Find this line:
   ```javascript
   MUSIC_SERVER_URL: 'http://192.168.1.100:3001', // Change this to your PC's IP
   ```
3. Replace `192.168.1.100` with your actual IP address
4. Save the file

### Step 3: Restart the App

1. Stop your Expo app (Ctrl+C)
2. Restart it: `npx expo start`
3. The music player should now connect to your server

## 🔧 Troubleshooting

### Still in Demo Mode?

1. **Check your IP address** - Make sure you're using the correct IP
2. **Check the server** - Make sure `node music-server.js` is running
3. **Check the music folder** - Make sure you have MP3 files in the `music` folder
4. **Check the network** - Make sure your phone and PC are on the same WiFi

### Test the Connection

1. Open your browser on your phone
2. Go to: `http://YOUR_IP:3001/api/songs`
3. You should see a JSON list of your songs

### Common IP Addresses

- `192.168.1.xxx` (most common)
- `192.168.0.xxx`
- `10.0.0.xxx`
- `172.16.xxx.xxx`

## 📱 Quick Test

1. Start your music server: `node music-server.js`
2. Add some MP3 files to the `music` folder
3. Update the IP in `serverConfig.ts`
4. Restart your app
5. Tap the music player info to see connection status

The app will now try multiple URLs and automatically connect to the working one! 