# 🏍️ RiderApp - The Ultimate Motorcycle Companion

A comprehensive React Native mobile application designed specifically for motorcycle riders, featuring AI-powered assistance, real-time ride tracking, emergency crash reporting, local music streaming, and advanced safety features.

## 🚀 Features

### 🎯 Core Functionality
- **Real-time Ride Tracking**: GPS-based ride monitoring with speed, distance, and route tracking
- **AI-Powered Assistant**: RIDER-X AI companion with voice capabilities and real-time coaching
- **Emergency Crash Reporting**: Instant crash detection and emergency contact notification
- **Local Music Streaming**: Stream music from your PC to your mobile device
- **Ride History**: Comprehensive ride analytics and performance tracking
- **Safety Features**: Speed alerts, weather warnings, and emergency assistance

### 🤖 AI Assistant (RIDER-X)
- **Badass Personality**: Confident, experienced rider attitude with real motorcycle knowledge
- **Voice Capabilities**: Text-to-speech with real-time alerts and coaching
- **Performance Analysis**: Real-time speed, distance, and safety scoring
- **Emergency Voice**: Critical alerts during dangerous situations
- **Weather Integration**: Location-based weather advice and safety tips

### 🎵 Music System
- **Local PC Music Server**: Stream music directly from your computer
- **Multiple Audio Formats**: Supports MP3, WAV, M4A, FLAC, OGG
- **Real-time Streaming**: Low-latency audio streaming over local network
- **Playlist Management**: Create and manage custom playlists
- **Background Playback**: Music continues during ride tracking

### 🚨 Emergency Features
- **Crash Detection**: Automatic crash detection with GPS location
- **Emergency Contacts**: Manage and notify emergency contacts
- **Multi-channel Notifications**: Email, SMS, and in-app alerts
- **Crash History**: Track and review past incidents
- **Emergency Assistance**: Step-by-step guidance during emergencies

### 📊 Analytics & Tracking
- **Ride Statistics**: Distance, duration, average speed, max speed
- **Performance Metrics**: Safety scores and improvement tracking
- **Route Visualization**: GPS route mapping and analysis
- **Achievement System**: Unlock milestones and achievements
- **Progress Tracking**: Long-term performance monitoring

## 🏗️ Architecture

### Frontend (React Native)
```
src/
├── components/          # Reusable UI components
│   └── MusicPlayer.tsx # Music streaming component
├── screens/            # Main application screens
│   ├── HomeScreen.tsx
│   ├── RideTrackingScreen.tsx
│   ├── RideHistoryScreen.tsx
│   ├── MusicScreen.tsx
│   ├── SettingsScreen.tsx
│   ├── CrashReportScreen.tsx
│   ├── EmergencyContactsScreen.tsx
│   ├── CrashHistoryScreen.tsx
│   └── AIChatScreen.tsx
├── utils/              # Utility services
│   ├── AIService.ts    # OpenAI integration
│   ├── DataManager.ts  # Local data management
│   ├── EmergencyManager.ts # Emergency notifications
│   ├── MusicManager.ts # Music streaming logic
│   └── VoiceService.ts # Text-to-speech
├── config/             # Configuration files
│   └── serverConfig.ts # Server endpoints
└── types/              # TypeScript type definitions
    └── index.ts
```

### Backend (Node.js Music Server)
```
music-server.js         # Express.js music streaming server
music-server-package.json # Server dependencies
music/                  # Local music files directory
```

## 🛠️ Technology Stack

### Frontend
- **React Native**: Cross-platform mobile development
- **Expo**: Development platform and tools
- **TypeScript**: Type-safe JavaScript
- **React Navigation**: Screen navigation
- **Expo Location**: GPS tracking
- **Expo AV**: Audio playback
- **Expo Speech**: Text-to-speech
- **React Native Maps**: Map visualization

### Backend
- **Node.js**: Server runtime
- **Express.js**: Web server framework
- **CORS**: Cross-origin resource sharing
- **Multer**: File upload handling
- **File System**: Local file management

### AI & Services
- **OpenAI API**: GPT-4 powered AI assistant
- **SendGrid**: Email notifications
- **Twilio**: SMS notifications
- **Gmail SMTP**: Alternative email service

