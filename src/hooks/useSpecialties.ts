import { SPECIALTIES } from '@/constants/specialties';

export const useSpecialties = () => {
  const getSpecialtyLabel = (specialtyValue: string) => {
    const specialty = SPECIALTIES.find(s => s.value === specialtyValue);
    return specialty ? specialty.label : specialtyValue;
  };

  const getAllSpecialties = () => {
    return SPECIALTIES;
  };

  const getSpecialtyByValue = (value: string) => {
    return SPECIALTIES.find(s => s.value === value);
  };

  return {
    getSpecialtyLabel,
    getAllSpecialties,
    getSpecialtyByValue
  };
};
