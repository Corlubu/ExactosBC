import { Globe } from "lucide-react";
import { useLanguage } from "~/contexts/LanguageContext";
import { Language } from "~/i18n";

export function LanguageSelector() {
  const { language, setLanguage, t } = useLanguage();

  const handleLanguageChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = event.target.value as Language;
    try {
      await setLanguage(newLanguage);
    } catch (error) {
      console.error("Failed to change language:", error);
    }
  };

  return (
    <div className="flex items-center space-x-2 px-4 py-2">
      <Globe className="w-4 h-4 text-gray-500" />
      <select
        value={language}
        onChange={handleLanguageChange}
        className="text-sm border-none bg-transparent text-gray-700 focus:ring-0 focus:outline-none cursor-pointer"
      >
        <option value="en">{t("languages.en")}</option>
        <option value="es">{t("languages.es")}</option>
      </select>
    </div>
  );
}
