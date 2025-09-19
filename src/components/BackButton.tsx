import { useRouter } from 'next/router';

interface BackButtonProps {
  className?: string;
  children?: React.ReactNode;
}

export const BackButton = ({ className = '', children }: BackButtonProps) => {
  const router = useRouter();

  return (
    <button 
      onClick={() => router.back()}
      className={`flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer ${className}`}
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
      {children || 'Voltar'}
    </button>
  );
};
