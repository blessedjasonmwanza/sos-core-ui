import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';

class SirenService {
  private sound: Audio.Sound | null = null;
  private isPlaying: boolean = false;
  private hapticInterval: any = null;

  async playSiren() {
    try {
      // Stop any existing sound/haptics
      if (this.isPlaying) {
        await this.stopSiren();
      }

      console.log('🔊 Preparing emergency siren...');

      // Request audio permissions and configure audio mode
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      // Load and play the emergency alarm sound
      const { sound } = await Audio.Sound.createAsync(
        require('../assets/sounds/emergency-alarm.mp3'),
        {
          shouldPlay: true,
          isLooping: true,
          volume: 1.0
        }
      );

      this.sound = sound;
      this.isPlaying = true;

      // Start haptic feedback loop
      this.startHaptics();

      console.log('🚨 SIREN ALERT: Sound and haptics active!');

    } catch (error: any) {
      console.error('❌ Error playing siren:', error);
      this.isPlaying = false;
    }
  }

  private startHaptics() {
    // Vibrate immediately
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

    // Repeat vibration pattern while siren is playing
    this.hapticInterval = setInterval(() => {
      if (this.isPlaying) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } else {
        this.stopHaptics();
      }
    }, 1500);
  }

  private stopHaptics() {
    if (this.hapticInterval) {
      clearInterval(this.hapticInterval);
      this.hapticInterval = null;
    }
  }

  async stopSiren() {
    try {
      this.isPlaying = false;
      this.stopHaptics();

      if (this.sound) {
        await this.sound.stopAsync();
        await this.sound.unloadAsync();
        this.sound = null;
      }

      console.log('🔇 Siren and haptics stopped');
    } catch (error: any) {
      console.error('❌ Error stopping siren:', error);
    }
  }

  isSirenPlaying(): boolean {
    return this.isPlaying;
  }
}

// Export singleton instance
export const sirenService = new SirenService();

// Export class for direct instantiation if needed
export { SirenService };

