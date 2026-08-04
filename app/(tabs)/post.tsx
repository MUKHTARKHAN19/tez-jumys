import { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';

import { AuthGate } from '@/components/AuthGate';
import { Card } from '@/components/Card';
import { PillButton } from '@/components/PillButton';
import { ScreenContainer } from '@/components/ScreenContainer';
import { VacancyForm } from '@/components/VacancyForm';
import { colors, fontSize, spacing } from '@/constants/theme';
import { useAuth } from '@/lib/auth';
import { useLanguage } from '@/lib/i18n';
import { supabase } from '@/lib/supabase';
import type { Employer } from '@/types/database';

export default function PostVacancyScreen() {
  const { t } = useLanguage();
  return (
    <AuthGate message={t('post.authMessage')}>
      <PostVacancyContent />
    </AuthGate>
  );
}

function PostVacancyContent() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [employer, setEmployer] = useState<Employer | null>(null);

  // useFocusEffect қолданамыз, себебі бұл tab — Жариялау экраны Бизнес профилінен
  // оралғанда қайта mount болмайды, ал жаңа сақталған профильді көру үшін
  // экран фокус алған сайын қайта сұрау керек.
  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      let cancelled = false;
      supabase
        .from('employers')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (!cancelled) {
            setEmployer((data as Employer | null) ?? null);
            setLoading(false);
          }
        });
      return () => {
        cancelled = true;
      };
    }, [user])
  );

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (!employer) {
    return (
      <ScreenContainer>
        <Card style={styles.noticeCard}>
          <Ionicons name="briefcase-outline" size={20} color={colors.accent} />
          <Text style={styles.noticeText}>{t('post.notice')}</Text>
          <PillButton
            label={t('post.businessProfileButton')}
            onPress={() => router.push('/business-profile')}
          />
        </Card>
      </ScreenContainer>
    );
  }

  return <VacancyForm employer={employer} locationTarget="post" onSaved={() => {}} />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  noticeCard: {
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  noticeText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
});
