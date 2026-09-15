import { Image, Platform, Pressable, Text, View } from 'react-native';
import { Redirect, Tabs, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/store/auth';
import { useThemeStore } from '../../src/store/theme';
import { getRoleConfig } from '../../src/constants/roles';
import { API_BASE_URL } from '../../src/constants/config';

const CUPAD_LOGO = 'https://cupad.name.ng/uploads/CUPAD%20LOGO.png';

export default function TabsLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const colors = useThemeStore((s) => s.colors);
  const themeMode = useThemeStore((s) => s.mode);
  const toggleTheme = useThemeStore((s) => s.toggle);
  const roleCfg = getRoleConfig(user?.role);
  const accent = roleCfg.accent || colors.primary;

  if (!isLoading && !isAuthenticated) return <Redirect href="/(auth)/login" />;

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

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  const confirmLogout = () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      if (window.confirm('Are you sure you want to sign out?')) void handleLogout();
      return;
    }
    void handleLogout();
  };

  const tabIcon = (focused: boolean, active: string, inactive: string, color: string, size: number) => (
    <View style={focused ? { width: 42, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: `${accent}14` } : undefined}>
      <Ionicons name={focused ? active : inactive} size={focused ? size + 1 : size} color={color} />
    </View>
  );

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { backgroundColor: colors.card, borderTopWidth: 0, height: 72, paddingBottom: 10, paddingTop: 7, elevation: 12, shadowOpacity: colors.isDark ? 0.35 : 0.12, shadowRadius: 14, shadowOffset: { width: 0, height: -4 } },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '800', marginTop: 1 },
        tabBarItemStyle: { paddingVertical: 1 },
        headerStyle: { backgroundColor: colors.card, elevation: 0, shadowOpacity: 0, height: 62, borderBottomWidth: 1, borderBottomColor: colors.border },
        headerTintColor: colors.primary,
        headerTitleAlign: 'left',
        headerTitleStyle: { fontWeight: '700', fontSize: 17, color: colors.primary },
        headerTitle: () => null,
        headerLeft: () => (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 14, gap: 8 }}>
            <Image source={{ uri: CUPAD_LOGO }} style={{ width: 32, height: 32 }} resizeMode="contain" />
            <Text style={{ color: colors.primary, fontSize: 20, fontWeight: '800', letterSpacing: 0.2 }}>CUPAD</Text>
          </View>
        ),
        headerRight: () => (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginRight: 12 }}>
            <Pressable onPress={confirmLogout} accessibilityRole="button" accessibilityLabel="Sign out" style={{ width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.dangerBg || '#FEE2E2', marginRight: 4 }}>
              <Ionicons name="log-out-outline" size={19} color={colors.danger || '#DC2626'} />
            </Pressable>
            <Pressable onPress={() => toggleTheme()} accessibilityRole="button" accessibilityLabel={themeMode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'} style={{ width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.infoBg, marginRight: -2 }}>
              <Ionicons name={themeMode === 'dark' ? 'sunny' : 'moon'} size={19} color={colors.primary} />
            </Pressable>
            <Pressable onPress={() => router.push('/(tabs)/profile')} accessibilityRole="button" accessibilityLabel="Open profile" style={{ marginLeft: -2 }}>
              <View style={{ width: 38, height: 38, borderRadius: 19, borderWidth: 2, borderColor: colors.primary, backgroundColor: colors.infoBg, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                {profileUri ? <Image source={{ uri: profileUri }} style={{ width: '100%', height: '100%' }} /> : <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '800' }}>{initials}</Text>}
              </View>
            </Pressable>
          </View>
        ),
      }}
    >
      <Tabs.Screen name="index" options={{ title: `${roleCfg.shortLabel} Dashboard`, tabBarLabel: 'Home', tabBarIcon: ({ color, size, focused }) => tabIcon(focused, 'home', 'home-outline', color, size) }} />
      <Tabs.Screen name="search" options={{ title: 'Search Clients', tabBarLabel: 'Clients', tabBarIcon: ({ color, size, focused }) => tabIcon(focused, 'people', 'people-outline', color, size) }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarLabel: 'Profile', tabBarIcon: ({ color, size, focused }) => tabIcon(focused, 'person', 'person-outline', color, size) }} />
    </Tabs>
  );
}
