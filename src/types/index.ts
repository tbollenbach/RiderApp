export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  email: string;
  relationship: string;
  isPrimary: boolean;
}

export interface CrashReport {
  id: string;
  timestamp: Date;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  userStatus: 'ok' | 'injured' | 'unconscious';
  details: string;
  mapImage?: string;
  emergencyContactsNotified: string[];
  rideStats?: {
    distance: number;
    duration: number;
    averageSpeed: number;
    maxSpeed: number;
  };
}

export interface CrashReportForm {
  userStatus: 'ok' | 'injured' | 'unconscious';
  details: string;
  notifyEmergencyContacts: boolean;
} 