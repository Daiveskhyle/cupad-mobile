import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../src/store/theme';
import { SPACING, RADIUS } from '../../src/constants/config';

const SAMPLE = [
  { id: '1', type: 'Saving', client: 'Sample Client', amount: 5000, date: 'Today' },
  { id: '2', type: 'Payment', client: 'Sample Client', amount: 12000, date: 'Yesterday' },
];

const typeColor: Record<string, string> = {
  Saving: '#22C55E',
  Withdrawal: '#EF4444',
  Payment: '#8B5CF6',
  Disbursement: '#3B82F6',
  Registration: '#6366F1',
};

export default function CoHistoryScreen() {
  const colors = useThemeStore((s) => s.colors);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.info, { backgroundColor: colors.infoBg }]}>
        <Ionicons name="information-circle" size={18} color={colors.primary} />
        <Text style={{ flex: 1, color: colors.primaryDark, fontSize: 13, marginLeft: 8 }}>
          Your recent field activity will appear here once the history API is connected.
        </Text>
      </View>

      <FlatList
        data={SAMPLE}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: SPACING.md }}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', color: colors.textSecondary, marginTop: 40 }}>
            No activity yet
          </Text>
        }
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <View style={[styles.dot, { backgroundColor: typeColor[item.type] || colors.primary }]} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.client, { color: colors.text }]}>{item.client}</Text>
              <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                {item.type} · {item.date}
              </Text>
            </View>
            <Text style={{ fontWeight: '700', color: typeColor[item.type] || colors.text }}>
              ₦{item.amount.toLocaleString()}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: SPACING.md,
    padding: 12,
    borderRadius: RADIUS.md,
  },
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
