import { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Switch, Platform, ActivityIndicator, TextInput, ScrollView, Image, KeyboardAvoidingView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useAuthStore } from '../../src/store/auth';
import { useThemeStore } from '../../src/store/theme';
import { getRoleConfig } from '../../src/constants/roles';
import { SPACING } from '../../src/constants/config';
import { Ionicons } from '@expo/vector-icons';
import { loadDashboardStats } from '../../src/services/data';

type Location = { zone: string; area: string; branch: string };

export default function ProfileScreen() {
  const { user, logout, updateUser } = useAuthStore();
  const { colors, mode, toggle } = useThemeStore();
  const roleCfg = getRoleConfig(user?.role);
  const [busy, setBusy] = useState(false);
  const [locationLoading, setLocationLoading] = useState(true);
  const [location, setLocation] = useState<Location>({ zone: user?.zone_name || '', area: user?.area_name || '', branch: user?.branch_name || '' });
  const [name, setName] = useState(user?.full_name || user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profilePic, setProfilePic] = useState<string | undefined>(user?.profile_pic || undefined);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const displayName = name.trim() || user?.username || 'User';
  const initials = useMemo(() => displayName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join(''), [displayName]);

  useEffect(() => {
    setName(user?.full_name || user?.name || '');
    setEmail(user?.email || '');
    setProfilePic(user?.profile_pic || undefined);
  }, [user?.full_name, user?.name, user?.email, user?.profile_pic]);

  const loadLocation = useCallback(async () => {
    setLocationLoading(true);
    try {
      const res = await loadDashboardStats();
      const stats = res.data || {};
      setLocation({
        zone: stats.zone_name || user?.zone_name || '',
        area: stats.area_name || user?.area_name || '',
        branch: stats.branch_name || user?.branch_name || '',
      });
    } finally {
      setLocationLoading(false);
    }
  }, [user?.zone_name, user?.area_name, user?.branch_name]);

  useEffect(() => { void loadLocation(); }, [loadLocation]);

  const choosePhoto = async () => {
    if (uploading || saving) return;
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Photo Permission', 'Allow CUPAD to access your photos to update your profile picture.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.75,
      base64: true,
    });
    if (result.canceled || !result.assets?.[0]?.base64) return;
    const asset = result.assets[0];
    const mime = asset.mimeType || 'image/jpeg';
    if (!/^image\/(jpeg|jpg|png|webp)$/i.test(mime)) {
      Alert.alert('Unsupported Image', 'Please select a JPG, PNG, or WebP image.');
      return;
    }
    const dataUri = `data:${mime};base64,${asset.base64}`;
    if (dataUri.length > 3_000_000) {
      Alert.alert('Image Too Large', 'Please choose a smaller profile picture.');
      return;
    }
    setProfilePic(dataUri);
    setUploading(true);
    try {
      const updated = await updateUser({ profile_pic: dataUri });
      setProfilePic(updated.profile_pic || undefined);
      Alert.alert('Profile Picture', 'Profile picture updated successfully.');
    } catch (e: any) {
      setProfilePic(user?.profile_pic || undefined);
      Alert.alert('Update Failed', e?.message || 'Could not update your profile picture.');
    } finally {
      setUploading(false);
    }
  };

  const saveProfile = async () => {
    if (saving || uploading) return;
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    if (trimmedName.length < 2) { Alert.alert('Invalid Name', 'Enter your full name.'); return; }
    if (!trimmedEmail || !/^\S+@\S+\.\S+$/.test(trimmedEmail)) { Alert.alert('Invalid Email', 'Enter a valid email address.'); return; }
    if (newPassword && newPassword.length < 6) { Alert.alert('Password', 'New password must be at least 6 characters.'); return; }
    if (newPassword && newPassword !== confirmPassword) { Alert.alert('Password', 'New password and confirmation do not match.'); return; }
    if (newPassword && !currentPassword) { Alert.alert('Password', 'Enter your current password before setting a new one.'); return; }

    setSaving(true);
    try {
      const updated = await updateUser({
        full_name: trimmedName,
        email: trimmedEmail,
        ...(newPassword ? { current_password: currentPassword, new_password: newPassword } : {}),
      });
      setName(updated.full_name || updated.name || trimmedName);
      setEmail(updated.email || trimmedEmail);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      Alert.alert('Profile Updated', 'Your profile details have been updated successfully.');
    } catch (e: any) {
      Alert.alert('Update Failed', e?.message || 'Could not update your profile.');
    } finally {
      setSaving(false);
    }
  };

  const doLogout = async () => {
    if (busy) return;
    setBusy(true);
    try { await logout(); } finally { router.replace('/(auth)/login'); setBusy(false); }
  };

  const handleLogout = () => {
    if (busy) return;
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      if (window.confirm('Are you sure you want to sign out?')) void doLogout();
      return;
    }
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => void doLogout() },
    ]);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => void choosePhoto()} activeOpacity={0.85} disabled={uploading || saving}>
            {profilePic ? (
              <Image source={{ uri: profilePic }} style={styles.avatarImage} />
            ) : (
              <View style={[styles.avatar, { backgroundColor: roleCfg.accent || colors.primary }]}><Text style={styles.avatarText}>{initials || 'U'}</Text></View>
            )}
            <View style={[styles.cameraBadge, { backgroundColor: colors.primary, borderColor: colors.background }]}>
              {uploading ? <ActivityIndicator size="small" color="#fff" /> : <Ionicons name="camera" size={14} color="#fff" />}
            </View>
          </TouchableOpacity>
          <Text style={[styles.name, { color: colors.text }]}>{displayName}</Text>
          <Text style={[styles.role, { color: roleCfg.accent || colors.primary }]}>{roleCfg.label}</Text>
          <Text style={[styles.photoHint, { color: colors.textSecondary }]}>Tap photo to change</Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <SectionTitle icon="create-outline" title="Personal Information" subtitle="Update your name and email" colors={colors} />
          <Field label="Full Name" value={name} onChangeText={setName} placeholder="Enter your full name" icon="person-outline" colors={colors} />
          <Field label="Email Address" value={email} onChangeText={setEmail} placeholder="Enter your email" icon="mail-outline" keyboardType="email-address" autoCapitalize="none" colors={colors} />
          <InfoRow icon="person-circle-outline" label="Username" value={user?.username} colors={colors} />
          <InfoRow icon="call-outline" label="Phone" value={user?.phone || 'Not provided'} colors={colors} last />
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, marginTop: 12 }]}>
          <SectionTitle icon="lock-closed-outline" title="Password" subtitle="Leave blank if you do not want to change it" colors={colors} />
          <PasswordField label="Current Password" value={currentPassword} onChangeText={setCurrentPassword} visible={showCurrentPassword} setVisible={setShowCurrentPassword} colors={colors} />
          <PasswordField label="New Password" value={newPassword} onChangeText={setNewPassword} visible={showNewPassword} setVisible={setShowNewPassword} colors={colors} />
          <PasswordField label="Confirm New Password" value={confirmPassword} onChangeText={setConfirmPassword} visible={showConfirmPassword} setVisible={setShowConfirmPassword} colors={colors} last />
          <View style={[styles.passwordHint, { backgroundColor: colors.infoBg }]}>
            <Ionicons name="shield-checkmark-outline" size={17} color={colors.primary} />
            <Text style={[styles.passwordHintText, { color: colors.textSecondary }]}>Your current password is required before a new password can be saved.</Text>
          </View>
        </View>

        <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.primary, opacity: saving || uploading ? 0.65 : 1 }]} onPress={() => void saveProfile()} disabled={saving || uploading} activeOpacity={0.85}>
          {saving ? <ActivityIndicator color="#fff" /> : <><Ionicons name="checkmark-circle-outline" size={21} color="#fff" /><Text style={styles.saveText}>Save Profile Changes</Text></>}
        </TouchableOpacity>

        <View style={[styles.card, { backgroundColor: colors.card, marginTop: 12 }]}>
          <View style={styles.locationHeader}>
            <View style={[styles.locationIcon, { backgroundColor: colors.primary + '16' }]}><Ionicons name="location-outline" size={21} color={colors.primary} /></View>
            <View style={styles.locationHeaderText}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Assigned Location</Text>
              <Text style={[styles.sectionHint, { color: colors.textSecondary }]}>Your current field assignment</Text>
            </View>
          </View>
          {locationLoading ? (
            <View style={styles.loadingRow}><ActivityIndicator size="small" color={colors.primary} /><Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading location…</Text></View>
          ) : <>
            <InfoRow icon="globe-outline" label="Zone" value={location.zone || 'Not assigned'} colors={colors} />
            <InfoRow icon="map-outline" label="Area" value={location.area || 'Not assigned'} colors={colors} />
            <InfoRow icon="business-outline" label="Branch" value={location.branch || 'Not assigned'} colors={colors} last />
          </>}
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, marginTop: 12 }]}>
          <View style={styles.themeRow}>
            <View style={styles.themeLeft}><Ionicons name={mode === 'dark' ? 'moon' : 'sunny'} size={22} color={colors.primary} /><View style={{ marginLeft: 14 }}><Text style={[styles.themeLabel, { color: colors.text }]}>Dark Mode</Text><Text style={[styles.themeHint, { color: colors.textSecondary }]}>{mode === 'dark' ? 'On' : 'Off'}</Text></View></View>
            <Switch value={mode === 'dark'} onValueChange={() => toggle()} trackColor={{ false: colors.border, true: colors.primary }} thumbColor="#fff" />
          </View>
        </View>

        <TouchableOpacity style={[styles.logoutBtn, { backgroundColor: colors.logoutBg, opacity: busy ? 0.7 : 1 }]} onPress={handleLogout} disabled={busy} activeOpacity={0.8}>
          {busy ? <ActivityIndicator color={colors.error} /> : <><Ionicons name="log-out-outline" size={22} color={colors.error} /><Text style={[styles.logoutText, { color: colors.error }]}>Sign Out</Text></>}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function SectionTitle({ icon, title, subtitle, colors }: { icon: keyof typeof Ionicons.glyphMap; title: string; subtitle: string; colors: any }) {
  return <View style={styles.sectionTitleRow}><View style={[styles.sectionIcon, { backgroundColor: colors.primary + '16' }]}><Ionicons name={icon} size={19} color={colors.primary} /></View><View style={styles.sectionTitleText}><Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text><Text style={[styles.sectionHint, { color: colors.textSecondary }]}>{subtitle}</Text></View></View>;
}

