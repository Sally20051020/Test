import { useUserStore } from '@/stores/userStore';
import { translations, type TranslationKey } from '@/i18n/translations';

export function useTranslation() {
  const language = useUserStore((s) => s.language);
  const t = (key: TranslationKey): string => translations[language][key];
  return { t, language };
}
