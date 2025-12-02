import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  AppState,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { scheduleStarterFeedingReminder } from '../utils/notificationService';

const StarterTimerScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { starterName = 'Your Starter', starterId = 1 } = route.params || {};
  
  // Timer state
  const [minutes, setMinutes] = useState(12 * 60); // Default to 12 hours (720 minutes)
  const [isRunning, setIsRunning] = useState(false);
  const [remainingTime, setRemainingTime] = useState(12 * 60 * 60 * 1000); // in milliseconds
  const [endTime, setEndTime] = useState(null);
  const appState = useRef(AppState.currentState);
  const timerRef = useRef(null);

  // Handle app state changes (background/foreground)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active' &&
        isRunning &&
        endTime
      ) {
        // App has come to the foreground
        const now = new Date().getTime();
        const remaining = Math.max(0, endTime - now);
        setRemainingTime(remaining);
      }
      
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [isRunning, endTime]);

  // Timer effect
  useEffect(() => {
    if (isRunning) {
      const now = new Date().getTime();
      const end = now + remainingTime;
      setEndTime(end);
      
      timerRef.current = setInterval(() => {
        const current = new Date().getTime();
        const remaining = Math.max(0, end - current);
        
        if (remaining === 0) {
          clearInterval(timerRef.current);
          setIsRunning(false);
          Alert.alert(
            'Time to feed your starter!',
            `${starterName} is ready to be fed now.`,
            [
              {
                text: 'Got it!',
                onPress: () => console.log('Feeding acknowledged'),
              },
            ]
          );
        }
        
        setRemainingTime(remaining);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning, remainingTime, starterName]);

  // Format time as HH:MM:SS
  const formatTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Start timer
  const startTimer = () => {
    setRemainingTime(minutes * 60 * 1000);
    setIsRunning(true);
  };

  // Pause timer
  const pauseTimer = () => {
    setIsRunning(false);
  };

  // Reset timer
  const resetTimer = () => {
    setIsRunning(false);
    setRemainingTime(minutes * 60 * 1000);
  };

  // Set timer duration
  const setTimerDuration = (mins) => {
    if (!isRunning) {
      setMinutes(mins);
      setRemainingTime(mins * 60 * 1000);
    }
  };

  // Schedule a notification
  const scheduleReminder = () => {
    if (!isRunning) return;
    
    const reminderTime = new Date(Date.now() + remainingTime);
    const notificationId = scheduleStarterFeedingReminder(
      starterId,
      starterName,
      reminderTime
    );
    
    Alert.alert(
      'Reminder Set',
      `You'll be notified when it's time to feed ${starterName}.`,
      [{ text: 'OK' }]
    );
  };

  // Common time presets
  const timePresets = [
    { label: '8h', minutes: 8 * 60 },
    { label: '12h', minutes: 12 * 60 },
    { label: '24h', minutes: 24 * 60 },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{starterName} Feeding Timer</Text>
      </View>
      
      <View style={styles.timerSection}>
        <View style={styles.timerDisplay}>
          <Text style={styles.timerText}>{formatTime(remainingTime)}</Text>
        </View>
        
        <View style={styles.controlsContainer}>
          {!isRunning ? (
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={startTimer}
            >
              <Ionicons name="play" size={24} color="#FFFFFF" />
              <Text style={styles.primaryButtonText}>Start Timer</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={pauseTimer}
            >
              <Ionicons name="pause" size={24} color="#4B5563" />
              <Text style={styles.secondaryButtonText}>Pause</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={[styles.secondaryButton, { marginLeft: 12 }]}
            onPress={resetTimer}
          >
            <Ionicons name="refresh" size={24} color="#4B5563" />
            <Text style={styles.secondaryButtonText}>Reset</Text>
          </TouchableOpacity>
        </View>
        
        {isRunning && (
          <TouchableOpacity 
            style={styles.reminderButton}
            onPress={scheduleReminder}
          >
            <Ionicons name="notifications-outline" size={20} color="#D97706" />
            <Text style={styles.reminderButtonText}>Set Phone Reminder</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.presetsSection}>
        <Text style={styles.sectionTitle}>Quick Presets</Text>
        <View style={styles.presetButtons}>
          {timePresets.map((preset, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.presetButton,
                minutes === preset.minutes && styles.activePresetButton
              ]}
              onPress={() => setTimerDuration(preset.minutes)}
              disabled={isRunning}
            >
              <Text
                style={[
                  styles.presetButtonText,
                  minutes === preset.minutes && styles.activePresetButtonText
                ]}
              >
                {preset.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      <View style={styles.infoSection}>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Feeding Tips</Text>
          <Text style={styles.infoText}>
            • Room temperature (70-75°F): Feed every 12 hours{'\n'}
            • Warmer environments (75-85°F): Feed every 8 hours{'\n'}
            • Refrigerated: Feed once per week{'\n'}
            • Always discard half before feeding for best results
          </Text>
        </View>
        
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>How to Feed {starterName}</Text>
          <Text style={styles.infoText}>
            1. Remove starter from container{'\n'}
            2. Discard all but 50g of starter{'\n'}
            3. Add 50g water and stir to dissolve{'\n'}
            4. Add 50g flour and mix thoroughly{'\n'}
            5. Cover loosely and set timer
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB', // gray-200
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937', // gray-800
  },
  timerSection: {
    alignItems: 'center',
    padding: 24,
    marginBottom: 16,
  },
  timerDisplay: {
    backgroundColor: '#F9FAFB', // gray-50
    borderRadius: 16,
    width: '100%',
    paddingVertical: 32,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB', // gray-200
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
    fontVariant: ['tabular-nums'],
    color: '#1F2937', // gray-800
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D97706', // amber-600
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flex: 1,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6', // gray-100
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  secondaryButtonText: {
    color: '#4B5563', // gray-600
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  reminderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    padding: 10,
  },
  reminderButtonText: {
    color: '#D97706', // amber-600
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  presetsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#1F2937', // gray-800
  },
  presetButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  presetButton: {
    flex: 1,
    backgroundColor: '#F9FAFB', // gray-50
    borderRadius: 8,
    paddingVertical: 12,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB', // gray-200
  },
  activePresetButton: {
    backgroundColor: '#FEF3C7', // amber-100
    borderColor: '#F59E0B', // amber-500
  },
  presetButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4B5563', // gray-600
  },
  activePresetButtonText: {
    color: '#92400E', // amber-800
  },
  infoSection: {
    padding: 16,
  },
  infoCard: {
    backgroundColor: '#F9FAFB', // gray-50
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB', // gray-200
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#1F2937', // gray-800
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#4B5563', // gray-600
  },
});

export default StarterTimerScreen;