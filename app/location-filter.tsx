import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { Chip } from '@/components/Chip';
import { EmptyState } from '@/components/EmptyState';
import { PillButton } from '@/components/PillButton';
import { ScreenContainer } from '@/components/ScreenContainer';
import { colors, fontSize, spacing } from '@/constants/theme';
import { useLanguage } from '@/lib/i18n';
import { supabase } from '@/lib/supabase';
import { useLocationSelection, type LocationSelectionTarget } from '@/lib/locationSelection';
import type { District, Region, Settlement } from '@/types/database';

export default function LocationFilterScreen() {
  const { t, localize } = useLanguage();
  const { target } = useLocalSearchParams<{ target?: LocationSelectionTarget }>();
  const { setSelection } = useLocationSelection();
  const resolvedTarget: LocationSelectionTarget = target ?? 'browse';

  const [loadingRegions, setLoadingRegions] = useState(true);
  const [regions, setRegions] = useState<Region[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);

  const [regionId, setRegionId] = useState<string | null>(null);
  const [districtId, setDistrictId] = useState<string | null>(null);
  const [settlementId, setSettlementId] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from('regions')
      .select('*')
      .order('name_kk')
      .then(({ data }) => {
        setRegions(data ?? []);
        setLoadingRegions(false);
      });
  }, []);

  useEffect(() => {
    setDistrictId(null);
    setSettlementId(null);
    setSettlements([]);
    if (!regionId) {
      setDistricts([]);
      return;
    }
    supabase
      .from('districts')
      .select('*')
      .eq('region_id', regionId)
      .order('name_kk')
      .then(({ data }) => setDistricts(data ?? []));
  }, [regionId]);

  useEffect(() => {
    setSettlementId(null);
    if (!districtId) {
      setSettlements([]);
      return;
    }
    supabase
      .from('settlements')
      .select('*')
      .eq('district_id', districtId)
      .order('name_kk')
      .then(({ data }) => setSettlements(data ?? []));
  }, [districtId]);

  const handleApply = () => {
    // Аудан мен ауыл деректері әлі көп жерде толтырылмағандықтан, екеуі де міндетті емес —
    // таңдау облыс деңгейінде де жарамды болады.
    const region = regions.find((r) => r.id === regionId);
    const district = districts.find((d) => d.id === districtId);
    const settlement = settlements.find((s) => s.id === settlementId);
    setSelection(resolvedTarget, {
      regionId: region?.id ?? null,
      districtId: district?.id ?? null,
      settlementId: settlement?.id ?? null,
      label: settlement
        ? localize(settlement)
        : district
          ? localize(district)
          : region
            ? localize(region)
            : null,
    });
    router.back();
  };

  if (loadingRegions) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return (
    <ScreenContainer>
      <View style={styles.field}>
        <Text style={styles.label}>{t('locationFilter.regionLabel')}</Text>
        {regions.length === 0 ? (
          <EmptyState icon="map-outline" title={t('locationFilter.noRegions')} />
        ) : (
          <View style={styles.chipsWrap}>
            {regions.map((region) => (
              <Chip
                key={region.id}
                label={localize(region)}
                selected={regionId === region.id}
                onPress={() => setRegionId((current) => (current === region.id ? null : region.id))}
              />
            ))}
          </View>
        )}
      </View>

      {regionId && (
        <View style={styles.field}>
          <Text style={styles.label}>{t('locationFilter.districtLabel')}</Text>
          {districts.length === 0 ? (
            <EmptyState icon="map-outline" title={t('locationFilter.noDistricts')} />
          ) : (
            <View style={styles.chipsWrap}>
              {districts.map((district) => (
                <Chip
                  key={district.id}
                  label={localize(district)}
                  selected={districtId === district.id}
                  onPress={() =>
                    setDistrictId((current) => (current === district.id ? null : district.id))
                  }
                />
              ))}
            </View>
          )}
        </View>
      )}

      {districtId && settlements.length > 0 && (
        <View style={styles.field}>
          <Text style={styles.label}>{t('locationFilter.settlementLabel')}</Text>
          <View style={styles.chipsWrap}>
            {settlements.map((settlement) => (
              <Chip
                key={settlement.id}
                label={localize(settlement)}
                selected={settlementId === settlement.id}
                onPress={() =>
                  setSettlementId((current) => (current === settlement.id ? null : settlement.id))
                }
              />
            ))}
          </View>
        </View>
      )}

      <PillButton label={t('locationFilter.apply')} onPress={handleApply} />
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
  field: {
    gap: spacing.sm,
  },
  label: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
});
