const fs = require('fs');
const path = require('path');

console.log('🚀 Creating RiderApp APK...');

// Create a simple APK manifest
const manifest = {
  name: 'RiderApp',
  version: '1.0.0',
  package: 'com.riderapp',
  permissions: [
    'android.permission.ACCESS_FINE_LOCATION',
    'android.permission.ACCESS_COARSE_LOCATION',
    'android.permission.READ_EXTERNAL_STORAGE',
    'android.permission.RECORD_AUDIO'
  ]
};

// Write manifest
fs.writeFileSync('app-manifest.json', JSON.stringify(manifest, null, 2));

console.log('✅ Manifest created');
console.log('');
console.log('📱 To get your APK:');
console.log('1. Go to: https://build.phonegap.com/');
console.log('2. Upload your project folder');
console.log('3. Download the APK');
console.log('');
console.log('🔗 Alternative: Use Expo Go app');
console.log('1. Install "Expo Go" from Play Store');
console.log('2. Run: npx expo start --tunnel');
console.log('3. Scan QR code with Expo Go');
console.log('');
console.log('🎯 Quickest way:');
console.log('1. Install "Expo Go" app on your phone');
console.log('2. Run: npx expo start');
console.log('3. Scan the QR code');
console.log('4. Your app will load directly on your phone!');
