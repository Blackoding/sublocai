import Link from 'next/link';
import Image from 'next/image';
import Button from '@/components/Button';
import { getSpecialtyLabel } from '@/constants/specialties';

interface ClinicCardProps {
  clinic: {
    id: string;
    title: string;
    address: string;
    price: string;
    specialty: string;
    status: string;
    images: string[];
    views: number;
    bookings: number;
    rating?: number; // Média de rating dos comentários
  };
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onToggleStatus?: (id: string) => void;
  showActions?: boolean;
}

const ClinicCard: React.FC<ClinicCardProps> = ({
  clinic,
  onEdit,
  onDelete,
  onToggleStatus,
  showActions = true
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo':
        return 'bg-green-100 text-green-800';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800';
      case 'inativo':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ativo':
        return 'Ativo';
      case 'pendente':
        return 'Pendente';
      case 'inativo':
        return 'Inativo';
      default:
        return status;
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span
        key={index}
        className={`text-sm ${
          index < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'
        }`}
      >
        ★
      </span>
    ));
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
        {/* Clinic image - no padding, touching the border */}
        <div className="h-[180px] w-64 flex-shrink-0">
          <div className="w-full h-full rounded-l-2xl overflow-hidden bg-gray-200">
            <Image
              src={clinic.images[0]}
              alt={clinic.title}
              width={256}
              height={180}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = '/office-empty.jpg';
              }}
            />
          </div>
        </div>
        
        {/* Clinic information - with padding */}
        <div className="flex-1 p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {clinic.title}
              </h3>
              <p className="text-gray-600 mb-2">{clinic.address}</p>
              
              {/* Rating */}
              {clinic.rating !== undefined && clinic.rating > 0 && (
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center">
                    {renderStars(clinic.rating)}
                  </div>
                  <span className="text-sm text-gray-600">
                    {clinic.rating.toFixed(1)}/5
                  </span>
                </div>
              )}
              
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span className="flex items-center">
                  R$ {clinic.price}/hora
                </span>
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {getSpecialtyLabel(clinic.specialty)}
                </span>
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  {clinic.views} visualizações
                </span>
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {clinic.bookings} reservas
                </span>
              </div>
            </div>
            <div className="ml-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(clinic.status)}`}>
                {getStatusText(clinic.status)}
              </span>
            </div>
          </div>

          {/* Actions */}
          {showActions && (
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href={`/consultorio/${clinic.id}`} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Visualizar
                </Button>
              </Link>
              
              <Link href={`/agendamentos?clinic=${clinic.id}`}>
                <Button variant="outline" size="sm">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Agendamentos
                </Button>
              </Link>
              
              {onEdit && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onEdit(clinic.id)}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Editar
                </Button>
              )}
              
              {onToggleStatus && clinic.status !== 'pendente' && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onToggleStatus(clinic.id)}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                  </svg>
                  {clinic.status === 'ativo' ? 'Desativar' : 'Ativar'}
                </Button>
              )}
              
              {onDelete && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onDelete(clinic.id)}
                  className="text-red-600 hover:text-red-700 hover:border-red-300"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Excluir
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClinicCard;
