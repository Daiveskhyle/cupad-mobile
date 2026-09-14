import { useState } from 'react';
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

  const search = async () => {
    if (!q.trim()) return;
    setLoading(true);
    try {
      const res = await api.getClients({ q: q.trim(), limit: 20 });
      setResults(res.data || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.trigger, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}
        onPress={() => setOpen(true)}
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

      <Modal visible={open} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.modal, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Find Client</Text>
            <TouchableOpacity onPress={() => setOpen(false)}>
              <Ionicons name="close" size={26} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={[styles.searchRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Name, phone or ID..."
              placeholderTextColor={colors.textMuted}
              value={q}
              onChangeText={setQ}
              onSubmitEditing={search}
              autoFocus
            />
            <TouchableOpacity
              style={[styles.searchBtn, { backgroundColor: colors.primary }]}
              onPress={search}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Ionicons name="search" size={18} color="#fff" />
              )}
            </TouchableOpacity>
          </View>

          <FlatList
            data={results}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: SPACING.md }}
            ListEmptyComponent={
              <Text style={{ textAlign: 'center', color: colors.textSecondary, marginTop: 40 }}>
                {loading ? 'Searching…' : 'Search for a client'}
              </Text>
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.row, { backgroundColor: colors.card }]}
                onPress={() => {
                  onSelect(item);
                  setOpen(false);
                }}
              >
                <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                  <Text style={styles.avatarText}>{(item.name || '?')[0].toUpperCase()}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                    {item.phone || 'No phone'} · {item.id}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: RADIUS.md,
    paddingHorizontal: 12,
    paddingVertical: 14,
    marginBottom: 14,
  },
  triggerText: { flex: 1, fontSize: 15 },
  modal: { flex: 1, paddingTop: 16 },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    marginBottom: 12,
  },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  searchRow: {
    flexDirection: 'row',
    marginHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    padding: 6,
    alignItems: 'center',
  },
  searchInput: { flex: 1, paddingHorizontal: 10, paddingVertical: 8, fontSize: 15 },
  searchBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: RADIUS.md,
    marginBottom: 8,
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { color: '#fff', fontWeight: '700' },
  name: { fontSize: 15, fontWeight: '600' },
});
