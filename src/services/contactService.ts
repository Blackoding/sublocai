import { useCallback, useState } from 'react';

export interface ContactMessage {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  topic?: string;
  message: string;
  status?: 'pending' | 'read' | 'replied' | 'archived';
  created_at?: string;
  updated_at?: string;
}

export interface ContactResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export type ContactFormPayload = {
  name: string;
  email: string;
  phone: string;
  topic: string;
  subject: string;
  message: string;
};

const NOT_AVAILABLE = 'Contact operations are unavailable in UI-only mode.';

export const useContact = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitContactMessage = useCallback(
    async (payload: ContactFormPayload): Promise<ContactResponse> => {
      setIsLoading(true);
      setError(null);
      try {
        void payload;
        return { success: false, error: NOT_AVAILABLE };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return { submitContactMessage, isLoading, error };
};

