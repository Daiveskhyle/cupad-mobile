import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../src/store/auth';
import { useThemeStore } from '../../src/store/theme';
import { SPACING, RADIUS } from '../../src/constants/config';
import { getRoleConfig, ACTION_META } from '../../src/constants/roles';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { loadDashboardStats } from '../../src/services/data';

export default function DashboardScreen() {
  const user = useAuthStore((s) => s.user);
  const roleCfg = getRoleConfig(user?.role);
  const colors = useThemeStore((s) => s.colors);
  const [stats, setStats] = useState<any>(null);
  const [statsNote, setStatsNote] = useState<string | null>(null);
  const [statsSource, setStatsSource] = useState<string>('');

  useEffect(() => {
    let alive = true;
    (async () => {
      const res = await loadDashboardStats();
      if (!alive) return;
      setStats(res.data);
      setStatsSource(res.source);
      setStatsNote(res.error || null);
    })();
    return () => { alive = false; };
  }, []);

  const displayName =
    user?.full_name || user?.name || user?.username || 'User';

  const handleAction = (key: string) => {
    const meta = ACTION_META[key];
    if (meta?.route) {
      router.push(meta.route as any);
      return;
    }
    if (key === 'clients' || key === 'portfolio') {
      router.push('/(tabs)/search');
      return;
    }
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
      {(stats?.branch_name || stats?.area_name || stats?.zone_name || user?.zone_id || user?.area_id || user?.branch_id) && (
        <View style={[styles.scopeCard, { backgroundColor: colors.card }]}>
          <Ionicons name="location-outline" size={18} color={colors.primary} />
          <View style={{ flex: 1, marginLeft: 10 }}>
            {(stats?.zone_name || user?.zone_id) ? (
              <Text style={[styles.scopeText, { color: colors.textSecondary }]}>
                Zone: {stats?.zone_name || user?.zone_id}
              </Text>
            ) : null}
            {(stats?.area_name || user?.area_id) ? (
              <Text style={[styles.scopeText, { color: colors.textSecondary }]}>
                Area: {stats?.area_name || user?.area_id}
              </Text>
            ) : null}
            {(stats?.branch_name || user?.branch_id) ? (
              <Text style={[styles.scopeText, { color: colors.textSecondary }]}>
                Branch: {stats?.branch_name || user?.branch_id}
              </Text>
            ) : null}
          </View>
        </View>
      )}

      {statsNote ? (
        <View style={[styles.infoCard, { backgroundColor: colors.infoBg, marginBottom: 12 }]}>
          <Ionicons name="information-circle" size={18} color={colors.primary} />
          <Text style={[styles.infoText, { color: colors.primaryDark }]}>
            {statsNote}
            {statsSource === 'cache' ? ' (cached)' : ''}
          </Text>
        </View>
      ) : null}

      {/* Overview stats – CO PHP dashboard parity */}
      {!isClient && isField && (
        <>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Overview</Text>
          <View style={styles.summaryGrid}>
            <LinearGradient colors={['#22C55E', '#16A34A']} style={styles.summaryCard}>
              <Ionicons name="wallet-outline" size={20} color="#fff" style={styles.cardIcon} />
              <Text style={styles.cardTitle}>Monthly Net Savings</Text>
              <Text style={styles.cardValue}>
                {stats ? '₦' + Number(stats.monthly_net_savings ?? stats.net_savings_month ?? 0).toLocaleString() : '—'}
              </Text>
            </LinearGradient>
            <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.summaryCard}>
              <Ionicons name="cash-outline" size={20} color="#fff" style={styles.cardIcon} />
              <Text style={styles.cardTitle}>Monthly Disbursed</Text>
              <Text style={styles.cardValue}>
                {stats ? '₦' + Number(stats.monthly_disbursed ?? 0).toLocaleString() : '—'}
              </Text>
            </LinearGradient>
          </View>
          <View style={styles.summaryGrid}>
            <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.summaryCard}>
              <Ionicons name="document-text-outline" size={20} color="#fff" style={styles.cardIcon} />
              <Text style={styles.cardTitle}>Active Loans</Text>
              <Text style={styles.cardValue}>
                {stats ? String(stats.active_loans ?? 0) : '—'}
              </Text>
            </LinearGradient>
            <LinearGradient colors={['#F59E0B', '#D97706']} style={styles.summaryCard}>
              <Ionicons name="people-outline" size={20} color="#fff" style={styles.cardIcon} />
              <Text style={styles.cardTitle}>Active Clients</Text>
              <Text style={styles.cardValue}>
                {stats ? String(stats.clients ?? 0) : '—'}
              </Text>
            </LinearGradient>
          </View>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>Portfolio</Text>
          <View style={styles.summaryGrid}>
            <LinearGradient colors={['#10B981', '#059669']} style={styles.summaryCard}>
              <Ionicons name="piggy-bank-outline" size={20} color="#fff" style={styles.cardIcon} />
              <Text style={styles.cardTitle}>Total Savings</Text>
              <Text style={styles.cardValue}>
                {stats ? '₦' + Number(stats.total_savings ?? 0).toLocaleString() : '—'}
              </Text>
            </LinearGradient>
            <LinearGradient colors={['#EF4444', '#DC2626']} style={styles.summaryCard}>
              <Ionicons name="alert-circle-outline" size={20} color="#fff" style={styles.cardIcon} />
              <Text style={styles.cardTitle}>Outstanding Loans</Text>
              <Text style={styles.cardValue}>
                {stats ? '₦' + Number(stats.total_loans_outstanding ?? stats.outstanding ?? 0).toLocaleString() : '—'}
              </Text>
            </LinearGradient>
          </View>
          <View style={styles.summaryGrid}>
            <LinearGradient
              colors={Number(stats?.portfolio_net ?? 0) >= 0 ? ['#06B6D4', '#0891B2'] : ['#F43F5E', '#E11D48']}
              style={[styles.summaryCard, { flex: 1 }]}
            >
              <Ionicons name="trending-up-outline" size={20} color="#fff" style={styles.cardIcon} />
              <Text style={styles.cardTitle}>Portfolio Net</Text>
              <Text style={styles.cardValue}>
                {stats ? '₦' + Number(stats.portfolio_net ?? 0).toLocaleString() : '—'}
              </Text>
            </LinearGradient>
            <LinearGradient colors={['#6366F1', '#4F46E5']} style={styles.summaryCard}>
              <Ionicons name="today-outline" size={20} color="#fff" style={styles.cardIcon} />
              <Text style={styles.cardTitle}>Today Savings</Text>
              <Text style={styles.cardValue}>
                {stats ? '₦' + Number(stats.savings_today ?? 0).toLocaleString() : '—'}
              </Text>
            </LinearGradient>
          </View>
          <View style={styles.summaryGrid}>
            <LinearGradient colors={['#A855F7', '#9333EA']} style={styles.summaryCard}>
              <Ionicons name="card-outline" size={20} color="#fff" style={styles.cardIcon} />
              <Text style={styles.cardTitle}>Today Loan Collect</Text>
              <Text style={styles.cardValue}>
                {stats ? '₦' + Number(stats.collected_today ?? 0).toLocaleString() : '—'}
              </Text>
            </LinearGradient>
            <LinearGradient colors={['#14B8A6', '#0D9488']} style={styles.summaryCard}>
              <Ionicons name="calendar-outline" size={20} color="#fff" style={styles.cardIcon} />
              <Text style={styles.cardTitle}>Month Loan Collect</Text>
              <Text style={styles.cardValue}>
                {stats ? '₦' + Number(stats.collected_month ?? 0).toLocaleString() : '—'}
              </Text>
            </LinearGradient>
          </View>

          {/* Union performance */}
          {Array.isArray(stats?.unions) && stats.unions.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Unions</Text>
              {stats.unions.map((u: any) => (
                <View key={u.name} style={[styles.unionCard, { backgroundColor: colors.card }]}>
                  <Text style={[styles.unionName, { color: colors.text }]}>{u.name}</Text>
                  <View style={styles.unionRow}>
                    <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{u.clients} clients</Text>
                    <Text style={{ color: '#16A34A', fontSize: 12, fontWeight: '600' }}>
                      Sav ₦{Number(u.savings || 0).toLocaleString()}
                    </Text>
                    <Text style={{ color: '#DC2626', fontSize: 12, fontWeight: '600' }}>
                      Loan ₦{Number(u.loans || 0).toLocaleString()}
                    </Text>
                  </View>
                </View>
              ))}
            </>
          )}
        </>
      )}

      {/* Overview for managers / non-CO */}
      {!isClient && !isField && (
        <>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Overview</Text>
          <View style={styles.summaryGrid}>
            <LinearGradient colors={['#4CAF50', '#45a049']} style={styles.summaryCard}>
              <Ionicons name="wallet-outline" size={20} color="#fff" style={styles.cardIcon} />
              <Text style={styles.cardTitle}>Net Savings</Text>
              <Text style={styles.cardValue}>
                {stats ? '₦' + Number(stats.monthly_net_savings ?? stats.net_savings_month ?? 0).toLocaleString() : '—'}
              </Text>
            </LinearGradient>
            <LinearGradient colors={['#2196F3', '#1e88e5']} style={styles.summaryCard}>
              <Ionicons name="cash-outline" size={20} color="#fff" style={styles.cardIcon} />
              <Text style={styles.cardTitle}>Collected Today</Text>
              <Text style={styles.cardValue}>
                {stats ? '₦' + Number(stats.collected_today || 0).toLocaleString() : '—'}
              </Text>
            </LinearGradient>
          </View>
          <View style={styles.summaryGrid}>
            <LinearGradient colors={['#9C27B0', '#8e24aa']} style={styles.summaryCard}>
              <Ionicons name="people-outline" size={20} color="#fff" style={styles.cardIcon} />
              <Text style={styles.cardTitle}>Clients</Text>
              <Text style={styles.cardValue}>
                {stats ? String(stats.clients ?? '—') : '—'}
              </Text>
            </LinearGradient>
            <LinearGradient colors={['#f44336', '#d32f2f']} style={styles.summaryCard}>
              <Ionicons name="alert-circle-outline" size={20} color="#fff" style={styles.cardIcon} />
              <Text style={styles.cardTitle}>Outstanding</Text>
              <Text style={styles.cardValue}>
                {stats ? '₦' + Number(stats.total_loans_outstanding ?? stats.outstanding ?? 0).toLocaleString() : '—'}
              </Text>
            </LinearGradient>
          </View>
          <View style={styles.summaryGrid}>
            <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.summaryCard}>
              <Ionicons name="cash-outline" size={20} color="#fff" style={styles.cardIcon} />
              <Text style={styles.cardTitle}>Monthly Disbursed</Text>
              <Text style={styles.cardValue}>
                {stats ? '₦' + Number(stats.monthly_disbursed ?? 0).toLocaleString() : '—'}
              </Text>
            </LinearGradient>
            <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.summaryCard}>
              <Ionicons name="document-text-outline" size={20} color="#fff" style={styles.cardIcon} />
              <Text style={styles.cardTitle}>Active Loans</Text>
              <Text style={styles.cardValue}>
                {stats ? String(stats.active_loans ?? 0) : '—'}
              </Text>
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
