import Link from 'next/link';

interface AuthWarningProps {
  title: string;
  message: string;
  loginUrl?: string;
  registerUrl?: string;
  redirectTo?: string;
}

const AuthWarning: React.FC<AuthWarningProps> = ({
  title,
  message,
  loginUrl = '/entrar',
  registerUrl = '/cadastrar',
  redirectTo
}) => {
  // Construir URLs com parâmetro de redirecionamento
  const loginUrlWithRedirect = redirectTo 
    ? `${loginUrl}?redirect=${encodeURIComponent(redirectTo)}`
    : loginUrl;
  
  const registerUrlWithRedirect = redirectTo 
    ? `${registerUrl}?redirect=${encodeURIComponent(redirectTo)}`
    : registerUrl;
  return (
    <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-amber-800">
            {title}
          </h3>
          <div className="mt-2 text-sm text-amber-700">
            <p>{message}</p>
          </div>
          <div className="mt-4">
            <div className="flex space-x-3">
              <Link
                href={loginUrlWithRedirect}
                className="bg-amber-100 px-3 py-2 rounded-md text-sm font-medium text-amber-800 hover:bg-amber-200 transition-colors duration-200"
              >
                Fazer Login
              </Link>
              <Link
                href={registerUrlWithRedirect}
                className="bg-amber-600 px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-amber-700 transition-colors duration-200"
              >
                Criar Conta
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthWarning;
