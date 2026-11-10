import { useRouter, type Href } from "expo-router";
import { useState } from "react";
import { Image, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CompleteRegistration } from "@application/auth/complete-registration.use-case";
import { ClearSession } from "@application/auth/clear-session.use-case";
import { DomainError } from "@domain/errors/domain-error";
import { ScreenFade } from "@presentation/components/ScreenFade";
import {
  BottomNav,
  Header,
  navigateBottomTab,
} from "@presentation/components/design-system";
import { createPrimaryNavLinks } from "@presentation/components/design-system/primary-navigation";
import { useResponsive } from "@presentation/hooks/useResponsive";
import { useAccountStore } from "@presentation/stores/account-store";

import { useServices } from "@providers/service-context";

import { LoginModal } from "@presentation/components/auth/LoginModal";
import { GuestAccountCard } from "./fragments/GuestAccountCard";
import { SignedInProfile } from "./fragments/SignedInProfile";
import { profileContentContainerStyle, styles } from "./style";

export function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isWeb, isMobileWeb, width } = useResponsive();
  const profile = useAccountStore((state) => state.profile);
  const clearProfile = useAccountStore((state) => state.clearProfile);
  const { userRepository, tokenStorage } = useServices();
  const [loginOpen, setLoginOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(profile?.fullName ?? "");
  const [nik, setNik] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const navLinks = createPrimaryNavLinks({
    onHome: () => router.navigate("/" as Href),
    onBrowse: () => router.navigate("/browse" as Href),
    onTickets: () => router.navigate("/my-tickets" as Href),
    onProfile: () => undefined,
    isLoggedIn: Boolean(profile),
  });

  const saveProfile = async () => {
    if (!fullName.trim() || !/^\d{16}$/.test(nik)) {
      setError("Masukkan nama dan NIK 16 digit untuk menyimpan perubahan.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const updated = await new CompleteRegistration(userRepository).execute({
        fullName: fullName.trim(),
        nik,
      });
      useAccountStore.getState().setProfile(updated);
      setNik("");
      setEditing(false);
    } catch (cause) {
      setError(profileUpdateErrorMessage(cause));
    } finally {
      setSaving(false);
    }
  };

  const signOut = async () => {
    try {
      await userRepository.logout?.();
      await new ClearSession(tokenStorage).execute();
      clearProfile();
      setEditing(false);
    } catch {
      setError("Gagal keluar. Silakan coba lagi.");
    }
  };

  return (
    <ScreenFade>
      <View style={styles.screen} testID="profile-screen">
        <Header
          topInset={insets.top}
          showLinks={isWeb && width > 768}
          links={navLinks}
          mobileMenuLinks={navLinks}
          onLogoPress={() => router.navigate("/" as Href)}
          onCtaPress={() => setLoginOpen(true)}
          isLoggedIn={Boolean(profile)}
        />

        <ScrollView
          contentContainerStyle={profileContentContainerStyle(
            insets.top,
            insets.bottom,
            isMobileWeb,
          )}
        >
          <View style={styles.content}>
            <View style={[styles.hero, isMobileWeb && styles.mobileWebHero]}>
              <Image
                source={require("../../../../assets/brand-mark.png")}
                resizeMode="contain"
                style={styles.heroWatermark}
                accessible={false}
              />
              <View style={styles.heroContent}>
                <Text style={styles.heroEyebrow}>RUSUH BOOKING</Text>
                <Text
                  accessibilityRole="header"
                  style={[
                    styles.heroHeading,
                    isMobileWeb && styles.mobileWebHeading,
                  ]}
                >
                  Profil
                </Text>
                <Text style={styles.heroDescription}>
                  {profile
                    ? "Kelola informasi akun dan akses tiketmu di sini."
                    : "Masuk untuk mengelola profil dan melihat tiket di berbagai perangkat."}
                </Text>
                <View style={styles.heroStatus}>
                  <View style={styles.heroStatusDot} />
                  <Text style={styles.heroStatusText}>
                    {profile ? "Akun aktif" : "Akun tamu"}
                  </Text>
                </View>
              </View>
            </View>
            {profile ? (
              <SignedInProfile
                profile={profile}
                editing={editing}
                fullName={fullName}
                nik={nik}
                error={error}
                saving={saving}
                onEdit={() => {
                  setFullName(profile.fullName ?? "");
                  setEditing(true);
                }}
                onFullNameChange={setFullName}
                onNikChange={(value) =>
                  setNik(value.replace(/\D/g, "").slice(0, 16))
                }
                onSave={() => void saveProfile()}
                onCancel={() => {
                  setEditing(false);
                  setNik("");
                  setError("");
                }}
                onSignOut={() => void signOut()}
              />
            ) : (
              <GuestAccountCard onLogin={() => setLoginOpen(true)} />
            )}
          </View>
        </ScrollView>

        <BottomNav
          activeRoute="profile"
          isLoggedIn={Boolean(profile)}
          onNavigate={(route) => navigateBottomTab(router, "profile", route)}
        />
        <LoginModal visible={loginOpen} onClose={() => setLoginOpen(false)} />
      </View>
    </ScreenFade>
  );
}

export function profileUpdateErrorMessage(cause: unknown): string {
  if (cause instanceof DomainError) return cause.userMessage;
  if (cause instanceof Error) return cause.message;
  return "Profil gagal diperbarui.";
}
