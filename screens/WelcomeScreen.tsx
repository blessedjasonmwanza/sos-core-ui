import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

// Safe imports for Expo modules
const LinearGradient = (() => {
  try {
    return require('expo-linear-gradient').LinearGradient;
  } catch (err) {
    return null;
  }
})();

// Safe imports for Lucide Icons
let LucideIcons: any = null;
try {
  LucideIcons = require('lucide-react-native');
} catch (err) {
  LucideIcons = null;
}

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
  const navigation = useNavigation<any>();
  const Gradient = LinearGradient as any;
  const Icons = LucideIcons as any;

  // Icons
  const SirenIcon = Icons?.Siren || Icons?.AlertTriangle || null;
  const UserIcon = Icons?.User || Icons?.Phone || null;
  const StethoscopeIcon = Icons?.Stethoscope || Icons?.Activity || null;
  const ChevronRight = Icons?.ChevronRight || null;

  const navigateTo = (screen: string) => {
    console.log(`[WelcomeScreen] Navigating to ${screen}`);
    try {
      navigation.navigate(screen);
    } catch (error) {
      console.error('[WelcomeScreen] Navigation error:', error);
    }
  };

  const Content = (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* Hero Section */}
        <View style={styles.heroContainer}>
          <View style={styles.iconCircle}>
            {SirenIcon ? (
              <SirenIcon size={48} color="#EF4444" />
            ) : (
              <Text style={{ fontSize: 40 }}>🚨</Text>
            )}
          </View>
          <Text style={styles.heroTitle}>Emergency SOS</Text>
          <Text style={styles.heroSubtitle}>
            Fast, reliable help when every second counts.
          </Text>
        </View>

        {/* Action Cards Container */}
        <View style={styles.actionsContainer}>

          {/* USER LOGIN CARD */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.cardIconBox, { backgroundColor: '#EFF6FF' }]}>
                {UserIcon ? <UserIcon size={24} color="#2563EB" /> : <Text>👤</Text>}
              </View>
              <View style={styles.cardHeaderText}>
                <Text style={styles.cardTitle}>For Users</Text>
                <Text style={styles.cardDescription}>Request immediate assistance</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.primaryButton}
              activeOpacity={0.8}
              onPress={() => navigateTo('UserPhone')}
            >
              <Text style={styles.primaryButtonText}>Get Help Now</Text>
              {ChevronRight && <ChevronRight size={20} color="white" />}
            </TouchableOpacity>
          </View>

          {/* STAFF LOGIN CARD */}
          <View style={[styles.card, styles.staffCard]}>
            <View style={styles.cardHeader}>
              <View style={[styles.cardIconBox, { backgroundColor: '#ECFDF5' }]}>
                {StethoscopeIcon ? <StethoscopeIcon size={24} color="#059669" /> : <Text>🩺</Text>}
              </View>
              <View style={styles.cardHeaderText}>
                <Text style={styles.cardTitle}>For Responders</Text>
                <Text style={styles.cardDescription}>Medical & Emergency Staff</Text>
              </View>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.outlineButton, { flex: 1, marginRight: 8 }]}
                activeOpacity={0.7}
                onPress={() => navigateTo('StaffLogin')}
              >
                <Text style={styles.outlineButtonText}>Log In</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.secondaryButton, { flex: 1, marginLeft: 8 }]}
                activeOpacity={0.7}
                onPress={() => navigateTo('StaffRegister')}
              >
                <Text style={styles.secondaryButtonText}>Register</Text>
              </TouchableOpacity>
            </View>
          </View>

        </View>

        {/* Footer / Version Info */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Secure & Encrypted • v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );

  if (Gradient) {
    return (
      <Gradient colors={['#0F172A', '#1E293B', '#0F172A']} style={styles.container}>
        {Content}
      </Gradient>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: '#0F172A' }]}>
      {Content}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
    justifyContent: 'center',
    minHeight: '100%',
  },
  heroContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(239, 68, 68, 0.15)', // Red with opacity
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 10,
    maxWidth: width * 0.8,
    lineHeight: 24,
  },
  actionsContainer: {
    gap: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  staffCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)', // Slightly transparent
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  cardHeaderText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  cardDescription: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },

  // Buttons
  primaryButton: {
    backgroundColor: '#EF4444', // Red for emergency urgency
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
  },

  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineButtonText: {
    color: '#0F172A',
    fontWeight: '600',
    fontSize: 15,
  },
  secondaryButton: {
    backgroundColor: '#0F172A',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },

  footer: {
    alignItems: 'center',
    paddingTop: 40,
    marginTop: 'auto',
  },
  footerText: {
    color: '#475569',
    fontSize: 12,
  },
});
