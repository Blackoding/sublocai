import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { useImageService } from '@/services/imageService';

interface AvatarUploadProps {
  currentAvatar?: string;
  userName: string;
  onAvatarChange: (avatarUrl: string | null) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({
  currentAvatar,
  userName,
  onAvatarChange,
  disabled = false,
  size = 'lg'
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { 
    isLoading: serviceLoading, 
    error: serviceError, 
    uploadImage, 
    deleteImage, 
    extractFileNameFromUrl,
    clearError 
  } = useImageService();

  const sizeClasses = {
    sm: 'w-16 h-16 text-lg',
    md: 'w-20 h-20 text-xl',
    lg: 'w-24 h-24 text-2xl',
    xl: 'w-32 h-32 text-3xl'
  };


  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);
    clearError();

    try {
      // Fazer upload da nova imagem
      const result = await uploadImage(file, 'avatars');

      if (result.success && result.url) {
        // Se havia uma imagem anterior, deletar ela
        if (currentAvatar) {
          const oldFileName = extractFileNameFromUrl(currentAvatar);
          if (oldFileName) {
            await deleteImage('avatars', oldFileName);
          }
        }

        onAvatarChange(result.url);
      } else {
        setError(result.error || 'Erro ao fazer upload da imagem');
      }
    } catch {
      setError('Erro inesperado ao fazer upload da imagem');
      // console.error('Error uploading avatar:', error);
    } finally {
      setIsUploading(false);
      // Limpar o input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveAvatar = async () => {
    if (!currentAvatar) return;

    setIsUploading(true);
    setError(null);
    clearError();

    try {
      const fileName = extractFileNameFromUrl(currentAvatar);
      if (fileName) {
        await deleteImage('avatars', fileName);
      }
      onAvatarChange(null);
    } catch {
      setError('Erro ao remover imagem');
      // console.error('Error removing avatar:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClick = () => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Avatar Display */}
      <div className="relative group">
        <div
          className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-bold text-white bg-[#2b9af3] cursor-pointer transition-all duration-200 ${
            disabled || isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#1e7ce6] hover:scale-105'
          } ${isUploading ? 'animate-pulse' : ''}`}
          onClick={handleClick}
        >
          {currentAvatar ? (
            <Image
              src={currentAvatar}
              alt={`Avatar de ${userName}`}
              width={120}
              height={120}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            userName
              .split(' ')
              .map(n => n.charAt(0))
              .join('')
              .toUpperCase()
              .slice(0, 2)
          )}
        </div>

        {/* Upload Overlay */}
        {!disabled && !isUploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        )}

        {/* Loading Overlay */}
        {(isUploading || serviceLoading) && (
          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-2">
        <button
          onClick={handleClick}
          disabled={disabled || isUploading || serviceLoading}
          className="px-3 py-1 text-sm bg-[#2b9af3] text-white rounded-lg hover:bg-[#1e7ce6] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {(isUploading || serviceLoading) ? 'Enviando...' : 'Alterar Foto'}
        </button>

        {currentAvatar && (
          <button
            onClick={handleRemoveAvatar}
            disabled={disabled || isUploading || serviceLoading}
            className="px-3 py-1 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            Remover
          </button>
        )}
      </div>

      {/* Error Message */}
      {(error || serviceError) && (
        <div className="text-sm text-red-600 text-center max-w-xs">
          {error || serviceError}
        </div>
      )}

      {/* File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || isUploading}
      />

      {/* Help Text */}
      <div className="text-xs text-gray-500 text-center max-w-xs">
        <p>Formatos aceitos: JPG, PNG, WebP</p>
        <p>Tamanho máximo: 5MB</p>
        <p>Recomendado: 400x400px</p>
      </div>
    </div>
  );
};

export default AvatarUpload;
