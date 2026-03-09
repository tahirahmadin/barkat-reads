import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Platform,
  Linking,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppHeader } from '../components/AppHeader';

const NAMAZ_LOCATION_KEY = 'barkat-namaz-location';
const PATTERN_IMG = require('../../assets/pattern.avif');

type PrayerKey = 'Fajr' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha';

const PRAYER_CONFIG: { key: PrayerKey; label: string; icon: string; color: string }[] = [
  { key: 'Fajr', label: 'Fajr', icon: 'moon-outline', color: '#6B5B4F' },
  { key: 'Dhuhr', label: 'Duhur', icon: 'sunny-outline', color: '#9B7E4B' },
  { key: 'Asr', label: 'Asr', icon: 'partly-sunny-outline', color: '#A67C52' },
  { key: 'Maghrib', label: 'Maghrib', icon: 'partly-sunny-outline', color: '#8B5A2B' },
  { key: 'Isha', label: 'Isha', icon: 'moon-outline', color: '#5C4033' },
];

const SEHRI_IFTAR_ROW: { key: string; label: string; timeKey: PrayerKey }[] = [
  { key: 'Suhoor', label: 'Suhoor', timeKey: 'Fajr' },
  { key: 'Iftaar', label: 'Iftaar', timeKey: 'Maghrib' },
];

// Brownish theme for Prayer Times screen
const COLORS = {
  brand: '#5C4033',
  brandDark: '#3D2B20',
  surface: '#FFFFFF',
  background: '#F5F0EB',
  cardSurface: '#FFFBF7',
  textPrimary: '#2C2419',
  textSecondary: '#5C5248',
  textMuted: '#8B7D6F',
  border: '#E0D6CC',
  error: '#B91C1C',
  errorBg: '#FEF2F2',
  accent: '#8B6914',
} as const;

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
  const config = PRAYER_CONFIG[0];
  return { key: 'Fajr', time: timings.Fajr, label: config?.label ?? 'Fajr' };
}

