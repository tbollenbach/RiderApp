import * as Speech from 'expo-speech';

export interface VoiceSettings {
  enabled: boolean;
  voice: string;
  rate: number;
  pitch: number;
  volume: number;
}

class VoiceService {
  private static instance: VoiceService;
  private settings: VoiceSettings = {
    enabled: false,
    voice: 'en-US',
    rate: 0.9,
    pitch: 1.0,
    volume: 0.8,
  };
  private isSpeaking = false;
  private speechQueue: string[] = [];

  private constructor() {}

  static getInstance(): VoiceService {
    if (!VoiceService.instance) {
      VoiceService.instance = new VoiceService();
    }
    return VoiceService.instance;
  }

  // Initialize voice service
  initialize(): void {
    this.settings.enabled = true;
  }

  // Check if voice is enabled
  isEnabled(): boolean {
    return this.settings.enabled;
  }

  // Get voice settings
  getSettings(): VoiceSettings {
    return { ...this.settings };
  }

  // Update voice settings
  updateSettings(settings: Partial<VoiceSettings>): void {
    this.settings = { ...this.settings, ...settings };
  }

  // Speak text with badass voice
  async speak(text: string, priority: 'high' | 'normal' = 'normal'): Promise<void> {
    if (!this.settings.enabled) return;

    try {
      // Add to queue if already speaking
      if (this.isSpeaking) {
        if (priority === 'high') {
          this.speechQueue.unshift(text);
        } else {
          this.speechQueue.push(text);
        }
        return;
      }

      this.isSpeaking = true;
      
      // Speak the text
      await Speech.speak(text, {
        voice: this.settings.voice,
        rate: this.settings.rate,
        pitch: this.settings.pitch,
        volume: this.settings.volume,
        onDone: () => {
          this.isSpeaking = false;
          this.processQueue();
        },
        onError: (error) => {
          console.error('Speech error:', error);
          this.isSpeaking = false;
          this.processQueue();
        },
      });
    } catch (error) {
      console.error('Error speaking:', error);
      this.isSpeaking = false;
    }
  }

  // Process speech queue
  private async processQueue(): Promise<void> {
    if (this.speechQueue.length > 0 && !this.isSpeaking) {
      const nextText = this.speechQueue.shift();
      if (nextText) {
        await this.speak(nextText);
      }
    }
  }

  // Stop speaking
  stop(): void {
    Speech.stop();
    this.isSpeaking = false;
    this.speechQueue = [];
  }

  // Get available voices
  async getAvailableVoices(): Promise<string[]> {
    try {
      const voices = await Speech.getAvailableVoicesAsync();
      return voices.map(voice => voice.identifier);
    } catch (error) {
      console.error('Error getting voices:', error);
      return ['en-US', 'en-GB'];
    }
  }

  // Speak ride coaching with attitude
  async speakCoaching(coaching: string): Promise<void> {
    const badassCoaching = this.addBadassAttitude(coaching);
    await this.speak(badassCoaching, 'high');
  }

  // Speak speed alerts
  async speakSpeedAlert(currentSpeed: number, maxSpeed: number): Promise<void> {
    if (currentSpeed > maxSpeed * 0.9) {
      await this.speak(`Speed check! You're doing ${currentSpeed.toFixed(0)} km/h. Keep it under control, rider!`, 'high');
    }
  }

  // Speak fuel alerts
  async speakFuelAlert(remainingFuel: number, range: number): Promise<void> {
    if (remainingFuel <= 2) {
      await this.speak(`Fuel alert! You've got ${remainingFuel.toFixed(1)} gallons left. That's about ${range.toFixed(0)} miles. Time to refuel!`, 'high');
    }
  }

  // Speak weather alerts
  async speakWeatherAlert(weather: string): Promise<void> {
    await this.speak(`Weather update: ${weather}. Stay safe out there!`, 'normal');
  }

  // Add badass attitude to text
  private addBadassAttitude(text: string): string {
    // Add motorcycle slang and attitude
    const badassPhrases = [
      'Listen up, rider!',
      'Here\'s the real deal:',
      'Check this out:',
      'You got this:',
      'Let\'s talk straight:',
      'Here\'s what\'s up:',
    ];

    const randomPhrase = badassPhrases[Math.floor(Math.random() * badassPhrases.length)];
    return `${randomPhrase} ${text}`;
  }

  // Speak real-time performance updates
  async speakPerformanceUpdate(stats: {
    speed: number;
    distance: number;
    duration: number;
  }): Promise<void> {
    const { speed, distance, duration } = stats;
    const message = `You're cruising at ${speed.toFixed(0)} km/h, covered ${distance.toFixed(1)} km in ${this.formatTime(duration)}. Looking good, rider!`;
    await this.speak(message, 'normal');
  }

  // Format time for speech
  private formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} minute${minutes > 1 ? 's' : ''}`;
    } else {
      return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    }
  }

  // Speak emergency alerts
  async speakEmergencyAlert(alert: string): Promise<void> {
    await this.speak(`EMERGENCY ALERT: ${alert}`, 'high');
  }

  // Speak achievement notifications
  async speakAchievement(achievement: string): Promise<void> {
    await this.speak(`Achievement unlocked: ${achievement}! Hell yeah!`, 'high');
  }

  // Speak navigation instructions
  async speakNavigation(instruction: string): Promise<void> {
    await this.speak(instruction, 'normal');
  }

  // Check if currently speaking
  isCurrentlySpeaking(): boolean {
    return this.isSpeaking;
  }

  // Get queue length
  getQueueLength(): number {
    return this.speechQueue.length;
  }
}

export default VoiceService; 