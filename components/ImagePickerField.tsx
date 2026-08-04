import { useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

import { colors, fontSize, radii, spacing } from '@/constants/theme';
import { useLanguage } from '@/lib/i18n';
import { uploadImageAsync } from '@/lib/uploadImage';

type ImagePickerFieldProps = {
  value: string | null;
  onChange: (url: string | null) => void;
  uploadPath: string;
  label: string;
};

export function ImagePickerField({ value, onChange, uploadPath, label }: ImagePickerFieldProps) {
  const { t } = useLanguage();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePick = async () => {
    setError(null);
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError(t('imagePicker.permissionDenied'));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      allowsEditing: true,
    });

    if (result.canceled || !result.assets[0]) return;

    setUploading(true);
    try {
      const publicUrl = await uploadImageAsync(result.assets[0].uri, uploadPath);
      onChange(publicUrl);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : t('imagePicker.uploadFailed'));
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <Pressable style={styles.box} onPress={handlePick} disabled={uploading}>
        {uploading ? (
          <ActivityIndicator color={colors.accent} />
        ) : value ? (
          <Image source={{ uri: value }} style={styles.preview} />
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name="camera-outline" size={26} color={colors.accent} />
            <Text style={styles.placeholderText}>{t('imagePicker.addPhoto')}</Text>
          </View>
        )}
      </Pressable>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: spacing.sm,
  },
  label: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  box: {
    width: 110,
    height: 110,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  preview: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    alignItems: 'center',
    gap: 4,
  },
  placeholderText: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
  },
  errorText: {
    color: colors.danger,
    fontSize: fontSize.xs,
  },
});
