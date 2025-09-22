export const SPECIALTIES = [
  { value: 'psychology', label: 'Psicologia/Terapia', registrationCode: 'CRP' },
  { value: 'nutrition', label: 'Nutrição', registrationCode: 'CRN' },
  { value: 'physiotherapy', label: 'Fisioterapia', registrationCode: 'CREFITO' },
  { value: 'dentistry', label: 'Odontologia', registrationCode: 'CRO' },
];

// Tipos para TypeScript
export type SpecialtyValue = typeof SPECIALTIES[number]['value'];
export type SpecialtyLabel = typeof SPECIALTIES[number]['label'];
export type SpecialtyRegistrationCode = typeof SPECIALTIES[number]['registrationCode'];
export type Specialty = typeof SPECIALTIES[number];

// Função para traduzir especialidades de inglês para português
export const getSpecialtyLabel = (specialtyValue: string): string => {
  const specialty = SPECIALTIES.find(s => s.value === specialtyValue);
  return specialty ? specialty.label : specialtyValue;
};

// Função para traduzir múltiplas especialidades
export const getSpecialtyLabels = (specialtyValues: string[]): string[] => {
  return specialtyValues.map(value => getSpecialtyLabel(value));
};

// Função para obter o código de registro da especialidade
export const getSpecialtyRegistrationCode = (specialtyValue: string): string => {
  const specialty = SPECIALTIES.find(s => s.value === specialtyValue);
  return specialty ? specialty.registrationCode : 'CRM';
};
