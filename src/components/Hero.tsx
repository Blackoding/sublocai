import React, { useState, useEffect, useMemo } from 'react';
import Select from './Select';
import Button from './Button';
import Icon from './Icon';
import Input from './Input';
import { useSpecialties } from '@/hooks/useSpecialties';

interface Consultorio {
  id?: string;
  title: string;
  cep?: string;
  street?: string;
  number?: string;
  neighborhood?: string;
  complement?: string;
  city: string;
  state: string;
  price: number;
  specialty: string;
  specialties: string[];
  images: string[];
  features: string[];
  status?: 'pending' | 'active' | 'inactive';
  views?: number;
  bookings?: number;
  created_at?: string;
  updated_at?: string;
  user_id: string;
  rating?: number;
}

const Hero: React.FC = () => {
  const [consultorios, setConsultorios] = useState<Consultorio[]>([]);
  const [, setIsLoading] = useState(true);
  
  // Hook para especialidades
  const { getSpecialtyLabel } = useSpecialties();

  // Carregar consultórios ativos do banco de dados
  useEffect(() => {
    const loadActiveClinics = async () => {
      try {
        setIsLoading(true);
        
        const { clinicUtils } = await import('@/services/clinicService');
        
        const result = await clinicUtils.getActiveClinics();
        
        if (result.success && result.clinics) {
          setConsultorios(result.clinics);
        } else {
          setConsultorios([]);
        }
      } catch (error) {
        console.error('Erro ao carregar consultórios:', error);
        setConsultorios([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadActiveClinics();
  }, []);

  // Filtros - extrair dados únicos dos consultórios
  const regions = useMemo(() => {
    const uniqueRegions = [...new Set(consultorios.map(c => c.city))];
    return uniqueRegions.sort();
  }, [consultorios]);

  const specialties = useMemo(() => {
    const allSpecialties = consultorios.flatMap(c => c.specialties || []);
    const uniqueSpecialties = [...new Set(allSpecialties)];
    return uniqueSpecialties.sort();
  }, [consultorios]);

  return (
    <div className="w-full relative px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 flex flex-col items-center justify-center">
      {/* Container principal com padding e bordas arredondadas */}
      <div className="relative w-full mx-auto rounded-[20px] sm:rounded-[40px] lg:rounded-[70px] overflow-hidden min-h-[400px] sm:min-h-[500px] lg:min-h-[700px] bg-[url('/bg.jpg')] bg-cover bg-no-repeat p-4 lg:p-14">
        {/* Gradiente do preto para transparente */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/10 to-transparent"></div>
        
        {/* Conteúdo do Hero */}
        <div className="relative z-10 w-full flex flex-col gap-4">
          <h1 className="hidden lg:block text-3xl md:text-5xl font-regular text-white">
            Descubra novos consultórios<br /> em um único lugar
          </h1>
          <p className="hidden lg:block text-lg md:text-xl font-regular text-white">
            Encontre os melhores consultórios de forma rápida e fácil.<br /> Em poucos cliques.
          </p>
        </div>
      </div>
      <div className="w-[90%] sm:w-[86%] bg-white absolute bottom-4 sm:bottom-12 shadow-lg rounded-3xl sm:rounded-4xl p-4 sm:p-6 flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
        <Select
          label="Localização"
          options={[
            { value: '', label: 'Todas as cidades' },
            ...regions.map(region => ({ value: region, label: region }))
          ]}
          placeholder="Selecione uma cidade"
          className="w-full lg:flex-1"
        />
        <Select
          label="Especialidade"
          options={[
            { value: '', label: 'Todas as especialidades' },
            ...specialties.map(specialty => ({ value: specialty, label: getSpecialtyLabel(specialty) }))
          ]}
          placeholder="Selecione uma especialidade"
          className="w-full lg:flex-1"
        />
        <Input
          label="Valor hora"
          type="text"
          placeholder="R$ 0,00"
          className="w-full lg:flex-1"
        />
        <div className="w-full lg:w-auto">
          <Button 
            onClick={() => console.log('Pesquisar consultórios')}
            variant="primary"
            size="md"
            className="w-full lg:w-auto h-12"
          >
            <Icon name="search" size="md" />
            Pesquisar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Hero;
