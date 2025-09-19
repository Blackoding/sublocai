import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useCommentService } from '@/services/commentService';
import { useAuthStore } from '@/stores/authStore';
import { Comment, CommentFormData } from '@/types';
import Button from './Button';
import AuthWarning from './AuthWarning';

interface CommentsSectionProps {
  clinicId: string;
  clinicTitle?: string;
}

const CommentsSection: React.FC<CommentsSectionProps> = ({ clinicId }) => {
  const { isAuthenticated, user } = useAuthStore();
  const { 
    isLoading: serviceLoading, 
    error: serviceError, 
    getCommentsByClinic, 
    addComment, 
    deleteComment, 
    hasUserCommented,
    clearError 
  } = useCommentService();
  
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Estados do formulário
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<CommentFormData>({
    content: '',
    rating: undefined
  });
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  
  // Verificar se o usuário já comentou
  const [userComment, setUserComment] = useState<Comment | null>(null);

  const loadComments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    clearError();
    
    try {
      const result = await getCommentsByClinic(clinicId);
      
      if (result.success && result.comments) {
        setComments(result.comments);
      } else {
        setError(result.error || 'Erro ao carregar comentários');
      }
    } catch {
      setError('Erro inesperado ao carregar comentários');
      // console.error('Error loading comments:', error);
    } finally {
      setIsLoading(false);
    }
  }, [clinicId, getCommentsByClinic, clearError]);

  const checkUserComment = useCallback(async () => {
    if (!user) return;
    
    try {
      const result = await hasUserCommented(clinicId, user.id);
      setUserComment(result.comment || null);
    } catch {
      // console.error('Error checking user comment:', error);
    }
  }, [clinicId, user, hasUserCommented]);

  // Carregar comentários
  useEffect(() => {
    loadComments();
  }, [clinicId, loadComments]);

  // Verificar se o usuário já comentou
  useEffect(() => {
    if (isAuthenticated && user) {
      checkUserComment();
    }
  }, [isAuthenticated, user, clinicId, checkUserComment]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      content: e.target.value
    }));
    setError(null);
  };

  const handleRatingChange = (rating: number) => {
    setFormData(prev => ({
      ...prev,
      rating
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !formData.content.trim()) return;
    
    // Validar comprimento mínimo do comentário
    if (formData.content.trim().length < 10) {
      setError('O comentário deve ter pelo menos 10 caracteres');
      return;
    }
    
    // Validar se a avaliação foi selecionada
    if (!formData.rating) {
      setError('A avaliação com estrelas é obrigatória');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    clearError();
    
    try {
      // Adicionar novo comentário
      const result = await addComment(clinicId, user.id, formData);
      
      if (result.success) {
        setSuccess('Comentário adicionado com sucesso!');
        setFormData({ content: '', rating: undefined });
        setHoveredRating(null);
        setShowForm(false);
        await loadComments();
        await checkUserComment();
      } else {
        setError(result.error || 'Erro ao salvar comentário');
      }
    } catch {
      setError('Erro inesperado ao salvar comentário');
      // console.error('Error submitting comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleDelete = async (commentId: string) => {
    if (!user || !confirm('Tem certeza que deseja excluir este comentário?')) return;
    
    try {
      setError(null);
      setSuccess(null);
      clearError();
      
      const result = await deleteComment(commentId, user.id);
      
      if (result.success) {
        setSuccess('Comentário excluído com sucesso!');
        await loadComments();
        await checkUserComment();
      } else {
        setError(result.error || 'Erro ao excluir comentário');
      }
    } catch {
      setError('Erro inesperado ao excluir comentário');
      // console.error('Error deleting comment:', error);
    }
  };

  const handleCancel = () => {
    setFormData({ content: '', rating: undefined });
    setHoveredRating(null);
    setShowForm(false);
    setError(null);
    setSuccess(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span
        key={index}
        className={`text-lg ${
          index < rating ? 'text-yellow-400' : 'text-gray-300'
        }`}
      >
        ★
      </span>
    ));
  };

  const renderRatingInput = () => {
    return (
      <div className="flex items-center space-x-1 mb-4">
        <span className="text-sm text-gray-600 mr-2">Avaliação: <span className="text-red-500">*</span></span>
        {Array.from({ length: 5 }, (_, index) => {
          const starNumber = index + 1;
          const isActive = hoveredRating ? starNumber <= hoveredRating : (formData.rating ? starNumber <= formData.rating : false);
          
          return (
            <button
              key={index}
              type="button"
              onClick={() => handleRatingChange(starNumber)}
              onMouseEnter={() => setHoveredRating(starNumber)}
              onMouseLeave={() => setHoveredRating(null)}
              className={`text-2xl transition-colors cursor-pointer ${
                isActive
                  ? 'text-yellow-400'
                  : 'text-gray-300'
              }`}
            >
              ★
            </button>
          );
        })}
        {(formData.rating || hoveredRating) && (
          <span className="text-sm text-gray-600 ml-2">
            ({(hoveredRating || formData.rating)}/5)
          </span>
        )}
        {!formData.rating && (
          <span className="text-sm text-red-500 ml-2">
            Selecione uma avaliação
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Comentários ({comments.length})
        </h2>
        
        {isAuthenticated && !userComment && !showForm && (
          <Button
            onClick={() => setShowForm(true)}
            variant="primary"
            size="md"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Comentar
          </Button>
        )}
      </div>

      {/* Mensagens de feedback */}
      {(error || serviceError) && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex">
            <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-700">{error || serviceError}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex">
            <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-green-700">{success}</p>
          </div>
        </div>
      )}

      {/* Formulário de comentário */}
      {showForm && (
        <div className="mb-8 p-6 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Adicionar Comentário
          </h3>
          
          <form onSubmit={handleSubmit}>
            {renderRatingInput()}
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comentário *
              </label>
              <textarea
                value={formData.content}
                onChange={handleInputChange}
                placeholder="Compartilhe sua experiência com este consultório (mínimo 10 caracteres)..."
                className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-left focus:outline-none focus:ring-2 focus:ring-[#2b9af3] focus:border-[#2b9af3] shadow-sm hover:border-gray-300 transition-colors duration-200 cursor-pointer text-[#333] placeholder-gray-500 resize-none"
                rows={4}
                required
                maxLength={500}
                minLength={10}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.content.length}/500 caracteres (mínimo 10)
              </p>
            </div>
            
            <div className="flex space-x-3">
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={!formData.content.trim() || !formData.rating || isSubmitting}
              >
                {isSubmitting ? 'Publicando...' : 'Publicar'}
              </Button>
              
              <Button
                type="button"
                onClick={handleCancel}
                variant="outline"
                size="md"
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de comentários */}
      {(isLoading || serviceLoading) ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2b9af3] mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando comentários...</p>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhum comentário ainda
          </h3>
          <p className="text-gray-600 mb-4">
            Seja o primeiro a compartilhar sua experiência com este consultório!
          </p>
          {!isAuthenticated && (
            <AuthWarning 
              title="Login necessário"
              message="Faça login para comentar" 
            />
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment.id} className="border-b border-gray-200 pb-6 last:border-b-0">
              <div className="flex items-start space-x-4">
                {/* Avatar do usuário */}
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-[#2b9af3] text-white rounded-full flex items-center justify-center font-semibold text-sm">
                    {comment.user_avatar ? (
                      <Image
                        src={comment.user_avatar}
                        alt={`Avatar de ${comment.user_name}`}
                        width={40}
                        height={40}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      comment.user_name
                        ?.split(' ')
                        .map(name => name.charAt(0))
                        .join('')
                        .toUpperCase()
                        .slice(0, 2) || 'U'
                    )}
                  </div>
                </div>
                
                {/* Conteúdo do comentário */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">
                        {comment.user_name}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {formatDate(comment.created_at)}
                        {comment.updated_at !== comment.created_at && (
                          <span className="ml-2 text-blue-600">(editado)</span>
                        )}
                      </p>
                    </div>
                    
                    {/* Ações do comentário */}
                    {isAuthenticated && user && user.id === comment.user_id && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleDelete(comment.id)}
                          className="text-sm text-red-600 hover:text-red-700 transition-colors cursor-pointer"
                        >
                          Excluir
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {/* Avaliação */}
                  {comment.rating && (
                    <div className="flex items-center mb-2">
                      {renderStars(comment.rating)}
                    </div>
                  )}
                  
                  {/* Texto do comentário */}
                  <p className="text-gray-700 leading-relaxed">
                    {comment.content}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentsSection;
