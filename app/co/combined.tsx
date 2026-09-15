import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useThemeStore } from '../../src/store/theme';
import { SPACING, RADIUS } from '../../src/constants/config';
import { api } from '../../src/api/client';
import type { Client, Loan, Portfolio } from '../../src/types';
import { ClientPicker } from '../../src/components/ClientPicker';

const money = (value: number | undefined | null) => `₦${Number(value || 0).toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;
const today = () => new Date().toISOString().slice(0, 10);

export default function CombinedCollectionScreen() {
  const colors = useThemeStore((s) => s.colors);
  const [client, setClient] = useState<Client | null>(null);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [savings, setSavings] = useState('');
  const [loanAmount, setLoanAmount] = useState('');
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [withdrawalType, setWithdrawalType] = useState<'cash' | 'withdrawal' | 'return'>('cash');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(today());
  const [loadingClient, setLoadingClient] = useState(false);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const activeLoan = useMemo(() => loans.find((l) => l.status !== 'completed' && Number(l.remaining_balance) > 0) || loans[0], [loans]);
  const installmentAmount = activeLoan?.total_payable && activeLoan?.num_installments
    ? Number(activeLoan.total_payable) / Number(activeLoan.num_installments)
    : 0;
  const paidInstallments = activeLoan && installmentAmount > 0
    ? Math.max(0, Math.floor((Number(activeLoan.total_payable || 0) - Number(activeLoan.remaining_balance || 0)) / installmentAmount))
    : 0;

  const loadClient = useCallback(async (selected: Client) => {
    setLoadingClient(true);
    setPortfolio(null);
    setLoans([]);
    try {
      const [p, l] = await Promise.all([api.getPortfolio(selected.id), api.getLoans(selected.id)]);
      setPortfolio(p);
      setLoans(l);
    } catch (e: any) {
      Alert.alert('Unable to load client', e?.message || 'Please try again.');
    } finally {
      setLoadingClient(false);
    }
  }, []);

  useEffect(() => {
    if (client) loadClient(client);
  }, [client, loadClient]);

  useFocusEffect(useCallback(() => {
    setDate(today());
  }, []));

  const refresh = async () => {
    if (!client) return;
    setRefreshing(true);
    await loadClient(client);
    setRefreshing(false);
  };

  const setInstallments = (count: number) => {
    if (!installmentAmount) return;
    setLoanAmount(String(Math.round(installmentAmount * count)));
  };

  const submit = async () => {
    if (!client) return Alert.alert('Client required', 'Select a client before saving a collection.');
    const s = Number(savings.replace(/,/g, '')) || 0;
    const l = Number(loanAmount.replace(/,/g, '')) || 0;
    const w = Number(withdrawalAmount.replace(/,/g, '')) || 0;

    if (s <= 0 && l <= 0 && w <= 0) return Alert.alert('Amount required', 'Enter savings, loan repayment or withdrawal amount.');
    if (l > 0 && (withdrawalType === 'withdrawal' || withdrawalType === 'return')) {
      return Alert.alert('Invalid combination', 'Loan repayment cannot be processed with Deduct or Return.');
    }
    if (l > 0 && activeLoan && l > Number(activeLoan.remaining_balance)) {
      return Alert.alert('Amount too high', `Loan repayment cannot exceed ${money(activeLoan.remaining_balance)}.`);
    }
    if (withdrawalType !== 'cash' && w > 0 && w > Number(portfolio?.savings?.balance || 0)) {
      return Alert.alert('Insufficient savings', `Available savings: ${money(portfolio?.savings?.balance)}.`);
    }

    setSaving(true);
    try {
      const results: string[] = [];
      if (s > 0) {
        const res = await api.collectSavings({ client_id: client.id, amount: s, notes: notes.trim() });
        if (!res?.success) throw new Error(res?.error || 'Savings collection failed.');
        results.push(`Savings ${money(s)}`);
      }
      if (l > 0) {
        const res = await api.collectLoan({ client_id: client.id, amount: l, loan_id: activeLoan?.id, notes: notes.trim() });
        if (!res?.success) throw new Error(res?.error || 'Loan repayment failed.');
        results.push(`Loan ${money(l)}`);
      }
      if (w > 0) {
        if (withdrawalType === 'cash') {
          throw new Error('Cash withdrawal requires proof image and should be completed from Savings Withdrawal.');
        }
        const res = await api.withdrawSavings({ client_id: client.id, amount: w, reason: withdrawalType === 'return' ? 'Return (Payoff Loan)' : 'Withdrawal (Deduct)', notes: notes.trim() });
        if (!res?.success) throw new Error(res?.error || 'Savings adjustment failed.');
        results.push(`${withdrawalType === 'return' ? 'Return' : 'Deduct'} ${money(w)}`);
      }

      Alert.alert('Collection saved', `${client.name}\n\n${results.join('\n')}\n\nDate: ${date}`, [{ text: 'Done' }]);
      setSavings('');
      setLoanAmount('');
      setWithdrawalAmount('');
      setNotes('');
      await loadClient(client);
    } catch (e: any) {
      Alert.alert('Collection failed', e?.message || 'Unable to save collection.');
    } finally {
      setSaving(false);
    }
  };

  const field = (label: string, value: string, setValue: (v: string) => void, placeholder = '0') => (
    <View style={styles.fieldWrap}>
      <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>{label}</Text>
      <View style={[styles.amountBox, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
        <Text style={[styles.currency, { color: colors.textMuted }]}>₦</Text>
        <TextInput
          value={value}
          onChangeText={setValue}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          keyboardType="decimal-pad"
          style={[styles.amountInput, { color: colors.text }]}
        />
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} />}
      >
        <View style={[styles.topCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.topIcon}>
            <Ionicons name="cash-outline" size={24} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: colors.text }]}>Combined Collection</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Savings, loan repayment and adjustments</Text>
          </View>
          <View style={styles.liveDot} />
        </View>

        <View style={[styles.dateCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.dateIcon}><Ionicons name="calendar-outline" size={18} color={colors.primary} /></View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.miniLabel, { color: colors.textMuted }]}>COLLECTION DATE</Text>
            <TextInput value={date} onChangeText={setDate} style={[styles.dateInput, { color: colors.text }]} placeholder="YYYY-MM-DD" placeholderTextColor={colors.textMuted} />
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>1. Select Client</Text>
        <ClientPicker selected={client} onSelect={setClient} />

        {loadingClient && (
          <View style={[styles.loadingCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <ActivityIndicator color={colors.primary} />
            <Text style={{ color: colors.textSecondary }}>Loading client balances…</Text>
          </View>
        )}

        {client && !loadingClient && (
          <View style={[styles.clientCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.clientAvatar, { backgroundColor: colors.primary }]}><Text style={styles.avatarText}>{(client.name || '?')[0].toUpperCase()}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.clientName, { color: colors.text }]} numberOfLines={1}>{client.name}</Text>
              <Text style={[styles.clientMeta, { color: colors.textSecondary }]}>{client.id}{client.phone ? ` • ${client.phone}` : ''}</Text>
            </View>
            <Ionicons name="checkmark-circle" size={22} color="#10B981" />
          </View>
        )}

        {client && (
          <View style={styles.statsRow}>
            <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="wallet-outline" size={17} color="#10B981" />
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>SAVINGS</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>{money(portfolio?.savings?.balance)}</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="card-outline" size={17} color="#8B5CF6" />
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>LOAN BAL.</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>{money(activeLoan?.remaining_balance || portfolio?.loans?.outstanding)}</Text>
            </View>
          </View>
        )}

        {client && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>2. Collection Details</Text>
            <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {field('SAVINGS COLLECTION', savings, setSavings)}

              <View style={styles.divider} />
              <View style={styles.loanHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>LOAN REPAYMENT</Text>
                  <Text style={[styles.helper, { color: colors.textMuted }]}>
                    {activeLoan ? `Installment ${paidInstallments + 1}${activeLoan.num_installments ? ` of ${activeLoan.num_installments}` : ''} • ${money(installmentAmount)} suggested` : 'No active loan found'}
                  </Text>
                </View>
                <Ionicons name="card-outline" size={22} color="#8B5CF6" />
              </View>

              <View style={styles.quickRow}>
                {[1, 2, 3].map((n) => (
                  <Pressable key={n} onPress={() => setInstallments(n)} style={({ pressed }) => [styles.quickBtn, { backgroundColor: 'rgba(139,92,246,0.10)', borderColor: 'rgba(139,92,246,0.22)', opacity: pressed ? 0.7 : 1 }]}>
                    <Text style={styles.quickText}>{n}×</Text>
                    <Text style={[styles.quickSub, { color: colors.textSecondary }]}>{money(installmentAmount * n)}</Text>
                  </Pressable>
                ))}
              </View>
              {field('PAYMENT AMOUNT', loanAmount, setLoanAmount)}

              <View style={styles.divider} />
              <View style={styles.loanHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>SAVINGS ADJUSTMENT</Text>
                  <Text style={[styles.helper, { color: colors.textMuted }]}>Choose how the amount should be applied.</Text>
                </View>
                <Ionicons name="swap-vertical-outline" size={22} color="#F59E0B" />
              </View>
              <View style={[styles.segment, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
                {([
                  ['cash', 'Cash'],
                  ['withdrawal', 'Deduct'],
                  ['return', 'Return'],
                ] as const).map(([key, label]) => (
                  <Pressable key={key} onPress={() => setWithdrawalType(key)} style={[styles.segmentItem, withdrawalType === key && { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.segmentText, { color: withdrawalType === key ? colors.text : colors.textMuted }]}>{label}</Text>
                  </Pressable>
                ))}
              </View>
              {withdrawalType === 'cash' && <Text style={[styles.notice, { color: colors.textMuted }]}><Ionicons name="information-circle-outline" size={14} /> Cash withdrawal proof is handled in Savings Withdrawal.</Text>}
              {field(withdrawalType === 'cash' ? 'CASH AMOUNT' : withdrawalType === 'return' ? 'RETURN AMOUNT' : 'DEDUCT AMOUNT', withdrawalAmount, setWithdrawalAmount)}

              <View style={styles.divider} />
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>NOTES</Text>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                multiline
                placeholder="Optional collection note…"
                placeholderTextColor={colors.textMuted}
                style={[styles.notes, { color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}
              />
            </View>

            <View style={[styles.totalCard, { backgroundColor: colors.primary }]}>
              <View>
                <Text style={styles.totalLabel}>TOTAL COLLECTION</Text>
                <Text style={styles.totalValue}>{money((Number(savings.replace(/,/g, '')) || 0) + (Number(loanAmount.replace(/,/g, '')) || 0))}</Text>
              </View>
              <Ionicons name="receipt-outline" size={30} color="rgba(255,255,255,0.85)" />
            </View>

            <Pressable disabled={saving} onPress={submit} style={({ pressed }) => [styles.submit, { backgroundColor: '#10B981', opacity: saving ? 0.65 : pressed ? 0.82 : 1 }]}>
              {saving ? <ActivityIndicator color="#fff" /> : <><Ionicons name="checkmark-circle-outline" size={21} color="#fff" /><Text style={styles.submitText}>SAVE COLLECTION</Text></>}
            </Pressable>
            <Text style={[styles.footerHint, { color: colors.textMuted }]}>Review the amounts before saving. Collections are recorded under the signed-in CO.</Text>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: { padding: SPACING.md, paddingBottom: 48 },
  topCard: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: RADIUS.lg, padding: 14, marginBottom: 10 },
  topIcon: { width: 46, height: 46, borderRadius: 14, backgroundColor: '#10B981', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  title: { fontSize: 18, fontWeight: '800' },
  subtitle: { fontSize: 12, marginTop: 3 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981' },
  dateCard: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: RADIUS.md, padding: 10, marginBottom: 18 },
  dateIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: 'rgba(59,130,246,0.10)', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  miniLabel: { fontSize: 9, fontWeight: '800', letterSpacing: 0.7 },
  dateInput: { fontSize: 14, fontWeight: '700', padding: 0, marginTop: 2 },
  sectionTitle: { fontSize: 14, fontWeight: '800', marginBottom: 9, marginTop: 2 },
  loadingCard: { borderWidth: 1, borderRadius: RADIUS.md, padding: 18, alignItems: 'center', gap: 8, marginBottom: 12 },
  clientCard: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: RADIUS.md, padding: 12, marginBottom: 10 },
  clientAvatar: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', marginRight: 11 },
  avatarText: { color: '#fff', fontSize: 17, fontWeight: '800' },
  clientName: { fontSize: 15, fontWeight: '800' },
  clientMeta: { fontSize: 11, marginTop: 3 },
  statsRow: { flexDirection: 'row', gap: 9, marginBottom: 18 },
  statBox: { flex: 1, borderWidth: 1, borderRadius: RADIUS.md, padding: 11 },
  statLabel: { fontSize: 9, fontWeight: '800', marginTop: 6 },
  statValue: { fontSize: 15, fontWeight: '800', marginTop: 2 },
  formCard: { borderWidth: 1, borderRadius: RADIUS.lg, padding: 14 },
  fieldWrap: { marginBottom: 12 },
  fieldLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5, marginBottom: 7 },
  amountBox: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, minHeight: 52, paddingHorizontal: 13 },
  currency: { fontSize: 18, fontWeight: '800', marginRight: 7 },
  amountInput: { flex: 1, fontSize: 18, fontWeight: '700', paddingVertical: 10 },
  divider: { height: 1, backgroundColor: 'rgba(127,127,127,0.16)', marginVertical: 5, marginBottom: 15 },
  loanHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  helper: { fontSize: 11, marginTop: 2 },
  quickRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  quickBtn: { flex: 1, borderWidth: 1, borderRadius: 11, paddingVertical: 9, alignItems: 'center' },
  quickText: { color: '#7C3AED', fontSize: 15, fontWeight: '800' },
  quickSub: { fontSize: 9, marginTop: 2 },
  segment: { flexDirection: 'row', borderWidth: 1, borderRadius: 11, padding: 3, marginBottom: 9 },
  segmentItem: { flex: 1, paddingVertical: 9, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: 'transparent' },
  segmentText: { fontSize: 12, fontWeight: '700' },
  notice: { fontSize: 10, marginBottom: 8, lineHeight: 15 },
  notes: { minHeight: 74, borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, textAlignVertical: 'top', fontSize: 14 },
  totalCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderRadius: RADIUS.lg, padding: 16, marginTop: 12 },
  totalLabel: { color: 'rgba(255,255,255,0.78)', fontSize: 9, fontWeight: '800', letterSpacing: 0.8 },
  totalValue: { color: '#fff', fontSize: 25, fontWeight: '900', marginTop: 3 },
  submit: { minHeight: 54, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, marginTop: 10 },
  submitText: { color: '#fff', fontSize: 14, fontWeight: '900', letterSpacing: 0.5 },
  footerHint: { textAlign: 'center', fontSize: 10, lineHeight: 15, marginTop: 10, paddingHorizontal: 15 },
});