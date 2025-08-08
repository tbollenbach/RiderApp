import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import MapView, { Marker, Polyline } from 'react-native-maps';
import MusicPlayer from '../components/MusicPlayer';
import DataManager, { RideData } from '../utils/DataManager';
import AIService, { RealTimeData } from '../utils/AIService';
import VoiceService from '../utils/VoiceService';

const { width, height } = Dimensions.get('window');

interface RideStats {
  distance: number;
  duration: number;
  averageSpeed: number;
  maxSpeed: number;
}

interface RoutePoint {
  latitude: number;
  longitude: number;
  timestamp: number;
}

interface FuelData {
  currentFuel: number;
  tankCapacity: number;
  fuelEfficiency: number;
  lowFuelThreshold: number;
}

export default function RideTrackingScreen({ navigation }: { navigation: any }) {
  const dataManager = DataManager.getInstance();
  const aiService = AIService.getInstance();
  const voiceService = VoiceService.getInstance();
  const [isTracking, setIsTracking] = useState(false);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [routePoints, setRoutePoints] = useState<RoutePoint[]>([]);
  const [stats, setStats] = useState<RideStats>({
    distance: 0,
    duration: 0,
    averageSpeed: 0,
    maxSpeed: 0,
  });
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [fuelData, setFuelData] = useState<FuelData>({
    currentFuel: 12,
    tankCapacity: 15,
    fuelEfficiency: 45,
    lowFuelThreshold: 2,
  });
  const [fuelUsed, setFuelUsed] = useState(0);
  const [hasShownLowFuelAlert, setHasShownLowFuelAlert] = useState(false);
  const [mapRegion, setMapRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [aiVoiceEnabled, setAiVoiceEnabled] = useState(false);
  const [lastAiUpdate, setLastAiUpdate] = useState<Date | null>(null);
  const [lastSpeedAlert, setLastSpeedAlert] = useState<Date | null>(null);
  const mapRef = useRef<MapView>(null);
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required to track rides.');
        return;
      }
    })();

    // Load fuel settings from DataManager
    loadFuelSettings();

    // Initialize voice service
    voiceService.initialize();

    // Cleanup function to remove location subscription when component unmounts
    return () => {
      if (locationSubscription.current) {
        locationSubscription.current.remove();
      }
      voiceService.stop();
    };
  }, []);

  const loadFuelSettings = () => {
    const fuelSettings = dataManager.getFuelSettings();
    setFuelData({
      currentFuel: parseFloat(fuelSettings.currentFuel) || 12,
      tankCapacity: parseFloat(fuelSettings.tankCapacity) || 15,
      fuelEfficiency: parseFloat(fuelSettings.fuelEfficiency) || 45,
      lowFuelThreshold: parseFloat(fuelSettings.lowFuelThreshold) || 2,
    });
  };

  const calculateFuelUsed = (distance: number) => {
    return distance / fuelData.fuelEfficiency;
  };

  const checkFuelStatus = () => {
    const remainingFuel = fuelData.currentFuel - fuelUsed;
    const remainingRange = remainingFuel * fuelData.fuelEfficiency;
    
    if (remainingFuel <= fuelData.lowFuelThreshold && !hasShownLowFuelAlert) {
      setHasShownLowFuelAlert(true);
      Alert.alert(
        'Low Fuel Warning',
        `You have ${remainingFuel.toFixed(1)} gallons remaining (${remainingRange.toFixed(0)} miles). Consider refueling soon.`,
        [{ text: 'OK' }]
      );
      
      // Voice alert
      if (aiVoiceEnabled) {
        voiceService.speakFuelAlert(remainingFuel, remainingRange);
      }
    }
  };

  // Update AI with real-time data
  const updateAIWithRealTimeData = () => {
    if (!isTracking || !location) return;

    const realTimeData: RealTimeData = {
      currentSpeed: location.coords.speed ? location.coords.speed * 3.6 : 0, // Convert m/s to km/h
      currentLocation: {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      },
      distance: stats.distance,
      duration: stats.duration,
      fuelLevel: fuelData.currentFuel - fuelUsed,
      isTracking: isTracking,
    };

    aiService.updateRealTimeData(realTimeData);
  };

  // Check speed and provide voice alerts
  const checkSpeedAlerts = (currentSpeed: number) => {
    if (!aiVoiceEnabled) return;

    const now = new Date();
    const timeSinceLastAlert = lastSpeedAlert ? now.getTime() - lastSpeedAlert.getTime() : 60000;

    // Alert if speed is too high (every minute)
    if (currentSpeed > 120 && timeSinceLastAlert > 60000) { // 120 km/h
      setLastSpeedAlert(now);
      voiceService.speakSpeedAlert(currentSpeed, 120);
    }
  };

  // Get AI coaching based on current performance
  const getAICoaching = async () => {
    if (!aiService.isInitialized()) {
      Alert.alert('AI Not Ready', 'Configure your OpenAI API key in settings to get real-time coaching!');
      return;
    }

    try {
      const coaching = await aiService.getRealTimeCoaching();
      
      if (aiVoiceEnabled) {
        voiceService.speakCoaching(coaching);
      } else {
        Alert.alert('RIDER-X Coaching', coaching);
      }
    } catch (error) {
      console.error('Error getting AI coaching:', error);
    }
  };

  // Get AI speed analysis
  const getAISpeedAnalysis = async () => {
    if (!aiService.isInitialized()) {
      Alert.alert('AI Not Ready', 'Configure your OpenAI API key in settings for speed analysis!');
      return;
    }

    try {
      const analysis = await aiService.analyzeCurrentSpeed();
      
      if (aiVoiceEnabled) {
        voiceService.speakCoaching(analysis);
      } else {
        Alert.alert('Speed Analysis', analysis);
      }
    } catch (error) {
      console.error('Error getting speed analysis:', error);
    }
  };

  const startTracking = async () => {
    try {
      // Check if location services are enabled
      const isLocationEnabled = await Location.hasServicesEnabledAsync();
      if (!isLocationEnabled) {
        Alert.alert('Location Services Disabled', 'Please enable location services to track your ride.');
        return;
      }

      // Request both foreground and background permissions
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
      
      if (foregroundStatus !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required to track rides.');
        return;
      }

      if (backgroundStatus !== 'granted') {
        Alert.alert(
          'Background Location Permission', 
          'Background location permission is recommended for continuous tracking. You can enable it in settings.',
          [{ text: 'Continue Anyway' }]
        );
      }

      setIsTracking(true);
      setStartTime(new Date());
      setStats({
        distance: 0,
        duration: 0,
        averageSpeed: 0,
        maxSpeed: 0,
      });
      setRoutePoints([]);
      setFuelUsed(0);
      setHasShownLowFuelAlert(false);

      // Voice confirmation
      if (aiVoiceEnabled) {
        voiceService.speak('Ride tracking started. Let\'s hit the road!', 'high');
      }

      // Get initial location with better accuracy settings
      const initialLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 1000,
        distanceInterval: 5,
      });
      
      setLocation(initialLocation);
      setMapRegion({
        latitude: initialLocation.coords.latitude,
        longitude: initialLocation.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
      setRoutePoints([{
        latitude: initialLocation.coords.latitude,
        longitude: initialLocation.coords.longitude,
        timestamp: Date.now(),
      }]);

      // Start location tracking with more frequent updates
      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 2000,
          distanceInterval: 5,
          mayShowUserSettingsDialog: true,
        },
        (newLocation) => {
          console.log('New location:', {
            latitude: newLocation.coords.latitude,
            longitude: newLocation.coords.longitude,
            accuracy: newLocation.coords.accuracy,
            speed: newLocation.coords.speed,
          });
          setLocation(newLocation);
          setMapRegion({
            latitude: newLocation.coords.latitude,
            longitude: newLocation.coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
          updateStats(newLocation);
          addRoutePoint(newLocation);
          
          // Update AI with real-time data
          updateAIWithRealTimeData();
          
          // Check speed alerts
          const currentSpeed = newLocation.coords.speed ? newLocation.coords.speed * 3.6 : 0;
          checkSpeedAlerts(currentSpeed);
          
          // Auto AI coaching every 5 minutes
          const now = new Date();
          if (!lastAiUpdate || (now.getTime() - lastAiUpdate.getTime()) > 300000) { // 5 minutes
            setLastAiUpdate(now);
            if (aiService.isInitialized() && aiVoiceEnabled) {
              getAICoaching();
            }
          }
        }
      );

      console.log('Location tracking started successfully');
    } catch (error) {
      console.error('Location tracking error:', error);
      Alert.alert('Error', 'Failed to start tracking. Please check your location permissions and try again.');
      setIsTracking(false);
    }
  };

  const addRoutePoint = (newLocation: Location.LocationObject) => {
    const newPoint = {
      latitude: newLocation.coords.latitude,
      longitude: newLocation.coords.longitude,
      timestamp: Date.now(),
    };
    setRoutePoints(prev => [...prev, newPoint]);
  };

  const stopTracking = () => {
    // Stop location tracking
    if (locationSubscription.current) {
      locationSubscription.current.remove();
      locationSubscription.current = null;
    }
    
    setIsTracking(false);
    setStartTime(null);
    
    // Voice confirmation
    if (aiVoiceEnabled) {
      voiceService.speak(`Ride complete! You covered ${stats.distance.toFixed(1)} kilometers in ${formatTime(stats.duration)}. Great ride!`, 'high');
    }
    
    Alert.alert(
      'Ride Complete',
      `Distance: ${stats.distance.toFixed(1)} km\nDuration: ${formatTime(stats.duration)}\nAverage Speed: ${stats.averageSpeed.toFixed(1)} km/h\nFuel Used: ${fuelUsed.toFixed(2)} gallons`,
      [
        { text: 'Save Ride', onPress: saveRide },
        { text: 'Discard', style: 'destructive' },
      ]
    );
  };

  const updateStats = (newLocation: Location.LocationObject) => {
    if (!startTime || routePoints.length === 0) return;

    const now = new Date();
    const duration = (now.getTime() - startTime.getTime()) / 1000; // seconds

    // Calculate distance from route points
    let totalDistance = 0;
    for (let i = 1; i < routePoints.length; i++) {
      const prev = routePoints[i - 1];
      const curr = routePoints[i];
      totalDistance += calculateDistance(prev.latitude, prev.longitude, curr.latitude, curr.longitude);
    }

    // Calculate fuel used
    const newFuelUsed = calculateFuelUsed(totalDistance);
    setFuelUsed(newFuelUsed);

    const averageSpeed = totalDistance / (duration / 3600); // km/h
    const maxSpeed = Math.max(stats.maxSpeed, averageSpeed);

    setStats({
      distance: totalDistance,
      duration,
      averageSpeed,
      maxSpeed,
    });

    // Check fuel status
    checkFuelStatus();
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const saveRide = () => {
    try {
      const rideData: RideData = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        distance: stats.distance,
        duration: stats.duration,
        averageSpeed: stats.averageSpeed,
        maxSpeed: stats.maxSpeed,
        route: routePoints.map(point => ({
          latitude: point.latitude,
          longitude: point.longitude,
        })),
      };

      dataManager.addRide(rideData);
      Alert.alert('Success', 'Ride saved successfully!');
      
      // Navigate to ride history to show the saved ride
      navigation.navigate('RideHistory');
    } catch (error) {
      console.error('Error saving ride:', error);
      Alert.alert('Error', 'Failed to save ride. Please try again.');
    }
  };

  const centerMapOnLocation = () => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };

  const remainingFuel = fuelData.currentFuel - fuelUsed;
  const remainingRange = remainingFuel * fuelData.fuelEfficiency;
  const isLowFuel = remainingFuel <= fuelData.lowFuelThreshold;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Track Ride</Text>
        <Text style={styles.subtitle}>
          {isTracking ? 'Recording your journey...' : 'Ready to start tracking'}
        </Text>
      </View>

      {/* AI Voice Toggle */}
      <View style={styles.aiVoiceContainer}>
        <TouchableOpacity
          style={[styles.aiVoiceButton, aiVoiceEnabled && styles.aiVoiceButtonActive]}
          onPress={() => setAiVoiceEnabled(!aiVoiceEnabled)}
        >
          <Ionicons 
            name={aiVoiceEnabled ? "mic" : "mic-off"} 
            size={20} 
            color={aiVoiceEnabled ? "#ffffff" : "#6b7280"} 
          />
          <Text style={[styles.aiVoiceText, aiVoiceEnabled && styles.aiVoiceTextActive]}>
            {aiVoiceEnabled ? 'AI Voice ON' : 'AI Voice OFF'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* AI Coaching Buttons */}
      {isTracking && aiService.isInitialized() && (
        <View style={styles.aiCoachingContainer}>
          <TouchableOpacity style={styles.aiCoachingButton} onPress={getAICoaching}>
            <Ionicons name="bulb" size={20} color="#2563eb" />
            <Text style={styles.aiCoachingText}>Get Coaching</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.aiCoachingButton} onPress={getAISpeedAnalysis}>
            <Ionicons name="speedometer" size={20} color="#dc2626" />
            <Text style={styles.aiCoachingText}>Speed Check</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Fuel Status Card */}
      {isTracking && (
        <View style={styles.fuelStatusContainer}>
          <View style={styles.fuelStatusHeader}>
            <Ionicons name="water" size={20} color={isLowFuel ? '#dc2626' : '#2563eb'} />
            <Text style={styles.fuelStatusTitle}>Fuel Status</Text>
            {isLowFuel && (
              <Ionicons name="warning" size={20} color="#dc2626" />
            )}
          </View>
          <View style={styles.fuelStatusInfo}>
            <View style={styles.fuelStatusItem}>
              <Text style={styles.fuelStatusLabel}>Remaining Fuel</Text>
              <Text style={[styles.fuelStatusValue, { color: isLowFuel ? '#dc2626' : '#ffffff' }]}>
                {remainingFuel.toFixed(1)} gal
              </Text>
            </View>
            <View style={styles.fuelStatusItem}>
              <Text style={styles.fuelStatusLabel}>Range</Text>
              <Text style={[styles.fuelStatusValue, { color: isLowFuel ? '#dc2626' : '#ffffff' }]}>
                {remainingRange.toFixed(0)} miles
              </Text>
            </View>
            <View style={styles.fuelStatusItem}>
              <Text style={styles.fuelStatusLabel}>Used</Text>
              <Text style={styles.fuelStatusValue}>{fuelUsed.toFixed(2)} gal</Text>
            </View>
          </View>
        </View>
      )}

      {/* Music Player */}
      <View style={styles.musicContainer}>
        <MusicPlayer compact={true} />
      </View>

      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          region={mapRegion}
          showsUserLocation={true}
          showsMyLocationButton={false}
          followsUserLocation={isTracking}
        >
          {routePoints.length > 1 && (
            <Polyline
              coordinates={routePoints}
              strokeColor="#2563eb"
              strokeWidth={4}
            />
          )}
          {location && (
            <Marker
              coordinate={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              }}
              title="Current Location"
              description={`Speed: ${location.coords.speed ? (location.coords.speed * 3.6).toFixed(1) : 'N/A'} km/h`}
            >
              <View style={styles.markerContainer}>
                <Ionicons name="location" size={20} color="#dc2626" />
              </View>
            </Marker>
          )}
        </MapView>
        
        {isTracking && (
          <TouchableOpacity style={styles.centerButton} onPress={centerMapOnLocation}>
            <Ionicons name="locate" size={24} color="#ffffff" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statRow}>
          <View style={styles.statItem}>
            <Ionicons name="map" size={24} color="#2563eb" />
            <Text style={styles.statValue}>{stats.distance.toFixed(1)}</Text>
            <Text style={styles.statLabel}>Distance (km)</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="time" size={24} color="#059669" />
            <Text style={styles.statValue}>{formatTime(stats.duration)}</Text>
            <Text style={styles.statLabel}>Duration</Text>
          </View>
        </View>
        <View style={styles.statRow}>
          <View style={styles.statItem}>
            <Ionicons name="speedometer" size={24} color="#dc2626" />
            <Text style={styles.statValue}>{stats.averageSpeed.toFixed(1)}</Text>
            <Text style={styles.statLabel}>Avg Speed (km/h)</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="trending-up" size={24} color="#7c3aed" />
            <Text style={styles.statValue}>{stats.maxSpeed.toFixed(1)}</Text>
            <Text style={styles.statLabel}>Max Speed (km/h)</Text>
          </View>
        </View>
      </View>

      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={[
            styles.trackButton,
            { backgroundColor: isTracking ? '#dc2626' : '#2563eb' },
          ]}
          onPress={isTracking ? stopTracking : startTracking}
        >
          <Ionicons
            name={isTracking ? 'stop' : 'play'}
            size={32}
            color="#ffffff"
          />
          <Text style={styles.trackButtonText}>
            {isTracking ? 'Stop Ride' : 'Start Ride'}
          </Text>
        </TouchableOpacity>
        
        {/* Crash Report Button */}
        <TouchableOpacity
          style={styles.crashReportButton}
          onPress={() => navigation.navigate('CrashReport', { rideStats: stats })}
        >
          <Ionicons name="warning" size={24} color="#ffffff" />
          <Text style={styles.crashReportButtonText}>Report Crash</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
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
  aiVoiceContainer: {
    backgroundColor: '#1f2937',
    margin: 20,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  aiVoiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#2563eb',
    marginBottom: 12,
  },
  aiVoiceButtonActive: {
    backgroundColor: '#dc2626',
  },
  aiVoiceText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 8,
  },
  aiVoiceTextActive: {
    color: '#ffffff',
  },
  aiCoachingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    margin: 20,
    marginBottom: 10,
  },
  aiCoachingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#1f2937',
  },
  aiCoachingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
    marginLeft: 8,
  },
  fuelStatusContainer: {
    backgroundColor: '#1f2937',
    margin: 20,
    borderRadius: 12,
    padding: 16,
  },
  fuelStatusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  fuelStatusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 8,
    flex: 1,
  },
  fuelStatusInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  fuelStatusItem: {
    flex: 1,
    alignItems: 'center',
  },
  fuelStatusLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4,
  },
  fuelStatusValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  musicContainer: {
    margin: 20,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1f2937',
    padding: 16,
  },
  mapContainer: {
    height: 300,
    margin: 20,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  map: {
    height: 300,
  },
  markerContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 4,
    borderWidth: 2,
    borderColor: '#dc2626',
  },
  centerButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#2563eb',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  statsContainer: {
    padding: 20,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statItem: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    width: (width - 60) / 2,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  controlsContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  trackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  trackButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 12,
  },
  crashReportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dc2626',
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
  },
  crashReportButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 8,
  },
}); 