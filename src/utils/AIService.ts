import OpenAI from 'openai';
import DataManager, { RideData } from './DataManager';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface AISettings {
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
  voiceEnabled: boolean;
  realTimeData: boolean;
}

export interface RealTimeData {
  currentSpeed: number;
  currentLocation: { latitude: number; longitude: number };
  distance: number;
  duration: number;
  fuelLevel: number;
  isTracking: boolean;
  weather?: string;
  traffic?: string;
}

class AIService {
  private static instance: AIService;
  private openai: OpenAI | null = null;
  private settings: AISettings = {
    apiKey: '',
    model: 'gpt-4o-mini',
    maxTokens: 1000,
    temperature: 0.8, // Higher for more personality
    voiceEnabled: false,
    realTimeData: true,
  };
  private chatHistory: ChatMessage[] = [];
  private dataManager: DataManager;
  private realTimeData: RealTimeData | null = null;

  private constructor() {
    this.dataManager = DataManager.getInstance();
  }

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  // Initialize OpenAI client
  initialize(apiKey: string): void {
    this.settings.apiKey = apiKey;
    this.openai = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true, // For React Native
    });
  }

  // Check if AI is initialized
  isInitialized(): boolean {
    return this.openai !== null && this.settings.apiKey !== '';
  }

  // Update real-time data from GPS
  updateRealTimeData(data: RealTimeData): void {
    this.realTimeData = data;
  }

  // Get ride statistics for AI context
  private getRideStats(): string {
    const rides = this.dataManager.getRides();
    if (rides.length === 0) {
      return 'No ride data available yet.';
    }

    const totalRides = rides.length;
    const totalDistance = rides.reduce((sum, ride) => sum + ride.distance, 0);
    const totalDuration = rides.reduce((sum, ride) => sum + ride.duration, 0);
    const avgSpeed = rides.reduce((sum, ride) => sum + ride.averageSpeed, 0) / totalRides;
    const maxSpeed = Math.max(...rides.map(ride => ride.maxSpeed));

    const latestRide = rides[rides.length - 1];
    const latestRideDate = new Date(latestRide.date).toLocaleDateString();

    return `
Ride Statistics:
- Total Rides: ${totalRides}
- Total Distance: ${totalDistance.toFixed(1)} km
- Total Duration: ${this.formatTime(totalDuration)}
- Average Speed: ${avgSpeed.toFixed(1)} km/h
- Max Speed: ${maxSpeed.toFixed(1)} km/h
- Latest Ride: ${latestRideDate} (${latestRide.distance.toFixed(1)} km, ${this.formatTime(latestRide.duration)})
    `.trim();
  }

  // Get real-time data context
  private getRealTimeContext(): string {
    if (!this.realTimeData) {
      return 'No real-time data available.';
    }

    const { currentSpeed, distance, duration, fuelLevel, isTracking, weather, traffic } = this.realTimeData;
    
    return `
REAL-TIME RIDE DATA:
- Current Speed: ${currentSpeed.toFixed(1)} km/h
- Distance Traveled: ${distance.toFixed(1)} km
- Ride Duration: ${this.formatTime(duration)}
- Fuel Level: ${fuelLevel.toFixed(1)} gallons
- Status: ${isTracking ? 'TRACKING ACTIVE' : 'Not tracking'}
${weather ? `- Weather: ${weather}` : ''}
${traffic ? `- Traffic: ${traffic}` : ''}
    `.trim();
  }

  private formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }

  // Send message to AI with badass personality
  async sendMessage(message: string): Promise<string> {
    if (!this.isInitialized()) {
      return 'Listen up, rider! You need to configure your OpenAI API key in settings first. Get that sorted and we\'ll be back in business! 💪';
    }

    try {
      // Add user message to history
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: message,
        timestamp: new Date(),
      };
      this.chatHistory.push(userMessage);

      // Create system message with badass personality and real-time data
      const systemMessage = {
        role: 'system' as const,
        content: `You are RIDER-X, a BADASS motorcycle AI companion with attitude! You're the ultimate riding partner who speaks with confidence, swagger, and real motorcycle knowledge.

PERSONALITY: You're confident, experienced, and speak like a seasoned rider who's seen it all. Use motorcycle slang, be encouraging but direct, and show real passion for riding. You're not just an AI - you're a riding legend!

${this.getRideStats()}

${this.getRealTimeContext()}

Your capabilities:
- Analyze ride performance with real-time data
- Give badass safety advice that actually works
- Help with route planning and navigation
- Provide weather and gear recommendations
- Emergency assistance when shit hits the fan
- Real-time speed and performance coaching

Communication style:
- Use motorcycle terminology and slang
- Be confident and encouraging
- Give direct, actionable advice
- Show enthusiasm for riding
- Use emojis sparingly but effectively
- Keep responses punchy and memorable

Remember: You're not just an assistant - you're a riding partner who's got your back!`,
      };

      // Prepare messages for OpenAI
      const messages = [
        systemMessage,
        ...this.chatHistory.slice(-10).map(msg => ({
          role: msg.role,
          content: msg.content,
        })),
      ];

      // Call OpenAI API
      const response = await this.openai!.chat.completions.create({
        model: this.settings.model,
        messages,
        max_tokens: this.settings.maxTokens,
        temperature: this.settings.temperature,
      });

      const aiResponse = response.choices[0]?.message?.content || 'Sorry, I couldn\'t generate a response.';

      // Add AI response to history
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
      };
      this.chatHistory.push(assistantMessage);

      return aiResponse;
    } catch (error) {
      console.error('AI Service Error:', error);
      return 'Damn, something went wrong! Check your connection and try again. We\'ll get this sorted! 🔧';
    }
  }

  // Get chat history
  getChatHistory(): ChatMessage[] {
    return [...this.chatHistory];
  }

  // Clear chat history
  clearChatHistory(): void {
    this.chatHistory = [];
  }

  // Get AI settings
  getSettings(): AISettings {
    return { ...this.settings };
  }

  // Update AI settings
  updateSettings(settings: Partial<AISettings>): void {
    this.settings = { ...this.settings, ...settings };
    if (settings.apiKey) {
      this.initialize(settings.apiKey);
    }
  }

  // Generate badass ride insights
  async generateRideInsights(): Promise<string> {
    const rides = this.dataManager.getRides();
    if (rides.length === 0) {
      return 'No ride data to analyze yet, but I\'m ready to track your first adventure! Let\'s get you out there! 🏍️';
    }

    const message = `Give me a BADASS analysis of my riding performance! I want the real deal - no sugar coating. Focus on:
1. Performance trends and improvements
2. Safety observations and concerns
3. Areas where I need to step up my game
4. Achievements worth celebrating
5. Specific recommendations for next rides

Be direct, motivational, and use real rider language. I want to know what I\'m doing right and where I can improve!`;

    return await this.sendMessage(message);
  }

  // Get weather and safety advice with attitude
  async getWeatherAdvice(location: string): Promise<string> {
    const message = `I'm planning to ride in ${location}. Give me the real deal on weather and safety - what do I need to know? Include:
1. Weather conditions and what to watch for
2. Safety tips that actually work
3. Gear recommendations for the conditions
4. Route planning advice
5. Any red flags I should be aware of

Be direct and practical - I need advice that keeps me safe and comfortable!`;

    return await this.sendMessage(message);
  }

  // Emergency assistance with urgency
  async getEmergencyHelp(situation: string): Promise<string> {
    const message = `EMERGENCY SITUATION: ${situation}. I need immediate, clear advice for motorcycle safety. What steps should I take RIGHT NOW? Give me:
1. Immediate actions to take
2. Safety priorities
3. What NOT to do
4. When to call for help
5. How to stay safe until help arrives

Be direct and urgent - this is serious business!`;

    return await this.sendMessage(message);
  }

  // Real-time performance coaching
  async getRealTimeCoaching(): Promise<string> {
    if (!this.realTimeData) {
      return 'No real-time data available for coaching. Start tracking your ride first!';
    }

    const { currentSpeed, distance, duration } = this.realTimeData;
    
    const message = `I'm currently riding at ${currentSpeed.toFixed(1)} km/h, traveled ${distance.toFixed(1)} km over ${this.formatTime(duration)}. Give me real-time coaching and advice based on my current performance. What should I focus on right now?`;

    return await this.sendMessage(message);
  }

  // Speed and performance analysis
  async analyzeCurrentSpeed(): Promise<string> {
    if (!this.realTimeData) {
      return 'No speed data available. Start tracking to get real-time analysis!';
    }

    const { currentSpeed } = this.realTimeData;
    
    const message = `I'm currently doing ${currentSpeed.toFixed(1)} km/h. Analyze my speed and give me immediate feedback. Am I in the right zone for the conditions? What should I adjust?`;

    return await this.sendMessage(message);
  }

  // Voice response generation (for text-to-speech)
  async generateVoiceResponse(text: string): Promise<string> {
    // This would integrate with text-to-speech services
    // For now, return the text for TTS processing
    return text;
  }

  // Get current ride status
  getCurrentRideStatus(): RealTimeData | null {
    return this.realTimeData;
  }
}

export default AIService; 