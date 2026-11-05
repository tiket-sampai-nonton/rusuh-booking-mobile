import { Pressable, Text, View } from 'react-native';

import type { UserProfile } from '@domain/repositories/user.repository';


import { ProfileEditor } from '../ProfileEditor';
import { styles } from "./style";


interface SignedInProfileProps {
  readonly profile: UserProfile;
  readonly editing: boolean;
  readonly fullName: string;
  readonly nik: string;
  readonly error: string;
  readonly saving: boolean;
  readonly onEdit: () => void;
  readonly onFullNameChange: (value: string) => void;
  readonly onNikChange: (value: string) => void;
  readonly onSave: () => void;
  readonly onCancel: () => void;
  readonly onSignOut: () => void;
}

export function SignedInProfile({
  profile,
  editing,
  fullName,
  nik,
  error,
  saving,
  onEdit,
  onFullNameChange,
  onNikChange,
  onSave,
  onCancel,
  onSignOut,
}: SignedInProfileProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.name}>{profile.fullName ?? 'Akun'}</Text>
      <Text style={styles.email}>{profile.emailMasked}</Text>
      {profile.nikMasked ? <Text style={styles.maskedNik}>NIK {profile.nikMasked}</Text> : null}
      {editing ? (
        <ProfileEditor
          fullName={fullName}
          nik={nik}
          error={error}
          saving={saving}
          onFullNameChange={onFullNameChange}
          onNikChange={onNikChange}
          onSave={onSave}
          onCancel={onCancel}
        />
      ) : (
        <Pressable onPress={onEdit} style={[styles.button, styles.editButton]} testID="profile-edit">
          <Text style={styles.buttonText}>Edit Profil</Text>
        </Pressable>
      )}
      <Pressable onPress={onSignOut} style={[styles.button, styles.signOutButton]} testID="profile-sign-out">
        <Text style={styles.signOutText}>Keluar</Text>
      </Pressable>
    </View>
  );
}
