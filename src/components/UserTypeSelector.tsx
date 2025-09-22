import React from 'react';
import RadioButton from './RadioButton';

interface UserTypeSelectorProps {
  selectedType: 'professional' | 'company' | null;
  onTypeChange: (type: 'professional' | 'company') => void;
  error?: string;
}

const UserTypeSelector: React.FC<UserTypeSelectorProps> = ({
  selectedType,
  onTypeChange,
  error
}) => {
  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Como você gostaria de se cadastrar?
        </h2>
        <p className="text-gray-600 text-sm">
          Escolha o tipo de conta que melhor se adequa ao seu perfil
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Opção Profissional */}
        <RadioButton
          value="professional"
          selectedValue={selectedType}
          onChange={onTypeChange}
          icon={
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          }
          title="Sou Profissional"
          description="Médico, dentista ou outro profissional da saúde"
        />

        {/* Opção Empresa */}
        <RadioButton
          value="company"
          selectedValue={selectedType}
          onChange={onTypeChange}
          icon={
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          }
          title="Sou Empresa"
          description="Clínica, hospital ou instituição de saúde"
        />
      </div>

      {/* Mensagem de erro */}
      {error && (
        <div className="text-center">
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
};

export default UserTypeSelector;
