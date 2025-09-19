import { useState, useCallback } from 'react';

interface RatingData {
  clinicId: string;
  averageRating: number;
  totalComments: number;
}

interface UseRatingReturn {
  getRating: (clinicId: string) => Promise<{ rating: number; totalComments: number }>;
  getMultipleRatings: (clinicIds: string[]) => Promise<RatingData[]>;
  isLoading: boolean;
  error: string | null;
}

export const useRating = (): UseRatingReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getRating = useCallback(async (clinicId: string): Promise<{ rating: number; totalComments: number }> => {
    try {
      setIsLoading(true);
      setError(null);

      // Only execute on client side
      if (typeof window === 'undefined') {
        return { rating: 0, totalComments: 0 };
      }

      // Buscar comentários do consultório usando fetch direto
      const response = await fetch(`https://nmxcqiwslkuvdydlsolm.supabase.co/rest/v1/comments?clinic_id=eq.${clinicId}&select=rating`, {
        method: 'GET',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5teGNxaXdzbGt1dmR5ZGxzb2xtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODE5ODc1MSwiZXhwIjoyMDczNzc0NzUxfQ.PYA1g3dYA9bMwWyj66B48g6alyl-Oi_XNEPM8oM2gJ0',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5teGNxaXdzbGt1dmR5ZGxzb2xtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODE5ODc1MSwiZXhwIjoyMDczNzc0NzUxfQ.PYA1g3dYA9bMwWyj66B48g6alyl-Oi_XNEPM8oM2gJ0',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.error('Error fetching comments for rating:', response.status, response.statusText);
        return { rating: 0, totalComments: 0 };
      }

      const comments = await response.json();
      
      if (!comments || comments.length === 0) {
        return { rating: 0, totalComments: 0 };
      }

      // Calcular média dos ratings
      const validRatings = comments.filter((comment: { rating: number }) => comment.rating && comment.rating > 0);
      
      if (validRatings.length === 0) {
        return { rating: 0, totalComments: comments.length };
      }

      const totalRating = validRatings.reduce((sum: number, comment: { rating: number }) => sum + comment.rating, 0);
      const averageRating = totalRating / validRatings.length;

      return { 
        rating: Math.round(averageRating * 10) / 10, // Arredondar para 1 casa decimal
        totalComments: comments.length 
      };

    } catch (error) {
      console.error('Error calculating rating:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
      return { rating: 0, totalComments: 0 };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getMultipleRatings = useCallback(async (clinicIds: string[]): Promise<RatingData[]> => {
    try {
      setIsLoading(true);
      setError(null);

      // Only execute on client side
      if (typeof window === 'undefined') {
        return clinicIds.map(id => ({ clinicId: id, averageRating: 0, totalComments: 0 }));
      }

      // Buscar comentários de múltiplos consultórios
      const clinicIdsParam = clinicIds.map(id => `clinic_id=eq.${id}`).join(',');
      const url = `https://nmxcqiwslkuvdydlsolm.supabase.co/rest/v1/comments?clinic_id=in.(${clinicIdsParam})&select=clinic_id,rating`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5teGNxaXdzbGt1dmR5ZGxzb2xtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODE5ODc1MSwiZXhwIjoyMDczNzc0NzUxfQ.PYA1g3dYA9bMwWyj66B48g6alyl-Oi_XNEPM8oM2gJ0',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5teGNxaXdzbGt1dmR5ZGxzb2xtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODE5ODc1MSwiZXhwIjoyMDczNzc0NzUxfQ.PYA1g3dYA9bMwWyj66B48g6alyl-Oi_XNEPM8oM2gJ0',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.error('Error fetching multiple ratings:', response.status, response.statusText);
        return clinicIds.map(id => ({ clinicId: id, averageRating: 0, totalComments: 0 }));
      }

      const comments = await response.json();
      
      // Agrupar comentários por clinic_id e calcular médias
      const ratingsMap = new Map<string, { ratings: number[]; totalComments: number }>();
      
      comments.forEach((comment: { clinic_id: string; rating: number }) => {
        const clinicId = comment.clinic_id;
        
        if (!ratingsMap.has(clinicId)) {
          ratingsMap.set(clinicId, { ratings: [], totalComments: 0 });
        }
        
        const clinicData = ratingsMap.get(clinicId)!;
        clinicData.totalComments++;
        
        if (comment.rating && comment.rating > 0) {
          clinicData.ratings.push(comment.rating);
        }
      });

      // Calcular médias e retornar dados
      const results: RatingData[] = clinicIds.map(clinicId => {
        const clinicData = ratingsMap.get(clinicId);
        
        if (!clinicData || clinicData.ratings.length === 0) {
          return { clinicId, averageRating: 0, totalComments: clinicData?.totalComments || 0 };
        }

        const totalRating = clinicData.ratings.reduce((sum, rating) => sum + rating, 0);
        const averageRating = totalRating / clinicData.ratings.length;
        
        return {
          clinicId,
          averageRating: Math.round(averageRating * 10) / 10, // Arredondar para 1 casa decimal
          totalComments: clinicData.totalComments
        };
      });

      return results;

    } catch (error) {
      console.error('Error calculating multiple ratings:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
      return clinicIds.map(id => ({ clinicId: id, averageRating: 0, totalComments: 0 }));
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    getRating,
    getMultipleRatings,
    isLoading,
    error
  };
};
