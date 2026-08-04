import * as Sentry from '@sentry/react-native';

const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;

// DSN .env-де толтырылмаса, Sentry үнсіз өшіп қалады — қосымша қалыпты жұмыс
// істей береді (sentry.io-да тіркеліп, DSN алғаннан кейін толтырыңыз).
if (dsn) {
  Sentry.init({
    dsn,
    sendDefaultPii: false,
    tracesSampleRate: 0.2,
  });
}

export { Sentry };
