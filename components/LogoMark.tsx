import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '@/constants/theme';

type LogoMarkProps = {
  size?: number;
};

export function LogoMark({ size = 40 }: LogoMarkProps) {
  return (
    <View
      style={[
        styles.square,
        {
          width: size,
          height: size,
          borderRadius: size * 0.28,
        },
      ]}>
      <Ionicons name="location-sharp" size={size * 0.56} color={colors.white} />
    </View>
  );
}

const styles = StyleSheet.create({
  square: {
    backgroundColor: colors.logoBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
