import AsyncStorage from '@react-native-async-storage/async-storage';

export interface RideData {
  id: string;
  date: string;
  distance: number;
  duration: number;
  averageSpeed: number;
  maxSpeed: number;
  route: Array<{ latitude: number; longitude: number }>;
}

export interface FuelSettings {
  tankCapacity: string;
  currentFuel: string;
  fuelEfficiency: string;
  lowFuelThreshold: string;
}

export interface AppSettings {
  autoStart: boolean;
  backgroundTracking: boolean;
  notifications: boolean;
  darkMode: boolean;
  autoSave: boolean;
  fuelAlerts: boolean;
  lowFuelAlert: boolean;
}

class DataManager {
  private static instance: DataManager;
  private rides: RideData[] = [];
  private fuelSettings: FuelSettings = {
    tankCapacity: '15',
    currentFuel: '12',
    fuelEfficiency: '45',
    lowFuelThreshold: '2',
  };
  private settings: AppSettings = {
    autoStart: false,
    backgroundTracking: true,
    notifications: true,
    darkMode: true,
    autoSave: true,
    fuelAlerts: true,
    lowFuelAlert: true,
  };

  private listeners: Array<() => void> = [];

  static getInstance(): DataManager {
    if (!DataManager.instance) {
      DataManager.instance = new DataManager();
    }
    return DataManager.instance;
  }

  // Load data from AsyncStorage
  async loadData(): Promise<void> {
    try {
      const ridesData = await AsyncStorage.getItem('rides');
      const fuelData = await AsyncStorage.getItem('fuelSettings');
      const settingsData = await AsyncStorage.getItem('settings');

      if (ridesData) {
        this.rides = JSON.parse(ridesData);
      }
      if (fuelData) {
        this.fuelSettings = JSON.parse(fuelData);
      }
      if (settingsData) {
        this.settings = JSON.parse(settingsData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }

  // Save data to AsyncStorage
  async saveData(): Promise<void> {
    try {
      await AsyncStorage.setItem('rides', JSON.stringify(this.rides));
      await AsyncStorage.setItem('fuelSettings', JSON.stringify(this.fuelSettings));
      await AsyncStorage.setItem('settings', JSON.stringify(this.settings));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }

  // Ride data methods
  getRides(): RideData[] {
    return this.rides;
  }

  addRide(ride: RideData): void {
    this.rides.push(ride);
    this.saveData();
    this.notifyListeners();
  }

  deleteRide(id: string): void {
    this.rides = this.rides.filter(ride => ride.id !== id);
    this.saveData();
    this.notifyListeners();
  }

  deleteAllRides(): void {
    this.rides = [];
    this.saveData();
    this.notifyListeners();
  }

  // Fuel settings methods
  getFuelSettings(): FuelSettings {
    return { ...this.fuelSettings };
  }

  updateFuelSettings(settings: Partial<FuelSettings>): void {
    this.fuelSettings = { ...this.fuelSettings, ...settings };
    this.saveData();
    this.notifyListeners();
  }

  calculateFuelRange(): number {
    const current = parseFloat(this.fuelSettings.currentFuel) || 0;
    const efficiency = parseFloat(this.fuelSettings.fuelEfficiency) || 0;
    return current * efficiency;
  }

  calculateLowFuelRange(): number {
    const threshold = parseFloat(this.fuelSettings.lowFuelThreshold) || 0;
    const efficiency = parseFloat(this.fuelSettings.fuelEfficiency) || 0;
    return threshold * efficiency;
  }

  isLowFuel(): boolean {
    const current = parseFloat(this.fuelSettings.currentFuel) || 0;
    const threshold = parseFloat(this.fuelSettings.lowFuelThreshold) || 0;
    return current <= threshold;
  }

  // App settings methods
  getSettings(): AppSettings {
    return { ...this.settings };
  }

  updateSettings(settings: Partial<AppSettings>): void {
    this.settings = { ...this.settings, ...settings };
    this.saveData();
    this.notifyListeners();
  }

  // Listener management
  addListener(callback: () => void): void {
    this.listeners.push(callback);
  }

  removeListener(callback: () => void): void {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener());
  }
}

export default DataManager; 