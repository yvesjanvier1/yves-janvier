
import { useState, useEffect } from 'react';
import { nowService } from '@/services/now.service';
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

      const nowData = await nowService.getLatest();


      if (nowData) {
        setData({
          id: nowData.id,
          workingOn: Array.isArray(nowData.working_on) ? nowData.working_on as string[] : [],
          currentlyLearning: Array.isArray(nowData.currently_learning) ? nowData.currently_learning as string[] : [],
          usingRightNow: Array.isArray(nowData.using_right_now) ? nowData.using_right_now as string[] : [],
          listeningTo: Array.isArray(nowData.listening_to) ? nowData.listening_to as string[] : [],
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
        await nowService.update(data.id, dataToSave);
      } else {
        await nowService.insert(dataToSave);
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
