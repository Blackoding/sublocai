import React from 'react';
import { Appointment } from '@/types';
import Button from '@/components/Button';

interface AppointmentCardProps {
  appointment: Appointment;
  onUpdateStatus?: (appointmentId: string, newStatus: 'pending' | 'confirmed' | 'cancelled' | 'completed') => void;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  onUpdateStatus
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendente';
      case 'confirmed':
        return 'Confirmado';
      case 'cancelled':
        return 'Cancelado';
      case 'completed':
        return 'Concluído';
      default:
        return status;
    }
  };

  const formatDate = (date: string) => {
    try {
      // Se a data já está no formato YYYY-MM-DD, usar diretamente
      if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = date.split('-');
        return `${day}/${month}/${year}`;
      }
      
      // Caso contrário, tentar converter
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        return date; // Retornar a string original se não conseguir converter
      }
      
      return dateObj.toLocaleDateString('pt-BR');
    } catch (error) {
      console.error('Erro ao formatar data:', error, 'Data original:', date);
      return date; // Retornar a string original em caso de erro
    }
  };

  const formatTime = (time: string) => {
    if (!time) return 'N/A';
    return time.substring(0, 5);
  };

  const getDayOfWeek = (date: string) => {
    try {
      const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
      
      // Se a data está no formato YYYY-MM-DD, criar Date diretamente
      if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = date.split('-').map(Number);
        const dateObj = new Date(year, month - 1, day); // month é 0-indexed
        return days[dateObj.getDay()];
      }
      
      // Caso contrário, tentar converter normalmente
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        return 'Data inválida';
      }
      
      return days[dateObj.getDay()];
    } catch (error) {
      console.error('Erro ao obter dia da semana:', error, 'Data original:', date);
      return 'Data inválida';
    }
  };

  const getUserDisplayName = () => {
    if (!appointment.users) return 'Usuário não encontrado';
    
    if (appointment.users.userType === 'company') {
      return appointment.users.companyName || appointment.users.tradeName || 'Empresa sem nome';
    } else {
      return appointment.users.fullName || 'Profissional sem nome';
    }
  };

  const getUserTypeText = () => {
    if (!appointment.users) return '';
    return appointment.users.userType === 'company' ? 'Empresa' : 'Profissional';
  };

  const formatPhoneForWhatsApp = (phone: string) => {
    // Remove todos os caracteres não numéricos
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Se começar com 55 (Brasil), mantém
    if (cleanPhone.startsWith('55')) {
      return cleanPhone;
    }
    
    // Se começar com 0, remove o 0 e adiciona 55
    if (cleanPhone.startsWith('0')) {
      return '55' + cleanPhone.substring(1);
    }
    
    // Se não começar com 55, adiciona 55
    return '55' + cleanPhone;
  };

  const openWhatsApp = () => {
    if (!appointment.users?.phone) return;
    
    const formattedPhone = formatPhoneForWhatsApp(appointment.users.phone);
    const message = `Olá! Vi seu agendamento para ${formatDate(appointment.date)} às ${formatTime(appointment.time)}. Como posso ajudar?`;
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {getUserDisplayName()}
              </h3>
              <p className="text-sm text-gray-500">
                {getUserTypeText()} • Agendamento #{appointment.id.substring(0, 8)}
              </p>
            </div>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
              {getStatusText(appointment.status)}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <span className="font-medium">Data:</span> {formatDate(appointment.date)} ({getDayOfWeek(appointment.date)})
            </div>
            <div>
              <span className="font-medium">Horário:</span> {formatTime(appointment.time)}
            </div>
          </div>
          
          <div className="mt-2 text-sm text-gray-600">
            <span className="font-medium">Valor:</span> R$ {appointment.value.toFixed(2)}
          </div>
          
          {appointment.notes && (
            <div className="mt-2 text-sm text-gray-600">
              <span className="font-medium">Observações:</span> {appointment.notes}
            </div>
          )}
        </div>
        
        <div className="mt-4 lg:mt-0 lg:ml-6">
          <div className="flex flex-wrap gap-2">
            {/* Botão WhatsApp - sempre visível se houver telefone */}
            {appointment.users?.phone && (
              <Button
                size="sm"
                onClick={openWhatsApp}
                className="bg-green-600 hover:bg-green-700 text-white border-green-600 hover:border-green-700"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                </svg>
                WhatsApp
              </Button>
            )}
            
            {appointment.status === 'pending' && (
              <>
                <Button
                  size="sm"
                  onClick={() => onUpdateStatus?.(appointment.id, 'confirmed')}
                >
                  Confirmar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onUpdateStatus?.(appointment.id, 'cancelled')}
                  className="text-red-600 hover:text-red-700 hover:border-red-300"
                >
                  Cancelar
                </Button>
              </>
            )}
            
            {appointment.status === 'confirmed' && (
              <Button
                size="sm"
                onClick={() => onUpdateStatus?.(appointment.id, 'completed')}
              >
                Marcar como Concluído
              </Button>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentCard;
