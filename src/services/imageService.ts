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

  const uploadImage = useCallback(async (): Promise<ImageUploadResult> => {
    setIsLoading(true);
    setError(null);
    try {
      return {
        success: false,
        error: 'Image upload is unavailable in UI-only mode.'
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { uploadImage, isLoading, error };
};

