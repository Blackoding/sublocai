import { RealtimeChannel } from '@supabase/supabase-js';
import { createAnonSupabaseClient } from '@/config/supabase';
import type { ChatMessage, ChatThread } from '@/types';

type ApiError = {
  error?: string;
};

type ApiResponse<T> = {
  data?: T;
} & ApiError;

const supabase = createAnonSupabaseClient();

type ChatRealtimeSubscription = {
  channels: RealtimeChannel[];
};

const fetchJson = async <T,>(url: string, options: RequestInit): Promise<T> => {
  const response = await fetch(url, options);
  const json = (await response.json()) as T;
  if (!response.ok) {
    const message = (json as unknown as ApiError).error || 'Request failed';
    throw new Error(message);
  }
  return json;
};

export class ChatService {
  static async getThreads(userId: string): Promise<{ data: ChatThread[] | null; error: string | null }> {
    try {
      const json = await fetchJson<ApiResponse<ChatThread[]>>('/api/chat/list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId })
      });
      return { data: json.data || [], error: null };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Erro ao carregar chats'
      };
    }
  }

  static async getMessages(
    userId: string,
    appointmentId: string
  ): Promise<{ data: ChatMessage[] | null; error: string | null }> {
    try {
      const json = await fetchJson<ApiResponse<ChatMessage[]>>('/api/chat/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId, appointmentId })
      });
      return { data: json.data || [], error: null };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Erro ao carregar mensagens'
      };
    }
  }

  static async sendMessage(
    senderId: string,
    appointmentId: string,
    content: string
  ): Promise<{ data: ChatMessage | null; error: string | null }> {
    try {
      const json = await fetchJson<ApiResponse<ChatMessage>>('/api/chat/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ senderId, appointmentId, content })
      });
      return { data: json.data || null, error: null };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Erro ao enviar mensagem'
      };
    }
  }

  static subscribeToThreadMessages(
    appointmentId: string,
    onInsert: (message: ChatMessage) => void
  ): RealtimeChannel {
    const channel = supabase
      .channel(`chat-thread-${appointmentId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'appointment_messages',
          filter: `appointment_id=eq.${appointmentId}`
        },
        (payload) => {
          const row = payload.new as {
            id: string;
            appointment_id: string;
            sender_id: string;
            receiver_id: string;
            content: string;
            created_at: string;
          };
          onInsert({
            id: row.id,
            appointmentId: row.appointment_id,
            senderId: row.sender_id,
            receiverId: row.receiver_id,
            content: row.content,
            createdAt: row.created_at,
            senderName: 'Usuário'
          });
        }
      )
      .subscribe();

    return channel;
  }

  static subscribeToUserMessages(
    userId: string,
    onInsert: (message: ChatMessage) => void
  ): ChatRealtimeSubscription {
    const mapRowToMessage = (row: {
      id: string;
      appointment_id: string;
      sender_id: string;
      receiver_id: string;
      content: string;
      created_at: string;
    }): ChatMessage => ({
      id: row.id,
      appointmentId: row.appointment_id,
      senderId: row.sender_id,
      receiverId: row.receiver_id,
      content: row.content,
      createdAt: row.created_at,
      senderName: 'Usuário'
    });

    const receiverChannel = supabase
      .channel(`chat-user-receiver-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'appointment_messages',
          filter: `receiver_id=eq.${userId}`
        },
        (payload) => {
          onInsert(
            mapRowToMessage(payload.new as {
              id: string;
              appointment_id: string;
              sender_id: string;
              receiver_id: string;
              content: string;
              created_at: string;
            })
          );
        }
      )
      .subscribe();

    const senderChannel = supabase
      .channel(`chat-user-sender-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'appointment_messages',
          filter: `sender_id=eq.${userId}`
        },
        (payload) => {
          onInsert(
            mapRowToMessage(payload.new as {
              id: string;
              appointment_id: string;
              sender_id: string;
              receiver_id: string;
              content: string;
              created_at: string;
            })
          );
        }
      )
      .subscribe();

    return {
      channels: [receiverChannel, senderChannel]
    };
  }

  static async unsubscribe(channel: RealtimeChannel | ChatRealtimeSubscription): Promise<void> {
    if ('channels' in channel) {
      await Promise.all(channel.channels.map((currentChannel) => supabase.removeChannel(currentChannel)));
      return;
    }
    await supabase.removeChannel(channel);
  }
}
