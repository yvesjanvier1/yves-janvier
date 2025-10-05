import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Globe } from "lucide-react";

interface LanguageSelectorProps {
  onComplete: () => void;
}

export const LanguageSelector = ({ onComplete }: LanguageSelectorProps) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load Google Translate widget script
    const script = document.createElement("script");
    script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    document.body.appendChild(script);

    // Initialize Google Translate
    (window as any).googleTranslateElementInit = () => {
      new (window as any).google.translate.TranslateElement(
        {
          pageLanguage: "fr",
          includedLanguages: "en,fr,ht,es,pt,de,it",
          layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false,
        },
        "google_translate_element"
      );
      setIsLoading(false);
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleContinue = () => {
    localStorage.setItem("languageChosen", "true");
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
      <Card className="w-full max-w-lg p-8 mx-4">
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Globe className="h-8 w-8 text-primary" />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Bienvenue / Welcome</h1>
            <p className="text-muted-foreground">
              Ce site est en français. Utilisez le widget ci-dessous pour traduire dans votre langue.
            </p>
            <p className="text-sm text-muted-foreground">
              This site is in French. Use the widget below to translate to your language.
            </p>
          </div>

          <div className="w-full py-4">
            {isLoading ? (
              <div className="text-center text-muted-foreground">Chargement du traducteur...</div>
            ) : (
              <div id="google_translate_element" className="flex justify-center"></div>
            )}
          </div>

          <Button onClick={handleContinue} size="lg" className="w-full">
            Continuer / Continue
          </Button>

          <p className="text-xs text-muted-foreground">
            Vous pouvez toujours changer la langue depuis la barre de navigation.
            <br />
            You can always change the language from the navigation bar.
          </p>
        </div>
      </Card>
    </div>
  );
};
