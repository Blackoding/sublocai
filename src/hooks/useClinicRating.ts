import { useState, useEffect } from 'react';
import { useRating } from './useRating';

export const useClinicRating = (clinicId: string | undefined) => {
  const [rating, setRating] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { getRating } = useRating();

  useEffect(() => {
    const loadRating = async () => {
      if (clinicId) {
        try {
          setIsLoading(true);
          const ratingData = await getRating(clinicId);
          setRating(ratingData.rating);
        } catch (error) {
          console.error('Erro ao carregar rating:', error);
          setRating(0);
        } finally {
          setIsLoading(false);
        }
      } else {
        setRating(0);
        setIsLoading(false);
      }
    };
    
    loadRating();
  }, [clinicId, getRating]);

  return {
    rating,
    isLoading
  };
};
