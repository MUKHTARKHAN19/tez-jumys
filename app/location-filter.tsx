import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';

import { Chip } from '@/components/Chip';
import { EmptyState } from '@/components/EmptyState';
import { PillButton } from '@/components/PillButton';
import { ScreenContainer } from '@/components/ScreenContainer';
import { colors, fontSize, spacing } from '@/constants/theme';
import { PLACEHOLDER_DISTRICTS, PLACEHOLDER_REGIONS, PLACEHOLDER_SETTLEMENTS } from '@/lib/mockData';

export default function LocationFilterScreen() {
  const [regionId, setRegionId] = useState<string | null>(null);
  const [districtId, setDistrictId] = useState<string | null>(null);
  const [settlementId, setSettlementId] = useState<string | null>(null);

  const districts = PLACEHOLDER_DISTRICTS.filter((d) => d.region_id === regionId);
  const settlements = PLACEHOLDER_SETTLEMENTS.filter((s) => s.district_id === districtId);

  return (
    <ScreenContainer>
      <View style={styles.field}>
        <Text style={styles.label}>Облыс</Text>
        <View style={styles.chipsWrap}>
          {PLACEHOLDER_REGIONS.map((region) => (
            <Chip
              key={region.id}
              label={region.name_kk}
              selected={regionId === region.id}
              onPress={() => {
                setRegionId((current) => (current === region.id ? null : region.id));
                setDistrictId(null);
                setSettlementId(null);
              }}
            />
          ))}
        </View>
      </View>

      {regionId && (
        <View style={styles.field}>
          <Text style={styles.label}>Аудан</Text>
          {districts.length === 0 ? (
            <EmptyState icon="map-outline" title="Бұл облыста аудандар табылмады" />
          ) : (
            <View style={styles.chipsWrap}>
              {districts.map((district) => (
                <Chip
                  key={district.id}
                  label={district.name_kk}
                  selected={districtId === district.id}
                  onPress={() => {
                    setDistrictId((current) => (current === district.id ? null : district.id));
                    setSettlementId(null);
                  }}
                />
              ))}
            </View>
          )}
        </View>
      )}

      {districtId && (
        <View style={styles.field}>
          <Text style={styles.label}>Елді мекен</Text>
          {settlements.length === 0 ? (
            <EmptyState icon="home-outline" title="Бұл ауданда елді мекендер табылмады" />
          ) : (
            <View style={styles.chipsWrap}>
              {settlements.map((settlement) => (
                <Chip
                  key={settlement.id}
                  label={settlement.name_kk}
                  selected={settlementId === settlement.id}
                  onPress={() =>
                    setSettlementId((current) => (current === settlement.id ? null : settlement.id))
                  }
                />
              ))}
            </View>
          )}
        </View>
      )}

      <PillButton label="Қолдану" onPress={() => router.back()} />
    </ScreenContainer>
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
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
});
