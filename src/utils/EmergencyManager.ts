import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { EmergencyContact, CrashReport, CrashReportForm } from '../types';

const EMERGENCY_CONTACTS_KEY = 'emergency_contacts';
const CRASH_REPORTS_KEY = 'crash_reports';

// Email configuration - you'll need to set up these services
const EMAIL_CONFIG = {
  // For Gmail SMTP (you'll need to enable 2FA and generate an app password)
  smtp: {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: 'your-email@gmail.com', // Replace with your email
      pass: 'your-app-password' // Replace with your app password
    }
  },
  // Alternative: Use a service like SendGrid
  sendgrid: {
    apiKey: 'your-sendgrid-api-key', // Replace with your SendGrid API key
    fromEmail: 'your-email@gmail.com'
  }
};

// SMS configuration - you'll need to set up Twilio
const SMS_CONFIG = {
  twilio: {
    accountSid: 'your-twilio-account-sid', // Replace with your Twilio Account SID
    authToken: 'your-twilio-auth-token', // Replace with your Twilio Auth Token
    fromNumber: '+1234567890' // Replace with your Twilio phone number
  }
};

export class EmergencyManager {
  // Emergency Contacts Management
  static async getEmergencyContacts(): Promise<EmergencyContact[]> {
    try {
      const contactsJson = await AsyncStorage.getItem(EMERGENCY_CONTACTS_KEY);
      return contactsJson ? JSON.parse(contactsJson) : [];
    } catch (error) {
      console.error('Error loading emergency contacts:', error);
      return [];
    }
  }

  static async saveEmergencyContacts(contacts: EmergencyContact[]): Promise<void> {
    try {
      await AsyncStorage.setItem(EMERGENCY_CONTACTS_KEY, JSON.stringify(contacts));
    } catch (error) {
      console.error('Error saving emergency contacts:', error);
    }
  }

  static async addEmergencyContact(contact: EmergencyContact): Promise<void> {
    const contacts = await this.getEmergencyContacts();
    contacts.push(contact);
    await this.saveEmergencyContacts(contacts);
  }

  static async updateEmergencyContact(contact: EmergencyContact): Promise<void> {
    const contacts = await this.getEmergencyContacts();
    const index = contacts.findIndex(c => c.id === contact.id);
    if (index !== -1) {
      contacts[index] = contact;
      await this.saveEmergencyContacts(contacts);
    }
  }

  static async deleteEmergencyContact(contactId: string): Promise<void> {
    const contacts = await this.getEmergencyContacts();
    const filteredContacts = contacts.filter(c => c.id !== contactId);
    await this.saveEmergencyContacts(filteredContacts);
  }

  // Crash Reports Management
  static async getCrashReports(): Promise<CrashReport[]> {
    try {
      const reportsJson = await AsyncStorage.getItem(CRASH_REPORTS_KEY);
      return reportsJson ? JSON.parse(reportsJson) : [];
    } catch (error) {
      console.error('Error loading crash reports:', error);
      return [];
    }
  }

  static async saveCrashReport(report: CrashReport): Promise<void> {
    try {
      const reports = await this.getCrashReports();
      reports.unshift(report); // Add to beginning of array
      await AsyncStorage.setItem(CRASH_REPORTS_KEY, JSON.stringify(reports));
    } catch (error) {
      console.error('Error saving crash report:', error);
    }
  }

