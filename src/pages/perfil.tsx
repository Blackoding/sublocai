import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Button from '@/components/Button';
import Loading from '@/components/Loading';
import AvatarUpload from '@/components/AvatarUpload';
import { useAuthStore } from '@/stores/authStore';
// import { User } from '@/types';

const ProfilePage = () => {
  const router = useRouter();
  const { isAuthenticated, user, isLoading: authLoading, updateProfile, error: authError, clearError } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    cpf: '',
    phone: '',
    birthDate: '',
    avatar: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    console.log('Perfil - Auth state:', { authLoading, isAuthenticated, user: user?.fullName });
    console.log('Perfil - User object:', user);
    console.log('Perfil - AuthLoading:', authLoading, 'isAuthenticated:', isAuthenticated);
    
    if (!authLoading && isAuthenticated === false) {
      console.log('Perfil - Redirecionando para login');
      router.push('/entrar');
    }
  }, [isAuthenticated, authLoading, router, user]);

  // Load user data when component mounts
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        cpf: user.cpf || '',
        phone: user.phone || '',
        birthDate: user.birthDate || '',
        avatar: user.avatar || ''
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError(null);
    if (authError) clearError();
  };

  const handleEdit = () => {
    setIsEditing(true);
    setError(null);
    setSuccess(null);
    clearError();
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data to original user data
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        cpf: user.cpf || '',
        phone: user.phone || '',
        birthDate: user.birthDate || '',
        avatar: user.avatar || ''
      });
    }
    setError(null);
    setSuccess(null);
    clearError();
  };

  const handleAvatarChange = (avatarUrl: string | null) => {
    setFormData(prev => ({
      ...prev,
      avatar: avatarUrl || ''
    }));
    setError(null);
    setSuccess(null);
    clearError();
  };

  const handleSave = async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);
    setSuccess(null);
    clearError();

    try {
      const success = await updateProfile(formData);

      if (success) {
        setSuccess('Perfil atualizado com sucesso!');
        setIsEditing(false);
      } else {
        setError(authError || 'Erro ao atualizar perfil. Tente novamente.');
      }
    } catch (error) {
      setError('Erro inesperado ao atualizar perfil. Tente novamente.');
      console.error('Error updating profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const formatCPF = (cpf: string) => {
    if (!cpf) return '';
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatPhone = (phone: string) => {
    if (!phone) return '';
    return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24">
        <Loading 
          message="Verificando autenticação..."
          description="Aguarde enquanto verificamos seu acesso."
        />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Meu Perfil</h1>
              <p className="text-gray-600">
                Gerencie suas informações pessoais
              </p>
            </div>
            <Link href="/painel-de-controle">
              <Button variant="outline" size="md">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Voltar ao Painel
              </Button>
            </Link>
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-sm p-8">
          {/* Avatar Section */}
          <div className="flex flex-col md:flex-row items-center md:items-start mb-8 space-y-4 md:space-y-0 md:space-x-6">
            <AvatarUpload
              currentAvatar={formData.avatar}
              userName={user.fullName || 'Usuário'}
              onAvatarChange={handleAvatarChange}
              disabled={isLoading}
              size="xl"
            />
            <div className="text-center md:text-left">
              <h2 className="text-2xl font-semibold text-gray-900">
                {user.fullName || 'Usuário'}
              </h2>
              <p className="text-gray-600">{user.email}</p>
              <p className="text-sm text-gray-500">
                Membro desde {formatDate(user.createdAt)}
              </p>
            </div>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex">
                <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-700">{error}</p>
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

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome Completo
              </label>
              {isEditing ? (
                <input
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Digite seu nome completo"
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2b9af3] focus:border-transparent text-gray-900 placeholder-gray-500 bg-white"
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-900">{user.fullName || 'Não informado'}</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                E-mail
              </label>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-900">{user.email || 'Não informado'}</p>
                <p className="text-xs text-gray-500 mt-1">O e-mail não pode ser alterado por questões de segurança</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CPF
              </label>
              {isEditing ? (
                <input
                  name="cpf"
                  value={formData.cpf}
                  onChange={handleInputChange}
                  placeholder="000.000.000-00"
                  maxLength={14}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2b9af3] focus:border-transparent text-gray-900 placeholder-gray-500 bg-white"
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-900">
                    {user.cpf ? formatCPF(user.cpf) : 'Não informado'}
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefone
              </label>
              {isEditing ? (
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="(00) 00000-0000"
                  maxLength={15}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2b9af3] focus:border-transparent text-gray-900 placeholder-gray-500 bg-white"
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-900">
                    {user.phone ? formatPhone(user.phone) : 'Não informado'}
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data de Nascimento
              </label>
              {isEditing ? (
                <input
                  name="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2b9af3] focus:border-transparent text-gray-900 placeholder-gray-500 bg-white"
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-900">
                    {user.birthDate ? formatDate(user.birthDate) : 'Não informado'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
            {isEditing ? (
              <>
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  size="md"
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSave}
                  variant="primary"
                  size="md"
                  disabled={isLoading}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {isLoading ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </>
            ) : (
              <Button
                onClick={handleEdit}
                variant="primary"
                size="md"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Editar Perfil
              </Button>
            )}
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 bg-white rounded-2xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações da Conta</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">ID do Usuário:</span>
              <p className="text-gray-900 font-mono">{user.id}</p>
            </div>
            <div>
              <span className="text-gray-600">Última Atualização:</span>
              <p className="text-gray-900">{formatDate(user.updatedAt)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
