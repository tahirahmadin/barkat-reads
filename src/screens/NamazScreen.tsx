import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Platform,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { AppHeader } from '../components/AppHeader';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_GAP = 12;
const CARD_WIDTH = (SCREEN_WIDTH - 48 - CARD_GAP) / 2; // 24 padding each side

type PrayerKey = 'Fajr' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha';

const PRAYER_CONFIG: { key: PrayerKey; label: string; icon: string; color: string }[] = [
  { key: 'Fajr', label: 'Subuh', icon: 'moon-outline', color: '#7DD3FC' },
  { key: 'Dhuhr', label: 'Dzuhur', icon: 'sunny-outline', color: '#FDE047' },
  { key: 'Asr', label: 'Ashar', icon: 'partly-sunny-outline', color: '#FCD34D' },
  { key: 'Maghrib', label: 'Maghrib', icon: 'moon-outline', color: '#93C5FD' },
  { key: 'Isha', label: 'Isya', icon: 'moon-outline', color: '#6366F1' },
];

// Sehri & Iftar row above prayer timings (same card width as grid)
const SEHRI_IFTAR_ROW: { key: string; label: string; icon: string; color: string; timeKey: PrayerKey }[] = [
  { key: 'Sehri', label: 'Sehri ends', icon: 'cafe-outline', color: '#A78BFA', timeKey: 'Fajr' },
  { key: 'Iftar', label: 'Iftar', icon: 'restaurant-outline', color: '#FB923C', timeKey: 'Maghrib' },
];

interface AladhanTimings {
  Fajr: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
  Sunrise?: string;
  Sunset?: string;
}

interface AladhanResponse {
  data: {
    timings: AladhanTimings;
    date: {
      readable: string;
      hijri: { day: string; month: { en: string }; year: string };
      gregorian: { weekday: { en: string }; day: string; month: { en: string }; year: string };
    };
  };
}

async function fetchPrayerTimes(lat: number, lon: number): Promise<AladhanResponse | null> {
  try {
    // school=1 for Hanafi (Asr timing); method=2 Muslim World League is default
    const res = await fetch(
      `https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lon}&school=1`
    );
    const json = await res.json();
    if (json.code === 200 && json.data) return json as AladhanResponse;
    return null;
  } catch {
    return null;
  }
}

function getNextPrayer(timings: AladhanTimings): { key: PrayerKey; time: string; label: string } | null {
  const order: PrayerKey[] = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
  const now = new Date();
  const nowMins = now.getHours() * 60 + now.getMinutes();

  for (const key of order) {
    const t = timings[key];
    if (!t) continue;
    const [h, m] = t.split(':').map(Number);
    const prayerMins = h * 60 + m;
    if (prayerMins > nowMins) {
      const config = PRAYER_CONFIG.find((c) => c.key === key);
      return { key, time: t, label: config?.label ?? key };
    }
  }
  // Next is tomorrow Fajr
  const config = PRAYER_CONFIG[0];
  return { key: 'Fajr', time: timings.Fajr, label: config?.label ?? 'Subuh' };
}

