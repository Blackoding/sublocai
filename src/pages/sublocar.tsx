import { useState, useMemo, useEffect } from 'react';
import { SublocationPlus, Clinic } from '@/types';
// import { SPECIALTIES } from '@/constants/specialties';
import { ALL_FEATURES } from '@/constants/features';
import SublocationCard from '@/components/SublocationCard';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Select from '@/components/Select';
import Checkbox from '@/components/Checkbox';
import AdSense from '@/components/AdSense';
import Loading from '@/components/Loading';
import { formatDetailedAddress } from '@/constants/address';
import { useSpecialties } from '@/hooks/useSpecialties';
import { useClinicRating } from '@/hooks/useClinicRating';

// Componente para carregar rating individualmente
const ConsultorioCardWithRating = ({ consultorio }: { consultorio: Consultorio }) => {
  const { rating } = useClinicRating(consultorio.id);

  return (
    <SublocationCard
      id={consultorio.id || 'unknown'}
      title={consultorio.title}
      address={formatDetailedAddress(consultorio)}
      price={consultorio.price.toString()}
      imageUrl={consultorio.images && consultorio.images.length > 0 ? consultorio.images[0] : '/office-empty.jpg'}
      plus={consultorio.features as SublocationPlus[]}
      rating={rating}
    />
  );
};

// Usar a interface Clinic centralizada dos tipos
type Consultorio = Clinic;

const SublocarPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedPriceRange, setSelectedPriceRange] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedFeatures, setSelectedFeatures] = useState<SublocationPlus[]>([]);
  const [showAllFeatures, setShowAllFeatures] = useState(false);
  const [consultorios, setConsultorios] = useState<Consultorio[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Hook para especialidades
  const { getSpecialtyLabel } = useSpecialties();

  // Carregar consultórios ativos do banco de dados
  useEffect(() => {
    const loadActiveClinics = async () => {
      try {
        setIsLoading(true);
        console.log('🔄 Carregando consultórios ativos...');
        
        const { clinicUtils } = await import('@/services/clinicService');
        
        const result = await clinicUtils.getActiveClinics();
        
        if (result.success && result.clinics) {
          console.log('✅ Consultórios carregados:', result.clinics.length);
          console.log('📋 Dados dos consultórios:', result.clinics);
          setConsultorios(result.clinics);
        } else {
          console.error('❌ Erro ao carregar consultórios:', result.error);
          setConsultorios([]);
        }
      } catch (error) {
        console.error('💥 Erro inesperado ao carregar consultórios:', error);
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


  // Faixas de preço fixas
  const priceRanges = useMemo(() => [
    {
      value: '0-50',
      label: 'R$ 0 - R$ 50/hora',
      min: 0,
      max: 50
    },
    {
      value: '50-100',
      label: 'R$ 50 - R$ 100/hora',
      min: 50,
      max: 100
    },
    {
      value: '100-150',
      label: 'R$ 100 - R$ 150/hora',
      min: 100,
      max: 150
    },
    {
      value: '150-200',
      label: 'R$ 150 - R$ 200/hora',
      min: 150,
      max: 200
    },
    {
      value: '200-300',
      label: 'R$ 200 - R$ 300/hora',
      min: 200,
      max: 300
    },
    {
      value: '300+',
      label: 'Acima de R$ 300/hora',
      min: 300,
      max: Infinity
    }
  ], []);

  // Filtro dos consultórios
  const filteredConsultorios = useMemo(() => {
    return consultorios.filter(consultorio => {
      // Filtro por termo de busca
      const matchesSearch = searchTerm === '' || 
        consultorio.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        formatDetailedAddress(consultorio).toLowerCase().includes(searchTerm.toLowerCase()) ||
        consultorio.city.toLowerCase().includes(searchTerm.toLowerCase());

      // Filtro por região (usando cidade)
      const matchesRegion = selectedRegion === '' || consultorio.city === selectedRegion;

      // Filtro por faixa de preço
      let matchesPriceRange = true;
      if (selectedPriceRange !== '') {
        const selectedRange = priceRanges.find(range => range.value === selectedPriceRange);
        if (selectedRange) {
          const price = consultorio.price;
          if (selectedRange.max === Infinity) {
            // Para faixa "300+", verifica apenas se é maior ou igual ao mínimo
            matchesPriceRange = price >= selectedRange.min;
          } else {
            // Para outras faixas, verifica se está dentro do intervalo
            matchesPriceRange = price >= selectedRange.min && price <= selectedRange.max;
          }
        }
      }

      // Filtro por especialidade
      const matchesSpecialty = selectedSpecialty === '' || 
        consultorio.specialty === selectedSpecialty ||
        consultorio.specialties.includes(selectedSpecialty);

      // Filtro por features
      const matchesFeatures = selectedFeatures.length === 0 || 
        selectedFeatures.every(feature => consultorio.features.includes(feature));

      return matchesSearch && matchesRegion && matchesPriceRange && matchesSpecialty && matchesFeatures;
    });
  }, [searchTerm, selectedRegion, selectedPriceRange, selectedSpecialty, selectedFeatures, consultorios, priceRanges]);


  const clearFilters = () => {
    setSearchTerm('');
    setSelectedRegion('');
    setSelectedPriceRange('');
    setSelectedSpecialty('');
    setSelectedFeatures([]);
    setShowAllFeatures(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-4">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* AdSense Banner */}
        <div className="mt-8">
          <AdSense />
        </div>
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filtros */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="bg-white rounded-3xl shadow-md p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Filtros</h2>
                {(searchTerm || selectedRegion || selectedPriceRange || selectedSpecialty || selectedFeatures.length > 0) && (
                  <Button 
                    onClick={clearFilters}
                    variant="outline"
                    size="sm"
                    className="text-sm"
                  >
                    Limpar todos
                  </Button>
                )}
              </div>

              {/* Busca */}
              <div className="mb-6">
                <Input
                  label="Buscar"
                  value={searchTerm}
                  onChange={setSearchTerm}
                  placeholder="Nome ou endereço..."
                />
              </div>

              {/* Região */}
              <div className="mb-6">
                <Select
                  label="Região"
                  value={selectedRegion}
                  onChange={setSelectedRegion}
                  placeholder="Todas as regiões"
                  options={[
                    { value: '', label: 'Todas as regiões' },
                    ...regions.map(region => ({ value: region, label: region }))
                  ]}
                />
              </div>

              {/* Faixa de preço */}
              <div className="mb-6">
                <Select
                  label="Faixa de preço"
                  value={selectedPriceRange}
                  onChange={setSelectedPriceRange}
                  placeholder="Todas as faixas"
                  options={[
                    { value: '', label: 'Todas as faixas' },
                    ...priceRanges.map(range => ({ value: range.value, label: range.label }))
                  ]}
                />
              </div>

              {/* Especialidade */}
              <div className="mb-6">
                <Select
                  label="Especialidade"
                  value={selectedSpecialty}
                  onChange={setSelectedSpecialty}
                  placeholder="Todas as especialidades"
                  options={[
                    { value: '', label: 'Todas as especialidades' },
                    ...specialties.map(specialty => ({ value: specialty, label: getSpecialtyLabel(specialty) }))
                  ]}
                />
              </div>

              {/* Features */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comodidades
                </label>
                <div className={`space-y-2 ${showAllFeatures ? 'max-h-48 overflow-y-auto pr-2' : ''}`}>
                  {(showAllFeatures ? ALL_FEATURES : ALL_FEATURES.slice(0, 3)).map(feature => (
                    <Checkbox
                      key={feature.value}
                      label={feature.label}
                      checked={selectedFeatures.includes(feature.value)}
                      onChange={(checked) => {
                        if (checked) {
                          setSelectedFeatures(prev => [...prev, feature.value]);
                        } else {
                          setSelectedFeatures(prev => prev.filter(f => f !== feature.value));
                        }
                      }}
                      value={feature.value}
                    />
                  ))}
                  {!showAllFeatures && (
                    <Button
                      onClick={() => setShowAllFeatures(true)}
                      variant="outline"
                      size="sm"
                      className="w-full text-left justify-start"
                    >
                      Mostrar todas
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Lista de consultórios */}
          <div className="flex-1">
            {/* Resultados */}
            <div className="mb-6">
              <p className="text-gray-600">
                {filteredConsultorios.length} consultório{filteredConsultorios.length !== 1 ? 's' : ''} encontrado{filteredConsultorios.length !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Grid de consultórios */}
            {isLoading ? (
              <Loading 
                message="Carregando consultórios..."
                description="Buscando consultórios disponíveis para sublocação."
              />
            ) : filteredConsultorios.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                {filteredConsultorios.map((consultorio) => (
                  <ConsultorioCardWithRating
                    key={consultorio.id || 'unknown'}
                    consultorio={consultorio}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum consultório encontrado</h3>
                <p className="text-gray-600 mb-4">Tente ajustar os filtros para encontrar mais opções</p>
                <Button 
                  onClick={clearFilters}
                  variant="primary"
                  size="md"
                >
                  Limpar filtros
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SublocarPage;
