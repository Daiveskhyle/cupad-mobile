import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ClientPicker } from '../../src/components/ClientPicker';
import { useThemeStore } from '../../src/store/theme';
import { SPACING, RADIUS } from '../../src/constants/config';
import type { Client } from '../../src/types';

export default function CombinedCollectionScreen() {
  const colors = useThemeStore((s) => s.colors);
  const [client, setClient] = useState<Client | null>(null);
  const [savings, setSavings] = useState('');
  const [loan, setLoan] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!client) return Alert.alert('Required', 'Please select a client');
    const s = parseFloat(savings.replace(/,/g, '')) || 0;
    const l = parseFloat(loan.replace(/,/g, '')) || 0;
    if (s <= 0 && l <= 0) return Alert.alert('Required', 'Enter savings and/or loan amount');
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 600));
      Alert.alert(
        'Combined collection (local)',
        `Client: ${client.name}\nSavings: ₦${s.toLocaleString()}\nLoan: ₦${l.toLocaleString()}\nTotal: ₦${(s + l).toLocaleString()}\n\nServer sync pending write API.`,
        [{ text: 'OK', onPress: () => { setSavings(''); setLoan(''); setNotes(''); } }]
      );
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={[styles.banner, { backgroundColor: 'rgba(245,158,11,0.12)' }]}>
          <Ionicons name="layers" size={22} color="#F59E0B" />
          <Text style={[styles.bannerText, { color: '#D97706' }]}>
            Collect savings + loan payment together
          </Text>
        </View>

        <Text style={[styles.label, { color: colors.textSecondary }]}>Client</Text>
        <ClientPicker selected={client} onSelect={setClient} />

        <Text style={[styles.label, { color: colors.textSecondary }]}>Savings amount (₦)</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
          placeholder="0.00"
          placeholderTextColor={colors.textMuted}
          keyboardType="decimal-pad"
          value={savings}
          onChangeText={setSavings}
        />

        <Text style={[styles.label, { color: colors.textSecondary }]}>Loan payment (₦)</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
          placeholder="0.00"
          placeholderTextColor={colors.textMuted}
          keyboardType="decimal-pad"
          value={loan}
          onChangeText={setLoan}
        />

        <Text style={[styles.label, { color: colors.textSecondary }]}>Notes</Text>
        <TextInput
          style={[styles.input, styles.notes, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
          placeholder="Optional..."
          placeholderTextColor={colors.textMuted}
          value={notes}
          onChangeText={setNotes}
          multiline
        />

        <TouchableOpacity onPress={submit} disabled={loading} activeOpacity={0.85}>
          <LinearGradient colors={['#F59E0B', '#D97706']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.btn}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Submit Combined Collection</Text>}
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: { padding: SPACING.md, paddingBottom: 40 },
  banner: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: RADIUS.md, marginBottom: 20 },
  bannerText: { flex: 1, fontSize: 13, fontWeight: '600' },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: RADIUS.md, paddingHorizontal: 14, paddingVertical: 14, fontSize: 16, marginBottom: 16 },
  notes: { minHeight: 80, textAlignVertical: 'top' },
  btn: { paddingVertical: 16, borderRadius: RADIUS.md, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