function getCurrentPrayer(timings: AladhanTimings): { key: PrayerKey; time: string; label: string; endTime: string } | null {
  const next = getNextPrayer(timings);
  const order: PrayerKey[] = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
  const idx = order.findIndex((k) => k === next?.key);
  const currentKey = idx <= 0 ? order[order.length - 1] : order[idx - 1];
  const currentTime = timings[currentKey];
  const endTime = next?.time ?? currentTime;
  if (!currentTime) return null;
  const config = PRAYER_CONFIG.find((c) => c.key === currentKey);
  return { key: currentKey, time: currentTime, label: config?.label ?? currentKey, endTime };
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

async function loadStoredLocation(): Promise<{ cityName: string; address?: string; lat: number; lon: number } | null> {
  try {
    const raw = await AsyncStorage.getItem(NAMAZ_LOCATION_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data && typeof data.cityName === 'string' && typeof data.lat === 'number' && typeof data.lon === 'number') {
      return {
        cityName: data.cityName,
        address: typeof data.address === 'string' ? data.address : undefined,
        lat: data.lat,
        lon: data.lon,
      };
    }
    return null;
  } catch {
    return null;
  }
}

async function saveLocation(cityName: string, address: string | undefined, lat: number, lon: number): Promise<void> {
  try {
    await AsyncStorage.setItem(NAMAZ_LOCATION_KEY, JSON.stringify({ cityName, address, lat, lon }));
  } catch { }
}

const cardShadow = Platform.select({
  ios: { shadowColor: '#3D2B20', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 14 },
  android: { elevation: 5 },
});

function formatTimeDisplay(t: string): string {
  if (!t || t === '—') return '—';
  const parts = t.split(':');
  const h = Number(parts[0]);
  const m = Number(parts[1] || 0);
  if (Number.isNaN(h)) return '—';
  const isPm = h >= 12;
  const h12 = h % 12 || 12;
  const mm = m.toString().padStart(2, '0');
  return `${h12}:${mm} ${isPm ? 'pm' : 'am'}`;
}

function formatTimeDisplayCap(t: string): string {
  const s = formatTimeDisplay(t);
  return s.replace(/(am|pm)/, (_, p) => p === 'am' ? 'Am' : 'Pm');
}

function getMidDayTime(sunrise?: string, sunset?: string): string {
  if (!sunrise || !sunset) return '—';
  const [h1, m1] = sunrise.split(':').map(Number);
  const [h2, m2] = sunset.split(':').map(Number);
  const midMins = Math.floor(((h1 * 60 + m1) + (h2 * 60 + m2)) / 2);
  const h = Math.floor(midMins / 60);
  const m = midMins % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

export const NamazScreen: React.FC = () => {
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [locationName, setLocationName] = useState<string>('Current location');
  const [locationAddress, setLocationAddress] = useState<string | null>(null);
  const [timings, setTimings] = useState<AladhanTimings | null>(null);
  const [dateInfo, setDateInfo] = useState<AladhanResponse['data']['date'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchingLocation, setFetchingLocation] = useState(false);
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
        setFetchingLocation(false);
        return;
      }
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const { latitude, longitude } = pos.coords;
      setLocation({ lat: latitude, lon: longitude });

      const [rev] = await Location.reverseGeocodeAsync({ latitude, longitude });
      const name = [rev?.city, rev?.region].filter(Boolean).join(', ') || 'Current location';
      const address = [rev?.city, rev?.region, rev?.country].filter(Boolean).join(', ') || name;
      setLocationName(name);
      setLocationAddress(address);
      await saveLocation(name, address, latitude, longitude);

      await loadPrayerTimes(latitude, longitude);
    } catch {
      setError('Unable to get location');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setFetchingLocation(false);
    }
  }, [loadPrayerTimes]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const stored = await loadStoredLocation();
      if (cancelled) return;
      if (stored) {
        setLocation({ lat: stored.lat, lon: stored.lon });
        setLocationName(stored.cityName);
        if (stored.address) setLocationAddress(stored.address);
        await loadPrayerTimes(stored.lat, stored.lon);
        setLoading(false);
        return;
      }
      fetchLocationAndTimes();
    })();
    return () => { cancelled = true; };
  }, [fetchLocationAndTimes, loadPrayerTimes]);

  const onRefresh = () => {
    setRefreshing(true);
    if (location) {
      loadPrayerTimes(location.lat, location.lon).finally(() => setRefreshing(false));
    } else {
      fetchLocationAndTimes();
    }
  };

  const handleUpdateLocation = useCallback(() => {
    setFetchingLocation(true);
    fetchLocationAndTimes();
  }, [fetchLocationAndTimes]);

  const nextPrayer = timings ? getNextPrayer(timings) : null;
  const currentPrayer = timings ? getCurrentPrayer(timings) : null;
  const timeUntil = nextPrayer ? formatTimeUntil(nextPrayer.time) : '';
  const midDayTime = timings ? getMidDayTime(timings.Sunrise, timings.Sunset) : '—';

  const openFindMosque = () => {
    Linking.openURL('https://www.google.com/maps/search/mosque+near+me').catch(() => { });
  };

  if (loading && !timings) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.backgroundLayer} pointerEvents="none">
          <View style={styles.bgBase} />
          <View style={styles.bgPatternWrap}>
            <ImageBackground source={PATTERN_IMG} style={styles.bgPattern} resizeMode="repeat" />
          </View>
        </View>
        <View style={styles.contentLayer}>
          <AppHeader title="Prayer Times" />
          <View style={styles.centered}>
          <View style={styles.loaderRing}>
            <ActivityIndicator size="large" color={COLORS.brand} />
          </View>
          <Text style={styles.loadingTitle}>Getting your location</Text>
          <Text style={styles.loadingSub}>We’ll show prayer times for your area</Text>
        </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.backgroundLayer} pointerEvents="none">
        <View style={styles.bgBase} />
        <View style={styles.bgPatternWrap}>
          <ImageBackground source={PATTERN_IMG} style={styles.bgPattern} resizeMode="repeat" />
        </View>
      </View>
      <View style={styles.contentLayer}>
      <AppHeader
        title="Prayer Times"
        rightComponent={
          <TouchableOpacity
            style={styles.locationChip}
            onPress={handleUpdateLocation}
            disabled={fetchingLocation}
            activeOpacity={0.7}
          >
            {fetchingLocation ? (
              <ActivityIndicator size="small" color={COLORS.brand} />
            ) : (
              <Ionicons name="location" size={14} color={COLORS.brand} />
            )}
            <Text style={styles.locationChipText} numberOfLines={1}>
              {fetchingLocation ? 'Updating…' : locationName}
            </Text>
          </TouchableOpacity>
        }
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.brand} />
        }
      >
        {error ? (
          <View style={styles.errorCard}>
            <View style={styles.errorIconWrap}>
              <Ionicons name="location-outline" size={28} color={COLORS.error} />
            </View>
            <Text style={styles.errorTitle}>Location needed</Text>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => { setLoading(true); fetchLocationAndTimes(); }}
            >
              <Text style={styles.retryButtonText}>Try again</Text>
            </TouchableOpacity>
          </View>
        ) : timings && dateInfo ? (
          <>
            {/* Date header — no arrows */}
            <View style={styles.dateHeader}>
              <View style={styles.dateCenter}>
                <Text style={styles.hijriDate}>
                  {dateInfo.hijri.day} {dateInfo.hijri.month.en}, {dateInfo.hijri.year}
                </Text>
                <Text style={styles.gregorianDate}>
                  {dateInfo.gregorian.weekday.en}, {dateInfo.gregorian.month.en} {dateInfo.gregorian.day} {dateInfo.gregorian.year}
                </Text>
              </View>
            </View>

            {/* Now time + Next prayer — two cards */}
            <View style={styles.heroRow}>
              <View style={[styles.heroCardNow, cardShadow]}>
                <Text style={styles.heroSmallLabel}>Now time is</Text>
                <Text style={styles.heroPrayerName}>{currentPrayer?.label ?? '—'}</Text>
                <Text style={styles.heroBigTime}>
                  {currentPrayer ? formatTimeDisplayCap(currentPrayer.time) : '—'}
                </Text>
                <Text style={styles.heroEndTime}>
                  End time – {currentPrayer ? formatTimeDisplay(currentPrayer.endTime) : '—'}
                </Text>
              </View>
              <View style={[styles.heroCardNext, cardShadow]}>
                <Text style={styles.heroSmallLabel}>Next prayer is</Text>
                <Text style={styles.heroPrayerName}>{nextPrayer?.label ?? '—'}</Text>
                <Text style={styles.heroBigTime}>
                  {nextPrayer ? formatTimeDisplayCap(nextPrayer.time) : '—'}
                </Text>
                <Text style={styles.heroAzanRow}>Azan – {nextPrayer ? formatTimeDisplay(nextPrayer.time) : '—'}</Text>
              </View>
            </View>

            {/* Suhoor / Iftaar single card */}
            <View style={[styles.suhoorIftaarCard, cardShadow]}>
              <View style={styles.suhoorIftaarLeft}>
                <View style={styles.bellIconWrap}>
                  <Ionicons name="moon-outline" size={18} color={COLORS.accent} />
                </View>
                <View>
                  <Text style={styles.suhoorIftaarLabel}>Suhoor</Text>
                  <Text style={styles.suhoorIftaarTime}>{timings?.Fajr ? formatTimeDisplay(timings.Fajr) : '—'}</Text>
                </View>
              </View>
              <View style={styles.suhoorIftaarDivider} />
              <View style={styles.suhoorIftaarRight}>
                <View>
                  <Text style={styles.suhoorIftaarLabel}>Iftaar</Text>
                  <Text style={styles.suhoorIftaarTime}>{timings?.Maghrib ? formatTimeDisplay(timings.Maghrib) : '—'}</Text>
                </View>
                <View style={[styles.bellIconWrap, styles.bellIconMuted]}>
                  <Ionicons name="restaurant-outline" size={18} color={COLORS.textMuted} />
                </View>
              </View>
            </View>

            {/* Location + Prayer list card */}
            <View style={[styles.locationCard, cardShadow]}>
              <TouchableOpacity
                style={styles.locationHeader}
                onPress={handleUpdateLocation}
                activeOpacity={0.8}
              >
                <Ionicons name="location" size={20} color={COLORS.textPrimary} />
                <View style={styles.locationTextWrap}>
                  <Text style={styles.locationTitle}>Namaz Timings</Text>
                  <Text style={styles.locationSub}>
                    {fetchingLocation ? 'Updating…' : (locationAddress || 'Tap to update location')}
                  </Text>
                </View>
              </TouchableOpacity>
              {PRAYER_CONFIG.map((p) => {
                const isCurrent = nextPrayer?.key === p.key;
                return (
                  <View key={p.key} style={[styles.prayerListRow, isCurrent && styles.prayerListRowHighlight]}>
                    <View style={styles.prayerListIconWrap}>
                      <Ionicons name={p.icon as any} size={20} color={isCurrent ? COLORS.accent : COLORS.textSecondary} />
                    </View>
                    <Text style={[styles.prayerListLabel, isCurrent && styles.prayerListLabelHighlight]}>{p.label}</Text>
                    <Text style={[styles.prayerListTime, isCurrent && styles.prayerListTimeHighlight]}>
                      {timings[p.key] ? formatTimeDisplay(timings[p.key]) : '—'}
                    </Text>
                  </View>
                );
              })}
            </View>

            {/* Sunrise / Mid Day / Sunset */}
            <View style={[styles.sunCard, cardShadow]}>
              <View style={styles.sunBlock}>
                <Text style={styles.sunLabel}>Sunrise</Text>
                <Text style={styles.sunTime}>{timings?.Sunrise ? formatTimeDisplay(timings.Sunrise) : '—'}</Text>
              </View>
              <View style={styles.sunDivider} />
              <View style={styles.sunBlock}>
                <Text style={styles.sunLabel}>Mid Day</Text>
                <Text style={styles.sunTime}>{midDayTime !== '—' ? formatTimeDisplay(midDayTime) : '—'}</Text>
              </View>
              <View style={styles.sunDivider} />
              <View style={styles.sunBlock}>
                <Text style={styles.sunLabel}>Sunset</Text>
                <Text style={styles.sunTime}>{timings?.Sunset ? formatTimeDisplay(timings.Sunset) : '—'}</Text>
              </View>
            </View>

            <Text style={styles.footnote}>Hanafi (Asr) · Muslim World League</Text>
          </>
        ) : null}
      </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#e0d8ce',
  },
  backgroundLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  bgBase: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#e6dfd6',
  },
  bgPatternWrap: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.05,
  },
  bgPattern: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  contentLayer: {
    flex: 1,
  },
  container: { flex: 1 },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loaderRing: {
    marginBottom: 20,
  },
  loadingTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 6,
    ...Platform.select({ ios: { fontFamily: 'System' }, android: { fontFamily: 'sans-serif-medium' } }),
  },
  loadingSub: {
    fontSize: 15,
    color: COLORS.textSecondary,
    ...Platform.select({ ios: { fontFamily: 'System' }, android: { fontFamily: 'sans-serif' } }),
  },
  locationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    maxWidth: 160,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: COLORS.brand + '12',
    borderRadius: 20,
  },
  locationChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.brand,
    ...Platform.select({ ios: { fontFamily: 'System' }, android: { fontFamily: 'sans-serif-medium' } }),
  },
  errorCard: {
    backgroundColor: COLORS.errorBg,
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorIconWrap: {
    marginBottom: 12,
  },
  errorTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.error,
    marginBottom: 4,
    ...Platform.select({ ios: { fontFamily: 'System' }, android: { fontFamily: 'sans-serif-medium' } }),
  },
  errorText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginBottom: 16,
    textAlign: 'center',
    ...Platform.select({ ios: { fontFamily: 'System' }, android: { fontFamily: 'sans-serif' } }),
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: COLORS.error,
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.surface,
    ...Platform.select({ ios: { fontFamily: 'System' }, android: { fontFamily: 'sans-serif-medium' } }),
  },
  heroCard: {
    backgroundColor: COLORS.brand,
    borderRadius: 20,
    padding: 22,
    marginBottom: 18,
    overflow: 'hidden',
  },
  heroTop: {
    marginBottom: 16,
  },
  dateHeader: {
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  dateCenter: {
    alignItems: 'center',
  },
  hijriDate: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
    ...Platform.select({ ios: { fontFamily: 'System' }, android: { fontFamily: 'sans-serif-medium' } }),
  },
  gregorianDate: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
    ...Platform.select({ ios: { fontFamily: 'System' }, android: { fontFamily: 'sans-serif' } }),
  },
  heroRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  heroCardNow: {
    flex: 1,
    backgroundColor: COLORS.cardSurface,
    borderRadius: 20,
    padding: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  heroCardNext: {
    flex: 1,
    backgroundColor: COLORS.cardSurface,
    borderRadius: 20,
    padding: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  heroSmallLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
    ...Platform.select({ ios: { fontFamily: 'System' }, android: { fontFamily: 'sans-serif' } }),
  },
  heroPrayerName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.accent,
    marginBottom: 6,
    ...Platform.select({ ios: { fontFamily: 'System' }, android: { fontFamily: 'sans-serif-medium' } }),
  },
  heroBigTime: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
    ...Platform.select({ ios: { fontFamily: 'System' }, android: { fontFamily: 'sans-serif-medium' } }),
  },
  heroEndTime: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 6,
    ...Platform.select({ ios: { fontFamily: 'System' }, android: { fontFamily: 'sans-serif' } }),
  },
  heroAzanRow: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 6,
    ...Platform.select({ ios: { fontFamily: 'System' }, android: { fontFamily: 'sans-serif' } }),
  },
  suhoorIftaarCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardSurface,
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  suhoorIftaarLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  suhoorIftaarRight: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 12,
  },
  suhoorIftaarDivider: {
    width: 1,
    height: 36,
    backgroundColor: COLORS.border,
  },
  suhoorIftaarLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    ...Platform.select({ ios: { fontFamily: 'System' }, android: { fontFamily: 'sans-serif-medium' } }),
  },
  suhoorIftaarTime: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: 2,
    ...Platform.select({ ios: { fontFamily: 'System' }, android: { fontFamily: 'sans-serif-medium' } }),
  },
  bellIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3 }, android: { elevation: 2 } }),
  },
  bellIconMuted: {
    opacity: 0.7,
  },
  bellIconWrapSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellIconWrapActive: {
    backgroundColor: COLORS.accent + '18',
  },
  locationCard: {
    backgroundColor: COLORS.cardSurface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  locationTextWrap: { flex: 1 },
  locationTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
    ...Platform.select({ ios: { fontFamily: 'System' }, android: { fontFamily: 'sans-serif-medium' } }),
  },
  locationSub: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
    ...Platform.select({ ios: { fontFamily: 'System' }, android: { fontFamily: 'sans-serif' } }),
  },
  prayerListRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 12,
  },
  prayerListRowHighlight: {
    backgroundColor: COLORS.accent + '0C',
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  prayerListIconWrap: {
    width: 28,
    alignItems: 'center',
  },
  prayerListLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    ...Platform.select({ ios: { fontFamily: 'System' }, android: { fontFamily: 'sans-serif-medium' } }),
  },
  prayerListLabelHighlight: {
    color: COLORS.accent,
    fontWeight: '700',
  },
  prayerListTime: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textSecondary,
    ...Platform.select({ ios: { fontFamily: 'System' }, android: { fontFamily: 'sans-serif-medium' } }),
  },
  prayerListTimeHighlight: {
    color: COLORS.accent,
    fontWeight: '700',
  },
  sunCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sunBlock: {
    flex: 1,
    alignItems: 'center',
  },
  sunLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginBottom: 4,
    ...Platform.select({ ios: { fontFamily: 'System' }, android: { fontFamily: 'sans-serif-medium' } }),
  },
  sunTime: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    ...Platform.select({ ios: { fontFamily: 'System' }, android: { fontFamily: 'sans-serif-medium' } }),
  },
  sunDivider: {
    width: 1,
    height: 32,
    backgroundColor: COLORS.border,
  },
  nextPrayerBlock: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 14,
    padding: 16,
  },
  nextPrayerLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 6,
    ...Platform.select({ ios: { fontFamily: 'System' }, android: { fontFamily: 'sans-serif-medium' } }),
  },
  nextPrayerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  nextPrayerName: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.surface,
    ...Platform.select({ ios: { fontFamily: 'System' }, android: { fontFamily: 'sans-serif-medium' } }),
  },
  nextPrayerTime: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.surface,
    letterSpacing: -0.5,
    ...Platform.select({ ios: { fontFamily: 'System' }, android: { fontFamily: 'sans-serif-medium' } }),
  },
  countdownPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    backgroundColor: COLORS.surface,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  countdownText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.brand,
    ...Platform.select({ ios: { fontFamily: 'System' }, android: { fontFamily: 'sans-serif-medium' } }),
  },
  mosqueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 18,
    marginBottom: 22,
    gap: 14,
  },
  mosqueIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: COLORS.brand + '14',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mosqueTextWrap: { flex: 1 },
  mosqueTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    ...Platform.select({ ios: { fontFamily: 'System' }, android: { fontFamily: 'sans-serif-medium' } }),
  },
  mosqueSub: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
    ...Platform.select({ ios: { fontFamily: 'System' }, android: { fontFamily: 'sans-serif' } }),
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 0.7,
    textTransform: 'uppercase',
    marginBottom: 14,
    ...Platform.select({ ios: { fontFamily: 'System' }, android: { fontFamily: 'sans-serif-medium' } }),
  },
  sehriIftarRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 24,
  },
  sehriIftarCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 18,
    alignItems: 'center',
  },
  sehriIftarIconWrap: {
    width: 50,
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  sehriIftarLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    ...Platform.select({ ios: { fontFamily: 'System' }, android: { fontFamily: 'sans-serif-medium' } }),
  },
  sehriIftarTime: {
    fontSize: 19,
    fontWeight: '800',
    color: COLORS.brand,
    marginTop: 6,
    ...Platform.select({ ios: { fontFamily: 'System' }, android: { fontFamily: 'sans-serif-medium' } }),
  },
  prayerCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    paddingVertical: 6,
    overflow: 'hidden',
  },
  prayerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  prayerRowHighlight: {
    backgroundColor: COLORS.brand + '08',
    borderLeftWidth: 3,
    borderLeftColor: COLORS.brand,
    marginLeft: 0,
    paddingLeft: 15,
  },
  prayerDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: 18,
  },
  prayerIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  prayerLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    ...Platform.select({ ios: { fontFamily: 'System' }, android: { fontFamily: 'sans-serif-medium' } }),
  },
  prayerTime: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textSecondary,
    ...Platform.select({ ios: { fontFamily: 'System' }, android: { fontFamily: 'sans-serif-medium' } }),
  },
  prayerTimeHighlight: {
    color: COLORS.brand,
    fontWeight: '800',
  },
  footnote: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 14,
    textAlign: 'center',
    ...Platform.select({ ios: { fontFamily: 'System' }, android: { fontFamily: 'sans-serif' } }),
  },
});
