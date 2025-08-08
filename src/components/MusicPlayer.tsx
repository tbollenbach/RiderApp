import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getServerUrl, getAllServerUrls } from '../config/serverConfig';
import MusicManager, { Song } from '../utils/MusicManager';

const { width } = Dimensions.get('window');

interface MusicPlayerProps {
  compact?: boolean;
}

export default function MusicPlayer({ compact = false }: MusicPlayerProps) {
  const musicManager = MusicManager.getInstance();
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isLoading, setIsLoading] = useState(false);
  const [serverConnected, setServerConnected] = useState(false);
  const [activeServerUrl, setActiveServerUrl] = useState<string>('');
  const [musicSource, setMusicSource] = useState<'phone' | 'server' | 'none'>('none');
  const [musicCount, setMusicCount] = useState(0);

  // Get server URLs to try
  const serverUrls = getAllServerUrls();

  const currentSong = songs[currentSongIndex] || null;

  useEffect(() => {
    loadSongsFromMusicLibrary();
    
    // Listen to music manager changes
    const handleDataChange = () => {
      setIsPlaying(musicManager.isCurrentlyPlaying());
      const sourceInfo = musicManager.getMusicSourceInfo();
      setMusicSource(sourceInfo.source);
      setMusicCount(sourceInfo.count);
    };

    musicManager.addListener(handleDataChange);
    
    return () => {
      musicManager.removeListener(handleDataChange);
    };
  }, []);

  const loadSongsFromMusicLibrary = async () => {
    setIsLoading(true);
    
    try {
      // First try to load from phone's music library
      console.log('Loading songs from phone music library...');
      await musicManager.loadData();
      const allSongs = await musicManager.getAllSongs();
      
      if (allSongs.length > 0) {
        setSongs(allSongs);
        const sourceInfo = musicManager.getMusicSourceInfo();
        setMusicSource(sourceInfo.source);
        setMusicCount(sourceInfo.count);
        
        if (sourceInfo.source === 'phone') {
          console.log(`Loaded ${allSongs.length} songs from phone's music library`);
          setServerConnected(false);
          setActiveServerUrl('');
        } else if (sourceInfo.source === 'server') {
          console.log(`Loaded ${allSongs.length} songs from music server`);
          setServerConnected(true);
          setActiveServerUrl('Music Server');
        }
        
        setIsLoading(false);
        return;
      }
    } catch (error) {
      console.error('Error loading songs from music library:', error);
    }
    
    // If no songs were found, fall back to demo songs
    console.log('No music found, using demo songs');
    setSongs(getDemoSongs());
    setMusicSource('none');
    setMusicCount(0);
    setServerConnected(false);
    setActiveServerUrl('');
    setIsLoading(false);
  };

  const getDemoSongs = (): Song[] => [
    {
      id: '1',
      title: 'Riding Free',
      artist: 'Road Warriors',
      album: 'Demo Album',
      duration: 180,
      uri: 'demo://riding-free',
    },
    {
      id: '2', 
      title: 'Highway Dreams',
      artist: 'Motorcycle Band',
      album: 'Demo Album',
      duration: 240,
      uri: 'demo://highway-dreams',
    },
    {
      id: '3',
      title: 'Wind in My Hair',
      artist: 'Biker Anthems',
      album: 'Demo Album',
      duration: 200,
      uri: 'demo://wind-in-hair',
    },
  ];

  const handlePlayPause = async () => {
    if (!currentSong) return;
    
    try {
      if (isPlaying) {
        await musicManager.pause();
      } else {
        if (musicSource === 'phone' || musicSource === 'server') {
          await musicManager.playSong(currentSong);
        } else {
          Alert.alert('Demo Mode', 'Audio playback is only available with real music files. Please ensure your phone has music or connect to a music server.');
        }
      }
    } catch (error) {
      console.error('Error toggling play/pause:', error);
      Alert.alert('Error', 'Failed to control playback. Please check your music files and permissions.');
    }
  };

  const handleStop = async () => {
    try {
      await musicManager.stop();
    } catch (error) {
      console.error('Error stopping playback:', error);
    }
  };

  const handleNext = () => {
    if (songs.length > 0) {
      setCurrentSongIndex((prev) => (prev + 1) % songs.length);
    }
  };

  const handlePrevious = () => {
    if (songs.length > 0) {
      setCurrentSongIndex((prev) => (prev - 1 + songs.length) % songs.length);
    }
  };

  const handleVolumeChange = async () => {
    const newVolume = volume === 0.7 ? 0.3 : volume === 0.3 ? 0 : 0.7;
    setVolume(newVolume);
    try {
      await musicManager.setVolume(newVolume);
    } catch (error) {
      console.error('Error changing volume:', error);
    }
  };

  const showMusicInfo = () => {
    let sourceStatus = 'Demo Mode (No Music)';
    if (musicSource === 'phone') {
      sourceStatus = `Phone Music Library (${musicCount} songs)`;
    } else if (musicSource === 'server') {
      sourceStatus = `PC Music Server (${musicCount} songs)`;
    }
    
    const songInfo = currentSong ? `${currentSong.title} by ${currentSong.artist}` : 'No song selected';
    const sourceInfo = musicSource === 'phone' ? 'Using phone\'s music library' : 
                      musicSource === 'server' ? `Connected to: ${activeServerUrl}` : 
                      'No music source available';
    
    Alert.alert(
      'Music Player Info',
      `${sourceStatus}\n\n` +
      `Current song: ${songInfo}\n` +
      `Volume: ${Math.round(volume * 100)}%\n` +
      `Status: ${isPlaying ? 'Playing' : 'Paused'}\n\n` +
      `${sourceInfo}`,
      [
        { text: 'Refresh Songs', onPress: loadSongsFromMusicLibrary },
        { text: 'OK' }
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, compact && styles.compactContainer]}>
        <ActivityIndicator size="small" color="#2563eb" />
        <Text style={[styles.loadingText, compact && styles.compactText]}>
          Loading music...
        </Text>
      </View>
    );
  }

  if (!currentSong) {
    return (
      <View style={[styles.container, compact && styles.compactContainer]}>
        <Ionicons name="musical-note" size={compact ? 16 : 20} color="#6b7280" />
        <Text style={[styles.noSongText, compact && styles.compactText]}>
          No music available
        </Text>
        <TouchableOpacity style={styles.refreshButton} onPress={loadSongsFromMusicLibrary}>
          <Ionicons name="refresh" size={16} color="#2563eb" />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, compact && styles.compactContainer]}>
      <TouchableOpacity 
        style={styles.songInfo} 
        onPress={showMusicInfo}
        activeOpacity={0.7}
      >
        <Ionicons 
          name="musical-note" 
          size={compact ? 16 : 20} 
          color={isPlaying ? '#2563eb' : '#6b7280'} 
        />
        <View style={styles.songText}>
          <Text style={[styles.songTitle, compact && styles.compactText]} numberOfLines={1}>
            {currentSong.title}
          </Text>
          <Text style={[styles.songArtist, compact && styles.compactText]} numberOfLines={1}>
            {currentSong.artist}
          </Text>
          {musicSource === 'phone' && (
            <Text style={[styles.phoneBadge, compact && styles.compactText]}>
              Phone Music
            </Text>
          )}
          {musicSource === 'server' && (
            <Text style={[styles.serverBadge, compact && styles.compactText]}>
              Server
            </Text>
          )}
          {musicSource === 'none' && (
            <Text style={[styles.demoBadge, compact && styles.compactText]}>
              Demo Mode
            </Text>
          )}
        </View>
      </TouchableOpacity>
      
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.controlButton, compact && styles.compactButton]}
          onPress={handlePrevious}
        >
          <Ionicons name="play-skip-back" size={compact ? 14 : 16} color="#9ca3af" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, compact && styles.compactButton]}
          onPress={handleStop}
        >
          <Ionicons name="stop" size={compact ? 14 : 16} color="#dc2626" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.playButton, compact && styles.compactPlayButton]}
          onPress={handlePlayPause}
        >
          <Ionicons 
            name={isPlaying ? 'pause' : 'play'} 
            size={compact ? 16 : 20} 
            color="#ffffff" 
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, compact && styles.compactButton]}
          onPress={handleNext}
        >
          <Ionicons name="play-skip-forward" size={compact ? 14 : 16} color="#9ca3af" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, compact && styles.compactButton]}
          onPress={handleVolumeChange}
        >
          <Ionicons 
            name={volume === 0 ? 'volume-mute' : volume < 0.5 ? 'volume-low' : 'volume-high'} 
            size={compact ? 14 : 16} 
            color="#9ca3af" 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  compactContainer: {
    padding: 12,
  },
  songInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  songText: {
    marginLeft: 8,
    flex: 1,
  },
  songTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  songArtist: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  compactText: {
    fontSize: 12,
  },
  demoBadge: {
    fontSize: 10,
    color: '#f59e0b',
    marginTop: 2,
  },
  phoneBadge: {
    fontSize: 10,
    color: '#10b981',
    marginTop: 2,
  },
  serverBadge: {
    fontSize: 10,
    color: '#3b82f6',
    marginTop: 2,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlButton: {
    backgroundColor: '#374151',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  compactButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  playButton: {
    backgroundColor: '#2563eb',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  compactPlayButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  loadingText: {
    fontSize: 14,
    color: '#9ca3af',
    marginLeft: 8,
  },
  noSongText: {
    fontSize: 14,
    color: '#9ca3af',
    marginLeft: 8,
  },
  refreshButton: {
    padding: 4,
  },
}); 