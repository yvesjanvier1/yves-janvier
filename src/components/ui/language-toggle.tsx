
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage, Language } from "@/contexts/LanguageContext";

const languages = [
  { code: 'fr' as Language, name: 'Français', flag: '🇫🇷', shortName: 'FR' },
  { code: 'en' as Language, name: 'English', flag: '🇺🇸', shortName: 'EN' },
  { code: 'ht' as Language, name: 'Kreyòl', flag: '🇭🇹', shortName: 'HT' }
];

export const LanguageToggle = () => {
  const { language, setLanguage } = useLanguage();
  
  const currentLanguage = languages.find(lang => lang.code === language);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className="gap-2 font-medium"
          aria-label="Change language"
        >
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{currentLanguage?.flag}</span>
          <span className="text-sm font-medium">{currentLanguage?.shortName}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="min-w-[140px] bg-background/95 backdrop-blur-sm border border-border/50 shadow-lg"
      >
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={`cursor-pointer transition-colors ${
              language === lang.code 
                ? "bg-primary/10 text-primary font-medium" 
                : "hover:bg-muted"
            }`}
          >
            <span className="mr-3 text-base">{lang.flag}</span>
            <span className="flex-1">{lang.name}</span>
            {language === lang.code && (
              <span className="ml-2 text-xs text-primary">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
