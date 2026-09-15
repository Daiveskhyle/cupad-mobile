import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Switch, Platform, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../../src/store/auth';
import { useThemeStore } from '../../src/store/theme';
import { getRoleConfig } from '../../src/constants/roles';
import { SPACING } from '../../src/constants/config';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const { colors, mode, toggle } = useThemeStore();
  const roleCfg = getRoleConfig(user?.role);
  const [busy, setBusy] = useState(false);
  const displayName = user?.full_name || user?.name || user?.username || 'User';

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
        <InfoRow icon="business-outline" label="Branch" value={user?.branch_id || '—'} colors={colors} />
        <InfoRow icon="map-outline" label="Zone" value={user?.zone_id || '—'} colors={colors} last />
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
  return <View style={[styles.row, !last && { borderBottomWidth: 1, borderBottomColor: colors.border }]}><Ionicons name={icon} size={20} color={colors.primary} /><View style={styles.rowText}><Text style={[styles.rowLabel, { color: colors.textSecondary }]}>{label}</Text><Text style={[styles.rowValue, { color: colors.text }]}>{value || '—'}</Text></View></View>;
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
  themeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14 },
  themeLeft: { flexDirection: 'row', alignItems: 'center' },
  themeLabel: { fontSize: 15, fontWeight: '600' },
  themeHint: { fontSize: 12, marginTop: 2 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 12, padding: 16, gap: 8, marginTop: 24 },
  logoutText: { fontSize: 16, fontWeight: '700' },
});
