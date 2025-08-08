import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as MediaLibrary from 'expo-media-library';
import { SERVER_CONFIG } from '../config/serverConfig';

export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  uri: string;
  artwork?: string;
  filename?: string;
  size?: number;
  addedAt?: string;
}

export interface Playlist {
  id: string;
  name: string;
  songs: Song[];
  createdAt: string;
  updatedAt: string;
}

export interface MusicSettings {
  autoPlay: boolean;
  shuffle: boolean;
  repeat: boolean;
  volume: number;
  crossfade: boolean;
}

class MusicManager {
  private static instance: MusicManager;
  private playlists: Playlist[] = [];
  private settings: MusicSettings = {
    autoPlay: false,
    shuffle: false,
    repeat: false,
    volume: 0.7,
    crossfade: false,
  };
  private sound: Audio.Sound | null = null;
  private currentSong: Song | null = null;
  private isPlaying = false;
  private listeners: Array<() => void> = [];
  private serverSongs: Song[] = [];
  private phoneSongs: Song[] = [];
  private audioMode: Audio.Mode | null = null;
  private mediaLibraryPermission: boolean = false;

  static getInstance(): MusicManager {
    if (!MusicManager.instance) {
      MusicManager.instance = new MusicManager();
    }
    return MusicManager.instance;
  }

