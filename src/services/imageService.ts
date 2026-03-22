import { useCallback, useState } from 'react';

export interface ImageUploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export interface ImageUploadOptions {
  maxSize?: number;
  allowedTypes?: string[];
  quality?: number;
}

export const useImageService = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const extractFileNameFromUrl = useCallback((url: string): string | null => {
    try {
      const pathname = new URL(url).pathname;
      const segments = pathname.split('/').filter(Boolean);
      const name = segments[segments.length - 1];
      return name && name.length > 0 ? decodeURIComponent(name) : null;
    } catch {
      return null;
    }
  }, []);

  const uploadImage = useCallback(
    async (file: File, folder: string): Promise<ImageUploadResult> => {
      setIsLoading(true);
      setError(null);
      try {
        void file;
        void folder;
        return {
          success: false,
          error: 'Image upload is unavailable in UI-only mode.'
        };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const deleteImage = useCallback(
    async (folder: string, fileName: string): Promise<void> => {
      setIsLoading(true);
      setError(null);
      try {
        void folder;
        void fileName;
        return;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    uploadImage,
    deleteImage,
    extractFileNameFromUrl,
    clearError,
    isLoading,
    error
  };
};
