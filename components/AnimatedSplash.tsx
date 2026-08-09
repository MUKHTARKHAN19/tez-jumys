import { Dimensions, StyleSheet } from 'react-native';
import { useEffect } from 'react';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

// Glovo тәрізді суық қосылу анимациясы: native splash (app.json) жасырылғаннан
// кейін бірден осы overlay көрсетіліп, ~1.6 секундтан соң өзі жоғалады.
// Астындағы қосымша (провайдерлер, сессия/тіл жүктеу) осы уақытта параллель
// жұмыс істей береді — тек экранда көрінбей тұр.
// Жазу (Tez Jumys) бөлек емес — assets/splash-icon.png суретінің ішінде бар.
const SPLASH_BACKGROUND = '#101018';
const LOGO_WIDTH = Dimensions.get('window').width * 0.58;

const HOLD_UNTIL_MS = 1200;
const FADE_OUT_MS = 400;

type AnimatedSplashProps = {
  onFinish: () => void;
};

export function AnimatedSplash({ onFinish }: AnimatedSplashProps) {
  const logoScale = useSharedValue(0.8);
  const logoOpacity = useSharedValue(0);
  const overlayOpacity = useSharedValue(1);

  useEffect(() => {
    // Логотип: көмескі/кішкене күйден spring-пен қалыпты өлшемге шығады.
    logoScale.value = withSpring(1, { damping: 12, stiffness: 140, mass: 0.6 });
    logoOpacity.value = withSequence(
      withTiming(1, { duration: 350, easing: Easing.out(Easing.quad) }),
      // Жеңіл pulse — "жылт ету" әсері.
      withDelay(
        150,
        withRepeat(
          withSequence(withTiming(0.7, { duration: 150 }), withTiming(1, { duration: 150 })),
          2,
          false
        )
      )
    );

    // Барлығы тыныш көрсетілгеннен кейін overlay fade-out болып, астындағы
    // қосымша ашылады.
    overlayOpacity.value = withDelay(
      HOLD_UNTIL_MS,
      withTiming(0, { duration: FADE_OUT_MS }, (finished) => {
        if (finished) runOnJS(onFinish)();
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const overlayStyle = useAnimatedStyle(() => ({ opacity: overlayOpacity.value }));
  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  return (
    <Animated.View style={[styles.overlay, overlayStyle]} pointerEvents="none">
      <Animated.Image
        source={require('../assets/splash-icon.png')}
        style={[styles.logo, logoStyle]}
        resizeMode="contain"
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: SPLASH_BACKGROUND,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  logo: {
    width: LOGO_WIDTH,
    height: LOGO_WIDTH,
  },
});
