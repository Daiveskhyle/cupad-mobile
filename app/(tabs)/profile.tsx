import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../../src/store/auth';
import { COLORS, SPACING } from '../../src/constants/config';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const displayName =
    user?.full_name || user?.name || user?.username || 'User';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {displayName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.name}>{displayName}</Text>
        <Text style={styles.role}>{(user?.role || 'staff').toUpperCase()}</Text>
      </View>

      <View style={styles.card}>
        <InfoRow icon="person-outline" label="Username" value={user?.username} />
        <InfoRow icon="mail-outline" label="Email" value={user?.email || '—'} />
        <InfoRow icon="call-outline" label="Phone" value={user?.phone || '—'} />
        <InfoRow
          icon="business-outline"
          label="Branch"
          value={user?.branch_id || '—'}
        />
        <InfoRow
          icon="map-outline"
          label="Zone"
          value={user?.zone_id || '—'}
        />
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={22} color={COLORS.error} />
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string | null;
}) {
  return (
    <View style={styles.row}>
      <Ionicons name={icon} size={20} color={COLORS.primary} />
      <View style={styles.rowText}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowValue}>{value || '—'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.md,
  },
  header: {
    alignItems: 'center',
    marginVertical: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.white,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
  },
  role: {
    fontSize: 13,
    color: COLORS.accent,
    fontWeight: '600',
    marginTop: 4,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 8,
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  rowText: {
    marginLeft: 14,
    flex: 1,
  },
  rowLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  rowValue: {
    fontSize: 15,
    color: COLORS.text,
    fontWeight: '500',
    marginTop: 2,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  logoutText: {
    color: COLORS.error,
    fontSize: 16,
    fontWeight: '700',
  },
});
