import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/store/auth';
import { useThemeStore } from '../../src/store/theme';
import { SPACING, RADIUS } from '../../src/constants/config';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const { login, isLoading, error, clearError } = useAuthStore();
  const { colors, mode, toggle } = useThemeStore();

  const handleLogin = async () => {
    if (!username.trim() || !password) {
      Alert.alert('Error', 'Please enter username and password');
      return;
    }
    clearError();
    const success = await login(username.trim(), password);
    if (success) {
      router.replace('/(tabs)');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.glowTop, { backgroundColor: colors.glowBlue }]} />
      <View style={[styles.glowBottom, { backgroundColor: colors.glowPurple }]} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topBar}>
            <TouchableOpacity
              style={[styles.iconBtn, { backgroundColor: colors.card }]}
              onPress={() => toggle()}
            >
              <Ionicons
                name={mode === 'dark' ? 'sunny-outline' : 'moon-outline'}
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
            <View style={[styles.langBtn, { backgroundColor: colors.card }]}>
              <Ionicons name="globe-outline" size={16} color={colors.textSecondary} />
              <Text style={[styles.langText, { color: colors.textSecondary }]}>English</Text>
            </View>
          </View>

          <View style={styles.logoArea}>
            <View style={[styles.logoCircle, { backgroundColor: mode === 'dark' ? 'rgba(168,85,247,0.15)' : 'rgba(168,85,247,0.08)' }]}>
              <Ionicons name="globe-outline" size={48} color={colors.secondary} />
              <View style={styles.logoPerson}>
                <Ionicons name="person" size={22} color={colors.primary} />
              </View>
            </View>
            <Text style={[styles.logoTitle, { color: colors.secondary }]}>CUPAD</Text>
            <Text style={[styles.logoTag, { color: colors.primary }]}>SUCCESS IS OURS</Text>
          </View>

          <Text style={[styles.heading, { color: colors.primary }]}>Staff Login</Text>
          <Text style={[styles.subheading, { color: colors.textSecondary }]}>
            Sign in to continue to your dashboard
          </Text>

          <View style={[styles.card, { backgroundColor: colors.card }]}>
            {error ? (
              <View style={[styles.errorBox, { backgroundColor: colors.errorBg }]}>
                <Ionicons name="alert-circle" size={18} color={colors.error} />
                <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
              </View>
            ) : null}

            <View style={[styles.inputWrap, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
              <Ionicons name="person-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                value={username}
                onChangeText={setUsername}
                placeholder="Username"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
              <TouchableOpacity style={styles.fingerprint}>
                <Ionicons name="finger-print" size={22} color={colors.primary} />
              </TouchableOpacity>
            </View>

            <View style={[styles.inputWrap, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                placeholderTextColor={colors.textMuted}
                secureTextEntry={!showPassword}
                editable={!isLoading}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eye}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={colors.textMuted}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.rowBetween}>
              <TouchableOpacity
                style={styles.rememberRow}
                onPress={() => setRememberMe(!rememberMe)}
              >
                <View
                  style={[
                    styles.checkbox,
                    { borderColor: colors.border },
                    rememberMe && { backgroundColor: colors.primary, borderColor: colors.primary },
                  ]}
                >
                  {rememberMe && <Ionicons name="checkmark" size={12} color="#fff" />}
                </View>
                <Text style={[styles.rememberText, { color: colors.textSecondary }]}>Remember Me</Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text style={[styles.forgotText, { color: colors.primary }]}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleLogin}
              disabled={isLoading}
              style={styles.loginBtnWrap}
            >
              <LinearGradient
                colors={[colors.gradientStart, colors.gradientEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.loginBtn}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.loginBtnText}>Login</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <Text style={[styles.footer, { color: colors.textMuted }]}>
            © 2026 CUPAD System. All rights reserved.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  glowTop: {
    position: 'absolute',
    top: -80,
    left: width * 0.2,
    width: 220,
    height: 220,
    borderRadius: 110,
  },
  glowBottom: {
    position: 'absolute',
    bottom: 40,
    right: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: Platform.OS === 'ios' ? 56 : 40,
    paddingBottom: 40,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  langBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  langText: { fontSize: 13, fontWeight: '500' },
  logoArea: { alignItems: 'center', marginBottom: 28 },
  logoCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    position: 'relative',
  },
  logoPerson: { position: 'absolute', bottom: 14, right: 18 },
  logoTitle: { fontSize: 22, fontWeight: '800', letterSpacing: 1 },
  logoTag: { fontSize: 10, fontWeight: '600', letterSpacing: 1.5, marginTop: 2 },
  heading: { fontSize: 28, fontWeight: '800', textAlign: 'center', marginBottom: 6 },
  subheading: { fontSize: 14, textAlign: 'center', marginBottom: 28 },
  card: {
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 6,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: RADIUS.sm,
    marginBottom: 16,
  },
  errorText: { flex: 1, fontSize: 13 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: RADIUS.md,
    marginBottom: 14,
    paddingHorizontal: 12,
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, paddingVertical: 14, fontSize: 15 },
  fingerprint: { padding: 6 },
  eye: { padding: 6 },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 4,
  },
  rememberRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rememberText: { fontSize: 13 },
  forgotText: { fontSize: 13, fontWeight: '600' },
  loginBtnWrap: { borderRadius: RADIUS.md, overflow: 'hidden' },
  loginBtn: { paddingVertical: 16, alignItems: 'center', borderRadius: RADIUS.md },
  loginBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  footer: { textAlign: 'center', fontSize: 11, marginTop: 32 },
});
