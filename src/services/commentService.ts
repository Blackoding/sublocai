import { useCallback, useState } from 'react';
import type { Comment, CommentFormData } from '@/types';

export interface CommentResponse {
  success: boolean;
  comment?: Comment;
  comments?: Comment[];
  error?: string;
}

type ApiError = {
  error?: string;
};

type GetCommentsApiResponse = {
  comments?: Comment[];
} & ApiError;

type AddCommentApiResponse = {
  comment?: Comment;
} & ApiError;

type DeleteCommentApiResponse = {
  success?: boolean;
} & ApiError;

type HasUserCommentedApiResponse = {
  comment?: Comment | null;
} & ApiError;

const fetchJson = async <T,>(url: string, options: RequestInit): Promise<T> => {
  const response = await fetch(url, options);
  const json = (await response.json()) as T;
  if (!response.ok) {
    const message = (json as unknown as ApiError).error || 'Request failed';
    throw new Error(message);
  }
  return json;
};

export const useCommentService = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const getCommentsByClinic = useCallback(async (clinicId: string): Promise<CommentResponse> => {
    setIsLoading(true);
    setError(null);
    try {
      const json = await fetchJson<GetCommentsApiResponse>('/api/comments/by-clinic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ clinicId })
      });

      return { success: true, comments: json.comments || [] };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar comentários';
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addComment = useCallback(
    async (clinicId: string, userId: string, data: CommentFormData): Promise<CommentResponse> => {
      setIsLoading(true);
      setError(null);
      try {
        if (typeof data.rating !== 'number') {
          return { success: false, error: 'Avaliação inválida' };
        }

        const json = await fetchJson<AddCommentApiResponse>('/api/comments/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            clinicId,
            userId,
            data
          })
        });

        if (!json.comment) {
          return { success: false, error: json.error || 'Erro ao publicar comentário' };
        }

        return { success: true, comment: json.comment };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro ao publicar comentário';
        setError(message);
        return { success: false, error: message };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const deleteComment = useCallback(
    async (commentId: string, userId: string): Promise<CommentResponse> => {
      setIsLoading(true);
      setError(null);
      try {
        const json = await fetchJson<DeleteCommentApiResponse>('/api/comments/delete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            commentId,
            userId
          })
        });

        if (!json.success) {
          return { success: false, error: json.error || 'Erro ao excluir comentário' };
        }

        return { success: true };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro ao excluir comentário';
        setError(message);
        return { success: false, error: message };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const hasUserCommented = useCallback(
    async (clinicId: string, userId: string): Promise<CommentResponse> => {
      setIsLoading(true);
      setError(null);
      try {
        const json = await fetchJson<HasUserCommentedApiResponse>('/api/comments/has', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            clinicId,
            userId
          })
        });

        return { success: true, comment: json.comment === null ? undefined : (json.comment as Comment) };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro ao verificar comentário';
        setError(message);
        return { success: false, error: message };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    getCommentsByClinic,
    addComment,
    deleteComment,
    hasUserCommented,
    clearError,
    isLoading,
    error
  };
};

