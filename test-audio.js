// Test script to verify audio playback functionality
const fetch = require('node-fetch');

async function testAudioPlayback() {
  console.log('🎵 Testing Audio Playback...\n');
  
  try {
    // Test server connection
    console.log('1. Testing server connection...');
    const response = await fetch('http://localhost:3001/api/songs');
    
    if (response.ok) {
      const songs = await response.json();
      console.log(`✅ Server connected! Found ${songs.length} songs`);
      
      if (songs.length > 0) {
        const firstSong = songs[0];
        console.log(`\n2. Testing first song: "${firstSong.title}"`);
        console.log(`   Artist: ${firstSong.artist}`);
        console.log(`   URI: ${firstSong.uri}`);
        
        // Test if the audio file is accessible
        console.log('\n3. Testing audio file accessibility...');
        const audioResponse = await fetch(firstSong.uri);
        
        if (audioResponse.ok) {
          console.log('✅ Audio file is accessible');
          console.log(`   Content-Type: ${audioResponse.headers.get('content-type')}`);
          console.log(`   Content-Length: ${audioResponse.headers.get('content-length')} bytes`);
        } else {
          console.log('❌ Audio file is not accessible');
          console.log(`   Status: ${audioResponse.status}`);
        }
      } else {
        console.log('❌ No songs found on server');
      }
    } else {
      console.log('❌ Server not responding');
      console.log(`   Status: ${response.status}`);
    }
    
  } catch (error) {
    console.error('❌ Error testing audio playback:', error.message);
  }
  
  console.log('\n📱 To test on your mobile device:');
  console.log('1. Make sure your phone and PC are on the same network');
  console.log('2. Update the IP address in src/config/serverConfig.ts');
  console.log('3. Run the app and try playing a song');
  console.log('4. Check the console for any error messages');
}

testAudioPlayback(); 