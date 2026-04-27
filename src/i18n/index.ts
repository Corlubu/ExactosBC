import { en } from "./translations/en";
import { es } from "./translations/es";

export const translations = {
  en,
  es,
} as const;

export type Language = keyof typeof translations;
export type TranslationKeys = typeof en;

export { en, es };
