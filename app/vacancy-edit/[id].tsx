import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { AuthGate } from '@/components/AuthGate';
import { EmptyState } from '@/components/EmptyState';
import { VacancyForm } from '@/components/VacancyForm';
import { useAuth } from '@/lib/auth';
import { useLanguage } from '@/lib/i18n';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/lib/theme';
import type { Employer, VacancyWithRelations } from '@/types/database';

export default function VacancyEditScreen() {
  const { t } = useLanguage();
  return (
    <AuthGate message={t('post.authMessage')}>
      <VacancyEditContent />
    </AuthGate>
  );
}

function VacancyEditContent() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [employer, setEmployer] = useState<Employer | null>(null);
  const [vacancy, setVacancy] = useState<VacancyWithRelations | null>(null);

  useEffect(() => {
    if (!user || !id) return;
    Promise.all([
      supabase.from('employers').select('*').eq('user_id', user.id).maybeSingle(),
      supabase
        .from('vacancies')
        .select(
          '*, position:positions(*), region:regions(*), district:districts(*), settlement:settlements(*), employer:employers(*)'
        )
        .eq('id', id)
        .maybeSingle(),
    ]).then(([employerResult, vacancyResult]) => {
      setEmployer((employerResult.data as Employer | null) ?? null);
      setVacancy((vacancyResult.data as VacancyWithRelations | null) ?? null);
      setLoading(false);
    });
  }, [user, id]);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (!employer || !vacancy) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', backgroundColor: colors.background }}>
        <EmptyState icon="alert-circle-outline" title={t('vacancyDetail.notFound')} />
      </View>
    );
  }

  return (
    <VacancyForm
      employer={employer}
      initialVacancy={vacancy}
      locationTarget="vacancy-edit"
      onSaved={() => router.back()}
    />
  );
}
