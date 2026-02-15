import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, Image, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { toast } from 'sonner-native';
import { useAuth } from '../hooks/useAuth';
import { useNavigation } from '@react-navigation/native';
import * as DB from '../lib/db';
import * as FileSystem from 'expo-file-system';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function StaffRegisterScreen() {
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [hpczNumber, setHpczNumber] = useState('');
  const [nrcNumber, setNrcNumber] = useState('');
  const [nrcUri, setNrcUri] = useState<string | undefined>(undefined);
  const [selfieUri, setSelfieUri] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState('');
  const auth = useAuth();
  const navigation = useNavigation<any>();

  async function pickImage(setter: (uri?: string) => void) {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return toast.error('Permission required to pick images');
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, quality: 0.8 });
    // new ImagePicker returns assets
    // @ts-ignore
    const uri = result.assets?.[0]?.uri ?? result.uri;
    if (!uri) return;
    setter(uri);
  }

  async function handleSubmit() {
    if (!phone || !fullName || !email || !address || !password || !hpczNumber || !nrcNumber)
      return toast.error('Please fill all required fields');
    if (password !== confirmPassword) return toast.error('Passwords do not match');
    if (!nrcUri || !selfieUri) return toast.error('Please upload NRC and selfie');

    // Frontend Format Validation
    const phoneRegex = /^(\+260|0)(9|7)[0-9]{8}$/;
    if (!phoneRegex.test(phone)) {
      return toast.error('Check Phone number. Must start with 09 or 07 or +260...');
    }

    const nrcRegex = /^\d{6}\/\d{2}\/\d{1}$/;
    if (!nrcRegex.test(nrcNumber)) {
      return toast.error('Check NRC format. Must be 123456/78/1');
    }

    setLoading(true);
    try {
      // ✅ Convert images to base64
      const nrcBase64 = await FileSystem.readAsStringAsync(nrcUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const selfieBase64 = await FileSystem.readAsStringAsync(selfieUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // ✅ Add proper MIME prefix for Laravel
      const nrcBase64String = `data:image/jpeg;base64,${nrcBase64}`;
      const selfieBase64String = `data:image/jpeg;base64,${selfieBase64}`;

      const ok = await DB.createStaff({
        phone,
        fullName,
        email,
        address,
        password,
        hpczNumber,
        nrcNumber,
        nrc: nrcBase64String,
        selfie: selfieBase64String,
      });

      console.log('Staff Registration Response:', ok);

      if (!ok || ok.status !== 201) {
        const errorMsg = ok?.data?.message || 'Failed to register staff';
        if (ok?.data?.field) {
          toast.error(errorMsg); // Show specific error from backend
        } else {
          console.log('Staff Creation Error:', errorMsg);
          toast.error(errorMsg);
        }
        return;
      }

      if (ok.status === 201) {
        console.log('Full response data:', ok.data);

        const token = ok.data?.data?.access_token;
        const user = ok.data?.data; // The whole data object contains id, staff_id, etc.

        if (token && user) {
          await AsyncStorage.setItem('staffToken', token);
          await AsyncStorage.setItem('staffUser', JSON.stringify(user));
        }

        setToken(token);
        console.log('Phone Number after creating staff:', phone);
        toast.success('Registration submitted');
        navigation.navigate('StaffTerms', { token, phone });
      }
    } catch (err: any) {
      console.error('Error submitting staff data:', err);
      toast.error(err.message || 'Failed to submit');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Fixed Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <ChevronLeft color="#1E293B" size={28} />
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <Text style={styles.title}>Practitioner Registration</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={{ marginBottom: 20 }}>
          <Text style={styles.sectionTitle}>Personal Details</Text>
          <Text style={styles.helperText}>Enter your details exactly as they appear on your ID.</Text>
        </View>

        <TextInput style={styles.input} placeholder="Phone e.g. 097xxxxxxx or +260..." value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholderTextColor="#94A3B8" autoCapitalize="none" autoCorrect={false} />
        <TextInput style={styles.input} placeholder="Full names" value={fullName} onChangeText={setFullName} placeholderTextColor="#94A3B8" autoCapitalize="none" autoCorrect={false} />
        <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" placeholderTextColor="#94A3B8" autoCapitalize="none" autoCorrect={false} />
        <TextInput style={styles.input} placeholder="Address" value={address} onChangeText={setAddress} placeholderTextColor="#94A3B8" autoCapitalize="none" autoCorrect={false} />

        <View style={{ marginTop: 16, marginBottom: 8 }}>
          <Text style={styles.sectionTitle}>Professional Info</Text>
        </View>

        <TextInput style={styles.input} placeholder="HPCZ Number" value={hpczNumber} onChangeText={setHpczNumber} placeholderTextColor="#94A3B8" autoCapitalize="none" autoCorrect={false} />

        <View>
          <TextInput style={styles.input} placeholder="NRC Number e.g. 123456/78/1" value={nrcNumber} onChangeText={setNrcNumber} placeholderTextColor="#94A3B8" autoCapitalize="none" autoCorrect={false} />
          <Text style={styles.fieldHelper}>Format: 000000/00/0</Text>
        </View>

        <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry placeholderTextColor="#94A3B8" autoCapitalize="none" autoCorrect={false} />
        <TextInput style={styles.input} placeholder="Confirm Password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry placeholderTextColor="#94A3B8" autoCapitalize="none" autoCorrect={false} />

        <View style={{ marginTop: 24, marginBottom: 16 }}>
          <Text style={styles.sectionTitle}>Documents</Text>
          <Text style={styles.helperText}>Tap the boxes below to upload clear images of your documents.</Text>
        </View>

        <View style={styles.uploadContainer}>
          <Pressable style={styles.uploadBox} onPress={() => pickImage(setNrcUri)}>
            {nrcUri ? <Image source={{ uri: nrcUri }} style={styles.preview} resizeMode="cover" /> :
              <View style={styles.uploadPlaceholder}>
                <Text style={styles.uploadText}>Upload NRC / Passport</Text>
                <Text style={styles.uploadSubText}>(Front Side)</Text>
              </View>
            }
          </Pressable>

          <Pressable style={styles.uploadBox} onPress={() => pickImage(setSelfieUri)}>
            {selfieUri ? <Image source={{ uri: selfieUri }} style={styles.preview} resizeMode="cover" /> :
              <View style={styles.uploadPlaceholder}>
                <Text style={styles.uploadText}>Upload Portrait Photo</Text>
                <Text style={styles.uploadSubText}>(Selfie)</Text>
              </View>
            }
          </Pressable>
        </View>

        <Pressable style={[styles.button, loading && { opacity: 0.6 }]} onPress={handleSubmit} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Submitting…' : 'Submit for Approval'}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  backText: {
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '500',
    marginLeft: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    color: '#1E293B'
  },
  uploadContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 25
  },
  uploadBox: {
    width: '48%',
    height: 140,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderStyle: 'dashed'
  },
  uploadPlaceholder: { alignItems: 'center', padding: 10 },
  uploadText: { fontSize: 13, color: '#475569', fontWeight: '600', textAlign: 'center', marginBottom: 4 },
  uploadSubText: { fontSize: 12, color: '#94A3B8', textAlign: 'center' },
  preview: { width: '100%', height: '100%', borderRadius: 12 },

  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#334155', marginBottom: 4 },
  helperText: { fontSize: 13, color: '#64748B', lineHeight: 18 },
  fieldHelper: { fontSize: 12, color: '#94A3B8', marginTop: -8, marginBottom: 12, marginLeft: 2 },

  button: { backgroundColor: '#2563EB', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10, shadowColor: '#2563EB', shadowOpacity: 0.2, shadowOffset: { width: 0, height: 4 }, shadowRadius: 8 },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});