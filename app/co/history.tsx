import { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, ActivityIndicator, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useThemeStore } from '../../src/store/theme';
import { loadActivities } from '../../src/services/data';
import { SPACING, RADIUS } from '../../src/constants/config';

const typeMeta: Record<string, { icon: string; color: string; label: string }> = {
  Saving: { icon: 'arrow-down-circle-outline', color: '#16A34A', label: 'Savings' },
  Withdrawal: { icon: 'arrow-up-circle-outline', color: '#DC2626', label: 'Withdrawals' },
  Payment: { icon: 'cash-outline', color: '#7C3AED', label: 'Payments' },
  Disbursement: { icon: 'card-outline', color: '#2563EB', label: 'Disbursements' },
  Registration: { icon: 'person-add-outline', color: '#0891B2', label: 'Registrations' },
};
const filters = ['All', 'Saving', 'Withdrawal', 'Payment', 'Disbursement', 'Registration'];

export default function CoHistoryScreen() {
  const colors = useThemeStore((s) => s.colors);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [filter, setFilter] = useState('All');

  const load = useCallback(async () => {
    setNote(null);
    try {
      const res = await loadActivities(100);
      setItems(Array.isArray(res.data) ? res.data : []);
      setNote(res.error || null);
    } catch (error: any) {
      setItems([]);
      setNote(error?.message || 'Could not load activity history.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const filteredItems = useMemo(() => filter === 'All' ? items : items.filter((item) => item.type === filter), [items, filter]);
  const totalAmount = useMemo(() => filteredItems.reduce((sum, item) => sum + Number(item.amount || 0), 0), [filteredItems]);
  const money = (value: unknown) => `₦${Number(value || 0).toLocaleString()}`;
  const formatDate = (value: unknown) => {
    if (!value) return 'Date unavailable';
    const date = new Date(String(value));
    if (Number.isNaN(date.getTime())) return String(value).slice(0, 16);
    return date.toLocaleString([], { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (loading) return <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}><ActivityIndicator size="large" color={colors.primary} /><Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading your history…</Text></View>;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={filteredItems}
        keyExtractor={(item, index) => String(item.transaction_id || item.id || `${item.type}-${item.date}-${index}`)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); void load(); }} tintColor={colors.primary} />}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={<>
          <View style={[styles.hero, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.heroIcon, { backgroundColor: colors.primary + '16' }]}><Ionicons name="time-outline" size={25} color={colors.primary} /></View>
            <View style={{ flex: 1 }}><Text style={[styles.heroTitle, { color: colors.text }]}>Activity History</Text><Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>Your latest field transactions</Text></View>
            <View style={styles.heroStat}><Text style={[styles.heroCount, { color: colors.text }]}>{filteredItems.length}</Text><Text style={[styles.heroLabel, { color: colors.textSecondary }]}>records</Text></View>
          </View>
          {note ? <View style={[styles.info, { backgroundColor: colors.infoBg }]}><Ionicons name="alert-circle-outline" size={18} color={colors.primary} /><View style={{ flex: 1, marginLeft: 8 }}><Text style={[styles.infoText, { color: colors.primaryDark }]}>{note}</Text><Pressable onPress={() => { setRefreshing(true); void load(); }} style={styles.retryLink}><Text style={[styles.retryText, { color: colors.primary }]}>Retry</Text></Pressable></View></View> : null}
          <View style={styles.filterHeader}><Text style={[styles.sectionTitle, { color: colors.text }]}>Filter activity</Text><Text style={[styles.total, { color: colors.textSecondary }]}>{money(totalAmount)}</Text></View>
          <FlatList horizontal showsHorizontalScrollIndicator={false} data={filters} keyExtractor={(item) => item} contentContainerStyle={styles.filters} renderItem={({ item }) => { const active = filter === item; return <Pressable onPress={() => setFilter(item)} style={[styles.filterChip, { backgroundColor: active ? colors.primary : colors.card, borderColor: active ? colors.primary : colors.border }]}><Text style={{ color: active ? '#fff' : colors.textSecondary, fontSize: 12, fontWeight: '700' }}>{item === 'All' ? 'All' : typeMeta[item]?.label || item}</Text></Pressable>; }} />
        </>}
        ListEmptyComponent={<View style={styles.empty}><View style={[styles.emptyIcon, { backgroundColor: colors.card }]}><Ionicons name={note ? 'cloud-offline-outline' : 'receipt-outline'} size={38} color={colors.textMuted} /></View><Text style={[styles.emptyTitle, { color: colors.text }]}>{note ? 'History could not be loaded' : 'No activity found'}</Text><Text style={[styles.emptyText, { color: colors.textSecondary }]}>{note ? 'The app could not get your transaction history from the CUPAD API.' : 'Try another filter or pull down to refresh.'}</Text></View>}
        renderItem={({ item }) => { const meta = typeMeta[item.type] || { icon: 'time-outline', color: colors.primary, label: item.type || 'Activity' }; return <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}><View style={[styles.activityIcon, { backgroundColor: meta.color + '16' }]}><Ionicons name={meta.icon as any} size={21} color={meta.color} /></View><View style={styles.cardBody}><View style={styles.row}><Text style={[styles.client, { color: colors.text }]} numberOfLines={1}>{item.client_name || 'Unknown client'}</Text><Text style={[styles.amount, { color: meta.color }]}>{money(item.amount)}</Text></View><View style={styles.rowBottom}><View style={[styles.typeBadge, { backgroundColor: meta.color + '14' }]}><Text style={{ color: meta.color, fontSize: 10, fontWeight: '800' }}>{meta.label}</Text></View><Text style={[styles.date, { color: colors.textSecondary }]}>{formatDate(item.date)}</Text></View></View></View>; }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 }, listContent: { padding: SPACING.md, paddingBottom: 40, flexGrow: 1 }, loadingText: { marginTop: 10, fontSize: 13 },
  hero: { flexDirection: 'row', alignItems: 'center', borderRadius: RADIUS.lg, borderWidth: 1, padding: 16, marginBottom: 12 }, heroIcon: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 12 }, heroTitle: { fontSize: 18, fontWeight: '800' }, heroSubtitle: { fontSize: 11, marginTop: 3 }, heroStat: { alignItems: 'flex-end', marginLeft: 8 }, heroCount: { fontSize: 20, fontWeight: '900' }, heroLabel: { fontSize: 10 },
  info: { flexDirection: 'row', alignItems: 'flex-start', padding: 12, borderRadius: RADIUS.md, marginBottom: 12 }, infoText: { fontSize: 12, lineHeight: 18 }, retryLink: { marginTop: 5 }, retryText: { fontSize: 12, fontWeight: '900' }, filterHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }, sectionTitle: { fontSize: 14, fontWeight: '800' }, total: { fontSize: 11, fontWeight: '700' }, filters: { gap: 8, paddingVertical: 10, paddingBottom: 14 }, filterChip: { paddingHorizontal: 13, paddingVertical: 8, borderRadius: 999, borderWidth: 1 },
  card: { flexDirection: 'row', alignItems: 'center', borderRadius: RADIUS.md, borderWidth: 1, padding: 12, marginBottom: 8 }, activityIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 11 }, cardBody: { flex: 1, minWidth: 0 }, row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }, client: { flex: 1, fontSize: 14, fontWeight: '750' as any }, amount: { fontSize: 14, fontWeight: '900' }, rowBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 7, gap: 8 }, typeBadge: { paddingHorizontal: 7, paddingVertical: 4, borderRadius: 6 }, date: { flex: 1, textAlign: 'right', fontSize: 10 },
  empty: { alignItems: 'center', paddingTop: 55, paddingHorizontal: 20 }, emptyIcon: { width: 72, height: 72, borderRadius: 24, alignItems: 'center', justifyContent: 'center' }, emptyTitle: { fontSize: 16, fontWeight: '800', marginTop: 14 }, emptyText: { fontSize: 12, textAlign: 'center', marginTop: 6, lineHeight: 18 },
});
