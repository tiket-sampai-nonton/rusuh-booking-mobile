import { Pressable, Text, View } from 'react-native';
import { styles } from "./style";




interface GuestAccountCardProps {
  readonly onLogin: () => void;
}

export function GuestAccountCard({ onLogin }: GuestAccountCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Akun Tamu</Text>
      <Text style={styles.description}>
        Masuk untuk mengelola profil dan melihat tiket di berbagai perangkat.
      </Text>
      <Pressable onPress={onLogin} style={styles.button} testID="profile-login">
        <Text style={styles.buttonText}>Masuk / Daftar</Text>
      </Pressable>
    </View>
  );
}
