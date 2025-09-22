import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Modal from '@/components/Modal';
import UserTypeSelector from '@/components/UserTypeSelector';
import Select from '@/components/Select';
import { SPECIALTIES, getSpecialtyRegistrationCode } from '@/constants/specialties';
import { isValidCPF, isValidCNPJ } from '@/lib/validation';

const CadastrarPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    // Campos comuns
    email: '',
    telefone: '',
    senha: '',
    confirmarSenha: '',
    tipoUsuario: 'professional' as 'professional' | 'company' | null,
    
    // Campos específicos para profissional
    nomeCompleto: '',
    cpf: '',
    dataNascimento: '',
    especialidade: '',
    crm: '',
    
    // Campos específicos para empresa
    razaoSocial: '',
    nomeFantasia: '',
    cnpj: '',
    responsavel: '',
    cpfResponsavel: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showEmailConfirmationModal, setShowEmailConfirmationModal] = useState(false);

  // Refs para os campos do formulário
  const fieldRefs = {
    // Campos comuns
    email: useRef<HTMLInputElement>(null),
    telefone: useRef<HTMLInputElement>(null),
    senha: useRef<HTMLInputElement>(null),
    confirmarSenha: useRef<HTMLInputElement>(null),
    
    // Campos específicos para profissional
    nomeCompleto: useRef<HTMLInputElement>(null),
    cpf: useRef<HTMLInputElement>(null),
    dataNascimento: useRef<HTMLInputElement>(null),
    crm: useRef<HTMLInputElement>(null),
    
    // Campos específicos para empresa
    razaoSocial: useRef<HTMLInputElement>(null),
    nomeFantasia: useRef<HTMLInputElement>(null),
    cnpj: useRef<HTMLInputElement>(null),
    responsavel: useRef<HTMLInputElement>(null),
    cpfResponsavel: useRef<HTMLInputElement>(null)
  };

  // Clear errors when user starts typing
  useEffect(() => {
    if (error) {
      setError(null);
    }
  }, [formData]);

  // Função de validação de CPF para uso em tempo real
  const validateCPF = (cpf: string): string | null => {
    if (!cpf.trim()) {
      return null; // Não mostra erro se estiver vazio (será validado no submit)
    }
    
    const cpfNumbers = cpf.replace(/\D/g, '');
    if (cpfNumbers.length < 11) {
      return 'CPF deve ter 11 dígitos';
    }
    
    if (!isValidCPF(cpf)) {
      return 'CPF inválido';
    }
    
    return null; // CPF válido
  };

  // Função de validação de CNPJ para uso em tempo real
  const validateCNPJ = (cnpj: string): string | null => {
    if (!cnpj.trim()) {
      return null; // Não mostra erro se estiver vazio (será validado no submit)
    }
    
    const cnpjNumbers = cnpj.replace(/\D/g, '');
    if (cnpjNumbers.length < 14) {
      return 'CNPJ deve ter 14 dígitos';
    }
    
    if (!isValidCNPJ(cnpj)) {
      return 'CNPJ inválido';
    }
    
    return null; // CNPJ válido
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validação do tipo de usuário
    if (!formData.tipoUsuario) {
      newErrors.tipoUsuario = 'Selecione o tipo de conta';
    }

    // Validações específicas para profissional
    if (formData.tipoUsuario === 'professional') {
      // Nome completo
      if (!formData.nomeCompleto.trim()) {
        newErrors.nomeCompleto = 'Nome completo é obrigatório';
      } else if (formData.nomeCompleto.trim().length < 2) {
        newErrors.nomeCompleto = 'Nome deve ter pelo menos 2 caracteres';
      }

      // CPF
      if (!formData.cpf.trim()) {
        newErrors.cpf = 'CPF é obrigatório';
      } else if (!isValidCPF(formData.cpf)) {
        newErrors.cpf = 'CPF inválido';
      }

      // Data de nascimento
      if (!formData.dataNascimento.trim()) {
        newErrors.dataNascimento = 'Data de nascimento é obrigatória';
      } else {
        const birthDate = new Date(formData.dataNascimento);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        if (age < 18) {
          newErrors.dataNascimento = 'Você deve ter pelo menos 18 anos';
        }
      }

      // Especialidade
      if (!formData.especialidade.trim()) {
        newErrors.especialidade = 'Especialidade é obrigatória';
      }

      // Código de registro (obrigatório apenas se especialidade for selecionada)
      if (formData.especialidade && !formData.crm.trim()) {
        const registrationCode = getSpecialtyRegistrationCode(formData.especialidade);
        newErrors.crm = `${registrationCode} é obrigatório`;
      } else if (formData.especialidade && formData.crm.trim().length < 4) {
        const registrationCode = getSpecialtyRegistrationCode(formData.especialidade);
        newErrors.crm = `${registrationCode} deve ter pelo menos 4 caracteres`;
      }
    }

    // Validações específicas para empresa
    if (formData.tipoUsuario === 'company') {
      // Razão Social
      if (!formData.razaoSocial.trim()) {
        newErrors.razaoSocial = 'Razão social é obrigatória';
      } else if (formData.razaoSocial.trim().length < 2) {
        newErrors.razaoSocial = 'Razão social deve ter pelo menos 2 caracteres';
      }

      // Nome Fantasia
      if (!formData.nomeFantasia.trim()) {
        newErrors.nomeFantasia = 'Nome fantasia é obrigatório';
      } else if (formData.nomeFantasia.trim().length < 2) {
        newErrors.nomeFantasia = 'Nome fantasia deve ter pelo menos 2 caracteres';
      }

      // CNPJ
      if (!formData.cnpj.trim()) {
        newErrors.cnpj = 'CNPJ é obrigatório';
      } else if (!isValidCNPJ(formData.cnpj)) {
        newErrors.cnpj = 'CNPJ inválido';
      }

      // Responsável
      if (!formData.responsavel.trim()) {
        newErrors.responsavel = 'Nome do responsável é obrigatório';
      } else if (formData.responsavel.trim().length < 2) {
        newErrors.responsavel = 'Nome do responsável deve ter pelo menos 2 caracteres';
      }

      // CPF do Responsável
      if (!formData.cpfResponsavel.trim()) {
        newErrors.cpfResponsavel = 'CPF do responsável é obrigatório';
      } else if (!isValidCPF(formData.cpfResponsavel)) {
        newErrors.cpfResponsavel = 'CPF inválido';
      }
    }

    // Validação do email (comum para ambos)
    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Formato de email inválido';
    }

    // Validação do telefone (comum para ambos)
    if (!formData.telefone.trim()) {
      newErrors.telefone = 'Telefone é obrigatório';
    } else {
      const phoneNumbers = formData.telefone.replace(/\D/g, '');
      if (phoneNumbers.length < 10 || phoneNumbers.length > 11) {
        newErrors.telefone = 'Telefone deve ter 10 ou 11 dígitos';
      }
    }

    // Validação da senha (comum para ambos)
    if (!formData.senha.trim()) {
      newErrors.senha = 'Senha é obrigatória';
    } else if (formData.senha.length < 6) {
      newErrors.senha = 'Senha deve ter pelo menos 6 caracteres';
    }

    // Validação da confirmação de senha (comum para ambos)
    if (!formData.confirmarSenha.trim()) {
      newErrors.confirmarSenha = 'Confirmação de senha é obrigatória';
    } else if (formData.senha !== formData.confirmarSenha) {
      newErrors.confirmarSenha = 'Senhas não coincidem';
    }

    setErrors(newErrors);

    // Se há erros, fazer scroll para o primeiro campo com erro
    if (Object.keys(newErrors).length > 0) {
      const firstErrorField = Object.keys(newErrors)[0] as keyof typeof fieldRefs;
      const fieldRef = fieldRefs[firstErrorField];
      
      if (fieldRef?.current) {
        // Aguardar um pouco para garantir que o estado foi atualizado
        setTimeout(() => {
          fieldRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
          fieldRef.current?.focus();
        }, 100);
      }
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    setShowTermsModal(true);
  };

  const handleConfirmRegistration = async () => {
    console.log('🚀 handleConfirmRegistration iniciado');
    setShowTermsModal(false);
    setIsLoading(true);
    setError(null);

    try {
      console.log('📝 Dados do formulário:', formData);
      
      // Importar o authUtils dinamicamente
      const { authUtils } = await import('@/services/authService');
      console.log('✅ authUtils importado com sucesso');
      
      // Preparar dados baseados no tipo de usuário
      const signUpData = {
        email: formData.email,
        phone: formData.telefone,
        password: formData.senha,
        userType: formData.tipoUsuario as 'professional' | 'company',
        ...(formData.tipoUsuario === 'professional' ? {
          fullName: formData.nomeCompleto,
          cpf: formData.cpf,
          birthDate: formData.dataNascimento,
          specialty: formData.especialidade,
          registrationCode: formData.crm || undefined
        } : {
          companyName: formData.razaoSocial,
          tradeName: formData.nomeFantasia,
          cnpj: formData.cnpj,
          responsibleName: formData.responsavel,
          responsibleCpf: formData.cpfResponsavel
        })
      };

      const { user, error: authError } = await authUtils.signUp(signUpData);

      console.log('📧 Resultado do signUp:', { user, authError });

      if (authError || !user) {
        console.error('❌ Erro no cadastro:', authError);
        setError(`Erro ao criar conta: ${authError || 'Erro desconhecido'}`);
        setErrors({ 
          email: 'Erro ao criar conta. Tente novamente.',
          senha: 'Erro ao criar conta. Tente novamente.'
        });
      } else {
        console.log('✅ Cadastro bem-sucedido:', user);
        // Cadastro bem-sucedido - mostrar modal de confirmação de e-mail
        setShowEmailConfirmationModal(true);
      }
    } catch (error) {
      console.error('💥 Erro inesperado no handleConfirmRegistration:', error);
      setError(`Erro ao criar conta: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      setErrors({ 
        email: 'Erro ao criar conta. Tente novamente.',
        senha: 'Erro ao criar conta. Tente novamente.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelRegistration = () => {
    setShowTermsModal(false);
  };

  const handleEmailConfirmationClose = () => {
    setShowEmailConfirmationModal(false);
    // Redirecionar para a página de login após fechar o modal
    router.push('/entrar');
  };


  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header da página */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Criar Conta</h1>
          <p className="text-gray-600">Preencha os dados abaixo para criar sua conta</p>
        </div>

        {/* Seletor de Tipo de Usuário */}
        <div className="bg-white rounded-3xl shadow-md p-8 mb-6">
          <UserTypeSelector
            selectedType={formData.tipoUsuario}
            onTypeChange={(type) => handleInputChange('tipoUsuario', type)}
            error={errors.tipoUsuario}
          />
        </div>

        {/* Formulário */}
        <div className="bg-white rounded-3xl shadow-md p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campos específicos para Profissional */}
            {formData.tipoUsuario === 'professional' && (
              <>
                {/* Seção de Dados Pessoais */}
                <div className="border-b border-gray-200 pb-4 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Dados Pessoais</h3>
                  <p className="text-sm text-gray-600">Suas informações pessoais</p>
                </div>

                <Input
                  ref={fieldRefs.nomeCompleto}
                  label="Nome completo"
                  value={formData.nomeCompleto}
                  onChange={(value) => handleInputChange('nomeCompleto', value)}
                  placeholder="Seu nome completo"
                  required
                />
                {errors.nomeCompleto && (
                  <p className="text-red-500 text-sm mt-1">{errors.nomeCompleto}</p>
                )}

                <Input
                  ref={fieldRefs.cpf}
                  label="CPF"
                  value={formData.cpf}
                  onChange={(value) => handleInputChange('cpf', value)}
                  placeholder="000.000.000-00"
                  mask="cpf"
                  required
                  validate={validateCPF}
                  showValidationError={true}
                />
                {errors.cpf && (
                  <p className="text-red-500 text-sm mt-1">{errors.cpf}</p>
                )}

                <Input
                  ref={fieldRefs.dataNascimento}
                  label="Data de nascimento"
                  type="date"
                  value={formData.dataNascimento}
                  onChange={(value) => handleInputChange('dataNascimento', value)}
                  required
                />
                {errors.dataNascimento && (
                  <p className="text-red-500 text-sm mt-1">{errors.dataNascimento}</p>
                )}

                {/* Seção de Registro Profissional */}
                <div className="border-t border-gray-200 pt-6 mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Registro Profissional</h3>
                </div>

                <Select
                  label="Especialidade"
                  options={SPECIALTIES}
                  value={formData.especialidade}
                  onChange={(value) => handleInputChange('especialidade', value)}
                  placeholder="Selecione sua especialidade"
                />
                {errors.especialidade && (
                  <p className="text-red-500 text-sm mt-1">{errors.especialidade}</p>
                )}

                {/* Input de registro profissional - só aparece quando especialidade for selecionada */}
                {formData.especialidade && (
                  <Input
                    ref={fieldRefs.crm}
                    label={`${getSpecialtyRegistrationCode(formData.especialidade)}`}
                    value={formData.crm}
                    onChange={(value) => handleInputChange('crm', value)}
                    placeholder={`Seu número de ${getSpecialtyRegistrationCode(formData.especialidade)}`}
                    required
                  />
                )}
                {errors.crm && (
                  <p className="text-red-500 text-sm mt-1">{errors.crm}</p>
                )}
              </>
            )}

            {/* Campos específicos para Empresa */}
            {formData.tipoUsuario === 'company' && (
              <>
                <div className="border-b border-gray-200 pb-4 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Dados da Empresa</h3>
                  <p className="text-sm text-gray-600">Informações da sua clínica ou instituição</p>
                </div>

                <Input
                  ref={fieldRefs.razaoSocial}
                  label="Razão Social"
                  value={formData.razaoSocial}
                  onChange={(value) => handleInputChange('razaoSocial', value)}
                  placeholder="Nome oficial da empresa"
                  required
                />
                {errors.razaoSocial && (
                  <p className="text-red-500 text-sm mt-1">{errors.razaoSocial}</p>
                )}

                <Input
                  ref={fieldRefs.nomeFantasia}
                  label="Nome Fantasia"
                  value={formData.nomeFantasia}
                  onChange={(value) => handleInputChange('nomeFantasia', value)}
                  placeholder="Nome comercial da empresa"
                  required
                />
                {errors.nomeFantasia && (
                  <p className="text-red-500 text-sm mt-1">{errors.nomeFantasia}</p>
                )}

                <Input
                  ref={fieldRefs.cnpj}
                  label="CNPJ"
                  value={formData.cnpj}
                  onChange={(value) => handleInputChange('cnpj', value)}
                  placeholder="00.000.000/0000-00"
                  mask="cnpj"
                  required
                  validate={validateCNPJ}
                  showValidationError={true}
                />
                {errors.cnpj && (
                  <p className="text-red-500 text-sm mt-1">{errors.cnpj}</p>
                )}

                <div className="border-t border-gray-200 pt-6 mt-6">
                  <h4 className="text-md font-semibold text-gray-900 mb-4">Dados do Responsável</h4>
                  
                  <div className="space-y-6">
                    <Input
                      ref={fieldRefs.responsavel}
                      label="Nome do Responsável"
                      value={formData.responsavel}
                      onChange={(value) => handleInputChange('responsavel', value)}
                      placeholder="Nome completo do responsável"
                      required
                    />
                    {errors.responsavel && (
                      <p className="text-red-500 text-sm mt-1">{errors.responsavel}</p>
                    )}

                    <Input
                      ref={fieldRefs.cpfResponsavel}
                      label="CPF do Responsável"
                      value={formData.cpfResponsavel}
                      onChange={(value) => handleInputChange('cpfResponsavel', value)}
                      placeholder="000.000.000-00"
                      mask="cpf"
                      required
                      validate={validateCPF}
                      showValidationError={true}
                    />
                    {errors.cpfResponsavel && (
                      <p className="text-red-500 text-sm mt-1">{errors.cpfResponsavel}</p>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Campos comuns */}
            <div className="border-t border-gray-200 pt-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Dados de Acesso</h3>
            </div>

            <Input
              ref={fieldRefs.email}
              label="Email"
              type="email"
              value={formData.email}
              onChange={(value) => handleInputChange('email', value)}
              placeholder="seuemail@exemplo.com"
              required
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}

            <Input
              ref={fieldRefs.telefone}
              label="Telefone"
              value={formData.telefone}
              onChange={(value) => handleInputChange('telefone', value)}
              placeholder="(11) 99999-9999"
              mask="phone"
              required
            />
            {errors.telefone && (
              <p className="text-red-500 text-sm mt-1">{errors.telefone}</p>
            )}

            <Input
              ref={fieldRefs.senha}
              label="Senha"
              type="password"
              value={formData.senha}
              onChange={(value) => handleInputChange('senha', value)}
              placeholder="••••••••"
              required
            />
            {errors.senha && (
              <p className="text-red-500 text-sm mt-1">{errors.senha}</p>
            )}

            <Input
              ref={fieldRefs.confirmarSenha}
              label="Confirmar Senha"
              type="password"
              value={formData.confirmarSenha}
              onChange={(value) => handleInputChange('confirmarSenha', value)}
              placeholder="••••••••"
              required
            />
            {errors.confirmarSenha && (
              <p className="text-red-500 text-sm mt-1">{errors.confirmarSenha}</p>
            )}

            {/* Global error message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              Cadastrar
            </Button>
          </form>

          {/* Link para login */}
          <div className="text-center mt-6 pt-6 border-t border-gray-200">
            <div className="text-gray-600">
              Já tem uma conta?{' '}
              <Link
                href="/entrar"
                className="text-[#2b9af3] hover:text-[#1e7ce6] font-medium transition-colors"
              >
                Faça login
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Termos de Uso */}
      <Modal
        isOpen={showTermsModal}
        onClose={handleCancelRegistration}
        title="Termos de Uso"
        subtitle="Leia e aceite nossos termos para continuar"
        size="md"
        primaryButton={{
          text: 'Continuar Cadastro',
          onClick: handleConfirmRegistration,
          loading: isLoading,
          disabled: isLoading
        }}
        secondaryButton={{
          text: 'Cancelar',
          onClick: handleCancelRegistration
        }}
      >
        <div className="space-y-4 text-sm text-gray-700">
          <div>
            Ao criar uma conta na plataforma Sublease, você concorda com nossos{' '}
            <Link
              href="/termos-de-uso"
              target="_blank"
              className="text-[#2b9af3] hover:text-[#1e7ce6] underline transition-colors duration-200"
            >
              Termos de Uso
            </Link>
            {' '}e{' '}
            <Link
              href="/politica-privacidade"
              target="_blank"
              className="text-[#2b9af3] hover:text-[#1e7ce6] underline transition-colors duration-200"
            >
              Política de Privacidade
            </Link>
            .
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Principais pontos:</h3>
            <ul className="list-disc list-inside text-blue-800 space-y-1">
              <li>Seus dados serão protegidos conforme a LGPD</li>
              <li>Você é responsável pelas informações fornecidas</li>
              <li>A plataforma atua como intermediária</li>
              <li>Você pode cancelar sua conta a qualquer momento</li>
            </ul>
          </div>

          <p>
            Para ler os termos completos, clique nos links acima.
          </p>
        </div>
      </Modal>

      {/* Modal de Confirmação de E-mail */}
      <Modal
        isOpen={showEmailConfirmationModal}
        onClose={handleEmailConfirmationClose}
        title="Confirme seu e-mail"
        subtitle="Verificação necessária para ativar sua conta"
        size="md"
        primaryButton={{
          text: 'Entendi',
          onClick: handleEmailConfirmationClose,
          loading: false
        }}
      >
        <div className="text-center py-4">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-6">
            <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Verificação de e-mail enviada!
          </h3>
          
          <div className="space-y-4 text-sm text-gray-600">
            <p>
              Enviamos um e-mail de confirmação para:
            </p>
            <p className="font-semibold text-gray-900 bg-gray-50 p-3 rounded-lg">
              {formData.email}
            </p>
            <p>
              <strong>Próximos passos:</strong>
            </p>
            <ul className="text-left space-y-2 bg-blue-50 p-4 rounded-lg">
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">1.</span>
                Verifique sua caixa de entrada (e spam)
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">2.</span>
                Clique no link de confirmação no e-mail
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">3.</span>
                Volte aqui e faça login com suas credenciais
              </li>
            </ul>
            <p className="text-xs text-gray-500">
              Não recebeu o e-mail? Verifique sua pasta de spam ou aguarde alguns minutos.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CadastrarPage;
