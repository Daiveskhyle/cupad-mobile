import { useCallback, useEffect, useState } from 'react';
import { Alert, ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../src/store/theme';
import { useAuthStore } from '../../src/store/auth';
import { API_BASE_URL, RADIUS, SPACING } from '../../src/constants/config';

export default function UnionGroupsScreen() {
  const colors = useThemeStore((s) => s.colors);
  const token = useAuthStore((s) => s.token);
  const [groups, setGroups] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadGroups = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/co/union-groups`, {
        headers: { Authorization: `Bearer ${token || ''}`, Accept: 'application/json' },
      });
      const data = await response.json();
      if (!response.ok || data?.success === false) throw new Error(data?.error || 'Unable to load unions');
      setGroups(Array.isArray(data?.groups) ? data.groups : Array.isArray(data?.data) ? data.data : []);
    } catch (error: any) {
      Alert.alert('Unable to load', error?.message || 'Please check your connection.');
    } finally { setLoading(false); setRefreshing(false); }
  }, [token]);

  useEffect(() => { loadGroups(); }, [loadGroups]);

  const createGroup = async () => {
    const cleanName = name.trim();
    if (!cleanName) return Alert.alert('Required', 'Enter a union/group name.');
    setSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/co/union-groups`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token || ''}`, 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ name: cleanName, description: description.trim() }),
      });
      const data = await response.json();
      if (!response.ok || data?.success === false) throw new Error(data?.error || 'Unable to create group');
      setName(''); setDescription('');
      Alert.alert('Success', data?.message || 'Union/group created.');
      await loadGroups();
    } catch (error: any) { Alert.alert('Error', error?.message || 'Unable to create group.'); }
    finally { setSaving(false); }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadGroups(); }} tintColor={colors.primary} />}>
      <View style={[styles.hero, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.icon, { backgroundColor: colors.infoBg }]}><Ionicons name="git-network" size={26} color={colors.primary} /></View>
        <View style={{ flex: 1 }}><Text style={[styles.title, { color: colors.text }]}>My Unions & Groups</Text><Text style={[styles.subtitle, { color: colors.textSecondary }]}>Manage groups assigned to your branch and clients.</Text></View>
      </View>

      <View style={[styles.form, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Create Union / Group</Text>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Group name</Text>
        <TextInput value={name} onChangeText={setName} placeholder="Enter group name" placeholderTextColor={colors.textMuted} style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]} />
        <Text style={[styles.label, { color: colors.textSecondary }]}>Description</Text>
        <TextInput value={description} onChangeText={setDescription} placeholder="Optional description" placeholderTextColor={colors.textMuted} multiline style={[styles.input, styles.notes, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]} />
        <TouchableOpacity disabled={saving} onPress={createGroup} style={[styles.button, { backgroundColor: colors.primary }]} activeOpacity={0.8}>
          {saving ? <ActivityIndicator color="#fff" /> : <><Ionicons name="add-circle-outline" size={19} color="#fff" /><Text style={styles.buttonText}>Create Group</Text></>}
        </TouchableOpacity>
      </View>

      <Text style={[styles.listTitle, { color: colors.text }]}>Assigned Groups ({groups.length})</Text>
      {loading ? <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 30 }} /> : groups.length === 0 ? (
        <View style={[styles.empty, { backgroundColor: colors.card, borderColor: colors.border }]}><Ionicons name="git-network-outline" size={32} color={colors.textMuted} /><Text style={[styles.emptyTitle, { color: colors.text }]}>No groups found</Text><Text style={[styles.emptyText, { color: colors.textSecondary }]}>Create a group above or ask management to assign one.</Text></View>
      ) : groups.map((group, index) => (
        <View key={String(group.id || group.uuid || group.name || index)} style={[styles.group, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.groupIcon, { backgroundColor: colors.infoBg }]}><Ionicons name="people-outline" size={20} color={colors.primary} /></View>
          <View style={{ flex: 1 }}><Text style={[styles.groupName, { color: colors.text }]}>{group.name || group.union_name || 'Unnamed group'}</Text>{group.description ? <Text style={[styles.groupDescription, { color: colors.textSecondary }]}>{group.description}</Text> : null}<Text style={[styles.groupMeta, { color: colors.textMuted }]}>{group.clients ?? group.client_count ?? 0} clients</Text></View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: SPACING.md, paddingBottom: 48 },
  hero: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: RADIUS.lg, borderWidth: 1, marginBottom: 16 },
  icon: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: '800' }, subtitle: { fontSize: 12, lineHeight: 18, marginTop: 3 },
  form: { padding: 16, borderRadius: RADIUS.lg, borderWidth: 1, marginBottom: 22 },
  sectionTitle: { fontSize: 16, fontWeight: '800', marginBottom: 14 }, label: { fontSize: 12, fontWeight: '600', marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: RADIUS.md, paddingHorizontal: 13, paddingVertical: 13, fontSize: 15, marginBottom: 14 },
  notes: { minHeight: 74, textAlignVertical: 'top' },
  button: { minHeight: 48, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 }, buttonText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  listTitle: { fontSize: 16, fontWeight: '800', marginBottom: 10 },
  group: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: RADIUS.md, borderWidth: 1, marginBottom: 10 }, groupIcon: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', marginRight: 12 }, groupName: { fontSize: 15, fontWeight: '800' }, groupDescription: { fontSize: 12, marginTop: 3 }, groupMeta: { fontSize: 11, marginTop: 4 },
  empty: { padding: 28, borderRadius: RADIUS.lg, borderWidth: 1, alignItems: 'center' }, emptyTitle: { fontSize: 15, fontWeight: '800', marginTop: 10 }, emptyText: { fontSize: 12, textAlign: 'center', marginTop: 5, lineHeight: 18 },
});
