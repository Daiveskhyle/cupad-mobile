import { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useThemeStore } from '../../src/store/theme';
import { api } from '../../src/api/client';
import { SPACING, RADIUS } from '../../src/constants/config';

const typeColor: Record<string, string> = {
  Saving: '#22C55E',
  Withdrawal: '#EF4444',
  Payment: '#8B5CF6',
  Disbursement: '#3B82F6',
  Registration: '#6366F1',
};

export default function CoHistoryScreen() {
  const colors = useThemeStore((s) => s.colors);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const data = await api.getActivities(40);
      setItems(data);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={items}
        keyExtractor={(i, idx) => String(i.transaction_id || idx)}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />
        }
        contentContainerStyle={{ padding: SPACING.md, flexGrow: 1 }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 60 }}>
            <Ionicons name="time-outline" size={48} color={colors.textMuted} />
            <Text style={{ color: colors.textSecondary, marginTop: 12, textAlign: 'center' }}>
              No activity yet.{'\n'}Collect savings or loans to see history here.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <View style={[styles.dot, { backgroundColor: typeColor[item.type] || colors.primary }]} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.client, { color: colors.text }]}>{item.client_name || '—'}</Text>
              <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                {item.type} · {item.date ? String(item.date).slice(0, 16) : ''}
              </Text>
            </View>
            <Text style={{ fontWeight: '700', color: typeColor[item.type] || colors.text }}>
              ₦{Number(item.amount || 0).toLocaleString()}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: RADIUS.md,
    marginBottom: 10,
    gap: 12,
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
  client: { fontSize: 15, fontWeight: '600' },
});
