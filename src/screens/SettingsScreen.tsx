import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DataManager from '../utils/DataManager';
import AIService from '../utils/AIService';

interface SettingItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: string;
  type: 'toggle' | 'navigate' | 'action' | 'input';
  value?: boolean | string;
  onPress?: () => void;
  onChangeText?: (text: string) => void;
}

export default function SettingsScreen({ navigation }: { navigation: any }) {
  const dataManager = DataManager.getInstance();
  const aiService = AIService.getInstance();
  
  const [settings, setSettings] = useState(dataManager.getSettings());
  const [fuelSettings, setFuelSettings] = useState(dataManager.getFuelSettings());
  const [aiSettings, setAiSettings] = useState(aiService.getSettings());

  useEffect(() => {
    const handleDataChange = () => {
      setSettings(dataManager.getSettings());
      setFuelSettings(dataManager.getFuelSettings());
    };

    dataManager.addListener(handleDataChange);
    
    // Load initial data
    dataManager.loadData().then(() => {
      setSettings(dataManager.getSettings());
      setFuelSettings(dataManager.getFuelSettings());
    });

    return () => {
      dataManager.removeListener(handleDataChange);
    };
  }, []);

  const toggleSetting = (key: keyof typeof settings) => {
    const newSettings = {
      ...settings,
      [key]: !settings[key],
    };
    setSettings(newSettings);
    dataManager.updateSettings(newSettings);
  };

  const updateFuelSetting = (key: keyof typeof fuelSettings, value: string) => {
    const newFuelSettings = {
      ...fuelSettings,
      [key]: value,
    };
    setFuelSettings(newFuelSettings);
    dataManager.updateFuelSettings(newFuelSettings);
  };

  const updateAISetting = (key: keyof typeof aiSettings, value: string | number) => {
    const newAiSettings = {
      ...aiSettings,
      [key]: value,
    };
    setAiSettings(newAiSettings);
    aiService.updateSettings(newAiSettings);
  };

  const calculateRange = () => {
    return dataManager.calculateFuelRange().toFixed(0);
  };

  const calculateLowFuelRange = () => {
    return dataManager.calculateLowFuelRange().toFixed(0);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: () => console.log('Logged out') },
      ]
    );
  };

  const handleDeleteData = () => {
    Alert.alert(
      'Delete All Data',
      'This will permanently delete all your ride data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: () => {
            dataManager.deleteAllRides();
            Alert.alert('Success', 'All ride data has been deleted.');
          }
        },
      ]
    );
  };

  const settingsSections = [
    {
      title: 'Fuel & Range',
      items: [
        {
          id: 'tankCapacity',
          title: 'Tank Capacity',
          subtitle: `${fuelSettings.tankCapacity} gallons`,
          icon: 'water',
          type: 'input' as const,
          value: fuelSettings.tankCapacity,
          onChangeText: (text: string) => updateFuelSetting('tankCapacity', text),
        },
        {
          id: 'currentFuel',
          title: 'Current Fuel Level',
          subtitle: `${fuelSettings.currentFuel} gallons`,
          icon: 'speedometer',
          type: 'input' as const,
          value: fuelSettings.currentFuel,
          onChangeText: (text: string) => updateFuelSetting('currentFuel', text),
        },
        {
          id: 'fuelEfficiency',
          title: 'Fuel Efficiency',
          subtitle: `${fuelSettings.fuelEfficiency} mpg`,
          icon: 'analytics',
          type: 'input' as const,
          value: fuelSettings.fuelEfficiency,
          onChangeText: (text: string) => updateFuelSetting('fuelEfficiency', text),
        },
        {
          id: 'range',
          title: 'Current Range',
          subtitle: `${calculateRange()} miles`,
          icon: 'map',
          type: 'navigate' as const,
          onPress: () => {},
        },
        {
          id: 'lowFuelThreshold',
          title: 'Low Fuel Alert',
          subtitle: `${fuelSettings.lowFuelThreshold} gallons (${calculateLowFuelRange()} miles)`,
          icon: 'warning',
          type: 'input' as const,
          value: fuelSettings.lowFuelThreshold,
          onChangeText: (text: string) => updateFuelSetting('lowFuelThreshold', text),
        },
        {
          id: 'fuelAlerts',
          title: 'Fuel Range Alerts',
          subtitle: 'Get notified when fuel is low',
          icon: 'notifications',
          type: 'toggle' as const,
          value: settings.fuelAlerts,
          onPress: () => toggleSetting('fuelAlerts'),
        },
      ],
    },
    {
      title: 'AI Assistant',
      items: [
        {
          id: 'openaiKey',
          title: 'OpenAI API Key',
          subtitle: aiSettings.apiKey ? 'Configured' : 'Not configured',
          icon: 'key',
          type: 'input' as const,
          value: aiSettings.apiKey,
          onChangeText: (text: string) => updateAISetting('apiKey', text),
        },
        {
          id: 'aiModel',
          title: 'AI Model',
          subtitle: aiSettings.model,
          icon: 'brain',
          type: 'input' as const,
          value: aiSettings.model,
          onChangeText: (text: string) => updateAISetting('model', text),
        },
        {
          id: 'aiChat',
          title: 'RiderAI Chat',
          subtitle: 'Chat with your AI riding assistant',
          icon: 'chatbubble-ellipses',
          type: 'navigate' as const,
          onPress: () => navigation.navigate('AIChat'),
        },
        {
          id: 'aiInsights',
          title: 'AI Ride Insights',
          subtitle: 'Get AI-powered ride analysis',
          icon: 'analytics',
          type: 'toggle' as const,
          value: settings.aiInsights || false,
          onPress: () => toggleSetting('aiInsights'),
        },
      ],
    },
    {
      title: 'Tracking',
      items: [
        {
          id: 'autoStart',
          title: 'Auto-start tracking',
          subtitle: 'Automatically start tracking when you begin riding',
          icon: 'play',
          type: 'toggle' as const,
          value: settings.autoStart,
          onPress: () => toggleSetting('autoStart'),
        },
        {
          id: 'backgroundTracking',
          title: 'Background tracking',
          subtitle: 'Continue tracking when app is in background',
          icon: 'phone-portrait',
          type: 'toggle' as const,
          value: settings.backgroundTracking,
          onPress: () => toggleSetting('backgroundTracking'),
        },
        {
          id: 'autoSave',
          title: 'Auto-save rides',
          subtitle: 'Automatically save completed rides',
          icon: 'save',
          type: 'toggle' as const,
          value: settings.autoSave,
          onPress: () => toggleSetting('autoSave'),
        },
      ],
    },
    {
      title: 'Safety & Emergency',
      items: [
        {
          id: 'emergencyContacts',
          title: 'Emergency Contacts',
          subtitle: 'Manage emergency contact list',
          icon: 'people',
          type: 'navigate' as const,
          onPress: () => navigation.navigate('EmergencyContacts'),
        },
        {
          id: 'crashHistory',
          title: 'Crash History',
          subtitle: 'View past crash reports',
          icon: 'document-text',
          type: 'navigate' as const,
          onPress: () => navigation.navigate('CrashHistory'),
        },
        {
          id: 'autoEmergency',
          title: 'Auto-emergency alerts',
          subtitle: 'Automatically notify contacts on crash',
          icon: 'warning',
          type: 'toggle' as const,
          value: settings.autoEmergency || false,
          onPress: () => toggleSetting('autoEmergency'),
        },
      ],
    },
    {
      title: 'Notifications',
      items: [
        {
          id: 'notifications',
          title: 'Push notifications',
          subtitle: 'Receive ride reminders and updates',
          icon: 'notifications',
          type: 'toggle' as const,
          value: settings.notifications,
          onPress: () => toggleSetting('notifications'),
        },
      ],
    },
    {
      title: 'Appearance',
      items: [
        {
          id: 'darkMode',
          title: 'Dark mode',
          subtitle: 'Use dark theme',
          icon: 'moon',
          type: 'toggle' as const,
          value: settings.darkMode,
          onPress: () => toggleSetting('darkMode'),
        },
      ],
    },
    {
      title: 'Data & Privacy',
      items: [
        {
          id: 'exportData',
          title: 'Export data',
          subtitle: 'Download all your ride data',
          icon: 'download',
          type: 'navigate' as const,
          onPress: () => Alert.alert('Export', 'Exporting data...'),
        },
        {
          id: 'privacy',
          title: 'Privacy settings',
          subtitle: 'Manage data sharing and privacy',
          icon: 'shield-checkmark',
          type: 'navigate' as const,
          onPress: () => Alert.alert('Privacy', 'Privacy settings...'),
        },
      ],
    },
    {
      title: 'Account',
      items: [
        {
          id: 'profile',
          title: 'Edit profile',
          subtitle: 'Update your personal information',
          icon: 'person',
          type: 'navigate' as const,
          onPress: () => Alert.alert('Profile', 'Edit profile...'),
        },
        {
          id: 'logout',
          title: 'Logout',
          subtitle: 'Sign out of your account',
          icon: 'log-out',
          type: 'action' as const,
          onPress: handleLogout,
        },
      ],
    },
    {
      title: 'Danger Zone',
      items: [
        {
          id: 'deleteData',
          title: 'Delete all data',
          subtitle: 'Permanently delete all ride data',
          icon: 'trash',
          type: 'action' as const,
          onPress: handleDeleteData,
        },
      ],
    },
  ];

  const renderSettingItem = (item: SettingItem) => (
    <TouchableOpacity
      key={item.id}
      style={styles.settingItem}
      onPress={item.onPress}
      disabled={item.type === 'toggle' || item.type === 'input'}
    >
      <View style={styles.settingLeft}>
        <Ionicons name={item.icon as any} size={24} color="#6b7280" />
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{item.title}</Text>
          {item.subtitle && (
            <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
          )}
        </View>
      </View>
      
      {item.type === 'toggle' ? (
        <Switch
          value={item.value as boolean}
          onValueChange={item.onPress}
          trackColor={{ false: '#374151', true: '#2563eb' }}
          thumbColor={item.value ? '#ffffff' : '#9ca3af'}
        />
      ) : item.type === 'input' ? (
        <TextInput
          style={styles.input}
          value={item.value as string}
          onChangeText={item.onChangeText}
          keyboardType="numeric"
          placeholder="0"
          placeholderTextColor="#6b7280"
        />
      ) : (
        <Ionicons name="chevron-forward" size={20} color="#6b7280" />
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Customize your ride tracking experience</Text>
      </View>

      {settingsSections.map((section, sectionIndex) => (
        <View key={sectionIndex} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <View style={styles.sectionContent}>
            {section.items.map(renderSettingItem)}
          </View>
        </View>
      ))}

      <View style={styles.footer}>
        <Text style={styles.versionText}>RiderApp v1.0.0</Text>
        <Text style={styles.copyrightText}>© 2024 RiderApp. All rights reserved.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9ca3af',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  sectionContent: {
    backgroundColor: '#1f2937',
    marginHorizontal: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 12,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 2,
  },
  input: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'right',
    minWidth: 60,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  copyrightText: {
    fontSize: 12,
    color: '#6b7280',
  },
}); 