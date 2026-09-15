import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../api/client';
import { useThemeStore } from '../store/theme';
import { SPACING, RADIUS } from '../constants/config';
import type { Client } from '../types';

type Props = {
  selected: Client | null;
  onSelect: (c: Client) => void;
};

export function ClientPicker({ selected, onSelect }: Props) {
  const colors = useThemeStore((s) => s.colors);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Client[]>([]);
  const [error, setError] = useState('');

  const loadClients = async (query = '') => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getClients({ q: query.trim() || undefined, limit: 100, offset: 0 });
      if (!res.success) throw new Error(res.error || 'Unable to load clients.');
      setResults(res.data || []);
    } catch (e: any) {
      setResults([]);
      setError(e?.message || 'Unable to load clients.');
    } finally {
      setLoading(false);
    }
  };

  const openPicker = () => {
    setOpen(true);
    setQ('');
    loadClients();
  };

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      loadClients(q);
    }, q.trim() ? 300 : 0);
    return () => clearTimeout(timer);
  }, [q, open]);

  return (
    <>
      <TouchableOpacity
        style={[styles.trigger, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}
        onPress={openPicker}
        activeOpacity={0.8}
      >
        <Ionicons name="person-outline" size={20} color={colors.textMuted} />
        <Text
          style={[styles.triggerText, { color: selected ? colors.text : colors.textMuted }]}
          numberOfLines={1}
        >
          {selected ? `${selected.name} (${selected.id})` : 'Select client'}
        </Text>
        <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
      </TouchableOpacity>

      <Modal visible={open} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setOpen(false)}>
        <View style={[styles.modal, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <View>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Select Client</Text>
              <Text style={[styles.modalSub, { color: colors.textSecondary }]}>Choose from your assigned clients</Text>
            </View>
            <TouchableOpacity onPress={() => setOpen(false)} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={[styles.searchRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="search-outline" size={19} color={colors.textMuted} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search name, phone or ID..."
              placeholderTextColor={colors.textMuted}
              value={q}
              onChangeText={setQ}
              autoFocus
              returnKeyType="search"
            />
            {q.length > 0 && (
              <TouchableOpacity onPress={() => setQ('')}>
                <Ionicons name="close-circle" size={19} color={colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.resultHeader}>
            <Text style={[styles.resultCount, { color: colors.textSecondary }]}>
              {loading ? 'Loading clients…' : `${results.length} client${results.length === 1 ? '' : 's'}`}
            </Text>
            <TouchableOpacity onPress={() => loadClients(q)}>
              <Ionicons name="refresh-outline" size={18} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={results}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            contentContainerStyle={{ padding: SPACING.md, paddingTop: 4, flexGrow: results.length ? 0 : 1 }}
            keyboardShouldPersistTaps="handled"
            refreshing={loading}
            onRefresh={() => loadClients(q)}
            ListEmptyComponent={
              <View style={styles.empty}>
                {loading ? (
                  <ActivityIndicator color={colors.primary} size="large" />
                ) : (
                  <Ionicons name="people-outline" size={42} color={colors.textMuted} />
                )}
                <Text style={[styles.emptyTitle, { color: colors.text }]}>
                  {loading ? 'Loading clients' : error ? 'Could not load clients' : q ? 'No matching clients' : 'No clients found'}
                </Text>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  {error || (q ? 'Try another name, phone number or client ID.' : 'No active clients are available for your account.')}
                </Text>
                {!loading && <TouchableOpacity onPress={() => loadClients(q)} style={[styles.retryBtn, { backgroundColor: colors.primary }]}><Text style={styles.retryText}>Retry</Text></TouchableOpacity>}
              </View>
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => {
                  onSelect(item);
                  setOpen(false);
                }}
                activeOpacity={0.75}
              >
                <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                  <Text style={styles.avatarText}>{(item.name || '?')[0].toUpperCase()}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 12 }} numberOfLines={1}>
                    {item.phone || 'No phone'} · {item.id}
                  </Text>
                  {item.union ? <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 2 }} numberOfLines={1}>{item.union}</Text> : null}
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderRadius: RADIUS.md, paddingHorizontal: 12, paddingVertical: 14, marginBottom: 14 },
  triggerText: { flex: 1, fontSize: 15 },
  modal: { flex: 1, paddingTop: 16 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.md, marginBottom: 12 },
  modalTitle: { fontSize: 19, fontWeight: '800' },
  modalSub: { fontSize: 11, marginTop: 2 },
  closeBtn: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  searchRow: { flexDirection: 'row', marginHorizontal: SPACING.md, borderRadius: RADIUS.md, borderWidth: 1, paddingHorizontal: 12, minHeight: 50, alignItems: 'center', gap: 8 },
  searchInput: { flex: 1, paddingVertical: 8, fontSize: 15 },
  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.md, paddingVertical: 10 },
  resultCount: { fontSize: 11, fontWeight: '700' },
  row: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: RADIUS.md, borderWidth: 1, marginBottom: 8, gap: 12 },
  avatar: { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  name: { fontSize: 15, fontWeight: '700' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30, minHeight: 260 },
  emptyTitle: { fontSize: 16, fontWeight: '800', marginTop: 12, textAlign: 'center' },
  emptyText: { fontSize: 12, lineHeight: 18, marginTop: 5, textAlign: 'center' },
  retryBtn: { marginTop: 14, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  retryText: { color: '#fff', fontWeight: '800' },
});