import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Button from './Button';
import Icon from './Icon';
import { useAuthStore } from '@/stores/authStore';
import { getUserDisplayName, getUserInitials } from '@/types';
import { AppointmentService } from '@/services/appointmentService';
import { ChatService } from '@/services/chatService';

const Header: React.FC = () => {
  const router = useRouter();
  const { isAuthenticated, user, isLoading, signOut } = useAuthStore();
  const isCompanyUser = isAuthenticated && user?.userType === 'company';
  const isProfessionalUser = isAuthenticated && user?.userType === 'professional';
  const showSublocarLink = !isAuthenticated || isProfessionalUser;
  const hasAuthenticatedUser = isAuthenticated && !!user;
  const showDashboardLink = hasAuthenticatedUser;
  const showAppointmentsLink = hasAuthenticatedUser;
  const showChatLink = hasAuthenticatedUser;
  
  // Debug logs
  useEffect(() => {
    console.log('Header - Auth state:', { isAuthenticated, user: user?.fullName, isLoading });
    console.log('Header - User object:', user);
  }, [isAuthenticated, user, isLoading]);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [pendingAppointmentsCount, setPendingAppointmentsCount] = useState(0);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [subscriptionWarning, setSubscriptionWarning] = useState<{
    showWarning: boolean;
    message: string | null;
    paymentPlan: 'basic' | 'pro';
    paidUntil: string | null;
    overdueDays: number | null;
  } | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const loadPendingAppointments = async () => {
      if (!isAuthenticated || !user?.id || user.userType !== 'company') {
        setPendingAppointmentsCount(0);
        return;
      }

      const result = await AppointmentService.getAllUserAppointments(user.id);
      const appointments = result.data || [];
      setPendingAppointmentsCount(
        appointments.filter((appointment) => appointment.status === 'pending').length
      );
    };

    loadPendingAppointments();
  }, [isAuthenticated, user?.id, user?.userType, router.pathname]);

  useEffect(() => {
    let intervalId: number | null = null;

    const loadUnreadMessages = async () => {
      if (!isAuthenticated || !user?.id) {
        setUnreadMessagesCount(0);
        return;
      }

      const result = await ChatService.getThreads(user.id);
      if (result.error || !result.data) {
        setUnreadMessagesCount(0);
        return;
      }

      const unreadTotal = result.data.reduce((sum, thread) => sum + (thread.unreadCount || 0), 0);
      setUnreadMessagesCount(unreadTotal);
    };

    loadUnreadMessages();
    intervalId = window.setInterval(loadUnreadMessages, 5000);

    return () => {
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [isAuthenticated, user?.id, router.pathname]);

  useEffect(() => {
    if (!isCompanyUser || !user?.id) {
      setSubscriptionWarning(null);
      return;
    }

    let intervalId: number | null = null;

    const loadSubscriptionWarning = async () => {
      const response = await fetch('/api/subscription/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId: user.id })
      });

      const json = (await response.json()) as
        | {
            data?: {
              showWarning: boolean;
              message: string | null;
              paymentPlan: 'basic' | 'pro';
              paidUntil: string | null;
              overdueDays: number | null;
            };
            error?: string;
          }
        | { error: string };

      if (!response.ok || !json || !('data' in json)) {
        setSubscriptionWarning(null);
        return;
      }

      if (json.data?.showWarning) {
        setSubscriptionWarning(json.data);
        return;
      }

      setSubscriptionWarning(null);
    };

    loadSubscriptionWarning().catch(() => setSubscriptionWarning(null));
    intervalId = window.setInterval(() => {
      loadSubscriptionWarning().catch(() => setSubscriptionWarning(null));
    }, 60000);

    return () => {
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [isCompanyUser, user?.id]);

  // Fechar menu do usuário quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isUserMenuOpen) {
        const target = event.target as Element;
        if (!target.closest('.user-menu-container')) {
          setIsUserMenuOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isUserMenuOpen]);

  const isActivePage = (path: string) => {
    return router.pathname === path;
  };

  const getNavItemClass = (path: string) => {
    const baseClass = "transition-colors duration-200";
    const activeClass = "text-[#2b9af3] font-medium";
    const inactiveClass = "text-gray-800 hover:text-[#2b9af3]";
    
    return `${baseClass} ${isActivePage(path) ? activeClass : inactiveClass}`;
  };

  const getMobileNavItemClass = (path: string) => {
    const baseClass = "block w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors duration-200";
    const activeClass = "text-[#2b9af3] font-medium";
    const inactiveClass = "text-gray-800 hover:text-[#2b9af3]";
    
    return `${baseClass} ${isActivePage(path) ? activeClass : inactiveClass}`;
  };

  const handleLogout = async () => {
    try {
      console.log('Header - Iniciando logout...');
      setIsLoggingOut(true);
      await signOut();
      console.log('Header - Logout concluído');
      setIsUserMenuOpen(false);
      router.push('/');
      console.log('Header - Redirecionado para home');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };


  const subscriptionBannerHeight = 44;

  return (
    <>
      {subscriptionWarning?.showWarning && (
        <div className="fixed top-0 left-0 right-0 z-[60] bg-red-50 border-b border-red-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[44px] flex items-center justify-between gap-4">
            <div className="text-sm font-medium text-red-800 truncate">
              {subscriptionWarning.message || 'Pagamento atrasado'}
            </div>
            <Button
              onClick={() => router.push(`/assinatura?plan=${subscriptionWarning.paymentPlan}`)}
              variant="danger"
              size="sm"
              className="px-4 py-1 shrink-0"
            >
              Pagar agora
            </Button>
          </div>
        </div>
      )}

      <header
        style={{ top: subscriptionWarning?.showWarning ? subscriptionBannerHeight : 0 }}
        className={`fixed left-0 right-0 bg-white backdrop-blur-sm z-50 transition-shadow duration-300 ${
          isScrolled || isMobileMenuOpen ? 'shadow-lg' : 'shadow-none'
        }`}
      >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-white">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Logo */}
          <div className="flex items-center space-x-4 w-60">
            <Link href="/" className="cursor-pointer">
              {/* Logo placeholder - pode ser substituído por uma imagem */}
              <span className="text-xl font-bold text-[#2b9af3]">Logo</span>
            </Link>
          </div>

          {/* Desktop Navigation Menu */}
          <nav className="hidden lg:flex items-center space-x-6">
            {showSublocarLink && (
              <Link
                href="/sublocar"
                className={getNavItemClass('/sublocar')}
              >
                Sublocar
              </Link>
            )}
            {showDashboardLink && (
              <Link
                href="/painel-de-controle"
                className={getNavItemClass('/painel-de-controle')}
              >
                Dashboard
              </Link>
            )}
            {showAppointmentsLink && (
              <Link
                href="/agendamentos"
                className={getNavItemClass('/agendamentos')}
              >
                <span className="inline-flex items-center gap-2">
                  <span>Agendamentos</span>
                  {isCompanyUser && pendingAppointmentsCount > 0 && (
                    <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center leading-none">
                      {pendingAppointmentsCount}
                    </span>
                  )}
                </span>
              </Link>
            )}
            {showChatLink && (
              <Link
                href="/chat"
                className={getNavItemClass('/chat')}
              >
                <span className="inline-flex items-center gap-2">
                  <span>Chat</span>
                  {unreadMessagesCount > 0 && (
                    <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center leading-none">
                      {unreadMessagesCount}
                    </span>
                  )}
                </span>
              </Link>
            )}
            {!isAuthenticated && (
              <>
                <Link
                  href="/anunciar"
                  className={getNavItemClass('/anunciar')}
                >
                  Anunciar
                </Link>
                <Link
                  href="/como-funciona"
                  className={getNavItemClass('/como-funciona')}
                >
                  Como funciona
                </Link>
                <Link
                  href="/contato"
                  className={getNavItemClass('/contato')}
                >
                  Contato
                </Link>
              </>
            )}
          </nav>

          {/* Desktop Right Section */}
          <div className="hidden lg:flex items-center space-x-4">
            {isAuthenticated && user ? (
              /* User Menu */
              <div className="relative user-menu-container w-60 flex items-center justify-end">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center justify-center w-12 h-12 bg-[#2b9af3] text-white rounded-full font-semibold text-lg hover:bg-[#1e7ce6] transition-colors duration-200 cursor-pointer overflow-hidden"
                >
                  {user.avatar ? (
                    <Image
                      src={user.avatar}
                      alt={`Avatar de ${getUserDisplayName(user)}`}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    getUserInitials(user)
                  )}
                </button>
                
                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute top-12 right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <Link
                      href="/perfil"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
                    >
                      Meu perfil
                    </Link>
                    {isCompanyUser && (
                      <Link
                        href="/minha-assinatura"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
                      >
                        Minha assinatura
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className={`block w-full text-left px-4 py-2 text-sm transition-colors duration-200 ${
                        isLoggingOut 
                          ? 'text-gray-400 cursor-not-allowed' 
                          : 'text-red-600 hover:bg-gray-100 cursor-pointer'
                      }`}
                    >
                      {isLoggingOut ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                          Saindo...
                        </div>
                      ) : (
                        'Sair'
                      )}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Login/Register Buttons */
              <>
                <Button 
                  onClick={() => router.push('/cadastrar')}
                  variant="outline"
                  size="md"
                >
                  Cadastrar
                </Button>
                <Button 
                  onClick={() => router.push('/entrar')}
                  variant="primary"
                  size="md"
                >
                  Entrar
                </Button>
              </>
            )}
          </div>

          {/* Mobile/Tablet Right Section */}
          <div className="flex lg:hidden items-center space-x-3">
            {isAuthenticated && user ? (
              /* Mobile User Menu */
              <div className="relative user-menu-container">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center justify-center w-10 h-10 bg-[#2b9af3] text-white rounded-full font-semibold text-base hover:bg-[#1e7ce6] transition-colors duration-200 cursor-pointer overflow-hidden"
                >
                  {user.avatar ? (
                    <Image
                      src={user.avatar}
                      alt={`Avatar de ${getUserDisplayName(user)}`}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    getUserInitials(user)
                  )}
                </button>
                
                {/* Mobile Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <Link
                      href="/perfil"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
                    >
                      Meu perfil
                    </Link>
                    {isCompanyUser && (
                      <Link
                        href="/minha-assinatura"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
                      >
                        Minha assinatura
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className={`block w-full text-left px-3 py-2 text-sm transition-colors duration-200 ${
                        isLoggingOut 
                          ? 'text-gray-400 cursor-not-allowed' 
                          : 'text-red-600 hover:bg-gray-100 cursor-pointer'
                      }`}
                    >
                      {isLoggingOut ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                          Saindo...
                        </div>
                      ) : (
                        'Sair'
                      )}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Button 
                onClick={() => router.push('/entrar')}
                variant="primary"
                size="md"
              >
                Entrar
              </Button>
            )}

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-600 hover:text-gray-800 p-2 cursor-pointer flex flex-row gap-2 items-center justify-center"
            >
              {isMobileMenuOpen ? (
                <Icon name="close" size="lg" />
              ) : (
                <Icon name="menu" size="lg" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white/95 backdrop-blur-sm">
            <nav className="py-4 space-y-2">
              {showSublocarLink && (
                <Link
                  href="/sublocar"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={getMobileNavItemClass('/sublocar')}
                >
                  Sublocar
                </Link>
              )}
              {showDashboardLink && (
                <Link
                  href="/painel-de-controle"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={getMobileNavItemClass('/painel-de-controle')}
                >
                  Dashboard
                </Link>
              )}
              {showAppointmentsLink && (
                <Link
                  href="/agendamentos"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={getMobileNavItemClass('/agendamentos')}
                >
                  <span className="inline-flex items-center gap-2">
                    <span>Agendamentos</span>
                    {isCompanyUser && pendingAppointmentsCount > 0 && (
                      <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center leading-none">
                        {pendingAppointmentsCount}
                      </span>
                    )}
                  </span>
                </Link>
              )}
              {showChatLink && (
                <Link
                  href="/chat"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={getMobileNavItemClass('/chat')}
                >
                  <span className="inline-flex items-center gap-2">
                    <span>Chat</span>
                    {unreadMessagesCount > 0 && (
                      <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center leading-none">
                        {unreadMessagesCount}
                      </span>
                    )}
                  </span>
                </Link>
              )}
              {!isAuthenticated && (
                <>
                  <Link
                    href="/anunciar"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={getMobileNavItemClass('/anunciar')}
                  >
                    Anunciar
                  </Link>
                  <Link
                    href="/como-funciona"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={getMobileNavItemClass('/como-funciona')}
                  >
                    Como funciona
                  </Link>
                  <Link
                    href="/contato"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={getMobileNavItemClass('/contato')}
                  >
                    Contato
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
      </header>
    </>
  );
};

export default Header;
