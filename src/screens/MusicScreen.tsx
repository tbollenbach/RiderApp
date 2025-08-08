import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
  Dimensions,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MusicManager, { Song, Playlist } from '../utils/MusicManager';

const { width } = Dimensions.get('window');

export default function MusicScreen() {
  const musicManager = MusicManager.getInstance();
  
  const [activeTab, setActiveTab] = useState<'library' | 'playlists' | 'search' | 'player'>('library');
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [allSongs, setAllSongs] = useState<Song[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingSongs, setIsLoadingSongs] = useState(true);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [showCreatePlaylistModal, setShowCreatePlaylistModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);

  useEffect(() => {
    const handleDataChange = () => {
      setPlaylists(musicManager.getPlaylists());
      setCurrentSong(musicManager.getCurrentSong());
      setIsPlaying(musicManager.isCurrentlyPlaying());
    };

    musicManager.addListener(handleDataChange);
    
    // Load initial data
    loadInitialData();

    return () => {
      musicManager.removeListener(handleDataChange);
    };
  }, []);

  const loadInitialData = async () => {
    try {
      setIsLoadingSongs(true);
      await musicManager.loadData();
      const songs = await musicManager.getAllSongs();
      setAllSongs(songs);
      setPlaylists(musicManager.getPlaylists());
      setCurrentSong(musicManager.getCurrentSong());
      setIsPlaying(musicManager.isCurrentlyPlaying());
    } catch (error) {
      console.error('Error loading initial data:', error);
      Alert.alert('Error', 'Failed to load music library. Please check your connection.');
    } finally {
      setIsLoadingSongs(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const results = await musicManager.searchSongs(searchQuery);
      setSearchResults(results);
    } catch (error) {
      Alert.alert('Error', 'Failed to search songs. Please check your connection.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleCreatePlaylist = () => {
    setShowCreatePlaylistModal(true);
  };

  const handleCreatePlaylistConfirm = () => {
    if (newPlaylistName.trim()) {
      musicManager.createPlaylist(newPlaylistName.trim());
      setNewPlaylistName('');
      setShowCreatePlaylistModal(false);
      Alert.alert('Success', 'Playlist created successfully!');
    } else {
      Alert.alert('Error', 'Please enter a playlist name.');
    }
  };

  const handlePlaySong = async (song: Song) => {
    try {
      await musicManager.playSong(song);
      Alert.alert('Success', `Now playing: ${song.title}`);
    } catch (error) {
      console.error('Error playing song:', error);
      Alert.alert('Error', 'Failed to play song. Please check your connection and try again.');
    }
  };

  const handlePlayPause = async () => {
    try {
      if (isPlaying) {
        await musicManager.pause();
      } else {
        await musicManager.resume();
      }
    } catch (error) {
      console.error('Error toggling play/pause:', error);
      Alert.alert('Error', 'Failed to control playback.');
    }
  };

  const handleStop = async () => {
    try {
      await musicManager.stop();
    } catch (error) {
      console.error('Error stopping playback:', error);
      Alert.alert('Error', 'Failed to stop playback.');
    }
  };

  const handleVolumeChange = async (newVolume: number) => {
    try {
      setVolume(newVolume);
      await musicManager.setVolume(newVolume);
    } catch (error) {
      console.error('Error changing volume:', error);
    }
  };

  const handleAddToPlaylist = (song: Song) => {
    if (playlists.length === 0) {
      Alert.alert(
        'No Playlists',
        'You need to create a playlist first. Would you like to create one now?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Create Playlist', onPress: handleCreatePlaylist }
        ]
      );
      return;
    }

    const playlistOptions = playlists.map(playlist => ({
      text: playlist.name,
      onPress: () => {
        musicManager.addSongToPlaylist(playlist.id, song);
        Alert.alert('Success', `Added "${song.title}" to "${playlist.name}"`);
      },
    }));

    Alert.alert(
      'Add to Playlist',
      'Select a playlist:',
      [...playlistOptions, { text: 'Cancel', style: 'cancel' }]
    );
  };

  const handlePlaylistSelect = (playlist: Playlist) => {
    setSelectedPlaylist(playlist);
    setActiveTab('player');
  };

  const renderPlaylistItem = ({ item }: { item: Playlist }) => (
    <TouchableOpacity
      style={styles.playlistItem}
      onPress={() => handlePlaylistSelect(item)}
    >
      <View style={styles.playlistInfo}>
        <Ionicons name="musical-notes" size={24} color="#2563eb" />
        <View style={styles.playlistText}>
          <Text style={styles.playlistName}>{item.name}</Text>
          <Text style={styles.playlistDetails}>
            {item.songs.length} songs • Created {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#6b7280" />
    </TouchableOpacity>
  );

  const renderSongItem = ({ item }: { item: Song }) => (
    <TouchableOpacity
      style={styles.songItem}
      onPress={() => handlePlaySong(item)}
    >
      <View style={styles.songInfo}>
        <Ionicons name="musical-note" size={20} color="#059669" />
        <View style={styles.songText}>
          <Text style={styles.songTitle}>{item.title}</Text>
          <Text style={styles.songArtist}>{item.artist}</Text>
        </View>
      </View>
      <View style={styles.songActions}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => handleAddToPlaylist(item)}
        >
          <Ionicons name="add" size={16} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Riding Tunes</Text>
        <Text style={styles.subtitle}>Your music library and playlists</Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'library' && styles.activeTab]}
          onPress={() => setActiveTab('library')}
        >
          <Ionicons name="library" size={20} color={activeTab === 'library' ? '#2563eb' : '#6b7280'} />
          <Text style={[styles.tabText, activeTab === 'library' && styles.activeTabText]}>
            Library
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'playlists' && styles.activeTab]}
          onPress={() => setActiveTab('playlists')}
        >
          <Ionicons name="list" size={20} color={activeTab === 'playlists' ? '#2563eb' : '#6b7280'} />
          <Text style={[styles.tabText, activeTab === 'playlists' && styles.activeTabText]}>
            Playlists
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'search' && styles.activeTab]}
          onPress={() => setActiveTab('search')}
        >
          <Ionicons name="search" size={20} color={activeTab === 'search' ? '#2563eb' : '#6b7280'} />
          <Text style={[styles.tabText, activeTab === 'search' && styles.activeTabText]}>
            Search
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'player' && styles.activeTab]}
          onPress={() => setActiveTab('player')}
        >
          <Ionicons name="play" size={20} color={activeTab === 'player' ? '#2563eb' : '#6b7280'} />
          <Text style={[styles.tabText, activeTab === 'player' && styles.activeTabText]}>
            Player
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {activeTab === 'library' && (
          <View style={styles.tabContent}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Music Library</Text>
              <TouchableOpacity
                style={styles.refreshButton}
                onPress={loadInitialData}
              >
                <Ionicons name="refresh" size={20} color="#2563eb" />
              </TouchableOpacity>
            </View>
            
            {isLoadingSongs ? (
              <View style={styles.loadingState}>
                <Text style={styles.loadingText}>Loading music library...</Text>
              </View>
            ) : allSongs.length > 0 ? (
              <FlatList
                data={allSongs}
                renderItem={renderSongItem}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
              />
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="musical-notes" size={48} color="#6b7280" />
                <Text style={styles.emptyTitle}>No songs found</Text>
                <Text style={styles.emptySubtitle}>Make sure your music server is running and has songs</Text>
              </View>
            )}
          </View>
        )}

        {activeTab === 'playlists' && (
          <View style={styles.tabContent}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your Playlists</Text>
              <TouchableOpacity
                style={styles.createButton}
                onPress={handleCreatePlaylist}
              >
                <Ionicons name="add" size={20} color="#ffffff" />
                <Text style={styles.createButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
            
            {playlists.length > 0 ? (
              <FlatList
                data={playlists}
                renderItem={renderPlaylistItem}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
              />
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="musical-notes" size={48} color="#6b7280" />
                <Text style={styles.emptyTitle}>No playlists yet</Text>
                <Text style={styles.emptySubtitle}>Create your first playlist to get started</Text>
              </View>
            )}
          </View>
        )}

        {activeTab === 'search' && (
          <View style={styles.tabContent}>
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search songs, artists, or albums..."
                placeholderTextColor="#6b7280"
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearch}
              />
              <TouchableOpacity
                style={styles.searchButton}
                onPress={handleSearch}
                disabled={isSearching}
              >
                <Ionicons name="search" size={20} color="#ffffff" />
              </TouchableOpacity>
            </View>

            {isSearching ? (
              <View style={styles.loadingState}>
                <Text style={styles.loadingText}>Searching...</Text>
              </View>
            ) : searchResults.length > 0 ? (
              <FlatList
                data={searchResults}
                renderItem={renderSongItem}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
              />
            ) : searchQuery ? (
              <View style={styles.emptyState}>
                <Ionicons name="search" size={48} color="#6b7280" />
                <Text style={styles.emptyTitle}>No songs found</Text>
                <Text style={styles.emptySubtitle}>Try a different search term</Text>
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="musical-note" size={48} color="#6b7280" />
                <Text style={styles.emptyTitle}>Search your music</Text>
                <Text style={styles.emptySubtitle}>Search for songs, artists, or albums in your library</Text>
              </View>
            )}
          </View>
        )}

        {activeTab === 'player' && (
          <View style={styles.tabContent}>
            {selectedPlaylist ? (
              <View style={styles.playlistPlayerContainer}>
                <View style={styles.playlistHeader}>
                  <Ionicons name="musical-notes" size={32} color="#2563eb" />
                  <Text style={styles.playlistTitle}>{selectedPlaylist.name}</Text>
                  <Text style={styles.playlistSubtitle}>
                    {selectedPlaylist.songs.length} songs
                  </Text>
                  <TouchableOpacity
                    style={styles.clearPlaylistButton}
                    onPress={() => setSelectedPlaylist(null)}
                  >
                    <Ionicons name="close" size={20} color="#6b7280" />
                  </TouchableOpacity>
                </View>

                {selectedPlaylist.songs.length > 0 ? (
                  <FlatList
                    data={selectedPlaylist.songs}
                    renderItem={renderSongItem}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    style={styles.playlistSongsList}
                  />
                ) : (
                  <View style={styles.emptyState}>
                    <Ionicons name="musical-notes" size={48} color="#6b7280" />
                    <Text style={styles.emptyTitle}>Playlist is empty</Text>
                    <Text style={styles.emptySubtitle}>Add songs from your library to this playlist</Text>
                  </View>
                )}
              </View>
            ) : currentSong ? (
              <View style={styles.playerContainer}>
                <View style={styles.nowPlaying}>
                  <Ionicons name="musical-note" size={48} color="#2563eb" />
                  <Text style={styles.songTitle}>{currentSong.title}</Text>
                  <Text style={styles.songArtist}>{currentSong.artist}</Text>
                  <Text style={styles.songDuration}>
                    {formatDuration(currentSong.duration)}
                  </Text>
                </View>

                <View style={styles.controls}>
                  <TouchableOpacity
                    style={styles.controlButton}
                    onPress={handleStop}
                  >
                    <Ionicons name="stop" size={24} color="#dc2626" />
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.playButton}
                    onPress={handlePlayPause}
                  >
                    <Ionicons 
                      name={isPlaying ? 'pause' : 'play'} 
                      size={32} 
                      color="#ffffff" 
                    />
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.controlButton}
                    onPress={() => {/* Skip to next */}}
                  >
                    <Ionicons name="play-skip-forward" size={24} color="#059669" />
                  </TouchableOpacity>
                </View>

                <View style={styles.volumeContainer}>
                  <Ionicons name="volume-low" size={16} color="#6b7280" />
                  <View style={styles.volumeSlider}>
                    {/* Volume slider would go here */}
                  </View>
                  <Ionicons name="volume-high" size={16} color="#6b7280" />
                </View>
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="play-circle" size={48} color="#6b7280" />
                <Text style={styles.emptyTitle}>No song playing</Text>
                <Text style={styles.emptySubtitle}>Select a song from your library or a playlist to start playing</Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Create Playlist Modal */}
      <Modal
        visible={showCreatePlaylistModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCreatePlaylistModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Playlist</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter playlist name..."
              placeholderTextColor="#6b7280"
              value={newPlaylistName}
              onChangeText={setNewPlaylistName}
              autoFocus={true}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setNewPlaylistName('');
                  setShowCreatePlaylistModal(false);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleCreatePlaylistConfirm}
              >
                <Text style={styles.confirmButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginHorizontal: 2,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#1f2937',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginLeft: 4,
  },
  activeTabText: {
    color: '#2563eb',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  tabContent: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  createButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 4,
  },
  refreshButton: {
    padding: 8,
  },
  playlistItem: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  playlistInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  playlistText: {
    marginLeft: 12,
    flex: 1,
  },
  playlistName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  playlistDetails: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#1f2937',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#ffffff',
    marginRight: 8,
  },
  searchButton: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  songItem: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  songInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  songText: {
    marginLeft: 12,
    flex: 1,
  },
  songTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  songArtist: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 2,
  },
  songActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: '#059669',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nowPlaying: {
    alignItems: 'center',
    marginBottom: 40,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
  },
  controlButton: {
    backgroundColor: '#1f2937',
    borderRadius: 24,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 16,
  },
  playButton: {
    backgroundColor: '#2563eb',
    borderRadius: 32,
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  volumeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
  volumeSlider: {
    flex: 1,
    height: 4,
    backgroundColor: '#374151',
    borderRadius: 2,
    marginHorizontal: 12,
  },
  // Playlist player styles
  playlistPlayerContainer: {
    flex: 1,
  },
  playlistHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    position: 'relative',
  },
  playlistTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 12,
    flex: 1,
  },
  playlistSubtitle: {
    fontSize: 14,
    color: '#9ca3af',
    marginLeft: 12,
  },
  clearPlaylistButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    padding: 4,
  },
  playlistSongsList: {
    flex: 1,
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
  loadingState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#9ca3af',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 24,
    width: width * 0.8,
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalInput: {
    backgroundColor: '#374151',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#ffffff',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: '#6b7280',
  },
  confirmButton: {
    backgroundColor: '#2563eb',
  },
  cancelButtonText: {
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: '600',
  },
  confirmButtonText: {
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: '600',
  },
  songDuration: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
  },
}); 