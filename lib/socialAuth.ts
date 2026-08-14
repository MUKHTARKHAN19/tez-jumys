import * as AppleAuthentication from 'expo-apple-authentication';
import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from '@react-native-google-signin/google-signin';

import { supabase } from '@/lib/supabase';

const GOOGLE_WEB_CLIENT_ID =
  '893899262275-qgmf558mgduj6is6mk21ra8ebclqdlem.apps.googleusercontent.com';
const GOOGLE_IOS_CLIENT_ID =
  '893899262275-5j7o0fpjd3kggot2hb2ubao07htnth26.apps.googleusercontent.com';

GoogleSignin.configure({
  webClientId: GOOGLE_WEB_CLIENT_ID,
  iosClientId: GOOGLE_IOS_CLIENT_ID,
});

export type SocialSignInResult = {
  isNewUser: boolean;
  isPrivateRelayEmail: boolean;
};

// Supabase жаңа пайдаланушыны sub-секунд бұрын жасайды — сол сәттегі
// created_at пен қазіргі уақыт арасы аз болса, бұл алғашқы кіру деп есептейміз.
function isFreshlyCreated(createdAt?: string) {
  if (!createdAt) return false;
  return Date.now() - new Date(createdAt).getTime() < 10_000;
}

export async function signInWithApple(): Promise<SocialSignInResult | null> {
  let credential: AppleAuthentication.AppleAuthenticationCredential;
  try {
    credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });
  } catch (e: unknown) {
    if (e && typeof e === 'object' && 'code' in e && e.code === 'ERR_REQUEST_CANCELED') {
      return null;
    }
    throw e;
  }

  if (!credential.identityToken) {
    throw new Error('Apple identityToken алынбады.');
  }

  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: 'apple',
    token: credential.identityToken,
  });
  if (error) throw error;

  const isNewUser = isFreshlyCreated(data.user?.created_at);

  // Apple пайдаланушының атын ТЕК бірінші рет кіргенде қайтарады —
  // кейінгі кірулерде fullName әрқашан null болады, сондықтан осы сәтте
  // Supabase user_metadata-ға сақтап қалу керек (seeker/business профилін
  // толтырғанда пайдалану үшін).
  const fullName = [credential.fullName?.givenName, credential.fullName?.familyName]
    .filter(Boolean)
    .join(' ')
    .trim();
  if (fullName) {
    await supabase.auth.updateUser({ data: { full_name: fullName } });
  }

  const email = credential.email ?? data.user?.email ?? '';
  const isPrivateRelayEmail = !email || email.endsWith('@privaterelay.appleid.com');

  return { isNewUser, isPrivateRelayEmail };
}

export async function signInWithGoogle(): Promise<SocialSignInResult | null> {
  await GoogleSignin.hasPlayServices();

  let response;
  try {
    response = await GoogleSignin.signIn();
  } catch (e: unknown) {
    if (
      isErrorWithCode(e) &&
      (e.code === statusCodes.SIGN_IN_CANCELLED || e.code === statusCodes.IN_PROGRESS)
    ) {
      return null;
    }
    throw e;
  }

  if (!isSuccessResponse(response)) return null;

  const idToken = response.data.idToken;
  if (!idToken) throw new Error('Google idToken алынбады.');

  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: 'google',
    token: idToken,
  });
  if (error) throw error;

  return { isNewUser: isFreshlyCreated(data.user?.created_at), isPrivateRelayEmail: false };
}

export async function signOutSocial() {
  try {
    await GoogleSignin.signOut();
  } catch {
    // Google-мен кірілмеген болса да қауіпсіз — елемей өте береміз.
  }
}