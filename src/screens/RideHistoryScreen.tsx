import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import DataManager, { RideData } from '../utils/DataManager';

const { width } = Dimensions.get('window');

interface Ride {
  id: string;
  date: string;
  distance: number;
  duration: string;
  averageSpeed: number;
  maxSpeed: number;
  route: string;
}

export default function RideHistoryScreen() {
  const navigation = useNavigation();
  const dataManager = DataManager.getInstance();
  const [rides, setRides] = useState<RideData[]>([]);

  useEffect(() => {
    const handleDataChange = () => {
      setRides(dataManager.getRides());
    };

    dataManager.addListener(handleDataChange);
    
    // Load initial data
    dataManager.loadData().then(() => {
      setRides(dataManager.getRides());
    });

    return () => {
      dataManager.removeListener(handleDataChange);
    };
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const renderRideItem = ({ item }: { item: RideData }) => (
    <TouchableOpacity
      style={styles.rideItem}
      onPress={() => navigation.navigate('RideDetails' as never, { ride: item } as never)}
    >
      <View style={styles.rideHeader}>
        <View style={styles.rideInfo}>
          <Text style={styles.rideDate}>{formatDate(item.date)}</Text>
          <Text style={styles.rideRoute}>Ride #{item.id}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#6b7280" />
      </View>
      
      <View style={styles.rideStats}>
        <View style={styles.statItem}>
          <Ionicons name="map" size={16} color="#2563eb" />
          <Text style={styles.statText}>{item.distance.toFixed(1)} km</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="time" size={16} color="#059669" />
          <Text style={styles.statText}>{formatDuration(item.duration)}</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="speedometer" size={16} color="#dc2626" />
          <Text style={styles.statText}>{item.averageSpeed.toFixed(1)} km/h</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="trending-up" size={16} color="#7c3aed" />
          <Text style={styles.statText}>{item.maxSpeed.toFixed(1)} km/h</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const totalStats = rides.reduce(
    (acc, ride) => ({
      totalRides: acc.totalRides + 1,
      totalDistance: acc.totalDistance + ride.distance,
      totalDuration: acc.totalDuration + ride.duration,
      averageSpeed: (acc.averageSpeed + ride.averageSpeed) / 2,
    }),
    { totalRides: 0, totalDistance: 0, totalDuration: 0, averageSpeed: 0 }
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Ride History</Text>
        <Text style={styles.subtitle}>
          {totalStats.totalRides} rides • {totalStats.totalDistance.toFixed(1)} km total
        </Text>
      </View>

      <View style={styles.statsOverview}>
        <View style={styles.overviewCard}>
          <Text style={styles.overviewNumber}>{totalStats.totalRides}</Text>
          <Text style={styles.overviewLabel}>Total Rides</Text>
        </View>
        <View style={styles.overviewCard}>
          <Text style={styles.overviewNumber}>{totalStats.totalDistance.toFixed(1)}</Text>
          <Text style={styles.overviewLabel}>Total Distance (km)</Text>
        </View>
        <View style={styles.overviewCard}>
          <Text style={styles.overviewNumber}>
            {rides.length > 0 ? totalStats.averageSpeed.toFixed(1) : '0.0'}
          </Text>
          <Text style={styles.overviewLabel}>Avg Speed (km/h)</Text>
        </View>
      </View>

      <View style={styles.listContainer}>
        <Text style={styles.sectionTitle}>Recent Rides</Text>
        {rides.length > 0 ? (
          <FlatList
            data={rides}
            renderItem={renderRideItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="bicycle" size={48} color="#6b7280" />
            <Text style={styles.emptyTitle}>No rides yet</Text>
            <Text style={styles.emptySubtitle}>Start your first ride to see it here</Text>
          </View>
        )}
      </View>
    </View>
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
  statsOverview: {
    flexDirection: 'row',
    padding: 20,
    paddingBottom: 0,
  },
  overviewCard: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  overviewNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  overviewLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
    textAlign: 'center',
  },
  listContainer: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
  },
  listContent: {
    paddingBottom: 20,
  },
  rideItem: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  rideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  rideInfo: {
    flex: 1,
  },
  rideDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  rideRoute: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 2,
  },
  rideStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    color: '#9ca3af',
    marginLeft: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
}); 