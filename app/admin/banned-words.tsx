import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';

import { EmptyState } from '@/components/EmptyState';
import { PillButton } from '@/components/PillButton';
import { colors, fontSize, radii, spacing } from '@/constants/theme';
import { useLanguage } from '@/lib/i18n';
import { supabase } from '@/lib/supabase';
import type { BannedWord } from '@/types/database';

export default function AdminBannedWordsScreen() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [words, setWords] = useState<BannedWord[]>([]);
  const [newWord, setNewWord] = useState('');
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(() => {
    let cancelled = false;
    setLoading(true);
    supabase
      .from('banned_words')
      .select('*')
      .order('word')
      .then(({ data }) => {
        if (!cancelled) {
          setWords((data as BannedWord[] | null) ?? []);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useFocusEffect(useCallback(() => load(), [load]));

  const handleAdd = async () => {
    const word = newWord.trim().toLowerCase();
    if (!word) return;
    setSaving(true);
    const { error } = await supabase.from('banned_words').insert({ word });
    setSaving(false);
    if (!error) {
      setNewWord('');
      load();
    }
  };

  const handleDelete = async (id: string) => {
    setBusyId(id);
    const { error } = await supabase.from('banned_words').delete().eq('id', id);
    if (!error) {
      setWords((current) => current.filter((w) => w.id !== id));
    }
    setBusyId(null);
  };

  return (
    <View style={styles.container}>
      <View style={styles.addRow}>
        <TextInput
          style={styles.input}
          placeholder={t('admin.bannedWordsPlaceholder')}
          placeholderTextColor={colors.textMuted}
          autoCapitalize="none"
          value={newWord}
          onChangeText={setNewWord}
          onSubmitEditing={handleAdd}
        />
        <PillButton label={t('admin.bannedWordsAdd')} onPress={handleAdd} disabled={saving || !newWord.trim()} />
      </View>
      <Text style={styles.hint}>{t('admin.bannedWordsHint')}</Text>

      {loading ? (
        <ActivityIndicator color={colors.accent} style={{ marginTop: spacing.lg }} />
      ) : (
        <FlatList
          data={words}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.wordRow}>
              <Text style={styles.wordText}>{item.word}</Text>
              <Pressable hitSlop={8} onPress={() => handleDelete(item.id)} disabled={busyId === item.id}>
                {busyId === item.id ? (
                  <ActivityIndicator size="small" color={colors.danger} />
                ) : (
                  <Ionicons name="trash-outline" size={18} color={colors.danger} />
                )}
              </Pressable>
            </View>
          )}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
          ListEmptyComponent={<EmptyState icon="ban-outline" title={t('admin.bannedWordsEmptyTitle')} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
    gap: spacing.sm,
  },
  addRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    color: colors.text,
    fontSize: fontSize.md,
  },
  hint: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
  },
  listContent: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
  wordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
  },
  wordText: {
    color: colors.text,
    fontSize: fontSize.md,
  },
});
