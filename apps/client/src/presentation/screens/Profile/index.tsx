import { useRouter, type Href } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CompleteRegistration } from '@application/auth/complete-registration.use-case';
import { ClearSession } from '@application/auth/clear-session.use-case';
import { V2BottomNav, V2Header } from '@presentation/components/v2';
import { ScreenFade } from '@presentation/components/ScreenFade';
import { LoginModal } from '@presentation/components/auth/LoginModal';
import { useServices } from '@providers/service-context';
import { useResponsive } from '@presentation/hooks/useResponsive';
import { useAccountStore } from '@presentation/stores/account-store';
import { v2Colors, v2Borders, interFonts } from '@presentation/theme';

export function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isWeb, width } = useResponsive();
  const profile = useAccountStore((s) => s.profile);
  const clearProfile = useAccountStore((s) => s.clearProfile);
  const { userRepository, tokenStorage } = useServices();
  const [loginOpen, setLoginOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(profile?.fullName ?? '');
  const [nik, setNik] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const saveProfile = async () => {
    if (!fullName.trim() || !/^\d{16}$/.test(nik)) {
      setError('Masukkan nama dan NIK 16 digit untuk menyimpan perubahan.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const updated = await new CompleteRegistration(userRepository).execute({ fullName: fullName.trim(), nik });
      useAccountStore.getState().setProfile(updated);
      setNik('');
      setEditing(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Profil gagal diperbarui.');
    } finally {
      setSaving(false);
    }
  };

  const signOut = async () => {
    await new ClearSession(tokenStorage).execute();
    clearProfile();
    setEditing(false);
  };

  return (
    <ScreenFade>
      <View style={{ flex: 1, backgroundColor: v2Colors.ground }} testID="profile-screen">
        <V2Header
          topInset={insets.top}
          showLinks={isWeb && width > 768}
          links={[
            { label: 'Beranda', onPress: () => router.push('/' as Href), testID: 'nav-home' },
            { label: 'Browse', onPress: () => router.push('/browse' as Href), testID: 'nav-browse' },
            ...(profile ? [
              { label: 'My Ticket', onPress: () => router.push('/my-tickets' as Href), testID: 'nav-tickets' },
              { label: 'Profile', onPress: () => {}, testID: 'nav-profile' },
            ] : []),
          ]}
          onLogoPress={() => router.push('/' as Href)}
          onCtaPress={() => setLoginOpen(true)}
          isLoggedIn={Boolean(profile)}
        />
        <ScrollView contentContainerStyle={{ paddingTop: insets.top + 96, paddingHorizontal: 16, paddingBottom: insets.bottom + 120 }}>
          <Text accessibilityRole="header" style={{ color: v2Colors.ink, fontFamily: interFonts.black, fontSize: 32, textTransform: 'uppercase' }}>Profile</Text>
          {!profile ? (
            <View style={{ marginTop: 24, padding: 20, borderWidth: v2Borders.standard, borderColor: v2Colors.ink, backgroundColor: v2Colors.field }}>
              <Text style={{ color: v2Colors.ink, fontFamily: interFonts.black, fontSize: 20, textTransform: 'uppercase' }}>Guest account</Text>
              <Text style={{ marginTop: 8, color: v2Colors.inkMuted, fontFamily: interFonts.regular, fontSize: 13, lineHeight: 20 }}>Masuk untuk mengelola profil dan melihat tiket di berbagai perangkat.</Text>
              <Pressable onPress={() => setLoginOpen(true)} style={{ marginTop: 18, minHeight: 48, alignItems: 'center', justifyContent: 'center', backgroundColor: v2Colors.ink }} testID="profile-login">
                <Text style={{ color: v2Colors.ground, fontFamily: interFonts.bold, fontSize: 12, textTransform: 'uppercase' }}>Masuk / Daftar</Text>
              </Pressable>
            </View>
          ) : (
            <View style={{ marginTop: 24, padding: 20, borderWidth: v2Borders.standard, borderColor: v2Colors.ink }}>
              <Text style={{ color: v2Colors.ink, fontFamily: interFonts.black, fontSize: 20 }}>{profile.fullName ?? 'Akun'}</Text>
              <Text style={{ marginTop: 6, color: v2Colors.inkMuted, fontFamily: interFonts.regular, fontSize: 14 }}>{profile.emailMasked}</Text>
              {profile.nikMasked ? <Text style={{ marginTop: 6, color: v2Colors.inkMuted, fontFamily: interFonts.regular, fontSize: 13 }}>NIK {profile.nikMasked}</Text> : null}
              {editing ? (
                <View style={{ marginTop: 20, gap: 12 }}>
                  <TextInput accessibilityLabel="Nama lengkap" value={fullName} onChangeText={setFullName} placeholder="Nama lengkap" style={inputStyle} />
                  <TextInput accessibilityLabel="NIK 16 digit" value={nik} onChangeText={(value) => setNik(value.replace(/\D/g, '').slice(0, 16))} keyboardType="number-pad" placeholder="NIK 16 digit" style={inputStyle} />
                  {error ? <Text accessibilityRole="alert" style={{ color: '#b00020', fontSize: 13 }}>{error}</Text> : null}
                  <Pressable onPress={() => void saveProfile()} disabled={saving} style={darkButton} testID="profile-save"><Text style={buttonText}>{saving ? 'Menyimpan…' : 'Simpan Profil'}</Text></Pressable>
                  <Pressable onPress={() => { setEditing(false); setNik(''); setError(''); }} style={lightButton}><Text style={{ ...buttonText, color: v2Colors.ink }}>Batal</Text></Pressable>
                </View>
              ) : (
                <Pressable onPress={() => { setFullName(profile.fullName ?? ''); setEditing(true); }} style={[darkButton, { marginTop: 20 }]} testID="profile-edit"><Text style={buttonText}>Edit Profil</Text></Pressable>
              )}
              <Pressable onPress={() => void signOut()} style={[lightButton, { marginTop: 12 }]} testID="profile-sign-out"><Text style={{ ...buttonText, color: v2Colors.ink }}>Keluar</Text></Pressable>
            </View>
          )}
        </ScrollView>
        <LoginModal visible={loginOpen} onClose={() => setLoginOpen(false)} />
        <V2BottomNav activeRoute="profile" isLoggedIn={Boolean(profile)} onNavigate={(route) => {
          if (route === 'home') router.push('/' as Href);
          if (route === 'browse') router.push('/browse' as Href);
          if (route === 'tickets') router.push('/my-tickets' as Href);
        }} />
      </View>
    </ScreenFade>
  );
}

const inputStyle = { minHeight: 48, paddingHorizontal: 12, borderWidth: v2Borders.standard, borderColor: v2Colors.ink, color: v2Colors.ink, fontFamily: interFonts.regular } as const;
const darkButton = { minHeight: 48, alignItems: 'center' as const, justifyContent: 'center' as const, backgroundColor: v2Colors.ink };
const lightButton = { minHeight: 48, alignItems: 'center' as const, justifyContent: 'center' as const, borderWidth: v2Borders.standard, borderColor: v2Colors.ink };
const buttonText = { color: v2Colors.ground, fontFamily: interFonts.bold, fontSize: 12, textTransform: 'uppercase' as const };
