import { useState, useEffect, useCallback } from 'react';
import { useRating } from './useRating';

interface ClinicWithRating {
  id: string;
  rating: number;
  totalComments: number;
}

interface UseClinicRatingsReturn {
  getClinicRating: (clinicId: string) => number;
  getClinicTotalComments: (clinicId: string) => number;
  isLoading: boolean;
  error: string | null;
  refreshRatings: () => void;
}

export const useClinicRatings = (clinicIds: string[]): UseClinicRatingsReturn => {
  const [ratings, setRatings] = useState<Map<string, ClinicWithRating>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getMultipleRatings } = useRating();

  const loadRatings = useCallback(async () => {
    if (clinicIds.length === 0) return;

    try {
      setIsLoading(true);
      setError(null);

      const ratingsData = await getMultipleRatings(clinicIds);
      
      const newRatingsMap = new Map<string, ClinicWithRating>();
      ratingsData.forEach(data => {
        newRatingsMap.set(data.clinicId, {
          id: data.clinicId,
          rating: data.averageRating,
          totalComments: data.totalComments
        });
      });

      setRatings(newRatingsMap);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [clinicIds, getMultipleRatings]);

  useEffect(() => {
    loadRatings();
  }, [loadRatings]);

  const getClinicRating = useCallback((clinicId: string): number => {
    return ratings.get(clinicId)?.rating || 0;
  }, [ratings]);

  const getClinicTotalComments = useCallback((clinicId: string): number => {
    return ratings.get(clinicId)?.totalComments || 0;
  }, [ratings]);

  const refreshRatings = useCallback(() => {
    loadRatings();
  }, [loadRatings]);

  return {
    getClinicRating,
    getClinicTotalComments,
    isLoading,
    error,
    refreshRatings
  };
};