## 📱 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### 1. Clone and Install
```bash
# Clone the repository
git clone <repository-url>
cd RiderApp

# Install dependencies
npm install
```

### 2. Music Server Setup
```bash
# Install music server dependencies
npm install express cors multer

# Start the music server
node music-server.js
```

### 3. Configure Server URL
Update `src/config/serverConfig.ts` with your PC's IP address:
```typescript
export const SERVER_CONFIG = {
  MUSIC_SERVER_URL: 'http://YOUR_PC_IP:3001', // Replace with your IP
  // ... other config
};
```

### 4. AI Assistant Setup
1. Get OpenAI API key from [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Configure in app: Settings → AI Assistant → OpenAI API Key
3. Enable voice features in ride tracking

### 5. Emergency Notifications Setup
Choose one of the following notification services:

#### SendGrid (Email - Recommended)
```typescript
// In EmergencyManager.ts
sendgrid: {
  apiKey: 'YOUR_SENDGRID_API_KEY',
  fromEmail: 'your-verified-email@gmail.com'
}
```

#### Twilio (SMS)
```typescript
// In EmergencyManager.ts
twilio: {
  accountSid: 'YOUR_TWILIO_ACCOUNT_SID',
  authToken: 'YOUR_TWILIO_AUTH_TOKEN',
  fromNumber: '+1234567890'
}
```

### 6. Add Music Files
1. Create a `music` folder in the project root
2. Copy your audio files (MP3, WAV, M4A, FLAC, OGG) into the folder
3. The server will automatically detect and serve these files

### 7. Start the Application
```bash
# Start Expo development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run on web
npm run web
```

## 🎮 Usage Guide

### Getting Started
1. **Launch the App**: Open RiderApp on your mobile device
2. **Configure Settings**: Set up AI assistant and emergency contacts
3. **Start Music Server**: Ensure your PC music server is running
4. **Begin Tracking**: Tap "Start Ride" to begin tracking

### Ride Tracking
1. **Start Ride**: Tap "Start Ride" button
2. **Enable AI Voice**: Toggle AI voice for real-time coaching
3. **Monitor Performance**: View real-time speed and distance
4. **Get Coaching**: Tap "Get Coaching" for AI advice
5. **End Ride**: Tap "End Ride" to finish tracking

### AI Assistant Features
- **Chat Interface**: Ask questions about riding techniques
- **Real-time Coaching**: Get voice feedback during rides
- **Performance Analysis**: Receive detailed ride statistics
- **Emergency Help**: Get step-by-step assistance
- **Weather Advice**: Location-based weather safety tips

### Music Streaming
1. **Connect to Server**: Ensure PC music server is running
2. **Browse Music**: View available songs from your PC
3. **Play Music**: Tap songs to start playback
4. **Background Play**: Music continues during ride tracking
5. **Volume Control**: Adjust volume for helmet use

### Emergency Features
1. **Add Contacts**: Add emergency contacts with phone/email
2. **Test Notifications**: Send test messages to verify setup
3. **Crash Reporting**: Automatic crash detection and reporting
4. **Emergency Alerts**: Real-time safety warnings
5. **Crash History**: Review past incidents and reports

## 🔧 Configuration

### Server Configuration
```typescript
// src/config/serverConfig.ts
export const SERVER_CONFIG = {
  MUSIC_SERVER_URL: 'http://192.168.1.71:3001',
  FALLBACK_URLS: ['http://localhost:3001', 'http://127.0.0.1:3001'],
  HEALTH_ENDPOINT: '/api/health',
  SONGS_ENDPOINT: '/api/songs',
};
```

### AI Assistant Settings
- **Model Selection**: Choose AI model (gpt-4o-mini recommended)
- **Temperature**: Adjust creativity vs consistency
- **Voice Settings**: Speech rate, volume, and voice selection
- **Real-time Data**: Enable/disable live data integration

### Emergency Notification Settings
- **Email Service**: Configure SendGrid or Gmail SMTP
- **SMS Service**: Configure Twilio for text messages
- **Test Notifications**: Verify setup with test messages
- **Contact Management**: Add and manage emergency contacts

## 🚨 Safety Features

### Automatic Alerts
- **Speed Warnings**: Alerts when exceeding safe speeds
- **Fuel Alerts**: Warns when fuel gets low
- **Weather Warnings**: Advises on weather conditions
- **Emergency Assistance**: Step-by-step help in emergencies

### Real-time Monitoring
- **Performance Tracking**: Monitors speed, distance, safety
- **Route Analysis**: Suggests safer routes
- **Condition Assessment**: Evaluates riding conditions
- **Progress Tracking**: Shows improvement over time

## 🏆 Achievement System

Unlock achievements as you ride:
- **First Ride**: Complete your first tracked ride
- **Speed Demon**: Maintain 100+ km/h for 10 minutes
- **Distance Master**: Complete 1000 km total
- **Safety First**: Complete 10 rides with 9+ safety score
- **Fuel Efficient**: Complete ride with 50+ mpg average
- **Weather Warrior**: Ride in rain/snow conditions
- **Night Rider**: Complete ride after sunset
- **Weekend Warrior**: Ride 5 days in a row

## 🔍 Troubleshooting

### Common Issues

#### Music Server Connection
- **Can't connect**: Ensure PC and phone are on same WiFi network
- **No songs showing**: Check that music folder exists and contains audio files
- **Server not starting**: Verify port 3001 is not in use

#### AI Assistant Issues
- **No AI responses**: Check OpenAI API key configuration
- **Voice not working**: Verify text-to-speech permissions
- **Real-time data issues**: Check location permissions

#### Emergency Notifications
- **Email not sending**: Verify SendGrid API key and sender email
- **SMS not sending**: Check Twilio credentials and phone number
- **Test fails**: Review console logs for detailed error messages

### Network Configuration
- **Find PC IP**: Run `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
- **Update Server URL**: Change IP address in `serverConfig.ts`
- **Test Connection**: Use health endpoint to verify connectivity

## 📊 Performance & Analytics

### Ride Statistics
- **Distance**: Total distance traveled
- **Duration**: Ride time and breaks
- **Speed**: Average, maximum, and current speed
- **Safety Score**: Overall safety rating
- **Fuel Efficiency**: MPG and range calculations

### AI Analytics
- **Performance Trends**: Track improvement over time
- **Safety Analysis**: Identify risk factors
- **Route Optimization**: Suggest better routes
- **Weather Impact**: Analyze weather effects on performance

## 🔒 Privacy & Security

### Data Handling
- **Local Storage**: Ride data stored locally on device
- **Optional Cloud**: Choose to sync data to cloud services
- **Encrypted Storage**: Sensitive data encrypted at rest
- **Privacy Controls**: User controls over data sharing

### Emergency Data
- **Crash Reports**: Stored locally with optional cloud backup
- **Contact Information**: Encrypted emergency contact storage
- **Location Data**: GPS data used only for safety features
- **Notification Logs**: Audit trail of emergency notifications

## 🚀 Deployment

### Development
```bash
# Start development server
npm start

# Run on specific platform
npm run android
npm run ios
npm run web
```

### Production Build
```bash
# Build for Android
expo build:android

# Build for iOS
expo build:ios

# Build for web
expo build:web
```

### Music Server Deployment
```bash
# Install PM2 for process management
npm install -g pm2

# Start server with PM2
pm2 start music-server.js --name "riderapp-music"

# Monitor server
pm2 status
pm2 logs riderapp-music
```

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

### Code Style
- Use TypeScript for type safety
- Follow React Native best practices
- Add JSDoc comments for functions
- Use meaningful variable and function names

### Testing
- Test on both Android and iOS devices
- Verify music server functionality
- Test emergency notification systems
- Validate AI assistant responses

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **OpenAI**: For providing the AI assistant capabilities
- **Expo**: For the excellent React Native development platform
- **React Native Community**: For the amazing ecosystem of libraries
- **Motorcycle Community**: For inspiration and feedback

## 📞 Support

For support and questions:
- **Issues**: Create an issue on GitHub
- **Documentation**: Check the setup instructions and AI demo files
- **Community**: Join our Discord server for help and discussions

---

**Ready to ride with the ultimate motorcycle companion? RiderApp has got your back! 🏍️💪** 