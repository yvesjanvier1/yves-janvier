// src/hooks/useStaticMultilingualData.tsx
import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

interface StaticDataResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export const useStaticMultilingualData = <T,>(filename: string): StaticDataResult<T> => {
  const { currentLanguage } = useLanguage();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        // Construct the URL: /locales/fr/navbar.json
        const url = `/locales/${currentLanguage}/${filename}.json`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Failed to load ${filename}.json (status: ${response.status})`);
        }

        const jsonData = await response.json();
        setData(jsonData);
      } catch (err) {
        setError(err as Error);
        console.error(`Error loading static multilingual data for "${filename}":`, err);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [filename, currentLanguage]);

  return { data, loading, error };
};