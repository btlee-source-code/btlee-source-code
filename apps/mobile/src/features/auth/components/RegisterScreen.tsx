import { useRouter } from 'expo-router';
import { ArrowRight, Check } from 'lucide-react-native';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { S } from '@/config/strings';
import { OnboardingSheet } from '@/features/account/components/OnboardingSheet';
import { useThemeColors } from '@/features/theme/hooks/useTheme';
import { HttpError } from '@/shared/api/httpClient';
import { Logo } from '@/shared/components/layout/Logo';
import { PressableScale } from '@/shared/components/ui/PressableScale';
import { TextField } from '@/shared/components/ui/TextField';
import { GoogleSignInButton } from './GoogleSignInButton';
import { useAuth } from '../hooks/useAuth';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EG_PHONE_RE = /^01[0125][0-9]{8}$/;

type Errors = Partial<Record<'name' | 'email' | 'phone' | 'password' | 'form', string>>;

export function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();
  const c = useThemeColors();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const validate = (): boolean => {
    const e: Errors = {};
    if (name.trim().length < 2) e.name = S.required;
    if (!EMAIL_RE.test(email.trim())) e.email = S.invalidEmail;
    if (!EG_PHONE_RE.test(phone.trim())) e.phone = S.invalidPhone;
    if (password.length < 8) e.password = S.passwordMin;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async () => {
    if (!agreed) {
      setErrors({ form: S.mustAcceptTerms });
      return;
    }
    if (!validate()) return;
    setSubmitting(true);
    setErrors({});
    try {
      await register({ name: name.trim(), email: email.trim(), phone: phone.trim(), password });
      setShowOnboarding(true);
    } catch (err) {
      const e = err as HttpError;
      setErrors({ form: e.message || S.genericError });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerClassName="px-6 pt-2 pb-8 flex-grow" keyboardShouldPersistTaps="handled">
          <Pressable
            onPress={() => router.back()}
            hitSlop={8}
            className="h-10 w-10 rounded-full border border-border bg-card items-center justify-center active:bg-secondary">
            <ArrowRight size={20} color={c.foreground} />
          </Pressable>

          {/* Brand — logo on a soft blob with playful dots */}
          <View className="items-center mt-4 mb-6">
            <View className="px-8 py-6 rounded-[32px] bg-primary/5">
              <Logo height={34} />
            </View>
            <View className="absolute top-1 right-[26%] h-3 w-3 rounded-full bg-accent/60" />
            <View className="absolute bottom-0 left-[24%] h-2 w-2 rounded-full bg-primary/30" />
          </View>

          <Text className="text-[24px] font-cairo-bold text-foreground text-right">{S.registerTitle}</Text>
          <Text className="text-sm text-muted-foreground font-cairo text-right mb-6">{S.registerSubtitle}</Text>

          <GoogleSignInButton
            onSuccess={(isNewUser) => (isNewUser ? setShowOnboarding(true) : router.back())}
            blocked={!agreed}
            onBlockedPress={() => setErrors({ form: S.mustAcceptTerms })}
          />

          <View className="gap-4">
            <TextField label={S.nameLabel} value={name} onChangeText={setName} error={errors.name} />
            <TextField
              label={S.emailLabel}
              value={email}
              onChangeText={setEmail}
              error={errors.email}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <TextField
              label={S.phoneLabel}
              value={phone}
              onChangeText={setPhone}
              error={errors.phone}
              keyboardType="phone-pad"
              placeholder="01xxxxxxxxx"
            />
            <TextField
              label={S.passwordLabel}
              value={password}
              onChangeText={setPassword}
              error={errors.password}
              secureTextEntry
              autoCapitalize="none"
            />

            {/* Terms & conditions agreement — required to create an account. */}
            <View className="flex-row items-start gap-2.5 mt-1">
              <Text className="flex-1 text-[13px] font-cairo text-muted-foreground text-right leading-5">
                {S.agreePrefix}
                <Text
                  className="text-primary font-cairo-semibold"
                  onPress={() => router.push('/legal/disclaimer')}>
                  {S.termsLink}
                </Text>
                {` ${S.andWord} `}
                <Text
                  className="text-primary font-cairo-semibold"
                  onPress={() => router.push('/legal/privacy')}>
                  {S.privacyTitle}
                </Text>
              </Text>
              <Pressable onPress={() => setAgreed((v) => !v)} hitSlop={10} className="mt-0.5">
                <View
                  className={`h-5 w-5 rounded-md border-2 items-center justify-center ${
                    agreed ? 'bg-primary border-primary' : 'border-border bg-card'
                  }`}>
                  {agreed ? <Check size={13} color={c.primaryForeground} strokeWidth={3} /> : null}
                </View>
              </Pressable>
            </View>

            {errors.form ? (
              <View className="bg-destructive/10 rounded-xl px-3 py-2.5">
                <Text className="text-destructive text-sm font-cairo text-right">{errors.form}</Text>
              </View>
            ) : null}

            <PressableScale
              haptic
              onPress={onSubmit}
              disabled={submitting}
              containerClassName="mt-1"
              className={`bg-primary rounded-full h-14 items-center justify-center ${agreed ? '' : 'opacity-60'}`}>
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-primary-foreground font-cairo-bold text-base">{S.createAccountBtn}</Text>
              )}
            </PressableScale>

            <View className="flex-row items-center justify-center gap-1 mt-2">
              <Pressable onPress={() => router.replace('/login')} hitSlop={8}>
                <Text className="text-primary font-cairo-semibold text-sm">{S.signInBtn}</Text>
              </Pressable>
              <Text className="text-muted-foreground font-cairo text-sm">{S.hasAccount}</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <OnboardingSheet visible={showOnboarding} onComplete={() => router.replace('/')} />
    </SafeAreaView>
  );
}
