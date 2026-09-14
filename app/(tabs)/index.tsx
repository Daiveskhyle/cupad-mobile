import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../../src/store/auth';
import { COLORS, SPACING } from '../../src/constants/config';
import { Ionicons } from '@expo/vector-icons';

export default function DashboardScreen() {
  const user = useAuthStore((s) => s.user);

  const displayName =
    user?.full_name || user?.name || user?.username || 'User';
  const role = (user?.role || '').toUpperCase();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Welcome Card */}
      <View style={styles.welcomeCard}>
        <Text style={styles.greeting}>Welcome back,</Text>
        <Text style={styles.name}>{displayName}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{role || 'STAFF'}</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionsGrid}>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push('/(tabs)/search')}
        >
          <View style={[styles.iconCircle, { backgroundColor: '#DBEAFE' }]}>
            <Ionicons name="search" size={24} color="#2563EB" />
          </View>
          <Text style={styles.actionLabel}>Search Clients</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push('/(tabs)/profile')}
        >
          <View style={[styles.iconCircle, { backgroundColor: '#D1FAE5' }]}>
            <Ionicons name="person" size={24} color="#059669" />
          </View>
          <Text style={styles.actionLabel}>My Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Info */}
      <View style={styles.infoCard}>
        <Ionicons name="information-circle" size={22} color={COLORS.primary} />
        <Text style={styles.infoText}>
          Use the Search tab to find clients and view their savings, loans, and
          transaction history.
        </Text>
      </View>

      {/* Branch / Zone info if available */}
      {(user?.branch_id || user?.zone_id) && (
        <View style={styles.metaCard}>
          <Text style={styles.metaTitle}>Your Assignment</Text>
          {user?.zone_id && (
            <Text style={styles.metaItem}>Zone: {user.zone_id}</Text>
          )}
          {user?.area_id && (
            <Text style={styles.metaItem}>Area: {user.area_id}</Text>
          )}
          {user?.branch_id && (
            <Text style={styles.metaItem}>Branch: {user.branch_id}</Text>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.md,
    paddingBottom: 40,
  },
  welcomeCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  greeting: {
    color: '#A0AEC0',
    fontSize: 14,
  },
  name: {
    color: COLORS.white,
    fontSize: 26,
    fontWeight: '700',
    marginTop: 4,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.accent,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 12,
  },
  roleText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: SPACING.lg,
  },
  actionCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 14,
    gap: 10,
    marginBottom: SPACING.lg,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#1E40AF',
    lineHeight: 18,
  },
  metaCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
  },
  metaTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  metaItem: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
});
