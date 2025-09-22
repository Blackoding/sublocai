import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Button from './Button';
import Icon from './Icon';
import { useAuthStore } from '@/stores/authStore';
import { getUserDisplayName, getUserInitials } from '@/types';

const Header: React.FC = () => {
  const router = useRouter();
  const { isAuthenticated, user, isLoading, signOut } = useAuthStore();
  
  // Debug logs
  useEffect(() => {
    console.log('Header - Auth state:', { isAuthenticated, user: user?.fullName, isLoading });
    console.log('Header - User object:', user);
  }, [isAuthenticated, user, isLoading]);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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


  return (
    <header className={`fixed top-0 left-0 right-0 bg-white backdrop-blur-sm z-50 transition-shadow duration-300 ${
      isScrolled || isMobileMenuOpen ? 'shadow-lg' : 'shadow-none'
    }`}>
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
            <Link 
              href="/sublocar"
              className={getNavItemClass('/sublocar')}
            >
              Sublocar
            </Link>
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
                      href="/painel-de-controle"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
                    >
                      Painel
                    </Link>
                    <Link
                      href="/agendamentos"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
                    >
                      Agendamentos
                    </Link>
                    <Link
                      href="/perfil"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
                    >
                      Meu perfil
                    </Link>
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
                      href="/painel-de-controle"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
                    >
                      Painel
                    </Link>
                    <Link
                      href="/perfil"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
                    >
                      Meu perfil
                    </Link>
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
              <Link 
                href="/sublocar"
                onClick={() => setIsMobileMenuOpen(false)}
                className={getMobileNavItemClass('/sublocar')}
              >
                Sublocar
              </Link>
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
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
