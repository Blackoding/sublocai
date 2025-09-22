export type SublocationPlus = 'wifi' | 'airConditioning' | 'desk' | 'bathroom' | 'parking' | 'microwave' | 'refrigerator';

export interface User {
  id: string;
  email: string;
  userType: 'professional' | 'company';
  phone: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
  
  // Campos específicos para profissionais
  fullName?: string;
  cpf?: string;
  birthDate?: string;
  specialty?: string;
  registrationCode?: string;
  
  // Campos específicos para empresas
  companyName?: string;
  tradeName?: string;
  cnpj?: string;
  responsibleName?: string;
  responsibleCpf?: string;
}

export interface SignUpData {
  email: string;
  phone: string;
  password: string;
  userType: 'professional' | 'company';
  
  // Para profissionais
  fullName?: string;
  cpf?: string;
  birthDate?: string;
  specialty?: string;
  registrationCode?: string;
  
  // Para empresas
  companyName?: string;
  tradeName?: string;
  cnpj?: string;
  responsibleName?: string;
  responsibleCpf?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

// Função utilitária para obter o nome correto do usuário baseado no tipo
export const getUserDisplayName = (user: User): string => {
  if (user.userType === 'company') {
    return user.tradeName || user.companyName || 'Empresa';
  }
  return user.fullName || 'Usuário';
};

// Função utilitária para obter as iniciais do usuário baseado no tipo
export const getUserInitials = (user: User): string => {
  const displayName = getUserDisplayName(user);
  return displayName
    .split(' ')
    .map(n => n.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export interface AuthResponse {
  user: User | null;
  error: string | null;
}

export interface Comment {
  id: string;
  clinic_id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  content: string;
  rating?: number;
  created_at: string;
  updated_at: string;
}

export interface CommentFormData {
  content: string;
  rating?: number;
}

export interface ProfileUpdateData {
  phone: string;
  avatar?: string;
  
  // Campos específicos para profissionais
  fullName?: string;
  cpf?: string;
  birthDate?: string;
  specialty?: string;
  registrationCode?: string;
  
  // Campos específicos para empresas
  companyName?: string;
  tradeName?: string;
  cnpj?: string;
  responsibleName?: string;
  responsibleCpf?: string;
}

export interface Clinic {
  id?: string; // Opcional para compatibilidade com clinicService
  title: string;
  // Campos de endereço detalhado
  cep?: string;
  street?: string;
  number?: string;
  neighborhood?: string;
  complement?: string;
  city: string;
  state: string;
  zip_code?: string; // Campo legado - pode ser removido no futuro
  price: number;
  description?: string;
  specialty: string; // Campo legado - manter para compatibilidade
  specialties: string[]; // Novo campo para múltiplas especialidades
  images: string[];
  features: string[];
  google_maps_url?: string; // URL do Google Maps
  availability?: { id: string; day: string; startTime: string; endTime: string }[]; // Horários de disponibilidade
  status?: 'pending' | 'active' | 'inactive';
  views?: number;
  bookings?: number;
  rating?: number; // Média de rating dos comentários
  created_at?: string;
  updated_at?: string;
  user_id: string;
  // Campos adicionais para compatibilidade com a UI
  stamp?: 'new' | 'hot';
  plus?: SublocationPlus[];
}

export interface Appointment {
  id: string;
  clinic_id: string;
  user_id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM - horário selecionado pelo usuário
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  value: number; // Valor do agendamento
  created_at: string;
  updated_at: string;
  clinic_title?: string; // Para exibição
  users?: {
    id: string;
    email: string;
    userType: 'professional' | 'company';
    phone: string;
    fullName?: string;
    companyName?: string;
    tradeName?: string;
  };
}

export interface AppointmentFilters {
  date_from?: string;
  date_to?: string;
  period?: 'morning' | 'afternoon' | 'evening' | 'all';
  day_of_week?: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday' | 'all';
  status?: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'all';
  clinic_id?: string;
}
