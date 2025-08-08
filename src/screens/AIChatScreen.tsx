import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AIService, { ChatMessage } from '../utils/AIService';

const { width } = Dimensions.get('window');

export default function AIChatScreen() {
  const aiService = AIService.getInstance();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    checkAIStatus();
    loadChatHistory();
  }, []);

  const checkAIStatus = () => {
    setIsInitialized(aiService.isInitialized());
  };

  const loadChatHistory = () => {
    const history = aiService.getChatHistory();
    setMessages(history);
  };

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage = inputText.trim();
    setInputText('');
    setIsLoading(true);

    try {
      const response = await aiService.sendMessage(userMessage);
      loadChatHistory(); // Reload to get updated history
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateRideInsights = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const insights = await aiService.generateRideInsights();
      loadChatHistory();
    } catch (error) {
      console.error('Error generating insights:', error);
      Alert.alert('Error', 'Failed to generate insights. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getWeatherAdvice = async () => {
    Alert.prompt(
      'Weather Advice',
      'Enter your location:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Get Advice',
          onPress: async (location) => {
            if (location && location.trim()) {
              setIsLoading(true);
              try {
                await aiService.getWeatherAdvice(location.trim());
                loadChatHistory();
              } catch (error) {
                console.error('Error getting weather advice:', error);
                Alert.alert('Error', 'Failed to get weather advice. Please try again.');
              } finally {
                setIsLoading(false);
              }
            }
          },
        },
      ],
      'plain-text'
    );
  };

  const getEmergencyHelp = async () => {
    Alert.prompt(
      'Emergency Assistance',
      'Describe your situation:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Get Help',
          onPress: async (situation) => {
            if (situation && situation.trim()) {
              setIsLoading(true);
              try {
                await aiService.getEmergencyHelp(situation.trim());
                loadChatHistory();
              } catch (error) {
                console.error('Error getting emergency help:', error);
                Alert.alert('Error', 'Failed to get emergency help. Please try again.');
              } finally {
                setIsLoading(false);
              }
            }
          },
        },
      ],
      'plain-text'
    );
  };

  const clearChat = () => {
    Alert.alert(
      'Clear Chat',
      'Are you sure you want to clear the chat history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            aiService.clearChatHistory();
            setMessages([]);
          },
        },
      ]
    );
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => (
    <View style={[
      styles.messageContainer,
      item.role === 'user' ? styles.userMessage : styles.aiMessage
    ]}>
      <View style={[
        styles.messageBubble,
        item.role === 'user' ? styles.userBubble : styles.aiBubble
      ]}>
        <Text style={[
          styles.messageText,
          item.role === 'user' ? styles.userText : styles.aiText
        ]}>
          {item.content}
        </Text>
        <Text style={styles.timestamp}>
          {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.quickActionsContainer}>
      <TouchableOpacity
        style={styles.quickActionButton}
        onPress={generateRideInsights}
        disabled={isLoading}
      >
        <Ionicons name="analytics" size={20} color="#2563eb" />
        <Text style={styles.quickActionText}>Ride Insights</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.quickActionButton}
        onPress={getWeatherAdvice}
        disabled={isLoading}
      >
        <Ionicons name="partly-sunny" size={20} color="#059669" />
        <Text style={styles.quickActionText}>Weather</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.quickActionButton}
        onPress={getEmergencyHelp}
        disabled={isLoading}
      >
        <Ionicons name="warning" size={20} color="#dc2626" />
        <Text style={styles.quickActionText}>Emergency</Text>
      </TouchableOpacity>
    </View>
  );

  if (!isInitialized) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>RiderAI Assistant</Text>
          <Text style={styles.subtitle}>Your AI riding companion</Text>
        </View>
        
        <View style={styles.setupContainer}>
          <Ionicons name="chatbubble-ellipses" size={64} color="#6b7280" />
          <Text style={styles.setupTitle}>Setup Required</Text>
          <Text style={styles.setupText}>
            To use RiderAI, you need to configure your OpenAI API key in the settings.
          </Text>
          <TouchableOpacity style={styles.setupButton}>
            <Text style={styles.setupButtonText}>Go to Settings</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <Text style={styles.title}>RiderAI Assistant</Text>
        <Text style={styles.subtitle}>Your AI riding companion</Text>
        <TouchableOpacity style={styles.clearButton} onPress={clearChat}>
          <Ionicons name="trash" size={20} color="#6b7280" />
        </TouchableOpacity>
      </View>

      {messages.length === 0 && (
        <View style={styles.welcomeContainer}>
          <Ionicons name="motorcycle" size={64} color="#2563eb" />
          <Text style={styles.welcomeTitle}>Welcome to RiderAI!</Text>
          <Text style={styles.welcomeText}>
            I'm your AI riding assistant. I can help you with ride analysis, safety tips, weather advice, and more.
          </Text>
          {renderQuickActions()}
        </View>
      )}

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContainer}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#2563eb" />
          <Text style={styles.loadingText}>RiderAI is thinking...</Text>
        </View>
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Ask RiderAI anything..."
          placeholderTextColor="#6b7280"
          multiline
          maxLength={500}
          editable={!isLoading}
        />
        <TouchableOpacity
          style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={!inputText.trim() || isLoading}
        >
          <Ionicons 
            name="send" 
            size={20} 
            color={inputText.trim() && !isLoading ? '#ffffff' : '#6b7280'} 
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 14,
    color: '#9ca3af',
  },
  clearButton: {
    padding: 8,
  },
  setupContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  setupTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 16,
    marginBottom: 8,
  },
  setupText: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  setupButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  setupButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  welcomeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 16,
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  quickActionButton: {
    alignItems: 'center',
    backgroundColor: '#1f2937',
    padding: 16,
    borderRadius: 12,
    minWidth: 80,
  },
  quickActionText: {
    color: '#ffffff',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  messagesList: {
    flex: 1,
  },
  messagesContainer: {
    padding: 16,
  },
  messageContainer: {
    marginBottom: 16,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  aiMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: width * 0.8,
    padding: 12,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: '#2563eb',
  },
  aiBubble: {
    backgroundColor: '#1f2937',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: '#ffffff',
  },
  aiText: {
    color: '#ffffff',
  },
  timestamp: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#1f2937',
    margin: 16,
    borderRadius: 12,
  },
  loadingText: {
    color: '#9ca3af',
    marginLeft: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#1f2937',
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#374151',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#ffffff',
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#2563eb',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#374151',
  },
}); 