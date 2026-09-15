import { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Switch, Platform, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../../src/store/auth';
import { useThemeStore } from '../../src/store/theme';
import { getRoleConfig } from '../../src/constants/roles';
import { SPACING } from '../../src/constants/config';
import { Ionicons } from '@expo/vector-icons';
import { loadDashboardStats } from '../../src/services/data';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const { colors, mode, toggle } = useThemeStore();
  const roleCfg = getRoleConfig(user?.role);
  const [busy, setBusy] = useState(false);
  const [locationLoading, setLocationLoading] = useState(true);
  const [location, setLocation] = useState({
    zone: user?.zone_name || '',
    area: user?.area_name || '',
    branch: user?.branch_name || '',
  });
  const displayName = user?.full_name || user?.name || user?.username || 'User';

  const loadLocation = useCallback(async () => {
    setLocationLoading(true);
    try {
      const res = await loadDashboardStats();
      const stats = res.data || {};
      setLocation({
        zone: stats.zone_name || user?.zone_name || '',
        area: stats.area_name || user?.area_name || '',
        branch: stats.branch_name || user?.branch_name || '',
      });
    } finally {
      setLocationLoading(false);
    }
  }, [user?.zone_name, user?.area_name, user?.branch_name]);

  useEffect(() => {
    void loadLocation();
  }, [loadLocation]);

  const doLogout = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await logout();
    } finally {
      router.replace('/(auth)/login');
      setBusy(false);
    }
  };

  const handleLogout = () => {
    if (busy) return;
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      if (window.confirm('Are you sure you want to sign out?')) void doLogout();
      return;
    }
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => void doLogout() },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: roleCfg.accent || colors.primary }]}><Text style={styles.avatarText}>{displayName.charAt(0).toUpperCase()}</Text></View>
        <Text style={[styles.name, { color: colors.text }]}>{displayName}</Text>
        <Text style={[styles.role, { color: roleCfg.accent || colors.primary }]}>{roleCfg.label}</Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <InfoRow icon="person-outline" label="Username" value={user?.username} colors={colors} />
        <InfoRow icon="mail-outline" label="Email" value={user?.email || '—'} colors={colors} />
        <InfoRow icon="call-outline" label="Phone" value={user?.phone || '—'} colors={colors} />
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, marginTop: 12 }]}>
        <View style={styles.locationHeader}>
          <View style={[styles.locationIcon, { backgroundColor: colors.primary + '16' }]}>
            <Ionicons name="location-outline" size={21} color={colors.primary} />
          </View>
          <View style={styles.locationHeaderText}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Assigned Location</Text>
            <Text style={[styles.sectionHint, { color: colors.textSecondary }]}>Your current field assignment</Text>
          </View>
        </View>
        {locationLoading ? (
          <View style={styles.loadingRow}><ActivityIndicator size="small" color={colors.primary} /><Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading location…</Text></View>
        ) : (
          <>
            <InfoRow icon="globe-outline" label="Zone" value={location.zone || 'Not assigned'} colors={colors} />
            <InfoRow icon="map-outline" label="Area" value={location.area || 'Not assigned'} colors={colors} />
            <InfoRow icon="business-outline" label="Branch" value={location.branch || 'Not assigned'} colors={colors} last />
          </>
        )}
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, marginTop: 12 }]}>
        <View style={styles.themeRow}>
          <View style={styles.themeLeft}><Ionicons name={mode === 'dark' ? 'moon' : 'sunny'} size={22} color={colors.primary} /><View style={{ marginLeft: 14 }}><Text style={[styles.themeLabel, { color: colors.text }]}>Dark Mode</Text><Text style={[styles.themeHint, { color: colors.textSecondary }]}>{mode === 'dark' ? 'On' : 'Off'}</Text></View></View>
          <Switch value={mode === 'dark'} onValueChange={() => toggle()} trackColor={{ false: colors.border, true: colors.primary }} thumbColor="#fff" />
        </View>
      </View>

      <TouchableOpacity style={[styles.logoutBtn, { backgroundColor: colors.logoutBg, opacity: busy ? 0.7 : 1 }]} onPress={handleLogout} disabled={busy} activeOpacity={0.8}>
        {busy ? <ActivityIndicator color={colors.error} /> : <><Ionicons name="log-out-outline" size={22} color={colors.error} /><Text style={[styles.logoutText, { color: colors.error }]}>Sign Out</Text></>}
      </TouchableOpacity>
    </View>
  );
}

function InfoRow({ icon, label, value, colors, last }: { icon: keyof typeof Ionicons.glyphMap; label: string; value?: string | null; colors: any; last?: boolean }) {
  return <View style={[styles.row, !last && { borderBottomWidth: 1, borderBottomColor: colors.border }]}><Ionicons name={icon} size={20} color={colors.primary} /><View style={styles.rowText}><Text style={[styles.rowLabel, { color: colors.textSecondary }]}>{label}</Text><Text style={[styles.rowValue, { color: colors.text }]} numberOfLines={2}>{value || '—'}</Text></View></View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: SPACING.md },
  header: { alignItems: 'center', marginVertical: 24 },
  avatar: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText: { fontSize: 32, fontWeight: '700', color: '#fff' },
  name: { fontSize: 22, fontWeight: '700' },
  role: { fontSize: 13, fontWeight: '600', marginTop: 4 },
  card: { borderRadius: 14, padding: 8 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  rowText: { marginLeft: 14, flex: 1 },
  rowLabel: { fontSize: 12 },
  rowValue: { fontSize: 15, fontWeight: '500', marginTop: 2 },
  locationHeader: { flexDirection: 'row', alignItems: 'center', padding: 14, paddingBottom: 6 },
  locationIcon: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  locationHeaderText: { marginLeft: 12, flex: 1 },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  sectionHint: { fontSize: 12, marginTop: 2 },
  loadingRow: { flexDirection: 'row', alignItems: 'center', padding: 18 },
  loadingText: { marginLeft: 10, fontSize: 13 },
  themeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14 },
  themeLeft: { flexDirection: 'row', alignItems: 'center' },
  themeLabel: { fontSize: 15, fontWeight: '600' },
  themeHint: { fontSize: 12, marginTop: 2 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 12, padding: 16, gap: 8, marginTop: 24 },
  logoutText: { fontSize: 16, fontWeight: '700' },
});
