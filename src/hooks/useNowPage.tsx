
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface NowPageData {
  id?: string;
  workingOn: string[];
  currentlyLearning: string[];
  usingRightNow: string[];
  listeningTo: string[];
  lastUpdated: string;
}

export const useNowPage = () => {
  const [data, setData] = useState<NowPageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNowPageData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: nowData, error } = await supabase
        .from('now_page')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (nowData) {
        setData({
          id: nowData.id,
          workingOn: nowData.working_on || [],
          currentlyLearning: nowData.currently_learning || [],
          usingRightNow: nowData.using_right_now || [],
          listeningTo: nowData.listening_to || [],
          lastUpdated: nowData.last_updated,
        });
      } else {
        // No data exists yet, use default values
        setData({
          workingOn: ["🚀 Building an AI-powered portfolio analytics dashboard"],
          currentlyLearning: ["🧠 Advanced TypeScript patterns and utility types"],
          usingRightNow: ["💻 MacBook Pro M2 with dual 4K monitors"],
          listeningTo: ["🎵 Synthwave playlists for deep coding sessions"],
          lastUpdated: new Date().toISOString().split('T')[0],
        });
      }
    } catch (error) {
      console.error('Error fetching now page data:', error);
      setError('Failed to load now page data');
      toast.error('Failed to load now page data');
    } finally {
      setIsLoading(false);
    }
  };

  const saveNowPageData = async (newData: Omit<NowPageData, 'id'>) => {
    try {
      setIsLoading(true);
      setError(null);

      const dataToSave = {
        working_on: newData.workingOn,
        currently_learning: newData.currentlyLearning,
        using_right_now: newData.usingRightNow,
        listening_to: newData.listeningTo,
        last_updated: newData.lastUpdated,
      };

      if (data?.id) {
        // Update existing record
        const { error } = await supabase
          .from('now_page')
          .update(dataToSave)
          .eq('id', data.id);

        if (error) throw error;
      } else {
        // Insert new record
        const { error } = await supabase
          .from('now_page')
          .insert(dataToSave);

        if (error) throw error;
      }

      toast.success('Now page updated successfully!');
      await fetchNowPageData(); // Refresh data
      return true;
    } catch (error) {
      console.error('Error saving now page data:', error);
      setError('Failed to save now page data');
      toast.error('Failed to save now page data');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNowPageData();
  }, []);

  return {
    data,
    isLoading,
    error,
    saveNowPageData,
    refetch: fetchNowPageData,
  };
};
