import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Button from '@/components/Button';
import Modal from '@/components/Modal';
import Loading from '@/components/Loading';
import ClinicCard from '@/components/ClinicCard';
import { useAuthStore } from '@/stores/authStore';
import { useClinicRatings } from '@/hooks/useClinicRatings';
// import { Clinic } from '@/types';
import { formatDetailedAddress } from '@/constants/address';

const ControlPanelPage = () => {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [clinics, setClinics] = useState<Record<string, unknown>[]>([]);
  const [isLoadingClinics, setIsLoadingClinics] = useState(false);
  const [filterStatus, setFilterStatus] = useState('todos');

  // Hook para calcular ratings dos consultórios
  const clinicIds = useMemo(() => 
    clinics.map(c => c.id).filter(Boolean) as string[], 
    [clinics]
  );
  const { getClinicRating } = useClinicRatings(clinicIds);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    clinicId: string | null;
    clinicTitle: string;
  }>({
    isOpen: false,
    clinicId: null,
    clinicTitle: ''
  });

  // Load clinics from Supabase when user is logged in
  useEffect(() => {
    const loadClinics = async () => {
      if (isAuthenticated && user?.id) {
        setIsLoadingClinics(true);
        try {
          
          // Import clinicUtils dynamically
          const { clinicUtils } = await import('@/services/clinicService');
          
          const result = await clinicUtils.getClinicsByUser(user.id);
          
          if (result.success && result.clinics) {
            // console.log('✅ Clinics loaded:', result.clinics);
            
            // Convert Supabase data to component expected format
            const formattedClinics = result.clinics.map(clinic => ({
              id: clinic.id || '',
              title: clinic.title,
              address: formatDetailedAddress(clinic),
              price: clinic.price.toString(),
              status: clinic.status === 'active' ? 'ativo' : 
                     clinic.status === 'pending' ? 'pendente' : 'inativo',
              images: clinic.images || ['/office-empty.jpg'],
              specialty: clinic.specialty,
              createdAt: clinic.created_at || '',
              views: clinic.views || 0,
              bookings: clinic.bookings || 0,
              rating: clinic.rating || 0 // Média de rating dos comentários
            }));
            
            setClinics(formattedClinics);
          } else {
            // console.error('❌ Error loading clinics:', result.error);
            setClinics([]);
          }
        } catch {
          // console.error('💥 Unexpected error loading clinics:', error);
          setClinics([]);
        } finally {
          setIsLoadingClinics(false);
        }
      }
    };

    loadClinics();
  }, [isAuthenticated, user?.id]);

  // Filter clinics by status
  const filteredClinics = clinics.filter(clinic => {
    if (filterStatus === 'todos') return true;
    return clinic.status === filterStatus;
  });

  // Statistics
  const stats = {
    total: clinics.length,
    ativos: clinics.filter(c => c.status === 'ativo').length,
    pendentes: clinics.filter(c => c.status === 'pendente').length,
    inativos: clinics.filter(c => c.status === 'inativo').length,
    totalViews: clinics.reduce((sum, c) => sum + (c.views as number || 0), 0),
    totalBookings: clinics.reduce((sum, c) => sum + (c.bookings as number || 0), 0)
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


  const handleEditClinic = (id: string) => {
    router.push(`/consultorio/editar/${id}`);
  };

  const handleDeleteClinic = (id: string) => {
    const clinic = clinics.find(c => c.id === id);
    if (clinic) {
      setDeleteModal({
        isOpen: true,
        clinicId: id,
        clinicTitle: clinic.title as string
      });
    }
  };

  const confirmDeleteClinic = async () => {
    if (deleteModal.clinicId) {
      try {
        // console.log('🗑️ Deleting clinic:', deleteModal.clinicId);
        
        // Import clinicUtils dynamically
        const { clinicUtils } = await import('@/services/clinicService');
        
        const result = await clinicUtils.deleteClinic(deleteModal.clinicId);
        
        if (result.success) {
          // console.log('✅ Clinic deleted successfully');
          // Remove from local list
          setClinics(prev => prev.filter(c => c.id !== deleteModal.clinicId));
        } else {
          // console.error('❌ Error deleting clinic:', result.error);
          alert(`Erro ao excluir consultório: ${result.error || 'Tente novamente.'}`);
        }
      } catch {
        // console.error('💥 Unexpected error deleting clinic:', error);
        alert('Erro ao excluir consultório. Tente novamente.');
      }
      
      setDeleteModal({
        isOpen: false,
        clinicId: null,
        clinicTitle: ''
      });
    }
  };

  const cancelDeleteClinic = () => {
    setDeleteModal({
      isOpen: false,
      clinicId: null,
      clinicTitle: ''
    });
  };

  const handleToggleStatus = async (id: string) => {
    try {
      const clinic = clinics.find(c => c.id === id);
      if (!clinic) return;

      const newStatus = clinic.status === 'ativo' ? 'inativo' : 'ativo';
      const supabaseStatus = newStatus === 'ativo' ? 'active' : 'inactive';
      
      // console.log('🔄 Changing clinic status:', id, 'to:', supabaseStatus);
      
      // Import clinicUtils dynamically
      const { clinicUtils } = await import('@/services/clinicService');
      
      const result = await clinicUtils.updateClinic(id, { status: supabaseStatus });
      
      if (result.success) {
        // console.log('✅ Status changed successfully');
        // Update in local list
        setClinics(prev => prev.map(c => {
          if (c.id === id) {
            return { ...c, status: newStatus };
          }
          return c;
        }));
      } else {
        // console.error('❌ Error changing status:', result.error);
        alert(`Erro ao alterar status: ${result.error || 'Tente novamente.'}`);
      }
    } catch {
      // console.error('💥 Unexpected error changing status:', error);
      alert('Erro ao alterar status. Tente novamente.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Painel de Controle</h1>
              <p className="text-gray-600">
                Gerencie seus consultórios e acompanhe suas estatísticas
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Link href="/anunciar">
                <Button variant="primary" size="lg">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Novo Consultório
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ativos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.ativos}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pendentes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendentes}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Visualizações</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalViews}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 sm:mb-0">Meus Consultórios</h2>
            <div className="flex space-x-2">
              <Button
                onClick={() => setFilterStatus('todos')}
                variant={filterStatus === 'todos' ? 'primary' : 'outline'}
                size="sm"
                className={filterStatus === 'todos' ? '' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-300'}
              >
                Todos ({stats.total})
              </Button>
              <Button
                onClick={() => setFilterStatus('ativo')}
                variant={filterStatus === 'ativo' ? 'primary' : 'outline'}
                size="sm"
                className={filterStatus === 'ativo' ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-300'}
              >
                Ativos ({stats.ativos})
              </Button>
              <Button
                onClick={() => setFilterStatus('pendente')}
                variant={filterStatus === 'pendente' ? 'primary' : 'outline'}
                size="sm"
                className={filterStatus === 'pendente' ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-300'}
              >
                Pendentes ({stats.pendentes})
              </Button>
              <Button
                onClick={() => setFilterStatus('inativo')}
                variant={filterStatus === 'inativo' ? 'primary' : 'outline'}
                size="sm"
                className={filterStatus === 'inativo' ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-300'}
              >
                Inativos ({stats.inativos})
              </Button>
            </div>
          </div>
        </div>

        {/* Clinics List */}
        <div className="space-y-6">
          {isLoadingClinics ? (
            <Loading 
              message="Carregando consultórios..."
              description="Aguarde enquanto buscamos seus consultórios."
            />
          ) : filteredClinics.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum consultório encontrado</h3>
              <p className="text-gray-600 mb-6">
                {filterStatus === 'todos' 
                  ? 'Você ainda não cadastrou nenhum consultório.'
                  : `Nenhum consultório com status "${getStatusText(filterStatus)}" encontrado.`
                }
              </p>
              {filterStatus === 'todos' && (
                <div className="flex justify-center">
                  <Link href="/anunciar">
                    <Button variant="primary" size="lg">
                      Cadastrar Primeiro Consultório
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            filteredClinics.map((clinic) => {
              const clinicData = {
                id: clinic.id as string,
                title: clinic.title as string,
                address: clinic.address as string,
                price: clinic.price as string,
                specialty: clinic.specialty as string,
                status: clinic.status as string,
                images: clinic.images as string[],
                views: clinic.views as number,
                bookings: clinic.bookings as number,
                rating: getClinicRating(clinic.id as string)
              };
              
              return (
                <ClinicCard
                  key={clinic.id as string}
                  clinic={clinicData}
                  onEdit={handleEditClinic}
                  onDelete={handleDeleteClinic}
                  onToggleStatus={handleToggleStatus}
                  showActions={true}
                />
              );
            })
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={cancelDeleteClinic}
        title="Confirmar Exclusão"
        subtitle="Esta ação não pode ser desfeita"
        size="sm"
        primaryButton={{
          text: 'Excluir',
          onClick: confirmDeleteClinic,
          loading: false,
          variant: 'danger'
        }}
        secondaryButton={{
          text: 'Cancelar',
          onClick: cancelDeleteClinic
        }}
      >
        <div className="text-center py-4">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Tem certeza que deseja excluir este consultório?
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            <strong>&quot;{deleteModal.clinicTitle}&quot;</strong> será permanentemente removido.
          </p>
          <p className="text-xs text-gray-400">
            Esta ação não pode ser desfeita e todos os dados relacionados serão perdidos.
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default ControlPanelPage;
