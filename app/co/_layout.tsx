import { Stack } from 'expo-router';
import { useThemeStore } from '../../src/store/theme';

export default function CoLayout() {
  const colors = useThemeStore((s) => s.colors);
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.card },
        headerTintColor: colors.primary,
        headerTitleStyle: { fontWeight: '700', color: colors.text },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="savings" options={{ title: 'Savings Collection' }} />
      <Stack.Screen name="withdrawal" options={{ title: 'Savings Withdrawal' }} />
      <Stack.Screen name="loan-collection" options={{ title: 'Loan Repayment' }} />
      <Stack.Screen name="disbursement" options={{ title: 'Loan Disbursement' }} />
      <Stack.Screen name="combined" options={{ title: 'Combined Collection' }} />
      <Stack.Screen name="register" options={{ title: 'Register Client' }} />
      <Stack.Screen name="union-groups" options={{ title: 'Unions & Groups' }} />
      <Stack.Screen name="history" options={{ title: 'My History' }} />
      <Stack.Screen name="analytics" options={{ title: 'Analytics' }} />
      <Stack.Screen name="client-summary" options={{ title: 'Client Financial Summary' }} />
      <Stack.Screen name="close-account" options={{ title: 'Close Client Account' }} />
      <Stack.Screen name="passkey" options={{ title: 'Passkey Setup' }} />
    </Stack>
  );
}