  // Initialize audio mode
  async initializeAudio(): Promise<void> {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
    } catch (error) {
      console.error('Error initializing audio mode:', error);
    }
  }

  // Request media library permissions
  async requestMediaLibraryPermission(): Promise<boolean> {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      this.mediaLibraryPermission = status === 'granted';
      console.log('Media library permission:', status);
      return this.mediaLibraryPermission;
    } catch (error) {
      console.error('Error requesting media library permission:', error);
      return false;
    }
  }

  // Load songs from phone's media library
  async loadPhoneSongs(): Promise<void> {
    try {
      if (!this.mediaLibraryPermission) {
        const granted = await this.requestMediaLibraryPermission();
        if (!granted) {
          console.log('Media library permission not granted');
          return;
        }
      }

      // Get audio assets from media library
      const media = await MediaLibrary.getAssetsAsync({
        mediaType: 'audio',
        first: 1000, // Load up to 1000 songs
        sortBy: MediaLibrary.SortBy.creationTime,
      });

      this.phoneSongs = media.assets.map((asset): Song => ({
        id: asset.id,
        title: asset.filename.replace(/\.[^/.]+$/, ''), // Remove file extension
        artist: 'Unknown Artist', // MediaLibrary doesn't provide artist info directly
        album: 'Unknown Album',
        duration: asset.duration || 0,
        uri: asset.uri,
        filename: asset.filename,
        size: asset.width, // This is actually file size in bytes for audio
        addedAt: new Date(asset.creationTime).toISOString(),
      }));

      console.log(`Loaded ${this.phoneSongs.length} songs from phone's media library`);
    } catch (error) {
      console.error('Error loading songs from phone:', error);
    }
  }

  // Load data from AsyncStorage
  async loadData(): Promise<void> {
    try {
      const playlistsData = await AsyncStorage.getItem('playlists');
      const settingsData = await AsyncStorage.getItem('musicSettings');

      if (playlistsData) {
        this.playlists = JSON.parse(playlistsData);
      }
      if (settingsData) {
        this.settings = JSON.parse(settingsData);
      }

      // Initialize audio mode
      await this.initializeAudio();

      // Load songs from phone first (priority)
      await this.loadPhoneSongs();

      // Load songs from server as fallback
      if (this.phoneSongs.length === 0) {
        await this.loadServerSongs();
      }
    } catch (error) {
      console.error('Error loading music data:', error);
    }
  }

  // Load songs from music server
  async loadServerSongs(): Promise<void> {
    try {
      const response = await fetch(`${SERVER_CONFIG.MUSIC_SERVER_URL}${SERVER_CONFIG.SONGS_ENDPOINT}`);
      if (response.ok) {
        this.serverSongs = await response.json();
        console.log(`Loaded ${this.serverSongs.length} songs from server`);
      } else {
        console.error('Failed to load songs from server:', response.status);
      }
    } catch (error) {
      console.error('Error loading songs from server:', error);
      // Try fallback URLs
      for (const fallbackUrl of SERVER_CONFIG.FALLBACK_URLS) {
        try {
          const response = await fetch(`${fallbackUrl}${SERVER_CONFIG.SONGS_ENDPOINT}`);
          if (response.ok) {
            this.serverSongs = await response.json();
            console.log(`Loaded ${this.serverSongs.length} songs from fallback server: ${fallbackUrl}`);
            break;
          }
        } catch (fallbackError) {
          console.error(`Fallback server failed: ${fallbackUrl}`, fallbackError);
        }
      }
    }
  }

  // Save data to AsyncStorage
  async saveData(): Promise<void> {
    try {
      await AsyncStorage.setItem('playlists', JSON.stringify(this.playlists));
      await AsyncStorage.setItem('musicSettings', JSON.stringify(this.settings));
    } catch (error) {
      console.error('Error saving music data:', error);
    }
  }

  // Get all songs (prioritize phone songs, fallback to server songs)
  async getAllSongs(): Promise<Song[]> {
    // If we have phone songs, return them
    if (this.phoneSongs.length > 0) {
      return [...this.phoneSongs];
    }
    
    // Otherwise try to load phone songs
    await this.loadPhoneSongs();
    if (this.phoneSongs.length > 0) {
      return [...this.phoneSongs];
    }
    
    // Fallback to server songs
    if (this.serverSongs.length === 0) {
      await this.loadServerSongs();
    }
    return [...this.serverSongs];
  }

  // Get all songs from server (kept for backward compatibility)
  async getServerSongs(): Promise<Song[]> {
    return this.getAllSongs();
  }

  // Get phone songs specifically
  async getPhoneSongs(): Promise<Song[]> {
    if (this.phoneSongs.length === 0) {
      await this.loadPhoneSongs();
    }
    return [...this.phoneSongs];
  }

  // Search songs by title or artist
  async searchSongs(query: string): Promise<Song[]> {
    const allSongs = await this.getAllSongs();
    const lowercaseQuery = query.toLowerCase();
    
    return allSongs.filter(song => 
      song.title.toLowerCase().includes(lowercaseQuery) ||
      song.artist.toLowerCase().includes(lowercaseQuery) ||
      song.album.toLowerCase().includes(lowercaseQuery) ||
      (song.filename && song.filename.toLowerCase().includes(lowercaseQuery))
    );
  }

  // Playlist management
  getPlaylists(): Playlist[] {
    return [...this.playlists];
  }

  createPlaylist(name: string): Playlist {
    const playlist: Playlist = {
      id: Date.now().toString(),
      name,
      songs: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    this.playlists.push(playlist);
    this.saveData();
    this.notifyListeners();
    return playlist;
  }

  updatePlaylist(playlistId: string, updates: Partial<Playlist>): void {
    const index = this.playlists.findIndex(p => p.id === playlistId);
    if (index !== -1) {
      this.playlists[index] = {
        ...this.playlists[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      this.saveData();
      this.notifyListeners();
    }
  }

  deletePlaylist(playlistId: string): void {
    this.playlists = this.playlists.filter(p => p.id !== playlistId);
    this.saveData();
    this.notifyListeners();
  }

  addSongToPlaylist(playlistId: string, song: Song): void {
    const playlist = this.playlists.find(p => p.id === playlistId);
    if (playlist && !playlist.songs.find(s => s.id === song.id)) {
      playlist.songs.push(song);
      playlist.updatedAt = new Date().toISOString();
      this.saveData();
      this.notifyListeners();
    }
  }

  removeSongFromPlaylist(playlistId: string, songId: string): void {
    const playlist = this.playlists.find(p => p.id === playlistId);
    if (playlist) {
      playlist.songs = playlist.songs.filter(s => s.id !== songId);
      playlist.updatedAt = new Date().toISOString();
      this.saveData();
      this.notifyListeners();
    }
  }

  // Music playback
  async playSong(song: Song): Promise<void> {
    try {
      // Stop any currently playing audio
      if (this.sound) {
        await this.sound.unloadAsync();
        this.sound = null;
      }

      // Create new sound object
      this.sound = new Audio.Sound();
      
      // Use the song URI from the server
      const songUri = song.uri;
      console.log('Playing song:', song.title, 'URI:', songUri);
      
      // Load the audio file
      await this.sound.loadAsync({ uri: songUri }, { shouldPlay: false });
      
      // Set volume
      await this.sound.setVolumeAsync(this.settings.volume);
      
      // Start playing
      await this.sound.playAsync();
      
      this.currentSong = song;
      this.isPlaying = true;
      this.notifyListeners();
      
      console.log('Successfully started playing:', song.title);
    } catch (error) {
      console.error('Error playing song:', error);
      // Try to clean up on error
      if (this.sound) {
        try {
          await this.sound.unloadAsync();
        } catch (cleanupError) {
          console.error('Error cleaning up sound:', cleanupError);
        }
        this.sound = null;
      }
      this.isPlaying = false;
      this.notifyListeners();
      throw error;
    }
  }

  async pause(): Promise<void> {
    if (this.sound && this.isPlaying) {
      try {
        await this.sound.pauseAsync();
        this.isPlaying = false;
        this.notifyListeners();
      } catch (error) {
        console.error('Error pausing audio:', error);
      }
    }
  }

  async resume(): Promise<void> {
    if (this.sound && !this.isPlaying) {
      try {
        await this.sound.playAsync();
        this.isPlaying = true;
        this.notifyListeners();
      } catch (error) {
        console.error('Error resuming audio:', error);
      }
    }
  }

  async stop(): Promise<void> {
    if (this.sound) {
      try {
        await this.sound.stopAsync();
        await this.sound.unloadAsync();
      } catch (error) {
        console.error('Error stopping audio:', error);
      }
      this.sound = null;
      this.currentSong = null;
      this.isPlaying = false;
      this.notifyListeners();
    }
  }

  async setVolume(volume: number): Promise<void> {
    this.settings.volume = Math.max(0, Math.min(1, volume));
    if (this.sound) {
      try {
        await this.sound.setVolumeAsync(this.settings.volume);
      } catch (error) {
        console.error('Error setting volume:', error);
      }
    }
    this.saveData();
    this.notifyListeners();
  }

  // Settings management
  getSettings(): MusicSettings {
    return { ...this.settings };
  }

  updateSettings(settings: Partial<MusicSettings>): void {
    this.settings = { ...this.settings, ...settings };
    this.saveData();
    this.notifyListeners();
  }

  // Getters for current state
  getCurrentSong(): Song | null {
    return this.currentSong;
  }

  isCurrentlyPlaying(): boolean {
    return this.isPlaying;
  }

  // Check if using phone music
  isUsingPhoneMusic(): boolean {
    return this.phoneSongs.length > 0;
  }

  // Get music source info
  getMusicSourceInfo(): { source: 'phone' | 'server' | 'none'; count: number } {
    if (this.phoneSongs.length > 0) {
      return { source: 'phone', count: this.phoneSongs.length };
    } else if (this.serverSongs.length > 0) {
      return { source: 'server', count: this.serverSongs.length };
    } else {
      return { source: 'none', count: 0 };
    }
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

export default MusicManager; 