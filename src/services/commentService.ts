import { useState, useCallback } from 'react';
import { getSupabaseClient } from './supabase';
import { Comment, CommentFormData } from '@/types';

export interface CommentResponse {
  success: boolean;
  comment?: Comment;
  comments?: Comment[];
  error?: string;
}

// Função auxiliar para buscar dados do usuário usando fetch direto
const getUserData = async (userId: string) => {
  try {
    const response = await fetch(`https://nmxcqiwslkuvdydlsolm.supabase.co/rest/v1/users?id=eq.${userId}&select=id,full_name,avatar`, {
      method: 'GET',
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5teGNxaXdzbGt1dmR5ZGxzb2xtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODE5ODc1MSwiZXhwIjoyMDczNzc0NzUxfQ.PYA1g3dYA9bMwWyj66B48g6alyl-Oi_XNEPM8oM2gJ0',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5teGNxaXdzbGt1dmR5ZGxzb2xtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODE5ODc1MSwiZXhwIjoyMDczNzc0NzUxfQ.PYA1g3dYA9bMwWyj66B48g6alyl-Oi_XNEPM8oM2gJ0',
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      return { full_name: 'Usuário Desconhecido', avatar: undefined };
    }

    const users = await response.json();
    const data = users[0];

    if (!data) {
      return { full_name: 'Usuário Desconhecido', avatar: undefined };
    }

    return { full_name: data.full_name, avatar: data.avatar };
    } catch {
    // console.error('Erro ao buscar dados do usuário:', error);
    return { full_name: 'Usuário Desconhecido', avatar: undefined };
  }
};

// Hook para gerenciar comentários
export const useCommentService = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCommentsByClinic = useCallback(async (clinicId: string): Promise<CommentResponse> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get comments using fetch direto
      const commentsResponse = await fetch(`https://nmxcqiwslkuvdydlsolm.supabase.co/rest/v1/comments?clinic_id=eq.${clinicId}&select=*&order=created_at.desc`, {
        method: 'GET',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5teGNxaXdzbGt1dmR5ZGxzb2xtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODE5ODc1MSwiZXhwIjoyMDczNzc0NzUxfQ.PYA1g3dYA9bMwWyj66B48g6alyl-Oi_XNEPM8oM2gJ0',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5teGNxaXdzbGt1dmR5ZGxzb2xtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODE5ODc1MSwiZXhwIjoyMDczNzc0NzUxfQ.PYA1g3dYA9bMwWyj66B48g6alyl-Oi_XNEPM8oM2gJ0',
          'Content-Type': 'application/json'
        }
      });

      if (!commentsResponse.ok) {
        const errorData = await commentsResponse.json();
        setError(errorData.message || 'Failed to fetch comments');
        return { success: false, error: errorData.message || 'Failed to fetch comments' };
      }

      const data = await commentsResponse.json();

      // Formatar os dados para incluir informações do usuário
      const formattedComments: Comment[] = await Promise.all(
        data.map(async (comment: { user_id: string; [key: string]: unknown }) => {
          const userData = await getUserData(comment.user_id);
          return {
            id: comment.id,
            clinic_id: comment.clinic_id,
            user_id: comment.user_id,
            user_name: userData.full_name,
            user_avatar: userData.avatar,
            content: comment.content,
            rating: comment.rating,
            created_at: comment.created_at,
            updated_at: comment.updated_at
          };
        })
      );

      return { success: true, comments: formattedComments };
    } catch {
      // console.error('Erro inesperado ao buscar comentários:', error);
      const errorMessage = 'Erro inesperado';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addComment = useCallback(async (
    clinicId: string,
    userId: string,
    commentData: CommentFormData
  ): Promise<CommentResponse> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Verificar se o usuário já comentou neste consultório usando fetch direto
      const existingResponse = await fetch(`https://nmxcqiwslkuvdydlsolm.supabase.co/rest/v1/comments?clinic_id=eq.${clinicId}&user_id=eq.${userId}&select=id`, {
        method: 'GET',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5teGNxaXdzbGt1dmR5ZGxzb2xtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODE5ODc1MSwiZXhwIjoyMDczNzc0NzUxfQ.PYA1g3dYA9bMwWyj66B48g6alyl-Oi_XNEPM8oM2gJ0',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5teGNxaXdzbGt1dmR5ZGxzb2xtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODE5ODc1MSwiZXhwIjoyMDczNzc0NzUxfQ.PYA1g3dYA9bMwWyj66B48g6alyl-Oi_XNEPM8oM2gJ0',
          'Content-Type': 'application/json'
        }
      });

      if (existingResponse.ok) {
        const existingData = await existingResponse.json();
        if (existingData && existingData.length > 0) {
          const errorMessage = 'Você já comentou neste consultório. Você pode editar seu comentário existente.';
          setError(errorMessage);
          return { success: false, error: errorMessage };
        }
      }

      // Validar dados antes de inserir
      const commentPayload = {
        clinic_id: clinicId,
        user_id: userId,
        content: commentData.content?.trim() || '',
        rating: commentData.rating ? Number(commentData.rating) : null
      };


      // Validar se o conteúdo não está vazio
      if (!commentPayload.content || commentPayload.content.length === 0) {
        const errorMessage = 'O conteúdo do comentário não pode estar vazio';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }

      // Validar se o conteúdo tem pelo menos 10 caracteres
      if (commentPayload.content.length < 10) {
        const errorMessage = 'O comentário deve ter pelo menos 10 caracteres';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }

      // Validar se o conteúdo não excede 500 caracteres
      if (commentPayload.content.length > 500) {
        const errorMessage = 'O comentário não pode exceder 500 caracteres';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }

      // Validar se o rating foi fornecido
      if (!commentPayload.rating) {
        const errorMessage = 'A avaliação é obrigatória';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }

      // Validar se o rating está no range correto (1-5)
      if (commentPayload.rating < 1 || commentPayload.rating > 5) {
        const errorMessage = 'A avaliação deve estar entre 1 e 5 estrelas';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }

      // Validar se o rating é um número inteiro
      if (!Number.isInteger(commentPayload.rating)) {
        const errorMessage = 'A avaliação deve ser um número inteiro';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }

      // Validar se os IDs são strings válidas
      if (!commentPayload.clinic_id || typeof commentPayload.clinic_id !== 'string') {
        const errorMessage = 'ID do consultório inválido';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }

      if (!commentPayload.user_id || typeof commentPayload.user_id !== 'string') {
        const errorMessage = 'ID do usuário inválido';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }

      // Validar formato UUID (mais flexível)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(commentPayload.clinic_id)) {
        const errorMessage = 'Formato do ID do consultório inválido';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }

      if (!uuidRegex.test(commentPayload.user_id)) {
        const errorMessage = 'Formato do ID do usuário inválido';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }

      // Inserir novo comentário usando fetch direto
      const jsonPayload = JSON.stringify(commentPayload);
      
      const insertResponse = await fetch('https://nmxcqiwslkuvdydlsolm.supabase.co/rest/v1/comments?select=*', {
        method: 'POST',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5teGNxaXdzbGt1dmR5ZGxzb2xtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODE5ODc1MSwiZXhwIjoyMDczNzc0NzUxfQ.PYA1g3dYA9bMwWyj66B48g6alyl-Oi_XNEPM8oM2gJ0',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5teGNxaXdzbGt1dmR5ZGxzb2xtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODE5ODc1MSwiZXhwIjoyMDczNzc0NzUxfQ.PYA1g3dYA9bMwWyj66B48g6alyl-Oi_XNEPM8oM2gJ0',
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: jsonPayload
      });

      if (!insertResponse.ok) {
        let errorData;
        try {
          errorData = await insertResponse.json();
        } catch {
          setError('Erro ao processar resposta do servidor');
          return { success: false, error: 'Erro ao processar resposta do servidor' };
        }
        
        let errorMessage = 'Erro ao adicionar comentário';
        
        if (errorData.message) {
          if (errorData.message.includes('comments_content_check')) {
            errorMessage = 'O conteúdo do comentário não atende aos requisitos. Verifique se não está vazio e tem pelo menos 10 caracteres.';
          } else if (errorData.message.includes('rating')) {
            errorMessage = 'A avaliação deve ser um número entre 1 e 5.';
          } else if (errorData.message.includes('pattern')) {
            errorMessage = 'Formato de dados inválido. Verifique se todos os campos estão corretos.';
          } else {
            errorMessage = errorData.message;
          }
        }
        
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }

      console.log('CommentService - Requisição bem-sucedida, processando resposta...');
      
      // Primeiro, vamos ver o que está sendo retornado como texto
      const responseText = await insertResponse.text();
      console.log('CommentService - Resposta em texto:', responseText);
      
      let dataArray;
      try {
        dataArray = JSON.parse(responseText);
        console.log('CommentService - Resposta da inserção:', dataArray);
      } catch {
        console.error('CommentService - Erro ao parsear resposta JSON');
        console.error('CommentService - Resposta em texto que causou erro:', responseText);
        setError('Erro ao processar resposta do servidor');
        return { success: false, error: 'Erro ao processar resposta do servidor' };
      }
      
      const data = dataArray[0];
      console.log('CommentService - Dados extraídos:', data);

      if (!data) {
        console.error('CommentService - Nenhum dado retornado na resposta');
        setError('Comment not created');
        return { success: false, error: 'Comment not created' };
      }

      // Buscar dados do usuário para formatar o comentário
      console.log('CommentService - Buscando dados do usuário para:', data.user_id);
      const userData = await getUserData(data.user_id);
      console.log('CommentService - Dados do usuário obtidos:', userData);

      // Formatar o comentário retornado
      const formattedComment: Comment = {
        id: data.id,
        clinic_id: data.clinic_id,
        user_id: data.user_id,
        user_name: userData.full_name,
        user_avatar: userData.avatar,
        content: data.content,
        rating: data.rating,
        created_at: data.created_at,
        updated_at: data.updated_at
      };

      console.log('CommentService - Comentário formatado:', formattedComment);
      console.log('CommentService - Retornando sucesso');
      return { success: true, comment: formattedComment };
    } catch {
      // console.error('Erro inesperado ao adicionar comentário:', error);
      const errorMessage = 'Erro inesperado';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateComment = useCallback(async (
    commentId: string,
    userId: string,
    commentData: CommentFormData
  ): Promise<CommentResponse> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Verificar se o comentário pertence ao usuário usando fetch direto
      const existingResponse = await fetch(`https://nmxcqiwslkuvdydlsolm.supabase.co/rest/v1/comments?id=eq.${commentId}&select=user_id`, {
        method: 'GET',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5teGNxaXdzbGt1dmR5ZGxzb2xtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODE5ODc1MSwiZXhwIjoyMDczNzc0NzUxfQ.PYA1g3dYA9bMwWyj66B48g6alyl-Oi_XNEPM8oM2gJ0',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5teGNxaXdzbGt1dmR5ZGxzb2xtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODE5ODc1MSwiZXhwIjoyMDczNzc0NzUxfQ.PYA1g3dYA9bMwWyj66B48g6alyl-Oi_XNEPM8oM2gJ0',
          'Content-Type': 'application/json'
        }
      });

      if (!existingResponse.ok) {
        const errorMessage = 'Comentário não encontrado';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }

      const existingData = await existingResponse.json();
      const existingComment = existingData[0];

      if (!existingComment) {
        const errorMessage = 'Comentário não encontrado';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }

      if (existingComment.user_id !== userId) {
        const errorMessage = 'Você não tem permissão para editar este comentário';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }

      // Atualizar o comentário usando fetch direto
      const updateResponse = await fetch(`https://nmxcqiwslkuvdydlsolm.supabase.co/rest/v1/comments?id=eq.${commentId}`, {
        method: 'PATCH',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5teGNxaXdzbGt1dmR5ZGxzb2xtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODE5ODc1MSwiZXhwIjoyMDczNzc0NzUxfQ.PYA1g3dYA9bMwWyj66B48g6alyl-Oi_XNEPM8oM2gJ0',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5teGNxaXdzbGt1dmR5ZGxzb2xtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODE5ODc1MSwiZXhwIjoyMDczNzc0NzUxfQ.PYA1g3dYA9bMwWyj66B48g6alyl-Oi_XNEPM8oM2gJ0',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: commentData.content,
          rating: commentData.rating || null,
          updated_at: new Date().toISOString()
        })
      });

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        setError(errorData.message || 'Failed to update comment');
        return { success: false, error: errorData.message || 'Failed to update comment' };
      }

      const dataArray = await updateResponse.json();
      const data = dataArray[0];

      if (!data) {
        setError('Comment not found after update');
        return { success: false, error: 'Comment not found after update' };
      }

      // Buscar dados do usuário para formatar o comentário
      const userData = await getUserData(data.user_id);

      // Formatar o comentário retornado
      const formattedComment: Comment = {
        id: data.id,
        clinic_id: data.clinic_id,
        user_id: data.user_id,
        user_name: userData.full_name,
        user_avatar: userData.avatar,
        content: data.content,
        rating: data.rating,
        created_at: data.created_at,
        updated_at: data.updated_at
      };

      return { success: true, comment: formattedComment };
    } catch {
      // console.error('Erro inesperado ao atualizar comentário:', error);
      const errorMessage = 'Erro inesperado';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteComment = useCallback(async (commentId: string, userId: string): Promise<CommentResponse> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Verificar se o comentário pertence ao usuário usando fetch direto
      const existingResponse = await fetch(`https://nmxcqiwslkuvdydlsolm.supabase.co/rest/v1/comments?id=eq.${commentId}&select=user_id`, {
        method: 'GET',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5teGNxaXdzbGt1dmR5ZGxzb2xtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODE5ODc1MSwiZXhwIjoyMDczNzc0NzUxfQ.PYA1g3dYA9bMwWyj66B48g6alyl-Oi_XNEPM8oM2gJ0',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5teGNxaXdzbGt1dmR5ZGxzb2xtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODE5ODc1MSwiZXhwIjoyMDczNzc0NzUxfQ.PYA1g3dYA9bMwWyj66B48g6alyl-Oi_XNEPM8oM2gJ0',
          'Content-Type': 'application/json'
        }
      });

      if (!existingResponse.ok) {
        const errorMessage = 'Comentário não encontrado';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }

      const existingData = await existingResponse.json();
      const existingComment = existingData[0];

      if (!existingComment) {
        const errorMessage = 'Comentário não encontrado';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }

      if (existingComment.user_id !== userId) {
        const errorMessage = 'Você não tem permissão para excluir este comentário';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }

      // Deletar o comentário usando fetch direto
      const deleteResponse = await fetch(`https://nmxcqiwslkuvdydlsolm.supabase.co/rest/v1/comments?id=eq.${commentId}`, {
        method: 'DELETE',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5teGNxaXdzbGt1dmR5ZGxzb2xtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODE5ODc1MSwiZXhwIjoyMDczNzc0NzUxfQ.PYA1g3dYA9bMwWyj66B48g6alyl-Oi_XNEPM8oM2gJ0',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5teGNxaXdzbGt1dmR5ZGxzb2xtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODE5ODc1MSwiZXhwIjoyMDczNzc0NzUxfQ.PYA1g3dYA9bMwWyj66B48g6alyl-Oi_XNEPM8oM2gJ0',
          'Content-Type': 'application/json'
        }
      });

      if (!deleteResponse.ok) {
        const errorData = await deleteResponse.json();
        setError(errorData.message || 'Failed to delete comment');
        return { success: false, error: errorData.message || 'Failed to delete comment' };
      }

      return { success: true };
    } catch {
      // console.error('Erro inesperado ao deletar comentário:', error);
      const errorMessage = 'Erro inesperado';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const hasUserCommented = useCallback(async (clinicId: string, userId: string): Promise<{ hasCommented: boolean; comment?: Comment }> => {
    try {
      const supabase = getSupabaseClient();

      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('clinic_id', clinicId)
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        return { hasCommented: false };
      }

      const formattedComment: Comment = {
        id: data.id,
        clinic_id: data.clinic_id,
        user_id: data.user_id,
        user_name: data.users.full_name,
        user_avatar: data.users.avatar,
        content: data.content,
        rating: data.rating,
        created_at: data.created_at,
        updated_at: data.updated_at
      };

      return { hasCommented: true, comment: formattedComment };
    } catch {
      // console.error('Erro ao verificar comentário do usuário:', error);
      return { hasCommented: false };
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // Estados
    isLoading,
    error,
    
    // Funções
    getCommentsByClinic,
    addComment,
    updateComment,
    deleteComment,
    hasUserCommented,
    clearError
  };
};

// Funções utilitárias para uso direto (sem hooks) - mantidas para compatibilidade
export const commentUtils = {
  /**
   * Busca todos os comentários de um consultório
   */
  async getCommentsByClinic(clinicId: string): Promise<CommentResponse> {
    try {
      const supabase = getSupabaseClient();

      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('clinic_id', clinicId)
        .order('created_at', { ascending: false });

      if (error) {
        // console.error('Erro ao buscar comentários:', error);
        return { success: false, error: error.message };
      }

      // Formatar os dados para incluir informações do usuário
      const formattedComments: Comment[] = data.map((comment: { id: string; clinic_id: string; user_id: string; [key: string]: unknown }) => ({
        id: comment.id,
        clinic_id: comment.clinic_id,
        user_id: comment.user_id,
        user_name: (comment.users as Record<string, unknown>)?.full_name as string || '',
        user_avatar: (comment.users as Record<string, unknown>)?.avatar as string || '',
        content: comment.content as string,
        rating: comment.rating as number,
        created_at: comment.created_at as string,
        updated_at: comment.updated_at as string
      }));

      return { success: true, comments: formattedComments };
    } catch {
      // console.error('Erro inesperado ao buscar comentários:', error);
      return {
        success: false,
        error: 'Erro inesperado'
      };
    }
  },

  /**
   * Adiciona um novo comentário
   */
  async addComment(
    clinicId: string,
    userId: string,
    commentData: CommentFormData
  ): Promise<CommentResponse> {
    try {
      const supabase = getSupabaseClient();

      // Verificar se o usuário já comentou neste consultório
      const { data: existingComment } = await supabase
        .from('comments')
        .select('id')
        .eq('clinic_id', clinicId)
        .eq('user_id', userId)
        .single();

      if (existingComment) {
        return {
          success: false,
          error: 'Você já comentou neste consultório. Você pode editar seu comentário existente.'
        };
      }

      // Inserir novo comentário
      const { data, error } = await supabase
        .from('comments')
        .insert({
          clinic_id: clinicId,
          user_id: userId,
          content: commentData.content,
          rating: commentData.rating || null
        })
        .select('*')
        .single();

      if (error) {
        // console.error('Erro ao adicionar comentário:', error);
        return { success: false, error: error.message };
      }

      // Formatar o comentário retornado
      const formattedComment: Comment = {
        id: data.id,
        clinic_id: data.clinic_id,
        user_id: data.user_id,
        user_name: data.users.full_name,
        user_avatar: data.users.avatar,
        content: data.content,
        rating: data.rating,
        created_at: data.created_at,
        updated_at: data.updated_at
      };

      return { success: true, comment: formattedComment };
    } catch {
      // console.error('Erro inesperado ao adicionar comentário:', error);
      return {
        success: false,
        error: 'Erro inesperado'
      };
    }
  },

  /**
   * Atualiza um comentário existente
   */
  async updateComment(
    commentId: string,
    userId: string,
    commentData: CommentFormData
  ): Promise<CommentResponse> {
    try {
      const supabase = getSupabaseClient();

      // Verificar se o comentário pertence ao usuário
      const { data: existingComment, error: fetchError } = await supabase
        .from('comments')
        .select('user_id')
        .eq('id', commentId)
        .single();

      if (fetchError || !existingComment) {
        return { success: false, error: 'Comentário não encontrado' };
      }

      if (existingComment.user_id !== userId) {
        return { success: false, error: 'Você não tem permissão para editar este comentário' };
      }

      // Atualizar o comentário
      const { data, error } = await supabase
        .from('comments')
        .update({
          content: commentData.content,
          rating: commentData.rating || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', commentId)
        .select('*')
        .single();

      if (error) {
        // console.error('Erro ao atualizar comentário:', error);
        return { success: false, error: error.message };
      }

      // Formatar o comentário retornado
      const formattedComment: Comment = {
        id: data.id,
        clinic_id: data.clinic_id,
        user_id: data.user_id,
        user_name: data.users.full_name,
        user_avatar: data.users.avatar,
        content: data.content,
        rating: data.rating,
        created_at: data.created_at,
        updated_at: data.updated_at
      };

      return { success: true, comment: formattedComment };
    } catch {
      // console.error('Erro inesperado ao atualizar comentário:', error);
      return {
        success: false,
        error: 'Erro inesperado'
      };
    }
  },

  /**
   * Remove um comentário
   */
  async deleteComment(commentId: string, userId: string): Promise<CommentResponse> {
    try {
      const supabase = getSupabaseClient();

      // Verificar se o comentário pertence ao usuário
      const { data: existingComment, error: fetchError } = await supabase
        .from('comments')
        .select('user_id')
        .eq('id', commentId)
        .single();

      if (fetchError || !existingComment) {
        return { success: false, error: 'Comentário não encontrado' };
      }

      if (existingComment.user_id !== userId) {
        return { success: false, error: 'Você não tem permissão para excluir este comentário' };
      }

      // Deletar o comentário
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) {
        // console.error('Erro ao deletar comentário:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch {
      // console.error('Erro inesperado ao deletar comentário:', error);
      return {
        success: false,
        error: 'Erro inesperado'
      };
    }
  },

  /**
   * Verifica se o usuário já comentou no consultório
   */
  async hasUserCommented(clinicId: string, userId: string): Promise<{ hasCommented: boolean; comment?: Comment }> {
    try {
      const supabase = getSupabaseClient();

      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('clinic_id', clinicId)
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        return { hasCommented: false };
      }

      const formattedComment: Comment = {
        id: data.id,
        clinic_id: data.clinic_id,
        user_id: data.user_id,
        user_name: data.users.full_name,
        user_avatar: data.users.avatar,
        content: data.content,
        rating: data.rating,
        created_at: data.created_at,
        updated_at: data.updated_at
      };

      return { hasCommented: true, comment: formattedComment };
    } catch {
      // console.error('Erro ao verificar comentário do usuário:', error);
      return { hasCommented: false };
    }
  }
};