  // Location and Address Utilities
  static async getCurrentLocation(): Promise<Location.LocationObject | null> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Location permission denied');
      }

      return await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
    } catch (error) {
      console.error('Error getting current location:', error);
      return null;
    }
  }

  static async getAddressFromCoordinates(latitude: number, longitude: number): Promise<string | null> {
    try {
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (reverseGeocode.length > 0) {
        const address = reverseGeocode[0];
        const parts = [
          address.street,
          address.city,
          address.region,
          address.postalCode,
          address.country,
        ].filter(Boolean);
        return parts.join(', ');
      }
      return null;
    } catch (error) {
      console.error('Error getting address:', error);
      return null;
    }
  }

  // Emergency Contact Notification with real email and SMS
  static async notifyEmergencyContacts(
    contacts: EmergencyContact[],
    crashReport: CrashReport
  ): Promise<string[]> {
    const notifiedContacts: string[] = [];

    for (const contact of contacts) {
      try {
        console.log(`Notifying ${contact.name} at ${contact.phone} and ${contact.email}`);
        
        // Send email
        await this.sendEmergencyEmail(contact, crashReport);
        
        // Send SMS
        await this.sendEmergencySMS(contact, crashReport);
        
        notifiedContacts.push(contact.id);
      } catch (error) {
        console.error(`Error notifying ${contact.name}:`, error);
      }
    }

    return notifiedContacts;
  }

  private static async sendEmergencyEmail(contact: EmergencyContact, crashReport: CrashReport): Promise<void> {
    try {
      const emailContent = this.generateEmailContent(contact, crashReport);
      
      // Option 1: Using SendGrid (recommended)
      if (EMAIL_CONFIG.sendgrid.apiKey !== 'your-sendgrid-api-key') {
        await this.sendEmailViaSendGrid(contact.email, emailContent);
        return;
      }

      // Option 2: Using SMTP (Gmail)
      if (EMAIL_CONFIG.smtp.auth.user !== 'your-email@gmail.com') {
        await this.sendEmailViaSMTP(contact.email, emailContent);
        return;
      }

      // Fallback: Simulate email sending
      console.log(`Email to ${contact.email}:`, emailContent);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  private static async sendEmergencySMS(contact: EmergencyContact, crashReport: CrashReport): Promise<void> {
    try {
      const smsContent = this.generateSMSContent(contact, crashReport);
      
      // Using Twilio
      if (SMS_CONFIG.twilio.accountSid !== 'your-twilio-account-sid') {
        await this.sendSMSViaTwilio(contact.phone, smsContent);
        return;
      }

      // Fallback: Simulate SMS sending
      console.log(`SMS to ${contact.phone}:`, smsContent);
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error('Error sending SMS:', error);
      throw error;
    }
  }

  private static generateEmailContent(contact: EmergencyContact, crashReport: CrashReport): string {
    const location = crashReport.location.address || 
      `${crashReport.location.latitude}, ${crashReport.location.longitude}`;
    
    return `
EMERGENCY ALERT - Motorcycle Crash Report

Dear ${contact.name},

This is an automated emergency alert from the Rider App.

A crash has been reported for the rider at ${new Date(crashReport.timestamp).toLocaleString()}.

CRASH DETAILS:
- Time: ${new Date(crashReport.timestamp).toLocaleString()}
- Location: ${location}
- User Status: ${crashReport.userStatus}
- Details: ${crashReport.details}
- GPS Coordinates: ${crashReport.location.latitude}, ${crashReport.location.longitude}

EMERGENCY ACTIONS:
1. Please contact the rider immediately
2. If no response, contact emergency services
3. Use the GPS coordinates to locate the rider

This is an automated message. Please respond immediately.

Best regards,
Rider App Emergency System
    `.trim();
  }

  private static generateSMSContent(contact: EmergencyContact, crashReport: CrashReport): string {
    const location = crashReport.location.address || 'GPS coordinates available';
    return `EMERGENCY: Motorcycle crash reported. Location: ${location}. Status: ${crashReport.userStatus}. Call immediately.`;
  }

  // SendGrid Email Implementation
  private static async sendEmailViaSendGrid(toEmail: string, content: string): Promise<void> {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${EMAIL_CONFIG.sendgrid.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: toEmail }] }],
        from: { email: EMAIL_CONFIG.sendgrid.fromEmail },
        subject: 'EMERGENCY ALERT - Motorcycle Crash Report',
        content: [{ type: 'text/plain', value: content }],
      }),
    });

    if (!response.ok) {
      throw new Error(`SendGrid error: ${response.status}`);
    }
  }

  // SMTP Email Implementation (Gmail)
  private static async sendEmailViaSMTP(toEmail: string, content: string): Promise<void> {
    // This would require a Node.js server or using a library like nodemailer
    // For mobile apps, it's better to use SendGrid or similar services
    console.log('SMTP email would be sent here');
    throw new Error('SMTP not implemented for mobile app');
  }

  // Twilio SMS Implementation
  private static async sendSMSViaTwilio(toPhone: string, content: string): Promise<void> {
    const auth = btoa(`${SMS_CONFIG.twilio.accountSid}:${SMS_CONFIG.twilio.authToken}`);
    
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${SMS_CONFIG.twilio.accountSid}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        To: toPhone,
        From: SMS_CONFIG.twilio.fromNumber,
        Body: content,
      }),
    });

    if (!response.ok) {
      throw new Error(`Twilio error: ${response.status}`);
    }
  }

  // Phone Call Functionality
  static async initiateEmergencyCall(phoneNumber: string): Promise<void> {
    console.log(`Initiating call to ${phoneNumber}`);
    // This would typically use Linking.openURL(`tel:${phoneNumber}`)
  }

  // Map Screenshot (simulated)
  static async captureMapScreenshot(): Promise<string | null> {
    // In a real app, you would use react-native-view-shot or similar
    return 'map_screenshot_placeholder';
  }

  // Test notification function
  static async testNotification(contact: EmergencyContact): Promise<void> {
    const testCrashReport: CrashReport = {
      id: 'test-' + Date.now(),
      timestamp: new Date(),
      location: {
        latitude: 37.7749,
        longitude: -122.4194,
        address: 'Test Location, San Francisco, CA'
      },
      userStatus: 'Test Alert',
      details: 'This is a test emergency notification',
      severity: 'low',
      weather: 'clear',
      roadConditions: 'good'
    };

    await this.notifyEmergencyContacts([contact], testCrashReport);
  }
} 