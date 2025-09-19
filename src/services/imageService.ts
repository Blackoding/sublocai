import { useState, useCallback } from 'react';
import { getSupabaseClient } from './supabase';

export interface ImageUploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export interface ImageUploadOptions {
  maxSize?: number; // em bytes (padrão: 5MB)
  allowedTypes?: string[]; // tipos permitidos (padrão: ['image/jpeg', 'image/png', 'image/webp'])
  quality?: number; // qualidade para compressão (0-1, padrão: 0.8)
}

const DEFAULT_OPTIONS: Required<ImageUploadOptions> = {
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  quality: 0.8
};

// Hook para gerenciar upload de imagens
export const useImageService = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateImageFile = useCallback((file: File, options: ImageUploadOptions = {}): { valid: boolean; error?: string } => {
    const opts = { ...DEFAULT_OPTIONS, ...options };

    // Verificar tipo do arquivo
    if (!opts.allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `Tipo de arquivo não permitido. Tipos aceitos: ${opts.allowedTypes.join(', ')}`
      };
    }

    // Verificar tamanho do arquivo
    if (file.size > opts.maxSize) {
      const maxSizeMB = opts.maxSize / (1024 * 1024);
      return {
        valid: false,
        error: `Arquivo muito grande. Tamanho máximo: ${maxSizeMB}MB`
      };
    }

    return { valid: true };
  }, []);

  const compressImage = useCallback(async (file: File, quality: number = 0.8): Promise<File> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calcular novas dimensões mantendo proporção
        const maxWidth = 800;
        const maxHeight = 800;
        let { width, height } = img;

        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Desenhar imagem redimensionada
        ctx?.drawImage(img, 0, 0, width, height);

        // Converter para blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now()
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Falha ao comprimir imagem'));
            }
          },
          file.type,
          quality
        );
      };

      img.onerror = () => reject(new Error('Erro ao carregar imagem'));
      img.src = URL.createObjectURL(file);
    });
  }, []);

  const uploadImage = useCallback(async (
    file: File,
    bucket: string = 'avatars',
    path?: string,
    options: ImageUploadOptions = {}
  ): Promise<ImageUploadResult> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const opts = { ...DEFAULT_OPTIONS, ...options };

      // Validar arquivo
      const validation = validateImageFile(file, opts);
      if (!validation.valid) {
        setError(validation.error || 'Arquivo inválido');
        return { success: false, error: validation.error };
      }

      // Comprimir imagem se necessário
      let fileToUpload = file;
      if (file.size > 1024 * 1024) { // Comprimir se maior que 1MB
        try {
          fileToUpload = await compressImage(file, opts.quality);
        } catch (error) {
          console.warn('Erro ao comprimir imagem, usando arquivo original:', error);
        }
      }

      const supabase = getSupabaseClient();

      // Gerar nome único para o arquivo
      const fileExt = fileToUpload.name.split('.').pop();
      const fileName = path || `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      // Fazer upload
      const { error } = await supabase.storage
        .from(bucket)
        .upload(fileName, fileToUpload, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Erro no upload:', error);
        setError(error.message);
        return { success: false, error: error.message };
      }

      // Obter URL pública
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      return {
        success: true,
        url: urlData.publicUrl
      };
    } catch (error) {
      console.error('Erro inesperado no upload:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro inesperado no upload';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  }, [validateImageFile, compressImage]);

  const deleteImage = useCallback(async (bucket: string = 'avatars', fileName: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const supabase = getSupabaseClient();

      const { error } = await supabase.storage
        .from(bucket)
        .remove([fileName]);

      if (error) {
        console.error('Erro ao deletar imagem:', error);
        setError(error.message);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Erro inesperado ao deletar imagem:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro inesperado ao deletar imagem';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const extractFileNameFromUrl = useCallback((url: string): string | null => {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      return pathParts[pathParts.length - 1];
    } catch {
      return null;
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
    uploadImage,
    deleteImage,
    validateImageFile,
    compressImage,
    extractFileNameFromUrl,
    clearError
  };
};

// Funções utilitárias para uso direto (sem hooks) - mantidas para compatibilidade
export const imageUtils = {
  /**
   * Valida se o arquivo é uma imagem válida
   */
  validateImageFile(file: File, options: ImageUploadOptions = {}): { valid: boolean; error?: string } {
    const opts = { ...DEFAULT_OPTIONS, ...options };

    // Verificar tipo do arquivo
    if (!opts.allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `Tipo de arquivo não permitido. Tipos aceitos: ${opts.allowedTypes.join(', ')}`
      };
    }

    // Verificar tamanho do arquivo
    if (file.size > opts.maxSize) {
      const maxSizeMB = opts.maxSize / (1024 * 1024);
      return {
        valid: false,
        error: `Arquivo muito grande. Tamanho máximo: ${maxSizeMB}MB`
      };
    }

    return { valid: true };
  },

  /**
   * Comprime uma imagem para reduzir o tamanho
   */
  async compressImage(file: File, quality: number = 0.8): Promise<File> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calcular novas dimensões mantendo proporção
        const maxWidth = 800;
        const maxHeight = 800;
        let { width, height } = img;

        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Desenhar imagem redimensionada
        ctx?.drawImage(img, 0, 0, width, height);

        // Converter para blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now()
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Falha ao comprimir imagem'));
            }
          },
          file.type,
          quality
        );
      };

      img.onerror = () => reject(new Error('Erro ao carregar imagem'));
      img.src = URL.createObjectURL(file);
    });
  },

  /**
   * Faz upload de uma imagem para o Supabase Storage
   */
  async uploadImage(
    file: File,
    bucket: string = 'avatars',
    path?: string,
    options: ImageUploadOptions = {}
  ): Promise<ImageUploadResult> {
    try {
      const opts = { ...DEFAULT_OPTIONS, ...options };

      // Validar arquivo
      const validation = this.validateImageFile(file, opts);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      // Comprimir imagem se necessário
      let fileToUpload = file;
      if (file.size > 1024 * 1024) { // Comprimir se maior que 1MB
        try {
          fileToUpload = await this.compressImage(file, opts.quality);
        } catch (error) {
          console.warn('Erro ao comprimir imagem, usando arquivo original:', error);
        }
      }

      const supabase = getSupabaseClient();

      // Gerar nome único para o arquivo
      const fileExt = fileToUpload.name.split('.').pop();
      const fileName = path || `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      // Fazer upload
      const { error } = await supabase.storage
        .from(bucket)
        .upload(fileName, fileToUpload, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Erro no upload:', error);
        return { success: false, error: error.message };
      }

      // Obter URL pública
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      return {
        success: true,
        url: urlData.publicUrl
      };
    } catch (error) {
      console.error('Erro inesperado no upload:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro inesperado no upload'
      };
    }
  },

  /**
   * Remove uma imagem do Supabase Storage
   */
  async deleteImage(bucket: string = 'avatars', fileName: string): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = getSupabaseClient();

      const { error } = await supabase.storage
        .from(bucket)
        .remove([fileName]);

      if (error) {
        console.error('Erro ao deletar imagem:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Erro inesperado ao deletar imagem:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro inesperado ao deletar imagem'
      };
    }
  },

  /**
   * Extrai o nome do arquivo de uma URL do Supabase Storage
   */
  extractFileNameFromUrl(url: string): string | null {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      return pathParts[pathParts.length - 1];
    } catch {
      return null;
    }
  }
};

