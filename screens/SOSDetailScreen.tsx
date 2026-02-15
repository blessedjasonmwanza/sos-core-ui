import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Platform, Linking, ActivityIndicator } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as DB from '../lib/db';
import { Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SOSDetailScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { sosId } = route.params;

    const [sos, setSos] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const mapRef = useRef<MapView>(null);

    useEffect(() => {
        loadSOSDetails();
    }, [sosId]);

    async function loadSOSDetails() {
        try {
            const staffToken = await AsyncStorage.getItem('staffToken');
            // Fetch specific SOS details. 
            // If DB.listSOS returns all, we can filter active ones or fetch specific if endpoint exists.
            // For now, let's reuse listSOS and find the item if a specific get endpoint doesn't exist.
            // Ideally DB should have getSOS(id).

            // Let's assume we need to find it from the list for now or implement getSOS.
            // Checking api.ts or db.ts...
            // If not available, we can fetch all and find. 

            const userData = await AsyncStorage.getItem('staffUser');
            if (!userData) return;
            const staff = JSON.parse(userData);

            // TODO: Implement a better way to get single SOS if needed. 
            // For now, fetching list is okay if list is small.
            const list = await DB.listSOS(staff.id || staff.staff_id || staff.user_id);
            const found = list.find((s: any) => s.id === sosId);

            if (found) {
                setSos(found);
                // Animate map to location
                if (found.location && mapRef.current) {
                    mapRef.current.animateToRegion({
                        latitude: Number(found.location.latitude),
                        longitude: Number(found.location.longitude),
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                    }, 1000);
                }
            } else {
                Alert.alert('Error', 'SOS Alert not found');
                navigation.goBack();
            }
        } catch (error) {
            console.error('Error loading SOS details:', error);
            Alert.alert('Error', 'Failed to load details');
        } finally {
            setLoading(false);
        }
    }

    const handleCall = () => {
        if (sos?.phone) {
            Linking.openURL(`tel:${sos.phone}`);
        }
    };

    const handleNavigate = () => {
        if (sos?.location) {
            const scheme = Platform.select({ ios: 'maps:', android: 'geo:' });
            const lat = sos.location.latitude;
            const lng = sos.location.longitude;
            const label = 'Emergency Location';

            const url = Platform.select({
                ios: `${scheme}?q=${label}&ll=${lat},${lng}`,
                android: `${scheme}0,0?q=${lat},${lng}(${label})`
            });

            if (url) {
                Linking.openURL(url);
            }
        }
    };

    const handleIncidentReport = () => {
        // Navigate to Incident Report screen with pre-filled case ID
        navigation.navigate('IncidentReports', { caseId: sosId });
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#EF4444" />
            </View>
        );
    }

    if (!sos) {
        return <View style={styles.container}><Text>No data</Text></View>;
    }

    return (
        <View style={styles.container}>
            {/* Map Header */}
            <View style={styles.mapContainer}>
                <MapView
                    ref={mapRef}
                    style={styles.map}
                    initialRegion={{
                        latitude: Number(sos.location?.latitude || -15.3875),
                        longitude: Number(sos.location?.longitude || 28.3228),
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                    }}
                >
                    {sos.location && (
                        <Marker
                            coordinate={{
                                latitude: Number(sos.location.latitude),
                                longitude: Number(sos.location.longitude),
                            }}
                            title="Emergency Location"
                            description={sos.phone}
                        />
                    )}
                </MapView>

                {/* Back Button Overlay */}
                <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <Text style={styles.backBtnText}>←</Text>
                </Pressable>
            </View>

            <ScrollView style={styles.contentContainer}>
                <View style={styles.header}>
                    <View>
                        <Text style={styles.statusLabel}>
                            Status: <Text style={styles.statusValue}>{sos.status.toUpperCase()}</Text>
                        </Text>
                        <Text style={styles.date}>
                            {new Date(sos.createdAt).toLocaleString()}
                        </Text>
                    </View>
                    {sos.status === 'active' && (
                        <View style={styles.urgentBadge}>
                            <Text style={styles.urgentText}>ACTIVE</Text>
                        </View>
                    )}
                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Victim Details</Text>
                    <Text style={styles.detailRow}>📞 {sos.phone}</Text>
                    <Text style={styles.detailRow}>📍 {sos.location.latitude.toFixed(6)}, {sos.location.longitude.toFixed(6)}</Text>
                    {sos.notes && (
                        <View style={styles.noteBox}>
                            <Text style={styles.noteLabel}>Notes:</Text>
                            <Text style={styles.noteText}>{sos.notes}</Text>
                        </View>
                    )}
                </View>

                <View style={styles.actionsContainer}>
                    <Pressable style={[styles.actionBtn, styles.callBtn]} onPress={handleCall}>
                        <Text style={styles.actionBtnText}>📞 Call Victim</Text>
                    </Pressable>

                    <Pressable style={[styles.actionBtn, styles.navBtn]} onPress={handleNavigate}>
                        <Text style={styles.actionBtnText}>🗺️ Navigate</Text>
                    </Pressable>
                </View>

                <Pressable style={[styles.reportBtn]} onPress={handleIncidentReport}>
                    <Text style={styles.reportBtnText}>📝 Submit Incident Report</Text>
                </Pressable>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    mapContainer: { height: 300, width: '100%', position: 'relative' },
    map: { ...StyleSheet.absoluteFillObject },
    backBtn: {
        position: 'absolute',
        top: 50,
        left: 20,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    backBtnText: { fontSize: 24, fontWeight: 'bold', color: '#0F172A' },
    contentContainer: { flex: 1, padding: 20, marginTop: -20, backgroundColor: '#F8FAFC', borderTopLeftRadius: 20, borderTopRightRadius: 20 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
    statusLabel: { fontSize: 14, color: '#64748B' },
    statusValue: { fontWeight: 'bold', color: '#0F172A' },
    date: { fontSize: 12, color: '#94A3B8', marginTop: 4 },
    urgentBadge: { backgroundColor: '#FEE2E2', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
    urgentText: { color: '#EF4444', fontWeight: 'bold', fontSize: 12 },
    card: { backgroundColor: 'white', padding: 16, borderRadius: 12, marginBottom: 20, elevation: 2 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#0F172A', marginBottom: 12 },
    detailRow: { fontSize: 16, color: '#334155', marginBottom: 8 },
    noteBox: { backgroundColor: '#F1F5F9', padding: 12, borderRadius: 8, marginTop: 8 },
    noteLabel: { fontSize: 12, fontWeight: 'bold', color: '#64748B', marginBottom: 4 },
    noteText: { fontSize: 14, color: '#334155' },
    actionsContainer: { flexDirection: 'row', gap: 12, marginBottom: 16 },
    actionBtn: { flex: 1, padding: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    callBtn: { backgroundColor: '#22C55E' },
    navBtn: { backgroundColor: '#3B82F6' },
    actionBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    reportBtn: { backgroundColor: '#0F172A', padding: 16, borderRadius: 12, alignItems: 'center' },
    reportBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});
