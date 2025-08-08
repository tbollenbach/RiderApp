import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import DataManager from '../utils/DataManager';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const navigation = useNavigation();
  const dataManager = DataManager.getInstance();
  
  const [fuelSettings, setFuelSettings] = useState(dataManager.getFuelSettings());
  const [rides, setRides] = useState(dataManager.getRides());

  useEffect(() => {
    const handleDataChange = () => {
      setFuelSettings(dataManager.getFuelSettings());
      setRides(dataManager.getRides());
    };

    dataManager.addListener(handleDataChange);
    
    // Load initial data
    dataManager.loadData().then(() => {
      setFuelSettings(dataManager.getFuelSettings());
      setRides(dataManager.getRides());
    });

    return () => {
      dataManager.removeListener(handleDataChange);
    };
  }, []);

  const stats = {
    totalRides: rides.length,
    totalDistance: rides.reduce((sum, ride) => sum + ride.distance, 0),
    totalTime: rides.reduce((sum, ride) => sum + ride.duration, 0),
    averageSpeed: rides.length > 0 ? rides.reduce((sum, ride) => sum + ride.averageSpeed, 0) / rides.length : 0,
  };

  // Calculate fuel data from settings
  const currentFuel = parseFloat(fuelSettings.currentFuel) || 0;
  const tankCapacity = parseFloat(fuelSettings.tankCapacity) || 15;
  const fuelEfficiency = parseFloat(fuelSettings.fuelEfficiency) || 45;
  const lowFuelThreshold = parseFloat(fuelSettings.lowFuelThreshold) || 2;

  const fuelData = {
    currentFuel,
    tankCapacity,
    fuelEfficiency,
    currentRange: dataManager.calculateFuelRange(),
    lowFuelThreshold,
    lowFuelRange: dataManager.calculateLowFuelRange(),
  };

  const fuelPercentage = (fuelData.currentFuel / fuelData.tankCapacity) * 100;
  const isLowFuel = dataManager.isLowFuel();

  const quickActions = [
    {
      title: 'Start New Ride',
      icon: 'navigate',
      color: '#2563eb',
      onPress: () => navigation.navigate('Track Ride' as never),
    },
    {
      title: 'View History',
      icon: 'list',
      color: '#059669',
      onPress: () => navigation.navigate('History' as never),
    },
    {
      title: 'Music',
      icon: 'musical-notes',
      color: '#7c3aed',
      onPress: () => navigation.navigate('Music' as never),
    },
    {
      title: 'Settings',
      icon: 'settings',
      color: '#dc2626',
      onPress: () => navigation.navigate('Settings' as never),
    },
  ];

  const recentRides = rides.slice(0, 2).map(ride => ({
    date: new Date(ride.date).toLocaleDateString(),
    distance: `${ride.distance.toFixed(1)} km`,
    duration: `${Math.floor(ride.duration / 60)}h ${ride.duration % 60}m`,
  }));

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>RiderApp</Text>
        <Text style={styles.subtitle}>Track your motorcycle adventures</Text>
      </View>

      {/* Fuel Range Card */}
      <View style={styles.fuelContainer}>
        <View style={styles.fuelHeader}>
          <Ionicons name="water" size={24} color={isLowFuel ? '#dc2626' : '#2563eb'} />
          <Text style={styles.fuelTitle}>Fuel Range</Text>
          {isLowFuel && (
            <View style={styles.lowFuelBadge}>
              <Ionicons name="warning" size={16} color="#ffffff" />
              <Text style={styles.lowFuelText}>Low Fuel</Text>
            </View>
          )}
        </View>
        
        <View style={styles.fuelInfo}>
          <View style={styles.fuelBar}>
            <View 
              style={[
                styles.fuelProgress, 
                { 
                  width: `${fuelPercentage}%`,
                  backgroundColor: isLowFuel ? '#dc2626' : '#2563eb'
                }
              ]} 
            />
          </View>
          
          <View style={styles.fuelStats}>
            <View style={styles.fuelStat}>
              <Text style={styles.fuelLabel}>Current Range</Text>
              <Text style={[styles.fuelValue, { color: isLowFuel ? '#dc2626' : '#ffffff' }]}>
                {fuelData.currentRange.toFixed(0)} miles
              </Text>
            </View>
            <View style={styles.fuelStat}>
              <Text style={styles.fuelLabel}>Fuel Level</Text>
              <Text style={styles.fuelValue}>{fuelData.currentFuel}/{fuelData.tankCapacity} gal</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>Your Stats</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="bicycle" size={24} color="#2563eb" />
            <Text style={styles.statNumber}>{stats.totalRides}</Text>
            <Text style={styles.statLabel}>Total Rides</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="map" size={24} color="#059669" />
            <Text style={styles.statNumber}>{stats.totalDistance.toFixed(1)}km</Text>
            <Text style={styles.statLabel}>Distance</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="time" size={24} color="#dc2626" />
            <Text style={styles.statNumber}>{stats.totalTime.toFixed(1)}h</Text>
            <Text style={styles.statLabel}>Time</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="speedometer" size={24} color="#7c3aed" />
            <Text style={styles.statNumber}>{stats.averageSpeed.toFixed(1)}km/h</Text>
            <Text style={styles.statLabel}>Avg Speed</Text>
          </View>
        </View>
      </View>

      <View style={styles.actionsContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {quickActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.actionCard, { borderLeftColor: action.color }]}
              onPress={action.onPress}
            >
              <Ionicons name={action.icon as any} size={28} color={action.color} />
              <Text style={styles.actionTitle}>{action.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.recentContainer}>
        <Text style={styles.sectionTitle}>Recent Rides</Text>
        {recentRides.length > 0 ? (
          recentRides.map((ride, index) => (
            <View key={index} style={styles.recentRide}>
              <View style={styles.rideInfo}>
                <Text style={styles.rideDate}>{ride.date}</Text>
                <Text style={styles.rideDistance}>{ride.distance} • {ride.duration}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#6b7280" />
            </View>
          ))
        ) : (
          <View style={styles.recentRide}>
            <View style={styles.rideInfo}>
              <Text style={styles.rideDate}>No rides yet</Text>
              <Text style={styles.rideDistance}>Start your first ride to see it here</Text>
            </View>
          </View>
        )}
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
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9ca3af',
  },
  fuelContainer: {
    backgroundColor: '#1f2937',
    margin: 20,
    borderRadius: 12,
    padding: 16,
  },
  fuelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  fuelTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 8,
    flex: 1,
  },
  lowFuelBadge: {
    backgroundColor: '#dc2626',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  lowFuelText: {
    fontSize: 12,
    color: '#ffffff',
    marginLeft: 4,
    fontWeight: '600',
  },
  fuelInfo: {
    marginTop: 8,
  },
  fuelBar: {
    height: 8,
    backgroundColor: '#374151',
    borderRadius: 4,
    marginBottom: 12,
  },
  fuelProgress: {
    height: '100%',
    borderRadius: 4,
  },
  fuelStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  fuelStat: {
    flex: 1,
  },
  fuelLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4,
  },
  fuelValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  statsContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    width: (width - 60) / 2,
    marginBottom: 12,
    alignItems: 'center',
  },
  statNumber: {
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
  actionsContainer: {
    padding: 20,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    width: (width - 60) / 2, // Added for 2x2 grid
    marginBottom: 12, // Added for 2x2 grid
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 16,
  },
  recentContainer: {
    padding: 20,
  },
  recentRide: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  rideInfo: {
    flex: 1,
  },
  rideDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  rideDistance: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
  },
}); 