function Field({ label, value, onChangeText, placeholder, icon, colors, keyboardType, autoCapitalize }: any) {
  return <View style={styles.fieldWrap}><Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>{label}</Text><View style={[styles.inputWrap, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}><Ionicons name={icon} size={19} color={colors.primary} /><TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={colors.textMuted} keyboardType={keyboardType} autoCapitalize={autoCapitalize} style={[styles.input, { color: colors.text }]} /></View></View>;
}

function PasswordField({ label, value, onChangeText, visible, setVisible, colors, last }: any) {
  return <View style={[styles.fieldWrap, last && { marginBottom: 0 }]}><Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>{label}</Text><View style={[styles.inputWrap, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}><Ionicons name="lock-closed-outline" size={19} color={colors.primary} /><TextInput value={value} onChangeText={onChangeText} placeholder="••••••••" placeholderTextColor={colors.textMuted} secureTextEntry={!visible} style={[styles.input, { color: colors.text }]} autoCapitalize="none" /><TouchableOpacity onPress={() => setVisible(!visible)}><Ionicons name={visible ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textSecondary} /></TouchableOpacity></View></View>;
}

function InfoRow({ icon, label, value, colors, last }: { icon: keyof typeof Ionicons.glyphMap; label: string; value?: string | null; colors: any; last?: boolean }) {
  return <View style={[styles.row, !last && { borderBottomWidth: 1, borderBottomColor: colors.border }]}><Ionicons name={icon} size={20} color={colors.primary} /><View style={styles.rowText}><Text style={[styles.rowLabel, { color: colors.textSecondary }]}>{label}</Text><Text style={[styles.rowValue, { color: colors.text }]} numberOfLines={2}>{value || '—'}</Text></View></View>;
}

const styles = StyleSheet.create({
  container: { padding: SPACING.md, paddingBottom: 40 },
  header: { alignItems: 'center', marginVertical: 20 },
  avatar: { width: 94, height: 94, borderRadius: 47, justifyContent: 'center', alignItems: 'center' },
  avatarImage: { width: 94, height: 94, borderRadius: 47 },
  avatarText: { fontSize: 34, fontWeight: '700', color: '#fff' },
  cameraBadge: { position: 'absolute', right: 0, bottom: 0, width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', borderWidth: 3 },
  name: { fontSize: 22, fontWeight: '700', marginTop: 12 },
  role: { fontSize: 13, fontWeight: '600', marginTop: 4 },
  photoHint: { fontSize: 12, marginTop: 5 },
  card: { borderRadius: 16, padding: 8 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', padding: 12, paddingBottom: 6 },
  sectionIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  sectionTitleText: { marginLeft: 12, flex: 1 },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  sectionHint: { fontSize: 12, marginTop: 2 },
  fieldWrap: { margin: 8, marginBottom: 4 },
  fieldLabel: { fontSize: 12, fontWeight: '600', marginBottom: 6 },
  inputWrap: { minHeight: 50, borderRadius: 12, borderWidth: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 13 },
  input: { flex: 1, marginLeft: 10, fontSize: 15, minHeight: 48 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  rowText: { marginLeft: 14, flex: 1 },
  rowLabel: { fontSize: 12 },
  rowValue: { fontSize: 15, fontWeight: '500', marginTop: 2 },
  passwordHint: { margin: 8, marginTop: 12, borderRadius: 10, padding: 11, flexDirection: 'row', alignItems: 'center', gap: 8 },
  passwordHintText: { flex: 1, fontSize: 11, lineHeight: 16 },
  saveBtn: { minHeight: 52, borderRadius: 13, marginTop: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  saveText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  locationHeader: { flexDirection: 'row', alignItems: 'center', padding: 14, paddingBottom: 6 },
  locationIcon: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  locationHeaderText: { marginLeft: 12, flex: 1 },
  loadingRow: { flexDirection: 'row', alignItems: 'center', padding: 18 },
  loadingText: { marginLeft: 10, fontSize: 13 },
  themeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14 },
  themeLeft: { flexDirection: 'row', alignItems: 'center' },
  themeLabel: { fontSize: 15, fontWeight: '600' },
  themeHint: { fontSize: 12, marginTop: 2 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 12, padding: 16, gap: 8, marginTop: 24 },
  logoutText: { fontSize: 16, fontWeight: '700' },
});
