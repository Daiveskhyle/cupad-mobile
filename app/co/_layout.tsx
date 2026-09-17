import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Stack, router, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/store/auth';
import { useThemeStore } from '../../src/store/theme';
import { API_BASE_URL } from '../../src/constants/config';

const CUPAD_LOGO = 'https://cupad.name.ng/uploads/CUPAD%20LOGO.png';

export default function CoLayout() {
  const colors = useThemeStore((s) => s.colors);
  const themeMode = useThemeStore((s) => s.mode);
  const toggleTheme = useThemeStore((s) => s.toggle);
  const user = useAuthStore((s) => s.user);
  const pathname = usePathname();

  const displayName = user?.full_name || user?.name || user?.username || 'User';
  const initials = displayName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'U';
  const profileUri = (() => {
    const value = String(user?.profile_pic || '').trim();
    if (!value || value.toLowerCase().includes('default_avatar')) return null;
    if (/^https?:\/\//i.test(value)) return value;
    const clean = value.replace(/^\.\//, '').replace(/^\//, '');
    const origin = API_BASE_URL.replace(/\/api\/v1\/?$/, '');
    return `${origin}/${clean}`;
  })();

  const navItems = [
    { label: 'Collect', icon: 'cash-outline' as const, activeIcon: 'cash' as const, route: '/co/combined' },
    { label: 'Savings', icon: 'wallet-outline' as const, activeIcon: 'wallet' as const, route: '/co/savings' },
    { label: 'Repay', icon: 'card-outline' as const, activeIcon: 'card' as const, route: '/co/loan-collection' },
    { label: 'Disburse', icon: 'arrow-up-circle-outline' as const, activeIcon: 'arrow-up-circle' as const, route: '/co/disbursement' },
    { label: 'More', icon: 'grid-outline' as const, activeIcon: 'grid' as const, route: '/co/union-groups' },
  ];

  const isActive = (route: string) => pathname === route || pathname.startsWith(`${route}/`);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.card },
          headerTintColor: colors.primary,
          headerShadowVisible: false,
          headerTitleAlign: 'left',
          headerTitle: () => null,
          contentStyle: { backgroundColor: colors.background, paddingBottom: 78 },
          headerLeft: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 0, gap: 8 }}>
              <Image source={{ uri: CUPAD_LOGO }} style={{ width: 32, height: 32 }} resizeMode="contain" />
              <Text style={{ color: colors.primary, fontSize: 20, fontWeight: '800', letterSpacing: 0.2 }}>CUPAD</Text>
            </View>
          ),
          headerRight: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginRight: 2 }}>
              <Pressable
                onPress={toggleTheme}
                accessibilityRole="button"
                accessibilityLabel={themeMode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                style={{ width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.infoBg }}
              >
                <Ionicons name={themeMode === 'dark' ? 'sunny' : 'moon'} size={19} color={colors.primary} />
              </Pressable>
              <Pressable onPress={() => router.push('/(tabs)/profile')} accessibilityRole="button" accessibilityLabel="Open profile">
                <View style={{ width: 38, height: 38, borderRadius: 19, borderWidth: 2, borderColor: colors.primary, backgroundColor: colors.infoBg, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {profileUri ? <Image source={{ uri: profileUri }} style={{ width: '100%', height: '100%' }} /> : <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '800' }}>{initials}</Text>}
                </View>
              </Pressable>
            </View>
          ),
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

      <View style={[styles.navbar, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        {navItems.map((item) => {
          const active = isActive(item.route);
          return (
            <Pressable
              key={item.route}
              onPress={() => router.replace(item.route as any)}
              accessibilityRole="button"
              accessibilityLabel={item.label}
              style={({ pressed }) => [styles.navItem, pressed && { opacity: 0.7 }]}
            >
              <View style={[styles.iconWrap, active && { backgroundColor: colors.infoBg }]}>
                <Ionicons
                  name={active ? item.activeIcon : item.icon}
                  size={21}
                  color={active ? colors.primary : colors.textSecondary}
                />
              </View>
              <Text style={[styles.navLabel, { color: active ? colors.primary : colors.textSecondary }, active && styles.navLabelActive]}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 70,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 4,
    paddingBottom: 4,
    elevation: 12,
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -3 },
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 62,
  },
  iconWrap: {
    width: 38,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navLabel: {
    fontSize: 10.5,
    fontWeight: '600',
    marginTop: 1,
  },
  navLabelActive: {
    fontWeight: '800',
  },
});
