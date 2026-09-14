import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../src/store/auth';
import { COLORS, SPACING, RADIUS } from '../../src/constants/config';
import { Ionicons } from '@expo/vector-icons';

export default function DashboardScreen() {
  const user = useAuthStore((s) => s.user);

  const displayName =
    user?.full_name || user?.name || user?.username || 'User';
  const role = (user?.role || '').toUpperCase();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Welcome header – gradient like web */}
      <LinearGradient
        colors={[COLORS.gradientStart, COLORS.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.welcomeCard}
      >
        <Text style={styles.greeting}>Welcome back,</Text>
        <Text style={styles.name}>{displayName}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{role || 'STAFF'}</Text>
        </View>
      </LinearGradient>

      {/* Summary-style cards matching web gradients */}
      <Text style={styles.sectionTitle}>Overview</Text>
      <View style={styles.summaryGrid}>
        <LinearGradient colors={['#4CAF50', '#45a049']} style={styles.summaryCard}>
          <Ionicons name="cash-outline" size={22} color="#fff" style={styles.cardIcon} />
          <Text style={styles.cardTitle}>Savings</Text>
          <Text style={styles.cardValue}>—</Text>
        </LinearGradient>
        <LinearGradient colors={['#2196F3', '#1e88e5']} style={styles.summaryCard}>
          <Ionicons name="wallet-outline" size={22} color="#fff" style={styles.cardIcon} />
          <Text style={styles.cardTitle}>Collected</Text>
          <Text style={styles.cardValue}>—</Text>
        </LinearGradient>
      </View>
      <View style={styles.summaryGrid}>
        <LinearGradient colors={['#9C27B0', '#8e24aa']} style={styles.summaryCard}>
          <Ionicons name="people-outline" size={22} color="#fff" style={styles.cardIcon} />
          <Text style={styles.cardTitle}>Clients</Text>
          <Text style={styles.cardValue}>—</Text>
        </LinearGradient>
        <LinearGradient colors={['#f44336', '#d32f2f']} style={styles.summaryCard}>
          <Ionicons name="alert-circle-outline" size={22} color="#fff" style={styles.cardIcon} />
          <Text style={styles.cardTitle}>Outstanding</Text>
          <Text style={styles.cardValue}>—</Text>
        </LinearGradient>
      </View>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionsGrid}>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push('/(tabs)/search')}
          activeOpacity={0.8}
        >
          <View style={[styles.iconCircle, { backgroundColor: 'rgba(59,130,246,0.12)' }]}>
            <Ionicons name="search" size={24} color={COLORS.primary} />
          </View>
          <Text style={styles.actionLabel}>Search Clients</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push('/(tabs)/profile')}
          activeOpacity={0.8}
        >
          <View style={[styles.iconCircle, { backgroundColor: 'rgba(168,85,247,0.12)' }]}>
            <Ionicons name="person" size={24} color={COLORS.secondary} />
          </View>
          <Text style={styles.actionLabel}>My Profile</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoCard}>
        <Ionicons name="information-circle" size={22} color={COLORS.primary} />
        <Text style={styles.infoText}>
          Use Search to find clients and view their savings, loans, and transaction history.
        </Text>
      </View>

      {(user?.branch_id || user?.zone_id) && (
        <View style={styles.metaCard}>
          <Text style={styles.metaTitle}>Your Assignment</Text>
          {user?.zone_id && <Text style={styles.metaItem}>Zone: {user.zone_id}</Text>}
          {user?.area_id && <Text style={styles.metaItem}>Area: {user.area_id}</Text>}
          {user?.branch_id && <Text style={styles.metaItem}>Branch: {user.branch_id}</Text>}
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
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  greeting: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
  },
  name: {
    color: COLORS.white,
    fontSize: 26,
    fontWeight: '800',
    marginTop: 4,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
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
    marginTop: 4,
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  summaryCard: {
    flex: 1,
    borderRadius: RADIUS.md,
    padding: 16,
    minHeight: 100,
  },
  cardIcon: {
    position: 'absolute',
    top: 12,
    right: 12,
    opacity: 0.9,
  },
  cardTitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  cardValue: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '800',
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: SPACING.lg,
  },
  actionCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
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
    backgroundColor: 'rgba(59,130,246,0.08)',
    borderRadius: RADIUS.md,
    padding: 14,
    gap: 10,
    marginBottom: SPACING.lg,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.primaryDark,
    lineHeight: 18,
  },
  metaCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
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
