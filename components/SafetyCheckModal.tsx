import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ActivityIndicator,
  Alert,
  Animated,
} from 'react-native';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import { api } from '../lib/api';

interface SafetyCheckModalProps {
  visible: boolean;
  onClose: () => void;
  onThumbsUp: () => void;
  onThumbsDown: () => void;
  phone: string;
  token: string;
}

const RESPONSE_TIMEOUT_SECONDS = 120; // 2 minutes

export default function SafetyCheckModal({
  visible,
  onClose,
  onThumbsUp,
  onThumbsDown,
  phone,
  token,
}: SafetyCheckModalProps) {
  const [countdown, setCountdown] = useState(RESPONSE_TIMEOUT_SECONDS);
  const [responding, setResponding] = useState(false);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const warningIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // ------------------------------------------------------------------
  // Haptic helpers (no audio — siren is practitioner-only)
  // ------------------------------------------------------------------

  const startWarningHaptics = () => {
    if (warningIntervalRef.current) clearInterval(warningIntervalRef.current);
    // Haptic pulse every 2 seconds during the last 30 seconds
    warningIntervalRef.current = setInterval(() => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }, 2000);
  };

  const stopWarningHaptics = () => {
    if (warningIntervalRef.current) {
      clearInterval(warningIntervalRef.current);
      warningIntervalRef.current = null;
    }
  };

  // ------------------------------------------------------------------
  // Pulse animation for the countdown in the last 30 seconds
  // ------------------------------------------------------------------
  const startPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      ])
    ).start();
  };

  const stopPulse = () => {
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);
  };

  // ------------------------------------------------------------------
  // Lifecycle
  // ------------------------------------------------------------------

  useEffect(() => {
    if (visible) {
      // Reset state
      setCountdown(RESPONSE_TIMEOUT_SECONDS);
      setResponding(false);
      stopPulse();

      // Single haptic to alert the user the modal has appeared (no audio — siren is for practitioners only)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      // Start countdown tick
      countdownIntervalRef.current = setInterval(() => {
        setCountdown((prev) => {
          const next = prev - 1;

          // Last 30 seconds: switch to warning haptic mode + pulse animation
          if (next === 30) {
            startWarningHaptics();
            startPulse();
          }

          if (next <= 0) {
            if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
            handleAutoTimeout();
            return 0;
          }
          return next;
        });
      }, 1000);
    }

    // Cleanup when modal hides
    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      stopWarningHaptics();
      stopPulse();
    };
  }, [visible]);

  // ------------------------------------------------------------------
  // Action handlers
  // ------------------------------------------------------------------

  const handleAutoTimeout = async () => {
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    stopWarningHaptics();
    stopPulse();

    // Final urgent haptic burst before sending emergency
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

    setResponding(true);
    await triggerEmergencyHelp();
    onThumbsDown();

    setTimeout(() => {
      onClose();
      setResponding(false);
    }, 1000);
  };

  const triggerEmergencyHelp = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Error', 'Location permission is required to send emergency help.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const helpData = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        phone: phone,
        timestamp: new Date().toISOString(),
      };

      await api.sendEmergencyHelp(helpData, token);

      Alert.alert(
        'Emergency Help Sent',
        'Your emergency request has been automatically sent. Help is on the way!',
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      console.error('Error sending emergency help:', error);
      const errorMessage =
        error.message || 'Failed to send emergency request. Please use the emergency button manually.';
      Alert.alert('Error', errorMessage, [{ text: 'OK' }]);
    }
  };

  const handleThumbsUp = async () => {
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    stopWarningHaptics();
    stopPulse();
    setResponding(true);
    onThumbsUp();
    setTimeout(() => {
      onClose();
      setResponding(false);
    }, 500);
  };

  const handleThumbsDown = async () => {
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    stopWarningHaptics();
    stopPulse();
    setResponding(true);
    await triggerEmergencyHelp();
    onThumbsDown();
    setTimeout(() => {
      onClose();
      setResponding(false);
    }, 1000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isWarningPhase = countdown <= 30 && countdown > 0;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, isWarningPhase && styles.modalContainerWarning]}>
          <Text style={styles.title}>Are you okay?</Text>
          <Text style={styles.subtitle}>
            Please confirm your safety by selecting an option below.
          </Text>

          {countdown > 0 && !responding && (
            <Animated.Text
              style={[
                styles.countdown,
                isWarningPhase && styles.countdownWarning,
                isWarningPhase && { transform: [{ scale: pulseAnim }] },
              ]}
            >
              {isWarningPhase ? '⚠️ ' : ''}
              Auto-emergency in: {formatTime(countdown)}
            </Animated.Text>
          )}

          {responding ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#EF4444" />
              <Text style={styles.loadingText}>Processing...</Text>
            </View>
          ) : (
            <View style={styles.buttonsContainer}>
              <Pressable
                style={[styles.emojiButton, styles.thumbsUpButton]}
                onPress={handleThumbsUp}
              >
                <Text style={styles.emoji}>👍</Text>
                <Text style={styles.buttonLabel}>I'm okay</Text>
              </Pressable>

              <Pressable
                style={[styles.emojiButton, styles.thumbsDownButton]}
                onPress={handleThumbsDown}
              >
                <Text style={styles.emoji}>👎</Text>
                <Text style={styles.buttonLabel}>I need help</Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    width: '85%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  modalContainerWarning: {
    borderColor: '#EF4444',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 12,
    color: '#1F2937',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  countdown: {
    fontSize: 18,
    fontWeight: '600',
    color: '#EF4444',
    marginBottom: 30,
    textAlign: 'center',
  },
  countdownWarning: {
    fontSize: 22,
    fontWeight: '800',
    color: '#DC2626',
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 20,
  },
  emojiButton: {
    flex: 1,
    padding: 30,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 150,
    borderWidth: 3,
  },
  thumbsUpButton: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  thumbsDownButton: {
    backgroundColor: '#FEF2F2',
    borderColor: '#EF4444',
  },
  emoji: {
    fontSize: 60,
    marginBottom: 12,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
});
