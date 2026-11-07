import { Pressable, Text, TextInput, View } from "react-native";
import { styles } from "./style";

interface ProfileEditorProps {
  readonly fullName: string;
  readonly nik: string;
  readonly error: string;
  readonly saving: boolean;
  readonly onFullNameChange: (value: string) => void;
  readonly onNikChange: (value: string) => void;
  readonly onSave: () => void;
  readonly onCancel: () => void;
}

export function ProfileEditor({
  fullName,
  nik,
  error,
  saving,
  onFullNameChange,
  onNikChange,
  onSave,
  onCancel,
}: ProfileEditorProps) {
  return (
    <View style={styles.form}>
      <TextInput
        accessibilityLabel="Nama lengkap"
        value={fullName}
        onChangeText={onFullNameChange}
        placeholder="Nama lengkap"
        style={styles.input}
        testID="profile-name-input"
      />
      <TextInput
        accessibilityLabel="NIK 16 digit"
        value={nik}
        onChangeText={onNikChange}
        keyboardType="number-pad"
        placeholder="NIK 16 digit"
        style={styles.input}
        testID="profile-nik-input"
      />
      {error ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      ) : null}
      <Pressable
        onPress={onSave}
        disabled={saving}
        style={[styles.button, saving && styles.disabledButton]}
        testID="profile-save"
      >
        <Text style={styles.buttonText}>
          {saving ? "Menyimpan…" : "Simpan Profil"}
        </Text>
      </Pressable>
      <Pressable
        onPress={onCancel}
        style={styles.cancelButton}
        testID="profile-cancel"
      >
        <Text style={styles.cancelText}>Batal</Text>
      </Pressable>
    </View>
  );
}
