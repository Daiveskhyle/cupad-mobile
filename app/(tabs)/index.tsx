import { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/store/auth';
import { useThemeStore } from '../../src/store/theme';
import { SPACING, RADIUS } from '../../src/constants/config';
import { getRoleConfig, ACTION_META } from '../../src/constants/roles';
import { loadDashboardStats, loadActivities } from '../../src/services/data';
import StatsCarousel from '../../src/components/StatsCarousel';

export default function DashboardScreen() {
  const user = useAuthStore((s) => s.user);
  const roleCfg = getRoleConfig(user?.role);
  const colors = useThemeStore((s) => s.colors);
  const [stats, setStats] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [statsNote, setStatsNote] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const refreshDashboard = useCallback(async () => {
    try {
      const [statsRes, activityRes] = await Promise.all([loadDashboardStats(), loadActivities(30)]);
      setStats(statsRes.data);
      setStatsNote(statsRes.error || activityRes.error || null);
      setActivities(activityRes.data || []);
    } catch (error) {
      setStatsNote(error instanceof Error ? error.message : 'Unable to refresh dashboard.');
    }
  }, []);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    Promise.all([loadDashboardStats(), loadActivities(30)])
      .then(([statsRes, activityRes]) => {
        if (!alive) return;
        setStats(statsRes.data);
        setStatsNote(statsRes.error || activityRes.error || null);
        setActivities(activityRes.data || []);
      })
      .catch((error) => { if (alive) setStatsNote(error instanceof Error ? error.message : 'Unable to load dashboard.'); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  const onRefresh = useCallback(async () => { setRefreshing(true); await refreshDashboard(); setRefreshing(false); }, [refreshDashboard]);
  const retry = useCallback(async () => { setLoading(true); setStatsNote(null); try { await refreshDashboard(); } finally { setLoading(false); } }, [refreshDashboard]);
  const displayName = user?.full_name || user?.name || user?.username || 'User';
  const isField = roleCfg.key === 'co';
  const isClient = roleCfg.key === 'client';
  const isManager = ['am', 'bm', 'zm', 'dzm', 'tm', 'admin'].includes(roleCfg.key);
  const location = {
    zone: typeof stats?.zone_name === 'string' && stats.zone_name.trim() ? stats.zone_name : (typeof user?.zone_name === 'string' && user.zone_name.trim() ? user.zone_name : null),
    area: typeof stats?.area_name === 'string' && stats.area_name.trim() ? stats.area_name : (typeof user?.area_name === 'string' && user.area_name.trim() ? user.area_name : null),
    branch: typeof stats?.branch_name === 'string' && stats.branch_name.trim() ? stats.branch_name : (typeof user?.branch_name === 'string' && user.branch_name.trim() ? user.branch_name : null),
  };
  const handleAction = (key: string) => { const meta = ACTION_META[key]; if (meta?.route) router.push(meta.route as any); else if (key === 'clients' || key === 'portfolio') router.push('/(tabs)/search'); };
  const money = (value: unknown) => `₦${Number(value ?? 0).toLocaleString()}`;
  const activityIcon = (type: string) => type === 'Saving' ? 'arrow-down-circle-outline' : type === 'Withdrawal' ? 'arrow-up-circle-outline' : type === 'Payment' ? 'cash-outline' : type === 'Disbursement' ? 'card-outline' : 'time-outline';
  const activityColor = (type: string) => type === 'Saving' ? '#16A34A' : type === 'Withdrawal' ? '#DC2626' : type === 'Payment' ? '#7C3AED' : type === 'Disbursement' ? '#2563EB' : colors.primary;

  const statsItems = isField ? [
    { title: 'Monthly Net Savings', value: money(stats?.monthly_net_savings ?? stats?.net_savings_month), icon: 'wallet-outline', colors: ['#22C55E', '#16A34A'] as [string, string] },
    { title: 'Monthly Disbursed', value: money(stats?.monthly_disbursed), icon: 'cash-outline', colors: ['#3B82F6', '#2563EB'] as [string, string] },
    { title: 'Clients', value: String(stats?.clients ?? 0), icon: 'people-outline', colors: ['#8B5CF6', '#7C3AED'] as [string, string] },
    { title: 'Active Loans', value: String(stats?.active_loans ?? 0), icon: 'document-text-outline', colors: ['#F59E0B', '#D97706'] as [string, string] },
    { title: 'Total Savings', value: money(stats?.total_savings), icon: 'wallet-outline', colors: ['#10B981', '#059669'] as [string, string] },
    { title: 'Outstanding Loans', value: money(stats?.total_loans_outstanding ?? stats?.outstanding), icon: 'alert-circle-outline', colors: ['#EF4444', '#DC2626'] as [string, string] },
    { title: 'Today Savings', value: money(stats?.savings_today), icon: 'today-outline', colors: ['#6366F1', '#4F46E5'] as [string, string] },
    { title: 'Today Loan Collect', value: money(stats?.collected_today), icon: 'card-outline', colors: ['#A855F7', '#9333EA'] as [string, string] },
  ] : [
    { title: isClient ? 'Savings' : 'Net Savings', value: isClient ? '—' : money(stats?.monthly_net_savings ?? stats?.net_savings_month), icon: 'wallet-outline', colors: ['#22C55E', '#16A34A'] as [string, string] },
    { title: isClient ? 'Loan Balance' : 'Collected Today', value: isClient ? '—' : money(stats?.collected_today), icon: 'cash-outline', colors: ['#3B82F6', '#2563EB'] as [string, string] },
    { title: 'Clients', value: String(stats?.clients ?? 0), icon: 'people-outline', colors: ['#8B5CF6', '#7C3AED'] as [string, string] },
    { title: 'Outstanding', value: money(stats?.total_loans_outstanding ?? stats?.outstanding), icon: 'alert-circle-outline', colors: ['#F59E0B', '#D97706'] as [string, string] },
  ];

  const Skeleton = ({ width = '100%', height = 16, radius = 8 }: { width?: any; height?: number; radius?: number }) => <View style={[styles.skeleton, { width, height, borderRadius: radius, backgroundColor: colors.border }]} />;
  const DashboardSkeleton = () => <>
    <View style={[styles.loadingCard, { backgroundColor: colors.card }]}><Skeleton width="38%" height={13} /><View style={{ height: 9 }} /><Skeleton width="62%" height={24} radius={7} /><View style={{ height: 10 }} /><Skeleton width="25%" height={22} radius={20} /><View style={{ height: 9 }} /><Skeleton width="82%" height={12} /></View>
    <View style={[styles.loadingScope, { backgroundColor: colors.card }]}><Skeleton width={38} height={38} radius={19} /><View style={{ flex: 1, marginLeft: 12 }}><Skeleton width="42%" height={13} /><View style={{ height: 8 }} /><Skeleton width="72%" height={11} /><View style={{ height: 6 }} /><Skeleton width="60%" height={11} /></View></View>
    <Skeleton width="28%" height={16} /><View style={styles.loadingCarousel}><View style={[styles.loadingCarouselCard, { backgroundColor: colors.card }]}><Skeleton width={42} height={42} radius={21} /><View style={{ height: 12 }} /><Skeleton width="55%" height={12} /><View style={{ height: 8 }} /><Skeleton width="70%" height={24} /></View></View>
    <Skeleton width="32%" height={16} /><View style={styles.loadingActions}>{[1,2,3,4,5,6].map((item) => <View key={item} style={[styles.loadingAction, { backgroundColor: colors.card }]}><Skeleton width={42} height={42} radius={21} /><View style={{ height: 8 }} /><Skeleton width="65%" height={10} /></View>)}</View>
  </>;

  return <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />}>
    {loading ? <DashboardSkeleton /> : <>
      <LinearGradient colors={[roleCfg.accent, colors.gradientEnd]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.welcomeCard}><Text style={styles.greeting}>Welcome back,</Text><Text style={styles.name}>{displayName}</Text><View style={styles.roleBadge}><Text style={styles.roleText}>{roleCfg.shortLabel}</Text></View><Text style={styles.roleDesc}>{roleCfg.description}</Text></LinearGradient>
      {(location.zone || location.area || location.branch) ? <View style={[styles.scopeCard, { backgroundColor: colors.card }]}><Ionicons name="map-outline" size={20} color={colors.primary} /><View style={styles.scopeBody}><Text style={[styles.scopeHeading, { color: colors.text }]}>Assigned Location</Text>{location.zone ? <Text style={[styles.scopeText, { color: colors.textSecondary }]}><Text style={styles.scopeLabel}>Zone:</Text> {location.zone}</Text> : null}{location.area ? <Text style={[styles.scopeText, { color: colors.textSecondary }]}><Text style={styles.scopeLabel}>Area:</Text> {location.area}</Text> : null}{location.branch ? <Text style={[styles.scopeText, { color: colors.textSecondary }]}><Text style={styles.scopeLabel}>Branch:</Text> {location.branch}</Text> : null}</View></View> : null}
      {statsNote ? <View style={[styles.infoCard, { backgroundColor: colors.infoBg }]}><Ionicons name="information-circle" size={18} color={colors.primary} /><Text style={[styles.infoText, { color: colors.primaryDark }]}>{statsNote}</Text></View> : null}
      {!stats && statsNote ? <View style={[styles.retryCard, { backgroundColor: colors.card }]}><View style={[styles.retryIcon, { backgroundColor: colors.primary + '12' }]}><Ionicons name="cloud-offline-outline" size={24} color={colors.primary} /></View><Text style={[styles.retryTitle, { color: colors.text }]}>Dashboard unavailable</Text><Text style={[styles.retryText, { color: colors.textSecondary }]}>We couldn't load your dashboard data. Check your connection and try again.</Text><TouchableOpacity style={[styles.retryButton, { backgroundColor: colors.primary }]} onPress={retry} activeOpacity={0.8}><Ionicons name="refresh" size={17} color="#fff" /><Text style={styles.retryButtonText}>Try again</Text></TouchableOpacity></View> : null}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{isClient ? 'My Portfolio' : 'Overview'}</Text>
      <StatsCarousel items={statsItems} />
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{isField ? 'Field Actions' : isManager ? 'Management' : 'Quick Actions'}</Text>
      <View style={styles.actionsGrid}>{roleCfg.actions.map((key) => { const meta = ACTION_META[key]; if (!meta) return null; return <TouchableOpacity key={key} style={[styles.actionCard, { backgroundColor: colors.card }]} onPress={() => handleAction(key)} activeOpacity={0.8}><View style={[styles.iconCircle, { backgroundColor: meta.color + '18' }]}><Ionicons name={meta.icon as any} size={22} color={meta.color} /></View><Text style={[styles.actionLabel, { color: colors.text }]}>{meta.label}</Text></TouchableOpacity>; })}</View>
      {!isClient && Array.isArray(stats?.unions) && stats.unions.length > 0 ? <><Text style={[styles.sectionTitle, { color: colors.text }]}>Unions</Text>{stats.unions.map((u: any) => <View key={String(u.name)} style={[styles.unionCard, { backgroundColor: colors.card }]}><Text style={[styles.unionName, { color: colors.text }]}>{u.name}</Text><View style={styles.unionRow}><Text style={[styles.unionMetric, { color: colors.textSecondary }]}>{u.clients ?? 0} clients</Text><Text style={[styles.unionMetric, { color: '#16A34A' }]}>Sav {money(u.savings)}</Text><Text style={[styles.unionMetric, { color: '#DC2626' }]}>Loan {money(u.loans)}</Text></View></View>)}</> : null}
      {!isClient && activities.length > 0 ? <><View style={styles.sectionHeaderRow}><View style={styles.sectionHeaderTitle}><Text style={[styles.sectionTitle, styles.sectionTitleNoMargin, { color: colors.text }]}>Recent Activity</Text><Text style={[styles.historyHint, { color: colors.textSecondary }]}>Latest 30</Text></View>{isField ? <TouchableOpacity onPress={() => router.push('/co/history')} style={[styles.historyButton, { backgroundColor: colors.primary + '12' }]} activeOpacity={0.75}><Text style={[styles.historyButtonText, { color: colors.primary }]}>View all</Text><Ionicons name="chevron-forward" size={16} color={colors.primary} /></TouchableOpacity> : null}</View>{activities.slice(0, 5).map((item, index) => { const color = activityColor(item.type); const date = item.date ? new Date(item.date).toLocaleString([], { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''; return <View key={`${item.transaction_id || item.type}-${item.date || index}`} style={[styles.activityCard, { backgroundColor: colors.card }]}><View style={[styles.activityIcon, { backgroundColor: `${color}18` }]}><Ionicons name={activityIcon(item.type) as any} size={20} color={color} /></View><View style={styles.activityBody}><View style={styles.activityTop}><Text style={[styles.activityClient, { color: colors.text }]} numberOfLines={1}>{item.client_name || 'Unknown client'}</Text><Text style={[styles.activityAmount, { color }]}>{money(item.amount)}</Text></View><View style={styles.activityBottom}><Text style={[styles.activityType, { color }]}>{item.type || 'Activity'}</Text><Text style={[styles.activityDate, { color: colors.textSecondary }]}>{date}</Text></View></View></View>; })}</> : null}
      {!isClient ? <TouchableOpacity style={styles.searchBanner} onPress={() => router.push('/(tabs)/search')} activeOpacity={0.85}><LinearGradient colors={[colors.gradientStart, colors.gradientEnd]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.searchBannerInner}><Ionicons name="search" size={22} color="#fff" /><Text style={styles.searchBannerText}>Search Clients</Text><Ionicons name="chevron-forward" size={20} color="#fff" /></LinearGradient></TouchableOpacity> : null}
      <View style={styles.infoCard}><Ionicons name="information-circle" size={20} color={colors.primary} /><Text style={[styles.infoText, { color: colors.primaryDark }]}>You are signed in as <Text style={{ fontWeight: '700' }}>{roleCfg.label}</Text>.</Text></View>
    </>}
  </ScrollView>;
}

const styles = StyleSheet.create({
  container: { flex: 1 }, content: { padding: SPACING.md, paddingBottom: 48 }, welcomeCard: { borderRadius: RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.md }, greeting: { color: 'rgba(255,255,255,0.85)', fontSize: 14 }, name: { color: '#FFFFFF', fontSize: 24, fontWeight: '800', marginTop: 4 }, roleBadge: { alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.25)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: RADIUS.full, marginTop: 10 }, roleText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' }, roleDesc: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 8 }, scopeCard: { flexDirection: 'row', alignItems: 'flex-start', borderRadius: RADIUS.md, padding: 14, marginBottom: SPACING.md }, scopeBody: { flex: 1, marginLeft: 10 }, scopeHeading: { fontSize: 14, fontWeight: '800', marginBottom: 5 }, scopeText: { fontSize: 13, lineHeight: 20 }, scopeLabel: { fontWeight: '700' }, sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12, marginTop: 4 }, sectionTitleNoMargin: { marginBottom: 0 }, sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4, marginBottom: 12 }, sectionHeaderTitle: { flex: 1 }, historyHint: { fontSize: 11, fontWeight: '600', marginTop: 3 }, historyButton: { flexDirection: 'row', alignItems: 'center', gap: 2, paddingHorizontal: 10, paddingVertical: 7, borderRadius: RADIUS.full }, historyButtonText: { fontSize: 12, fontWeight: '800' }, unionCard: { borderRadius: RADIUS.md, padding: 14, marginBottom: 10 }, unionName: { fontSize: 14, fontWeight: '700', marginBottom: 8 }, unionRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 }, unionMetric: { fontSize: 12, fontWeight: '600' }, actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: SPACING.lg }, actionCard: { width: '30%', flexGrow: 1, maxWidth: '32%', borderRadius: RADIUS.md, paddingVertical: 14, paddingHorizontal: 8, alignItems: 'center', elevation: 1 }, iconCircle: { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center', marginBottom: 8 }, actionLabel: { fontSize: 11, fontWeight: '600', textAlign: 'center' }, activityCard: { flexDirection: 'row', alignItems: 'center', borderRadius: RADIUS.md, padding: 12, marginBottom: 8 }, activityIcon: { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center', marginRight: 10 }, activityBody: { flex: 1 }, activityTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }, activityClient: { flex: 1, fontSize: 13, fontWeight: '700' }, activityAmount: { fontSize: 13, fontWeight: '800' }, activityBottom: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 }, activityType: { fontSize: 11, fontWeight: '700' }, activityDate: { fontSize: 10 }, searchBanner: { marginBottom: SPACING.lg, marginTop: 8, borderRadius: RADIUS.md, overflow: 'hidden' }, searchBannerInner: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 }, searchBannerText: { flex: 1, color: '#FFFFFF', fontSize: 15, fontWeight: '700' }, infoCard: { flexDirection: 'row', borderRadius: RADIUS.md, padding: 14, gap: 10, marginBottom: 12 }, infoText: { flex: 1, fontSize: 13, lineHeight: 18 }, loadingCard: { borderRadius: RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.md }, loadingScope: { flexDirection: 'row', alignItems: 'center', borderRadius: RADIUS.md, padding: 14, marginBottom: SPACING.lg }, loadingCarousel: { marginBottom: SPACING.md }, loadingCarouselCard: { width: '100%', borderRadius: RADIUS.lg, padding: 17, minHeight: 138 }, skeleton: { opacity: 0.55 }, loadingActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12, marginBottom: SPACING.lg }, loadingAction: { width: '30%', flexGrow: 1, maxWidth: '32%', minHeight: 90, borderRadius: RADIUS.md, padding: 12, alignItems: 'center', justifyContent: 'center' }, retryCard: { borderRadius: RADIUS.lg, padding: 20, alignItems: 'center', marginBottom: SPACING.lg }, retryIcon: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }, retryTitle: { fontSize: 17, fontWeight: '800', marginBottom: 6 }, retryText: { fontSize: 13, lineHeight: 19, textAlign: 'center', marginBottom: 16 }, retryButton: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 18, paddingVertical: 11, borderRadius: RADIUS.full }, retryButtonText: { color: '#fff', fontSize: 13, fontWeight: '800' },
});
