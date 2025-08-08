import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  TextInput,
  Dimensions,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import { EmergencyManager } from '../utils/EmergencyManager';
import { EmergencyContact, CrashReport, CrashReportForm } from '../types';

const { width, height } = Dimensions.get('window');

interface RideStats {
  distance: number;
  duration: number;
  averageSpeed: number;
  maxSpeed: number;
}

export default function CrashReportScreen({ 
  navigation, 
  route 
}: { 
  navigation: any; 
  route: { params?: { rideStats?: RideStats } } 
}) {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [address, setAddress] = useState<string>('');
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CrashReportForm>({
    userStatus: 'ok',
    details: '',
    notifyEmergencyContacts: true,
  });

  useEffect(() => {
    loadEmergencyContacts();
    getCurrentLocation();
  }, []);

  const loadEmergencyContacts = async () => {
    const contacts = await EmergencyManager.getEmergencyContacts();
    setEmergencyContacts(contacts);
  };

  const getCurrentLocation = async () => {
    try {
      const currentLocation = await EmergencyManager.getCurrentLocation();
      if (currentLocation) {
        setLocation(currentLocation);
        
        // Get address from coordinates
        const addressResult = await EmergencyManager.getAddressFromCoordinates(
          currentLocation.coords.latitude,
          currentLocation.coords.longitude
        );
        if (addressResult) {
          setAddress(addressResult);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to get current location');
    }
  };

  const handleSubmitCrashReport = async () => {
    if (!location) {
      Alert.alert('Error', 'Unable to get location. Please try again.');
      return;
    }

    if (!formData.details.trim()) {
      Alert.alert('Error', 'Please provide details about the crash.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create crash report
      const crashReport: CrashReport = {
        id: Date.now().toString(),
        timestamp: new Date(),
        location: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          address: address,
        },
        userStatus: formData.userStatus,
        details: formData.details,
        mapImage: await EmergencyManager.captureMapScreenshot(),
        emergencyContactsNotified: [],
        rideStats: route.params?.rideStats,
      };

      // Save crash report
      await EmergencyManager.saveCrashReport(crashReport);

      // Notify emergency contacts if requested
      let notifiedContacts: string[] = [];
      if (formData.notifyEmergencyContacts && emergencyContacts.length > 0) {
        notifiedContacts = await EmergencyManager.notifyEmergencyContacts(
          emergencyContacts,
          crashReport
        );
        
        // Update crash report with notified contacts
        crashReport.emergencyContactsNotified = notifiedContacts;
        await EmergencyManager.saveCrashReport(crashReport);
      }

      Alert.alert(
        'Crash Report Submitted',
        `Your crash report has been saved. ${
          notifiedContacts.length > 0 
            ? `${notifiedContacts.length} emergency contact(s) have been notified.` 
            : 'No emergency contacts were notified.'
        }`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to submit crash report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCallEmergencyContact = (contact: EmergencyContact) => {
    Alert.alert(
      'Call Emergency Contact',
      `Call ${contact.name} at ${contact.phone}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call',
          onPress: () => {
            Linking.openURL(`tel:${contact.phone}`);
          },
        },
      ]
    );
  };

  const handleManageContacts = () => {
    navigation.navigate('EmergencyContacts');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.title}>Crash Report</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Location Map */}
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: location?.coords.latitude || 37.78825,
            longitude: location?.coords.longitude || -122.4324,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          showsUserLocation={true}
        >
          {location && (
            <Marker
              coordinate={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              }}
              title="Crash Location"
              description={address}
            >
              <View style={styles.crashMarker}>
                <Ionicons name="warning" size={20} color="#ffffff" />
              </View>
            </Marker>
          )}
        </MapView>
      </View>

      {/* Location Info */}
      <View style={styles.locationContainer}>
        <Ionicons name="location" size={20} color="#dc2626" />
        <Text style={styles.locationText}>
          {address || `${location?.coords.latitude?.toFixed(6)}, ${location?.coords.longitude?.toFixed(6)}`}
        </Text>
      </View>

      {/* User Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Are you okay?</Text>
        <View style={styles.statusButtons}>
          {[
            { value: 'ok', label: 'I\'m Okay', icon: 'checkmark-circle', color: '#059669' },
            { value: 'injured', label: 'I\'m Injured', icon: 'medical', color: '#dc2626' },
            { value: 'unconscious', label: 'Unconscious', icon: 'alert-circle', color: '#dc2626' },
          ].map((status) => (
            <TouchableOpacity
              key={status.value}
              style={[
                styles.statusButton,
                formData.userStatus === status.value && styles.statusButtonActive,
              ]}
              onPress={() => setFormData({ ...formData, userStatus: status.value as any })}
            >
              <Ionicons 
                name={status.icon as any} 
                size={24} 
                color={formData.userStatus === status.value ? '#ffffff' : status.color} 
              />
              <Text style={[
                styles.statusButtonText,
                formData.userStatus === status.value && styles.statusButtonTextActive,
              ]}>
                {status.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Crash Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Crash Details</Text>
        <TextInput
          style={styles.detailsInput}
          placeholder="Describe what happened..."
          placeholderTextColor="#9ca3af"
          value={formData.details}
          onChangeText={(text) => setFormData({ ...formData, details: text })}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      {/* Emergency Contacts */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Emergency Contacts</Text>
          <TouchableOpacity onPress={handleManageContacts}>
            <Ionicons name="settings" size={20} color="#2563eb" />
          </TouchableOpacity>
        </View>
        
        {emergencyContacts.length > 0 ? (
          <View style={styles.contactsContainer}>
            {emergencyContacts.map((contact) => (
              <View key={contact.id} style={styles.contactItem}>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactName}>{contact.name}</Text>
                  <Text style={styles.contactDetails}>
                    {contact.phone} • {contact.email}
                  </Text>
                  <Text style={styles.contactRelationship}>{contact.relationship}</Text>
                </View>
                <TouchableOpacity
                  style={styles.callButton}
                  onPress={() => handleCallEmergencyContact(contact)}
                >
                  <Ionicons name="call" size={20} color="#ffffff" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.noContactsContainer}>
            <Ionicons name="people" size={48} color="#6b7280" />
            <Text style={styles.noContactsText}>No emergency contacts added</Text>
            <TouchableOpacity style={styles.addContactButton} onPress={handleManageContacts}>
              <Text style={styles.addContactButtonText}>Add Emergency Contacts</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Notification Toggle */}
      <View style={styles.section}>
        <View style={styles.toggleContainer}>
          <Text style={styles.toggleLabel}>Notify emergency contacts</Text>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              formData.notifyEmergencyContacts && styles.toggleButtonActive,
            ]}
            onPress={() => setFormData({
              ...formData,
              notifyEmergencyContacts: !formData.notifyEmergencyContacts,
            })}
          >
            <View style={[
              styles.toggleThumb,
              formData.notifyEmergencyContacts && styles.toggleThumbActive,
            ]} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Submit Button */}
      <View style={styles.submitContainer}>
        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmitCrashReport}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Text style={styles.submitButtonText}>Submitting...</Text>
          ) : (
            <>
              <Ionicons name="send" size={20} color="#ffffff" />
              <Text style={styles.submitButtonText}>Submit Crash Report</Text>
            </>
          )}
        </TouchableOpacity>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 40,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  placeholder: {
    width: 40,
  },
  mapContainer: {
    height: 200,
    margin: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  crashMarker: {
    backgroundColor: '#dc2626',
    borderRadius: 12,
    padding: 8,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  locationText: {
    fontSize: 14,
    color: '#9ca3af',
    marginLeft: 8,
    flex: 1,
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statusButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusButton: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#1f2937',
    marginHorizontal: 4,
  },
  statusButtonActive: {
    backgroundColor: '#2563eb',
  },
  statusButtonText: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 8,
    textAlign: 'center',
  },
  statusButtonTextActive: {
    color: '#ffffff',
  },
  detailsInput: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    color: '#ffffff',
    fontSize: 16,
    minHeight: 100,
  },
  contactsContainer: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  contactDetails: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 2,
  },
  contactRelationship: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  callButton: {
    backgroundColor: '#059669',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noContactsContainer: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#1f2937',
    borderRadius: 12,
  },
  noContactsText: {
    fontSize: 16,
    color: '#9ca3af',
    marginTop: 12,
    marginBottom: 16,
  },
  addContactButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addContactButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1f2937',
    padding: 16,
    borderRadius: 12,
  },
  toggleLabel: {
    fontSize: 16,
    color: '#ffffff',
  },
  toggleButton: {
    width: 50,
    height: 30,
    backgroundColor: '#374151',
    borderRadius: 15,
    padding: 2,
  },
  toggleButtonActive: {
    backgroundColor: '#2563eb',
  },
  toggleThumb: {
    width: 26,
    height: 26,
    backgroundColor: '#ffffff',
    borderRadius: 13,
  },
  toggleThumbActive: {
    transform: [{ translateX: 20 }],
  },
  submitContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dc2626',
    padding: 20,
    borderRadius: 12,
  },
  submitButtonDisabled: {
    backgroundColor: '#6b7280',
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 12,
  },
}); 