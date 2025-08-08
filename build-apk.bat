@echo off
echo Building RiderApp APK...

echo Step 1: Installing dependencies...
call npm install

echo Step 2: Trying EAS build...
call eas build -p android --profile preview --non-interactive

echo Build complete! Check the EAS dashboard for your APK download link.
pause
