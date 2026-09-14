import { Stack } from 'expo-router';
import { useThemeStore } from '../../src/store/theme';

export default function CoLayout() {
  const colors = useThemeStore((s) => s.colors);
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '700' },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="savings" options={{ title: 'Savings Collection' }} />
      <Stack.Screen name="withdrawal" options={{ title: 'Savings Withdrawal' }} />
      <Stack.Screen name="loan-collection" options={{ title: 'Loan Collection' }} />
      <Stack.Screen name="disbursement" options={{ title: 'Loan Disbursement' }} />
      <Stack.Screen name="combined" options={{ title: 'Combined Collection' }} />
      <Stack.Screen name="register" options={{ title: 'Register Client' }} />
      <Stack.Screen name="history" options={{ title: 'My History' }} />
    </Stack>
  );
}
