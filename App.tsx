import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import RideTrackingScreen from './src/screens/RideTrackingScreen';
import RideHistoryScreen from './src/screens/RideHistoryScreen';
import RideDetailsScreen from './src/screens/RideDetailsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import MusicScreen from './src/screens/MusicScreen';
import CrashReportScreen from './src/screens/CrashReportScreen';
import EmergencyContactsScreen from './src/screens/EmergencyContactsScreen';
import CrashHistoryScreen from './src/screens/CrashHistoryScreen';
import AIChatScreen from './src/screens/AIChatScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Track Ride') {
            iconName = focused ? 'navigate' : 'navigate-outline';
          } else if (route.name === 'History') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Music') {
            iconName = focused ? 'musical-notes' : 'musical-notes-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: 'gray',
        headerStyle: {
          backgroundColor: '#1f2937',
        },
        headerTintColor: '#fff',
        tabBarStyle: {
          backgroundColor: '#1f2937',
          borderTopColor: '#374151',
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Track Ride" component={RideTrackingScreen} />
      <Tab.Screen name="History" component={RideHistoryScreen} />
      <Tab.Screen name="Music" component={MusicScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator>
        <Stack.Screen 
          name="Main" 
          component={TabNavigator} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="RideDetails" 
          component={RideDetailsScreen}
          options={{
            title: 'Ride Details',
            headerStyle: { backgroundColor: '#1f2937' },
            headerTintColor: '#fff',
          }}
        />
        <Stack.Screen 
          name="CrashReport" 
          component={CrashReportScreen}
          options={{
            title: 'Report Crash',
            headerStyle: { backgroundColor: '#1f2937' },
            headerTintColor: '#fff',
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="EmergencyContacts" 
          component={EmergencyContactsScreen}
          options={{
            title: 'Emergency Contacts',
            headerStyle: { backgroundColor: '#1f2937' },
            headerTintColor: '#fff',
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="CrashHistory" 
          component={CrashHistoryScreen}
          options={{
            title: 'Crash History',
            headerStyle: { backgroundColor: '#1f2937' },
            headerTintColor: '#fff',
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="AIChat" 
          component={AIChatScreen}
          options={{
            title: 'RiderAI Assistant',
            headerStyle: { backgroundColor: '#1f2937' },
            headerTintColor: '#fff',
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
