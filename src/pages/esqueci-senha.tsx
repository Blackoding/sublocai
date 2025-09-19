import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Button from '@/components/Button';
import Input from '@/components/Input';

const EsqueciSenhaPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /\S+@\S+\.\S+/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Email é obrigatório');
      return;
    }

    if (!validateEmail(email)) {
      setError('Formato de email inválido');
      return;
    }

    setIsLoading(true);
    try {
      // Simula uma chamada de API
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Solicitação de recuperação de senha para:', email);
      setIsSubmitted(true);
    } catch (error) {
      setError('Ocorreu um erro ao enviar a solicitação. Tente novamente.');
      console.error('Erro na recuperação de senha:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.push('/entrar');
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 flex items-center justify-center">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-md p-8">
          <div className="text-center">
            {/* Ícone de sucesso */}
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-4">Email Enviado!</h1>
            <p className="text-gray-600 mb-6">
              Enviamos um link de recuperação para <strong>{email}</strong>. 
              Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
            </p>

            <div className="space-y-4">
              <Button
                onClick={handleBackToLogin}
                variant="primary"
                size="lg"
                className="w-full"
              >
                Voltar ao Login
              </Button>

              <p className="text-sm text-gray-500">
                Não recebeu o email?{' '}
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="text-[#2b9af3] hover:text-[#1e7ce6] font-medium transition-colors"
                >
                  Tentar novamente
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 flex items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Esqueci minha senha</h1>
          <p className="text-gray-600">
            Digite seu email e enviaremos um link para redefinir sua senha
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="seuemail@exemplo.com"
              required
            />
            {error && (
              <p className="text-red-500 text-sm mt-1">{error}</p>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Enviando...' : 'Enviar Link de Recuperação'}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <div className="relative flex items-center justify-center mb-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300"></span>
            </div>
            <div className="relative bg-white px-4 text-sm text-gray-500">
              Ou
            </div>
          </div>
          
          <Link
            href="/entrar"
            className="text-[#2b9af3] hover:text-[#1e7ce6] font-medium transition-colors"
          >
            Voltar ao login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EsqueciSenhaPage;