function formatTimeUntil(nextTime: string): string {
  const [h, m] = nextTime.split(':').map(Number);
  const now = new Date();
  let next = new Date(now);
  next.setHours(h, m, 0, 0);
  if (next <= now) next.setDate(next.getDate() + 1);
  const diffMs = next.getTime() - now.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return `${diffMins}m`;
  const hours = Math.floor(diffMins / 60);
  const mins = diffMins % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export const NamazScreen: React.FC = () => {
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [locationName, setLocationName] = useState<string>('Current location');
  const [timings, setTimings] = useState<AladhanTimings | null>(null);
  const [dateInfo, setDateInfo] = useState<AladhanResponse['data']['date'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadPrayerTimes = useCallback(async (lat: number, lon: number) => {
    const data = await fetchPrayerTimes(lat, lon);
    if (data?.data) {
      setTimings(data.data.timings);
      setDateInfo(data.data.date);
      setError(null);
    } else {
      setError('Could not load prayer times');
    }
  }, []);

  const fetchLocationAndTimes = useCallback(async () => {
    setError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission required');
        setLoading(false);
        setRefreshing(false);
        return;
      }
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const { latitude, longitude } = pos.coords;
      setLocation({ lat: latitude, lon: longitude });

      const [rev] = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (rev?.city || rev?.region) {
        setLocationName([rev.city, rev.region].filter(Boolean).join(', ') || 'Current location');
      }

      await loadPrayerTimes(latitude, longitude);
    } catch (e) {
      setError('Unable to get location');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [loadPrayerTimes]);

  useEffect(() => {
    fetchLocationAndTimes();
  }, [fetchLocationAndTimes]);

  const onRefresh = () => {
    setRefreshing(true);
    if (location) {
      loadPrayerTimes(location.lat, location.lon).finally(() => setRefreshing(false));
    } else {
      fetchLocationAndTimes();
    }
  };

  const nextPrayer = timings ? getNextPrayer(timings) : null;
  const timeUntil = nextPrayer ? formatTimeUntil(nextPrayer.time) : '';

  const openFindMosque = () => {
    const url = 'https://www.google.com/maps/search/mosque+near+me';
    Linking.openURL(url).catch(() => { });
  };

  if (loading && !timings) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <AppHeader title="Prayer time" />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#2D8659" />
          <Text style={styles.loadingText}>Getting your location…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <AppHeader
        title="Prayer time"
        rightComponent={
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={18} color="#64748B" />
            <Text style={styles.locationText} numberOfLines={1}>{locationName}</Text>
          </View>
        }
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2D8659" />
        }
      >
        {error ? (
          <View style={styles.errorCard}>
            <Ionicons name="warning-outline" size={24} color="#DC2626" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => { setLoading(true); fetchLocationAndTimes(); }}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : timings && dateInfo ? (
          <>
            {/* Date & next prayer card */}
            <View style={styles.heroCard}>
              <View style={styles.heroLeft}>
                <Text style={styles.hijriDate}>
                  {dateInfo.hijri.month.en} {dateInfo.hijri.day}
                </Text>
                <Text style={styles.gregorianDate}>
                  {dateInfo.gregorian.weekday.en}, {dateInfo.gregorian.month.en} {dateInfo.gregorian.day} {dateInfo.gregorian.year}
                </Text>
              </View>
              {nextPrayer && (
                <View style={styles.nextPrayerBadge}>
                  <Text style={styles.nextPrayerLabel}>{nextPrayer.label}</Text>
                  <Text style={styles.nextPrayerTime}>{nextPrayer.time}</Text>
                </View>
              )}
            </View>

            {/* Reminder bar */}
            {nextPrayer && (
              <View style={styles.reminderBar}>
                <Ionicons name="time-outline" size={18} color="#FFFFFF" />
                <Text style={styles.reminderText}>
                  {nextPrayer.label} in {timeUntil}, get ready for prayer.
                </Text>
              </View>
            )}

            {/* Find nearest mosque */}
            <TouchableOpacity style={styles.mosqueButton} onPress={openFindMosque} activeOpacity={0.8}>
              <Ionicons name="business-outline" size={24} color="#2D8659" />
              <Text style={styles.mosqueButtonText}>Find nearest mosque</Text>
              <Ionicons name="chevron-forward" size={20} color="#64748B" />
            </TouchableOpacity>

            {/* Sehri & Iftar row (above namaz timings) */}
            <Text style={styles.gridSubtitle}>Hanafi timings</Text>
            <View style={styles.sehriIftarRow}>
              {SEHRI_IFTAR_ROW.map((row) => (
                <View key={row.key} style={styles.prayerCard}>
                  <View style={[styles.prayerIconWrap, { backgroundColor: row.color + '30' }]}>
                    <Ionicons name={row.icon as any} size={28} color={row.color} />
                  </View>
                  <Text style={styles.prayerLabel}>{row.label}</Text>
                  <Text style={styles.prayerTime}>{timings[row.timeKey] || '—'}</Text>
                </View>
              ))}
            </View>
            {/* Prayer time cards grid */}
            <View style={styles.grid}>
              {PRAYER_CONFIG.map((p) => (
                <View key={p.key} style={styles.prayerCard}>
                  <View style={[styles.prayerIconWrap, { backgroundColor: p.color + '30' }]}>
                    <Ionicons name={p.icon as any} size={28} color={p.color} />
                  </View>
                  <Text style={styles.prayerLabel}>{p.label}</Text>
                  <Text style={styles.prayerTime}>{timings[p.key] || '—'}</Text>
                </View>
              ))}
            </View>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f2ede8',
  },
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 100,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: '#64748B',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    maxWidth: 140,
  },
  locationText: {
    fontSize: 13,
    color: '#64748B',
  },
  errorCard: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: {
    marginTop: 8,
    fontSize: 15,
    color: '#DC2626',
  },
  retryButton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#DC2626',
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  heroCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
      android: { elevation: 3 },
    }),
  },
  heroLeft: {},
  hijriDate: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A202C',
  },
  gregorianDate: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
  },
  nextPrayerBadge: {
    backgroundColor: '#2D8659',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextPrayerLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  nextPrayerTime: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2,
  },
  reminderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#1A202C',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  reminderText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
    flex: 1,
  },
  mosqueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 12,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4 },
      android: { elevation: 2 },
    }),
  },
  mosqueButtonText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1A202C',
  },
  gridSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sehriIftarRow: {
    flexDirection: 'row',
    gap: CARD_GAP,
    marginBottom: CARD_GAP,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CARD_GAP,
  },
  prayerCard: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6 },
      android: { elevation: 2 },
    }),
  },
  prayerIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  prayerLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A202C',
  },
  prayerTime: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2D8659',
    marginTop: 4,
  },
});
