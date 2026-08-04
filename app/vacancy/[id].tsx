import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Linking, Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ExpoLinking from 'expo-linking';
import { router, useLocalSearchParams } from 'expo-router';

import { BlockButton } from '@/components/BlockButton';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { PillButton } from '@/components/PillButton';
import { ReportButton } from '@/components/ReportButton';
import { ScreenContainer } from '@/components/ScreenContainer';
import { getScheduleLabel } from '@/constants/schedule';
import { colors, fontSize, radii, spacing } from '@/constants/theme';
import { useAuth } from '@/lib/auth';
import { useFavorites } from '@/lib/favorites';
import { formatRelativeTime } from '@/lib/formatRelativeTime';
import { formatSalary } from '@/lib/formatSalary';
import { useLanguage } from '@/lib/i18n';
import { supabase } from '@/lib/supabase';
import type { VacancyWithRelations } from '@/types/database';

function toWhatsAppDigits(phone: string) {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('8')) return `7${digits.slice(1)}`;
  return digits;
}

export default function VacancyDetailScreen() {
  const { language, t, localize } = useLanguage();
  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [vacancy, setVacancy] = useState<VacancyWithRelations | null>(null);
  const [mySeeker, setMySeeker] = useState<{ id: string; full_name: string } | null>(null);
  const [applied, setApplied] = useState(false);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    if (!id) return;
    supabase
      .from('vacancies')
      .select(
        '*, position:positions(*), region:regions(*), district:districts(*), settlement:settlements(*), employer:employers(*)'
      )
      .eq('id', id)
      .maybeSingle()
      .then(({ data }) => {
        setVacancy((data as VacancyWithRelations | null) ?? null);
        setLoading(false);
      });
    supabase.rpc('increment_vacancy_view', { vacancy_id: id });
  }, [id]);

  useEffect(() => {
    if (!user || !id) return;
    supabase
      .from('seekers')
      .select('id, full_name')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data: seeker }) => {
        if (!seeker) return;
        setMySeeker(seeker);
        supabase
          .from('applications')
          .select('id')
          .eq('vacancy_id', id)
          .eq('seeker_id', seeker.id)
          .maybeSingle()
          .then(({ data: existing }) => setApplied(!!existing));
      });
  }, [user, id]);

  const handleApply = async () => {
    if (!user) {
      router.push('/auth');
      return;
    }
    if (!mySeeker) {
      router.push('/seeker-profile');
      return;
    }
    if (!vacancy) return;

    setApplying(true);
    const { error } = await supabase
      .from('applications')
      .insert({ vacancy_id: vacancy.id, seeker_id: mySeeker.id });
    setApplying(false);

    if (!error) {
      setApplied(true);
      if (vacancy.employer?.user_id) {
        supabase.functions.invoke('send-push', {
          body: {
            user_id: vacancy.employer.user_id,
            title: 'Жаңа өтініш! / Новая заявка!',
            body: `${mySeeker.full_name} сіздің вакансияңызға өтініш берді. / ${mySeeker.full_name} откликнулся(-ась) на вашу вакансию.`,
          },
        });
      }
    }
  };

  const handleContactPress = (url: string) => {
    if (vacancy) supabase.rpc('increment_vacancy_call', { vacancy_id: vacancy.id });
    Linking.openURL(url);
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (!vacancy) {
    return (
      <View style={styles.loading}>
        <EmptyState icon="alert-circle-outline" title={t('vacancyDetail.notFound')} />
      </View>
    );
  }

  const salaryLabel = formatSalary(
    vacancy.salary_from,
    vacancy.salary_to,
    language,
    t,
    vacancy.salary_period
  );

  return (
    <ScreenContainer>
      {vacancy.photo_url && <Image source={{ uri: vacancy.photo_url }} style={styles.photo} />}

      <Card style={styles.headerCard}>
        <View style={styles.headerTop}>
          <Text style={styles.position}>
            {vacancy.position ? localize(vacancy.position) : t('vacancyDetail.positionFallback')}{' '}
            {t('vacancyCard.neededSuffix')}
          </Text>
          {vacancy.schedule && (
            <View style={styles.scheduleTag}>
              <Text style={styles.scheduleText}>{getScheduleLabel(vacancy.schedule, language)}</Text>
            </View>
          )}
          <Pressable hitSlop={8} onPress={() => toggleFavorite(vacancy.id)}>
            <Ionicons
              name={isFavorite(vacancy.id) ? 'heart' : 'heart-outline'}
              size={24}
              color={isFavorite(vacancy.id) ? colors.danger : colors.textMuted}
            />
          </Pressable>
        </View>
        <Text style={styles.salary}>{salaryLabel}</Text>
        <View style={styles.row}>
          <Ionicons name="location-outline" size={18} color={colors.danger} />
          <Text style={styles.rowText}>
            {vacancy.settlement
              ? localize(vacancy.settlement)
              : vacancy.district
                ? localize(vacancy.district)
                : vacancy.region
                  ? localize(vacancy.region)
                  : t('vacancyDetail.locationFallback')}
          </Text>
          <Text style={styles.postedAt}>{formatRelativeTime(vacancy.created_at, language)}</Text>
        </View>
      </Card>

      <View style={styles.warningBanner}>
        <Ionicons name="warning-outline" size={18} color={colors.warning} />
        <Text style={styles.warningText}>{t('vacancyDetail.paymentWarning')}</Text>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>{t('vacancyDetail.descriptionLabel')}</Text>
        <Card>
          <Text style={styles.description}>
            {vacancy.description ?? t('vacancyDetail.descriptionFallback')}
          </Text>
        </Card>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>{t('vacancyDetail.employerLabel')}</Text>
        <Card style={styles.row}>
          <Ionicons name="business-outline" size={20} color={colors.accent} />
          <Text style={styles.rowText}>
            {vacancy.employer?.business_name ?? t('vacancyDetail.employerFallback')}
          </Text>
        </Card>
      </View>

      {vacancy.employer?.user_id !== user?.id && (
        <PillButton
          label={applied ? t('vacancyDetail.appliedButton') : t('vacancyDetail.applyButton')}
          icon={applied ? 'checkmark-circle' : 'paper-plane-outline'}
          onPress={handleApply}
          disabled={applied || applying}
        />
      )}

      <PillButton
        label={
          vacancy.contact_phone
            ? `${t('vacancyDetail.contactButtonPrefix')}${vacancy.contact_phone}`
            : t('vacancyDetail.contactButton')
        }
        icon="call-outline"
        onPress={() => vacancy.contact_phone && handleContactPress(`tel:${vacancy.contact_phone}`)}
        disabled={!vacancy.contact_phone}
      />

      {vacancy.contact_phone && (
        <PillButton
          label={t('vacancyDetail.whatsappButton')}
          variant="outline"
          icon="logo-whatsapp"
          onPress={() =>
            handleContactPress(`https://wa.me/${toWhatsAppDigits(vacancy.contact_phone as string)}`)
          }
        />
      )}

      <PillButton
        label={t('vacancyDetail.shareButton')}
        variant="outline"
        icon="share-social-outline"
        onPress={() => {
          const positionText = vacancy.position
            ? localize(vacancy.position)
            : t('vacancyDetail.positionFallback');
          const locationText = vacancy.settlement
            ? localize(vacancy.settlement)
            : vacancy.district
              ? localize(vacancy.district)
              : vacancy.region
                ? localize(vacancy.region)
                : '';
          const shareUrl = ExpoLinking.createURL(`/vacancy/${vacancy.id}`);
          const lines = [
            positionText,
            salaryLabel,
            locationText,
            vacancy.contact_phone,
            shareUrl,
          ].filter(Boolean);
          Share.share({ message: lines.join('\n') });
        }}
      />

      <View style={styles.footerActions}>
        <ReportButton targetType="vacancy" targetId={vacancy.id} />
        {vacancy.employer && (
          <BlockButton
            userId={vacancy.employer.user_id}
            displayName={vacancy.employer.business_name}
            onBlocked={() => router.back()}
          />
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  photo: {
    width: '100%',
    height: 180,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
  },
  headerCard: {
    gap: spacing.sm,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  position: {
    flex: 1,
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: '700',
  },
  scheduleTag: {
    backgroundColor: colors.accentSoft,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  scheduleText: {
    color: colors.accent,
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  salary: {
    color: colors.success,
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  rowText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },
  postedAt: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
  },
  field: {
    gap: spacing.sm,
  },
  label: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  description: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  footerActions: {
    gap: spacing.sm,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: `${colors.warning}1F`,
    borderWidth: 1,
    borderColor: colors.warning,
    borderRadius: radii.md,
    padding: spacing.sm,
  },
  warningText: {
    flex: 1,
    color: colors.warning,
    fontSize: fontSize.xs,
    fontWeight: '600',
    lineHeight: 16,
  },
});
