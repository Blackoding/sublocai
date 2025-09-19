import SublocationCard from "./SublocationCard";
import { SublocationPlus, Clinic } from '@/types';
import { useClinicRating } from '@/hooks/useClinicRating';
import { formatDetailedAddress } from '@/constants/address';

interface MightLikeProps {
  featuredClinics: Clinic[];
}

// Componente para carregar rating individualmente
const ClinicCardWithRating = ({ clinic }: { clinic: Clinic }) => {
  const { rating } = useClinicRating(clinic.id);

  return (
    <SublocationCard
      key={clinic.id}
      id={clinic.id || ''}
      title={clinic.title}
      address={formatDetailedAddress(clinic)}
      price={clinic.price.toString()}
      imageUrl={clinic.images && clinic.images.length > 0 ? clinic.images[0] : '/office-empty.jpg'}
      plus={clinic.features as SublocationPlus[]}
      rating={rating}
    />
  );
};

const MightLike = ({ featuredClinics }: MightLikeProps) => {

  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
        Você pode gostar
      </h2>
      
      {featuredClinics.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredClinics.map((clinic) => (
            <ClinicCardWithRating
              key={clinic.id}
              clinic={clinic}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-600">Nenhum consultório disponível no momento.</p>
        </div>
      )}
    </div>
  );
};

export default MightLike;
