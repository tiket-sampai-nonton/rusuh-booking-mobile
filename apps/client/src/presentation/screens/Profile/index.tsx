import { useRouter, type Href } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { V2BottomNav, V2Header } from '@presentation/components/v2';
import { ScreenFade } from '@presentation/components/ScreenFade';
import { LoginModal } from '@presentation/components/auth/LoginModal';
import { useState } from 'react';
import { v2Colors, v2Borders, interFonts } from '@presentation/theme';

export function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <ScreenFade>
      <View style={{ flex: 1, backgroundColor: v2Colors.ground }} testID="profile-screen">
        <V2Header topInset={insets.top} onLogoPress={() => router.push('/' as Href)} onCtaPress={() => setLoginOpen(true)} />
        <ScrollView contentContainerStyle={{ paddingTop: insets.top + 96, paddingHorizontal: 16, paddingBottom: insets.bottom + 96 }}>
          <Text accessibilityRole="header" style={{ color: v2Colors.ink, fontFamily: interFonts.black, fontSize: 32, textTransform: 'uppercase' }}>Profile</Text>
          <Text style={{ marginTop: 8, color: v2Colors.inkMuted, fontFamily: interFonts.regular, fontSize: 14 }}>Sign in is optional. You can complete your booking as a guest.</Text>
          <View style={{ marginTop: 24, padding: 20, borderWidth: v2Borders.standard, borderColor: v2Colors.ink, backgroundColor: v2Colors.field }}>
            <Text style={{ color: v2Colors.ink, fontFamily: interFonts.black, fontSize: 20, textTransform: 'uppercase' }}>Guest account</Text>
            <Text style={{ marginTop: 8, color: v2Colors.inkMuted, fontFamily: interFonts.regular, fontSize: 13, lineHeight: 20 }}>Log in to manage your profile and see tickets across devices.</Text>
            <Pressable onPress={() => setLoginOpen(true)} style={{ marginTop: 18, minHeight: 44, alignItems: 'center', justifyContent: 'center', backgroundColor: v2Colors.ink }} testID="profile-login">
              <Text style={{ color: v2Colors.ground, fontFamily: interFonts.bold, fontSize: 12, textTransform: 'uppercase' }}>Sign In / Register</Text>
            </Pressable>
          </View>
          <Pressable onPress={() => router.push('/my-tickets' as Href)} style={{ marginTop: 16, minHeight: 52, paddingHorizontal: 16, justifyContent: 'center', borderWidth: v2Borders.standard, borderColor: v2Colors.ink }}>
            <Text style={{ color: v2Colors.ink, fontFamily: interFonts.bold, fontSize: 13, textTransform: 'uppercase' }}>My Tickets →</Text>
          </Pressable>
        </ScrollView>
        <LoginModal visible={loginOpen} onClose={() => setLoginOpen(false)} />
        <V2BottomNav activeRoute="profile" onNavigate={(route) => {
          if (route === 'home') router.push('/' as Href);
          if (route === 'browse') router.push('/browse' as Href);
          if (route === 'tickets') router.push('/my-tickets' as Href);
        }} />
      </View>
    </ScreenFade>
  );
}

