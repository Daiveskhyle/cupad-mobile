import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuthStore } from '../src/store/auth';
import { useThemeStore } from '../src/store/theme';

export default function Index() {
  const { isLoading, isAuthenticated } = useAuthStore();
  const colors = useThemeStore((s) => s.colors);
  const themeReady = useThemeStore((s) => s.isReady);

  if (isLoading || !themeReady) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(auth)/login" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
