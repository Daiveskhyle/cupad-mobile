import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/store/auth';
import { useThemeStore } from '../../src/store/theme';
import { SPACING, RADIUS } from '../../src/constants/config';
import { getRoleConfig, ACTION_META } from '../../src/constants/roles';
import { loadDashboardStats, loadActivities } from '../../src/services/data';

export default function DashboardScreen() {
  const user = useAuthStore((s) => s.user);
  const roleCfg = getRoleConfig(user?.role);
  const colors = useThemeStore((s) => s.colors);
  const [stats, setStats] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [statsNote, setStatsNote] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    Promise.all([loadDashboardStats(), loadActivities(30)]).then(([statsRes, activityRes]) => {
      if (!alive) return;
      setStats(statsRes.data);
      setStatsNote(statsRes.error || null);
      setActivities(activityRes.data || []);
    });
    return () => { alive = false; };
  }, []);

  const displayName = user?.full_name || user?.name || user?.username || 'User';
  const isField = roleCfg.key === 'co';
  const isClient = roleCfg.key === 'client';
  const isManager = ['am', 'bm', 'zm', 'dzm', 'tm', 'admin'].includes(roleCfg.key);

  // Display only database-resolved location names. IDs must never be shown as labels.
  const location = {
    zone: typeof stats?.zone_name === 'string' && stats.zone_name.trim() ? stats.zone_name : (typeof user?.zone_name === 'string' && user.zone_name.trim() ? user.zone_name : null),
    area: typeof stats?.area_name === 'string' && stats.area_name.trim() ? stats.area_name : (typeof user?.area_name === 'string' && user.area_name.trim() ? user.area_name : null),
    branch: typeof stats?.branch_name === 'string' && stats.branch_name.trim() ? stats.branch_name : (typeof user?.branch_name === 'string' && user.branch_name.trim() ? user.branch_name : null),
  };

  const handleAction = (key: string) => {
    const meta = ACTION_META[key];
    if (meta?.route) router.push(meta.route as any);
    else if (key === 'clients' || key === 'portfolio') router.push('/(tabs)/search');
  };

  const money = (value: unknown) => `₦${Number(value ?? 0).toLocaleString()}`;
  const activityIcon = (type: string) => {
    if (type === 'Saving') return 'arrow-down-circle-outline';
    if (type === 'Withdrawal') return 'arrow-up-circle-outline';
    if (type === 'Payment') return 'cash-outline';
    if (type === 'Disbursement') return 'card-outline';
    return 'time-outline';
  };
  const activityColor = (type: string) => {
    if (type === 'Saving') return '#16A34A';
    if (type === 'Withdrawal') return '#DC2626';
    if (type === 'Payment') return '#7C3AED';
    if (type === 'Disbursement') return '#2563EB';
    return colors.primary;
  };

  const card = (title: string, value: string, icon: string, colorsList: [string, string]) => (
    <LinearGradient colors={colorsList} style={styles.summaryCard} key={title}>
      <Ionicons name={icon as any} size={20} color="#fff" style={styles.cardIcon} />
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardValue}>{value}</Text>
    </LinearGradient>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <LinearGradient colors={[roleCfg.accent, colors.gradientEnd]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.welcomeCard}>
        <Text style={styles.greeting}>Welcome back,</Text>
        <Text style={styles.name}>{displayName}</Text>
        <View style={styles.roleBadge}><Text style={styles.roleText}>{roleCfg.shortLabel}</Text></View>
        <Text style={styles.roleDesc}>{roleCfg.description}</Text>
      </LinearGradient>

      {(location.zone || location.area || location.branch) ? (
        <View style={[styles.scopeCard, { backgroundColor: colors.card }]}>
          <Ionicons name="map-outline" size={20} color={colors.primary} />
          <View style={styles.scopeBody}>
            <Text style={[styles.scopeHeading, { color: colors.text }]}>Assigned Location</Text>
            {location.zone ? <Text style={[styles.scopeText, { color: colors.textSecondary }]}><Text style={styles.scopeLabel}>Zone:</Text> {location.zone}</Text> : null}
            {location.area ? <Text style={[styles.scopeText, { color: colors.textSecondary }]}><Text style={styles.scopeLabel}>Area:</Text> {location.area}</Text> : null}
            {location.branch ? <Text style={[styles.scopeText, { color: colors.textSecondary }]}><Text style={styles.scopeLabel}>Branch:</Text> {location.branch}</Text> : null}
          </View>
        </View>
      ) : null}

      {statsNote ? (
        <View style={[styles.infoCard, { backgroundColor: colors.infoBg }]}>
          <Ionicons name="information-circle" size={18} color={colors.primary} />
          <Text style={[styles.infoText, { color: colors.primaryDark }]}>{statsNote}</Text>
        </View>
      ) : null}

      {!isClient ? (
        <>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Overview</Text>
          <View style={styles.summaryGrid}>
            {card(isField ? 'Monthly Net Savings' : 'Net Savings', money(stats?.monthly_net_savings ?? stats?.net_savings_month), 'wallet-outline', ['#22C55E', '#16A34A'])}
            {card(isField ? 'Monthly Disbursed' : 'Collected Today', money(isField ? stats?.monthly_disbursed : stats?.collected_today), 'cash-outline', ['#3B82F6', '#2563EB'])}
          </View>
          <View style={styles.summaryGrid}>
            {card('Clients', String(stats?.clients ?? 0), 'people-outline', ['#8B5CF6', '#7C3AED'])}
            {card(isField ? 'Active Loans' : 'Outstanding', isField ? String(stats?.active_loans ?? 0) : money(stats?.total_loans_outstanding ?? stats?.outstanding), isField ? 'document-text-outline' : 'alert-circle-outline', ['#F59E0B', '#D97706'])}
          </View>
          {isField ? (
            <>
              <View style={styles.summaryGrid}>
                {card('Total Savings', money(stats?.total_savings), 'wallet-outline', ['#10B981', '#059669'])}
                {card('Outstanding Loans', money(stats?.total_loans_outstanding ?? stats?.outstanding), 'alert-circle-outline', ['#EF4444', '#DC2626'])}
              </View>
              <View style={styles.summaryGrid}>
                {card('Today Savings', money(stats?.savings_today), 'today-outline', ['#6366F1', '#4F46E5'])}
                {card('Today Loan Collect', money(stats?.collected_today), 'card-outline', ['#A855F7', '#9333EA'])}
              </View>
            </>
          ) : null}

          {Array.isArray(stats?.unions) && stats.unions.length > 0 ? (
            <>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Unions</Text>
              {stats.unions.map((u: any) => (
                <View key={String(u.name)} style={[styles.unionCard, { backgroundColor: colors.card }]}>
                  <Text style={[styles.unionName, { color: colors.text }]}>{u.name}</Text>
                  <View style={styles.unionRow}>
                    <Text style={[styles.unionMetric, { color: colors.textSecondary }]}>{u.clients ?? 0} clients</Text>
                    <Text style={[styles.unionMetric, { color: '#16A34A' }]}>Sav {money(u.savings)}</Text>
                    <Text style={[styles.unionMetric, { color: '#DC2626' }]}>Loan {money(u.loans)}</Text>
                  </View>
                </View>
              ))}
            </>
          ) : null}
        </>
      ) : (
        <>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>My Portfolio</Text>
          <View style={styles.summaryGrid}>
            {card('Savings', '—', 'wallet-outline', ['#4CAF50', '#45A049'])}
            {card('Loan Balance', '—', 'alert-circle-outline', ['#F44336', '#D32F2F'])}
          </View>
        </>
      )}

      <Text style={[styles.sectionTitle, { color: colors.text }]}>{isField ? 'Field Actions' : isManager ? 'Management' : 'Quick Actions'}</Text>
      <View style={styles.actionsGrid}>
        {roleCfg.actions.map((key) => {
          const meta = ACTION_META[key];
          if (!meta) return null;
          return (
            <TouchableOpacity key={key} style={[styles.actionCard, { backgroundColor: colors.card }]} onPress={() => handleAction(key)} activeOpacity={0.8}>
              <View style={[styles.iconCircle, { backgroundColor: meta.color + '18' }]}>
                <Ionicons name={meta.icon as any} size={22} color={meta.color} />
              </View>
              <Text style={[styles.actionLabel, { color: colors.text }]}>{meta.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {!isClient && activities.length > 0 ? (
        <>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, styles.sectionTitleNoMargin, { color: colors.text }]}>Recent Activity</Text>
            <Text style={[styles.historyHint, { color: colors.textSecondary }]}>Latest 30</Text>
          </View>
          {activities.map((item, index) => {
            const color = activityColor(item.type);
            const date = item.date ? new Date(item.date).toLocaleString([], { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';
            return (
              <View key={`${item.transaction_id || item.type}-${item.date || index}`} style={[styles.activityCard, { backgroundColor: colors.card }]}>
                <View style={[styles.activityIcon, { backgroundColor: `${color}18` }]}>
                  <Ionicons name={activityIcon(item.type) as any} size={20} color={color} />
                </View>
                <View style={styles.activityBody}>
                  <View style={styles.activityTop}>
                    <Text style={[styles.activityClient, { color: colors.text }]} numberOfLines={1}>{item.client_name || 'Unknown client'}</Text>
                    <Text style={[styles.activityAmount, { color }]}>{money(item.amount)}</Text>
                  </View>
                  <View style={styles.activityBottom}>
                    <Text style={[styles.activityType, { color }]}>{item.type || 'Activity'}</Text>
                    <Text style={[styles.activityDate, { color: colors.textSecondary }]}>{date}</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </>
      ) : null}

      {!isClient ? (
        <TouchableOpacity style={styles.searchBanner} onPress={() => router.push('/(tabs)/search')} activeOpacity={0.85}>
          <LinearGradient colors={[colors.gradientStart, colors.gradientEnd]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.searchBannerInner}>
            <Ionicons name="search" size={22} color="#fff" />
            <Text style={styles.searchBannerText}>Search Clients</Text>
            <Ionicons name="chevron-forward" size={20} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      ) : null}

      <View style={styles.infoCard}>
        <Ionicons name="information-circle" size={20} color={colors.primary} />
        <Text style={[styles.infoText, { color: colors.primaryDark }]}>You are signed in as <Text style={{ fontWeight: '700' }}>{roleCfg.label}</Text>.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { padding: SPACING.md, paddingBottom: 48 },
  welcomeCard: { borderRadius: RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.md },
  greeting: { color: 'rgba(255,255,255,0.85)', fontSize: 14 },
  name: { color: '#FFFFFF', fontSize: 24, fontWeight: '800', marginTop: 4 },
  roleBadge: { alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.25)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: RADIUS.full, marginTop: 10 },
  roleText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  roleDesc: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 8 },
  scopeCard: { flexDirection: 'row', alignItems: 'flex-start', borderRadius: RADIUS.md, padding: 14, marginBottom: SPACING.md },
  scopeBody: { flex: 1, marginLeft: 10 },
  scopeHeading: { fontSize: 14, fontWeight: '800', marginBottom: 5 },
  scopeText: { fontSize: 13, lineHeight: 20 },
  scopeLabel: { fontWeight: '700' },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12, marginTop: 4 },
  sectionTitleNoMargin: { marginBottom: 0 },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4, marginBottom: 12 },
  historyHint: { fontSize: 11, fontWeight: '600' },
  summaryGrid: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  summaryCard: { flex: 1, borderRadius: RADIUS.md, padding: 14, minHeight: 90 },
  cardIcon: { position: 'absolute', top: 10, right: 10, opacity: 0.9 },
  cardTitle: { color: 'rgba(255,255,255,0.9)', fontSize: 12, fontWeight: '600', marginBottom: 6 },
  cardValue: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
  unionCard: { borderRadius: RADIUS.md, padding: 14, marginBottom: 10 },
  unionName: { fontSize: 14, fontWeight: '700', marginBottom: 8 },
  unionRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  unionMetric: { fontSize: 12, fontWeight: '600' },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: SPACING.lg },
  actionCard: { width: '30%', flexGrow: 1, maxWidth: '32%', borderRadius: RADIUS.md, paddingVertical: 14, paddingHorizontal: 8, alignItems: 'center', elevation: 1 },
  iconCircle: { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  actionLabel: { fontSize: 11, fontWeight: '600', textAlign: 'center' },
  activityCard: { flexDirection: 'row', alignItems: 'center', borderRadius: RADIUS.md, padding: 12, marginBottom: 8 },
  activityIcon: { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  activityBody: { flex: 1 },
  activityTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  activityClient: { flex: 1, fontSize: 13, fontWeight: '700' },
  activityAmount: { fontSize: 13, fontWeight: '800' },
  activityBottom: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 },
  activityType: { fontSize: 11, fontWeight: '700' },
  activityDate: { fontSize: 10 },
  searchBanner: { marginBottom: SPACING.lg, marginTop: 8, borderRadius: RADIUS.md, overflow: 'hidden' },
  searchBannerInner: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  searchBannerText: { flex: 1, color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  infoCard: { flexDirection: 'row', backgroundColor: 'rgba(59,130,246,0.08)', borderRadius: RADIUS.md, padding: 14, gap: 10, marginBottom: 12 },
  infoText: { flex: 1, fontSize: 13, lineHeight: 18 },
});