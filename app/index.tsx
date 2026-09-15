import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuthStore } from '../src/store/auth';
import { useThemeStore } from '../src/store/theme';

export default function Index() {
  const { isLoading, isAuthenticated } = useAuthStore();
  const colors = useThemeStore((s) => s.colors);
  const themeReady = useThemeStore((s) => s.isReady);
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.82)).current;
  const logoY = useRef(new Animated.Value(18)).current;
  const contentY = useRef(new Animated.Value(18)).current;
  const progress = useRef(new Animated.Value(0)).current;
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (isLoading || !themeReady) return;

    const animation = Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 650, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, speed: 12, bounciness: 7, useNativeDriver: true }),
      Animated.timing(logoY, { toValue: 0, duration: 650, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(contentY, { toValue: 0, duration: 750, delay: 220, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(progress, { toValue: 1, duration: 1700, delay: 250, easing: Easing.inOut(Easing.cubic), useNativeDriver: false }),
    ]);

    animation.start();
    const timer = setTimeout(() => setFinished(true), 2350);
    return () => {
      animation.stop();
      clearTimeout(timer);
    };
  }, [isLoading, themeReady]);

  if (isLoading || !themeReady || !finished) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.glow, { backgroundColor: colors.glowBlue }]} />
        <View style={[styles.glowBottom, { backgroundColor: colors.glowPurple }]} />
        <Animated.View style={[styles.content, { opacity, transform: [{ translateY: logoY }] }]}>
          <Animated.View style={[styles.logoCard, { backgroundColor: colors.card, borderColor: colors.primary + '25', transform: [{ scale }] }]}>
            <Image source={require('../assets/cupad-logo.png')} style={styles.logo} resizeMode="contain" accessibilityLabel="CUPAD logo" />
          </Animated.View>
          <Animated.View style={{ opacity, transform: [{ translateY: contentY }] }}>
            <Text style={[styles.brand, { color: colors.text }]}>CUPAD</Text>
            <Text style={[styles.title, { color: colors.primary }]}>STAFF PORTAL</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Empowering people. Building stronger communities.</Text>
            <View style={styles.loaderTrack}>
              <Animated.View style={[styles.loader, { backgroundColor: colors.primary, width: progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }]} />
            </View>
            <Text style={[styles.status, { color: colors.textMuted }]}>Preparing your workspace</Text>
          </Animated.View>
        </Animated.View>
        <Text style={[styles.motto, { color: colors.primary }]}>SUCCESS IS OURS</Text>
      </View>
    );
  }

  if (isAuthenticated) return <Redirect href="/(tabs)" />;
  return <Redirect href="/(auth)/login" />;
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  content: { alignItems: 'center', width: '88%', maxWidth: 420 },
  glow: { position: 'absolute', top: -100, left: -70, width: 260, height: 260, borderRadius: 130, opacity: 0.55 },
  glowBottom: { position: 'absolute', bottom: -100, right: -70, width: 280, height: 280, borderRadius: 140, opacity: 0.4 },
  logoCard: { width: 128, height: 128, borderRadius: 36, borderWidth: 1, padding: 12, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.1, shadowRadius: 24, elevation: 7 },
  logo: { width: 104, height: 104 },
  brand: { marginTop: 24, textAlign: 'center', fontSize: 31, fontWeight: '900', letterSpacing: 2.5 },
  title: { marginTop: 3, textAlign: 'center', fontSize: 12, fontWeight: '800', letterSpacing: 3 },
  subtitle: { marginTop: 15, textAlign: 'center', fontSize: 13, lineHeight: 20, maxWidth: 320 },
  loaderTrack: { height: 4, width: 180, borderRadius: 4, marginTop: 28, overflow: 'hidden', backgroundColor: '#E5E7EB' },
  loader: { height: '100%', borderRadius: 4 },
  status: { marginTop: 10, fontSize: 10, textAlign: 'center' },
  motto: { position: 'absolute', bottom: 34, fontSize: 10, fontWeight: '800', letterSpacing: 2 },
});
