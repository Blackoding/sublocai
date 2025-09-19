export const SPECIALTIES = [
  { value: 'psychology', label: 'Psicologia/Terapia' },
  { value: 'nutrition', label: 'Nutrição' },
  { value: 'physiotherapy', label: 'Fisioterapia' },
  { value: 'dentistry', label: 'Odontologia' },
];

// Tipos para TypeScript
export type SpecialtyValue = typeof SPECIALTIES[number]['value'];
export type SpecialtyLabel = typeof SPECIALTIES[number]['label'];
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
