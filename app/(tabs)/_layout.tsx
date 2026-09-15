import { Redirect, Tabs, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, Text, View } from 'react-native';
import { useAuthStore } from '../../src/store/auth';
import { useThemeStore } from '../../src/store/theme';
import { getRoleConfig } from '../../src/constants/roles';
import { API_BASE_URL } from '../../src/constants/config';

const CUPAD_LOGO = 'https://cupad.name.ng/uploads/CUPAD%20LOGO.png';
const NAV_BLUE = '#0B2A5B';

export default function TabsLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const user = useAuthStore((s) => s.user);
  const colors = useThemeStore((s) => s.colors);
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
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopWidth: 0,
          height: 72,
          paddingBottom: 10,
          paddingTop: 7,
          elevation: 12,
          shadowOpacity: 0.12,
          shadowRadius: 14,
          shadowOffset: { width: 0, height: -4 },
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '800', marginTop: 1 },
        tabBarItemStyle: { paddingVertical: 1 },
        headerStyle: { backgroundColor: NAV_BLUE, elevation: 0, shadowOpacity: 0, height: 62 },
        headerTintColor: '#fff',
        headerTitleAlign: 'left',
        headerTitleStyle: { fontWeight: '800', fontSize: 17 },
        headerTitle: () => null,
        headerLeft: () => (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 14, gap: 9 }}>
            <View style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              <Image source={{ uri: CUPAD_LOGO }} style={{ width: 34, height: 34 }} resizeMode="contain" />
            </View>
            <Text style={{ color: '#fff', fontSize: 19, fontWeight: '900', letterSpacing: 0.5 }}>CUPAD</Text>
          </View>
        ),
        headerRight: () => (
          <Pressable onPress={() => router.push('/(tabs)/profile')} style={{ flexDirection: 'row', alignItems: 'center', marginRight: 12, gap: 7 }} accessibilityRole="button" accessibilityLabel="Open profile">
            <View style={{ width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: 'rgba(255,255,255,0.78)', backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              {profileUri ? <Image source={{ uri: profileUri }} style={{ width: '100%', height: '100%' }} /> : <Text style={{ color: '#fff', fontSize: 13, fontWeight: '800' }}>{initials}</Text>}
            </View>
          </Pressable>
        ),
      }}
    >
      <Tabs.Screen name="index" options={{ title: `${roleCfg.shortLabel} Dashboard`, tabBarLabel: 'Home', tabBarIcon: ({ color, size, focused }) => tabIcon(focused, 'home', 'home-outline', color, size) }} />
      <Tabs.Screen name="search" options={{ title: 'Search Clients', tabBarLabel: 'Clients', tabBarIcon: ({ color, size, focused }) => tabIcon(focused, 'people', 'people-outline', color, size) }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarLabel: 'Profile', tabBarIcon: ({ color, size, focused }) => tabIcon(focused, 'person', 'person-outline', color, size) }} />
    </Tabs>
  );
}
