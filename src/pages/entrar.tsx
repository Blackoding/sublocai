import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { useAuthStore } from '@/stores/authStore';

const EntrarPage = () => {
  const router = useRouter();
  const { signIn } = useAuthStore();
  const [formData, setFormData] = useState({
    email: '',
    senha: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Clear errors when user starts typing
  useEffect(() => {
    if (error) {
      setError(null);
    }
  }, [formData.email, formData.senha]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpa erro do campo quando usuário começa a digitar
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validação do email
    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Digite um email válido';
    }

    // Validação da senha
    if (!formData.senha) {
      newErrors.senha = 'Senha é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const success = await signIn({
        email: formData.email,
        password: formData.senha
      });

      if (success) {
        // Login bem-sucedido
        // Verificar se há parâmetro de redirecionamento
        const redirectTo = router.query.redirect as string;
        if (redirectTo) {
          router.push(redirectTo);
        } else {
          // Redirecionar para o painel de controle após login
          router.push('/painel-de-controle');
        }
      } else {
        setError('Email ou senha incorretos');
        setErrors({ 
          email: 'Email ou senha incorretos',
          senha: 'Email ou senha incorretos'
        });
      }
    } catch {
      setError('Erro ao fazer login. Tente novamente.');
      setErrors({ 
        email: 'Erro ao fazer login',
        senha: 'Erro ao fazer login'
      });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="max-w-md mx-auto px-4 py-8">
        {/* Header da página */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Entrar</h1>
          <p className="text-gray-600">Faça login em sua conta</p>
        </div>

        {/* Formulário */}
        <div className="bg-white rounded-3xl shadow-md p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(value) => handleInputChange('email', value)}
              placeholder="seu@email.com"
              required
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}

            {/* Senha */}
            <Input
              label="Senha"
              type="password"
              value={formData.senha}
              onChange={(value) => handleInputChange('senha', value)}
              placeholder="Digite sua senha"
              required
            />
            {errors.senha && (
              <p className="text-red-500 text-sm mt-1">{errors.senha}</p>
            )}

            {/* Global error message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Esqueci minha senha */}
            <div className="text-right">
              <Link
                href="/esqueci-senha"
                className="text-sm text-[#2b9af3] hover:text-[#1e7ce6] transition-colors"
              >
                Esqueci minha senha
              </Link>
            </div>

            {/* Botão Entrar */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          {/* Divisor */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-center">
              <p className="text-gray-600 mb-4">Não tem uma conta?</p>
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="w-full"
                onClick={() => router.push('/cadastrar')}
                disabled={isLoading}
              >
                Cadastrar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EntrarPage;
