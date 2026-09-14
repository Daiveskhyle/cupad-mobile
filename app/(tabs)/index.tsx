import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../src/store/auth';
import { useThemeStore } from '../../src/store/theme';
import { SPACING, RADIUS } from '../../src/constants/config';
import { getRoleConfig, ACTION_META } from '../../src/constants/roles';
import { Ionicons } from '@expo/vector-icons';

export default function DashboardScreen() {
  const user = useAuthStore((s) => s.user);
  const roleCfg = getRoleConfig(user?.role);
  const colors = useThemeStore((s) => s.colors);

  const displayName =
    user?.full_name || user?.name || user?.username || 'User';

  const handleAction = (key: string) => {
    // Route to existing screens where available
    if (key === 'clients' || key === 'portfolio') {
      router.push('/(tabs)/search');
      return;
    }
    // Placeholder for screens not yet built
    // Future: router.push(`/screens/${key}`)
  };

  // Summary cards differ slightly by role
  const isField = roleCfg.key === 'co';
  const isManager = ['am', 'bm', 'zm', 'dzm', 'tm', 'admin'].includes(roleCfg.key);
  const isClient = roleCfg.key === 'client';

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      {/* Welcome header */}
      <LinearGradient
        colors={[roleCfg.accent, colors.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.welcomeCard}
      >
        <Text style={styles.greeting}>Welcome back,</Text>
        <Text style={styles.name}>{displayName}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{roleCfg.shortLabel}</Text>
        </View>
        <Text style={styles.roleDesc}>{roleCfg.description}</Text>
      </LinearGradient>

      {/* Scope info */}
      {(user?.zone_id || user?.area_id || user?.branch_id) && (
        <View style={[styles.scopeCard, { backgroundColor: colors.card }]}>
          <Ionicons name="location-outline" size={18} color={colors.primary} />
          <View style={{ flex: 1, marginLeft: 10 }}>
            {user?.zone_id ? (
              <Text style={[styles.scopeText, { color: colors.textSecondary }]}>Zone: {user.zone_id}</Text>
            ) : null}
            {user?.area_id ? (
              <Text style={[styles.scopeText, { color: colors.textSecondary }]}>Area: {user.area_id}</Text>
            ) : null}
            {user?.branch_id ? (
              <Text style={[styles.scopeText, { color: colors.textSecondary }]}>Branch: {user.branch_id}</Text>
            ) : null}
          </View>
        </View>
      )}

      {/* Overview stats – role flavoured */}
      {!isClient && (
        <>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Overview</Text>
          <View style={styles.summaryGrid}>
            <LinearGradient colors={['#4CAF50', '#45a049']} style={styles.summaryCard}>
              <Ionicons name="wallet-outline" size={20} color="#fff" style={styles.cardIcon} />
              <Text style={styles.cardTitle}>
                {isField ? 'Today Savings' : 'Net Savings'}
              </Text>
              <Text style={styles.cardValue}>—</Text>
            </LinearGradient>
            <LinearGradient colors={['#2196F3', '#1e88e5']} style={styles.summaryCard}>
              <Ionicons name="cash-outline" size={20} color="#fff" style={styles.cardIcon} />
              <Text style={styles.cardTitle}>
                {isField ? 'Today Collections' : 'Collected'}
              </Text>
              <Text style={styles.cardValue}>—</Text>
            </LinearGradient>
          </View>
          <View style={styles.summaryGrid}>
            <LinearGradient colors={['#9C27B0', '#8e24aa']} style={styles.summaryCard}>
              <Ionicons name="people-outline" size={20} color="#fff" style={styles.cardIcon} />
              <Text style={styles.cardTitle}>Clients</Text>
              <Text style={styles.cardValue}>—</Text>
            </LinearGradient>
            <LinearGradient colors={['#f44336', '#d32f2f']} style={styles.summaryCard}>
              <Ionicons name="alert-circle-outline" size={20} color="#fff" style={styles.cardIcon} />
              <Text style={styles.cardTitle}>Outstanding</Text>
              <Text style={styles.cardValue}>—</Text>
            </LinearGradient>
          </View>
        </>
      )}

      {isClient && (
        <>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>My Portfolio</Text>
          <View style={styles.summaryGrid}>
            <LinearGradient colors={['#4CAF50', '#45a049']} style={styles.summaryCard}>
              <Text style={styles.cardTitle}>Savings</Text>
              <Text style={styles.cardValue}>—</Text>
            </LinearGradient>
            <LinearGradient colors={['#f44336', '#d32f2f']} style={styles.summaryCard}>
              <Text style={styles.cardTitle}>Loan Balance</Text>
              <Text style={styles.cardValue}>—</Text>
            </LinearGradient>
          </View>
        </>
      )}

      {/* Role-specific quick actions */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        {isField ? 'Field Actions' : isManager ? 'Management' : 'Quick Actions'}
      </Text>
      <View style={styles.actionsGrid}>
        {roleCfg.actions.map((key) => {
          const meta = ACTION_META[key];
          if (!meta) return null;
          return (
            <TouchableOpacity
              key={key}
              style={[styles.actionCard, { backgroundColor: colors.card }]}
              onPress={() => handleAction(key)}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.iconCircle,
                  { backgroundColor: meta.color + '18' },
                ]}
              >
                <Ionicons
                  name={meta.icon as any}
                  size={22}
                  color={meta.color}
                />
              </View>
              <Text style={[styles.actionLabel, { color: colors.text }]}>{meta.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Always show search for non-clients */}
      {!isClient && (
        <TouchableOpacity
          style={styles.searchBanner}
          onPress={() => router.push('/(tabs)/search')}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={[colors.gradientStart, colors.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.searchBannerInner}
          >
            <Ionicons name="search" size={22} color="#fff" />
            <Text style={styles.searchBannerText}>Search Clients</Text>
            <Ionicons name="chevron-forward" size={20} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      )}

      <View style={styles.infoCard}>
        <Ionicons name="information-circle" size={20} color={colors.primary} />
        <Text style={[styles.infoText, { color: colors.primaryDark }]}>
          You are signed in as <Text style={{ fontWeight: '700' }}>{roleCfg.label}</Text>
          {roleCfg.scope !== 'system' && roleCfg.scope !== 'self'
            ? ` (${roleCfg.scope}-level access)`
            : ''}
          . More screens for this role are coming soon.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: SPACING.md,
    paddingBottom: 48,
  },
  welcomeCard: {
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  greeting: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
  },
  name: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    marginTop: 4,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    marginTop: 10,
  },
  roleText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  roleDesc: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 8,
  },
  scopeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.md,
    padding: 12,
    marginBottom: SPACING.md,
  },
  scopeText: {
    fontSize: 13,
    color: '#64748B',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
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
    padding: 14,
    minHeight: 90,
  },
  cardIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    opacity: 0.9,
  },
  cardTitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  cardValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: SPACING.lg,
  },
  actionCard: {
    width: '30%',
    flexGrow: 1,
    maxWidth: '32%',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.md,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'center',
  },
  searchBanner: {
    marginBottom: SPACING.lg,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
  },
  searchBannerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  searchBannerText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(59,130,246,0.08)',
    borderRadius: RADIUS.md,
    padding: 14,
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#2563EB',
    lineHeight: 18,
  },
});
