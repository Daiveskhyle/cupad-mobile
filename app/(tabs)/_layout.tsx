import { Redirect, Tabs, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, Text, View } from 'react-native';
import { useAuthStore } from '../../src/store/auth';
import { useThemeStore } from '../../src/store/theme';
import { getRoleConfig } from '../../src/constants/roles';
import { API_BASE_URL } from '../../src/constants/config';

export default function TabsLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const user = useAuthStore((s) => s.user);
  const colors = useThemeStore((s) => s.colors);
  const roleCfg = getRoleConfig(user?.role);
  const accent = roleCfg.accent || colors.primary;

  if (!isLoading && !isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  const displayName = user?.full_name || user?.name || user?.username || 'User';
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'U';

  const profileUri = (() => {
    const value = String(user?.profile_pic || '').trim();
    if (!value || value.toLowerCase().includes('default_avatar')) return null;
    if (/^https?:\/\//i.test(value)) return value;
    const clean = value.replace(/^\.\//, '').replace(/^\//, '');
    const origin = API_BASE_URL.replace(/\/api\/v1\/?$/, '');
    return `${origin}/${clean}`;
  })();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          height: 64,
          paddingBottom: 9,
          paddingTop: 7,
          elevation: 8,
          shadowOpacity: 0.08,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: -3 },
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
        },
        headerStyle: {
          backgroundColor: accent,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: '800',
          fontSize: 18,
        },
        headerRight: () => (
          <Pressable
            onPress={() => router.push('/(tabs)/profile')}
            style={{ flexDirection: 'row', alignItems: 'center', marginRight: 14, gap: 8 }}
            accessibilityRole="button"
            accessibilityLabel="Open profile"
          >
            <View style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              borderWidth: 2,
              borderColor: 'rgba(255,255,255,0.75)',
              backgroundColor: 'rgba(255,255,255,0.18)',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}>
              {profileUri ? (
                <Image
                  source={{ uri: profileUri }}
                  style={{ width: '100%', height: '100%' }}
                />
              ) : (
                <Text style={{ color: '#fff', fontSize: 13, fontWeight: '800' }}>{initials}</Text>
              )}
            </View>
            <View style={{ maxWidth: 120 }}>
              <Text numberOfLines={1} style={{ color: '#fff', fontSize: 12, fontWeight: '800' }}>{displayName}</Text>
              <Text numberOfLines={1} style={{ color: 'rgba(255,255,255,0.78)', fontSize: 10 }}>{roleCfg.shortLabel}</Text>
            </View>
          </Pressable>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: `${roleCfg.shortLabel} Dashboard`,
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={focused ? size + 1 : size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search Clients',
          tabBarLabel: 'Clients',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'people' : 'people-outline'}
              size={focused ? size + 1 : size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              size={focused ? size + 1 : size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
