import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Dimensions,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import { EmergencyManager } from '../utils/EmergencyManager';
import { CrashReport } from '../types';

const { width, height } = Dimensions.get('window');

export default function CrashHistoryScreen({ navigation }: { navigation: any }) {
  const [crashReports, setCrashReports] = useState<CrashReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<CrashReport | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    loadCrashReports();
  }, []);

  const loadCrashReports = async () => {
    const reports = await EmergencyManager.getCrashReports();
    setCrashReports(reports);
  };

  const openReportDetails = (report: CrashReport) => {
    setSelectedReport(report);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedReport(null);
  };

  const handleCallEmergency = () => {
    if (selectedReport) {
      Alert.alert(
        'Call Emergency Services',
        'Call 911 for emergency assistance?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Call',
            onPress: () => {
              Linking.openURL('tel:911');
            },
          },
        ]
      );
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ok':
        return '#059669';
      case 'injured':
        return '#dc2626';
      case 'unconscious':
        return '#dc2626';
      default:
        return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ok':
        return 'checkmark-circle';
      case 'injured':
        return 'medical';
      case 'unconscious':
        return 'alert-circle';
      default:
        return 'help-circle';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ok':
        return 'Okay';
      case 'injured':
        return 'Injured';
      case 'unconscious':
        return 'Unconscious';
      default:
        return 'Unknown';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.title}>Crash History</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {crashReports.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text" size={64} color="#6b7280" />
            <Text style={styles.emptyTitle}>No Crash Reports</Text>
            <Text style={styles.emptySubtitle}>
              Crash reports will appear here when submitted
            </Text>
          </View>
        ) : (
          <View style={styles.reportsList}>
            {crashReports.map((report) => (
              <TouchableOpacity
                key={report.id}
                style={styles.reportCard}
                onPress={() => openReportDetails(report)}
              >
                <View style={styles.reportHeader}>
                  <View style={styles.reportInfo}>
                    <Text style={styles.reportDate}>
                      {formatDate(report.timestamp)}
                    </Text>
                    <View style={styles.statusContainer}>
                      <Ionicons
                        name={getStatusIcon(report.userStatus)}
                        size={16}
                        color={getStatusColor(report.userStatus)}
                      />
                      <Text
                        style={[
                          styles.statusText,
                          { color: getStatusColor(report.userStatus) },
                        ]}
                      >
                        {getStatusText(report.userStatus)}
                      </Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                </View>
                <Text style={styles.locationText} numberOfLines={1}>
                  {report.location.address || `${report.location.latitude.toFixed(4)}, ${report.location.longitude.toFixed(4)}`}
                </Text>
                <Text style={styles.detailsText} numberOfLines={2}>
                  {report.details}
                </Text>
                {report.emergencyContactsNotified.length > 0 && (
                  <View style={styles.notifiedContainer}>
                    <Ionicons name="people" size={14} color="#059669" />
                    <Text style={styles.notifiedText}>
                      {report.emergencyContactsNotified.length} contact(s) notified
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Report Details Modal */}
      {selectedReport && (
        <View
          style={[
            styles.modalOverlay,
            { display: isModalVisible ? 'flex' : 'none' },
          ]}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Crash Report Details</Text>
              <TouchableOpacity onPress={closeModal}>
                <Ionicons name="close" size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Status */}
              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Status</Text>
                <View style={styles.statusDetail}>
                  <Ionicons
                    name={getStatusIcon(selectedReport.userStatus)}
                    size={24}
                    color={getStatusColor(selectedReport.userStatus)}
                  />
                  <Text
                    style={[
                      styles.statusDetailText,
                      { color: getStatusColor(selectedReport.userStatus) },
                    ]}
                  >
                    {getStatusText(selectedReport.userStatus)}
                  </Text>
                </View>
              </View>

              {/* Date and Time */}
              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Date & Time</Text>
                <Text style={styles.detailText}>
                  {formatDate(selectedReport.timestamp)}
                </Text>
              </View>

              {/* Location */}
              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Location</Text>
                <Text style={styles.detailText}>
                  {selectedReport.location.address || `${selectedReport.location.latitude}, ${selectedReport.location.longitude}`}
                </Text>
                <View style={styles.mapContainer}>
                  <MapView
                    style={styles.map}
                    initialRegion={{
                      latitude: selectedReport.location.latitude,
                      longitude: selectedReport.location.longitude,
                      latitudeDelta: 0.01,
                      longitudeDelta: 0.01,
                    }}
                  >
                    <Marker
                      coordinate={{
                        latitude: selectedReport.location.latitude,
                        longitude: selectedReport.location.longitude,
                      }}
                      title="Crash Location"
                    >
                      <View style={styles.crashMarker}>
                        <Ionicons name="warning" size={16} color="#ffffff" />
                      </View>
                    </Marker>
                  </MapView>
                </View>
              </View>

              {/* Details */}
              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Details</Text>
                <Text style={styles.detailText}>{selectedReport.details}</Text>
              </View>

              {/* Ride Stats */}
              {selectedReport.rideStats && (
                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>Ride Statistics</Text>
                  <View style={styles.statsGrid}>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>Distance</Text>
                      <Text style={styles.statValue}>
                        {selectedReport.rideStats.distance.toFixed(1)} km
                      </Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>Duration</Text>
                      <Text style={styles.statValue}>
                        {Math.floor(selectedReport.rideStats.duration / 60)} min
                      </Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>Avg Speed</Text>
                      <Text style={styles.statValue}>
                        {selectedReport.rideStats.averageSpeed.toFixed(1)} km/h
                      </Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>Max Speed</Text>
                      <Text style={styles.statValue}>
                        {selectedReport.rideStats.maxSpeed.toFixed(1)} km/h
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Emergency Contacts Notified */}
              {selectedReport.emergencyContactsNotified.length > 0 && (
                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>Emergency Contacts Notified</Text>
                  <Text style={styles.detailText}>
                    {selectedReport.emergencyContactsNotified.length} contact(s) were notified
                  </Text>
                </View>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.emergencyButton} onPress={handleCallEmergency}>
                <Ionicons name="call" size={20} color="#ffffff" />
                <Text style={styles.emergencyButtonText}>Call Emergency Services</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
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
  content: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
  },
  reportsList: {
    padding: 20,
  },
  reportCard: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  reportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  reportInfo: {
    flex: 1,
  },
  reportDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    marginLeft: 4,
    fontWeight: '500',
  },
  locationText: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 8,
  },
  detailsText: {
    fontSize: 14,
    color: '#d1d5db',
    lineHeight: 20,
  },
  notifiedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  notifiedText: {
    fontSize: 12,
    color: '#059669',
    marginLeft: 4,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1f2937',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.9,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  modalBody: {
    padding: 20,
  },
  detailSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
  },
  statusDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDetailText: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  detailText: {
    fontSize: 16,
    color: '#d1d5db',
    lineHeight: 24,
  },
  mapContainer: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 12,
  },
  map: {
    flex: 1,
  },
  crashMarker: {
    backgroundColor: '#dc2626',
    borderRadius: 8,
    padding: 6,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statItem: {
    backgroundColor: '#374151',
    borderRadius: 8,
    padding: 12,
    width: (width - 80) / 2,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dc2626',
    padding: 16,
    borderRadius: 12,
  },
  emergencyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 8,
  },
}); 