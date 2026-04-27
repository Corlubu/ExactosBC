import { createContext, useContext, ReactNode } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTRPC } from "~/trpc/react";
import { useAuthStore } from "~/stores/auth";
import { translations, Language } from "~/i18n";

type TranslationFunction = (key: string) => string;

interface LanguageContextType {
  language: Language;
  t: TranslationFunction;
  isLoading: boolean;
  setLanguage: (language: Language) => Promise<void>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const trpc = useTRPC();
  const authToken = useAuthStore((state) => state.authToken);

  // Fetch company settings to get the default language
  const companyQuery = useQuery(
    trpc.getCompanySettings.queryOptions(
      { authToken: authToken || "" },
      { enabled: !!authToken }
    )
  );

  // Mutation to update company language
  const updateLanguageMutation = useMutation(
    trpc.updateCompanySettings.mutationOptions({
      onSuccess: () => {
        void companyQuery.refetch();
      },
    })
  );

  // Function to change language
  const setLanguage = async (newLanguage: Language) => {
    if (!authToken || !companyQuery.data) return;
    
    await updateLanguageMutation.mutateAsync({
      authToken,
      name: companyQuery.data.name,
      defaultLanguage: newLanguage,
    });
  };

  // Determine the current language (default to 'en' if not authenticated or loading)
  const language: Language = 
    (companyQuery.data?.defaultLanguage as Language) || "en";

  // Translation function
  const t: TranslationFunction = (key: string) => {
    const keys = key.split(".");
    let value: any = translations[language];

    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k];
      } else {
        // Fallback to English if translation not found
        value = translations.en;
        for (const fallbackKey of keys) {
          if (value && typeof value === "object" && fallbackKey in value) {
            value = value[fallbackKey];
          } else {
            return key; // Return key if not found in fallback
          }
        }
        break;
      }
    }

    return typeof value === "string" ? value : key;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        t,
        isLoading: companyQuery.isLoading,
        setLanguage,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
