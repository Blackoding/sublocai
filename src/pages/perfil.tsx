import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Button from '@/components/Button';
import Loading from '@/components/Loading';
import AvatarUpload from '@/components/AvatarUpload';
import Input from '@/components/Input';
import Select from '@/components/Select';
import { useAuthStore } from '@/stores/authStore';
import { SPECIALTIES, getSpecialtyRegistrationCode } from '@/constants/specialties';
import { getUserDisplayName } from '@/types';
// import { User } from '@/types';

const ProfilePage = () => {
  const router = useRouter();
  const { isAuthenticated, user, isLoading: authLoading, updateProfile, error: authError, clearError } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    // Campos comuns
    phone: '',
    avatar: '',
    
    // Campos específicos para profissional
    fullName: '',
    cpf: '',
    birthDate: '',
    specialty: '',
    registrationCode: '',
    
    // Campos específicos para empresa
    companyName: '',
    tradeName: '',
    cnpj: '',
    responsibleName: '',
    responsibleCpf: ''
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
        // Campos comuns
        phone: user.phone || '',
        avatar: user.avatar || '',
        
        // Campos específicos para profissional
        fullName: user.fullName || '',
        cpf: user.cpf || '',
        birthDate: user.birthDate || '',
        specialty: user.specialty || '',
        registrationCode: user.registrationCode || '',
        
        // Campos específicos para empresa
        companyName: user.companyName || '',
        tradeName: user.tradeName || '',
        cnpj: user.cnpj || '',
        responsibleName: user.responsibleName || '',
        responsibleCpf: user.responsibleCpf || ''
      });
    }
  }, [user]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
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
        // Campos comuns
        phone: user.phone || '',
        avatar: user.avatar || '',
        
        // Campos específicos para profissional
        fullName: user.fullName || '',
        cpf: user.cpf || '',
        birthDate: user.birthDate || '',
        specialty: user.specialty || '',
        registrationCode: user.registrationCode || '',
        
        // Campos específicos para empresa
        companyName: user.companyName || '',
        tradeName: user.tradeName || '',
        cnpj: user.cnpj || '',
        responsibleName: user.responsibleName || '',
        responsibleCpf: user.responsibleCpf || ''
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
              userName={getUserDisplayName(user)}
              onAvatarChange={handleAvatarChange}
              disabled={isLoading}
              size="xl"
            />
            <div className="text-center md:text-left">
              <h2 className="text-2xl font-semibold text-gray-900">
                {getUserDisplayName(user)}
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

          {/* Tipo de Conta - Não editável */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 className="text-sm font-medium text-blue-900">
                  Tipo de Conta: {user.userType === 'professional' ? 'Profissional' : 'Empresa'}
                </h4>
                <p className="text-xs text-blue-700 mt-1">
                  O tipo de conta não pode ser alterado por questões de segurança
                </p>
              </div>
            </div>
          </div>

          {/* Campos específicos para Profissional */}
          {user.userType === 'professional' && (
            <>
              {/* Seção de Dados Pessoais */}
              <div className="border-b border-gray-200 pb-4 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Dados Pessoais</h3>
                <p className="text-sm text-gray-600">Suas informações pessoais</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Completo
                  </label>
                  {isEditing ? (
                    <Input
                      label=""
                      value={formData.fullName}
                      onChange={(value) => handleInputChange('fullName', value)}
                      placeholder="Digite seu nome completo"
                      required
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-gray-900">{user.fullName || 'Não informado'}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CPF
                  </label>
                  {isEditing ? (
                    <Input
                      label=""
                      value={formData.cpf}
                      onChange={(value) => handleInputChange('cpf', value)}
                      placeholder="000.000.000-00"
                      mask="cpf"
                      required
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
                    Data de Nascimento
                  </label>
                  {isEditing ? (
                    <Input
                      label=""
                      type="date"
                      value={formData.birthDate}
                      onChange={(value) => handleInputChange('birthDate', value)}
                      required
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

              {/* Seção de Registro Profissional */}
              <div className="border-t border-gray-200 pt-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Registro Profissional</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Especialidade
                  </label>
                  {isEditing ? (
                    <Select
                      label=""
                      options={SPECIALTIES}
                      value={formData.specialty}
                      onChange={(value) => handleInputChange('specialty', value)}
                      placeholder="Selecione sua especialidade"
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-gray-900">
                        {user.specialty ? SPECIALTIES.find(s => s.value === user.specialty)?.label : 'Não informado'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Input de registro profissional - só aparece quando especialidade for selecionada */}
                {formData.specialty && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {getSpecialtyRegistrationCode(formData.specialty)}
                    </label>
                    {isEditing ? (
                      <Input
                        label=""
                        value={formData.registrationCode}
                        onChange={(value) => handleInputChange('registrationCode', value)}
                        placeholder={`Seu número de ${getSpecialtyRegistrationCode(formData.specialty)}`}
                        required
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-gray-900">
                          {user.registrationCode || 'Não informado'}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Campos específicos para Empresa */}
          {user.userType === 'company' && (
            <>
              {/* Seção de Dados da Empresa */}
              <div className="border-b border-gray-200 pb-4 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Dados da Empresa</h3>
                <p className="text-sm text-gray-600">Informações da sua clínica ou instituição</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Razão Social
                  </label>
                  {isEditing ? (
                    <Input
                      label=""
                      value={formData.companyName}
                      onChange={(value) => handleInputChange('companyName', value)}
                      placeholder="Nome oficial da empresa"
                      required
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-gray-900">{user.companyName || 'Não informado'}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Fantasia
                  </label>
                  {isEditing ? (
                    <Input
                      label=""
                      value={formData.tradeName}
                      onChange={(value) => handleInputChange('tradeName', value)}
                      placeholder="Nome comercial da empresa"
                      required
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-gray-900">{user.tradeName || 'Não informado'}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CNPJ
                  </label>
                  {isEditing ? (
                    <Input
                      label=""
                      value={formData.cnpj}
                      onChange={(value) => handleInputChange('cnpj', value)}
                      placeholder="00.000.000/0000-00"
                      mask="cnpj"
                      required
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-gray-900">
                        {user.cnpj || 'Não informado'}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Seção de Dados do Responsável */}
              <div className="border-t border-gray-200 pt-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Dados do Responsável</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome do Responsável
                  </label>
                  {isEditing ? (
                    <Input
                      label=""
                      value={formData.responsibleName}
                      onChange={(value) => handleInputChange('responsibleName', value)}
                      placeholder="Nome completo do responsável"
                      required
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-gray-900">{user.responsibleName || 'Não informado'}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CPF do Responsável
                  </label>
                  {isEditing ? (
                    <Input
                      label=""
                      value={formData.responsibleCpf}
                      onChange={(value) => handleInputChange('responsibleCpf', value)}
                      placeholder="000.000.000-00"
                      mask="cpf"
                      required
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-gray-900">
                        {user.responsibleCpf ? formatCPF(user.responsibleCpf) : 'Não informado'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Campos comuns */}
          <div className="border-t border-gray-200 pt-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Dados de Contato</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                Telefone
              </label>
              {isEditing ? (
                <Input
                  label=""
                  value={formData.phone}
                  onChange={(value) => handleInputChange('phone', value)}
                  placeholder="(11) 99999-9999"
                  mask="phone"
                  required
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-900">
                    {user.phone ? formatPhone(user.phone) : 'Não informado'}
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
