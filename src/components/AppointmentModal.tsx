import React, { useState, useEffect } from 'react';
import Modal from '@/components/Modal';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Checkbox from '@/components/Checkbox';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (appointmentData: AppointmentFormData) => void;
  clinicTitle: string;
  clinicPrice: number;
  clinicAvailability?: { id: string; day: string; startTime: string; endTime: string }[];
  existingAppointments?: { date: string; time: string; status: string }[];
}

interface AppointmentFormData {
  date: string;
  selectedTimes: string[];
  notes?: string;
  acceptTerms: boolean;
}

const AppointmentModal: React.FC<AppointmentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  clinicTitle,
  clinicPrice,
  clinicAvailability = [],
  existingAppointments = []
}) => {
  const [formData, setFormData] = useState<AppointmentFormData>({
    date: '',
    selectedTimes: [],
    notes: '',
    acceptTerms: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<{ value: string; label: string; disabled: boolean }[]>([]);

  // Gerenciar scroll do body quando modal abre/fecha
  useEffect(() => {
    if (isOpen) {
      // Salvar a posição atual do scroll
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
    } else {
      // Restaurar o scroll
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    }

    // Cleanup function
    return () => {
      if (isOpen) {
        const scrollY = document.body.style.top;
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        if (scrollY) {
          window.scrollTo(0, parseInt(scrollY || '0') * -1);
        }
      }
    };
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
      // Reset form
      setFormData({
        date: '',
        selectedTimes: [],
        notes: '',
        acceptTerms: false
      });
      onClose();
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof AppointmentFormData, value: string | boolean) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      };
      
      // Se a data mudou, resetar os horários selecionados e calcular disponibilidade
      if (field === 'date') {
        newData.selectedTimes = [];
        calculateAvailableTimeSlots(value as string);
      }
      
      return newData;
    });
  };

  const handleTimeSelection = (time: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      selectedTimes: checked 
        ? [...prev.selectedTimes, time]
        : prev.selectedTimes.filter(t => t !== time)
    }));
  };

  // Função para obter o dia da semana de uma data
  const getDayOfWeek = (dateString: string): string => {
    const days = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
    // Garantir que a data seja interpretada no fuso horário local
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day); // month é 0-indexed
    return days[date.getDay()];
  };

  // Função para gerar slots de tempo entre dois horários
  const generateTimeSlots = (startTime: string, endTime: string): string[] => {
    const slots: string[] = [];
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    
    const current = new Date(start);
    while (current <= end) {
      const timeString = current.toTimeString().slice(0, 5);
      slots.push(timeString);
      current.setMinutes(current.getMinutes() + 30);
    }
    
    return slots;
  };

  // Função para normalizar formato de horário (remove segundos)
  const normalizeTime = (time: string): string => {
    return time.substring(0, 5); // Remove os segundos (ex: "10:30:00" -> "10:30")
  };

  // Função para verificar se um horário está ocupado (confirmado ou concluído)
  const isTimeSlotOccupied = (date: string, time: string): boolean => {
    return existingAppointments.some(apt => {
      const dateMatch = apt.date === date;
      const timeMatch = normalizeTime(apt.time) === time; // Normalizar horário do banco
      const statusMatch = apt.status === 'confirmed' || apt.status === 'completed';
      
      return dateMatch && timeMatch && statusMatch;
    });
  };

  // Função para calcular horários disponíveis baseado na data selecionada
  const calculateAvailableTimeSlots = (selectedDate: string) => {
    if (!selectedDate) {
      setAvailableTimeSlots([]);
      return;
    }

    const dayOfWeek = getDayOfWeek(selectedDate);
    const dayAvailability = clinicAvailability.find(av => av.day === dayOfWeek);
    
    if (!dayAvailability) {
      setAvailableTimeSlots([]);
      return;
    }

    const timeSlots = generateTimeSlots(dayAvailability.startTime, dayAvailability.endTime);
    const formattedSlots = timeSlots.map(time => ({
      value: time,
      label: time,
      disabled: isTimeSlotOccupied(selectedDate, time)
    }));
    
    setAvailableTimeSlots(formattedSlots);
  };


  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Agendar - ${clinicTitle}`}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Data do Agendamento"
          type="date"
          value={formData.date}
          onChange={(value) => handleInputChange('date', value)}
          required
        />

        {/* Seleção de horários */}
        {formData.date && availableTimeSlots.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Horários Disponíveis
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-4">
              {availableTimeSlots.map((slot) => (
                <div key={slot.value} className="relative">
                  <Checkbox
                    label={slot.label}
                    checked={formData.selectedTimes.includes(slot.value)}
                    onChange={(checked) => handleTimeSelection(slot.value, checked)}
                    value={slot.value}
                    disabled={slot.disabled}
                  />
                  {slot.disabled && (
                    <div className="absolute inset-0 bg-gray-100 bg-opacity-75 rounded flex items-center justify-center">
                      <span className="text-xs text-gray-500 font-medium">Ocupado</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <Input
          label="Observações (opcional)"
          value={formData.notes}
          onChange={(value) => handleInputChange('notes', value)}
          placeholder="Ex: Primeira consulta, urgente, etc."
        />

        {/* Informações sobre disponibilidade */}
        {formData.date && availableTimeSlots.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <svg className="w-5 h-5 text-yellow-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm text-yellow-800">
                  <strong>Não há horários disponíveis</strong> para este dia da semana.
                </p>
                <p className="text-xs text-yellow-700 mt-1">
                  Tente selecionar outro dia ou entre em contato para verificar disponibilidade.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Totalizador */}
        {formData.selectedTimes.length > 0 && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Quantidade de sessões</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formData.selectedTimes.length} {formData.selectedTimes.length === 1 ? 'sessão' : 'sessões'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Valor Total</p>
                <p className="text-2xl font-bold text-green-600">
                  R$ {(clinicPrice * formData.selectedTimes.length).toFixed(2).replace('.', ',')}
                </p>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                R$ {clinicPrice.toFixed(2).replace('.', ',')} por sessão × {formData.selectedTimes.length} sessões
              </p>
            </div>
          </div>
        )}

        {/* Checkbox de aceite dos termos */}
        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <input
            type="checkbox"
            id="acceptTerms"
            checked={formData.acceptTerms}
            onChange={(e) => handleInputChange('acceptTerms', e.target.checked)}
            className="mt-1 rounded border-gray-300 text-[#2b9af3] focus:ring-[#2b9af3] focus:ring-2 focus:ring-offset-0"
          />
          <label htmlFor="acceptTerms" className="text-sm text-gray-700 cursor-pointer">
            Ao confirmar agendamento, você concorda com os{' '}
            <a href="/termos-de-uso" target="_blank" className="text-[#2b9af3] hover:underline">
              termos de uso
            </a>{' '}
            e{' '}
            <a href="/politica-privacidade" target="_blank" className="text-[#2b9af3] hover:underline">
              política de privacidade
            </a>
          </label>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            disabled={isSubmitting || !formData.date || formData.selectedTimes.length === 0 || availableTimeSlots.length === 0 || !formData.acceptTerms}
            className="flex-1"
          >
            {isSubmitting ? 'Agendando...' : 'Confirmar Agendamento'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AppointmentModal;
