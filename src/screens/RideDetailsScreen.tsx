import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';
import MapView, { Marker, Polyline } from 'react-native-maps';

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

export default function RideDetailsScreen() {
  const route = useRoute();
  const { ride } = route.params as { ride: Ride };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Mock route coordinates for demonstration
  const mockRouteCoordinates = [
    { latitude: 37.78825, longitude: -122.4324 },
    { latitude: 37.78925, longitude: -122.4334 },
    { latitude: 37.79025, longitude: -122.4344 },
    { latitude: 37.79125, longitude: -122.4354 },
    { latitude: 37.79225, longitude: -122.4364 },
  ];

  const stats = [
    {
      title: 'Distance',
      value: `${ride.distance} km`,
      icon: 'map',
      color: '#2563eb',
    },
    {
      title: 'Duration',
      value: ride.duration,
      icon: 'time',
      color: '#059669',
    },
    {
      title: 'Average Speed',
      value: `${ride.averageSpeed} km/h`,
      icon: 'speedometer',
      color: '#dc2626',
    },
    {
      title: 'Max Speed',
      value: `${ride.maxSpeed} km/h`,
      icon: 'trending-up',
      color: '#7c3aed',
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.routeName}>{ride.route}</Text>
        <Text style={styles.dateText}>{formatDate(ride.date)}</Text>
      </View>

      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: 37.78825,
            longitude: -122.4324,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          }}
          scrollEnabled={true}
          zoomEnabled={true}
        >
          <Polyline
            coordinates={mockRouteCoordinates}
            strokeColor="#2563eb"
            strokeWidth={4}
          />
          <Marker
            coordinate={mockRouteCoordinates[0]}
            title="Start"
            description="Ride start point"
          >
            <View style={[styles.markerContainer, { backgroundColor: '#059669' }]}>
              <Ionicons name="play" size={16} color="#ffffff" />
            </View>
          </Marker>
          <Marker
            coordinate={mockRouteCoordinates[mockRouteCoordinates.length - 1]}
            title="End"
            description="Ride end point"
          >
            <View style={[styles.markerContainer, { backgroundColor: '#dc2626' }]}>
              <Ionicons name="flag" size={16} color="#ffffff" />
            </View>
          </Marker>
        </MapView>
      </View>

      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>Ride Statistics</Text>
        <View style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <View style={styles.statHeader}>
                <Ionicons name={stat.icon as any} size={20} color={stat.color} />
                <Text style={styles.statTitle}>{stat.title}</Text>
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.detailsContainer}>
        <Text style={styles.sectionTitle}>Ride Details</Text>
        
        <View style={styles.detailItem}>
          <View style={styles.detailHeader}>
            <Ionicons name="calendar" size={20} color="#6b7280" />
            <Text style={styles.detailLabel}>Date & Time</Text>
          </View>
          <Text style={styles.detailValue}>{formatDate(ride.date)}</Text>
        </View>

        <View style={styles.detailItem}>
          <View style={styles.detailHeader}>
            <Ionicons name="location" size={20} color="#6b7280" />
            <Text style={styles.detailLabel}>Route</Text>
          </View>
          <Text style={styles.detailValue}>{ride.route}</Text>
        </View>

        <View style={styles.detailItem}>
          <View style={styles.detailHeader}>
            <Ionicons name="analytics" size={20} color="#6b7280" />
            <Text style={styles.detailLabel}>Performance</Text>
          </View>
          <Text style={styles.detailValue}>
            {ride.averageSpeed > 40 ? 'Excellent' : ride.averageSpeed > 30 ? 'Good' : 'Average'}
          </Text>
        </View>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="share" size={20} color="#ffffff" />
          <Text style={styles.actionText}>Share Ride</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]}>
          <Ionicons name="download" size={20} color="#2563eb" />
          <Text style={[styles.actionText, styles.secondaryText]}>Export Data</Text>
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
    padding: 20,
    paddingTop: 20,
  },
  routeName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 16,
    color: '#9ca3af',
  },
  mapContainer: {
    backgroundColor: '#1f2937',
    margin: 20,
    borderRadius: 12,
    overflow: 'hidden',
    height: 250,
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    borderRadius: 8,
    padding: 4,
    borderWidth: 2,
    borderColor: '#ffffff',
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
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statTitle: {
    fontSize: 12,
    color: '#9ca3af',
    marginLeft: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  detailsContainer: {
    padding: 20,
  },
  detailItem: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#9ca3af',
    marginLeft: 8,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  actionsContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  actionButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#2563eb',
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 8,
  },
  secondaryText: {
    color: '#2563eb',
  },
}); 