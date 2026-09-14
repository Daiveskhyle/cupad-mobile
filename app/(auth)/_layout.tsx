import { Stack } from 'expo-router';
import { COLORS } from '../../src/constants/config';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.primary },
      }}
    />
  );
}
