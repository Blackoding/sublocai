import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Header from '@/components/Header';
import Loading from '@/components/Loading';
import Button from '@/components/Button';
import { BackButton } from '@/components/BackButton';
import { ChatMessage, ChatThread, getUserDisplayName } from '@/types';
import { useAuthStore } from '@/stores/authStore';
import { useToastStore } from '@/stores/toastStore';
import { ChatService } from '@/services/chatService';

const formatDate = (value: string): string => {
  if (!value) return '';
  if (value.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const [year, month, day] = value.split('-');
    return `${day}/${month}/${year}`;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('pt-BR');
};

const formatTime = (value: string): string => {
  if (!value) return 'N/A';
  return value.slice(0, 5);
};

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const containsContactData = (value: string): boolean => {
  const normalized = value.toLowerCase();
  const emailPattern = /\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b/i;
  const phonePattern = /(?:\+?55\s?)?(?:\(?\d{2}\)?\s?)?(?:9?\d{4})[-.\s]?\d{4}\b/;
  const rawDigits = value.replace(/\D/g, '');
  const hasLongDigitSequence = rawDigits.length >= 10;
  return emailPattern.test(normalized) || phonePattern.test(value) || hasLongDigitSequence;
};

const ChatPage = () => {
  const router = useRouter();
  const { user, isLoading: authLoading, isAuthenticated, getCurrentUser } = useAuthStore();
  const showToast = useToastStore((state) => state.showToast);
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoadingThreads, setIsLoadingThreads] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const realtimeSubscriptionRef = useRef<Awaited<ReturnType<typeof ChatService.subscribeToUserMessages>> | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const threadsRef = useRef<ChatThread[]>([]);
  const permissionRequestAttemptedRef = useRef(false);
  const notifiedMessageIdsRef = useRef<Set<string>>(new Set());

  const truncateForNotification = useCallback((value: string, maxLength: number): string => {
    const trimmed = value.trim();
    if (trimmed.length <= maxLength) return trimmed;
    const sliced = trimmed.slice(0, Math.max(0, maxLength - 3));
    return `${sliced}...`;
  }, []);

  const selectedAppointmentId = useMemo(() => {
    const queryAppointmentId = typeof router.query.appointmentId === 'string' ? router.query.appointmentId : '';
    if (queryAppointmentId) return queryAppointmentId;
    return threads[0]?.appointmentId || '';
  }, [router.query.appointmentId, threads]);

  const showBrowserNotification = useCallback(
    (params: { message: ChatMessage; senderName: string; appointmentId: string }) => {
      if (typeof window === 'undefined') return;
      if (!('Notification' in window)) return;
      if (window.Notification.permission !== 'granted') return;

      const { message, senderName, appointmentId } = params;
      const tabNotVisible = typeof document !== 'undefined' && document.visibilityState !== 'visible';
      const isCurrentThread = selectedAppointmentId === appointmentId;
      if (isCurrentThread && !tabNotVisible) return;

      const notifiedIds = notifiedMessageIdsRef.current;
      if (notifiedIds.has(message.id)) return;
      notifiedIds.add(message.id);
      if (notifiedIds.size > 100) {
        const firstId = notifiedIds.values().next().value;
        if (firstId) notifiedIds.delete(firstId);
      }

      const content = message.content || '';
      const body = truncateForNotification(content, 120);
      const title = `Nova mensagem de ${senderName}`;

      const notification = new window.Notification(title, {
        body,
        tag: `chat-${message.id}`
      });

      notification.onclick = () => {
        window.focus();
        if (selectedAppointmentId !== appointmentId) {
          router.push(
            {
              pathname: '/chat',
              query: { appointmentId }
            },
            undefined,
            { shallow: true }
          );
        }
      };
    },
    [router, selectedAppointmentId, truncateForNotification]
  );

  useEffect(() => {
    if (typeof window !== 'undefined' && !isAuthenticated && router.isReady) {
      getCurrentUser();
    }
  }, [getCurrentUser, isAuthenticated, router.isReady]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/entrar');
    }
  }, [authLoading, isAuthenticated, router]);

  const selectedThread = useMemo(
    () => threads.find((thread) => thread.appointmentId === selectedAppointmentId) || null,
    [selectedAppointmentId, threads]
  );

  useEffect(() => {
    threadsRef.current = threads;
  }, [threads]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!isAuthenticated) return;
    if (!('Notification' in window)) return;
    if (permissionRequestAttemptedRef.current) return;
    permissionRequestAttemptedRef.current = true;

    if (window.Notification.permission === 'default') {
      window.Notification.requestPermission().catch(() => {});
    }
  }, [isAuthenticated]);

  const updateThreadPreview = useCallback(
    (appointmentId: string, content: string, createdAt: string, senderId: string) => {
      setThreads((prev) =>
        [...prev]
          .map((thread) =>
            thread.appointmentId === appointmentId
              ? {
                  ...thread,
                  latestMessage: {
                    content,
                    createdAt,
                    senderId
                  }
                }
              : thread
          )
          .sort((a, b) => {
            const aKey = a.latestMessage?.createdAt || `${a.appointmentDate}T${a.appointmentTime}`;
            const bKey = b.latestMessage?.createdAt || `${b.appointmentDate}T${b.appointmentTime}`;
            return bKey.localeCompare(aKey);
          })
      );
    },
    []
  );

  const loadThreads = useCallback(async () => {
    if (!user?.id) return;
    setIsLoadingThreads(true);
    setError(null);
    const result = await ChatService.getThreads(user.id);
    if (result.error) {
      setError(result.error);
      setThreads([]);
      setIsLoadingThreads(false);
      return;
    }
    setThreads(result.data || []);
    setIsLoadingThreads(false);
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      loadThreads();
    }
  }, [loadThreads, user?.id]);

  useEffect(() => {
    const draftParam = typeof router.query.draft === 'string' ? router.query.draft : '';
    if (draftParam) {
      setMessageInput(draftParam);
    }
  }, [router.query.draft]);

  useEffect(() => {
    if (!router.isReady || !threads.length || selectedAppointmentId) return;
    router.replace(
      {
        pathname: '/chat',
        query: {
          appointmentId: threads[0].appointmentId
        }
      },
      undefined,
      { shallow: true }
    );
  }, [router, router.isReady, selectedAppointmentId, threads]);

  const loadMessages = useCallback(async () => {
    if (!user?.id || !selectedAppointmentId) {
      setMessages([]);
      return;
    }
    const result = await ChatService.getMessages(user.id, selectedAppointmentId);
    if (result.error) {
      setError(result.error);
      setMessages([]);
      return;
    }
    setMessages(result.data || []);
  }, [selectedAppointmentId, user?.id]);

  useEffect(() => {
    if (selectedAppointmentId) {
      loadMessages();
    } else {
      setMessages([]);
    }
  }, [loadMessages, selectedAppointmentId]);

  useEffect(() => {
    if (!user?.id) return;
    if (realtimeSubscriptionRef.current) {
      ChatService.unsubscribe(realtimeSubscriptionRef.current);
    }
    const subscription = ChatService.subscribeToUserMessages(user.id, (message) => {
      const relatedThread = threadsRef.current.find((thread) => thread.appointmentId === message.appointmentId);
      const senderName = message.senderId === user.id
        ? getUserDisplayName(user)
        : relatedThread?.counterpartName || 'Usuário';

      if (selectedAppointmentId === message.appointmentId) {
        setMessages((prev) => {
          if (prev.some((item) => item.id === message.id)) return prev;
          return [...prev, { ...message, senderName }];
        });
      }

      if (message.senderId !== user.id) {
        showBrowserNotification({ message, senderName, appointmentId: message.appointmentId });
      }
      updateThreadPreview(message.appointmentId, message.content, message.createdAt, message.senderId);
    });
    realtimeSubscriptionRef.current = subscription;

    return () => {
      ChatService.unsubscribe(subscription);
      realtimeSubscriptionRef.current = null;
    };
  }, [selectedAppointmentId, updateThreadPreview, showBrowserNotification, user]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    container.scrollTop = container.scrollHeight;
  }, [messages]);

  const openThread = (appointmentId: string) => {
    router.push(
      {
        pathname: '/chat',
        query: {
          appointmentId
        }
      },
      undefined,
      { shallow: true }
    );
  };

  const handleSendMessage = async () => {
    if (!selectedAppointmentId || !user?.id || isSending) return;
    const content = messageInput.trim();
    if (!content) return;
    if (containsContactData(content)) {
      showToast('Não é permitido compartilhar telefone ou e-mail no chat', 'error');
      return;
    }
    setIsSending(true);
    setError(null);
    const result = await ChatService.sendMessage(user.id, selectedAppointmentId, content);
    if (result.error || !result.data) {
      const message = result.error || 'Erro ao enviar mensagem';
      if (message.toLowerCase().includes('telefone') || message.toLowerCase().includes('e-mail') || message.toLowerCase().includes('email')) {
        showToast('Não é permitido compartilhar telefone ou e-mail no chat', 'error');
      } else {
        setError(message);
      }
      setIsSending(false);
      return;
    }
    const sentMessage = result.data;
    setMessages((prev) => {
      if (prev.some((item) => item.id === sentMessage.id)) return prev;
      return [
        ...prev,
        {
          ...sentMessage,
          senderName: getUserDisplayName(user)
        }
      ];
    });
    updateThreadPreview(sentMessage.appointmentId, sentMessage.content, sentMessage.createdAt, sentMessage.senderId);
    setMessageInput('');
    setIsSending(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24">
        <Loading message="Verificando autenticação..." description="Aguarde enquanto validamos o acesso." />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Chat - Sublease</title>
        <meta name="description" content="Converse com seus contatos de agendamentos" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto mt-16">
            <div className="mb-8">
              <BackButton />
              <h1 className="text-3xl font-bold text-gray-900 mt-4">Chat</h1>
              <p className="text-gray-600 mt-2">Converse em tempo real sobre cada agendamento</p>
            </div>

            {isLoadingThreads ? (
              <Loading message="Carregando chats..." description="Buscando suas conversas." />
            ) : error ? (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <p className="text-red-600">{error}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow-sm lg:col-span-1">
                  <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white rounded-t-lg">
                    <h2 className="text-lg font-semibold text-gray-900">Conversas ({threads.length})</h2>
                    <p className="text-xs text-gray-500 mt-1">Selecione uma conversa para abrir o chat</p>
                  </div>
                  {threads.length === 0 ? (
                    <div className="p-6">
                      <p className="text-gray-600">Você ainda não possui conversas disponíveis.</p>
                    </div>
                  ) : (
                    <div className="p-3 space-y-2">
                      {threads.map((thread) => (
                        <button
                          key={thread.appointmentId}
                          type="button"
                          onClick={() => openThread(thread.appointmentId)}
                          className={`w-full text-left p-3 rounded-xl border transition-all ${
                            selectedThread?.appointmentId === thread.appointmentId
                              ? 'bg-blue-50 border-blue-200 shadow-sm'
                              : 'bg-white border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-11 h-11 rounded-full bg-[#2b9af3] text-white flex items-center justify-center text-sm font-semibold shrink-0">
                              {getInitials(thread.counterpartName)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-sm font-semibold text-gray-900 truncate">{thread.counterpartName}</p>
                                <span className="text-[11px] text-gray-500 shrink-0">
                                  {thread.latestMessage
                                    ? new Date(thread.latestMessage.createdAt).toLocaleTimeString('pt-BR', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })
                                    : formatTime(thread.appointmentTime)}
                                </span>
                              </div>
                              <div className="mt-1">
                                <span className="text-[11px] text-gray-500 truncate">{thread.clinicTitle}</span>
                              </div>
                              <p className="text-xs text-gray-500 mt-2 truncate">
                                {thread.latestMessage?.content || `${formatDate(thread.appointmentDate)} às ${formatTime(thread.appointmentTime)}`}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-lg shadow-sm lg:col-span-2">
                  {!selectedThread ? (
                    <div className="p-8">
                      <p className="text-gray-600">Selecione uma conversa para visualizar os detalhes.</p>
                    </div>
                  ) : (
                    <div className="p-6">
                      <div className="border-b border-gray-200 pb-4">
                        <h3 className="text-lg font-semibold text-gray-900">{selectedThread.counterpartName}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {selectedThread.clinicTitle} - {formatDate(selectedThread.appointmentDate)} às {formatTime(selectedThread.appointmentTime)}
                        </p>
                      </div>
                      <>
                        <div ref={messagesContainerRef} className="mt-6 h-[420px] overflow-y-auto bg-gray-50 rounded-lg border border-gray-200 p-4 space-y-3">
                          {messages.length === 0 ? (
                            <p className="text-sm text-gray-600">Nenhuma mensagem ainda. Envie a primeira mensagem.</p>
                          ) : (
                            messages.map((message) => {
                              const isOwnMessage = message.senderId === user.id;
                              return (
                                <div
                                  key={message.id}
                                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                                >
                                  <div
                                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                                      isOwnMessage
                                        ? 'bg-[#2b9af3] text-white rounded-br-sm'
                                        : 'bg-white text-gray-900 border border-gray-200 rounded-bl-sm'
                                    }`}
                                  >
                                    <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                                    <p
                                      className={`text-[11px] mt-1 ${
                                        isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                                      }`}
                                    >
                                      {formatDate(message.createdAt)} {new Date(message.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                        <div className="mt-4">
                          <textarea
                            value={messageInput}
                            onChange={(event) => setMessageInput(event.target.value)}
                            onKeyDown={(event) => {
                              if (event.key === 'Enter' && !event.shiftKey) {
                                event.preventDefault();
                                handleSendMessage();
                              }
                            }}
                            className="w-full min-h-32 rounded-lg border border-gray-300 px-3 py-2 text-sm text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2b9af3] focus:border-[#2b9af3]"
                            placeholder="Digite sua mensagem..."
                          />
                        </div>
                        <div className="mt-4">
                          <Button
                            onClick={handleSendMessage}
                            disabled={isSending || !messageInput.trim()}
                            className="bg-[#2b9af3] hover:bg-[#1e7ce6] text-white border-[#2b9af3] hover:border-[#1e7ce6]"
                          >
                            {isSending ? 'Enviando...' : 'Enviar Mensagem'}
                          </Button>
                        </div>
                      </>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export default ChatPage;
