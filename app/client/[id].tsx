import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { api } from '../../src/api/client';
import { COLORS, SPACING } from '../../src/constants/config';
import type { Portfolio, Loan, Transaction } from '../../src/types';

function formatMoney(amount: number | undefined | null) {
  if (amount == null) return '₦0';
  return (
    '₦' +
    Number(amount).toLocaleString('en-NG', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })
  );
}

export default function ClientPortfolioScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!id) return;
    try {
      setError(null);
      const [p, l, t] = await Promise.all([
        api.getPortfolio(id),
        api.getLoans(id).catch(() => []),
        api.getTransactions(id).catch(() => []),
      ]);
      setPortfolio(p);
      setLoans(l);
      setTransactions(t);
    } catch (e: any) {
      setError(
        e?.response?.data?.error || e?.message || 'Failed to load portfolio'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  if (error || !portfolio) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error || 'Client not found'}</Text>
      </View>
    );
  }

  const { client, savings, loans: loanSummary } = portfolio;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: SPACING.md, paddingBottom: 40 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            load();
          }}
          colors={[COLORS.accent]}
        />
      }
    >
      {/* Client Header */}
      <View style={styles.headerCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(client.name || '?').charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.clientName}>{client.name}</Text>
        <Text style={styles.clientId}>ID: {client.id}</Text>
        {client.phone && (
          <Text style={styles.clientMeta}>{client.phone}</Text>
        )}
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, { backgroundColor: '#ECFDF5' }]}>
          <Text style={styles.summaryLabel}>Savings</Text>
          <Text style={[styles.summaryValue, { color: '#059669' }]}>
            {formatMoney(savings.balance)}
          </Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: '#FEF3C7' }]}>
          <Text style={styles.summaryLabel}>Outstanding</Text>
          <Text style={[styles.summaryValue, { color: '#D97706' }]}>
            {formatMoney(loanSummary.outstanding)}
          </Text>
        </View>
      </View>

      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, { backgroundColor: '#EFF6FF' }]}>
          <Text style={styles.summaryLabel}>Total Deposits</Text>
          <Text style={[styles.summaryValue, { color: '#2563EB' }]}>
            {formatMoney(savings.total_deposits)}
          </Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: '#F3E8FF' }]}>
          <Text style={styles.summaryLabel}>Loans</Text>
          <Text style={[styles.summaryValue, { color: '#7C3AED' }]}>
            {loanSummary.count}
          </Text>
        </View>
      </View>

      {/* Loans List */}
      {loans.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Active Loans</Text>
          {loans.map((loan) => (
            <View key={String(loan.id)} style={styles.listCard}>
              <View style={styles.listRow}>
                <Text style={styles.listLabel}>Principal</Text>
                <Text style={styles.listValue}>
                  {formatMoney(loan.principal)}
                </Text>
              </View>
              <View style={styles.listRow}>
                <Text style={styles.listLabel}>Remaining</Text>
                <Text style={[styles.listValue, { color: COLORS.warning }]}>
                  {formatMoney(loan.remaining_balance)}
                </Text>
              </View>
              <View style={styles.listRow}>
                <Text style={styles.listLabel}>Status</Text>
                <Text style={styles.listValue}>{loan.status || '—'}</Text>
              </View>
              {loan.due_date && (
                <View style={styles.listRow}>
                  <Text style={styles.listLabel}>Due</Text>
                  <Text style={styles.listValue}>{loan.due_date}</Text>
                </View>
              )}
            </View>
          ))}
        </>
      )}

      {/* Recent Transactions */}
      {transactions.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          {transactions.slice(0, 15).map((tx, idx) => (
            <View key={`${tx.transaction_id}-${idx}`} style={styles.txCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.txType}>
                  {tx.source.toUpperCase()} • {tx.type}
                </Text>
                <Text style={styles.txDate}>{tx.date}</Text>
              </View>
              <Text
                style={[
                  styles.txAmount,
                  {
                    color:
                      tx.type?.toLowerCase().includes('deposit') ||
                      tx.type?.toLowerCase().includes('repayment')
                        ? COLORS.success
                        : COLORS.text,
                  },
                ]}
              >
                {formatMoney(tx.amount)}
              </Text>
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 16,
  },
  headerCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.white,
  },
  clientName: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.white,
  },
  clientId: {
    fontSize: 13,
    color: '#A0AEC0',
    marginTop: 4,
  },
  clientMeta: {
    fontSize: 14,
    color: '#CBD5E1',
    marginTop: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 12,
    padding: 14,
  },
  summaryLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 20,
    marginBottom: 10,
  },
  listCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  listRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  listLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  listValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  txCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  txType: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  txDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  txAmount: {
    fontSize: 15,
    fontWeight: '700',
  },
});
