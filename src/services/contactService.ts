import { useState, useCallback } from 'react';
// import { getSupabaseClient } from './supabase';

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

// Hook para gerenciar mensagens de contato
export const useContact = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitContactMessage = useCallback(async (data: Omit<ContactMessage, 'id' | 'status' | 'created_at' | 'updated_at'>): Promise<ContactResponse> => {
    try {
      console.log('📧 useContact.submitContactMessage iniciado com dados:', data);
      setIsLoading(true);
      setError(null);
      
      // Only execute on client side
      if (typeof window === 'undefined') {
        console.error('❌ Tentativa de execução no servidor');
        return { success: false, error: 'Server side execution not allowed' };
      }

      // Insert contact message using fetch direto
      console.log('💬 Inserindo mensagem de contato na tabela contact_messages...');
      const insertResponse = await fetch('https://nmxcqiwslkuvdydlsolm.supabase.co/rest/v1/contact_messages', {
        method: 'POST',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5teGNxaXdzbGt1dmR5ZGxzb2xtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODE5ODc1MSwiZXhwIjoyMDczNzc0NzUxfQ.PYA1g3dYA9bMwWyj66B48g6alyl-Oi_XNEPM8oM2gJ0',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5teGNxaXdzbGt1dmR5ZGxzb2xtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODE5ODc1MSwiZXhwIjoyMDczNzc0NzUxfQ.PYA1g3dYA9bMwWyj66B48g6alyl-Oi_XNEPM8oM2gJ0',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          phone: data.phone,
          subject: data.subject,
          topic: data.topic,
          message: data.message,
          status: 'pending'
        })
      });

      console.log('💬 Resultado da inserção:', { status: insertResponse.status });

      if (!insertResponse.ok) {
        const errorData = await insertResponse.json();
        console.error('❌ Erro ao inserir mensagem de contato:', errorData);
        setError(errorData.message || 'Failed to send message');
        return { success: false, error: errorData.message || 'Failed to send message' };
      }

      const messageData = await insertResponse.json();
      console.log('✅ Mensagem de contato enviada com sucesso:', messageData);
      return { 
        success: true, 
        message: 'Mensagem enviada com sucesso! Entraremos em contato em breve.' 
      };
    } catch (error) {
      console.error('💥 Erro inesperado no submitContactMessage:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(errorMessage);
      return { 
        success: false, 
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getContactMessages = useCallback(async (): Promise<{ messages: ContactMessage[]; error?: string }> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Only execute on client side
      if (typeof window === 'undefined') {
        return { messages: [], error: 'Server side execution not allowed' };
      }

      // Get contact messages using fetch direto
      const messagesResponse = await fetch('https://nmxcqiwslkuvdydlsolm.supabase.co/rest/v1/contact_messages?select=*&order=created_at.desc', {
        method: 'GET',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5teGNxaXdzbGt1dmR5ZGxzb2xtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODE5ODc1MSwiZXhwIjoyMDczNzc0NzUxfQ.PYA1g3dYA9bMwWyj66B48g6alyl-Oi_XNEPM8oM2gJ0',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5teGNxaXdzbGt1dmR5ZGxzb2xtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODE5ODc1MSwiZXhwIjoyMDczNzc0NzUxfQ.PYA1g3dYA9bMwWyj66B48g6alyl-Oi_XNEPM8oM2gJ0',
          'Content-Type': 'application/json'
        }
      });

      if (!messagesResponse.ok) {
        const errorData = await messagesResponse.json();
        console.error('❌ Erro ao buscar mensagens de contato:', errorData);
        setError(errorData.message || 'Failed to fetch messages');
        return { messages: [], error: errorData.message || 'Failed to fetch messages' };
      }

      const messages = await messagesResponse.json();
      return { messages: messages || [] };
    } catch (error) {
      console.error('💥 Erro inesperado ao buscar mensagens:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(errorMessage);
      return { 
        messages: [], 
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateMessageStatus = useCallback(async (messageId: string, status: ContactMessage['status']): Promise<ContactResponse> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Only execute on client side
      if (typeof window === 'undefined') {
        return { success: false, error: 'Server side execution not allowed' };
      }

      // Update message status using fetch direto
      const updateResponse = await fetch(`https://nmxcqiwslkuvdydlsolm.supabase.co/rest/v1/contact_messages?id=eq.${messageId}`, {
        method: 'PATCH',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5teGNxaXdzbGt1dmR5ZGxzb2xtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODE5ODc1MSwiZXhwIjoyMDczNzc0NzUxfQ.PYA1g3dYA9bMwWyj66B48g6alyl-Oi_XNEPM8oM2gJ0',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5teGNxaXdzbGt1dmR5ZGxzb2xtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODE5ODc1MSwiZXhwIjoyMDczNzc0NzUxfQ.PYA1g3dYA9bMwWyj66B48g6alyl-Oi_XNEPM8oM2gJ0',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        console.error('❌ Erro ao atualizar status da mensagem:', errorData);
        setError(errorData.message || 'Failed to update status');
        return { success: false, error: errorData.message || 'Failed to update status' };
      }

      return { success: true, message: 'Status atualizado com sucesso' };
    } catch (error) {
      console.error('💥 Erro inesperado ao atualizar status:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(errorMessage);
      return { 
        success: false, 
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    submitContactMessage,
    getContactMessages,
    updateMessageStatus,
    isLoading,
    error
  };
};
