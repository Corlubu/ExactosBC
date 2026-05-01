import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTRPC } from "~/trpc/react";
import { translations, Language } from "~/i18n";

type TranslationFunction = (key: string) => string;

interface LanguageContextType {
  language: Language;
  t: TranslationFunction;
  isLoading: boolean;
  setLanguage: (language: Language) => Promise<void>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

// Función auxiliar para leer el idioma guardado y evitar el "flicker"
const getInitialLanguage = (): Language => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("assetmaster-lang") as Language;
    if (saved && (saved === "en" || saved === "es")) return saved;
  }
  return "en"; // Fallback por defecto
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const trpc = useTRPC();

  // 1. Estado local inicializado sincrónicamente para evitar parpadeos
  const [language, setLocalLanguage] = useState<Language>(getInitialLanguage());

  // 2. Consulta al backend (¡SIN el authToken en el body!)
  const companyQuery = useQuery(
    trpc.getCompanySettings.queryOptions(),
    // Nota: TanStack Query intentará hacer fetch. Si el usuario no está logueado,
    // el backend devolverá error 401 y el interceptor global lo manejará.
  );

  // Sincronizar el estado si el servidor dice que el idioma es diferente al local
  useEffect(() => {
    if (
      companyQuery.data?.defaultLanguage &&
      companyQuery.data.defaultLanguage !== language
    ) {
      setLocalLanguage(companyQuery.data.defaultLanguage as Language);
      localStorage.setItem(
        "assetmaster-lang",
        companyQuery.data.defaultLanguage,
      );
    }
  }, [companyQuery.data?.defaultLanguage]);

  // 3. Mutación para cambiar el idioma (¡SIN el authToken!)
  const updateLanguageMutation = useMutation(
    trpc.updateCompanySettings.mutationOptions({
      onSuccess: (_, variables) => {
        // Actualizamos localmente de inmediato para que la UI se sienta rápida (Optimistic Update)
        setLocalLanguage(variables.defaultLanguage as Language);
        localStorage.setItem(
          "assetmaster-lang",
          variables.defaultLanguage as Language,
        );
        void companyQuery.refetch();
      },
    }),
  );

  const setLanguage = async (newLanguage: Language) => {
    if (!companyQuery.data) return;

    await updateLanguageMutation.mutateAsync({
      name: companyQuery.data.name,
      defaultLanguage: newLanguage,
    });
  };

  // 4. Motor de traducción
  const t: TranslationFunction = (key: string) => {
    const keys = key.split(".");
    let value: any = translations[language];

    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k];
      } else {
        value = translations.en;
        for (const fallbackKey of keys) {
          if (value && typeof value === "object" && fallbackKey in value) {
            value = value[fallbackKey];
          } else {
            return key;
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
