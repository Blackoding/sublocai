import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Modal from '@/components/Modal';

const CadastrarPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nomeCompleto: '',
    email: '',
    cpf: '',
    telefone: '',
    senha: '',
    confirmarSenha: '',
    dataNascimento: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showEmailConfirmationModal, setShowEmailConfirmationModal] = useState(false);

  // Refs para os campos do formulário
  const fieldRefs = {
    nomeCompleto: useRef<HTMLInputElement>(null),
    email: useRef<HTMLInputElement>(null),
    cpf: useRef<HTMLInputElement>(null),
    telefone: useRef<HTMLInputElement>(null),
    senha: useRef<HTMLInputElement>(null),
    confirmarSenha: useRef<HTMLInputElement>(null),
    dataNascimento: useRef<HTMLInputElement>(null)
  };

  // Clear errors when user starts typing
  useEffect(() => {
    if (error) {
      setError(null);
    }
  }, [formData.email, formData.nomeCompleto, formData.cpf, formData.telefone, formData.senha, formData.dataNascimento]);

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

    // Validação do nome completo
    if (!formData.nomeCompleto.trim()) {
      newErrors.nomeCompleto = 'Nome completo é obrigatório';
    } else if (formData.nomeCompleto.trim().length < 2) {
      newErrors.nomeCompleto = 'Nome deve ter pelo menos 2 caracteres';
    }

    // Validação do email
    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Formato de email inválido';
    }

    // Validação do CPF
    if (!formData.cpf.trim()) {
      newErrors.cpf = 'CPF é obrigatório';
    } else {
      const cpfNumbers = formData.cpf.replace(/\D/g, '');
      if (cpfNumbers.length !== 11) {
        newErrors.cpf = 'CPF deve ter 11 dígitos';
      }
    }

    // Validação do telefone
    if (!formData.telefone.trim()) {
      newErrors.telefone = 'Telefone é obrigatório';
    } else {
      const phoneNumbers = formData.telefone.replace(/\D/g, '');
      if (phoneNumbers.length < 10 || phoneNumbers.length > 11) {
        newErrors.telefone = 'Telefone deve ter 10 ou 11 dígitos';
      }
    }

    // Validação da senha
    if (!formData.senha.trim()) {
      newErrors.senha = 'Senha é obrigatória';
    } else if (formData.senha.length < 6) {
      newErrors.senha = 'Senha deve ter pelo menos 6 caracteres';
    }

    // Validação da confirmação de senha
    if (!formData.confirmarSenha.trim()) {
      newErrors.confirmarSenha = 'Confirmação de senha é obrigatória';
    } else if (formData.senha !== formData.confirmarSenha) {
      newErrors.confirmarSenha = 'Senhas não coincidem';
    }

    // Validação da data de nascimento
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
      
      const { user, error: authError } = await authUtils.signUp({
        fullName: formData.nomeCompleto,
        email: formData.email,
        cpf: formData.cpf,
        phone: formData.telefone,
        password: formData.senha,
        birthDate: formData.dataNascimento
      });

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

        {/* Formulário */}
        <div className="bg-white rounded-3xl shadow-md p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
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
              ref={fieldRefs.cpf}
              label="CPF"
              value={formData.cpf}
              onChange={(value) => handleInputChange('cpf', value)}
              placeholder="000.000.000-00"
              mask="cpf"
              required
            />
            {errors.cpf && (
              <p className="text-red-500 text-sm mt-1">{errors.cpf}</p>
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
